from crewai import Agent, Task, Crew, Process, LLM
from crewai.tools import BaseTool
from typing import List, Dict, Any, Optional
import json
import os
import uuid
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class BraveSearchTool(BaseTool):
    name: str = "brave_search"
    description: str = "Search for technology information using Brave Search API"
    api_key: Optional[str] = None
    
    def __init__(self, api_key: Optional[str] = None):
        super().__init__()
        self.api_key = api_key
    
    def _run(self, query: str) -> str:
        if not self.api_key:
            print("\n=== Brave Search: No API key provided ===")
            return "Brave Search API key not provided. Using internal knowledge only."
        
        try:
            print(f"\n=== Brave Search Query: {query} ===")
            import requests
            url = "https://api.search.brave.com/res/v1/web/search"
            params = {
                "q": query,
                "count": 5  # Limit to 5 results
            }
            headers = {
                "Accept": "application/json",
                "X-Subscription-Token": self.api_key.replace("brave_", "")  # Remove the prefix
            }
            response = requests.get(url, params=params, headers=headers)
            results = response.json()
            
            # Format the results
            formatted_results = []
            print("\n=== Brave Search Results ===")
            for result in results.get("web", {}).get("results", []):
                title = result.get('title', 'No title')
                url = result.get('url', 'No URL')
                description = result.get('description', 'No description')
                print(f"\nTitle: {title}")
                print(f"URL: {url}")
                print(f"Description: {description}")
                formatted_results.append(f"Title: {title}\nLink: {url}\nDescription: {description}\n")
            
            print("\n=== End of Brave Search Results ===")
            return "\n".join(formatted_results)
        except Exception as e:
            print(f"\n=== Brave Search Error: {str(e)} ===")
            return "Error performing web search. Using internal knowledge only."

class TechStackCuratorCrew:
    """
    A crew that curates a tech stack based on user preferences and project priorities.
    Uses the user's known technologies as a baseline and finds complementary technologies
    based on project priority.
    """
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.llm = LLM(
            model="gemini/gemini-2.0-flash",
            temperature=0.7,
            api_key=os.getenv("GEMINI_API_KEY")
        )
        self.search_tool = BraveSearchTool(api_key=api_key)
        self.agents = self._create_agents()
        
    def _create_agents(self) -> Dict[str, Agent]:
        # Research agent to gather information about technologies
        research_agent = Agent(
            role="Technology Research Specialist",
            goal="Research and gather detailed information about modern development technologies using Brave Search API",
            backstory="""You are an expert development technology researcher with deep knowledge of the software development ecosystem.
            You have years of experience tracking emerging technologies, frameworks, and tools.
            You know how to find the most relevant and up-to-date information about any development technology.
            You are skilled at using the search_web method to gather comprehensive information about technologies.
            When you see a search_web command in the task description, you execute it to gather real-time information.""",
            verbose=True,
            allow_delegation=False,
            llm=self.llm,
            tools=[self.search_tool]  # Use the tool instance instead of the method
        )
        
        curator_agent = Agent(
            role="Tech Stack Curator",
            goal="Create a comprehensive and well-balanced tech stack recommendation",
            backstory="""You are a tech stack curator with years of experience designing optimal development technology stacks.
            You understand the strengths and weaknesses of different technologies and how they complement each other.
            You can create tech stacks that are tailored to specific project needs and user preferences.""",
            verbose=True,
            allow_delegation=False,
            llm=self.llm
        )
        
        return {
            "research": research_agent,
            "curator": curator_agent
        }
    
    def curate_tech_stack(
        self, 
        known_tech: List[str], 
        disliked_tech: List[str], 
        project_type: str,
        priority: str
    ) -> Dict[str, Any]:
        print("\n=== Starting Tech Stack Curation ===")
        print(f"Project Type: {project_type}")
        print(f"Priority: {priority}")
        print(f"Known Technologies: {', '.join(known_tech) if known_tech else 'None'}")
        print(f"Technologies to Avoid: {', '.join(disliked_tech) if disliked_tech else 'None'}")
        
        # Create tasks for the crew
        research_task = Task(
            description=f"""
            Research modern development technologies for a {project_type} project with {priority} priority.
            
            User's known technologies: {', '.join(known_tech) if known_tech else 'None specified'}
            Technologies to avoid: {', '.join(disliked_tech) if disliked_tech else 'None specified'}
            
            For each technology category (frontend, backend, database, deployment), follow these steps:
            
            1. First, search for relevant technologies using the Brave Search API:
               - For frontend: search_web("best frontend frameworks for {project_type} {priority}")
               - For backend: search_web("best backend technologies for {project_type} {priority}")
               - For database: search_web("best databases for {project_type} {priority}")
               - For deployment: search_web("best deployment solutions for {project_type} {priority}")
            
            2. Analyze the search results to:
               - Find technologies that complement the user's known technologies
               - Identify options that align with the project's {priority} priority
               - Select technologies well-suited for a {project_type} project
               - Evaluate documentation and community support
            
            3. For each selected technology, gather:
               - Description and purpose
               - Key features and capabilities
               - Pros and cons
               - Learning resources and documentation
               - Community size and activity
               - Integration with other technologies
            
            Return your findings as a structured list of technologies with detailed information.
            """,
            expected_output="A structured list of technologies with detailed information about each technology's features, pros, cons, and learning resources.",
            agent=self.agents["research"]
        )
        
        curation_task = Task(
            description=f"""
            Create a comprehensive tech stack recommendation based on the research findings.
            
            User's known technologies: {', '.join(known_tech) if known_tech else 'None specified'}
            Technologies to avoid: {', '.join(disliked_tech) if disliked_tech else 'None specified'}
            Project type: {project_type}
            Priority: {priority}
            
            The tech stack should:
            1. Build on the user's known technologies when possible
            2. Avoid technologies the user dislikes
            3. Optimize for the project's {priority} priority
            4. Be well-suited for a {project_type} project
            
            For each recommended technology, provide:
            - Why it's a good fit for this project and user
            - How it complements the user's existing knowledge
            - Learning resources for technologies new to the user
            - Integration approach with other recommended technologies
            
            Format your recommendation as a structured JSON object with the following structure:
            {{
                "frontend": [
                    {{
                        "name": "Technology name",
                        "description": "Brief description",
                        "key_features": ["Feature 1", "Feature 2", ...],
                        "pros": ["Pro 1", "Pro 2", ...],
                        "cons": ["Con 1", "Con 2", ...],
                        "learning_resources": ["Resource 1", "Resource 2", ...],
                        "complements": ["Technology 1", "Technology 2", ...]
                    }},
                    ...
                ],
                "backend": [...],
                "database": [...],
                "deployment": [...],
                "summary": "Overall recommendation summary"
            }}
            """,
            expected_output="A comprehensive tech stack recommendation in JSON format with detailed explanations for each technology choice.",
            agent=self.agents["curator"]
        )
        
        # Create and run the crew
        print("\n=== Creating Research and Curation Crew ===")
        crew = Crew(
            agents=list(self.agents.values()),
            tasks=[research_task, curation_task],
            process=Process.sequential  # Run tasks in sequence
        )
        
        print("\n=== Starting Tech Stack Research ===")
        result = crew.kickoff()
        print("\n=== Research Complete, Processing Results ===")
        
        # Extract the JSON from the result
        try:
            # Find JSON in the result string
            json_start = result.find('{')
            json_end = result.rfind('}') + 1
            if json_start >= 0 and json_end > json_start:
                json_str = result[json_start:json_end]
                tech_stack = json.loads(json_str)
                
                print("\n=== Tech Stack Recommendation ===")
                print(f"Summary: {tech_stack.get('summary', 'No summary provided')}")
                
                for category in ["frontend", "backend", "database", "deployment"]:
                    if category in tech_stack:
                        print(f"\n{category.upper()}:")
                        for tech in tech_stack[category]:
                            print(f"\n  {tech.get('name', 'Unnamed Technology')}:")
                            print(f"    Description: {tech.get('description', 'No description')}")
                            print(f"    Key Features: {', '.join(tech.get('key_features', []))}")
                            print(f"    Pros: {', '.join(tech.get('pros', []))}")
                            print(f"    Cons: {', '.join(tech.get('cons', []))}")
                            print(f"    Learning Resources: {', '.join(tech.get('learning_resources', []))}")
                            print(f"    Complements: {', '.join(tech.get('complements', []))}")
                
                print("\n=== Tech Stack Curation Complete ===")
                return tech_stack
            else:
                print("\n=== Error: No JSON found in result ===")
                print("Raw result:", result)
                return {
                    "error": "Could not extract JSON from result",
                    "raw_result": result
                }
        except Exception as e:
            print(f"\n=== Error parsing tech stack JSON: {str(e)} ===")
            print("Raw result:", result)
            return {
                "error": f"Error parsing tech stack JSON: {str(e)}",
                "raw_result": result
            } 