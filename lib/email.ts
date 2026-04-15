import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || ''
const FROM_EMAIL = 'QuizWait <onboarding@resend.dev>'

// Welcome email — sent when someone joins the waitlist
export async function sendWelcomeEmail(
  email: string,
  position: number,
  referralCode: string
) {
  const referralUrl = `${APP_URL}/ref?r=${referralCode}`
  const isTop50 = position <= 50

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `You're #${position} on the QuizWait list 🧠`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0a0a0f;color:#ffffff;border-radius:16px;">
        
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:24px;">
          <div style="width:36px;height:36px;background:linear-gradient(135deg,#7c3aed,#06b6d4);border-radius:10px;display:flex;align-items:center;justify-content:center;">
            <span style="color:white;font-weight:900;font-size:16px;">Q</span>
          </div>
          <span style="font-weight:800;font-size:18px;">Quiz<span style="color:#a78bfa;">Wait</span></span>
        </div>

        <h1 style="font-size:28px;font-weight:800;margin:0 0 8px;">
          You're in! 🎉
        </h1>

        <p style="color:#9ca3af;margin:0 0 24px;">
          You've secured your spot on the QuizWait waitlist.
        </p>

        <div style="background:${isTop50 ? 'rgba(245,158,11,0.1)' : 'rgba(124,58,237,0.1)'};border:1px solid ${isTop50 ? 'rgba(245,158,11,0.3)' : 'rgba(124,58,237,0.3)'};border-radius:12px;padding:24px;text-align:center;margin-bottom:16px;">
          <p style="color:#9ca3af;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 4px;">Your Position</p>
          <p style="font-size:56px;font-weight:900;margin:0;background:linear-gradient(135deg,${isTop50 ? '#f59e0b,#f97316' : '#a78bfa,#22d3ee'});-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
            #${position}
          </p>
          ${isTop50
            ? `<p style="color:#fbbf24;font-size:13px;margin:8px 0 0;">🏆 You're in the Top 50 — you're winning!</p>`
            : `<p style="color:#9ca3af;font-size:13px;margin:8px 0 0;">Refer ${Math.ceil((position - 50) / 10)} friends to enter Top 50</p>`
          }
        </div>

        <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);border-radius:12px;padding:16px;margin-bottom:16px;">
          <p style="color:#fbbf24;font-size:13px;font-weight:600;margin:0 0 4px;">🏆 Grand Prize</p>
          <p style="color:#9ca3af;font-size:13px;margin:0;">Top 50 at launch win 3 years free — ChatGPT Plus or Claude Pro, your choice.</p>
        </div>

        <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px;margin-bottom:24px;">
          <p style="color:#9ca3af;font-size:13px;margin:0 0 8px;">⚡ Each referral moves you <strong style="color:white;">10 spots up.</strong> Positions change in real time.</p>
          <p style="color:#9ca3af;font-size:13px;margin:0;">Your referral link:</p>
          <p style="color:#a78bfa;font-size:13px;margin:4px 0 0;word-break:break-all;">${referralUrl}</p>
        </div>

        <a href="${referralUrl}" style="display:block;text-align:center;background:linear-gradient(135deg,#7c3aed,#06b6d4);color:white;font-weight:700;font-size:15px;padding:14px;border-radius:12px;text-decoration:none;margin-bottom:24px;">
          Copy & Share Your Referral Link
        </a>

        <p style="color:#4b5563;font-size:11px;text-align:center;margin:0;">
          You're receiving this because you joined QuizWait.<br/>
          <a href="#" style="color:#6b7280;">Unsubscribe</a>
        </p>

      </div>
    `,
  })
}

// Position change email — sent when someone's position changes
export async function sendPositionChangeEmail(
  email: string,
  oldPosition: number,
  newPosition: number,
  referralCode: string
) {
  const referralUrl = `${APP_URL}/ref?r=${referralCode}`
  const moved = oldPosition - newPosition
  const isTop50 = newPosition <= 50

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Your position changed — you're now #${newPosition} 📈`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0a0a0f;color:#ffffff;border-radius:16px;">

        <div style="display:flex;align-items:center;gap:8px;margin-bottom:24px;">
          <div style="width:36px;height:36px;background:linear-gradient(135deg,#7c3aed,#06b6d4);border-radius:10px;display:flex;align-items:center;justify-content:center;">
            <span style="color:white;font-weight:900;font-size:16px;">Q</span>
          </div>
          <span style="font-weight:800;font-size:18px;">Quiz<span style="color:#a78bfa;">Wait</span></span>
        </div>

        <h1 style="font-size:24px;font-weight:800;margin:0 0 8px;">
          Your position just changed! 📈
        </h1>
        <p style="color:#9ca3af;margin:0 0 24px;">
          Someone used your referral link and you moved up.
        </p>

        <div style="background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.3);border-radius:12px;padding:24px;text-align:center;margin-bottom:16px;">
          <div style="display:flex;align-items:center;justify-content:center;gap:16px;">
            <div>
              <p style="color:#6b7280;font-size:11px;text-transform:uppercase;margin:0 0 2px;">Was</p>
              <p style="font-size:36px;font-weight:900;color:#6b7280;margin:0;">#${oldPosition}</p>
            </div>
            <p style="font-size:24px;margin:0;">→</p>
            <div>
              <p style="color:#9ca3af;font-size:11px;text-transform:uppercase;margin:0 0 2px;">Now</p>
              <p style="font-size:36px;font-weight:900;background:linear-gradient(135deg,#a78bfa,#22d3ee);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin:0;">#${newPosition}</p>
            </div>
          </div>
          <p style="color:#a78bfa;font-size:13px;margin:12px 0 0;">You moved up ${moved} spot${moved !== 1 ? 's' : ''}!</p>
          ${isTop50
            ? `<p style="color:#fbbf24;font-size:13px;margin:8px 0 0;">🏆 You're in the Top 50 — you're winning!</p>`
            : `<p style="color:#9ca3af;font-size:13px;margin:8px 0 0;">Refer ${Math.ceil((newPosition - 50) / 10)} more friends to enter Top 50</p>`
          }
        </div>

        <a href="${referralUrl}" style="display:block;text-align:center;background:linear-gradient(135deg,#7c3aed,#06b6d4);color:white;font-weight:700;font-size:15px;padding:14px;border-radius:12px;text-decoration:none;margin-bottom:24px;">
          Share Your Link — Keep Climbing
        </a>

        <p style="color:#4b5563;font-size:11px;text-align:center;margin:0;">
          You're receiving this because you joined QuizWait.<br/>
          <a href="#" style="color:#6b7280;">Unsubscribe</a>
        </p>

      </div>
    `,
  })
}