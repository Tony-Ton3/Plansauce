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
    """Generate tasks for a project"""
    try:
        data = await request.json()
        print(f"Received data: {data}")
        
        project_description = data.get('projectDescription')
        if not project_description:
            raise HTTPException(status_code=400, detail="Project description is required")
        
        tech_stack = data.get('techStack', [])
        should_recommend_tech_stack = len(tech_stack) == 0
        
        project_type = data.get('projectType', 'web')
        scale = data.get('scale', 'small')
        features = data.get('features', [])
        timeline = data.get('timeline', 'flexible')
        
        enhanced_description = f"""
        Project Description: {project_description}
        Project Type: {project_type}
        Project Scale: {scale}
        Features: {', '.join(features) if features else 'No specific features mentioned'}
        Timeline: {timeline}
        """
        
        if should_recommend_tech_stack:
            enhanced_description += "\nPlease recommend an appropriate tech stack for this project."
        elif tech_stack:
            enhanced_description += f"\nUser prefers to use the following technologies: {', '.join(tech_stack)}"
        
        print(f"Enhanced description: {enhanced_description}")
        
        crew = TaskGenerationCrew()
        result = crew.generate_tasks(
            project_description=enhanced_description,
            tech_stack=tech_stack,
            project_type=project_type,
            should_recommend_tech_stack=should_recommend_tech_stack
        )
        
        response = {
            "success": True,
            "data": result.get("tasks", [])
        }
        
        return response
        
    except Exception as e:
        print(f"Error in generate_tasks endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 