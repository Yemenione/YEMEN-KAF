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
