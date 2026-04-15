import { NextResponse } from 'next/server'
import sql from "../../../lib/db"

export async function GET() {
  try {
    const result = await sql`SELECT NOW() as time`
    return NextResponse.json({ 
      status: 'connected', 
      time: result[0].time 
    })
  } catch (error) {
    return NextResponse.json({ 
      status: 'failed', 
      error: String(error) 
    }, { status: 500 })
  }
}