import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { position, referralCode } = await req.json()

    const isTop50 = position <= 50

    const prompt = isTop50
      ? `You are a witty AI coach. The user just joined a waitlist and is in position #${position} out of competitive queue — they are in the TOP 50 which means they are currently WINNING a 3 year free AI subscription. Write a short, punchy, exciting 2-3 sentence welcome message. Be energetic and motivating. No hashtags. No emojis overload. Just sharp words.`
      : `You are a witty AI coach. The user just joined a waitlist at position #${position}. They need to reach Top 50 to win 3 years of free AI subscription. Each referral moves them 10 spots up. Write a short, punchy 2-3 sentence welcome message that creates urgency and motivates them to share their referral link. Be direct and exciting. No hashtags.`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 100,
      temperature: 0.9,
    })
    console.log("AI message completion:", completion)
    const message = completion.choices[0]?.message?.content || ''

    return NextResponse.json({ message })

  } catch (error) {
    console.error('Groq error:', String(error))
    // Don't fail the whole signup — just return empty
    return NextResponse.json({ message: '' })
  }
}