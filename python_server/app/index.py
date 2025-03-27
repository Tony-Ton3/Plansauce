from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Any
from .crew import TaskGenerationCrew

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/generate-tasks")
async def generate_tasks(request: Request):
    """Generate tasks for a project"""
    try:
        data = await request.json()
        
        # Extract parameters
        project_description = data.get('projectDescription')
        if not project_description:
            raise HTTPException(status_code=400, detail="Project description is required")
        
        tech_stack = data.get('techStack', [])
        project_type = data.get('projectType', 'web')
        
        # Generate tasks
        crew = TaskGenerationCrew()
        result = crew.generate_tasks(
            project_description=project_description,
            tech_stack=tech_stack,
            project_type=project_type
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 