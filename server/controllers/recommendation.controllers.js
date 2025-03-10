import Anthropic from "@anthropic-ai/sdk";
import { generatePrompt } from "../utils/claudePrompt.js";
import Stack from "../models/stack.model.js";
import dotenv from "dotenv";
import { errorHandler } from "../utils/error.js";
dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

//creates a recommended stack under the userId
export const getClaudeRecommendation = async (req, res, next) => {
  if (req.user.id !== req.params.userId) {
    return next(
      errorHandler(
        403,
        "You are not allowed to get recommendations for this user"
      )
    );
  }
  try {
    const prompt = generatePrompt(req.body);
    console.log(prompt);

    const response = await anthropic.messages.create({
      // model: "claude-3-5-sonnet-20240620",
      model: "claude-3-7-sonnet-20240229",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Extract the content from Claude's response
    const content = response.content[0].text;

    // Try to find JSON in the response
    let parsedContent;
    try {
      // First, try to parse the entire response as JSON
      parsedContent = JSON.parse(content);
    } catch (error) {
      // If that fails, try to extract JSON from the response by looking for it using regex
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedContent = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
          console.error("Error parsing extracted JSON:", parseError);
        }
      }
    }

    const newStack = new Stack({
      userId: req.user.id,
      recommendedStack: parsedContent.recommendedStack,
      alternativeStack: parsedContent.alternativeStack,
      gettingStarted: parsedContent.gettingStarted,
      additionalAdvice: parsedContent.additionalAdvice,
    });

    await newStack.save();
    res.json(newStack);
  } catch (error) {
    return next(errorHandler(500, "Failed to get recommendation from Claude"));
  }
};