require('dotenv').config();
const Groq = require('groq-sdk');
const fs = require('fs');
const https = require('https');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

async function downloadImageAndTest() {
    return new Promise((resolve) => {
        https.get('https://raw.githubusercontent.com/groq/groq-api-cookbook/main/images/groq-logo.png', (res) => {
            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', async () => {
                const buffer = Buffer.concat(chunks);
                const base64 = buffer.toString('base64');
                const dataUrl = `data:image/png;base64,${base64}`;
                
                try {
                    console.log("Testing meta-llama/llama-4-scout-17b-16e-instruct with valid downloaded image...");
                    const chatCompletion = await groq.chat.completions.create({
                        messages: [
                            {
                                role: 'user',
                                content: [
                                    { type: 'text', text: "What is this image?" },
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
                        max_completion_tokens: 30,
                    });
                    console.log(`Success! Response: ${chatCompletion.choices[0].message.content}`);
                } catch (e) {
                    console.error(`Error:`, e.status, e.message);
                }
                resolve();
            });
        });
    });
}

downloadImageAndTest();
