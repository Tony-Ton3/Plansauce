from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Any, Optional
from .crew import TaskGenerationCrew
from .tech_stack_curator import TechStackCuratorCrew
from .prompt_engineer import PromptGenerationCrew
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
    data_tech = ["python", "numpy", "pandas", "scikit-learn", "tensorflow", "pytorch", "jupyter notebooks"]
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
            known_tech=known_tech,
            disliked_tech=disliked_tech,
            starred_tech=starred_tech
        )
        
        recommended_tech = [] #array of the curated tech stack to be used in task generation
        tech_by_category = {} #structured categorization of the curated tech stack
        
        # Extract recommended technologies for task generation
        if isinstance(tech_stack_recommendation, dict) and "error" not in tech_stack_recommendation:
            # Create a structured categorization of all recommended technologies
            for category in ["planning", "setup", "frontend", "backend", "testing", "deploy", "maintain"]:
                if category in tech_stack_recommendation:
                    tech_by_category[category] = tech_stack_recommendation[category]
                    # Add all tech names to the flat list for backwards compatibility
                    for tech in tech_stack_recommendation[category]:
                        if "name" in tech:
                            recommended_tech.append(tech["name"])
        
        if recommended_tech:
            tech_context = f"\nRecommended technologies: {', '.join(recommended_tech)}"
            
        # Add priority context
        priority_context = ""
        if priority:
            if "Speed" in priority:
                priority_context = "\nSpeed - Focus on rapid development and MVP approach"
            elif "Scalability" in priority:
                priority_context = "\nScalability - Focus on architecture and future-proofing"
            else:
                priority_context = "\nLearning - Focus on educational value and skill development"
        
        # Build a more detailed tech context that preserves category information
        tech_context = ""
        if tech_by_category:
            tech_context += "\nTECH STACK BY CATEGORY:"
            for category, techs in tech_by_category.items():
                tech_names = [t.get("name") for t in techs if "name" in t]
                if tech_names:
                    tech_context += f"\n- {category.upper()}: {', '.join(tech_names)}"
        
        # Also keep the flat list for backwards compatibility
        if recommended_tech:
            tech_context += f"\nAll recommended technologies: {', '.join(recommended_tech)}"

        print(f"Techstack by category: {tech_by_category}")
        
        # Enhanced description with detailed tech stack
        enhanced_description = f"""
        Project Description: {description}
        Project Type: {project_type}
        Priority: {priority_context}
        {tech_context}
        
        TASK GENERATION INSTRUCTIONS:
        - Prioritize tasks based on the specified priority ({priority})
        - Use the recommended technologies in your task generation
        - When suggesting new technologies, provide clear learning resources and documentation links
        - If the user has preferred technologies, incorporate them when they're a good fit
        - If the user has technologies to avoid, ensure they are not included in recommendations
        - Make each task and subtask highly actionable with specific instructions
        - Ensure tasks are well-scoped and don't require additional clarification
        - Map tasks to appropriate tech stack categories (planning, setup, frontend, backend, testing, deploy, maintain)
        - IMPORTANT: For each task, assign a category field that corresponds to one of the tech stack categories
        - Make sure each task uses the specific technologies mentioned in the corresponding category
        """
        
        print(f"Enhanced description: {enhanced_description}")
        
        # Generate tasks
        crew = TaskGenerationCrew()
        result = crew.generate_tasks(
            project_description=enhanced_description,
            priority=priority
        )
        
        tasks = result.get("tasks", [])
        
        # Add tech stack information to each task based on its category
        for task in tasks:
            category = task.get("category", "")
            tech_list = []
            if category in tech_stack_recommendation:
                tech_list = tech_stack_recommendation[category]
            
            # Add tech stack information to the task
            task["tech_stack"] = tech_list
            
            # Add tech stack to subtasks
            if "subtasks" in task and task["subtasks"]:
                for subtask in task["subtasks"]:
                    subtask["tech_stack"] = tech_list
        
        # Build a more detailed tech context that preserves category information
        tech_context = ""
        if tech_by_category:
            tech_context += "\nTECH STACK BY CATEGORY:"
            for category, techs in tech_by_category.items():
                tech_names = [t.get("name") for t in techs if "name" in t]
                if tech_names:
                    tech_context += f"\n- {category.upper()}: {', '.join(tech_names)}"
        
        # Also keep the flat list for backwards compatibility
        if recommended_tech:
            tech_context += f"\nAll recommended technologies: {', '.join(recommended_tech)}"
        
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