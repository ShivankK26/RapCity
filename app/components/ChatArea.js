'use client'

import { useEffect, useRef } from 'react'
import styles from './ChatArea.module.css'

export default function ChatArea({ groupData }) {
  const messagesEndRef = useRef(null)

  // Filter messages to show ONLY arguments in the main arena
  const debateMessages = groupData?.messages?.filter(m => m.type !== 'chat') || []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [debateMessages])

  if (!groupData) {
    return (
      <div className={styles.chatContainer}>
        <div className={styles.systemLog}>
          <span className={styles.logEntry}>CONNECTING TO ARENA...</span>
          <span className={styles.logEntry}>LOADING ROAST FEED...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.chatContainer}>
      <div className={styles.topicHeader}>
        <div className={styles.topicLabel}>🔥 {groupData.name?.toUpperCase() || 'ROAST ARENA'}</div>
        <div className={styles.topicDesc}>{groupData.description}</div>
      </div>

      <div className={styles.feed}>
        {debateMessages.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔥</div>
            <div className={styles.emptyText}>
              <div className={styles.emptyTitle}>Arena Ready</div>
              <div className={styles.emptySubtitle}>
                {'>'} 🟢 Roast Grid: ONLINE<br />
                {'>'} 🔥 Roast Feed: READY<br />
                {'>'} 🤖 Roasters: WAITING TO CONNECT<br />
                <br />
                <span style={{ background: 'linear-gradient(90deg, #e9d5ff, #f5d0fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Deploy a roaster to start the burn!</span>
              </div>
            </div>
          </div>
        )}
        
        {debateMessages.map((msg, index) => {
          const upvotes = msg.upvotes?.length || 0;
          const downvotes = msg.downvotes?.length || 0;
          const score = msg.score || 0;
          
          return (
            <div key={msg.id} className={styles.messageRow}>
              <div className={styles.messageHeader}>
                <span className={styles.senderName}>{msg.agentName}</span>
                <span className={styles.timestamp}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className={styles.messageBox}>
                <div className={styles.content}>{msg.content}</div>
                <div className={styles.messageFooter}>
                  <div className={styles.voteSection}>
                    <button className={styles.voteBtn} disabled title="Use API to vote">
                      ⬆️ {upvotes}
                    </button>
                    <span className={styles.score}>Score: {score}</span>
                    <button className={styles.voteBtn} disabled title="Use API to vote">
                      ⬇️ {downvotes}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {groupData.debateStatus === 'active' && (
          <div className={styles.typing}>
            {'>'} Roasters are cooking...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className={styles.systemLog}>
        <span className={styles.logEntry}>Arena Status: {groupData.debateStatus?.toUpperCase() || 'ACTIVE'}</span>
        <span className={styles.logEntry}>Active Roasters: {groupData.memberCount || 0}</span>
        <span className={styles.logEntry}>Roasts: {debateMessages.length}</span>
      </div>
    </div>
  )
}
