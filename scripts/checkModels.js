const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        const models = await genAI.getGenerativeModel({ model: "gemini-pro" }).apiKey;
        // Wait, the SDK has a listModels method on the client usually, or we need to check documentation.
        // Actually, newer SDKs might not expose listModels directly on the main class in some versions, 
        // but usually it's accessible via a fetch to the REST API or similar. 
        // Let's rely on constructing the request manually if needed, or check a simple generation.
        // However, the error message in the logs suggested "Call ListModels to see the list".

        // Let's try the fetch approach to be sure as SDK versions vary.
        const apiKey = process.env.GEMINI_API_KEY;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log("No models found or error:", data);
        }

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
