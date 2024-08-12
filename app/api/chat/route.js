import OpenAI from "openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Pinecone } from '@pinecone-database/pinecone';

const embedModel = "text-embedding-ada-002";

const openAIKey = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
});

const embeddings = new OpenAIEmbeddings({
    openaiApiKey: process.env.OPENAI_API_KEY,
    modelName: embedModel
});

const pineconeIndex = pc.Index(process.env.PINECONE_INDEX_NAME);

async function executeRAG(conversation) {
    const userMsg = conversation.slice(-7).map(
        message => `${message.role}: ${message.context}`
    ).join("\n\n\n\n\n\n\n");

    const latestMsg = conversation.filter(
        message => message.role === 'user'
    ).pop().context;

    const embededResponse = await openAIKey.embeddings.create({
        input: latestMsg,
        model: embedModel
    });
    }
    async function queryPineconeIndex(queryEmbedding) {
        const searchResults = await pineconeIndex.namespace('chatsupport').query({
            vector: queryEmbedding,
            topK: 10,
            includeMetadata: true,
        });
        return searchResults.matches.map(match => match.metadata.text);
    }

    const QueryText = `<CONTEXT>\n${context.slice(0, 10).join("\n---\n")}\n---\n</CONTEXT>\nCHAT:\n${userMsg}\nSAY:\n${latestMsg}`;

    const SystemPromptText = `"You are an expert in artificial intelligence with a deep understanding of various AI concepts, techniques, and applications. 
    Your role is to provide clear and accurate explanations about AI-related topics based on the context provided. If a question falls outside the scope of AI 
    or is unrelated to AI, respond with, 'Sorry, I can only assist with AI-related questions.' Always base your responses solely on the information given."`;

    const response = await openAIKey.chat.completions.create({
        model: "gpt-4o-mini",
        messages: 
        [
        { 
            role: "system", content: SystemPromptText
        }, 
        { 
            role: "user", content: QueryText
        }
        ],
        stream: true,
    });
    return response;


export async function POST(req) {
    try{

    const data = await req.json();
    const RAGData = await executeRAG(data);

    const stream = new ReadableStream({
        async start(controller) {
            const decoder = new TextDecoder();
            for await (const chunk of RAGData) {
                const text = decoder.decode(chunk, { 
                    stream: true
                 });
                controller.enqueue(text);
            }
            controller.close();
        }
    });
    return new Response(stream);
    } catch (err){
        console.log("Error!", err)
    }
}
