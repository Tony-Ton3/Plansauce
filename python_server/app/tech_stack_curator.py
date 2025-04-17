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
            goal="Research and evaluate tools across all project phases including planning, setup, development, testing, deployment, and maintenance",
            backstory="""You are an expert in researching and evaluating development tools and technologies across the entire software development lifecycle.
            You excel at:
            - Finding and evaluating project management and planning tools
            - Identifying development environment setup tools
            - Researching frontend and backend technologies
            - Discovering testing frameworks and methodologies
            - Evaluating deployment and CI/CD solutions
            - Finding monitoring and maintenance tools
            
            You understand how different tools complement each other and can identify the best options based on project requirements and team expertise.""",
            verbose=True,
            allow_delegation=False,
            llm=self.llm,
            tools=[self.search_tool]
        )
        
        curator_agent = Agent(
            role="Tech Stack Curator",
            goal="Create a comprehensive tech stack recommendation that covers all project phases and ensures tool compatibility",
            backstory="""You are a tech stack curator who excels at creating complete development ecosystems.
            You understand:
            - How to structure a project from planning to maintenance
            - Which tools work best together in each phase
            - How to balance learning curves with productivity
            - When to recommend familiar tools vs. new technologies
            - How to ensure smooth transitions between project phases
            
            You create recommendations that:
            - Start with proper planning and setup tools
            - Include appropriate development technologies
            - Incorporate testing and quality assurance
            - Provide deployment and hosting solutions
            - Include maintenance and monitoring tools
            
            Your recommendations are always practical, well-reasoned, and consider the team's experience level.""",
            verbose=True,
            allow_delegation=False,
            llm=self.llm
        )
        
        return {
            "research": research_agent,
            "curator": curator_agent
        }
    
    def _validate_response(self, result: Any) -> Dict[str, Any]:
        """Validate and format the response from the LLM."""
        if not result:
            return {
                "error": "Empty response from LLM",
                "planning": [],
                "setup": [],
                "frontend": [],
                "backend": [],
                "testing": [],
                "deploy": [],
                "maintain": []
            }

        try:
            # If result is already a dict, use it directly
            if isinstance(result, dict):
                return result

            # Try to parse as JSON if it's a string
            if isinstance(result, str):
                parsed = json.loads(result)
                if isinstance(parsed, dict):
                    return parsed

            # If we get here, the response is invalid
            return {
                "error": "Invalid response format from LLM",
                "planning": [],
                "setup": [],
                "frontend": [],
                "backend": [],
                "testing": [],
                "deploy": [],
                "maintain": []
            }
        except Exception as e:
            return {
                "error": f"Error processing response: {str(e)}",
                "planning": [],
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
    ) -> Dict[str, Any]:
        try:
            known_tech = known_tech or []
            disliked_tech = disliked_tech or []
            starred_tech = starred_tech or []

            research_tech = Task(
                description=f"""
                Consider the user's technology background and preferences:
                - Technologies they have experience with: {', '.join(known_tech) if known_tech else 'None'} (used to understand their comfort level and expertise)
                - Technologies to strictly avoid: {', '.join(disliked_tech) if disliked_tech else 'None'} (these must NEVER be recommended)
                - Priority technologies: {', '.join(starred_tech) if starred_tech else 'None'} (these have highest priority and MUST be included if relevant)
                
                Project Description: {project_description}
                
                IMPORTANT RULES:
                1. Priority technologies ({', '.join(starred_tech) if starred_tech else 'None'}) MUST be included if they are relevant to the project type and requirements
                2. NEVER recommend technologies from the avoid list: {', '.join(disliked_tech) if disliked_tech else 'None'}
                3. Known technologies are for understanding user experience level, not for automatic inclusion
                4. When a priority technology serves a specific purpose, DO NOT recommend additional tools for the same purpose
                5. Prioritize technologies that align with the project's core requirements and features
                6. AVOID FRAMEWORK REDUNDANCY: Do not include React if recommending Next.js, do not include Express if recommending NestJS, etc.
                
                PROJECT TYPE SPECIFIC GUIDELINES:
                For Mobile Apps:
                - Focus on mobile-first technologies and frameworks
                - Minimize backend complexity unless absolutely necessary
                - Prioritize offline capabilities and mobile performance
                - Consider platform-specific requirements (iOS/Android)
                - Choose tools with good mobile development experience
                - For deployment, focus on app store deployment tools, not web hosting
                
                For Web Applications:
                - Focus on responsive design and web standards
                - Consider progressive web app capabilities
                - Prioritize browser compatibility
                - If recommending Next.js, DO NOT also recommend React separately
                - If recommending Angular, Vue, or other complete frameworks, DO NOT recommend additional UI libraries
                
                For Other Project Types:
                - Adapt recommendations to the specific needs of the project type
                - Focus on domain-specific best practices
                
                PRIORITY SPECIFIC GUIDELINES:
                For Learning Priority:
                1. Start with familiar technologies from known_tech list
                2. Add maximum 1-2 (if needed) new technologies that are:
                   - Well-documented with clear tutorials
                   - Have strong community support
                   - Integrate well with known technologies
                3. Focus on fundamentals over cutting-edge features
                4. Choose stable, mature technologies over trending ones unless it aligns with what the user is trying to achieve
                5. Prefer technologies with good learning resources
                6. If the user is trying to achieve something specific, recommend technologies that are known to be good at that

                For Speed Priority:
                1. Minimize the number of new technologies
                2. Choose tools with quick setup and minimal config
                3. Prefer integrated solutions
                4. Avoid complex cloud services unless absolutely necessary
                5. NEVER include multiple IDEs or text editors - choose only ONE development environment
                6. For web projects, prefer simple deployment options (Vercel, Netlify) over complex cloud services
                7. Prioritize simpler database solutions (SQLite, MongoDB Atlas) over complex setups
                8. Only recommend services the user is already familiar with from their known_tech
                9. For setup, avoid redundancy between Git and GitHub - if both are included, ensure distinct purposes are explained
                
                For Scalability Priority:
                1. Focus on proven, enterprise-ready solutions
                2. Include necessary monitoring and optimization tools
                3. Choose technologies known for performance
                
                TOOL SELECTION RULES:
                1. Mobile Apps:
                   - ONE primary mobile framework (e.g., React Native)
                   - TailwindCSS can be combined with ONE UI component library (e.g., Shadcn/UI, DaisyUI, etc) since they're built on top of TailwindCSS
                   - ONE state management solution
                   - Minimal backend services unless required
                   - For deployment, use mobile-specific CI/CD like Expo, Fastlane, or App Center
                
                2. Each Category Should Have:
                   - Planning: ONE project management tool
                   - Setup: Minimal development environment (ONE IDE/editor maximum)
                   - Frontend: ONE core framework + essential utilities only (NEVER include redundant frameworks, but TailwindCSS can be combined with component libraries built on it)
                   - Backend: Simplest architecture that meets requirements (for Speed priority, prefer serverless or BaaS solutions)
                   - Testing: ONE primary testing framework
                   - Deploy: ONE deployment platform (prefer simple, integrated platforms for Speed priority)
                   - Maintain: Essential monitoring only
                
                3. Integration Requirements:
                   - All tools must work well together ideally taking inspriration from MERN, MEVN, T3, LAMP, LEMP, JAM, PERN, ELK, etc.
                   - Prefer tools from the same ecosystem
                   - Minimize cross-platform complexity
                
                IMPORTANT: Return findings in a structured format with documentation, if documentation isn't relevant(e.g. github documentation we should return the link to the github itself instead of github documentation link, or Figma documentation we should return the link to the figma itself instead of figma documentation link).
                Focus on technologies specific to {project_type}, not general web technologies unless they directly support this project type.
                """,
                expected_output="A structured list of technology research findings including documentation links and priority-specific features.",
                agent=self.agents["research"]
            )
            
            curation_tech = Task(
                description=f"""
                Create a tech stack recommendation for a {project_type} with {priority} as the main priority.
                
                Project Description: {project_description}
                
                Consider the user's technology background and preferences:
                - Technologies they have experience with: {', '.join(known_tech) if known_tech else 'None'} (used to understand their comfort level and expertise)
                - Technologies to strictly avoid: {', '.join(disliked_tech) if disliked_tech else 'None'} (these must NEVER be recommended)
                - Priority technologies: {', '.join(starred_tech) if starred_tech else 'None'} (these have highest priority and MUST be included if relevant)
                
                CRITICAL REQUIREMENTS:
                1. Priority technologies ({', '.join(starred_tech) if starred_tech else 'None'}) MUST be included if they are relevant to the project type and requirements
                2. NEVER include technologies from the avoid list: {', '.join(disliked_tech) if disliked_tech else 'None'}
                3. Known technologies are for understanding user experience level, not for automatic inclusion
                4. When a priority technology serves a specific purpose, DO NOT recommend additional tools for the same purpose
                5. Prioritize technologies that align with the project's core requirements and features
                6. AVOID REDUNDANT FRAMEWORKS: Do not recommend technologies that are already included in other recommended frameworks
                
                PROJECT TYPE SPECIFIC GUIDELINES:
                For Mobile Apps:
                - Focus on mobile-first technologies and frameworks
                - Minimize backend complexity unless absolutely necessary
                - Prioritize offline capabilities and mobile performance
                - Consider platform-specific requirements (iOS/Android)
                - Choose tools with good mobile development experience
                - DEPLOYMENT must use mobile app deployment tools (Expo, Fastlane, App Center) NOT web hosting
                
                For Web Applications:
                - Focus on responsive design and web standards
                - Consider progressive web app capabilities
                - Prioritize browser compatibility
                - AVOID REDUNDANCY: If recommending integrated frameworks like Next.js, NEVER list React separately
                - Include only essential libraries that serve distinct purposes
                
                For Other Project Types:
                - Adapt recommendations to the specific needs of the project type
                - Focus on domain-specific best practices
                
                PRIORITY SPECIFIC GUIDELINES:
                For Learning Priority:
                1. Start with familiar technologies from known_tech list
                2. Add maximum 1-2 new technologies that are:
                   - Well-documented with clear tutorials
                   - Have strong community support
                   - Integrate well with known technologies
                3. Focus on fundamentals over cutting-edge features
                4. Choose stable, mature technologies over trending ones
                5. Prefer technologies with good learning resources
                
                For Speed Priority:
                1. Minimize the number of new technologies
                2. Choose tools with quick setup and minimal config
                3. Prefer integrated solutions
                4. Avoid complex cloud services unless absolutely necessary
                5. NEVER include multiple IDEs or text editors - choose only ONE development environment
                6. For web projects, prefer simple deployment options (Vercel, Netlify) over complex cloud services
                7. Prioritize simpler database solutions (SQLite, MongoDB Atlas) over complex setups
                8. Only recommend services the user is already familiar with from their known_tech
                9. For setup, avoid redundancy between Git and GitHub - if both are included, ensure distinct purposes are explained
                
                For Scalability Priority:
                1. Focus on proven, enterprise-ready solutions
                2. Include necessary monitoring and optimization tools
                3. Choose technologies known for performance
                
                TOOL SELECTION RULES:
                1. Mobile Apps:
                   - ONE primary mobile framework (e.g., React Native)
                   - TailwindCSS can be combined with ONE UI component library (e.g., Shadcn/UI, DaisyUI) since they're built on top of TailwindCSS
                   - ONE state management solution
                   - Minimal backend services unless required
                   - For deployment, use mobile-specific CI/CD like Expo, Fastlane, or App Center
                
                2. Each Category Should Have:
                   - Planning: ONE project management tool
                   - Setup: Minimal development environment (ONE IDE/editor maximum)
                   - Frontend: ONE core framework + essential utilities only (NEVER include redundant frameworks, but TailwindCSS can be combined with component libraries built on it)
                   - Backend: Simplest architecture that meets requirements (for Speed priority, prefer serverless or BaaS solutions)
                   - Testing: ONE primary testing framework
                   - Deploy: ONE deployment platform (prefer simple, integrated platforms for Speed priority)
                   - Maintain: Essential monitoring only
                
                3. Framework Redundancy Prevention:
                   - Next.js already includes React - NEVER recommend both
                   - Angular is a complete framework - do not recommend additional UI libraries
                   - NestJS includes Express - do not recommend both
                   - Laravel includes PHP - do not list PHP separately
                   - Django includes Python - do not list Python separately
                
                4. Integration Requirements:
                   - All tools must work well together
                   - Prefer tools from the same ecosystem
                   - Minimize cross-platform complexity
                
                IMPORTANT: Respond with ONLY a valid JSON object following the specified structure.
                
                The JSON object MUST follow this exact structure:
                {{
                    "type": "{project_type}",
                    "planning": [
                        {{
                            "name": "Technology name",
                            "description": "Brief explanation (50-75 words max) of what this technology does and why it fits this specific project's requirements, priority, and user background",
                            "docLink": "URL to official documentation, if documentation isn't relevant(e.g. github documentation we should return the link to the github itself instead of github documentation link, or Figma documentation we should return the link to the figma itself instead of figma documentation link)"
                        }}
                    ],
                    "setup": [...],
                    "frontend": [...],
                    "backend": [...],
                    "testing": [...],
                    "deploy": [...],
                    "maintain": [...]
                }}
                
                Your response should be ONLY the JSON object above without any additional text, explanation, or formatting.
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
            
            #doing this cause of weird ass response format
            tech_stack_data = self._extract_tech_stack_data(result)
            validated_data = self._validate_response(tech_stack_data)

            # Ensure project type is correctly set in the result
            # if "error" not in validated_data:
            #     if "type" not in validated_data or not validated_data["type"]:
            #         validated_data["type"] = project_type
            #     # Double-check mobile app specific recommendations
            #     if self._is_mobile_project(project_type):
            #         validated_data = self._validate_mobile_recommendations(validated_data)

            # if "error" in validated_data:
            #     print(f"Error in response: {validated_data['error']}")
            #     return validated_data

            return validated_data

        except Exception as e:
            print(f"Error in curate_tech_stack: {str(e)}")
            return {
                "error": f"Error generating tech stack: {str(e)}",
                "type": project_type,
                "planning": [],
                "setup": [],
                "frontend": [],
                "backend": [],
                "testing": [],
                "deploy": [],
                "maintain": []
            }
        
    # def _is_mobile_project(self, project_type: str) -> bool:
    #     """Check if the project type is mobile-related."""
    #     return "mobile" in project_type.lower() or "ios" in project_type.lower() or "android" in project_type.lower()
        
    # def _validate_mobile_recommendations(self, tech_stack: Dict[str, Any]) -> Dict[str, Any]:
    #     """Validate and fix mobile-specific recommendations."""
    #     # Ensure we have the right tools for mobile deployment
    #     mobile_deployment_tools = ["expo", "fastlane", "app center", "codepush", "appcenter", "firebase app distribution", "testflight"]
    #     web_deployment_tools = ["vercel", "netlify", "heroku", "aws amplify"]
        
    #     # Check deployment section
    #     if "deploy" in tech_stack and tech_stack["deploy"]:
    #         has_mobile_deploy = False
    #         has_web_deploy = False
            
    #         for deploy_tool in tech_stack["deploy"]:
    #             tool_name = deploy_tool.get("name", "").lower()
    #             if any(m_tool in tool_name for m_tool in mobile_deployment_tools):
    #                 has_mobile_deploy = True
    #             if any(w_tool in tool_name for w_tool in web_deployment_tools):
    #                 has_web_deploy = True
            
    #         # If we have web deployment tools but no mobile deployment tools, replace them
    #         if has_web_deploy and not has_mobile_deploy:
    #             # Remove web deployment tools
    #             tech_stack["deploy"] = [
    #                 tool for tool in tech_stack["deploy"] 
    #                 if not any(w_tool in tool.get("name", "").lower() for w_tool in web_deployment_tools)
    #             ]
                
    #             # If we don't have any deployment tools left, add Expo as default
    #             if not tech_stack["deploy"]:
    #                 tech_stack["deploy"] = [{
    #                     "name": "Expo",
    #                     "description": "Expo is a framework and platform for universal React applications, simplifying the build and deployment process for mobile apps. It provides tools for easy app store submissions and over-the-air updates.",
    #                     "docLink": "https://docs.expo.dev/"
    #                 }]
        
    #     # Ensure we have mobile-specific frontend tools
    #     has_react_native = False
    #     has_flutter = False
        
    #     if "frontend" in tech_stack and tech_stack["frontend"]:
    #         for frontend_tool in tech_stack["frontend"]:
    #             tool_name = frontend_tool.get("name", "").lower()
    #             if "react native" in tool_name:
    #                 has_react_native = True
    #             if "flutter" in tool_name:
    #                 has_flutter = True
        
    #     # If no mobile frameworks found, add React Native as default
    #     if not has_react_native and not has_flutter and ("frontend" in tech_stack):
    #         tech_stack["frontend"].insert(0, {
    #             "name": "React Native",
    #             "description": "React Native is a framework for building native mobile applications using React. It allows developers to use JavaScript to build mobile apps that run natively on iOS and Android.",
    #             "docLink": "https://reactnative.dev/docs/getting-started"
    #         })
            
    #     return tech_stack
    
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