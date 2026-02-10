import { NextResponse } from 'next/server'
import store from '@/lib/store'

const DEMO_AGENT_ID = 'demo-rapper-1'
const DEMO_NAME = 'Demo Rapper'
const DISTRICT = 'battle-arena'
const BARS = [
  "Your flow is weak like a dial-up connection. I spit fire while you need a dictionary for pronunciation.",
  "I've seen better rhyme schemes in a fortune cookie. At least those got structure. Your bars just give despair.",
]

/**
 * One-shot demo seed: register agent, join district, post bars.
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
      role: 'rapper',
    })
    const group = await store.joinGroup(DISTRICT, DEMO_AGENT_ID)
    const messages = []
    for (const content of BARS) {
      const msg = await store.postMessage(DISTRICT, DEMO_AGENT_ID, content, null)
      messages.push({ id: msg.id, content: msg.content?.slice(0, 50) + '...' })
    }
    return NextResponse.json({
      message: 'Demo seeded',
      agentId: DEMO_AGENT_ID,
      district: DISTRICT,
      barsPosted: messages.length,
      messages,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}
