import prisma from "../lib/prisma";

// Smart Offline Fallback Brain for Connectly AI when GEMINI_API_KEY is not set
const getOfflineFallbackResponse = (message: string): string => {
  const msg = message.toLowerCase().trim();

  // Greetings
  if (msg.match(/\b(hi|hello|hey|greetings|hola)\b/)) {
    return "Hey there! I am **Connectly AI**, your friendly built-in chat assistant. How can I help you today? \n\nFeel free to ask me to write code, tell a joke, or explain the new chat themes!";
  }

  // Identity / Creator
  if (msg.includes("who are you") || msg.includes("your name") || msg.includes("what is your name")) {
    return "I am **Connectly AI**! I am an AI companion built directly into Connectly to make your messaging experience smart, interactive, and fun.";
  }

  // How are you
  if (msg.includes("how are you") || msg.includes("how's it going")) {
    return "I'm running smoothly at 100% efficiency! 🚀 How are things going with you? Need help with anything in our workspace?";
  }

  // Help/Features
  if (msg.includes("help") || msg.includes("what can you do") || msg.includes("features")) {
    return "Here are a few things I can do for you:\n\n" +
           "1. **Chat Themes**: Talk about our new dark/light adaptive chat themes (Classic, Sunset Glow, Midnight Cyber, Forest Sage, Stealth Gray).\n" +
           "2. **Jokes & Fun**: Ask me to tell you a joke!\n" +
           "3. **Coding Helper**: Ask me to write a quick function (e.g., 'write python code' or 'javascript helper').\n" +
           "4. **General Q&A**: Ask me questions, and I will try my best to answer locally!";
  }

  // Themes
  if (msg.includes("theme") || msg.includes("background") || msg.includes("color") || msg.includes("wallpaper")) {
    return "Our new **Adaptive Chat Themes** are amazing! Click the artist palette icon (🎨) in the top-right corner of this chat panel to change them. They include:\n\n" +
           "- **Classic Indigo**: Dot matrix wallpaper with clean indigo accents.\n" +
           "- **Sunset Glow**: Warm gradients with smooth cosmic waves.\n" +
           "- **Midnight Cyber**: A high-tech digital grid/matrix design.\n" +
           "- **Forest Sage**: Organic botanical foliage background with fresh green aesthetics.\n" +
           "- **Stealth Gray**: Minimalist carbon-fiber geometric blueprint.\n\n" +
           "**Best of all:** they auto-adapt seamlessly depending on whether your app is in **Light** or **Dark** mode!";
  }

  // Code request
  if (msg.includes("code") || msg.includes("program") || msg.includes("function") || msg.includes("javascript") || msg.includes("python") || msg.includes("html") || msg.includes("css")) {
    return "Sure! Here is a clean JavaScript helper function to fetch data safely:\n\n" +
           "```javascript\n" +
           "async function fetchData(url) {\n" +
           "  try {\n" +
           "    const response = await fetch(url);\n" +
           "    if (!response.ok) throw new Error('Fetch failed');\n" +
           "    return await response.json();\n" +
           "  } catch (error) {\n" +
           "    console.error('API Error:', error);\n" +
           "  }\n" +
           "}\n" +
           "```\n" +
           "Let me know if you need code written in Python, C++, TypeScript, or any other language!";
  }

  // Jokes
  if (msg.includes("joke") || msg.includes("funny") || msg.includes("laugh")) {
    const jokes = [
      "Why do programmers wear glasses? Because they can't C#! 🤓",
      "How many programmers does it take to change a light bulb? None, that's a hardware problem! 💡",
      "Why did the database administrator leave his wife? She had one-to-many relationships! 📊",
      "['hip', 'hip'] (hip hip array!) 🚀",
      "There are 10 types of people in the world: those who understand binary, and those who don't! 🔢"
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  // General Fallback Simulation responses
  const fallbacks = [
    "That is an interesting question! I am happy to chat about it. Could you tell me more?",
    "I hear you! I am currently running in local offline mode, but I can still assist you. Feel free to ask about code, jokes, or themes!",
    "Great point! Tell me more about what you are building or trying to achieve today.",
    "Got it! Let's work together to make Connectly the best chat app ever. What should we build next?"
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
};

export const getGeminiResponse = async (conversationId: string, userMessageContent: string): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY;
  const isOffline = !apiKey;

  try {
    // Fetch last 15 messages for context
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      take: 15,
    });

    if (isOffline) {
      // Simulate typing delay locally for better UX
      await new Promise((resolve) => setTimeout(resolve, 800));
      const localResponse = getOfflineFallbackResponse(userMessageContent);
      return `${localResponse}\n\n*(Note: Running in offline simulation mode. Set \`GEMINI_API_KEY\` in your server \`.env\` file to connect to live Gemini 2.5)*`;
    }

    // Format for Gemini API
    const contents = messages.map((msg) => {
      const role = msg.senderId === "000000000000000000000000" ? "model" : "user";
      return {
        role,
        parts: [{ text: msg.content || "" }],
      };
    });

    // Ensure current message is appended if not query result
    if (contents.length === 0 || contents[contents.length - 1].parts[0].text !== userMessageContent) {
      contents.push({
        role: "user",
        parts: [{ text: userMessageContent }],
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [
              {
                text: "You are Connectly AI, the built-in, friendly assistant inside the Connectly chat application. Always identify yourself as Connectly AI. Help the user with their coding requests, jokes, advice, or general conversation. Keep your tone helpful, professional, and engaging."
              }
            ]
          }
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API Error Response:", errText);
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = (await response.json()) as any;
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return replyText || "I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Fall back to local brain rather than crashing or showing error!
    const localResponse = getOfflineFallbackResponse(userMessageContent);
    return `${localResponse}\n\n*(Note: Falling back to offline simulation mode due to an error connecting to the API)*`;
  }
};


const offlineRefineText = (text: string): string => {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (!trimmed) return "";
  const withCapital = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  const normalized = withCapital
    .replace(/\bi\b/g, "I")
    .replace(/\bdont\b/gi, "don't")
    .replace(/\bcant\b/gi, "can't")
    .replace(/\bwont\b/gi, "won't")
    .replace(/\bim\b/gi, "I'm")
    .replace(/\bits\b/gi, "it's")
    .replace(/\byoure\b/gi, "you're");
  return /[.!?]$/.test(normalized) ? normalized : `${normalized}.`;
};

export const refineMessageText = async (text: string): Promise<string> => {
  const input = text.trim();
  if (!input) return "";

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return offlineRefineText(input);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Refine this chat message. Correct grammar and improve clarity slightly, but keep the same meaning, tone, length, language, emojis, and casual feel. Return only the refined message, no quotes and no explanation.\n\n${input}`,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) throw new Error(`Gemini refine error: ${response.statusText}`);
    const data = (await response.json()) as any;
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || offlineRefineText(input);
  } catch (error) {
    console.error("Error refining message:", error);
    return offlineRefineText(input);
  }
};
