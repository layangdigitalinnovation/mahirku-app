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

            const prompt = `You are a professional graphology expert and talent mapping specialist.
Analyze the personality based on the provided handwriting sample and signature in the image.
First, extract all text written in the image. Then, provide a personalized graphology personality analysis.

CRITICAL INSTRUCTION: You MUST classify the person into EXACTLY ONE of the following 8 predefined Grapho-Types based on their handwriting characteristics:
1. The Trailblazer (Visioner Eksekutor) - Ambitious, fast thinker, risk-taker, macro-oriented.
2. The Precision Driver (Eksekutor Presisi) - Perfectionist, highly logical, accurate, zero-mistake oriented.
3. The Pure Analyst (Analis Murni) - Objective, rational, highly concentrated, sequential thinker.
4. The Independent Artisan (Spesialis Kreatif) - Creative, independent, detail-oriented in their art, visual thinker.
5. The Expressive Creator (Kreator Ekspresif) - Extroverted, charismatic, spontaneous, emotional, persuasive.
6. The Community Builder (Pembangun Komunitas) - Empathetic, patient, supportive, harmony-seeking.
7. The Strategic Planner (Perencana Strategis) - Systematic, long-term thinker, disciplined, stable.
8. The Steady Operator (Operator Konsisten) - Consistent, practical, reliable, handles routine well.

Write the analysis in Indonesian. Tone: professional, empowering, and scientifically grounded.
Do not include markdown code fences or extra text. Output ONLY a valid JSON object with this EXACT structure:
{
  "extracted_text": "<all text visible in the image>",
  "type_id": "<e.g., GRP-8-TRLBLZ, GRP-8-PRCDRV, GRP-8-PRANLS, GRP-8-INDART, GRP-8-EXPCRT, GRP-8-CMNBLD, GRP-8-STRPLN, GRP-8-STDYOP>",
  "title": "<The name of the chosen type, e.g., The Trailblazer>",
  "subtitle": "<The Indonesian subtitle, e.g., Visioner Eksekutor>",
  "match_score": "<e.g., 94%>",
  "summary": "<Personalized summary 2-4 sentences based on handwriting>",
  "brain_process": "<How their brain processes information 2-4 sentences>",
  "work_environment": "<Ideal work environment 2-3 sentences>",
  "traits": ["<trait 1>", "<trait 2>", "<trait 3>", "<trait 4>"],
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>", "<strength 4>"],
  "challenges": ["<challenge 1>", "<challenge 2>", "<challenge 3>"],
  "careers": ["<career 1>", "<career 2>", "<career 3>", "<career 4>", "<career 5>"],
  "collab_tips": ["<tip 1>", "<tip 2>", "<tip 3>"],
  "conflict_risks": ["<risk 1>", "<risk 2>"],
  "dev_tips": ["<tip 1>", "<tip 2>", "<tip 3>"]
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
                temperature: 0.25,
                max_completion_tokens: 1500,
                response_format: { type: 'json_object' }
            });

            const content = chatCompletion.choices[0]?.message?.content;
            if (!content) {
                throw new Error('Failed to get response from Groq API - empty content');
            }

            // Robust JSON extraction: handle markdown code fences if present
            let jsonString = content.trim();
            const fenceMatch = jsonString.match(/`{3}(?:json)?\s*([\s\S]*?)`{3}/);
            if (fenceMatch) {
                jsonString = fenceMatch[1].trim();
            }
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

    async generateDiscReport(input: {
        dominant_type: string;
        d_score: number;
        i_score: number;
        s_score: number;
        c_score: number;
    }): Promise<any> {
        if (!process.env.GROQ_API_KEY) {
            throw new Error('GROQ_API_KEY is not configured in environment variables.');
        }

        const prompt = `You are a professional psychologist specializing in DISC personality and behavioral assessments.

Generate a comprehensive DISC personality report based on the profile below.

PROFILE (JSON):
${JSON.stringify(input)}

Requirements:
- Write in Indonesian.
- Tone: professional, empowering, objective, and scientifically grounded.
- Avoid medical diagnosis and avoid claiming certainty. Use probabilistic language.
- Output ONLY a valid JSON object (no markdown fences, no extra text).

Return JSON with this exact structure:
{
  "profile_summary": "<ringkasan profil 3-6 kalimat>",
  "communication_style": "<gaya komunikasi utama 3-6 kalimat>",
  "behavior_traits": ["<karakter 1>", "<karakter 2>", "<karakter 3>", "<karakter 4>"],
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>", "<strength 4>", "<strength 5>"],
  "challenges": ["<titik buta 1>", "<titik buta 2>", "<titik buta 3>"],
  "work_environment": "<lingkungan kerja ideal 3-5 kalimat>",
  "career_recommendations": ["<karir 1>", "<karir 2>", "<karir 3>", "<karir 4>", "<karir 5>"],
  "collaboration_tips": ["<tips kolaborasi 1>", "<tips kolaborasi 2>", "<tips kolaborasi 3>"],
  "conflict_risks": ["<potensi konflik 1>", "<potensi konflik 2>", "<potensi konflik 3>"],
  "dev_tips": ["<tips pengembangan diri 1>", "<tips pengembangan diri 2>", "<tips pengembangan diri 3>"]
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
        const fenceMatch = jsonString.match(/`{3}(?:json)?\s*([\s\S]*?)`{3}/);
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
