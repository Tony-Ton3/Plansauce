from crewai import Agent, Task, Crew, LLM, Process
from textwrap import dedent
import os
import json
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

class TaskGenerationCrew:
    def __init__(self):
        self.llm = LLM(
            model="gemini/gemini-2.0-flash",
            temperature=0.7,
            api_key=os.getenv("GEMINI_API_KEY")
        )
        
        self.category_agents = {
            "setup": self._create_setup_agent(),
            "frontend": self._create_frontend_agent(),
            "backend": self._create_backend_agent(), 
            "testing": self._create_testing_agent(),
            "deploy": self._create_deploy_agent(),
            "maintain": self._create_maintain_agent()
        }

        self.category_mapping = {
            "setup": "setup",
            "frontend": "frontend",
            "backend": "backend",
            "testing": "testing",
            "deploy": "deploy",
            "maintain": "maintain"
        }

    def generate_tasks(self, project_description, priority, tech_stack_by_category, project_type) -> Dict[str, Any]:
        try:
            if priority and "Speed" in priority:
                coordinator_agent = self._create_speed_agent()
            elif priority and "Scalability" in priority:
                coordinator_agent = self._create_scalability_agent()
            else:
                coordinator_agent = self._create_speed_agent()  # default to speed if no priority
            
            category_tasks = []
            
            #ensure all core categories are included
            required_categories = ["setup", "frontend", "backend", "testing", "deploy", "maintain"]
            
            #initialize empty tech stacks for missing categories
            for category in required_categories:
                if category not in tech_stack_by_category:
                    tech_stack_by_category[category] = []
            
            #create tasks for all required categories
            for category in required_categories:
                if category not in self.category_agents:
                    continue
                    
                category_task = self._create_category_task(
                    category=category,
                    project_description=project_description,
                    priority=priority,
                    tech_stack=tech_stack_by_category.get(category, []),
                    project_type=project_type,
                    agent=self.category_agents[category]
                )
                category_tasks.append(category_task)
            
            #create the crew with coordinator agent first, followed by category agents
            all_agents = [coordinator_agent] + [self.category_agents[cat] for cat in required_categories if cat in self.category_agents]
            
            crew = Crew(
                agents=all_agents,
                tasks=category_tasks,
                verbose=True,
                process=Process.sequential
            )
            
            results = crew.kickoff()
            combined_tasks = self._combine_category_results(results)
            tasks_list = combined_tasks.get("tasks", [])
            
            task_count = len(tasks_list)
            subtask_count = sum(len(task.get("subtasks", [])) for task in tasks_list)
            
            return {
                "tasks": tasks_list,
                "taskCount": task_count,
                "subtaskCount": subtask_count,
                "projectType": project_type
            }
            
        except Exception as e:
            return {
                "error": str(e),
                "tasks": [],
                "taskCount": 0,
                "subtaskCount": 0
            }

    def _combine_category_results(self, crew_output) -> Dict[str, Any]:
        all_tasks = []

        if not crew_output or not hasattr(crew_output, 'tasks_output') or not crew_output.tasks_output:
            if hasattr(crew_output, 'raw'):
                results_str = str(crew_output.raw)
                import re
                import json
                json_match = re.search(r'```json\s*(\{[\s\S]*?\})\s*```', results_str)
                if json_match:
                    try:
                        json_str = json_match.group(1)
                        parsed_json = json.loads(json_str)
                        if isinstance(parsed_json, dict) and "tasks" in parsed_json:
                            tasks_from_raw = parsed_json["tasks"]
                            all_tasks.extend(tasks_from_raw)
                    except json.JSONDecodeError:
                        pass
                    except Exception:
                        pass

            if not all_tasks:
                return {"tasks": []}
        else:
            import re
            import json

            for task_output in crew_output.tasks_output:
                if not hasattr(task_output, 'raw'):
                    continue

                results_str = str(task_output.raw)
                json_match = re.search(r'```json\s*(\{[\s\S]*?\})\s*```', results_str)
                if json_match:
                    try:
                        json_str = json_match.group(1)
                        parsed_json = json.loads(json_str)
                        if isinstance(parsed_json, dict) and "tasks" in parsed_json:
                            tasks_from_agent = parsed_json["tasks"]
                            all_tasks.extend(tasks_from_agent)
                    except json.JSONDecodeError:
                        pass
                    except Exception:
                        pass

        if not all_tasks:
            return {"tasks": []}

        final_tasks = []
        for i, task in enumerate(all_tasks):
            if isinstance(task, dict):
                task["id"] = f"task-{i+1}"
                if "category" not in task:
                    task["category"] = "unknown"
                subtasks = task.get("subtasks", [])
                if isinstance(subtasks, list):
                    for j, subtask in enumerate(subtasks):
                        if isinstance(subtask, dict):
                            subtask["id"] = f"subtask-{i+1}-{j+1}"
                final_tasks.append(task)

        return {"tasks": final_tasks}
    
    def _create_category_task(self, category, project_description, priority, tech_stack, project_type, agent) -> Task:
        priority_context = ""
        if priority:
            if "Speed" in priority:
                priority_context = "Speed - Focus on rapid development and MVP approach"
            elif "Scalability" in priority:
                priority_context = "Scalability - Focus on architecture and future-proofing"
        
        tech_details = []
        for tech in tech_stack:
            if isinstance(tech, dict) and "name" in tech and "description" in tech:
                tech_details.append(f"- {tech['name']}: {tech['description']}")
                if "docLink" in tech:
                    tech_details.append(f"  Documentation: {tech['docLink']}")
        
        tech_stack_str = "\n".join(tech_details) if tech_details else "No specific technologies specified"
        task_category = self.category_mapping.get(category, category)
        
        return Task(
            description=dedent(f"""
                Create a task breakdown for the {category} category of the following project:
                
                PROJECT DESCRIPTION:
                {project_description}
                
                PROJECT TYPE:
                {project_type}
                
                PRIORITY:
                {priority_context}
                
                TECHNOLOGIES FOR THIS CATEGORY:
                {tech_stack_str}
                
                IMPORTANT GUIDELINES:
                1. Make each task and subtask HIGHLY ACTIONABLE with specific instructions.
                2. A user should be able to complete each task/subtask without needing additional information.
                3. Include technical details and specific steps in each task/subtask.
                4. FOCUS ONLY ON THE "{category.upper()}" CATEGORY.
                5. Tailor tasks specifically to the technologies listed above.
                6. Tasks should incorporate the specific technologies mentioned above.
                7. Include tasks for learning/setting up each technology if the priority is learning-focused.
                8. Each task and subtask should be exactly ONE SENTENCE in length - be concise and clear.
                9. Start task names with action verbs.
                10. Keep task names BRIEF - use 5-10 words maximum for each task name.
                
                Format the response as a JSON object with this structure:
                {{
                    "tasks": [
                        {{
                            "id": "task-1",
                            "text": "Task description",
                            "completed": false,
                            "category": "{task_category}",
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
            """),
            expected_output=f"A JSON object containing task breakdown for the {category} category",
            agent=agent
        )
    
    #agent for speed and mvp
    def _create_speed_agent(self) -> Agent:
        return Agent(
            role='Speed-Oriented Task Coordinator',
            goal='Coordinate rapid development task breakdowns',
            backstory=dedent("""
                You are an expert at rapid prototyping and MVP development.
                You prioritize essential features and quick implementation over perfection.
                You focus on delivering working software quickly with minimal overhead.
                You know how to identify core functionality and defer nice-to-have features.
            """),
            llm=self.llm,
            verbose=True
        )
    
    #agent for scalability and future proofing
    def _create_scalability_agent(self) -> Agent:
        return Agent(
            role='Scalability-Oriented Task Coordinator',
            goal='Coordinate scalable architecture task breakdowns',
            backstory=dedent("""
                You are an expert at designing scalable software architectures.
                You prioritize future-proofing and extensibility in your task planning.
                You focus on creating a solid foundation that can grow with the project.
                You understand microservices, distributed systems, and cloud-native architectures.
            """),
            llm=self.llm,
            verbose=True
        )
    
    def _create_setup_agent(self) -> Agent:
        return Agent(
            role='Development Setup Specialist',
            goal='Create environment setup and configuration tasks',
            backstory=dedent("""
                You excel at establishing development environments and toolchains.
                You know how to create tasks for setting up repositories, CI/CD pipelines, and development tools.
                You understand the importance of standardizing development environments across teams.
                You create tasks that incorporate the specific setup tools recommended in the tech stack.
            """),
            llm=self.llm,
            verbose=True
        )
    
    def _create_frontend_agent(self) -> Agent:
        return Agent(
            role='Frontend Development Expert',
            goal='Generate frontend development task breakdown',
            backstory=dedent("""
                You're experienced in UI/UX implementation and frontend architecture.
                You understand modern frontend frameworks and best practices.
                You know how to break down complex UI requirements into manageable tasks.
                You create tasks that incorporate the specific frontend technologies recommended in the tech stack.
            """),
            llm=self.llm,
            verbose=True
        )
    
    def _create_backend_agent(self) -> Agent:
        return Agent(
            role='Backend Development Architect',
            goal='Create detailed backend development tasks',
            backstory=dedent("""
                You specialize in server-side logic, APIs, and data management.
                You understand database design, API architecture, and server optimization.
                You know how to create tasks for implementing secure and efficient backend systems.
                You create tasks that incorporate the specific backend technologies recommended in the tech stack.
            """),
            llm=self.llm,
            verbose=True
        )
    
    def _create_testing_agent(self) -> Agent:
        return Agent(
            role='QA & Testing Strategist',
            goal='Develop comprehensive testing plans and tasks',
            backstory=dedent("""
                You ensure code quality through proper testing methodologies.
                You understand various testing approaches including unit, integration, and end-to-end testing.
                You know how to create tasks for implementing effective test coverage and QA processes.
                You create tasks that incorporate the specific testing tools recommended in the tech stack.
            """),
            llm=self.llm,
            verbose=True
        )
    
    def _create_deploy_agent(self) -> Agent:
        return Agent(
            role='DevOps & Deployment Expert',
            goal='Create deployment pipeline and infrastructure tasks',
            backstory=dedent("""
                You specialize in CI/CD pipelines and deployment strategies.
                You understand cloud infrastructure, containerization, and automated deployments.
                You know how to create tasks for setting up reliable and secure deployment processes.
                You create tasks that incorporate the specific deployment technologies recommended in the tech stack.
            """),
            llm=self.llm,
            verbose=True
        )
    
    def _create_maintain_agent(self) -> Agent:
        return Agent(
            role='Maintenance & Support Planner',
            goal='Plan maintenance, monitoring and support tasks',
            backstory=dedent("""
                You focus on long-term project health and maintenance.
                You understand monitoring, logging, and troubleshooting best practices.
                You know how to create tasks for implementing effective maintenance and support processes.
                You create tasks that incorporate the specific maintenance tools recommended in the tech stack.
            """),
            llm=self.llm,
            verbose=True
        )