import Groq from 'groq-sdk';
import fs from 'fs';
import sharp from 'sharp';

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

            // Optimize image with sharp: resize and convert to JPEG
            // Groq Llama 4 Scout has strict limits on image dimensions and sizes
            const imageBuffer = await sharp(imagePath)
                .resize(1024, 1024, {
                    fit: 'inside',
                    withoutEnlargement: true,
                })
                .jpeg({ quality: 80 })
                .toBuffer();

            const base64Image = imageBuffer.toString('base64');
            const dataUrl = `data:image/jpeg;base64,${base64Image}`;

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

    async generateCognitiveStyleReport(input: {
        cognitive_style: string;
        score: number;
        dimensions?: { label: string; percent: number }[];
        user_age?: number;
        user_profession?: string;
        secondary_style?: string;
        extra?: any;
    }): Promise<any> {
        if (!process.env.GROQ_API_KEY) {
            throw new Error('GROQ_API_KEY is not configured in environment variables.');
        }

        const prompt = `You are a professional psychologist specializing in cognitive psychology.

Generate a comprehensive cognitive style report based on the profile below.

PROFILE (JSON):
${JSON.stringify(input)}

Requirements:
- Write in Indonesian.
- Tone: warm, empowering, practical, and scientifically grounded.
- Avoid medical diagnosis and avoid claiming certainty. Use probabilistic language.
- Make it easy to understand for general users.
- Output ONLY a valid JSON object (no markdown fences, no extra text).

Return JSON with this exact structure:
{
  "profile_summary": "<ringkasan profil 3-6 kalimat>",
  "thinking_process": "<cara otak memproses informasi 4-8 kalimat>",
  "cognitive_characteristics": ["<karakter 1>", "<karakter 2>", "<karakter 3>", "<karakter 4>"],
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>", "<strength 4>", "<strength 5>"],
  "challenges": ["<challenge 1>", "<challenge 2>", "<challenge 3>", "<challenge 4>"],
  "decision_making": "<cara mengambil keputusan 3-6 kalimat>",
  "learning_style": "<cara belajar paling cocok 3-6 kalimat>",
  "career_recommendations": ["<karir 1>", "<karir 2>", "<karir 3>", "<karir 4>", "<karir 5>"],
  "collaboration_tips": ["<tips 1>", "<tips 2>", "<tips 3>", "<tips 4>"],
  "conflict_potential": ["<potensi konflik 1>", "<potensi konflik 2>", "<potensi konflik 3>"],
  "self_development_tips": ["<tips 1>", "<tips 2>", "<tips 3>", "<tips 4>"],
  "disclaimer": "<1-2 kalimat disclaimer bahwa ini informasi pengembangan diri, bukan diagnosis>"
}`;

        const chatCompletion = await this.groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'meta-llama/llama-4-scout-17b-16e-instruct',
            temperature: 0.25,
            max_completion_tokens: 1100,
            response_format: { type: 'json_object' }
        });

        const content = chatCompletion.choices[0]?.message?.content;
        if (!content) {
            throw new Error('Failed to get response from Groq API - empty content');
        }

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

        return JSON.parse(jsonString);
    }
}
