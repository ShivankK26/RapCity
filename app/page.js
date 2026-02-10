'use client'

import { useState, useEffect } from 'react'
import Landing from './components/Landing'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import ParticipantPanel from './components/ParticipantPanel'
import StatusHUD from './components/StatusHUD'
import StatBar from './components/StatBar'
import SpectatorChat from './components/SpectatorChat'
import styles from './page.module.css'

export default function Home() {
  const [showLanding, setShowLanding] = useState(true)
  const [currentGroupId, setCurrentGroupId] = useState('comedy-central')
  const [currentGroupData, setCurrentGroupData] = useState(null)
  const [groups, setGroups] = useState([])
  const [showSpectatorChat, setShowSpectatorChat] = useState(false)

  // Fetch group list
  const fetchGroups = async () => {
    try {
      const res = await fetch('/api/groups')
      const data = await res.json()
      setGroups(data.groups || [])
    } catch (error) {
      console.error('Failed to fetch groups:', error)
    }
  }

  // Polling for groups (sidebar stats)
  useEffect(() => {
    if (!showLanding) {
      fetchGroups()
      const interval = setInterval(fetchGroups, 5000)
      return () => clearInterval(interval)
    }
  }, [showLanding])

  // Polling for active group data
  useEffect(() => {
    if (currentGroupId && !showLanding) {
      fetchGroupData()
      const interval = setInterval(fetchGroupData, 3000)
      return () => clearInterval(interval)
    }
  }, [currentGroupId, showLanding])

  const fetchGroupData = async () => {
    try {
      const [groupRes, messagesRes, membersRes] = await Promise.all([
        fetch(`/api/groups/${currentGroupId}`),
        fetch(`/api/groups/${currentGroupId}/messages`),
        fetch(`/api/groups/${currentGroupId}/members`)
      ])

      const [group, messages, members] = await Promise.all([
        groupRes.json(),
        messagesRes.json(),
        membersRes.json()
      ])

      setCurrentGroupData({
        ...group,
        messages: messages.messages || [],
        members: members.members || []
      })
    } catch (error) {
      console.error('Failed to fetch group data:', error)
    }
  }

  if (showLanding) {
    return <Landing onEnter={() => setShowLanding(false)} />
  }

  return (
    <div className={styles.mainContainer}>
      <Sidebar
        groups={groups}
        currentGroupId={currentGroupId}
        onSelectGroup={setCurrentGroupId}
      />

      <div className={styles.chatContainer}>
        <StatusHUD groupData={currentGroupData} />
        <ChatArea groupData={currentGroupData} />
        <StatBar
          onToggleChat={() => setShowSpectatorChat(!showSpectatorChat)}
          showChat={showSpectatorChat}
        />

        {showSpectatorChat && (
          <SpectatorChat
            messages={currentGroupData?.messages}
            onClose={() => setShowSpectatorChat(false)}
          />
        )}
      </div>
    </div>
  )
}
