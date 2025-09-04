from crewai import Agent, Task, Crew, LLM
from textwrap import dedent
import json
from typing import List, Dict, Any

class PromptGenerationCrew:
    def __init__(self):
        self.llm = LLM(
            model="gemini/gemini-2.0-flash",
            temperature=0.7
        )
    
    def generate_prompts(self, tasks: List[Dict[str, Any]], tech_stack: List[str] = None) -> Dict[str, Any]:
        """
        Generate detailed prompts for each task that users can use with their own LLM
        to learn more about how to implement the feature.
        
        Args:
            tasks: List of tasks with their subtasks
            tech_stack: Optional list of technologies to use in the project
            
        Returns:
            Dictionary with tasks and their corresponding prompts
        """
        try:
            agent = Agent(
                role='Prompt Engineer',
                goal='Create detailed, educational prompts for software development tasks',
                backstory=dedent("""
                    You are an expert at creating educational prompts for software development.
                    You understand how to break down complex tasks into learnable components.
                    You create prompts that help developers understand not just what to do, but why and how.
                """),
                llm=self.llm,
                verbose=True
            )
            
            # Convert tasks to a string representation for the prompt
            tasks_str = json.dumps(tasks, indent=2)
            tech_stack_str = ", ".join(tech_stack) if tech_stack else "Not specified"
            
            task_description = dedent(f"""
                Create detailed, educational prompts for the following software development tasks:
                
                {tasks_str}
                
                Technologies to consider: {tech_stack_str}
                
                For each task and subtask, create a detailed prompt that:
                1. Explains the concept behind the task
                2. Provides context on why this task is important
                3. Includes specific technical details and best practices
                4. Suggests resources for learning more
                5. Provides examples or code snippets where appropriate
                
                Format the response as a JSON object with this structure:
                {{
                    "taskPrompts": [
                        {{
                            "taskId": "task-1",
                            "prompt": "Detailed prompt for the main task",
                            "subtaskPrompts": [
                                {{
                                    "subtaskId": "subtask-1-1",
                                    "prompt": "Detailed prompt for the subtask"
                                }}
                            ]
                        }}
                    ]
                }}
                
                Make each prompt comprehensive enough that a developer could copy and paste it into their own LLM
                to get detailed guidance on how to implement the feature.
            """)
            
            task = Task(
                description=task_description,
                expected_output="A JSON object containing detailed prompts for each task and subtask",
                agent=agent
            )
            
            crew = Crew(
                agents=[agent],
                tasks=[task],
                verbose=True
            )
            
            result = crew.kickoff()
            print(f"Raw result from PromptGenerationCrew: {result}")
            
            result_str = str(result)
            try:
                prompts_data = json.loads(result_str)
            except json.JSONDecodeError:
                import re
                json_match = re.search(r'(\{[\s\S]*\})', result_str)
                if json_match:
                    try:
                        prompts_data = json.loads(json_match.group(1))
                    except json.JSONDecodeError:
                        prompts_data = eval(json_match.group(1))
                else:
                    raise ValueError("Could not extract valid JSON from result")
            
            return prompts_data
            
        except Exception as e:
            print(f"Error generating prompts: {str(e)}")
            return {
                "error": str(e),
                "taskPrompts": []
            } 