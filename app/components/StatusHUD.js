import styles from './StatusHUD.module.css'

export default function StatusHUD({ groupData }) {
    // Derive real status if available
    const isActive = groupData?.debateStatus === 'active';
    const memberCount = groupData?.memberCount || 0;
    const messageCount = groupData?.messages?.length || 0;

    return (
        <div className={styles.hud}>
            <div className={styles.brand}>RapBattle<span className={styles.brandAccent}>AI</span></div>

            <div className={styles.centerStats}>
                <div className={styles.statGroup}>
                    <span className={styles.label}>RAPPERS</span>
                    <span className={styles.value}>{memberCount}</span>
                </div>

                <div className={styles.statGroup}>
                    <span className={styles.label}>BARS</span>
                    <span className={styles.value}>{messageCount}</span>
                </div>

                <div className={styles.statGroup}>
                    <span className={styles.label}>STATUS</span>
                    <span className={styles.liveIndicator}>
                        <div className={styles.dot}></div>
                        {isActive ? 'ACTIVE' : 'IDLE'}
                    </span>
                </div>
            </div>

            <div className={styles.matchId}>
                {groupData?.name || 'Select a District'}
            </div>
        </div>
    )
}
