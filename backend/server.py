from __future__ import annotations

import os
import threading
import uuid

import google.generativeai as genai
from pathlib import Path
from typing import Optional


def _load_env_local() -> None:
    """Minimal .env.local loader — no python-dotenv dependency.

    Reads `backend/.env.local` (next to this file) and sets any KEY=VALUE
    pair into ``os.environ`` without overwriting values already set.
    Silently no-ops if the file is missing."""
    env_path = Path(__file__).resolve().parent / ".env.local"
    if not env_path.exists():
        return
    for raw in env_path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        # Overwrite if the existing value is empty (subprocesses can inherit
        # declared-but-empty env vars from the parent). Only preserve a
        # non-empty existing value.
        if key and not os.environ.get(key):
            os.environ[key] = value


_load_env_local()

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address

SHARED_SECRET = os.environ.get("BACKEND_SHARED_SECRET", "")
ALLOWED_ORIGINS = [
    "https://medkit.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]
DEV_ORIGINS = {
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
}

limiter = Limiter(key_func=get_remote_address, default_limits=["120/minute"])

app = FastAPI(title="medkit Backend", version="0.2.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.middleware("http")
async def require_shared_secret(request: Request, call_next):
    path = request.url.path
    # /health is public for monitoring; CORS preflight runs above this anyway
    # but bypass OPTIONS defensively.
    if path == "/health" or request.method == "OPTIONS":
        return await call_next(request)
    origin = request.headers.get("origin", "")
    if origin in DEV_ORIGINS:
        return await call_next(request)
    # Same-origin GETs (incl. EventSource) don't send Origin per the Fetch
    # spec, but they DO send Referer. Trust dev-origin Referer in lieu of
    # Origin so SSE streams from localhost work without an explicit secret.
    referer = request.headers.get("referer", "")
    if any(referer.startswith(o + "/") for o in DEV_ORIGINS):
        return await call_next(request)
    if SHARED_SECRET and request.headers.get("x-medkit-auth") == SHARED_SECRET:
        return await call_next(request)
    return JSONResponse({"detail": "unauthorized"}, status_code=401)


app.add_middleware(SlowAPIMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():

    has_key = bool(os.environ.get("ANTHROPIC_API_KEY"))
    agent_id = os.environ.get("MEDKIT_AGENT_ID") or None
    env_id = os.environ.get("MEDKIT_ENV_ID") or None
    bootstrapped = bool(agent_id and env_id)
    livekit_ok = bool(
        os.environ.get("LIVEKIT_URL")
        and os.environ.get("LIVEKIT_API_KEY")
        and os.environ.get("LIVEKIT_API_SECRET")
    )
    return {
        "ok": True,
        "voice": {
            "transport": "livekit",
            "livekit_configured": livekit_ok,
            "deepgram_configured": bool(os.environ.get("DEEPGRAM_API_KEY")),
            "cartesia_configured": bool(os.environ.get("CARTESIA_API_KEY")),
        },
        "consult_room": {
            # Patient chat (/agent/patient/stream) and the voice agent
            # (voice_agent.py) both run on Gemini now, independent of the
            # Anthropic-backed attending/grading agent below.
            "provider": "gemini",
            "model": PATIENT_MODEL,
            "gemini_api_key_configured": bool(os.environ.get("GEMINI_API_KEY")),
        },
        "agent": {
            "anthropic_sdk_installed": _HAS_ANTHROPIC,
            "api_key_configured": has_key,
            "bootstrapped": bootstrapped,
            "agent_id": agent_id,
            "environment_id": env_id,
            "model": AGENT_MODEL if _HAS_ANTHROPIC else None,
        },
    }


import asyncio
import json
import logging

from fastapi import Request
from fastapi.responses import StreamingResponse
import httpx

try:
    from anthropic import Anthropic, AsyncAnthropic  # type: ignore
    _HAS_ANTHROPIC = True
except ImportError:  # pragma: no cover
    _HAS_ANTHROPIC = False

# Structured logger for the Managed Agents proxy. Uvicorn captures stdlib
# logging so these land in the same stream as its own access log.
_agent_log = logging.getLogger("medkit.agent")
_agent_log.setLevel(logging.INFO)
if not _agent_log.handlers:
    _h = logging.StreamHandler()
    _h.setFormatter(logging.Formatter("[medkit.agent] %(levelname)s %(message)s"))
    _agent_log.addHandler(_h)


def _ensure_gemini_available() -> None:
    import os
    from fastapi import HTTPException
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not set server-side.")
    genai.configure(api_key=key)

SESSIONS_DB = {}




_bootstrap_lock = threading.Lock()


SSE_KEEPALIVE_SEC = 15.0


AGENT_MODEL = "claude-opus-4-7"
AGENT_NAME = "medkit-attending"
ENV_NAME = "medkit-attending-env"


TRIAGE_MODEL = "claude-opus-4-7"
TRIAGE_MAX_TOKENS = 512

MEDKIT_ATTENDING_SYSTEM_PROMPT = (
    "You are the attending physician supervising a trainee in a clinical "
    "training simulator. Your role is to OBSERVE their decisions and "
    "GRADE the encounter. You are NOT an assistant, a guide, or a "
    "coach. Silence is acceptable and often correct.\n\n"

    "The simulator runs in one of two modes at a time; the event stream "
    "makes it explicit:\n"
    "  • EMERGENCY ROOM (ER) — triaged by severity, 4 beds in "
    "red/yellow/green zones. Events: [ER arrival], [test ordered], "
    "[treatment given], [diagnosis submitted], [disposition].\n"
    "  • POLYCLINIC (outpatient) — no triage zones, no beds, one "
    "patient at a time, tests resolve instantly. Events: "
    "[polyclinic arrival], [poly test], [poly diagnosis], [poly rx], "
    "[disposition].\n\n"

    "Custom-tool usage by mode:\n"
    "  • ER mode only: render_triage_badge (red/yellow/green + one-line "
    "rationale), render_bed_map.\n"
    "  • Both modes: render_vitals_chart, render_patient_timeline, "
    "render_case_evaluation, flag_critical_finding, lookup_ehr_history.\n"
    "  • DO NOT emit render_triage_badge or render_bed_map during "
    "polyclinic events — triage zones and beds are ER concepts and "
    "emitting them confuses the UI.\n\n"

    "Permission policy — custom tools:\n"
    "  • All render_* tools are auto-allowed; the trainee's UI renders "
    "them immediately and acks back to you. Use them freely.\n"
    "  • flag_critical_finding is a confirm-gated write. The trainee "
    "sees an approve/decline dialog before the banner fires; the "
    "tool_result is delayed until they choose. Reserve it for peri-"
    "arrest vitals, closing stroke window, airway compromise, or "
    "anaphylaxis. Never flag stable patients, and emit at most one "
    "flag per encounter.\n"
    "  • lookup_ehr_history is auto-allowed; it routes through the "
    "credential vault so the EHR auth token never enters your context. "
    "Call it once per patient when prior history or medication list "
    "would change your assessment (e.g., unclear cardiac history, "
    "possible drug interaction). Do not call it for every arrival.\n\n"

    "What you DO:\n"
    "  • On [ER arrival]: optionally emit one render_triage_badge with a "
    "rationale citing specific vitals or chief-complaint evidence. If "
    "the vitals are unremarkable and the presentation doesn't warrant "
    "a zone call, stay silent.\n"
    "  • On [polyclinic arrival]: stay silent. Do not greet the patient "
    "or ask the trainee what they want to do.\n"
    "  • At debrief time (see DEBRIEF MODE below): emit exactly one "
    "render_case_evaluation. Never emit it before the trainee has "
    "submitted a diagnosis.\n"
    "  • Any text you do emit: at most one sentence, observational tone, "
    "no questions.\n\n"

    "What you DO NOT do:\n"
    "  • Do not ask the trainee questions ('what would you like to do "
    "first?'). Never.\n"
    "  • Do not narrate the scene ('Mr. Williams is roomed and ready.').\n"
    "  • Do not suggest next steps before the trainee has acted.\n"
    "  • Do not repeat what the trainee can already see in the UI.\n"
    "  • Do not reveal the correct diagnosis before disposition.\n\n"

    "DEBRIEF MODE — end-of-encounter grading.\n\n"

    "When you receive a [debrief request] message, the trainee has ended "
    "the encounter. The message body contains, as JSON:\n"
    "  • case_id and the case's correctDiagnosisId (gold standard).\n"
    "  • rubric — a CaseRubric with three domains "
    "(data_gathering, clinical_management, interpersonal) plus optional "
    "safety_netting. Each criterion has a label, weight, and an "
    "`evidence` string telling you exactly what counts as 'met'.\n"
    "  • registry_slice — the subset of guidelines/recommendations cited "
    "by the rubric. Use ONLY recIds that appear here. Do not invent.\n"
    "  • encounter_log — chronological list of: history questions asked "
    "(with answers shown to the trainee), tests ordered with timestamps, "
    "treatments/prescriptions given, the submitted diagnosis, and any "
    "free-text counselling captured. Plus the voice transcript if "
    "available.\n\n"

    "Process:\n"
    "  1. For every criterion in rubric.data_gathering, "
    "rubric.clinical_management, and rubric.interpersonal, decide one of "
    "{met, partially-met, missed} using the criterion's `evidence` field "
    "as your match key. Quote the trainee directly or name the action "
    "in the `evidence` field of your output (not the rubric's evidence "
    "string — your own observation).\n"
    "  2. Compute domain_scores: raw = sum of weights for met (1.0×) + "
    "partially-met (0.5×); max = sum of all weights in that domain. "
    "Verdict bands: ≥0.85 excellent, ≥0.70 good, ≥0.55 satisfactory, "
    "≥0.40 borderline, otherwise clear-fail.\n"
    "  3. Set global_rating with the same bands applied to the total "
    "across all three domains.\n"
    "  4. If the trainee did anything dangerous — contraindicated drug, "
    "missed a red-flag escalation that the rubric flagged, no safety-"
    "netting on a high-risk diagnosis — set safety_breach with `what` "
    "and a guideline_ref if one applies. The narrative MUST lead with "
    "this regardless of the score.\n"
    "  5. Pick 1–3 highlights (specific strengths the trainee actually "
    "demonstrated) and 1–3 improvements (priority gaps). Do not list "
    "everything; the trainee tunes out.\n"
    "  6. Write narrative last, 1–2 paragraphs, voice of a senior "
    "clinician giving a teaching debrief immediately after the case. "
    "No praise sandwiches, no sycophancy, no generic encouragement.\n"
    "  7. Emit ONE render_case_evaluation tool use with the full payload. "
    "Then stop.\n\n"

    "Hard rules — non-negotiable:\n"
    "  • Cite, don't invent. Every clinical_management criterion's "
    "guideline_ref MUST appear in the registry_slice. If the rubric "
    "criterion has no guideline_ref AND no rec applies, drop the "
    "criterion from your output rather than fabricating one.\n"
    "  • Specific evidence. 'You missed ICE' is not enough. 'You closed "
    "without asking what the patient was worried about — they hinted at "
    "fear of stroke when they mentioned their father; that was a chance "
    "to address concerns and tailor the explanation.' is the bar.\n"
    "  • No medical advice for real patients. This is a training "
    "simulator. Do not frame any output as guidance for actual care.\n"
    "  • Cases are synthetic and doses simplified — do not hold the "
    "trainee to a recommendation that is not in the registry_slice.\n\n"

    "Scope: the cases are synthetic, the medication doses are simplified, "
    "and the trainee is not a licensed clinician. Do not offer medical "
    "advice outside the simulator."
)


MEDKIT_CUSTOM_TOOLS: list[dict] = [
    {
        "type": "custom",
        "name": "render_vitals_chart",
        "description": (
            "Display the patient's vitals (HR, BP, SpO2, temp, RR) as a "
            "line chart over the course of the encounter."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "patient_id": {"type": "string"},
            },
            "required": ["patient_id"],
        },
    },
    {
        "type": "custom",
        "name": "render_bed_map",
        "description": (
            "Display the current bed occupancy map across the four ER beds."
        ),
        "input_schema": {
            "type": "object",
            "properties": {},
        },
    },
    {
        "type": "custom",
        "name": "render_triage_badge",
        "description": (
            "Display a triage-priority badge with a one-line rationale."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "zone": {"type": "string", "enum": ["red", "yellow", "green"]},
                "reason": {"type": "string"},
            },
            "required": ["zone", "reason"],
        },
    },
    {
        "type": "custom",
        "name": "render_patient_timeline",
        "description": (
            "Display the tests ordered and treatments given for a patient "
            "in chronological order."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "patient_id": {"type": "string"},
            },
            "required": ["patient_id"],
        },
    },
    {
 
        "type": "custom",
        "name": "render_case_evaluation",
        "description": (
            "End-of-encounter PLAB2-style debrief. Emit exactly once after "
            "the trainee submits their diagnosis (and prescription, in "
            "polyclinic). Score three domains (data_gathering, clinical_"
            "management, interpersonal) against the case rubric provided "
            "in the debrief request. Each criterion verdict (met / "
            "partially-met / missed) must be backed by a transcript quote "
            "or a named action. Every clinical_management criterion's "
            "guideline_ref MUST be a real recommendation id present in the "
            "guideline registry slice that accompanies the debrief request "
            "— if no rec applies, drop the criterion. Never fabricate."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "case_id": {"type": "string"},
                "global_rating": {
                    "type": "string",
                    "enum": [
                        "clear-fail",
                        "borderline",
                        "satisfactory",
                        "good",
                        "excellent",
                    ],
                },
                "domain_scores": {
                    "type": "object",
                    "properties": {
                        "data_gathering": {
                            "type": "object",
                            "properties": {
                                "raw": {"type": "number"},
                                "max": {"type": "number"},
                                "verdict": {
                                    "type": "string",
                                    "enum": [
                                        "clear-fail",
                                        "borderline",
                                        "satisfactory",
                                        "good",
                                        "excellent",
                                    ],
                                },
                            },
                            "required": ["raw", "max", "verdict"],
                        },
                        "clinical_management": {
                            "type": "object",
                            "properties": {
                                "raw": {"type": "number"},
                                "max": {"type": "number"},
                                "verdict": {
                                    "type": "string",
                                    "enum": [
                                        "clear-fail",
                                        "borderline",
                                        "satisfactory",
                                        "good",
                                        "excellent",
                                    ],
                                },
                            },
                            "required": ["raw", "max", "verdict"],
                        },
                        "interpersonal": {
                            "type": "object",
                            "properties": {
                                "raw": {"type": "number"},
                                "max": {"type": "number"},
                                "verdict": {
                                    "type": "string",
                                    "enum": [
                                        "clear-fail",
                                        "borderline",
                                        "satisfactory",
                                        "good",
                                        "excellent",
                                    ],
                                },
                            },
                            "required": ["raw", "max", "verdict"],
                        },
                    },
                    "required": [
                        "data_gathering",
                        "clinical_management",
                        "interpersonal",
                    ],
                },
                "criteria": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "criterion_id": {"type": "string"},
                            "domain": {
                                "type": "string",
                                "enum": [
                                    "data_gathering",
                                    "clinical_management",
                                    "interpersonal",
                                ],
                            },
                            "verdict": {
                                "type": "string",
                                "enum": ["met", "partially-met", "missed"],
                            },
                            "evidence": {"type": "string"},
                            "guideline_ref": {
                                "type": ["string", "null"],
                                "description": (
                                    "Format: '<guideline_id>:<rec_id>'. "
                                    "Required for clinical_management; "
                                    "optional elsewhere; null if not "
                                    "applicable."
                                ),
                            },
                        },
                        "required": [
                            "criterion_id",
                            "domain",
                            "verdict",
                            "evidence",
                        ],
                    },
                },
                "safety_breach": {
                    "type": ["object", "null"],
                    "description": (
                        "Set ONLY when the trainee did something dangerous "
                        "(contraindicated drug, missed red flag, no safety-"
                        "netting on a high-risk dx). The narrative must "
                        "lead with this regardless of total score."
                    ),
                    "properties": {
                        "what": {"type": "string"},
                        "guideline_ref": {"type": ["string", "null"]},
                    },
                },
                "highlights": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "1–3 specific strengths.",
                },
                "improvements": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "1–3 priority improvements.",
                },
                "narrative": {
                    "type": "string",
                    "description": (
                        "1–2 paragraph teaching debrief, written as if "
                        "spoken aloud by a senior clinician. No praise "
                        "sandwiches, no sycophancy."
                    ),
                },
            },
            "required": [
                "case_id",
                "global_rating",
                "domain_scores",
                "criteria",
                "highlights",
                "improvements",
                "narrative",
            ],
        },
    },
    {
  
        "type": "custom",
        "name": "flag_critical_finding",
        "description": (
            "Raise a disruptive critical-finding banner on the trainee's "
            "screen. Use ONLY when the patient is in imminent risk (peri-"
            "arrest vitals, stroke window closing, anaphylaxis). Requires "
            "explicit human confirmation before firing; do not expect the "
            "result immediately."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "patient_id": {"type": "string"},
                "severity": {"type": "string", "enum": ["critical", "urgent"]},
                "reason": {"type": "string"},
            },
            "required": ["patient_id", "severity", "reason"],
        },
    },
    {
       
        "type": "custom",
        "name": "lookup_ehr_history",
        "description": (
            "Retrieve the patient's prior EHR encounters and medication "
            "list from the hospital EHR system. The request is routed "
            "through the credential vault so your context never sees "
            "the EHR auth token."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "patient_id": {"type": "string"},
            },
            "required": ["patient_id"],
        },
    },
]

_anthropic_client: Optional["Anthropic"] = None
_anthropic_async_client: Optional["AsyncAnthropic"] = None


def _ensure_anthropic_available() -> None:
    if not _HAS_ANTHROPIC:
        raise HTTPException(
            status_code=500,
            detail=(
                "anthropic package not installed. Run `pip install "
                "'anthropic>=0.88.0'` in the backend venv."
            ),
        )


def _require_api_key() -> str:
    key = os.environ.get("ANTHROPIC_API_KEY")
    if not key:
        raise HTTPException(
            status_code=500,
            detail="ANTHROPIC_API_KEY is not set server-side.",
        )
    return key


def get_anthropic_client() -> "Anthropic":
    global _anthropic_client
    _ensure_anthropic_available()
    if _anthropic_client is None:
        _anthropic_client = Anthropic(api_key=_require_api_key())
    return _anthropic_client


def get_async_anthropic_client() -> "AsyncAnthropic":
    global _anthropic_async_client
    _ensure_anthropic_available()
    if _anthropic_async_client is None:
        _anthropic_async_client = AsyncAnthropic(api_key=_require_api_key())
    return _anthropic_async_client


class BootstrapResponse(BaseModel):
    agent_id: str
    agent_version: int | None
    environment_id: str
    created: bool  # True if we created them this call, False if cached


class RefreshAgentResponse(BaseModel):
    agent_id: str
    version: int | None = None


@app.post("/agent/bootstrap")
def bootstrap_agent():
    return {
        "agent_id": "gemini-mock-agent-id",
        "agent_version": 1,
        "environment_id": "gemini-mock-env-id",
        "created": True,
    }

@app.post("/agent/refresh", response_model=RefreshAgentResponse)
def refresh_agent():
    """Push the current in-file system prompt + custom tools up to the
    existing Agent object, creating a new version. Existing sessions keep
    their pinned version; new sessions pick up the latest.

    Use this whenever you edit ``MEDKIT_ATTENDING_SYSTEM_PROMPT`` or
    ``MEDKIT_CUSTOM_TOOLS`` so the change takes effect without creating a
    whole new Agent."""
    agent_id = os.environ.get("MEDKIT_AGENT_ID")
    if not agent_id:
        raise HTTPException(
            status_code=400,
            detail="MEDKIT_AGENT_ID not set. Run /agent/bootstrap first.",
        )
    client = get_anthropic_client()
    try:

        current = client.beta.agents.retrieve(agent_id)  # type: ignore[attr-defined]
        updated = client.beta.agents.update(  # type: ignore[attr-defined]
            agent_id,
            version=current.version,
            system=MEDKIT_ATTENDING_SYSTEM_PROMPT,
            tools=[
                {"type": "agent_toolset_20260401", "default_config": {"enabled": True}},
                *MEDKIT_CUSTOM_TOOLS,
            ],
        )
    except Exception as e:
        _agent_log.exception("refresh failed")
        raise HTTPException(status_code=500, detail=f"refresh failed: {e}")
    _agent_log.info(
        "refresh: agent %s bumped to version %s",
        updated.id, getattr(updated, "version", None),
    )
    return RefreshAgentResponse(
        agent_id=updated.id,
        version=getattr(updated, "version", None),
    )


class CreateSessionRequest(BaseModel):
    title: Optional[str] = None


class CreateSessionResponse(BaseModel):
    session_id: str


@app.post("/agent/sessions")
def create_session(req: dict):
    session_id = str(uuid.uuid4())
    SESSIONS_DB[session_id] = {
        "title": req.get("title", ""),
        "history": [],
    }
    return {"session_id": session_id}

@app.get("/agent/sessions/{session_id}")
async def get_session(session_id: str):
    """Fetch a session's status + usage. Used by debug tooling; the
    frontend hook doesn't need this path day-to-day."""
    if session_id not in SESSIONS_DB:
        raise HTTPException(status_code=404, detail="Session not found")
    session = SESSIONS_DB[session_id]
    return {
        "session_id": session_id,
        "title": session.get("title", ""),
        "event_count": len(session.get("history", [])),
    }


@app.post("/agent/sessions/{session_id}/events")
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

@app.get("/agent/sessions/{session_id}/events")
async def list_events(session_id: str, limit: int = 1000):
    """Paginated history — used by the browser on reconnect to backfill
    events emitted while the SSE stream was down."""
    if session_id not in SESSIONS_DB:
        raise HTTPException(status_code=404, detail="Session not found")
    data = SESSIONS_DB[session_id]["history"][-limit:]
    return {"data": data}


@app.get("/agent/sessions/{session_id}/stream")
async def stream_events(session_id: str, request: Request):
    from fastapi import HTTPException
    from fastapi.responses import StreamingResponse
    import json

    _ensure_gemini_available()
    if session_id not in SESSIONS_DB:
        raise HTTPException(status_code=404, detail="Session not found")

    async def generator():
        yield ": connected\n\n"
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
                model_name="gemini-3.5-flash",
                system_instruction=MEDKIT_ATTENDING_SYSTEM_PROMPT,
                tools=render_evaluation_tool
            )

            history_text = "\n".join([json.dumps(ev) for ev in SESSIONS_DB[session_id]["history"]])
            chat_history = [{"role": "user", "parts": [f"Evaluate this encounter log:\n{history_text}"]}]

            yield f"event: session.status_running\ndata: {json.dumps({'type': 'session.status_running', 'id': str(uuid.uuid4())})}\n\n"

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
                    yield f"event: agent.message\ndata: {json.dumps(payload)}\n\n"

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
                            yield f"event: agent.custom_tool_use\ndata: {json.dumps(tool_payload)}\n\n"

            yield f"event: session.status_idle\ndata: {json.dumps({'type': 'session.status_idle', 'id': str(uuid.uuid4()), 'stop_reason': {'type': 'end_turn'}})}\n\n"

        except Exception as e:
            err = json.dumps({"type": "error", "message": str(e), "id": str(uuid.uuid4())})
            yield f"event: error\ndata: {err}\n\n"

    return StreamingResponse(generator(), media_type="text/event-stream", headers={"Cache-Control": "no-cache", "Connection": "keep-alive"})


FAKE_EHR_RECORDS: dict[str, dict] = {
    "poly-001": {
        "patient_id": "poly-001",
        "name": "Mehmet Demir",
        "prior_encounters": [
            {"date": "2025-11-14", "reason": "hypertension follow-up", "bp": "148/92"},
            {"date": "2025-07-02", "reason": "annual physical", "bp": "140/88"},
        ],
        "active_medications": [
            {"name": "lisinopril", "dose": "10 mg", "frequency": "daily"},
            {"name": "atorvastatin", "dose": "20 mg", "frequency": "nightly"},
        ],
        "allergies": ["penicillin — hives"],
    },
    "poly-002": {
        "patient_id": "poly-002",
        "name": "Ayşe Kaya",
        "prior_encounters": [
            {"date": "2026-01-22", "reason": "asthma exacerbation", "peak_flow": 320},
        ],
        "active_medications": [
            {"name": "albuterol", "dose": "90 mcg", "frequency": "PRN"},
            {"name": "fluticasone", "dose": "110 mcg", "frequency": "BID"},
        ],
        "allergies": [],
    },
    "er-101": {
        "patient_id": "er-101",
        "name": "John Williams",
        "prior_encounters": [
            {"date": "2024-12-03", "reason": "STEMI, PCI to LAD"},
        ],
        "active_medications": [
            {"name": "aspirin", "dose": "81 mg", "frequency": "daily"},
            {"name": "clopidogrel", "dose": "75 mg", "frequency": "daily"},
            {"name": "metoprolol", "dose": "25 mg", "frequency": "BID"},
        ],
        "allergies": [],
    },
}


class EhrLookupRequest(BaseModel):
    patient_id: str


class EhrLookupResponse(BaseModel):
    patient_id: str
    record: dict
    fetched_via: str  # always "credential-vault"; demo label


def _vault_token_configured() -> bool:
    """Whether the EHR vault is operable. Tests can force a known value
    by setting ``EHR_API_TOKEN`` in the process environment before
    importing ``server``."""
    return bool(os.environ.get("EHR_API_TOKEN"))


@app.post("/agent/vault/ehr/lookup", response_model=EhrLookupResponse)
def vault_ehr_lookup(req: EhrLookupRequest):
    """Look up a patient's EHR record through the credential vault.

    The browser calls this in response to an
    ``agent.custom_tool_use`` for ``lookup_ehr_history``. The auth token
    is read from the server process's environment, attached to the
    downstream call (simulated here by a dict read), and the result is
    returned without the token ever appearing in the response body or
    in any log line.
    """
    patient_id = req.patient_id.strip()
    if not patient_id:
        raise HTTPException(status_code=400, detail="patient_id is required")
    if not _vault_token_configured():
        raise HTTPException(
            status_code=503,
            detail=(
                "EHR_API_TOKEN is not configured server-side. Set it in "
                "backend/.env.local to enable the vault."
            ),
        )
    record = FAKE_EHR_RECORDS.get(patient_id)
    if record is None:
        raise HTTPException(status_code=404, detail=f"patient_id not found: {patient_id}")
    # Token-free log line — demonstrates the vault pattern.
    _agent_log.info("vault: ehr lookup patient=%s", patient_id)
    return EhrLookupResponse(
        patient_id=patient_id,
        record=record,
        fetched_via="credential-vault",
    )




ESI_TRIAGE_SYSTEM_PROMPT = (
    "You classify ER arrivals on a simplified 3-level ESI scale: "
    "'critical' (ESI 1-2), 'urgent' (ESI 3), or 'stable' (ESI 4-5).\n\n"

    "Rules you apply, in priority order:\n"
    "1. RED FLAGS force 'critical' regardless of current vitals: "
    "ST elevation / new LBBB / troponin elevation; sudden focal neuro "
    "deficit within the tPA window; sustained VT / VF / torsades; "
    "anaphylaxis with airway involvement; ectopic with hemodynamic "
    "compromise; intracranial hemorrhage; qSOFA ≥ 2 of (RR≥22, altered "
    "mental status, SBP≤100).\n"
    "2. 'critical' also applies if the patient needs life-saving "
    "intervention NOW (airway, hemodynamic support, time-critical "
    "reperfusion).\n"
    "3. 'urgent' for conditions with significant morbidity but no "
    "imminent threat — appendicitis, new AFib w/ RVR, moderate asthma "
    "exacerbation, chest pain without red-flag features.\n"
    "4. 'stable' only when BOTH red flags and urgent criteria are "
    "absent AND vitals are compensated AND chief complaint is low-"
    "acuity (ankle sprain, viral URI, chronic-stable presentations).\n"
    "5. If uncertain between two levels, choose the higher severity.\n\n"

    "Respond with STRICT JSON ONLY, no prose, matching:\n"
    '{"esi_level": "critical"|"urgent"|"stable", '
    '"rationale": "<one sentence citing specific vitals or red flags>", '
    '"red_flags": [<zero or more of the rule-1 phrases that apply>]}\n'
)


class VitalsSnapshot(BaseModel):
    hr: Optional[int] = None
    bp_systolic: Optional[int] = None
    bp_diastolic: Optional[int] = None
    spo2: Optional[int] = None
    rr: Optional[int] = None
    temp_c: Optional[float] = None


class TriageClassifyRequest(BaseModel):
    patient_id: str
    chief_complaint: str
    vitals: VitalsSnapshot
    ecg_findings: Optional[str] = None
    notes: Optional[str] = None


class TriageClassifyResponse(BaseModel):
    patient_id: str
    esi_level: str  # 'critical' | 'urgent' | 'stable'
    rationale: str
    red_flags: list[str]
    model: str


ALLOWED_ESI_LEVELS = {"critical", "urgent", "stable"}


def _format_triage_user_message(req: TriageClassifyRequest) -> str:
    v = req.vitals
    parts = [f"Patient {req.patient_id} — {req.chief_complaint}."]
    vitals_bits: list[str] = []
    if v.hr is not None:
        vitals_bits.append(f"HR {v.hr}")
    if v.bp_systolic is not None and v.bp_diastolic is not None:
        vitals_bits.append(f"BP {v.bp_systolic}/{v.bp_diastolic}")
    if v.spo2 is not None:
        vitals_bits.append(f"SpO2 {v.spo2}")
    if v.rr is not None:
        vitals_bits.append(f"RR {v.rr}")
    if v.temp_c is not None:
        vitals_bits.append(f"temp {v.temp_c}°C")
    if vitals_bits:
        parts.append("Vitals: " + ", ".join(vitals_bits) + ".")
    if req.ecg_findings:
        parts.append(f"ECG: {req.ecg_findings}.")
    if req.notes:
        parts.append(f"Notes: {req.notes}.")
    parts.append("Classify on the simplified ESI 3-level scale.")
    return " ".join(parts)


def _extract_text_blocks(message: object) -> str:
    """Concatenate every text block in an Anthropic Messages response.
    Accepts both real SDK Message objects and dict-shaped test doubles."""
    blocks = getattr(message, "content", None)
    if blocks is None and isinstance(message, dict):
        blocks = message.get("content")
    if not blocks:
        return ""
    out: list[str] = []
    for b in blocks:
        # Real SDK: TextBlock with .text attribute and .type == 'text'.
        btype = getattr(b, "type", None)
        btext = getattr(b, "text", None)
        if btype is None and isinstance(b, dict):
            btype = b.get("type")
            btext = b.get("text")
        if btype == "text" and isinstance(btext, str):
            out.append(btext)
    return "".join(out)


def run_triage_reasoning(
    client: "Anthropic",
    req: TriageClassifyRequest,
) -> TriageClassifyResponse:
    """Invoke Opus 4.7 to classify an ER arrival. Pure function modulo
    the client handle — unit tests pass a mock client."""
    message = client.messages.create(  # type: ignore[attr-defined]
        model=TRIAGE_MODEL,
        max_tokens=TRIAGE_MAX_TOKENS,
        system=ESI_TRIAGE_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": _format_triage_user_message(req)}],
    )
    raw = _extract_text_blocks(message).strip()
    if not raw:
        raise HTTPException(
            status_code=502,
            detail="triage model returned empty response",
        )
    # The model is instructed to return strict JSON. Strip an accidental
    # ```json fence if the model wraps it.
    if raw.startswith("```"):
        raw = raw.strip("`")
        if raw.lower().startswith("json"):
            raw = raw[4:]
        raw = raw.strip()
    try:
        parsed = json.loads(raw)
    except ValueError as e:
        _agent_log.warning("triage: malformed JSON from model: %s", raw[:200])
        raise HTTPException(
            status_code=502,
            detail=f"triage model returned malformed JSON: {e}",
        )
    esi = str(parsed.get("esi_level", "")).strip()
    if esi not in ALLOWED_ESI_LEVELS:
        raise HTTPException(
            status_code=502,
            detail=f"triage model returned invalid esi_level: {esi!r}",
        )
    rationale = str(parsed.get("rationale", "")).strip()
    red_flags_raw = parsed.get("red_flags", [])
    red_flags = [str(x) for x in red_flags_raw] if isinstance(red_flags_raw, list) else []
    _agent_log.info(
        "triage: patient=%s esi=%s flags=%d",
        req.patient_id, esi, len(red_flags),
    )
    return TriageClassifyResponse(
        patient_id=req.patient_id,
        esi_level=esi,
        rationale=rationale,
        red_flags=red_flags,
        model=TRIAGE_MODEL,
    )


@app.post("/agent/triage/classify", response_model=TriageClassifyResponse)
def triage_classify(req: TriageClassifyRequest):
    """Opus 4.7 one-shot ESI classification for ER arrivals. Separate
    from the Managed Agent event stream — this is a stateless direct
    inference endpoint."""
    client = get_anthropic_client()
    return run_triage_reasoning(client, req)




PATIENT_MODEL = "gemini-3.5-flash"
PATIENT_MAX_TOKENS = 256
GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta"


def _require_gemini_api_key() -> str:
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY is not set server-side.",
        )
    return key


def _gemini_role(role: str) -> str:
    # Gemini's `contents` turns use 'user' / 'model' (not 'assistant').
    return "model" if role == "assistant" else "user"


class PatientChatMessage(BaseModel):
    role: str  # 'user' | 'assistant'
    content: str


class PatientStreamRequest(BaseModel):
    system: str
    messages: list[PatientChatMessage]


@app.post("/agent/patient/stream")
async def patient_stream(req: dict):
    from fastapi.responses import StreamingResponse
    import json

    _ensure_gemini_available()

    model = genai.GenerativeModel(
        model_name="gemini-3.5-flash",
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
                    yield f"data: {json.dumps(payload)}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(generator(), media_type="text/event-stream")


class MentalHealthRequest(BaseModel):
    system: str
    transcript: str


@app.post("/agent/mental-health")
async def mental_health(req: MentalHealthRequest):
    gkey = os.environ.get("GEMINI_API_KEY")
    if not gkey:
        return JSONResponse({"error": "GEMINI_API_KEY not configured on server"}, status_code=501)

    prompt_text = req.system + "\n\nTranscript:\n" + req.transcript + "\n\nReturn STRICT JSON only."
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent"
    headers = {"Content-Type": "application/json", "x-goog-api-key": gkey}
    body = {"contents": [{"parts": [{"text": prompt_text}]}]}
    if gkey.startswith("ya29."):
        headers["Authorization"] = f"Bearer {gkey}"

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            r = await client.post(url, json=body, headers=headers)
    except Exception as e:
        _agent_log.exception("mental-health: request to Gemini failed")
        raise HTTPException(status_code=502, detail=f"gen ai request failed: {e}")

    if r.status_code != 200:
        _agent_log.warning("mental-health: non-200 from Gemini: %s", r.text[:200])
        raise HTTPException(status_code=502, detail=f"gen ai returned {r.status_code}: {r.text}")

    data = r.json()
    # Extract candidate text from the generateContent response shape:
    # {"candidates": [{"content": {"parts": [{"text": "..."}]}}]}
    text = ""
    if isinstance(data, dict):
        candidates = data.get("candidates")
        if isinstance(candidates, list) and candidates:
            content = candidates[0].get("content") or {}
            parts = content.get("parts") or []
            text = "".join(p.get("text", "") for p in parts if isinstance(p, dict))
    if not text:
        text = json.dumps(data)

    # Strip ``` fences and leading 'json' markers
    raw = text.strip()
    if raw.startswith("```"):
        raw = raw.strip("`")
        if raw.lower().startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    try:
        parsed = json.loads(raw)
    except Exception as e:
        _agent_log.warning("mental-health: malformed JSON from model: %s", raw[:200])
        raise HTTPException(status_code=502, detail=f"mental-health model returned malformed JSON: {e}")

    return JSONResponse(parsed)



import json as _json
import secrets as _secrets
import asyncio as _asyncio

from livekit import api as _lkapi


class VoiceTokenRequest(BaseModel):
    caseId: str
    systemPrompt: str
    initialLine: str
    gender: str  # 'M' | 'F' — speaker gender (parent for pediatric)
    voiceId: Optional[str] = None  # explicit override
    identity: Optional[str] = None  # browser-side participant identity


class VoiceTokenResponse(BaseModel):
    token: str
    url: str
    roomName: str


@app.post("/voice/token", response_model=VoiceTokenResponse)
async def voice_token(req: VoiceTokenRequest):
    lk_url = os.environ.get("LIVEKIT_URL")
    lk_key = os.environ.get("LIVEKIT_API_KEY")
    lk_secret = os.environ.get("LIVEKIT_API_SECRET")
    if not (lk_url and lk_key and lk_secret):
        raise HTTPException(
            status_code=500,
            detail="LIVEKIT_URL/LIVEKIT_API_KEY/LIVEKIT_API_SECRET not configured",
        )

    nonce = _secrets.token_urlsafe(8)
    safe_case = "".join(c for c in req.caseId if c.isalnum() or c in "-_")[:32] or "case"
    room_name = f"gr-{safe_case}-{nonce}"
    identity = req.identity or f"doctor-{_secrets.token_hex(4)}"

    metadata = _json.dumps(
        {
            "caseId": req.caseId,
            "systemPrompt": req.systemPrompt,
            "initialLine": req.initialLine,
            "voiceGender": req.gender,
            "voiceId": req.voiceId,
        }
    )

    lkapi = _lkapi.LiveKitAPI(lk_url, lk_key, lk_secret)
    try:
        await lkapi.room.create_room(
            _lkapi.CreateRoomRequest(
                name=room_name,
                metadata=metadata,
                empty_timeout=120,
                agents=[_lkapi.RoomAgentDispatch(agent_name="medkit-voice")],
            )
        )
    except Exception as e:
        # If the room already exists (rare race), let it through.
        msg = str(e).lower()
        if "already" not in msg and "exists" not in msg:
            await lkapi.aclose()
            raise HTTPException(status_code=502, detail=f"livekit room create failed: {e}")
    finally:
        try:
            await lkapi.aclose()
        except Exception:
            pass

    token = (
        _lkapi.AccessToken(lk_key, lk_secret)
        .with_identity(identity)
        .with_name(identity)
        .with_grants(
            _lkapi.VideoGrants(
                room_join=True,
                room=room_name,
                can_publish=True,
                can_subscribe=True,
                can_publish_data=True,
            )
        )
        .to_jwt()
    )

    return VoiceTokenResponse(token=token, url=lk_url, roomName=room_name)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8787, log_level="info")