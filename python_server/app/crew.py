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

    def generate_tasks(self, project_description: str, tech_stack: List[str] = None, project_type: str = "web", should_recommend_tech_stack: bool = None) -> Dict[str, Any]:
        tech_stack = tech_stack or []
        
        if should_recommend_tech_stack is None:
            should_recommend_tech_stack = len(tech_stack) == 0
        
        try:
            agent = Agent(
                role='Task Planner',
                goal='Create detailed task breakdowns for software projects',
                backstory=dedent("""
                    You analyze project requirements and create structured task breakdowns.
                    You think step-by-step and organize work logically.
                """),
                llm=self.llm,
                verbose=True
            )
            
            if should_recommend_tech_stack:
                task_description = dedent(f"""
                    Create a task breakdown for the following project:
                    {project_description}
                    
                    First, recommend an appropriate tech stack for this project based on the requirements.
                    Then break this down into 3-5 main tasks, each with 2-3 subtasks.
                    
                    Format the response as a JSON object with this structure:
                    {{
                        "tasks": [
                            {{
                                "id": "task-1",
                                "text": "Task description",
                                "completed": false,
                                "subtasks": [
                                    {{
                                        "id": "subtask-1-1",
                                        "text": "Subtask description",
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
                    
                    Break this down into 3-5 main tasks, each with 2-3 subtasks.
                    If the user has specified technologies they want to use, optimize the tasks for these technologies.
                    
                    Format the response as a JSON object with this structure:
                    {{
                        "tasks": [
                            {{
                                "id": "task-1",
                                "text": "Task description",
                                "completed": false,
                                "subtasks": [
                                    {{
                                        "id": "subtask-1-1",
                                        "text": "Subtask description",
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