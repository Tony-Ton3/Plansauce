from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Any, Optional
from .tech_stack_curator import TechStackCuratorCrew
from .task_curator import TaskGenerationCrew

#from .prompt_engineer import PromptGenerationCrew
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def infer_project_type(description: str, known_tech: List[str] = None, starred_tech: List[str] = None) -> str:
    description_lower = description.lower()
    known_tech = known_tech or []
    known_tech_lower = [tech.lower() for tech in known_tech]
    starred_tech = starred_tech or []
    starred_tech_lower = [tech.lower() for tech in starred_tech]
    
    web_indicators = ["web app", "website", "web application", "webapp", "web platform", "web service", "browser-based"]
    mobile_indicators = ["mobile app", "ios app", "android app", "mobile application", "smartphone app"]
    extension_indicators = ["browser extension", "chrome extension", "firefox addon", "browser plugin", "web extension"]
    cli_indicators = ["command line", "cli tool", "terminal", "shell script", "command-line interface"]
    backend_indicators = ["api", "backend", "microservice", "server", "rest api", "graphql", "database service"]
    data_indicators = ["data analysis", "data science", "machine learning", "ai", "artificial intelligence", "data visualization", "analytics"]
    game_indicators = ["game", "gaming", "unity", "unreal", "2d game", "3d game", "multiplayer"]
    desktop_indicators = ["desktop app", "desktop application", "windows app", "mac app", "cross-platform desktop"]
    devops_indicators = ["devops", "infrastructure", "deployment", "ci/cd", "automation", "monitoring", "containerization"]
    educational_indicators = ["learning platform", "tutorial", "course", "educational", "e-learning", "teaching", "interactive learning"]

    if any(term in description_lower for term in web_indicators):
        return "Web Application"
    if any(term in description_lower for term in mobile_indicators):
        return "Mobile App"
    if any(term in description_lower for term in extension_indicators):
        return "Browser Extension"
    if any(term in description_lower for term in cli_indicators):
        return "CLI Tool"
    if any(term in description_lower for term in backend_indicators):
        return "API/Backend Service"
    if any(term in description_lower for term in data_indicators):
        return "Data Analysis/ML Project"
    if any(term in description_lower for term in game_indicators):
        return "Game"
    if any(term in description_lower for term in desktop_indicators):
        return "Desktop Application"
    if any(term in description_lower for term in devops_indicators):
        return "DevOps/Infrastructure Tool"
    if any(term in description_lower for term in educational_indicators):
        return "Educational/Tutorial Project"

    return "Web Application"

def infer_experience_level(known_tech: List[str], starred_tech: List[str]) -> str:
    if not known_tech and not starred_tech:
        return "Beginner - New to development or learning the basics with limited framework exposure and focused on building core skills."
        
    total_tech = len(known_tech) + len(starred_tech)
    
    if total_tech > 15:
        return "Advanced - Experienced developer comfortable with complex architectures, multiple frameworks, testing strategies, and deployment pipelines."
    elif total_tech > 8:
        return "Intermediate - Developer with solid fundamental knowledge, some framework experience, and the ability to build complete applications with guidance."
    else:
        return "Beginner - New to development or learning the basics with limited framework exposure and focused on building core skills."

@app.post("/api/generate-tasks")
async def generate_tasks(request: Request):
    """Generate tasks for a project based on description, priority, and tech background"""
    try:
        data = await request.json()
        print(f"Received data: {data}")
        
        description = data.get('description') #project idea
        priority = data.get('priority', '') #speed, scalability, learning

        background = data.get('background', {}) 
        known_tech = background.get('known_tech', [])
        disliked_tech = background.get('disliked_tech', [])
        starred_tech = background.get('starred_tech', [])
        
        project_type = infer_project_type(description, known_tech, starred_tech)
        print(f"Inferred project type: {project_type}")
        
        experience_level = infer_experience_level(known_tech, starred_tech)
        print(f"Inferred experience level: {experience_level}")

        #curates personalized tech stack based on project type, priority, and user background
        tech_stack_curator = TechStackCuratorCrew(api_key=os.getenv("BRAVE_API_KEY"))
        tech_stack_recommendation = tech_stack_curator.curate_tech_stack(
            project_type=project_type,
            priority=priority,
            experience_level=experience_level,
            project_description=description,
            known_tech=known_tech,
            disliked_tech=disliked_tech,
            starred_tech=starred_tech
        )
        
        tech_stack_by_category = {}
        
        #extract tech stack by category so we can pass this to the task generation
        if isinstance(tech_stack_recommendation, dict) and "error" not in tech_stack_recommendation:
            for category in ["planning", "setup", "frontend", "backend", "testing", "deploy", "maintain"]:
                if category in tech_stack_recommendation:
                    tech_stack_by_category[category] = tech_stack_recommendation[category]
        
        # print(f"Techstack by category: {tech_by_category}")
        
        crew = TaskGenerationCrew()
        result = crew.generate_tasks(
            project_description = description,
            priority = priority,
            tech_stack_by_category = tech_stack_by_category,
            project_type = project_type
        )
        
        tasks = result.get("tasks", [])
        #print(f"Generated tasks: {tasks}")
        
        return {
            "success": True,
            "data": tasks,  
            "tech_stack": tech_stack_recommendation,
            "project_type": project_type,
            "priority": priority
        }
        
    except Exception as e:
        print(f"Error in generate_tasks endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 