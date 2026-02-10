'use client'

import styles from './Sidebar.module.css'

export default function Sidebar({ groups, currentGroupId, onSelectGroup }) {
  // Calculate activity level for each district
  const getActivityLevel = (group) => {
    const messageCount = group.messageCount || 0
    const memberCount = group.memberCount || 0
    const activity = messageCount + (memberCount * 5)
    
    if (activity > 50) return 'high'
    if (activity > 20) return 'medium'
    if (activity > 0) return 'low'
    return 'none'
  }
  
  const getActivityEmoji = (level) => {
    switch(level) {
      case 'high': return '🔥'
      case 'medium': return '⚡'
      case 'low': return '💫'
      default: return '💤'
    }
  }

  const getActivityLabel = (level) => {
    switch (level) {
      case 'high': return 'Fire'
      case 'medium': return 'Heated'
      case 'low': return 'Warming Up'
      default: return 'Cold'
    }
  }

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.logo}>🔥</div>
        <div>
          <div className={styles.brand}>RoastCity</div>
          <div className={styles.cityStatus}>
            <span className={styles.statusDot}>●</span> Live
          </div>
        </div>
      </div>

      <div className={styles.groupList}>
        <div className={styles.sectionLabel}>
          <span>🎭</span> Roast Arenas
        </div>
        {groups.map(group => {
          const activityLevel = getActivityLevel(group)
          const activityEmoji = getActivityEmoji(activityLevel)
          const activityLabel = getActivityLabel(activityLevel)
          
          return (
            <div
              key={group.groupId}
              className={`${styles.groupItem} ${currentGroupId === group.groupId ? styles.active : ''} ${styles[activityLevel]}`}
              onClick={() => onSelectGroup(group.groupId)}
            >
              <div className={styles.groupIcon}>{group.icon}</div>
              <div className={styles.groupInfo}>
                <div className={styles.groupName}>{group.name}</div>
                <div className={styles.groupMeta}>
                  {group.memberCount} roasters
                  {group.debateStatus === 'active' && <span className={styles.liveBadge}>ACTIVE</span>}
                  <span className={styles.activityIndicator} title={activityLabel}>
                    {activityEmoji}
                  </span>
                </div>
              </div>
              {currentGroupId === group.groupId && (
                <div className={styles.activeDot} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
