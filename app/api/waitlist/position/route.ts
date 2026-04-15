import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json(
        { error: 'Referral code required' },
        { status: 400 }
      )
    }

    // Get user by referral code
    const user = await sql`
      SELECT id, referral_count 
      FROM waitlist 
      WHERE referral_code = ${code}
    `

    if (user.length === 0) {
      return NextResponse.json(
        { error: 'Code not found' },
        { status: 404 }
      )
    }

    // Calculate live rank using score
    const rankResult = await sql`
      SELECT position FROM (
        SELECT id, RANK() OVER (ORDER BY score ASC) as position
        FROM waitlist
      ) ranked
      WHERE id = ${user[0].id}
    `

    return NextResponse.json({
      position: Number(rankResult[0].position),
      referralCount: Number(user[0].referral_count),
    })

  } catch (error) {
    console.error('Position check error:', String(error))
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}