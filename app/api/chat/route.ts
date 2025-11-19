// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";

// Simple streaming chat API
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const messages = body.messages || [];

        // Combine user messages into a single prompt
        const userPrompt = messages
            .map((m: any) => m.content || "")
            .join("\n");

        if (!userPrompt) {
            return new NextResponse("", { status: 200 });
        }

        const encoder = new TextEncoder();

        // Create a streaming LLM
        const llm = new ChatOpenAI({
            model: "meta-llama/llama-3.3-70b-instruct",
            temperature: 0.3,
            maxTokens: 700,
            apiKey: process.env.OPENROUTER_API_KEY,
            configuration: { baseURL: "https://openrouter.ai/api/v1" },
            streaming: true,
            callbacks: [
                {
                    handleLLMNewToken(token: string) {
                        controllerRef.enqueue(encoder.encode(token));
                    },
                } as any,
            ],
        } as any);

        let controllerRef: ReadableStreamDefaultController<Uint8Array>;
        const stream = new ReadableStream({
            async start(controller) {
                controllerRef = controller;
                // Add a tiny initial whitespace so client can start reading
                controller.enqueue(encoder.encode(" "));

                try {
                    await llm.invoke([{ role: "user", content: userPrompt }]);
                } catch (e: any) {
                    controller.enqueue(encoder.encode(`Error: ${e.message}`));
                } finally {
                    controller.close();
                }
            },
        });

        return new NextResponse(stream, {
            status: 200,
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-cache",
            },
        });
    } catch (err: any) {
        console.error("Error in /api/chat:", err);
        return new NextResponse(`Error: ${err.message}`, { status: 500 });
    }
}
