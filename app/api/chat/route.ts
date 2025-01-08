// Updated Route (chat.ts) to use Gemini streaming and adjust frontend accordingly

import { NextRequest, NextResponse } from 'next/server';
import { supabase, genAI } from '../../../scripts/admin';

const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export const runtime = 'edge';

type MessageRole = 'user' | 'assistant' | 'model';

type Document = {
  id: number;
  user_id: string;
  documentid: string;
  text_chunk: string;
  metadata: object;
};

type Message = {
  role: MessageRole;
  content: string;
};

type GeminiMessage = {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
};

const formatMessagesForGemini = (messages: Message[]): GeminiMessage[] => {
  return messages.map(message => ({
    role: message.role === 'assistant' ? 'model' : message.role,
    parts: [{ text: message.content }]
  }));
};

async function searchSupabase(chatId: string, query: string) {
  const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
  const embeddingResult = await embeddingModel.embedContent(query);
  const query_embedding = embeddingResult.embedding.values;

  if (!Array.isArray(query_embedding) || query_embedding.length !== 768) {
    throw new Error(
      'Invalid query embedding: must be an array of 768 numbers.',
    );
  }

  let { data, error } = await supabase.rpc('docusuite_search', {
    document_id: chatId,
    match_count: 3,
    query_embedding: query_embedding,
    similarity_threshold: 0.1,
  });

  if (error) throw new Error(`Supabase search error: ${error.message}`);
  return data;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];
    const chatId = body.chatId;

    if (!messages.length) {
      throw new Error('No messages provided.');
    }

    const currentMessage = messages[messages.length - 1];
    const previousMessages = formatMessagesForGemini(messages.slice(0, -1));

    //console.log("Previous Messages", previousMessages)
    //console.log("current Messages", currentMessage)
    
    // Get context from Supabase (keeping existing implementation)
    const documents = await searchSupabase(chatId, currentMessage.content);
    const context = documents.map((doc: Document) => doc.text_chunk).join(' ');
    
    const chat = model.startChat({
      history: previousMessages,
    });

    const prompt = `Context: ${context}\n\nQuestion: ${currentMessage.content}\n\nPlease provide a relevant answer based on the context provided.`;
    const responseStream = await chat.sendMessageStream(prompt);

    // Prepare sources header
    const serializedSources = Buffer.from(
      JSON.stringify(
        documents.map((doc: Document) => ({
          pageContent: doc.text_chunk.slice(0, 50) + '...',
          metadata: doc.metadata,
        })),
      ),
    ).toString('base64');

    // Create encoder for the stream
    const encoder = new TextEncoder();

    // Create a properly formatted stream with error handling
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Stream each chunk with proper formatting
          for await (const chunk of responseStream.stream) {
            const text = chunk.text();
            
            // Format as SSE data
            const formattedChunk = `data: ${JSON.stringify({
              text,
              done: false
            })}\n\n`;
            
            controller.enqueue(encoder.encode(formattedChunk));
          }

          // Send final done message
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
          );
          
          controller.close();
        } catch (error) {
          // Handle streaming errors
          controller.error(error);
        }
      },
    });

    // Return properly formatted streaming response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Message-Index': (previousMessages.length + 1).toString(),
        'X-Sources': serializedSources,
        // Enable streaming for Vercel Edge Functions
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// Add this type for better type safety
type StreamChunk = {
  text: string;
  done: boolean;
}