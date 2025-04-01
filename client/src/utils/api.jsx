const API_BASE_URL = "http://localhost:3000/api";

export const getClaudeRecommendation = async (userId, form) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/claude-recommendation/${userId}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
                credentials: "include",
            }
        );
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error getting Claude recommendation:", error);
        throw error;
    }
};

export const fetchTutorialsForTechnology = async (technology) => {
    try {
        const response = await fetch(
            `http://localhost:3000/api/youtube/techtutorials/${encodeURIComponent(
                technology
            )}`,
            {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            }
        );
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("fetchTutorialsForTechnology: ", data);
        if (Array.isArray(data)) {
            return data;
        } else {
            console.error("Unexpected response format:", data);
            return [];
        }
    } catch (error) {
        console.error("Error fetching tech tutorials:", error);
        return [];
    }
};

export const fetchTutorialsForStack = async (stackName, stackId) => {
    try {
        const response = await fetch(
            `http://localhost:3000/api/youtube/stacktutorials/${encodeURIComponent(
                stackName
            )}/${encodeURIComponent(stackId)}`,
            {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            }
        );
        if (!response.ok) {
            throw new Error(
                `fetchTutorialsForStack server side failed: ${response.status}`
            );
        }

        const data = await response.json();

        if (Array.isArray(data)) {
            return data;
        } else {
            console.error("response format is not an array: ", data);
            return [];
        }
    } catch (error) {
        console.error("Error fetching full stack tutorials", error);
        return [];
    }
};

export const updateUserBackground = async (background) => {
    try {
        const response = await fetch(`http://localhost:3000/api/user/update`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ background }),
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update quiz answers');
        }

        return data;
    } catch (error) {
        console.error('Error updating quiz answers:', error);
        throw error;
    }
};

export const setBackground = async () => {
    try {
        const response = await fetch(`http://localhost:3000/api/user/setbackground`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to set background status');
        }

        return data;
    } catch (error) {
        console.error('Error setting background status:', error);
        throw error;
    }
}; 

export const getTasks = async(form) => {
    try{
        const response = await fetch(`${API_BASE_URL}/agent/generate-tasks`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify(form)
        });

        const data = await response.json();

        if(!response.ok){
            throw new Error(data.message || 'Failed to get tasks')
        }

        return data;
    }catch(error){
        console.error('Error getting tasks:', error);
        throw error;
    }
}

// Get all projects for the current user
export const getUserProjects = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/projects`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });

        // First check if the response is OK
        if (!response.ok) {
            try {
                const data = await response.json();
                throw new Error(data.message || 'Failed to fetch projects');
            } catch (parseError) {
                throw new Error(`Request failed with status ${response.status}`);
            }
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching projects:', error);
        return { projects: [] };
    }
};

// Get project details with tasks
export const getProjectWithTasks = async (projectId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to fetch project details');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching project details:', error);
        throw error;
    }
};

// Set current project
export const setCurrentProject = async (projectId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/projects/current`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ projectId })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to set current project');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error setting current project:', error);
        throw error;
    }
};