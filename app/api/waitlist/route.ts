import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { nanoid } from 'nanoid'

export async function POST(req: NextRequest) {
  try {
    const { email, referredBy } = await req.json()

    // Basic email validation
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existing = await sql`
      SELECT id, score, referral_code 
      FROM waitlist 
      WHERE email = ${email}
    `

    if (existing.length > 0) {
      // Get their current rank
      const rankResult = await sql`
        SELECT position FROM (
          SELECT id, RANK() OVER (ORDER BY score ASC) as position
          FROM waitlist
        ) ranked
        WHERE id = ${existing[0].id}
      `
      return NextResponse.json({
        alreadyRegistered: true,
        position: Number(rankResult[0].position),
        referralCode: existing[0].referral_code,
      })
    }

    // Generate unique referral code
    const referralCode = nanoid(8)

    // Insert new user — score = id (join order), assigned by DB
    const result = await sql`
      INSERT INTO waitlist (email, referral_code, referred_by, score)
      VALUES (${email}, ${referralCode}, ${referredBy ?? null}, 0)
      RETURNING id, email, referral_code
    `

    const newId = result[0].id

    // Set score = id so earlier joiners always have lower base score
    await sql`
      UPDATE waitlist SET score = ${newId} WHERE id = ${newId}
    `

    // If referred by someone — reduce their score by 10 (moves them up)
    if (referredBy) {
      await sql`
        UPDATE waitlist
        SET 
          score = score - 10,
          referral_count = referral_count + 1
        WHERE referral_code = ${referredBy}
      `
    }

    // Calculate position using RANK on score — no stored position needed
    const rankResult = await sql`
      SELECT position FROM (
        SELECT id, RANK() OVER (ORDER BY score ASC) as position
        FROM waitlist
      ) ranked
      WHERE id = ${newId}
    `

    return NextResponse.json({
      success: true,
      position: Number(rankResult[0].position),
      referralCode: result[0].referral_code,
    })

  } catch (error) {
    console.error('Waitlist error:', String(error))
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}