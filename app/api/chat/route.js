import { NextResponse } from "next/server"
import OpenAI from "openai";
import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings } from "@langchain/openai";

const systemPrompt = `
    Hello! I'm your virtual assistant here to help you with any questions or issues you might have about Headerstarter. Whether you're gearing up for your next big technical interview or need assistance navigating the platform, I'm here to ensure you have the best experience possible. Here’s how I can assist you:

    Getting Started
    Account Setup: Step-by-step instructions to create and verify your account.
    Profile Customization: How to personalize your profile to match your interview goals.
    Introduction to Features: Overview of key features and how to use them effectively.

    Interview Practice
    Starting a Practice Session: How to initiate an AI-powered interview practice session.
    Choosing Interview Topics: Guidance on selecting the right technical topics for your practice.
    Real-time Feedback: Understanding the feedback provided by the AI and how to improve based on it.

    Technical Issues
    Login Problems: Help with password resets, account recovery, and login errors.
    Platform Navigation: Assistance with navigating the Headerstarter interface.
    Audio/Video Issues: Troubleshooting common problems with audio and video during practice sessions.
    AI Response Accuracy: Reporting issues with AI responses and how to get accurate answers.

    Subscription and Billing
    Plan Details: Information about our subscription plans and what each includes.
    Managing Your Subscription: How to upgrade, downgrade, or cancel your subscription.
    Billing Inquiries: Resolving billing issues, understanding charges, and accessing your payment history.

    Feedback and Suggestions
    Providing Feedback: How to give us feedback on your experience with Headerstarter.
    Feature Requests: Suggesting new features or improvements for the platform.
    Reporting Bugs: How to report any bugs or issues you encounter to our support team.

    Additional Resources
    Help Center: Access to our comprehensive help articles and guides.
    Community Forums: Engaging with other users, sharing tips, and discussing interview strategies.
    Support Contact: How to reach our support team for further assistance if needed.
    `

const embededModel = "text-embedding-ada-002";

const openAIKey = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
});

export async function POST(req){
    const openai = new OpenAI()
    const data = await req.json()

    // step 1: completion
    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: "system",
                content: systemPrompt
            },
            ...data
        ],
        model: "gpt-4o-mini",
        stream: true
    })

    // step 2: stream the completion
    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder(); // Converts text to Uint8Array
            try {
                for await (const chunk of completion) { // Wait for every chunk that the completion sends
                    const content = chunk.choices[0]?.delta?.content;
                    if (content) {
                        const text = encoder.encode(content);
                        controller.enqueue(text); // Send to controller after encoding
                    }
                }
            } catch (error) {
                controller.error(error);
            } finally {
                controller.close();
            }
        }
    });

    // return the stream
    return new NextResponse(stream);
}