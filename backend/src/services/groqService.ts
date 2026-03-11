import Groq from 'groq-sdk';
import fs from 'fs';

export class GroqService {
    private groq: Groq;

    constructor() {
        this.groq = new Groq({
            apiKey: process.env.GROQ_API_KEY || 'dummy-key-for-now',
        });
    }

    async analyzeGraphology(imagePath: string): Promise<any> {
        try {
            if (!process.env.GROQ_API_KEY) {
                throw new Error('GROQ_API_KEY is not configured in environment variables.');
            }

            // Read image file and convert to base64
            const imageBuffer = fs.readFileSync(imagePath);
            const base64Image = imageBuffer.toString('base64');
            let mimeType = 'image/jpeg';
            if (imagePath.endsWith('.png')) mimeType = 'image/png';
            else if (imagePath.endsWith('.webp')) mimeType = 'image/webp';
            const dataUrl = `data:${mimeType};base64,${base64Image}`;

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

            const chatCompletion = await this.groq.chat.completions.create({
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: prompt },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: dataUrl,
                                },
                            },
                        ],
                    },
                ],
                model: 'meta-llama/llama-4-scout-17b-16e-instruct',
                temperature: 0.2,
                max_completion_tokens: 1024,
                response_format: { type: 'json_object' }
            });

            const content = chatCompletion.choices[0]?.message?.content;
            if (!content) {
                throw new Error('Failed to get response from Groq API - empty content');
            }

            // Robust JSON extraction: handle markdown code fences if present
            let jsonString = content.trim();
            const fenceMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (fenceMatch) {
                jsonString = fenceMatch[1].trim();
            }

            // Find JSON object boundaries in case of extra text
            const jsonStart = jsonString.indexOf('{');
            const jsonEnd = jsonString.lastIndexOf('}');
            if (jsonStart !== -1 && jsonEnd !== -1) {
                jsonString = jsonString.slice(jsonStart, jsonEnd + 1);
            }

            return JSON.parse(jsonString);
        } catch (error) {
            console.error('Groq AI Error:', error);
            throw error;
        }
    }
}
