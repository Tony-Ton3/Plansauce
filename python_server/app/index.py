from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Any, Optional
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
    """Generate tasks for a project based on description, priority, and tech background"""
    try:
        data = await request.json()
        print(f"Received data: {data}")
        
        description = data.get('description')
        if not description:
            raise HTTPException(status_code=400, detail="Project description is required")
        
        priority = data.get('priority', '')
        background = data.get('background', {})
        known_tech = background.get('known_tech', [])
        disliked_tech = background.get('disliked_tech', [])
        
        # Create enhanced description with tech context
        tech_context = ""
        if known_tech:
            tech_context += f"\nPreferred technologies: {', '.join(known_tech)}"
        if disliked_tech:
            tech_context += f"\nTechnologies to avoid: {', '.join(disliked_tech)}"
            
        enhanced_description = f"""
        Project Description: {description}
        Priority: {priority}
        {tech_context}
        """
        
        print(f"Enhanced description: {enhanced_description}")
        
        crew = TaskGenerationCrew()
        result = crew.generate_tasks(
            project_description=enhanced_description,
            tech_stack=known_tech,
            priority=priority
        )
        
        return {
            "success": True,
            "data": result.get("tasks", [])
        }
        
    except Exception as e:
        print(f"Error in generate_tasks endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 