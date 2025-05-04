# Plansauce CrewAI API

A FastAPI backend for CrewAI integration with the Plansauce application.

## Overview

This API server focuses solely on providing CrewAI functionality to the main Plansauce application. It doesn't store data directly in a database - instead, it:

1. Receives requests from the Node.js server
2. Processes these requests using CrewAI
3. Returns results to the Node.js server, which then handles storage in MongoDB

## Setup

1. Create a virtual environment:
```
python -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
```

2. Install dependencies:
```
pip install -r requirements.txt
```

3. Configure the OpenAI API key:
Create a `.env` file in the `python_server` directory with:
```
OPENAI_API_KEY=your_openai_api_key_here
```

4. Run the application:
```
uvicorn main:app --reload
```

5. Open your browser and navigate to `http://localhost:8000/docs` to see the API documentation.

## Project Structure

```
python_server/
├── app/
│   ├── __init__.py
│   └── routes.py      # API routes for CrewAI
├── main.py            # FastAPI application
├── requirements.txt   # Dependencies
└── README.md          # This file
```

## API Endpoints

- **CrewAI Operations**
  - `POST /api/run-crew`: Run a CrewAI workflow with specified agents and tasks
  - `GET /api/health`: Health check endpoint

## Example Request (to /api/run-crew)

```json
{
  "agents": [
    {
      "name": "Researcher",
      "role": "Senior Research Analyst",
      "goal": "Uncover accurate information about the topic",
      "backstory": "You are an expert at finding and synthesizing information."
    },
    {
      "name": "Writer",
      "role": "Content Strategist",
      "goal": "Create engaging, clear content",
      "backstory": "You excel at turning complex ideas into accessible content."
    }
  ],
  "tasks": [
    {
      "description": "Research the latest trends in AI education",
      "expected_output": "A comprehensive summary of current AI education trends",
      "agent_name": "Researcher"
    },
    {
      "description": "Create an engaging blog post based on the research",
      "expected_output": "A well-structured blog post about AI education trends",
      "agent_name": "Writer",
      "context": ["The output from the research task"]
    }
  ],
  "process": "sequential"
}
``` 