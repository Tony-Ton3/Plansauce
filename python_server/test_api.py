import requests

# Base URL of your API
BASE_URL = "http://localhost:8000"

def test_health_endpoint():
    """Test the health check endpoint to verify the API is running."""
    response = requests.get(f"{BASE_URL}/api/health")
    
    print(f"Health Check Status Code: {response.status_code}")
    if response.status_code == 200:
        print(f"Health Check Response: {response.json()}")
        return True
    else:
        print(f"Health Check Failed: {response.text}")
        return False

def test_root_endpoint():
    """Test the root endpoint to verify the API is running."""
    response = requests.get(f"{BASE_URL}/")
    
    print(f"Root Endpoint Status Code: {response.status_code}")
    if response.status_code == 200:
        print(f"Root Endpoint Response: {response.json()}")
        return True
    else:
        print(f"Root Endpoint Failed: {response.text}")
        return False

def test_echo_endpoint():
    """Test the echo endpoint to verify it works."""
    data = {
        "message": "Hello, API!"
    }
    
    response = requests.post(f"{BASE_URL}/api/echo", json=data)
    
    print(f"Echo Endpoint Status Code: {response.status_code}")
    if response.status_code == 200:
        print(f"Echo Endpoint Response: {response.json()}")
        return True
    else:
        print(f"Echo Endpoint Failed: {response.text}")
        return False

if __name__ == "__main__":
    print("Testing API connectivity...")
    
    root_status = test_root_endpoint()
    health_status = test_health_endpoint()
    echo_status = test_echo_endpoint()
    
    if root_status and health_status and echo_status:
        print("\n✅ API is running correctly!")
    else:
        print("\n❌ API is not responding as expected. Check that the server is running.")
        print("Run the server with: uvicorn main:app --reload --port 8000") 