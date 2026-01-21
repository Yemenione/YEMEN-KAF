'use server';

import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function generateProductDescription(name: string, category: string, keywords: string) {
    if (!process.env.GROQ_API_KEY) {
        return { error: 'Groq API Key is missing' };
    }

    try {
        const prompt = `
        You are an expert e-commerce copywriter for a luxury Yemeni storefront.
        Write a compelling, SEO-friendly product description for a product with the following details:
        
        Product Name: ${name}
        Category: ${category}
        Keywords/Features: ${keywords}
        
        The description should be:
        1. Engaging and premium in tone.
        2. Highlight the cultural heritage or quality if applicable.
        3. Approx 100-150 words.
        4. Formatted in plain text (no markdown symbols like ** or #).
        
        Output ONLY the description text.
        `;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 250,
        });

        const description = completion.choices[0]?.message?.content || '';
        return { description: description.trim() };

    } catch (error) {
        console.error('Error generating description:', error);
        return { error: 'Failed to generate description. Please try again.' };
    }
}

export async function translateContent(content: Record<string, string>, targetLanguages: string[], sourceLanguage: string = 'auto') {
    if (!process.env.GROQ_API_KEY) {
        return { error: 'Groq API Key is missing' };
    }

    try {
        const prompt = `
        You are a professional translator for a luxury e-commerce store.
        Translate the following JSON content from ${sourceLanguage} to these languages: ${targetLanguages.join(', ')}.

        Input JSON:
        ${JSON.stringify(content, null, 2)}

        Output Format:
        Return a JSON object where keys are the language codes (${targetLanguages.join(', ')}) and values are objects containing the translated keys.

        Example Output Structure:
        {
            "en": { "name": "...", "description": "..." },
            "fr": { "name": "...", "description": "..." }
        }

        Rules:
        1. Maintain the professional, luxury tone.
        2. Keep the same JSON structure keys within each language object.
        3. Do not translate branded terms like "Yem Kaf" or technical IDs.
        4. For Arabic, ensure correct grammar and terminology suitable for a Yemeni/Gulf audience.
        5. Output ONLY the valid JSON with translated values. No markdown blocks.
        `;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3,
            max_tokens: 2000,
            response_format: { type: 'json_object' }
        });

        const translatedText = completion.choices[0]?.message?.content || '{}';
        const translatedData = JSON.parse(translatedText);

        return { data: translatedData };

    } catch (error) {
        console.error('Error translating content:', error);
        return { error: 'Translation failed.' };
    }
}
