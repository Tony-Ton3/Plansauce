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
        # Set up the LLM directly
        self.llm = LLM(
            model="anthropic/claude-3-sonnet-20240229",
            temperature=0.7
        )

    def generate_tasks(self, project_description: str, tech_stack: List[str] = None, project_type: str = "web") -> Dict[str, Any]:
        """Generate tasks for a project using CrewAI with Claude"""
        tech_stack = tech_stack or []
        
        try:
            # Create a simple task generation agent
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
            
            # Create task for the agent
            task = Task(
                description=dedent(f"""
                    Create a task breakdown for the following project:
                    Project: {project_description}
                    Tech Stack: {', '.join(tech_stack)}
                    Type: {project_type}
                    
                    Break this down into 3-5 main tasks, each with 2-3 subtasks.
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
                """),
                expected_output="A JSON object containing task breakdown for the project",
                agent=agent
            )

            # Create crew with single agent
            crew = Crew(
                agents=[agent],
                tasks=[task],
                verbose=True
            )

            # Run the crew
            result = crew.kickoff()
            print(f"Raw result from CrewAI: {result}")
            
            # Parse the result - handle CrewOutput object
            result_str = str(result)
            try:
                tasks_data = json.loads(result_str)
            except json.JSONDecodeError:
                # If it's not valid JSON, try to extract JSON from the string
                import re
                json_match = re.search(r'(\{[\s\S]*\})', result_str)
                if json_match:
                    try:
                        tasks_data = json.loads(json_match.group(1))
                    except json.JSONDecodeError:
                        # Last resort - eval (use with caution)
                        tasks_data = eval(json_match.group(1))
                else:
                    raise ValueError("Could not extract valid JSON from result")
            
            # Calculate metrics from the parsed data
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