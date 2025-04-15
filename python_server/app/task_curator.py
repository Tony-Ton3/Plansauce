from crewai import Agent, Task, Crew, LLM
from textwrap import dedent
import os
import json
from typing import List, Dict, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class TaskGenerationCrew:
    def __init__(self):
        self.llm = LLM(
            model="gemini/gemini-2.0-flash",
            temperature=0.7,
            api_key=os.getenv("GEMINI_API_KEY")
        )

    def generate_tasks(self, project_description, priority, tech_context, project_type) -> Dict[str, Any]:
        
        try:
            # Create specialized agent based on priority
            if priority and "Speed" in priority:
                agent = self._create_speed_agent()
                task_description = self._create_speed_task_description(project_description)
            elif priority and "Scalability" in priority:
                agent = self._create_scalability_agent()
                task_description = self._create_scalability_task_description(project_description)
            else:
                agent = self._create_learning_agent()
                task_description = self._create_learning_task_description(project_description)
            
             # Add priority context
            # priority_context = ""
            # if priority:
            #     if "Speed" in priority:
            #         priority_context = "\nSpeed - Focus on rapid development and MVP approach"
            #     elif "Scalability" in priority:
            #         priority_context = "\nScalability - Focus on architecture and future-proofing"
            #     else:
            #         priority_context = "\nLearning - Focus on educational value and skill development"
            
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
            # try to parse the result as json
            try:
                tasks_data = json.loads(result_str)
            except json.JSONDecodeError:
                # if that fails, try to parse the result as json using regex
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
    
    def _create_speed_agent(self) -> Agent:
        return Agent(
            role='Speed-Oriented Task Planner',
            goal='Create rapid development task breakdowns for software project',
            backstory=dedent("""
                You are an expert at rapid prototyping and MVP development.
                You prioritize essential features and quick implementation over perfection.
                You focus on delivering working software quickly with minimal overhead.
                You know how to identify core functionality and defer nice-to-have features.
                You create tasks that can be completed quickly without sacrificing too much quality.
            """),
            llm=self.llm,
            verbose=True
        )
    
    def _create_scalability_agent(self) -> Agent:
        return Agent(
            role='Scalability-Oriented Task Planner',
            goal='Create scalable architecture task breakdowns for software projects',
            backstory=dedent("""
                You are an expert at designing scalable software architectures.
                You prioritize future-proofing and extensibility in your task planning.
                You focus on creating a solid foundation that can grow with the project.
                You understand microservices, distributed systems, and cloud-native architectures.
                You create tasks that ensure the system can handle growth in users, data, and features.
            """),
            llm=self.llm,
            verbose=True
        )
    
    def _create_learning_agent(self) -> Agent:
        return Agent(
            role='Learning-Oriented Task Planner',
            goal='Create educational task breakdowns for software projects',
            backstory=dedent("""
                You are an expert at creating educational project plans.
                You prioritize learning outcomes and skill development in your task planning.
                You focus on breaking down complex concepts into digestible learning steps.
                You understand how to incorporate best practices and industry standards into learning tasks.
                You create tasks that build knowledge progressively with appropriate challenges.
            """),
            llm=self.llm,
            verbose=True
        )
    
    def _create_speed_task_description(self, project_description: str) -> str:
        return dedent(f"""
            Create a rapid development task breakdown for the following project:
            {project_description}
            
            Break this down into a sufficient number of main tasks, each with appropriate subtasks.
            
            IMPORTANT GUIDELINES:
            1. Make each task and subtask HIGHLY ACTIONABLE with specific instructions.
            2. A user should be able to complete each task/subtask without needing additional information.
            3. Include technical details and specific steps in each task/subtask.
            4. If specific technologies are mentioned, include relevant technical details.
            5. Focus on essential features and quick implementation:
               - Prioritize core functionality over nice-to-have features
               - Suggest simpler implementations that can be completed quickly
               - Defer complex features that aren't critical for the MVP
               - Focus on getting a working prototype as soon as possible
            6. Create as many tasks as needed to fully build out the project - don't limit yourself to a specific number.
            7. Each task and subtask should be exactly ONE SENTENCE in length - be concise and clear.
            8. If a subtask involves a significant amount of work or multiple steps, consider making it a main task instead.
            9. Ensure task complexity is appropriate - complex tasks should be broken down into smaller, more manageable tasks.
            10. Use clear, non-technical language for task names - avoid jargon and complex terminology.
            11. Make task names descriptive but simple - a non-technical person should understand what needs to be done.
            12. Keep task names BRIEF - use 5-10 words maximum for each task name.
            13. Start task names with action verbs
            
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
    
    def _create_scalability_task_description(self, project_description: str) -> str:
        return dedent(f"""
            Create a scalability-focused task breakdown for the following project:
            {project_description}
            
            Break this down into a sufficient number of main tasks, each with appropriate subtasks.
            
            IMPORTANT GUIDELINES:
            1. Make each task and subtask HIGHLY ACTIONABLE with specific instructions.
            2. A user should be able to complete each task/subtask without needing additional information.
            3. Include technical details and specific steps in each task/subtask.
            4. If specific technologies are mentioned, include relevant technical details.
            5. Focus on architecture planning and future-proofing:
               - Design for scalability from the beginning
               - Include tasks for proper separation of concerns
               - Consider microservices or modular architecture where appropriate
               - Plan for database scaling and optimization
               - Include tasks for monitoring, logging, and performance optimization
               - Consider cloud-native approaches and containerization
            6. Create as many tasks as needed to fully build out the project - don't limit yourself to a specific number.
            7. Each task and subtask should be exactly ONE SENTENCE in length - be concise and clear.
            8. If a subtask involves a significant amount of work or multiple steps, consider making it a main task instead.
            9. Ensure task complexity is appropriate - complex tasks should be broken down into smaller, more manageable tasks.
            10. Use clear, non-technical language for task names - avoid jargon and complex terminology.
            11. Make task names descriptive but simple - a non-technical person should understand what needs to be done.
            12. Keep task names BRIEF - use 5-10 words maximum for each task name.
            13. Start task names with action verbs
            
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
    
    def _create_learning_task_description(self, project_description: str) -> str:
        return dedent(f"""
            Create a learning-focused task breakdown for the following project:
            {project_description}
            
            Break this down into a sufficient number of main tasks, each with appropriate subtasks.
            
            IMPORTANT GUIDELINES:
            1. Make each task and subtask HIGHLY ACTIONABLE with specific instructions.
            2. A user should be able to complete each task/subtask without needing additional information.
            3. Include technical details and specific steps in each task/subtask.
            4. If specific technologies are mentioned, include relevant technical details.
            5. Focus on educational resources and learning milestones:
               - Include tasks for researching and learning new technologies
               - Break down complex concepts into digestible learning steps
               - Include tasks for practicing and applying new skills
               - Suggest resources for learning (documentation, tutorials, courses)
               - Include tasks for code review and feedback
               - Focus on best practices and industry standards
            6. Create as many tasks as needed to fully build out the project - don't limit yourself to a specific number.
            7. Each task and subtask should be exactly ONE SENTENCE in length - be concise and clear.
            8. If a subtask involves a significant amount of work or multiple steps, consider making it a main task instead.
            9. Ensure task complexity is appropriate - complex tasks should be broken down into smaller, more manageable tasks.
            10. Use clear, non-technical language for task names - avoid jargon and complex terminology.
            11. Make task names descriptive but simple - a non-technical person should understand what needs to be done.
            12. Keep task names BRIEF - use 5-10 words maximum for each task name.
            13. Start task names with action verbs
            
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