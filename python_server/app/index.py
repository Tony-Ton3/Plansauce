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

def infer_project_type(description: str, known_tech: List[str] = None) -> str:
    """
    Infer the project type from the project description and known technologies.
    
    Args:
        description: The project description
        known_tech: List of technologies the user is familiar with
        
    Returns:
        str: The inferred project type
    """
    description_lower = description.lower()
    known_tech = known_tech or []
    known_tech_lower = [tech.lower() for tech in known_tech]
    
    # Check for mobile app indicators
    mobile_indicators = ["mobile app", "ios app", "android app", "react native", "flutter", "mobile application"]
    if any(term in description_lower for term in mobile_indicators):
        return "mobile app"
    
    # Check for data science indicators
    data_science_indicators = ["data science", "machine learning", "ml", "ai", "artificial intelligence", "data analysis", "data visualization"]
    if any(term in description_lower for term in data_science_indicators):
        return "data science"
    
    # Check for backend service indicators
    backend_indicators = ["api", "backend", "server", "microservice", "service", "rest api", "graphql"]
    if any(term in description_lower for term in backend_indicators):
        return "backend service"
    
    # Check for desktop app indicators
    desktop_indicators = ["desktop app", "electron", "windows app", "mac app", "linux app"]
    if any(term in description_lower for term in desktop_indicators):
        return "desktop app"
    
    # If no clear indicators in description, infer from known technologies
    if known_tech:
        # Check for mobile development technologies
        mobile_tech = ["react native", "flutter", "swift", "kotlin", "android", "ios", "xamarin", "ionic"]
        if any(tech in known_tech_lower for tech in mobile_tech):
            return "mobile app"
            
        # Check for data science technologies
        data_tech = ["python", "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy", "jupyter", "r", "matplotlib", "seaborn"]
        if any(tech in known_tech_lower for tech in data_tech):
            return "data science"
            
        # Check for backend technologies
        backend_tech = ["node.js", "express", "django", "flask", "spring", "laravel", "rails", "graphql", "postgresql", "mongodb"]
        if any(tech in known_tech_lower for tech in backend_tech):
            return "backend service"
            
        # Check for desktop technologies
        desktop_tech = ["electron", "qt", "wxpython", "tkinter", "javafx", "swing", "gtk"]
        if any(tech in known_tech_lower for tech in desktop_tech):
            return "desktop app"
    
    # Default to web app if no specific type is detected
    return "web app"

def infer_experience_level(known_tech: List[str]) -> str:
    """
    Infer the user's experience level based on their known technologies.
    
    Args:
        known_tech: List of technologies the user is familiar with
        
    Returns:
        str: The inferred experience level
    """
    if not known_tech:
        return "Beginner"
        
    # Count technologies in different categories
    frontend_tech = ["html", "css", "javascript", "react", "vue", "angular", "svelte", "next.js", "gatsby"]
    backend_tech = ["node.js", "express", "django", "flask", "spring", "laravel", "rails", "graphql"]
    database_tech = ["sql", "postgresql", "mysql", "mongodb", "redis", "firebase", "dynamodb"]
    devops_tech = ["docker", "kubernetes", "aws", "azure", "gcp", "ci/cd", "jenkins", "github actions"]
    
    known_tech_lower = [tech.lower() for tech in known_tech]
    
    # Count technologies in each category
    frontend_count = sum(1 for tech in frontend_tech if any(tech in kt for kt in known_tech_lower))
    backend_count = sum(1 for tech in backend_tech if any(tech in kt for kt in known_tech_lower))
    database_count = sum(1 for tech in database_tech if any(tech in kt for kt in known_tech_lower))
    devops_count = sum(1 for tech in devops_tech if any(tech in kt for kt in known_tech_lower))
    
    # Calculate total technologies across categories
    total_tech = frontend_count + backend_count + database_count + devops_count
    
    # Determine experience level
    if total_tech > 15 or (frontend_count > 5 and backend_count > 5 and database_count > 2):
        return "Advanced"
    elif total_tech > 8 or (frontend_count > 3 and backend_count > 3):
        return "Intermediate"
    else:
        return "Beginner"

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
        
        # Infer project type from description and known technologies
        project_type = infer_project_type(description, known_tech)
        print(f"Inferred project type: {project_type}")
        
        # Infer experience level
        experience_level = infer_experience_level(known_tech)
        print(f"Inferred experience level: {experience_level}")
        
        # First, curate the tech stack based on user preferences and project priority
        tech_stack_curator = TechStackCuratorCrew(api_key=os.getenv("BRAVE_API_KEY"))
        tech_stack_recommendation = tech_stack_curator.curate_tech_stack(
            known_tech=known_tech,
            disliked_tech=disliked_tech,
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
        
        # # Create enhanced description with tech context
        # tech_context = ""
        # if known_tech:
        #     tech_context += f"\nPreferred technologies: {', '.join(known_tech)}"
        # if disliked_tech:
        #     tech_context += f"\nTechnologies to avoid: {', '.join(disliked_tech)}"
        # if recommended_tech:
        #     tech_context += f"\nRecommended technologies: {', '.join(recommended_tech)}"
            
        # # Add priority context
        # priority_context = ""
        # if priority:
        #     if "Speed" in priority:
        #         priority_context = "\nPriority: Speed - Focus on rapid development and MVP approach"
        #     elif "Scalability" in priority:
        #         priority_context = "\nPriority: Scalability - Focus on architecture and future-proofing"
        #     else:
        #         priority_context = "\nPriority: Learning - Focus on educational value and skill development"
        
        # # Add user experience context
        # experience_context = f"\nUser Experience Level: {experience_level} (based on {len(known_tech)} known technologies)"
        
        # enhanced_description = f"""
        # Project Description: {description}
        # Project Type: {project_type}
        # {priority_context}
        # {tech_context}
        # {experience_context}
        
        # TASK GENERATION INSTRUCTIONS:
        # - Create tasks that are appropriate for the user's experience level ({experience_level})
        # - Prioritize tasks based on the specified priority (Speed/Scalability/Learning)
        # - Use the recommended technologies in your task generation
        # - When suggesting new technologies, provide clear learning resources and documentation links
        # - If the user has preferred technologies, incorporate them when they're a good fit
        # - If the user has technologies to avoid, ensure they are not included in recommendations
        # - Make each task and subtask highly actionable with specific instructions
        # - Ensure tasks are well-scoped and don't require additional clarification
        # """
        
        # print(f"Enhanced description: {enhanced_description}")
        
        # # Generate tasks
        # crew = TaskGenerationCrew()
        # result = crew.generate_tasks(
        #     project_description=enhanced_description,
        #     priority=priority
        # )
        
        # tasks = result.get("tasks", [])
        
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