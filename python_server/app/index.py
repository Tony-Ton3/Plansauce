from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Any, Optional
from .crew import TaskGenerationCrew
from .tech_stack_curator import TechStackCuratorCrew
from .prompt_engineer import PromptGenerationCrew
# from .prompt_engineer import PromptGenerationCrew
import os

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def infer_project_type(description: str, known_tech: List[str] = None, starred_tech: List[str] = None) -> str:
    """
    Infer the project type from the project description and known technologies.
    
    Args:
        description: The project description
        known_tech: List of technologies the user is familiar with
        starred_tech: List of technologies the user is interested in
    Returns:
        str: The inferred project type
    """
    description_lower = description.lower()
    known_tech = known_tech or []
    known_tech_lower = [tech.lower() for tech in known_tech]
    starred_tech = starred_tech or []
    starred_tech_lower = [tech.lower() for tech in starred_tech]
    
    # Web Application indicators
    web_indicators = ["web app", "website", "web application", "webapp", "web platform", "web service", "browser-based"]
    web_tech = ["react", "vue.js", "angular", "next.js", "html/css", "tailwind css", "express.js", "netlify", "vercel"]
    
    # Mobile App indicators
    mobile_indicators = ["mobile app", "ios app", "android app", "mobile application", "smartphone app"]
    mobile_tech = ["android studio", "xcode", "react native", "flutter", "ionic"]
    
    # Browser Extension indicators
    extension_indicators = ["browser extension", "chrome extension", "firefox addon", "browser plugin", "web extension"]
    
    # CLI Tool indicators
    cli_indicators = ["command line", "cli tool", "terminal", "shell script", "command-line interface"]
    
    # API/Backend Service indicators
    backend_indicators = ["api", "backend", "microservice", "server", "rest api", "graphql", "database service"]
    backend_tech = ["node.js", "express.js", "django", "spring boot", "postgresql", "mongodb", "graphql"]
    
    # Data Analysis/ML Project indicators
    data_indicators = ["data analysis", "machine learning", "ml", "ai", "data science", "analytics", "prediction", "classification"]
    data_tech = ["python", "numpy", "pandas", "scikit-learn", "tensorflow", "pytorch", "jupyter notebooks"]
    
    # Game indicators
    game_indicators = ["game", "gaming", "unity", "unreal", "2d game", "3d game", "multiplayer"]
    game_tech = ["unity", "unreal engine", "godot", "gamemaker studio", "blender"]
    
    # Desktop Application indicators
    desktop_indicators = ["desktop app", "desktop application", "windows app", "mac app", "cross-platform desktop"]
    
    # DevOps/Infrastructure Tool indicators
    devops_indicators = ["devops", "infrastructure", "deployment", "ci/cd", "automation", "monitoring", "containerization"]
    devops_tech = ["docker", "kubernetes", "aws", "terraform", "ansible", "jenkins", "github actions", "prometheus", "grafana"]
    
    # Educational/Tutorial Project indicators
    educational_indicators = ["learning platform", "tutorial", "course", "educational", "e-learning", "teaching", "interactive learning"]

    # Check description indicators
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

    # If no clear indicators in description, check known and starred technologies
    all_user_tech = known_tech_lower + starred_tech_lower
    
    if any(tech in all_user_tech for tech in mobile_tech):
        return "Mobile App"
    if any(tech in all_user_tech for tech in data_tech):
        return "Data Analysis/ML Project"
    if any(tech in all_user_tech for tech in backend_tech):
        return "API/Backend Service"
    if any(tech in all_user_tech for tech in game_tech):
        return "Game"
    if any(tech in all_user_tech for tech in devops_tech):
        return "DevOps/Infrastructure Tool"
    if any(tech in all_user_tech for tech in web_tech):
        return "Web Application"

    # Default to Web Application if no specific type is detected
    return "Web Application"

# def infer_experience_level(known_tech: List[str]) -> str:
#     """
#     Infer the user's experience level based on their known technologies.
    
#     Args:
#         known_tech: List of technologies the user is familiar with
        
#     Returns:
#         str: The inferred experience level
#     """
#     if not known_tech:
#         return "Beginner"
        
#     # Count technologies in different categories
#     frontend_tech = ["html", "css", "javascript", "react", "vue", "angular", "svelte", "next.js", "gatsby"]
#     backend_tech = ["node.js", "express", "django", "flask", "spring", "laravel", "rails", "graphql"]
#     database_tech = ["sql", "postgresql", "mysql", "mongodb", "redis", "firebase", "dynamodb"]
#     devops_tech = ["docker", "kubernetes", "aws", "azure", "gcp", "ci/cd", "jenkins", "github actions"]
    
#     known_tech_lower = [tech.lower() for tech in known_tech]
    
#     # Count technologies in each category
#     frontend_count = sum(1 for tech in frontend_tech if any(tech in kt for kt in known_tech_lower))
#     backend_count = sum(1 for tech in backend_tech if any(tech in kt for kt in known_tech_lower))
#     database_count = sum(1 for tech in database_tech if any(tech in kt for kt in known_tech_lower))
#     devops_count = sum(1 for tech in devops_tech if any(tech in kt for kt in known_tech_lower))
    
#     # Calculate total technologies across categories
#     total_tech = frontend_count + backend_count + database_count + devops_count
    
#     # Determine experience level
#     if total_tech > 15 or (frontend_count > 5 and backend_count > 5 and database_count > 2):
#         return "Advanced"
#     elif total_tech > 8 or (frontend_count > 3 and backend_count > 3):
#         return "Intermediate"
#     else:
#         return "Beginner"

@app.post("/api/generate-tasks")
async def generate_tasks(request: Request):
    """Generate tasks for a project based on description, priority, and tech background"""
    try:
        data = await request.json()
        print(f"Received data: {data}")
        
        description = data.get('description')
        priority = data.get('priority', '')
        background = data.get('background', {})
        known_tech = background.get('known_tech', [])
        disliked_tech = background.get('disliked_tech', [])
        starred_tech = background.get('starred_tech', [])
        
        # Infer project type from description and known technologies
        project_type = infer_project_type(description, known_tech, starred_tech)
        print(f"Inferred project type: {project_type}")
        
        # Infer experience level
        # experience_level = infer_experience_level(known_tech)
        # print(f"Inferred experience level: {experience_level}")
        
        # First, curate the tech stack based on user preferences and project priority
        tech_stack_curator = TechStackCuratorCrew(api_key=os.getenv("BRAVE_API_KEY"))
        tech_stack_recommendation = tech_stack_curator.curate_tech_stack(
            known_tech=known_tech,
            disliked_tech=disliked_tech,
            starred_tech=starred_tech,
            project_type=project_type,
            priority=priority
        )
        
        # Extract recommended technologies for task generation
        recommended_tech = []
        if isinstance(tech_stack_recommendation, dict) and "error" not in tech_stack_recommendation:
            for category in ["frontend", "backend", "database", "deployment"]:
                if category in tech_stack_recommendation:
                    for tech in tech_stack_recommendation[category]:
                        if "name" in tech:
                            recommended_tech.append(tech["name"])
        
        # Create enhanced description with tech context
        tech_context = ""
        if known_tech:
            tech_context += f"\nPreferred technologies: {', '.join(known_tech)}"
        if disliked_tech:
            tech_context += f"\nTechnologies to avoid: {', '.join(disliked_tech)}"

        if recommended_tech:
            tech_context += f"\nRecommended technologies: {', '.join(recommended_tech)}"
            
        # Add priority context
        priority_context = ""
        if priority:
            if "Speed" in priority:
                priority_context = "\nPriority: Speed - Focus on rapid development and MVP approach"
            elif "Scalability" in priority:
                priority_context = "\nPriority: Scalability - Focus on architecture and future-proofing"
            else:
                priority_context = "\nPriority: Learning - Focus on educational value and skill development"
        
        # Add user experience context
        # experience_context = f"\nUser Experience Level: {experience_level} (based on {len(known_tech)} known technologies)"
        
        enhanced_description = f"""
        Project Description: {description}
        Project Type: {project_type}
        {priority_context}
        {tech_context}
        
        TASK GENERATION INSTRUCTIONS:
        - Prioritize tasks based on the specified priority (Speed/Scalability/Learning)
        - Use the recommended technologies in your task generation
        - When suggesting new technologies, provide clear learning resources and documentation links
        - If the user has preferred technologies, incorporate them when they're a good fit
        - If the user has technologies to avoid, ensure they are not included in recommendations
        - Make each task and subtask highly actionable with specific instructions
        - Ensure tasks are well-scoped and don't require additional clarification
        """
        
        print(f"Enhanced description: {enhanced_description}")
        
        # Generate tasks
        crew = TaskGenerationCrew()
        result = crew.generate_tasks(
            project_description=enhanced_description,
            priority=priority
        )
        
        tasks = result.get("tasks", [])
        
        # Generate prompts for each task
        # prompt_crew = PromptGenerationCrew()
        # prompts_result = prompt_crew.generate_prompts(
        #     tasks=tasks,
        #     tech_stack=recommended_tech
        # )
        
        # # Combine tasks with their prompts
        # task_prompts = prompts_result.get("taskPrompts", [])
        # for task in tasks:
        #     task_id = task.get("id")
        #     matching_prompt = next((tp for tp in task_prompts if tp.get("taskId") == task_id), None)
            
        #     if matching_prompt:
        #         task["prompt"] = matching_prompt.get("prompt", "")
                
        #         # Add prompts to subtasks
        #         subtask_prompts = matching_prompt.get("subtaskPrompts", [])
        #         for subtask in task.get("subtasks", []):
        #             subtask_id = subtask.get("id")
        #             matching_subtask_prompt = next((sp for sp in subtask_prompts if sp.get("subtaskId") == subtask_id), None)
                    
        #             if matching_subtask_prompt:
        #                 subtask["prompt"] = matching_subtask_prompt.get("prompt", "")
        
        return {
            "success": True,
            "data": tasks,  
            "tech_stack_recommendation": tech_stack_recommendation
        }
        
    except Exception as e:
        print(f"Error in generate_tasks endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 