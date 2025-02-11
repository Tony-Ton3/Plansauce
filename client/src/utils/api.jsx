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
