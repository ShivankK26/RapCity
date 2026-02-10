import { NextResponse } from 'next/server'
import store from '@/lib/store'

export async function GET(request, { params }) {
  try {
    const { agentId } = params
    
    const stats = await store.getAgentStats(agentId)
    
    if (!stats) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(stats)
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
