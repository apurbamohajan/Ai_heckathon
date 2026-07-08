# AI Clinical Training Simulator

An AI-powered virtual patient simulation platform designed to help medical students practice psychiatric interviews and improve clinical communication skills.

## Overview

The AI Clinical Training Simulator provides an interactive environment where students can interview simulated psychiatric patients, analyze symptoms, and receive structured feedback.

The system uses Generative AI to create realistic patient conversations based on predefined clinical scenarios such as depression, anxiety, and panic disorders.

## Problem Statement

Clinical interview practice is limited due to the availability, cost, and scheduling challenges of standardized patients. Medical students require a scalable solution that allows repeated practice with realistic patient interactions.

This project addresses this challenge by providing an AI-driven virtual patient system for clinical training.

## Features

* AI-generated virtual psychiatric patients
* Interactive clinical interview sessions
* Multiple mental health scenarios
* Patient personality and symptom simulation
* Session-based conversation tracking
* Automated clinical performance evaluation
* Real-time API communication
* Cloud deployment support

## Supported Patient Scenarios

* Normal Patient
* Mild Depression
* Major Depression
* Anxiety Disorder
* Panic Attack

## System Architecture

```
Student
   |
   ↓
Web Interface
   |
   ↓
AI Clinical Agent
   |
   ├── Patient Simulation Module
   |
   ├── Session Management
   |
   └── Evaluation Engine
            |
            ↓
       Feedback Report
```

## Technology Stack

### Backend

* Python
* FastAPI
* Uvicorn

### AI

* Google Gemini Generative AI
* Prompt Engineering
* LLM-based Patient Simulation

### Deployment

* Railway Cloud Platform

### API Documentation

* OpenAPI / Swagger

## API Endpoints

| Method | Endpoint                              | Description              |
| ------ | ------------------------------------- | ------------------------ |
| GET    | `/health`                             | Health check             |
| POST   | `/agent/bootstrap`                    | Initialize AI agent      |
| POST   | `/agent/sessions`                     | Create interview session |
| GET    | `/agent/sessions/{session_id}`        | Retrieve session         |
| POST   | `/agent/sessions/{session_id}/events` | Send conversation events |
| GET    | `/agent/sessions/{session_id}/stream` | Stream AI responses      |
| POST   | `/agent/mental-health`                | Mental health evaluation |
| POST   | `/voice/token`                        | Generate voice token     |

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd backend
```

### Create Virtual Environment

```bash
python -m venv .venv
```

Activate:

Windows:

```bash
.venv\Scripts\activate
```

Linux/Mac:

```bash
source .venv/bin/activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

## Environment Variables

Create a `.env` file:

```
GEMINI_API_KEY=your_api_key
```

## Running Locally

Start the backend:

```bash
python server.py
```

The API will run at:

```
http://127.0.0.1:8787
```

Swagger documentation:

```
http://127.0.0.1:8787/docs
```

## Model Card Summary

### Model

Gemini-powered conversational AI agent.

### Purpose

Educational psychiatric interview simulation.

### Input

* Patient profile
* Clinical scenario
* Student questions
* Conversation history

### Output

* Patient responses
* Interview feedback
* Clinical evaluation

### Limitations

* AI responses may occasionally be inaccurate.
* Simulated patients cannot fully represent real patient diversity.
* The system is not intended for medical diagnosis or treatment decisions.

## Data Card Summary

### Dataset Type

Synthetic psychiatric patient scenarios.

### Data Sources

* Expert-designed clinical cases
* Synthetic patient profiles
* Educational mental health scenarios

### Privacy

* No real patient information is used.
* No personally identifiable information is stored.

## Future Improvements

* Voice-based patient interaction
* Facial emotion simulation
* Expanded psychiatric conditions
* Clinician-validated evaluation criteria
* Student progress analytics

## Ethical Considerations

This system is designed only for medical education and training. It should not replace professional healthcare providers or be used for real patient diagnosis.

## License

This project is developed for educational and research purposes.
