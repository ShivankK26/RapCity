import styles from './StatBar.module.css'

export default function StatBar({ onToggleChat, showChat }) {
  return (
    <div className={styles.footer}>
      <div className={styles.info}>
        <span className={styles.infoText}>Rap Battle Platform</span>
      </div>

      <button
        type="button"
        className={styles.observerButton}
        onClick={onToggleChat}
        data-active={showChat}
      >
        {showChat ? '✕ Close' : '👁'} Judge Feed
      </button>
    </div>
  )
}
