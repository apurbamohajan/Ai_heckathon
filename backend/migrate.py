import re

# Read your original 1402-line server.py
with open("server.py", "r", encoding="utf-8") as f:
    code = f.read()

# 1. Update Imports
code = code.replace("import anthropic", "import google.generativeai as genai\nimport uuid")
code = code.replace("from anthropic import AsyncAnthropic", "import json")

# 2. Add Gemini Config and Session DB (Inject after DEV_ORIGINS or logging setup)
gemini_setup = """
def _ensure_gemini_available() -> None:
    import os
    from fastapi import HTTPException
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not set server-side.")
    genai.configure(api_key=key)

SESSIONS_DB = {}
"""
if "SESSIONS_DB" not in code:
    code = code.replace("_agent_log.addHandler(_h)", "_agent_log.addHandler(_h)\n\n" + gemini_setup)

# 3. Replace Bootstrap Endpoint
bootstrap_pattern = re.compile(r"@app\.post\(\"/agent/bootstrap\".*?def bootstrap_agent\(\).*?:.*?(?=@app)", re.DOTALL)
new_bootstrap = """@app.post("/agent/bootstrap")
def bootstrap_agent():
    return {
        "agent_id": "gemini-mock-agent-id",
        "agent_version": 1,
        "environment_id": "gemini-mock-env-id",
        "created": True,
    }

"""
code = bootstrap_pattern.sub(new_bootstrap, code)

# 4. Replace Sessions Endpoint
sessions_pattern = re.compile(r"@app\.post\(\"/agent/sessions\".*?def create_session\(.*?\).*?:.*?(?=@app)", re.DOTALL)
new_sessions = """@app.post("/agent/sessions")
def create_session(req: dict):
    session_id = str(uuid.uuid4())
    SESSIONS_DB[session_id] = {
        "title": req.get("title", ""),
        "history": [],
    }
    return {"session_id": session_id}

"""
code = sessions_pattern.sub(new_sessions, code)

# 5. Replace Events Endpoints
events_pattern = re.compile(r"@app\.post\(\"/agent/sessions/\{session_id\}/events\"\).*?def send_events\(.*?\).*?:.*?(?=@app\.get\(\"/agent/sessions/\{session_id\}/events\"\))", re.DOTALL)
new_events = """@app.post("/agent/sessions/{session_id}/events")
async def send_events(session_id: str, request: Request):
    from fastapi import HTTPException
    if session_id not in SESSIONS_DB:
        raise HTTPException(status_code=404, detail="Session not found")
    
    body = await request.json()
    events = body.get("events", [])
    
    for ev in events:
        ev["id"] = ev.get("id", str(uuid.uuid4()))
        SESSIONS_DB[session_id]["history"].append(ev)
    return {"ok": True}

"""
code = events_pattern.sub(new_events, code)

get_events_pattern = re.compile(r"@app\.get\(\"/agent/sessions/\{session_id\}/events\"\).*?def get_events\(.*?\).*?:.*?(?=@app\.get\(\"/agent/sessions/\{session_id\}/stream\"\))", re.DOTALL)
new_get_events = """@app.get("/agent/sessions/{session_id}/events")
async def get_events(session_id: str, limit: int = 1000):
    from fastapi import HTTPException
    if session_id not in SESSIONS_DB:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"data": SESSIONS_DB[session_id]["history"]}

"""
code = get_events_pattern.sub(new_get_events, code)

# 6. Replace Stream Endpoint
stream_pattern = re.compile(r"@app\.get\(\"/agent/sessions/\{session_id\}/stream\"\).*?def stream_events\(.*?\).*?:.*?(?=@app|class|def)", re.DOTALL)
new_stream = """@app.get("/agent/sessions/{session_id}/stream")
async def stream_events(session_id: str, request: Request):
    from fastapi import HTTPException
    from fastapi.responses import StreamingResponse
    import json
    
    _ensure_gemini_available()
    if session_id not in SESSIONS_DB:
        raise HTTPException(status_code=404, detail="Session not found")

    async def generator():
        yield ": connected\\n\\n"
        try:
            render_evaluation_tool = {
                "function_declarations": [
                    {
                        "name": "render_case_evaluation",
                        "description": "Renders the final clinical evaluation for the trainee. Call this when the student has submitted a diagnosis.",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "global_rating": {"type": "string", "enum": ["excellent", "good", "satisfactory", "borderline", "clear-fail"]},
                                "feedback_summary": {"type": "string"},
                                "rubric_evaluations": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "criterion_id": {"type": "string"},
                                            "status": {"type": "string", "enum": ["met", "missed"]},
                                            "reasoning": {"type": "string"}
                                        }
                                    }
                                }
                            },
                            "required": ["global_rating", "feedback_summary", "rubric_evaluations"]
                        }
                    }
                ]
            }

            model = genai.GenerativeModel(
                model_name="gemini-1.5-pro",
                system_instruction=MEDKIT_ATTENDING_SYSTEM_PROMPT, 
                tools=render_evaluation_tool
            )
            
            history_text = "\\n".join([json.dumps(ev) for ev in SESSIONS_DB[session_id]["history"]])
            chat_history = [{"role": "user", "parts": [f"Evaluate this encounter log:\\n{history_text}"]}]
            
            yield f"event: session.status_running\\ndata: {json.dumps({'type': 'session.status_running', 'id': str(uuid.uuid4())})}\\n\\n"

            response = await model.generate_content_async(chat_history, stream=True)
            
            async for chunk in response:
                if await request.is_disconnected():
                    break
                    
                if chunk.text:
                    payload = {
                        "type": "agent.message", 
                        "id": str(uuid.uuid4()),
                        "content": [{"type": "text", "text": chunk.text}]
                    }
                    yield f"event: agent.message\\ndata: {json.dumps(payload)}\\n\\n"
                
                if chunk.parts:
                    for part in chunk.parts:
                        if part.function_call:
                            args_dict = type(part.function_call).to_dict(part.function_call).get("args", {})
                            tool_payload = {
                                "type": "agent.custom_tool_use",
                                "id": str(uuid.uuid4()),
                                "name": part.function_call.name,
                                "input": args_dict
                            }
                            yield f"event: agent.custom_tool_use\\ndata: {json.dumps(tool_payload)}\\n\\n"
            
            yield f"event: session.status_idle\\ndata: {json.dumps({'type': 'session.status_idle', 'id': str(uuid.uuid4()), 'stop_reason': {'type': 'end_turn'}})}\\n\\n"

        except Exception as e:
            err = json.dumps({"type": "error", "message": str(e), "id": str(uuid.uuid4())})
            yield f"event: error\\ndata: {err}\\n\\n"

    return StreamingResponse(generator(), media_type="text/event-stream", headers={"Cache-Control": "no-cache", "Connection": "keep-alive"})

"""
code = stream_pattern.sub(new_stream, code)

# 7. Replace Patient Stream Endpoint
patient_stream_pattern = re.compile(r"@app\.post\(\"/agent/patient/stream\"\).*?def patient_stream\(.*?\).*?:.*?(?=@app|class|def)", re.DOTALL)
new_patient_stream = """@app.post("/agent/patient/stream")
async def patient_stream(req: dict):
    from fastapi.responses import StreamingResponse
    import json
    
    _ensure_gemini_available()
    
    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash", 
        system_instruction=req.get("system", "")
    )
    
    gemini_history = []
    for msg in req.get("messages", []):
        role = "user" if msg["role"] == "user" else "model"
        gemini_history.append({"role": role, "parts": [msg["content"]]})
    
    async def generator():
        try:
            if gemini_history and gemini_history[-1]["role"] == "user":
                last_msg = gemini_history.pop()
                chat = model.start_chat(history=gemini_history)
                response = await chat.send_message_async(last_msg["parts"][0], stream=True)
            else:
                response = await model.generate_content_async("Hello", stream=True)
                
            async for chunk in response:
                if chunk.text:
                    payload = {"choices": [{"delta": {"content": chunk.text}}]}
                    yield f"data: {json.dumps(payload)}\\n\\n"
                    
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\\n\\n"

    return StreamingResponse(generator(), media_type="text/event-stream")

"""
code = patient_stream_pattern.sub(new_patient_stream, code)

# Save the new file
with open("server_gemini.py", "w", encoding="utf-8") as f:
    f.write(code)

print("Successfully generated server_gemini.py! Rename it to server.py to use it.")