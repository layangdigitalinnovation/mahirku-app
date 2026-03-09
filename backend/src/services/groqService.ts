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
            const mimeType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';
            const dataUrl = `data:${mimeType};base64,${base64Image}`;

            const prompt = `
You are a professional graphology expert.
Analyze personality based on the provided handwriting sample and signature behavior.
Please extract the text written in the image, then provide an analysis based on graphology principles.

Return strictly the result in JSON format like this, and provide nothing else:
{
  "extracted_text": "text found in the image",
  "personality_type": "Strategic Thinker",
  "thinking_style": "Analytical",
  "emotional_tendency": "Stable",
  "communication_style": "Direct",
  "strengths": ["Logical thinking", "detail oriented"],
  "weaknesses": ["Overthinking", "perfectionism"],
  "career_recommendations": ["Engineer", "Analyst"]
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
                model: 'llama-3.2-11b-vision-preview',
                temperature: 0.2,
                max_completion_tokens: 1024,
                response_format: { type: 'json_object' }
            });

            const content = chatCompletion.choices[0]?.message?.content;
            if (!content) {
                throw new Error('Failed to get response from Groq API');
            }

            return JSON.parse(content);
        } catch (error) {
            console.error('Groq AI Error:', error);
            throw error;
        }
    }
}
