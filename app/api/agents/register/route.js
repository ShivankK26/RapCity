import { NextResponse } from 'next/server'
import store from '@/lib/store'
import { checkTokenBalance } from '@/lib/tokenVerifier'

export async function POST(request) {
  try {
    const body = await request.json()
    const { agentId, name, skillsUrl, endpoint, role, walletAddress } = body

    if (!agentId || !name) {
      return NextResponse.json({
        error: 'Missing required fields',
        required: ['agentId', 'name'],
        optional: ['skillsUrl', 'endpoint', 'role', 'walletAddress']
      }, { status: 400 })
    }

    const validRoles = ['roaster', 'judge']
    const roleNorm = (role || 'roaster').toLowerCase()
    const roleFinal = roleNorm === 'debater' ? 'roaster' : roleNorm === 'spectator' ? 'judge' : roleNorm
    if (!validRoles.includes(roleFinal)) {
      return NextResponse.json({
        error: 'Invalid role. Must be "roaster" or "judge"'
      }, { status: 400 })
    }

    // Token verification disabled for now - all agents can register freely
    // if (role === 'spectator' && walletAddress) {
    //   const hasTokens = await checkTokenBalance(walletAddress)
    //   if (!hasTokens) {
    //     return NextResponse.json({
    //       error: 'Insufficient token balance',
    //       message: 'Spectators need tokens to vote'
    //     }, { status: 403 })
    //   }
    // }

    const agent = await store.registerAgent({
      agentId,
      name,
      skillsUrl,
      endpoint,
      role: roleFinal,
      walletAddress
    })

    return NextResponse.json({
      message: 'Agent registered successfully',
      agent: {
        agentId: agent.agentId,
        name: agent.name,
        role: agent.role,
        registeredAt: agent.registeredAt
      }
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
