require('dotenv').config();
const Groq = require('groq-sdk');
const https = require('https');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

async function runPrompt() {
    return new Promise((resolve) => {
        https.get('https://raw.githubusercontent.com/groq/groq-api-cookbook/main/images/groq-logo.png', (res) => {
            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', async () => {
                const buffer = Buffer.concat(chunks);
                const base64 = buffer.toString('base64');
                const dataUrl = `data:image/png;base64,${base64}`;
                
                try {
                    const prompt = `You are a professional graphology expert.
Analyze the personality based on the provided handwriting sample and signature in the image.
First, extract all text written in the image. Then provide a graphology personality analysis.

Respond ONLY with a valid JSON object. Do not include any explanation, markdown code fences, or extra text. The JSON must follow this exact structure:
{
  "extracted_text": "<all text visible in the image>",
  "personality_type": "<one descriptive label, e.g. Strategic Thinker>",
  "thinking_style": "<e.g. Analytical, Creative, Intuitive>",
  "emotional_tendency": "<e.g. Stable, Expressive, Reserved>",
  "communication_style": "<e.g. Direct, Diplomatic, Persuasive>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"],
  "career_recommendations": ["<career 1>", "<career 2>", "<career 3>"]
}`;

                    const chatCompletion = await groq.chat.completions.create({
                        messages: [
                            {
                                role: 'user',
                                content: [
                                    { type: 'text', text: prompt },
                                    { type: 'image_url', image_url: { url: dataUrl } },
                                ],
                            },
                        ],
                        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
                        temperature: 0.2,
                        max_completion_tokens: 1024,
                        response_format: { type: 'json_object' }
                    });
                    
                    const content = chatCompletion.choices[0]?.message?.content;
                    console.log("Raw output:");
                    console.log(content);
                    
                    // Let's see if JSON.parse works exactly as the backend does
                    let jsonString = content.trim();
                    const fenceMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)```/);
                    if (fenceMatch) {
                        jsonString = fenceMatch[1].trim();
                    }
                    const jsonStart = jsonString.indexOf('{');
                    const jsonEnd = jsonString.lastIndexOf('}');
                    if (jsonStart !== -1 && jsonEnd !== -1) {
                        jsonString = jsonString.slice(jsonStart, jsonEnd + 1);
                    }
                    const parsed = JSON.parse(jsonString);
                    console.log("Parsed JSON successfully:", parsed);

                } catch (e) {
                    console.error("Error from Groq or Parsing:", e);
                }
                resolve();
            });
        });
    });
}
runPrompt();
