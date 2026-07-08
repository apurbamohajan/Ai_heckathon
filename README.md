# auraliscare

## AI Clinical Operating System

> Premium clinical simulation platform for the next generation of healthcare teams.

auraliscare is an AI-powered clinical training platform that enables healthcare learners to practice realistic consultations, interact with intelligent virtual patients, and receive structured AI-grade clinical feedback.

The platform combines **Generative AI, voice interaction, clinical workflows, and evidence-guided evaluation** to create a realistic simulation environment for medical education.

---

# 🚀 Overview

Traditional clinical training depends heavily on standardized patients, limited clinical exposure, and instructor availability. auraliscare addresses these challenges by providing an always-available AI clinical simulation environment.

The platform allows trainees to:

* Conduct realistic patient consultations
* Practice history-taking and clinical reasoning
* Simulate psychiatric OSCE examinations
* Receive automated performance assessment
* Improve communication and decision-making skills

---

# ✨ Key Features

## 🏥 Outpatient Consultation Wing

Simulated outpatient consultation rooms across multiple specialties.

Features:

* Clinical case selection
* Patient history taking
* Examination workflow
* Management planning
* AI-assisted feedback

Platform coverage:

* **240+ Clinical Cases**
* **11 Specialties**
* **22 Clinical Guidelines**

---

## 🧠 AI Psychiatry OSCE Simulator

An interactive behavioral health training environment.

Students can interview AI psychiatric patients and receive structured evaluation.

Supported cases:

* Normal patient
* Mild depression
* Major depression
* Anxiety disorder
* Panic attack
* PTSD
* OCD
* Bipolar disorder
* Schizophrenia
* Suicide risk assessment

---

# 🏗️ System Architecture

```
                 Trainee
                    |
                    ↓
          Clinical Simulation UI
                    |
                    ↓
            Managed AI Agent
                    |
     ┌──────────────┼──────────────┐
     ↓              ↓              ↓
Patient AI     Encounter Log   Evaluation Engine
Simulation      Recorder        AI Attending
     |                              |
     └──────────────┬───────────────┘
                    ↓
            Clinical Feedback Report
```

---

# 🔄 Clinical Simulation Workflow

## 1. Case Selection

The trainee selects:

* Specialty
* Clinical scenario
* Patient profile

Example:

```
Major Depression
        ↓
Patient Persona Generation
        ↓
Consultation Begins
```

---

## 2. Patient Consultation

The trainee interacts with an AI-generated patient.

The system tracks:

* Questions asked
* Clinical decisions
* Communication style
* Patient responses

---

## 3. AI Attending Review

The AI attending analyzes the complete encounter.

Evaluation domains:

| Domain                | Description                       |
| --------------------- | --------------------------------- |
| History & Examination | Quality of information gathering  |
| Care Pathway          | Clinical reasoning and management |
| Patient Rapport       | Communication and empathy         |

---

# 🤖 AI Architecture

## Patient Simulation Agent

Generates realistic patient conversations using:

* Clinical scenarios
* Patient personas
* Symptom profiles
* Conversation memory

---

## Voice Interaction Layer

Real-time voice pipeline:

```
Speech Input
      |
      ↓
Speech-to-Text
      |
      ↓
AI Patient Agent
      |
      ↓
Text-to-Speech
      |
      ↓
Voice Response
```

Technology:

* LiveKit
* Deepgram STT
* Cartesia TTS

---

## AI Attending Agent

The evaluation agent:

* Reviews consultation history
* Compares actions with clinical guidelines
* Generates structured feedback
* Scores learner performance

Technology:

* Gemini Managed Agent
* Gemini Flash Model

---

# 📊 Evaluation Framework

The simulator grades trainees using three major rubrics.

## History & Examination

Measures:

* Question completeness
* Symptom exploration
* Clinical data collection

---

## Care Pathway

Measures:

* Differential diagnosis
* Investigation choices
* Treatment planning

---

## Patient Rapport

Measures:

* Empathy
* Communication quality
* Patient-centered approach

---

# 🧩 Technology Stack

## Frontend

* React / Next.js
* Tailwind CSS
* Interactive simulation interface

## Backend

* Python
* FastAPI
* Uvicorn

## AI

* Google Gemini
* Generative AI Agents
* Prompt Engineering

## Deployment

* Railway Cloud Platform

## API Documentation

* OpenAPI
* Swagger UI

---

# 📡 API Overview

| Endpoint                      | Purpose                     |
| ----------------------------- | --------------------------- |
| `/health`                     | System health check         |
| `/agent/bootstrap`            | Initialize AI agent         |
| `/agent/sessions`             | Create consultation session |
| `/agent/sessions/{id}`        | Retrieve session            |
| `/agent/sessions/{id}/events` | Store encounter events      |
| `/agent/patient/stream`       | Stream AI patient response  |
| `/agent/mental-health`        | Psychiatric evaluation      |
| `/voice/token`                | Voice authentication        |

---

# 📈 Current Platform Metrics

| Metric            | Value |
| ----------------- | ----: |
| Clinical Cases    |  240+ |
| Specialties       |    11 |
| Guidelines        |    22 |
| Psychiatric Cases |    10 |

---

# 🔐 Ethical Considerations

auraliscare is designed for **medical education only**.

The system:

✅ Supports clinical training
✅ Provides simulation-based practice
✅ Helps improve communication skills

The system does not:

❌ Diagnose real patients
❌ Replace healthcare professionals
❌ Provide medical treatment recommendations

---

# ⚠️ Limitations

* AI responses may occasionally contain inaccuracies.
* Simulated patients cannot represent every real-world scenario.
* Clinical validation requires collaboration with medical educators.
* Performance depends on the underlying AI model.

---

# 🔮 Future Improvements

Planned enhancements:

* Multilingual patient simulation
* Advanced voice emotion recognition
* 3D virtual consultation rooms
* Real-time clinical decision support
* Medical educator dashboards
* Personalized learner progress tracking

---

# 📄 Model Card

## Model

Gemini-powered conversational clinical agent.

## Purpose

Educational patient simulation and OSCE preparation.

## Inputs

* Patient profile
* Clinical scenario
* Student conversation
* Encounter history

## Outputs

* Patient responses
* Clinical feedback
* Performance scores

---

# 📚 Data Card

## Dataset Type

Synthetic clinical case scenarios.

## Data Sources

* Educational clinical cases
* Expert-designed scenarios
* Simulated patient profiles

## Privacy

* No real patient records used
* No personally identifiable information stored

---

# 👥 Project Vision

auraliscare aims to become an AI Clinical Operating System that transforms healthcare education by providing scalable, realistic, and evidence-guided clinical simulation for future healthcare teams.

---

## License

This project is developed for educational and research purposes.
