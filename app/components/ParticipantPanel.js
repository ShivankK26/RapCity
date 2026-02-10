import styles from './ParticipantPanel.module.css'

export default function ParticipantPanel({
    agent,
    side = 'left', // 'left' or 'right'
    isActive = false,
    turnCount = 0 // How many turns this agent has used (max 5)
}) {
    const isLeft = side === 'left';
    const accentColor = isLeft ? 'var(--accent)' : 'var(--accent-cta)';

    if (!agent) {
        return (
            <div className={styles.panel} style={{ '--color-accent': 'var(--text-dim)' }}>
                <div className={styles.header}>
                    <div className={styles.avatar}>?</div>
                    <div className={styles.name}>WAITING FOR AGENT...</div>
                </div>
                <div className={styles.stats}>
                    <div className={styles.statRow}>
                        <span className={styles.statLabel}>Status</span>
                        <span className={styles.statValue} style={{ color: '#666' }}>OFFLINE</span>
                    </div>
                </div>
            </div>
        )
    }

    // Mock stats for visual flair - currently random to show "activity"
    // In a real version, this would come from the agent's profile
    const efficiency = Math.floor(Math.random() * (99 - 80) + 80);

    return (
        <div className={styles.panel} style={{ '--color-accent': accentColor }}>
            <div className={styles.header}>
                <div className={styles.role}>BUILDER {side === 'left' ? '01' : '02'}</div>
                <div className={styles.avatar}>
                    {agent.name.substring(0, 2).toUpperCase()}
                </div>
                <div className={styles.name}>{agent.name}</div>
            </div>

            <div className={styles.stats}>
                <div className={styles.statRow}>
                    <span className={styles.statLabel}>Status</span>
                    <span className={styles.statValue} style={{ color: isActive ? accentColor : '#666' }}>
                        {isActive ? 'BUILDING' : 'STANDBY'}
                    </span>
                </div>

                <div className={styles.statRow}>
                    <span className={styles.statLabel}>Efficiency</span>
                    <span className={styles.statValue}>{efficiency}.4%</span>
                </div>

                <div className={styles.statRow}>
                    <span className={styles.statLabel}>Collaboration</span>
                    <span className={styles.statValue}>HIGH</span>
                </div>

                <div className={styles.statRow}>
                    <span className={styles.statLabel}>Messages</span>
                    <span className={styles.statValue} style={{ color: turnCount >= 5 ? '#f59e0b' : accentColor }}>
                        {turnCount}/5
                    </span>
                </div>

                <div className={styles.statRow}>
                    <span className={styles.statLabel}>Agent ID</span>
                    <span className={styles.statValue}>{agent.agentId.substring(0, 8)}</span>
                </div>
            </div>

            <div className={styles.cpuLoad}>
                <div className={styles.cpuLabel}>Activity</div>
                <div className={styles.cpuBar}>
                    <div className={styles.cpuFill}></div>
                </div>
            </div>
        </div>
    )
}
