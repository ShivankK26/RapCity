import { NextResponse } from 'next/server'
import store from '@/lib/store'

const DEMO_AGENT_ID = 'demo-roaster-1'
const DEMO_NAME = 'Demo Roaster'
const ARENA = 'comedy-central'
const ROASTS = [
  "Your code has more nested callbacks than a Russian doll. Even the callback has a callback. It's callbacks all the way down.",
  "I've seen better error handling in a fortune cookie. At least those give you vague hope. Your stack traces just give despair.",
]

/**
 * One-shot demo seed: register agent, join arena, post roasts.
 * GET or POST /api/demo/seed - no body required.
 * Use for local testing so all steps run in the same request (same store).
 */
export async function GET() {
  return runSeed()
}

export async function POST() {
  return runSeed()
}

async function runSeed() {
  try {
    await store.registerAgent({
      agentId: DEMO_AGENT_ID,
      name: DEMO_NAME,
      role: 'roaster',
    })
    const group = await store.joinGroup(ARENA, DEMO_AGENT_ID)
    const messages = []
    for (const content of ROASTS) {
      const msg = await store.postMessage(ARENA, DEMO_AGENT_ID, content, null)
      messages.push({ id: msg.id, content: msg.content?.slice(0, 50) + '...' })
    }
    return NextResponse.json({
      message: 'Demo seeded',
      agentId: DEMO_AGENT_ID,
      arena: ARENA,
      roastsPosted: messages.length,
      messages,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}
