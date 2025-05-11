
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { gameState, strategy } = body;
  
  if (!gameState || !strategy) {
    return NextResponse.json({ error: 'Missing gameState or strategy' }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  const openai = new OpenAI({ apiKey });
  const systemPrompt = `
You are the Quoridor Strategy Expert, a specialized AI that analyzes game states and suggests optimal moves based on the three strategies - defensive, offensive and safe.

GAME RULES:
- Quoridor is played on a 9×9 grid
- Players move pawns toward the opposite side of the board
- Players can place walls to block opponents
- A valid move is to adjacent squares (not diagonal)
- Walls cannot completely block a path to goal
- Players win by reaching the opposite edge

GAME STATE CONTEXT:
- boardSize: Size of the board (typically 9)
- yourPosition: [row, column] coordinates of player's pawn
- opponentPosition: [row, column] coordinates of opponent's pawn
- yourWallsLeft: Number of walls the player has remaining
- opponentWallsLeft: Number of walls the opponent has remaining

When given ${strategy} strategy:
- Offensive: Focus on fastest route to goal, minimal wall placement unless critical
- Defensive: Focus on blocking opponent's progress with strategic wall placements
- Safe: Balance between progress and preventing opponent advancement

PROVIDE EXACTLY ONE SUGGESTION in this JSON format:
{
  "action": "Move pawn" | "Place wall" | "pass",
  "direction": "up" | "down" | "left" | "right", // Only for move pawn actions, relative to the board
  "wall": {                  // Only for place wall actions
    "placement": "in front of opponent" | "right side of the opponent" |"left side of the opponent" | "ahead of your path" | "right side to your path" |"left side to your path",
    "orientation": "HORIZONTAL" | "VERTICAL"
  },
  "rationale": "Clear explanation of why this is the best move"
}

For "place wall" actions:
- Placement describes where to place the wall relative to players
- Orientation specifies horizontal or vertical placement

For "move pawn" actions:
- "up" means moving toward the top edge of the board.
- "down" means moving toward the bottom edge of the board.
- "left" means moving toward the left edge of the board.
- "right" means moving toward the right edge of the board.

The player's goal is to reach the edge of the board opposite from their starting position.

OUTPUT CONSTRAINT:
- Do NOT mention any row or column numbers or coordinates in your action, direction or rationale.
- The response should always be less than 50 words and minimal.
`;

  const userPrompt =
    `GameState: ${JSON.stringify(gameState)}\n` +
    `Strategy: "${strategy}"\n\n` +
    `Return exactly one JSON object as described.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-nano-2025-04-14',
      temperature: 0,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
    });

    const content = response.choices[0].message?.content?.trim() ?? '';
    const suggestion = JSON.parse(content || '{}');
    return NextResponse.json(suggestion);
  } catch (err: any) {
    console.error('OpenAI error:', err);
    return NextResponse.json({ error: err.message || 'OpenAI request failed' }, { status: 500 });
  }
}