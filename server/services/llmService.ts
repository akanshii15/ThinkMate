export interface DecisionAnalysis {
  problem: string;
  keyFactors: string[];
  options: { name: string; description: string }[];
  prosAndCons: { option: string; pros: string[]; cons: string[] }[];
  reflectiveQuestions: string[];
  recommendation: string;
  reasoning: string;
}

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const DEFAULT_MODEL = "google/gemini-2.0-flash-001";

export async function generateDecisionAnalysis(
  userMessage: string,
  history: any[] = []
) {
  try {
    if (!OPENROUTER_API_KEY) {
      console.warn("OpenRouter API key missing, falling back to mock.");
      return getMockDecisionAnalysis(userMessage);
    }

    const prompt = `
You are an intelligent Decision-Making Assistant. Your goal is to help users make better choices through structured reasoning.

When a user presents a decision or problem, provide a comprehensive analysis in JSON format.

User Query: ${userMessage}

Response Format (JSON):
{
  "problem": "Clearly restated problem",
  "keyFactors": ["factor 1", "factor 2", ...],
  "options": [
    { "name": "Option A", "description": "Quick description" },
    ...
  ],
  "prosAndCons": [
    { "option": "Option A", "pros": ["pro 1", ...], "cons": ["con 1", ...] },
    ...
  ],
  "reflectiveQuestions": ["question 1", ...],
  "recommendation": "Final recommendation",
  "reasoning": "Reasoning behind the recommendation"
}

Respond ONLY with the JSON object.
`;

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://github.com/thinkmate",
        "X-Title": "ThinkMate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          ...history.map(h => ({
            role: h.role === 'user' ? 'user' : 'assistant',
            content: h.content
          })),
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" }
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.warn("OpenRouter API error, falling back to mock:", data);
      return getMockDecisionAnalysis(userMessage);
    }

    const text = data?.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error("No response from OpenRouter");
    }

    // OpenAI/OpenRouter usually returns clean JSON with response_format, but let's be safe
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : text;
    const analysis: DecisionAnalysis = JSON.parse(jsonStr);

    return {
      analysis,
      rawResponse: jsonStr,
    };
  } catch (err) {
    console.error("OpenRouter Error, falling back to mock:", err);
    return getMockDecisionAnalysis(userMessage);
  }
}

function getMockDecisionAnalysis(userMessage: string) {
  const analysis: DecisionAnalysis = {
    problem: `Should I ${userMessage.toLowerCase().replace(/[^a-zA-Z0-9 ]/g, '')}? (Mock Analysis)`,
    keyFactors: [
      "Long-term career goals",
      "Current skill level and learning curve",
      "Industry demand and future trends",
      "Personal interest and motivation"
    ],
    options: [
      { name: "Path A", description: "Focused intensive learning" },
      { name: "Path B", description: "Balanced approach with side projects" }
    ],
    prosAndCons: [
      { 
        option: "Path A", 
        pros: ["Fastest progression", "Deep technical immersion"], 
        cons: ["High risk of burnout", "Potential narrow focus"] 
      },
      { 
        option: "Path B", 
        pros: ["Sustainable pace", "Broader practical experience"], 
        cons: ["Slower to reach expert level", "Harder to stay disciplined"] 
      }
    ],
    reflectiveQuestions: [
      "What is your primary goal for this year?",
      "How much time can you realistically commit each week?",
      "Which community or ecosystem feels more aligned with your values?"
    ],
    recommendation: "Choose the path that aligns most with your current daily habits.",
    reasoning: "This is a demonstration response because the API key is currently invalid. Please provide a valid key in the .env file to see real AI analysis."
  };

  return {
    analysis,
    rawResponse: JSON.stringify(analysis),
  };
}

export async function generateConversationalResponse(
  userMessage: string,
  history: any[] = []
) {
  try {
    if (!OPENROUTER_API_KEY) {
      return "I'm currently in 'Demo Mode' because the OpenRouter API key is missing. How can I help you explore your decision today?";
    }

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://github.com/thinkmate",
        "X-Title": "ThinkMate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          ...history.map(h => ({
            role: h.role === 'user' ? 'user' : 'assistant',
            content: h.content
          })),
          {
            role: "user",
            content: userMessage,
          },
        ],
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.warn("OpenRouter API error, falling back to mock conversation:", data);
      return "I'm currently in 'Demo Mode' because the OpenRouter API key is invalid. How can I help you explore your decision today?";
    }

    return (
      data?.choices?.[0]?.message?.content ||
      "No response"
    );
  } catch (err) {
    console.error("OpenRouter Error, falling back to mock conversation:", err);
    return "I'm currently in 'Demo Mode' because the OpenRouter API key is invalid. How can I help you explore your decision today?";
  }
}