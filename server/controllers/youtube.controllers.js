// import axios from "axios";
import dotenv from "dotenv";
import UserTutorials from "../models/tutorial.model.js";
dotenv.config();

export const getTutorialsForTechnology = async (req, res) => {
  const { technology } = req.params;
  const maxResults = 3; // returns 3 videos for now

  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.search = new URLSearchParams({
      part: "snippet",
      q: `${technology} tutorial`,
      type: "video",
      maxResults: maxResults.toString(),
      key: process.env.YOUTUBE_API_KEY,
    }).toString();

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`YouTube API Error (${response.status}):`, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Received ${data.items.length} items from YouTube API`);

    const tutorials = data.items.map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium.url,
      channelTitle: item.snippet.channelTitle,
    }));

    res.json(tutorials);
  } catch (error) {
    console.error(`Error in getTutorialsForTechnology:`, error);
    res.status(500).json({
      error: "Failed to fetch tutorials",
      details: error.message,
    });
  }
};

export const getTutorialsForStack = async (req, res) => {
  const { stackName, stackId } = req.params;
  const maxResults = 3;

  try {
    //if stack totorial already exist for the particular stack return it
    let userTutorials = await UserTutorials.findOne({
      stackId: stackId,
    });

    if (userTutorials) {
      console.log(
        `Returning existing tutorials for ${stackName} from database`
      );
      return res.json(userTutorials.stackTutorials);
    }

    console.log(`Fetching tutorials for stack: ${stackName} from YouTube API`);

    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.search = new URLSearchParams({
      part: "snippet",
      q: `${stackName} tutorial`,
      type: "video",
      maxResults: maxResults.toString(),
      key: process.env.YOUTUBE_API_KEY,
      relevanceLanguage: "en",
      videoDuration: "medium", // medium-length videos
      order: "relevance", // Sort by relevance
    }).toString();

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`YouTube API Error (${response.status}):`, errorText);
      throw new Error(
        `YouTube API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log(`Received ${data.items.length} items from YouTube API`);

    const tutorials = data.items
      .map((item) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails?.medium?.url || "",
        channelTitle: item.snippet.channelTitle,
        description: item.snippet.description || "No description",
      }))
      .filter(
        (tutorial) =>
          tutorial.id &&
          tutorial.title &&
          tutorial.thumbnail &&
          tutorial.channelTitle &&
          tutorial.description
      );

    if (tutorials.length === 0) {
      throw new Error("No valid tutorials found");
    }

    // Create new UserTutorials document
    userTutorials = new UserTutorials({
      userId: req.user.id,
      stackId: stackId,
      stackTutorials: tutorials,
    });

    await userTutorials.save();

    console.log(`Saved ${tutorials.length} tutorials to database`);

    res.json(tutorials);
  } catch (error) {
    console.error(`Error in getTutorialsForStack:`, error);
    res.status(500).json({
      error: "Failed to fetch or save tutorials",
      details: error.message,
    });
  }
};