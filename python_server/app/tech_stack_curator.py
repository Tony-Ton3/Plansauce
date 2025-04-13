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
                "count": 5  # Limit to 5 results
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
            goal="Research modern technologies and find relevant documentation and tutorials",
            backstory="""You are an expert in researching development technologies and finding high-quality learning resources.
            You excel at using search tools to find official documentation.""",
            verbose=True,
            allow_delegation=False,
            llm=self.llm,
            tools=[self.search_tool]
        )
        
        curator_agent = Agent(
            role="Tech Stack Curator",
            goal="Create a well-reasoned tech stack recommendation based on project context",
            backstory="""You are a tech stack curator who excels at matching technologies to project needs.
            You understand how different technologies complement each other and can explain your choices clearly.
            You focus on developer productivity and project success.""",
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
        project_type: str,
        priority: str,
        known_tech: List[str] = None,
        disliked_tech: List[str] = None
    ) -> Dict[str, Any]:
        research_task = Task(
            description=f"""
            Research modern development technologies for a {project_type} with focus on {priority}.
            Consider the user's background:
            - Known technologies: {', '.join(known_tech) if known_tech else 'None'}
            - Technologies to avoid: {', '.join(disliked_tech) if disliked_tech else 'None'}
            
            For each technology category (Frontend, Backend), search for:
            1. Official documentation links
            2. Key features and benefits
            
            Use the Brave Search API to find:
            - Documentation: search_web("{project_type} [technology] documentation")
            
            Focus on technologies that are:
            - Well-documented
            - Suitable for {project_type}
            - Support {priority}
            - Compatible with user's known technologies
            - NOT including any disliked technologies
            
            Return findings in a structured format with documentation links.
            """,
            expected_output="A structured list of technology research findings including documentation links and curated tutorials.",
            agent=self.agents["research"]
        )
        
        curation_task = Task(
            description=f"""
            Create a tech stack recommendation for a {project_type} with {priority} as the main priority.
            
            Consider the user's background:
            - Known technologies: {', '.join(known_tech) if known_tech else 'None'}
            - Technologies to avoid: {', '.join(disliked_tech) if disliked_tech else 'None'}
            
            Based on the research findings, create a recommendation that:
            1. Leverages the user's existing knowledge of {', '.join(known_tech) if known_tech else 'no specific technologies'}
            2. Completely avoids {', '.join(disliked_tech) if disliked_tech else 'no specific technologies'}
            3. Explains why each technology was chosen
            4. Shows how it supports the project type and priority
            5. Demonstrates how technologies work together
            6. For known technologies, focus on advanced features and integration patterns
            7. For new technologies, explain why they're worth learning
            
            IMPORTANT: Respond with ONLY a valid JSON object. Do NOT include any markdown formatting, code blocks (```), or any text before or after the JSON.
            
            The JSON object MUST follow this exact structure:
            {{
                "frontend": [
                    {{
                        "name": "Technology name",
                        "description": "What it is and why it was chosen for this project, including how it relates to user's experience",
                        "docLink": "URL to official documentation"
                    }}
                ],
                "backend": [
                    {{
                        "name": "Technology name",
                        "description": "What it is and why it was chosen for this project, including how it relates to user's experience",
                        "docLink": "URL to official documentation"
                    }}
                ]
            }}
            
            Your response should be ONLY the JSON object above without any additional text, explanation, or formatting.
            """,
            expected_output="A clean JSON object containing the curated tech stack with detailed explanations.",
            agent=self.agents["curator"]
        )
        
        crew = Crew(
            agents=list(self.agents.values()),
            tasks=[research_task, curation_task],
            process=Process.sequential
        )
        
        result = crew.kickoff()
        
        try:
            # Extract the tech stack data from any format it might be in
            extracted_data = self._extract_tech_stack_data(result)

            print(f"Extracted tech stack data: {extracted_data}")

            if extracted_data:
                return extracted_data
            else:
                return {
                    "error": "Could not extract tech stack recommendation",
                    "raw_result": str(result)
                }
        except Exception as e:
            return {
                "error": f"Error processing tech stack data: {str(e)}",
                "raw_result": str(result)
            }
    
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