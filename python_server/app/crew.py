from crewai import Agent, Task, Crew, LLM
from textwrap import dedent
import os
import json
from typing import List, Dict, Any
#from dotenv import load_dotenv

# Load environment variables
#load_dotenv()

class TaskGenerationCrew:
    def __init__(self):
        self.llm = LLM(
            model="gemini/gemini-2.0-flash",
            temperature=0.7
        )

    def generate_tasks(self, project_description: str, tech_stack: List[str] = None, project_type: str = "web", should_recommend_tech_stack: bool = None, user_background: Dict[str, Any] = None) -> Dict[str, Any]:
        tech_stack = tech_stack or []
        user_background = user_background or {}
        
        if should_recommend_tech_stack is None:
            should_recommend_tech_stack = len(tech_stack) == 0
        
        try:
            agent = Agent(
                role='Task Planner',
                goal='Create detailed task breakdowns for software projects',
                backstory=dedent("""
                    You analyze project requirements and create structured task breakdowns.
                    You think step-by-step and organize work logically.
                    You create actionable, well-scoped tasks that don't require additional clarification.
                """),
                llm=self.llm,
                verbose=True
            )
            
            # Extract relevant user background info
            experience_level = user_background.get('experience', '')
            time_commitment = user_background.get('time_commitment', '')
            risk_tolerance = user_background.get('risk_tolerance', '')
            collaboration = user_background.get('collaboration', '')
            
            # Determine optimal task granularity based on experience
            task_granularity = "3-5"
            subtask_granularity = "2-3"
            
            if "Beginner" in str(experience_level):
                task_granularity = "4-6"
                subtask_granularity = "3-5"
            elif "Advanced" in str(experience_level):
                task_granularity = "3-4"
                subtask_granularity = "2-3"
            
            # Adjust for project scale if available
            project_scale = user_background.get('scale', '')
            if project_scale:
                if "large" in str(project_scale).lower():
                    task_granularity = "5-7"
                elif "small" in str(project_scale).lower():
                    task_granularity = "3-4"
            
            # Create user context section
            user_context = ""
            if any([experience_level, time_commitment, risk_tolerance, collaboration]):
                user_context = dedent(f"""
                    USER BACKGROUND INFORMATION:
                    - Experience Level: {experience_level}
                    - Weekly Time Available: {time_commitment} hours
                    - Priority: {risk_tolerance}
                    - Working Style: {collaboration}
                    
                    Consider this user background when creating tasks. Adjust complexity, scope, and detail based on their experience level.
                    If they have limited time, focus on essential tasks first. Consider their priority between speed, scalability, or learning.
                    Tailor the collaboration aspects based on whether they're working solo or in a team.
                """)
            
            if should_recommend_tech_stack:
                task_description = dedent(f"""
                    Create a task breakdown for the following project:
                    {project_description}
                    
                    {user_context}
                    
                    First, recommend an appropriate tech stack for this project based on the requirements.
                    Then break this down into {task_granularity} main tasks, each with {subtask_granularity} subtasks.
                    
                    IMPORTANT: Make each subtask HIGHLY ACTIONABLE with specific instructions.
                    A user should be able to complete each subtask without needing additional information.
                    Include technical details and specific steps in each subtask.
                    
                    Each task should be categorized into one of these categories:
                    - plan: Plan & Design - Initial requirements, user flows, architecture ideas, wireframes
                    - setup: Setup - Environment configuration, repository initialization, installing core tools
                    - backend: Backend - Server-side logic, API development, database interactions
                    - frontend: Frontend - User interface development, client-side logic
                    - testing: Testing - Writing tests, quality assurance checks
                    - deploy: Deploy - Infrastructure setup, deployment process, going live
                    - maintain: Maintain - Monitoring, updates, bug fixes after launch
                    
                    Format the response as a JSON object with this structure:
                    {{
                        "tasks": [
                            {{
                                "id": "task-1",
                                "text": "Task description",
                                "completed": false,
                                "category": "plan", 
                                "subtasks": [
                                    {{
                                        "id": "subtask-1-1",
                                        "text": "Subtask description with specific actionable details",
                                        "completed": false
                                    }}
                                ]
                            }}
                        ]
                    }}
                """)
            else:
                task_description = dedent(f"""
                    Create a task breakdown for the following project:
                    {project_description}
                    
                    {user_context}
                    
                    Break this down into {task_granularity} main tasks, each with {subtask_granularity} subtasks.
                    If the user has specified technologies they want to use, optimize the tasks for these technologies.
                    
                    IMPORTANT: Make each subtask HIGHLY ACTIONABLE with specific instructions.
                    A user should be able to complete each subtask without needing additional information.
                    Include technical details and specific steps in each subtask.
                    
                    Each task should be categorized into one of these categories:
                    - plan: Plan & Design - Initial requirements, user flows, architecture ideas, wireframes
                    - setup: Setup - Environment configuration, repository initialization, installing core tools
                    - backend: Backend - Server-side logic, API development, database interactions
                    - frontend: Frontend - User interface development, client-side logic
                    - testing: Testing - Writing tests, quality assurance checks
                    - deploy: Deploy - Infrastructure setup, deployment process, going live
                    - maintain: Maintain - Monitoring, updates, bug fixes after launch
                    
                    Format the response as a JSON object with this structure:
                    {{
                        "tasks": [
                            {{
                                "id": "task-1",
                                "text": "Task description",
                                "completed": false,
                                "category": "plan",
                                "subtasks": [
                                    {{
                                        "id": "subtask-1-1",
                                        "text": "Subtask description with specific actionable details",
                                        "completed": false
                                    }}
                                ]
                            }}
                        ]
                    }}
                """)
            
            task = Task(
                description=task_description,
                expected_output="A JSON object containing task breakdown for the project",
                agent=agent
            )

            crew = Crew(
                agents=[agent],
                tasks=[task],
                verbose=True
            )

            result = crew.kickoff()
            print(f"Raw result from CrewAI: {result}")
            
            result_str = str(result)
            try:
                tasks_data = json.loads(result_str)
            except json.JSONDecodeError:
                import re
                json_match = re.search(r'(\{[\s\S]*\})', result_str)
                if json_match:
                    try:
                        tasks_data = json.loads(json_match.group(1))
                    except json.JSONDecodeError:
                        tasks_data = eval(json_match.group(1))
                else:
                    raise ValueError("Could not extract valid JSON from result")
            
            tasks_list = tasks_data.get("tasks", [])
            task_count = len(tasks_list)
            subtask_count = sum(len(task.get("subtasks", [])) for task in tasks_list)
            
            return {
                "tasks": tasks_list,
                "taskCount": task_count,
                "subtaskCount": subtask_count
            }
            
        except Exception as e:
            print(f"Error generating tasks: {str(e)}")
            return {
                "error": str(e),
                "tasks": [],
                "taskCount": 0,
                "subtaskCount": 0
            } 