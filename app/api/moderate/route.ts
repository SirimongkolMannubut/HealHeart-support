import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    const moderation = await openai.moderations.create({
      input: text,
    });

    const result = moderation.results[0];
    
    return NextResponse.json({
      flagged: result.flagged,
      categories: result.categories,
      category_scores: result.category_scores,
    });
  } catch (error) {
    console.error('Moderation error:', error);
    return NextResponse.json({ flagged: false }, { status: 500 });
  }
}
