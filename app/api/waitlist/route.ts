import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { nanoid } from 'nanoid'
import { sendWelcomeEmail, sendPositionChangeEmail } from '@/lib/email'

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

    // Insert new user
    const result = await sql`
      INSERT INTO waitlist (email, referral_code, referred_by, score)
      VALUES (${email}, ${referralCode}, ${referredBy ?? null}, 0)
      RETURNING id, email, referral_code
    `

    const newId = result[0].id

    // Set score = id so earlier joiners have lower base score
    await sql`
      UPDATE waitlist SET score = ${newId} WHERE id = ${newId}
    `

    // If referred — reduce referrer score by 10 and notify them
    if (referredBy) {
      const referrerBefore = await sql`
        SELECT id, email, referral_code FROM waitlist
        WHERE referral_code = ${referredBy}
      `

      if (referrerBefore.length > 0) {
        // Get old position before update
        const oldRankResult = await sql`
          SELECT position FROM (
            SELECT id, RANK() OVER (ORDER BY score ASC) as position
            FROM waitlist
          ) ranked
          WHERE id = ${referrerBefore[0].id}
        `
        const oldPosition = Number(oldRankResult[0].position)

        // Update referrer score
        await sql`
          UPDATE waitlist
          SET 
            score = score - 10,
            referral_count = referral_count + 1
          WHERE referral_code = ${referredBy}
        `

        // Get new position after update
        const newRankResult = await sql`
          SELECT position FROM (
            SELECT id, RANK() OVER (ORDER BY score ASC) as position
            FROM waitlist
          ) ranked
          WHERE id = ${referrerBefore[0].id}
        `
        const newPosition = Number(newRankResult[0].position)

        // Email referrer only if position actually changed
        if (oldPosition !== newPosition) {
          sendPositionChangeEmail(
            referrerBefore[0].email,
            oldPosition,
            newPosition,
            referrerBefore[0].referral_code
          ).catch(err => console.error('Position email error:', err))
        }
      }
    }

    // Get new user's final position
    const rankResult = await sql`
      SELECT position FROM (
        SELECT id, RANK() OVER (ORDER BY score ASC) as position
        FROM waitlist
      ) ranked
      WHERE id = ${newId}
    `
    const position = Number(rankResult[0].position)

    // Send welcome email — fire and forget, don't block response
    sendWelcomeEmail(email, position, referralCode)
      .catch(err => console.error('Welcome email error:', err))

    return NextResponse.json({
      success: true,
      position,
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