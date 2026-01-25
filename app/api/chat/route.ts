import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { prisma } from '@/lib/prisma';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
    try {
        const { message, history, sessionId, userId } = await req.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // 1. Manage Session
        let currentSessionId = sessionId;
        if (!currentSessionId) {
            const session = await prisma.chatSession.create({
                data: { userId: userId || null }
            });
            currentSessionId = session.id;
        }

        // 2. Log User Message
        await prisma.chatMessage.create({
            data: {
                sessionId: currentSessionId,
                text: message,
                isUser: true
            }
        });

        // 3. Fetch Context (Shipping & Config)
        const storeConfigs = await prisma.storeConfig.findMany({
            where: {
                key: { in: ['site_name', 'support_email', 'support_phone', 'currency'] }
            }
        });

        const configMap = storeConfigs.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        // 4. Construct System Prompt (Restricted Data & Salesman Persona)
        const systemPrompt = `
        You are a specialized Sales & Delivery Support Agent for "${configMap['site_name'] || 'Yemeni Market'}", a premium store for authentic Yemeni products (Sidr Honey, Coffee, Spices).
        
        YOUR CORE RULES:
        1. **RESTRICTED DATA:** You DO NOT have access to live stock counts, internal supplier names, or profit margins. Never make them up.
        2. **DELIVERY POLICY:**
           - We ship worldwide via DHL/FedEx.
           - Processing time: 24-48 hours.
           - Delivery time: 3-7 business days depending on location.
           - Shipping cost: Calculated at checkout based on weight.
        3. **ORDER STATUS:** You CANNOT see order status yet. If a user asks "Where is my order?", ask for their Order ID and kindly tell them to check the "Orders" tab in the app or contact ${configMap['support_email']}.
        4. **SALESMANSHIP:**
           - If a user asks generic questions (e.g., "What's good for flu?"), suggest "Royal Sidr Honey" and explain its benefits briefly.
           - Encourage adding items to the cart.
           - Be polite, concise (max 3 sentences), and professional.

        Your Context:
        - Email: ${configMap['support_email'] || 'support@yemenkaf.com'}
        - Phone: ${configMap['support_phone'] || '+967 777 123 456'}
        `;

        const messages = [
            { role: 'system', content: systemPrompt },
            ...(history || []).map((msg: any) => ({
                role: msg.isUser ? 'user' : 'assistant',
                content: msg.text
            })),
            { role: 'user', content: message }
        ];

        // 5. Call AI
        const completion = await groq.chat.completions.create({
            // @ts-ignore
            messages: messages,
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3, // Lower temperature for more factual responses
            max_tokens: 400,
        });

        const reply = completion.choices[0]?.message?.content || "I apologize, I couldn't process that. Please try again.";

        // 6. Log AI Response
        await prisma.chatMessage.create({
            data: {
                sessionId: currentSessionId,
                text: reply,
                isUser: false
            }
        });

        return NextResponse.json({
            response: reply,
            sessionId: currentSessionId
        });

    } catch (error) {
        console.error('Chat API Error:', error);
        return NextResponse.json(
            { error: 'Failed to process chat', details: error instanceof Error ? error.message : 'Unknown' },
            { status: 500 }
        );
    }
}
