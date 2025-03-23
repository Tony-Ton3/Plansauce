import requests
import json
from datetime import datetime

# API endpoint URL (adjusted to use the echo endpoint on port 8000)
API_URL = "http://localhost:8000/api/echo"

# Define a simple message to send
payload = {
    "message": "This is a test message that would normally be sent to CrewAI",
    "timestamp": datetime.now().isoformat()
}

# Print what we're about to do
print(f"Sending request to {API_URL} at {datetime.now()}")
print(f"Request payload:\n{json.dumps(payload, indent=2)}")
print("\nSending request...")

# Send the request to the API
try:
    response = requests.post(API_URL, json=payload)
    
    # Check if the request was successful
    if response.status_code == 200:
        result = response.json()
        print("\n--- RESPONSE RECEIVED ---")
        print(f"Status: Success (200)")
        print(f"Timestamp: {result.get('timestamp', 'N/A')}")
        print("\n--- RESULT ---")
        print(f"Echo: {result.get('echo', 'No echo returned')}")
        print(f"Message: {result.get('message', 'No message returned')}")
    else:
        print(f"\nError: Received status code {response.status_code}")
        print(f"Response: {response.text}")
except Exception as e:
    print(f"\nException occurred: {str(e)}") 