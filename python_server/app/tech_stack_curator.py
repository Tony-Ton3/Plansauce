from crewai import Agent, Task, Crew, Process, LLM
from crewai.tools import BaseTool
from typing import List, Dict, Any, Optional
import json
import os
import time

class BraveSearchTool(BaseTool):
    name: str = "brave_search"
    description: str = "Search for technology information using Brave Search API"
    api_key: Optional[str] = None
    
    def __init__(self, api_key: Optional[str] = None):
        super().__init__()
        self.api_key = api_key
    
    def _run(self, query: str) -> str:
        if not self.api_key:
            return "Brave Search API key not provided. Using internal knowledge only."
        
        try:
            import requests
            url = "https://api.search.brave.com/res/v1/web/search"
            params = {
                "q": query,
                "count": 3  # Limit to top 3 results
            }
            headers = {
                "Accept": "application/json",
                "X-Subscription-Token": self.api_key.replace("brave_", "")
            }
            response = requests.get(url, params=params, headers=headers)
            results = response.json()
            
            formatted_results = []
            for result in results.get("web", {}).get("results", []):
                title = result.get('title', 'No title')
                url = result.get('url', 'No URL')
                description = result.get('description', 'No description')
                formatted_results.append(f"Title: {title}\nLink: {url}\nDescription: {description}\n")
            
            return "\n".join(formatted_results)
        except Exception as e:
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
        research_agent = Agent(
            role="Technology Research Specialist",
            goal="Research and evaluate tools across all project phases",
            backstory="""You are an expert in researching and evaluating development tools and technologies.
            You excel at finding and evaluating tools for setup, frontend, backend, testing, deployment, and maintenance.
            You understand how different tools complement each other and can identify the best options based on project requirements.""",
            verbose=True,
            allow_delegation=False,
            llm=self.llm,
            tools=[self.search_tool]
        )
        
        curator_agent = Agent(
            role="Tech Stack Curator",
            goal="Create a comprehensive tech stack recommendation",
            backstory="""You are a tech stack curator who excels at creating complete development ecosystems.
            You understand how to structure projects and which tools work best together.
            You create practical, well-reasoned recommendations that consider the team's experience level.""",
            verbose=True,
            allow_delegation=False,
            llm=self.llm
        )
        
        return {
            "research": research_agent,
            "curator": curator_agent
        }
    
    def _validate_response(self, result: Any, max_retries: int = 3) -> Dict[str, Any]:
        """Validate and format the response from the LLM with retry logic."""
        if not result:
            return self._get_default_response("Empty response from LLM")

        for attempt in range(max_retries):
            try:
                #if result is already a dict, use it directly
                if isinstance(result, dict):
                    return result

                #try to parse as JSON if it's a string
                if isinstance(result, str):
                    parsed = json.loads(result)
                    if isinstance(parsed, dict):
                        return parsed

                #if we get here, the response is invalid
                if attempt < max_retries - 1:
                    time.sleep(1)  #wait before retrying
                    continue
                
                return self._get_default_response("Invalid response format from LLM")
                
            except Exception as e:
                if attempt < max_retries - 1:
                    time.sleep(1)
                    continue
                return self._get_default_response(f"Error processing response: {str(e)}")
                
            return self._get_default_response("Max retries exceeded")
    
    def _get_default_response(self, error_message: str) -> Dict[str, Any]:
        """Return a default response structure with error message."""
        return {
            "error": error_message,
            "type": "Web Application",
            "setup": [],
            "frontend": [],
            "backend": [],
            "testing": [],
            "deploy": [],
            "maintain": []
        }

    def curate_tech_stack(
        self,
        project_type: str,
        priority: str,
        experience_level: str,
        project_description: str,
        known_tech: List[str] = None,
        disliked_tech: List[str] = None,
        starred_tech: List[str] = None,
        max_retries: int = 3
    ) -> Dict[str, Any]:
        try:
            known_tech = known_tech or []
            disliked_tech = disliked_tech or []
            starred_tech = starred_tech or []

            for attempt in range(max_retries):
                try:
                    research_tech = Task(
                        description=f"""
                        Consider the user's technology background and preferences:
                        - Technologies they have experience with: {', '.join(known_tech) if known_tech else 'None'}
                        - Technologies to avoid: {', '.join(disliked_tech) if disliked_tech else 'None'}
                        - Priority technologies: {', '.join(starred_tech) if starred_tech else 'None'}
                        
                        Project Description: {project_description}
                        
                        Research and recommend technologies for this {project_type} project.
                        Focus on tools that align with the project's core requirements and avoid redundant frameworks.
                        """,
                        expected_output="A structured list of technology research findings.",
                        agent=self.agents["research"]
                    )
                    
                    curation_tech = Task(
                        description=f"""
                        Create a tech stack recommendation for a {project_type} with {priority} as the main priority.
                        
                        Project Description: {project_description}
                        
                        Consider the user's technology background and preferences:
                        - Technologies they have experience with: {', '.join(known_tech) if known_tech else 'None'}
                        - Technologies to avoid: {', '.join(disliked_tech) if disliked_tech else 'None'}
                        - Priority technologies: {', '.join(starred_tech) if starred_tech else 'None'}
                        
                        Create a practical, well-reasoned recommendation that considers the user's experience level.
                        
                        IMPORTANT: Each technology recommendation MUST include:
                        1. name: The technology's name
                        2. description: A brief explanation (50-75 words) of what it does and why it fits
                        3. docLink: URL to official documentation or relevant resource
                        
                        IMPORTANT: Only recommend one deployment platform in the deploy array. Choose the most suitable one for the project and do not include more than one. Examples of deployment platforms include Netlify, Vercel, Heroku, AWS Amplify, etc.
                        
                        The response MUST be a valid JSON object with this exact structure:
                        {{
                            "type": "{project_type}",
                            "setup": [
                                {{
                                    "name": "Technology name",
                                    "description": "Brief explanation of what this technology does and why it fits",
                                    "docLink": "URL to official documentation / relevant resource"
                                }}
                            ],
                            "frontend": [...],
                            "backend": [...],
                            "testing": [...],
                            "deploy": [...],
                            "maintain": [...]
                        }}
                        
                        Each array (setup, frontend, etc.) should contain at least one technology with all required fields.
                        """,
                        expected_output="A clean JSON object containing the curated tech stack with detailed explanations.",
                        agent=self.agents["curator"]
                    )

                    crew = Crew(
                        agents=list(self.agents.values()),
                        tasks=[research_tech, curation_tech],
                        process=Process.sequential,
                        verbose=True
                    )

                    result = crew.kickoff()
                    
                    if result:
                        tech_stack_data = self._extract_tech_stack_data(result)
                        validated_data = self._validate_response(tech_stack_data)

                        # Validate tech stack items
                        if "error" not in validated_data:
                            # Ensure each category has at least one valid item
                            categories = ["setup", "frontend", "backend", "testing", "deploy", "maintain"]
                            for category in categories:
                                if category in validated_data:
                                    items = validated_data[category]
                                    if not isinstance(items, list):
                                        validated_data[category] = []
                                    else:
                                        # Filter out invalid items
                                        validated_data[category] = [
                                            item for item in items
                                            if isinstance(item, dict) and
                                            all(key in item for key in ["name", "description", "docLink"])
                                        ]
                                        
                                        # If no valid items, add a default
                                        if not validated_data[category]:
                                            validated_data[category] = [{
                                                "name": f"Default {category} tool",
                                                "description": f"Basic tool for {category} phase",
                                                "docLink": "https://example.com"
                                            }]

                        return validated_data
                            
                    if attempt < max_retries - 1:
                        time.sleep(2)  # Wait before retrying
                        continue
                        
                except Exception as e:
                    print(f"Attempt {attempt + 1} failed: {str(e)}")
                    if attempt < max_retries - 1:
                        time.sleep(2)
                        continue
                    raise

            return self._get_default_response("All attempts failed to generate valid response")

        except Exception as e:
            print(f"Error in curate_tech_stack: {str(e)}")
            return self._get_default_response(f"Error generating tech stack: {str(e)}")
        
    def _is_mobile_project(self, project_type: str) -> bool:
        """Check if the project type is mobile-related."""
        return "mobile" in project_type.lower() or "ios" in project_type.lower() or "android" in project_type.lower()
        
    def _validate_mobile_recommendations(self, tech_stack: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and fix mobile-specific recommendations."""
        # Ensure we have the right tools for mobile deployment
        mobile_deployment_tools = ["expo", "fastlane", "app center", "codepush", "appcenter", "firebase app distribution", "testflight"]
        web_deployment_tools = ["vercel", "netlify", "heroku", "aws amplify"]
        
        # Check deployment section
        if "deploy" in tech_stack and tech_stack["deploy"]:
            has_mobile_deploy = False
            has_web_deploy = False
            
            for deploy_tool in tech_stack["deploy"]:
                tool_name = deploy_tool.get("name", "").lower()
                if any(m_tool in tool_name for m_tool in mobile_deployment_tools):
                    has_mobile_deploy = True
                if any(w_tool in tool_name for w_tool in web_deployment_tools):
                    has_web_deploy = True
            
            # If we have web deployment tools but no mobile deployment tools, replace them
            if has_web_deploy and not has_mobile_deploy:
                # Remove web deployment tools
                tech_stack["deploy"] = [
                    tool for tool in tech_stack["deploy"] 
                    if not any(w_tool in tool.get("name", "").lower() for w_tool in web_deployment_tools)
                ]
                
                # If we don't have any deployment tools left, add Expo as default
                if not tech_stack["deploy"]:
                    tech_stack["deploy"] = [{
                        "name": "Expo",
                        "description": "Expo is a framework and platform for universal React applications, simplifying the build and deployment process for mobile apps. It provides tools for easy app store submissions and over-the-air updates.",
                        "docLink": "https://docs.expo.dev/"
                    }]
        
        # Ensure we have mobile-specific frontend tools
        has_react_native = False
        has_flutter = False
        
        if "frontend" in tech_stack and tech_stack["frontend"]:
            for frontend_tool in tech_stack["frontend"]:
                tool_name = frontend_tool.get("name", "").lower()
                if "react native" in tool_name:
                    has_react_native = True
                if "flutter" in tool_name:
                    has_flutter = True
        
        # If no mobile frameworks found, add React Native as default
        if not has_react_native and not has_flutter and ("frontend" in tech_stack):
            tech_stack["frontend"].insert(0, {
                "name": "React Native",
                "description": "React Native is a framework for building native mobile applications using React. It allows developers to use JavaScript to build mobile apps that run natively on iOS and Android.",
                "docLink": "https://reactnative.dev/docs/getting-started"
            })
            
        return tech_stack
    
    def _extract_tech_stack_data(self, result):
        """Extract tech stack data from any format of result."""
        # Try to get from tasks_output if available
        if hasattr(result, 'tasks_output') and result.tasks_output and len(result.tasks_output) > 1:
            raw_data = result.tasks_output[1].raw
            # Try to parse from JSON code block
            json_data = self._extract_json_from_markdown(raw_data)
            if json_data:
                return json_data
        
        # If we couldn't get from tasks_output, try the raw attribute
        if hasattr(result, 'raw'):
            raw_data = result.raw
            json_data = self._extract_json_from_markdown(raw_data)
            if json_data:
                return json_data
        
        # If we have a string representation, try to parse it
        raw_str = str(result)
        json_data = self._extract_json_from_markdown(raw_str)
        if json_data:
            return json_data
            
        # If all else fails, look for JSON in the error message if it exists
        if isinstance(result, dict) and 'raw_result' in result:
            raw_result = result['raw_result']
            if isinstance(raw_result, str):
                json_data = self._extract_json_from_string(raw_result)
                if json_data:
                    return json_data
            elif isinstance(raw_result, dict) and 'raw' in raw_result:
                raw_data = raw_result['raw']
                json_data = self._extract_json_from_markdown(raw_data)
                if json_data:
                    return json_data
        
        # No JSON found
        return None
    
    def _extract_json_from_markdown(self, text):
        """Extract JSON from markdown code blocks or plain text."""
        if not text:
            return None
            
        # Try to extract from code blocks
        json_start = text.find('```json')
        if json_start >= 0:
            json_start += 7  # Skip ```json and potential newline
            json_end = text.find('```', json_start)
            if json_end > json_start:
                json_str = text[json_start:json_end].strip()
                return self._extract_json_from_string(json_str)
        
        # If no code blocks, try to extract from plain text
        return self._extract_json_from_string(text)
    
    def _extract_json_from_string(self, text):
        """Parse JSON from a string, handling common issues."""
        if not text:
            return None
            
        # Clean the string
        text = self._clean_json_string(text)
        
        # Try to parse
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            # Try more aggressive cleaning
            lines = text.split('\n')
            cleaned_lines = []
            for line in lines:
                line = line.strip()
                if line and not line.startswith('//') and not line.startswith('#'):
                    cleaned_lines.append(line)
            
            cleaned_text = ' '.join(cleaned_lines)
            try:
                return json.loads(cleaned_text)
            except json.JSONDecodeError:
                return None
    
    def _clean_json_string(self, json_str):
        """Cleans and prepares a JSON string for parsing."""
        if not json_str:
            return "{}"
            
        # Convert to string if not already
        if not isinstance(json_str, str):
            json_str = str(json_str)
        
        # Remove the 'n\n' prefix if present
        if json_str.startswith('n\n'):
            json_str = json_str[2:]
            
        # Find first '{' character
        first_brace = json_str.find('{')
        if first_brace >= 0:
            json_str = json_str[first_brace:]
            
        # Find last '}' character
        last_brace = json_str.rfind('}')
        if last_brace >= 0:
            json_str = json_str[:last_brace+1]
            
        return json_str 