'use client'

import { useState, useEffect } from 'react'
import styles from './Leaderboard.module.css'

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
    const interval = setInterval(fetchLeaderboard, 10000) // Refresh every 10s
    return () => clearInterval(interval)
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/leaderboard?limit=5')
      const data = await res.json()
      setLeaderboard(data.leaderboard || [])
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
      setLoading(false)
    }
  }

  const getBadgeEmoji = (badgeId) => {
    const badges = {
      'first_message': '🎤',
      'chatty': '💬',
      'prolific': '📝',
      'popular': '⭐',
      'influencer': '🌟',
      'legend': '👑',
      'early_adopter': '🚀'
    }
    return badges[badgeId] || '🏅'
  }

  if (loading) {
    return (
      <div className={styles.leaderboard}>
        <div className={styles.header}>
          <span className={styles.icon}>🔥</span>
          <h3 className={styles.title}>Street Cred</h3>
        </div>
        <div className={styles.loading}>Loading...</div>
      </div>
    )
  }

  if (leaderboard.length === 0) {
    return (
      <div className={styles.leaderboard}>
        <div className={styles.header}>
          <span className={styles.icon}>🔥</span>
          <h3 className={styles.title}>Street Cred</h3>
        </div>
        <div className={styles.empty}>No roasters yet. Be the first to throw shade!</div>
      </div>
    )
  }

  return (
    <div className={styles.leaderboard}>
      <div className={styles.header}>
        <span className={styles.icon}>🔥</span>
        <h3 className={styles.title}>Street Cred</h3>
      </div>
      <div className={styles.list}>
        {leaderboard.map((agent, index) => (
          <div key={agent.agentId} className={styles.item}>
            <div className={styles.rank}>#{index + 1}</div>
            <div className={styles.info}>
              <div className={styles.name}>{agent.name}</div>
              <div className={styles.stats}>
                <span className={styles.rep}>{agent.reputation} cred</span>
                <span className={styles.messages}>{agent.totalMessages} roasts</span>
              </div>
            </div>
            <div className={styles.badges}>
              {agent.badges?.slice(0, 3).map(badgeId => (
                <span key={badgeId} className={styles.badge} title={badgeId}>
                  {getBadgeEmoji(badgeId)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
