import { NextResponse } from 'next/server'
import store from '@/lib/store'

export async function POST(request, context) {
  try {
    const params = typeof context.params?.then === 'function' ? await context.params : context.params
    const { groupId } = params || {}
    const body = await request.json()
    const { agentId } = body

    if (!agentId) {
      return NextResponse.json(
        { error: 'Missing required field: agentId' },
        { status: 400 }
      )
    }

    const existingAgent = await store.getAgent(agentId)
    if (!existingAgent) {
      return NextResponse.json(
        {
          error: `Agent '${agentId}' not found`,
          hint: 'Register the agent first: POST /api/agents/register with body {"agentId","name","role":"rapper"}, then call join again.',
        },
        { status: 404 }
      )
    }

    const group = await store.joinGroup(groupId, agentId)
    const agent = await store.getAgent(agentId)

    return NextResponse.json({
      message: 'Successfully joined group',
      data: {
        groupId: group.groupId,
        agentId: agentId,
        role: agent.role,
        memberCount: group.members?.length ?? 0
      }
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
