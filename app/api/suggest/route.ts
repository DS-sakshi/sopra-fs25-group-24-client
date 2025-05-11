import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Assistant ID for your Quoridor Strategy expert
// You need to create this assistant in the OpenAI dashboard or via API
const ASSISTANT_ID = 'asst_CN5iQl1ygzWPTfuEfxue0c2c'; 

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { gameState, strategy } = body;
    
    if (!gameState || !strategy) {
      return NextResponse.json({ error: 'Missing gameState or strategy' }, { status: 400 });
    }

    // Create a new thread
    const thread = await openai.beta.threads.create();

    // Add a message to the thread with the game state and strategy
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: `I'm playing Quoridor with the following game state: ${JSON.stringify(gameState)}. 
                Please suggest a ${strategy} strategy move.`
    });

    // Run the assistant on the thread
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: ASSISTANT_ID,
    });

    // Poll for the completion of the run
    let completedRun;
    while (true) {
      const runStatus = await openai.beta.threads.runs.retrieve(
        thread.id,
        run.id
      );
      
      if (runStatus.status === 'completed') {
        completedRun = runStatus;
        break;
      } else if (runStatus.status === 'failed' || runStatus.status === 'cancelled') {
        return NextResponse.json({ error: `Run ${runStatus.status}` }, { status: 500 });
      }
      
      // Wait a second before polling again
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Retrieve messages added by the assistant
    const messages = await openai.beta.threads.messages.list(thread.id);
    
    // Find the last assistant message
    const assistantMessages = messages.data.filter(msg => msg.role === 'assistant');
    if (assistantMessages.length === 0) {
      return NextResponse.json({ error: 'No response from assistant' }, { status: 500 });
    }

    const lastMessage = assistantMessages[0];
    const content = lastMessage.content[0].type === 'text' 
      ? lastMessage.content[0].text.value 
      : 'No text response received';
    
    // Parse the response to extract the suggestion
    let suggestion;
    try {
      // Try to find and parse JSON in the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        suggestion = JSON.parse(jsonMatch[0]);
      } else {
        // If no JSON found, create a structured response from the text
        suggestion = {
          action: content.includes('move') ? 'Move pawn' : content.includes('wall') ? 'Place wall' : 'pass',
          direction: content.includes('up') ? 'up' : 
                    content.includes('down') ? 'down' : 
                    content.includes('left') ? 'left' : 
                    content.includes('right') ? 'right' : undefined,
          wall: content.includes('wall') ? {
            placement: content.includes('front') ? 'in front of opponent' : 
                      content.includes('beside') ? 'beside opponent' : 'ahead of your path',
            orientation: content.includes('HORIZONTAL') ? 'HORIZONTAL' : 'VERTICAL'
          } : undefined,
          rationale: content
        };
      }
    } catch (error) {
      console.error('Error parsing assistant response:', error);
      return NextResponse.json({ 
        action: 'pass',
        rationale: content || 'Could not determine best move.'
      });
    }
    
    return NextResponse.json(suggestion);
  } catch (err: any) {
    console.error('Error:', err);
    return NextResponse.json({ error: err.message || 'API request failed' }, { status: 500 });
  }
}