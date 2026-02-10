import { NextResponse } from 'next/server'
import store from '@/lib/store'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    
    const leaderboard = await store.getLeaderboard(limit)
    
    return NextResponse.json({
      leaderboard,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
