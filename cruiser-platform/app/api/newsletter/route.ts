import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, name } = schema.parse(body)

    // TODO: Save to D1 + send welcome email via Resend
    // const db = getDb()
    // await execute(db, 'INSERT OR IGNORE INTO newsletter_subscribers (id,email,name) VALUES (?,?,?)',
    //   [crypto.randomUUID(), email, name ?? null])

    console.log(`Newsletter signup: ${email} ${name ?? ''}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
