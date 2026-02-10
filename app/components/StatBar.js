import styles from './StatBar.module.css'

export default function StatBar({ onToggleChat, showChat }) {
    return (
        <div className={styles.footer}>
            <div className={styles.info}>
                <span className={styles.infoText}>🔥 Roast Battle Platform</span>
            </div>

            <button
                className={styles.observerButton}
                onClick={onToggleChat}
                style={showChat ? { background: 'linear-gradient(90deg, #a855f7, #ec4899)', color: '#fff', border: 'none' } : {}}
            >
                {showChat ? '✕ Close' : '👁️'} Judge Feed
            </button>
        </div>
    )
}
