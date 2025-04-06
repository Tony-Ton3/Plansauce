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

    def generate_tasks(self, project_description: str, tech_stack: List[str] = None, priority: str = None) -> Dict[str, Any]:
        tech_stack = tech_stack or []
        
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
            
            # Determine task structure based on priority
            task_granularity = "4-6"  # default
            subtask_granularity = "2-3"
            
            if priority:
                if "Speed" in priority:
                    task_granularity = "3-4"  # Fewer tasks for speed
                    subtask_granularity = "2-3"
                elif "Scalability" in priority:
                    task_granularity = "5-7"  # More detailed for scalability
                    subtask_granularity = "3-4"
                elif "Learning" in priority:
                    task_granularity = "4-6"  # Balanced for learning
                    subtask_granularity = "3-4"  # More detailed subtasks for learning
            
            task_description = dedent(f"""
                Create a task breakdown for the following project:
                {project_description}
                
                Break this down into {task_granularity} main tasks, each with {subtask_granularity} subtasks.
                
                IMPORTANT GUIDELINES:
                1. Make each subtask HIGHLY ACTIONABLE with specific instructions.
                2. A user should be able to complete each subtask without needing additional information.
                3. Include technical details and specific steps in each subtask.
                4. If specific technologies are mentioned, include relevant technical details.
                5. Adjust task complexity based on the priority:
                   - For Speed: Focus on essential features and quick implementation
                   - For Scalability: Include architecture planning and future-proofing
                   - For Learning: Include educational resources and learning milestones
                
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