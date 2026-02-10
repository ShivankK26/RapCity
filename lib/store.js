// In-memory store (Redis optional)
import topicGenerator from './topicGenerator.js'

// In-memory storage
const agents = new Map()
const groups = new Map()
let messageCounter = 0
let groupsInitialized = false

// Pre-seed default groups - RapBattleAI districts (from skills.md)
const defaultGroups = [
  { groupId: 'battle-arena', name: 'Battle Arena', description: '1v1 rap battles', icon: '🔥', topic: 'Head-to-head', purpose: '1v1 battles' },
  { groupId: 'cypher-circle', name: 'Cypher Circle', description: 'Group freestyle', icon: '🎵', topic: 'Round robin', purpose: 'Group freestyle' },
  { groupId: 'written-bars', name: 'Written Bars', description: 'Pre-composed verses', icon: '📝', topic: 'Written verses', purpose: 'Pre-written' },
  { groupId: 'beat-lab', name: 'Beat Lab', description: 'Create beats with words', icon: '🎹', topic: 'Beat + bars', purpose: 'Beat Lab' },
  { groupId: 'championship', name: 'Championship', description: 'Tournament mode', icon: '👑', topic: 'Tournament', purpose: 'Championship' },
]

// Initialize default groups (only once)
function initializeDefaultGroups() {
  if (groupsInitialized) return

  console.log('[RapBattleAI] Initializing districts...')

  for (const g of defaultGroups) {
    const group = {
      ...g,
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      members: [],
      messages: [],
      debateStatus: 'active',
      debaterMessageCounts: {},
      stances: {},
      debateEndedAt: null
    }
    
    groups.set(g.groupId, group)
  }

  groupsInitialized = true
  console.log(`[RapBattleAI] Initialized ${defaultGroups.length} districts`)
}

// Initialize on module load
initializeDefaultGroups()

function normalizeRole(role) {
  if (!role) return 'rapper'
  const r = (role || '').toLowerCase()
  if (r === 'debater' || r === 'roaster') return 'rapper'
  if (r === 'spectator') return 'judge'
  return r === 'judge' ? 'judge' : 'rapper'
}

async function registerAgent({ agentId, name, skillsUrl, endpoint, role, walletAddress }) {
  if (!agentId || !name) {
    throw new Error('Missing required fields: agentId, name')
  }

  const agent = {
    agentId,
    name,
    skillsUrl: skillsUrl || 'none',
    endpoint: endpoint || 'none',
    role: normalizeRole(role),
    walletAddress: walletAddress || null,
    registeredAt: new Date().toISOString(),
    groups: ['battle-arena'],
    // Reputation system
    reputation: 0,
    totalMessages: 0,
    totalUpvotes: 0,
    badges: [],
    lastActive: new Date().toISOString()
  }

  agents.set(agentId, agent)

  // Add to Battle Arena district
  const battleArena = groups.get('battle-arena')
  if (battleArena && !battleArena.members.includes(agentId)) {
    battleArena.members.push(agentId)
  }

  return agent
}

async function getAgent(agentId) {
  return agents.get(agentId) || null
}

async function getAllAgents() {
  return Array.from(agents.values())
}

async function agentExists(agentId) {
  return agents.has(agentId)
}

async function createGroup({ groupId, name, description, icon, topic, createdBy }) {
  const group = {
    groupId,
    name,
    description: description || '',
    icon: icon || '💬',
    topic: topic || topicGenerator.getRandomTopic().topic,
    purpose: '',
    createdBy,
    createdAt: new Date().toISOString(),
    members: [createdBy],
    messages: [],
    debateStatus: 'active',
    debaterMessageCounts: {},
    stances: {},
    debateEndedAt: null
  }

  groups.set(groupId, group)

  // Add creator to group
  const agent = agents.get(createdBy)
  if (agent) {
    agent.groups.push(groupId)
  }

  return group
}

async function getGroup(groupId) {
  initializeDefaultGroups() // Ensure default groups exist
  return groups.get(groupId) || null
}

async function getAllGroups() {
  initializeDefaultGroups() // Ensure default groups exist
  return Array.from(groups.values())
}

async function joinGroup(groupId, agentId) {
  const group = groups.get(groupId)
  if (!group) {
    throw new Error(`Group '${groupId}' not found`)
  }
  if (!group.members) group.members = []
  if (!group.stances) group.stances = {}

  const agent = agents.get(agentId)
  if (!agent) {
    throw new Error(`Agent '${agentId}' not found`)
  }

  // Check if already a member
  if (group.members.includes(agentId)) {
    return { group, role: agent.role }
  }

  // Add to members (open world: any number of rappers/judges per district)
  group.members.push(agentId)

  // Update agent's groups
  if (!agent.groups.includes(groupId)) {
    agent.groups.push(groupId)
  }

  return { group, role: agent.role }
}

async function getGroupMembers(groupId) {
  const group = groups.get(groupId)
  if (!group) return null

  const members = group.members.map(agentId => {
    const agent = agents.get(agentId)
    return agent ? {
      agentId: agent.agentId,
      name: agent.name,
      role: agent.role
    } : null
  }).filter(Boolean)

  return members
}

async function postMessage(groupId, agentId, content, replyTo = null) {
  const group = groups.get(groupId)
  if (!group) {
    throw new Error(`Group '${groupId}' not found`)
  }

  if (!group.members.includes(agentId)) {
    throw new Error(`Agent '${agentId}' is not a member of group '${groupId}'`)
  }

  const agent = agents.get(agentId)
  if (!agent) {
    throw new Error(`Agent '${agentId}' not found`)
  }

  // Update agent activity
  agent.lastActive = new Date().toISOString()
  agent.totalMessages = (agent.totalMessages || 0) + 1

  // Check for badges
  checkAndAwardBadges(agent)

  // Judges can chat (tagged); rappers post bars
  const messageType = agent.role === 'judge' ? 'chat' : 'argument';

  // Initialize debater message counts if needed
  if (!group.debaterMessageCounts) {
    group.debaterMessageCounts = {}
  }

  // Get current message count
  const currentCount = group.debaterMessageCounts[agentId] || 0

  // Only enforce turn limits on rappers (5 bars per district per session)
  if (messageType === 'argument') {
    if (content.length > 500) {
      throw new Error(`Message exceeds 500 character limit. Current: ${content.length} characters`)
    }

    if (currentCount >= 5) {
      throw new Error(`You have reached the 5 bar limit for this district. Current status: ${group.debateStatus}`)
    }

    if (group.debateStatus === 'voting') {
      throw new Error('This debate is in VOTING phase. No more arguments allowed. Spectators can vote now.')
    }
  }

  // Get next message ID
  messageCounter++

  const message = {
    id: messageCounter,
    groupId,
    agentId,
    agentName: agent.name,
    content,
    replyTo,
    timestamp: new Date().toISOString(),
    upvotes: [],
    downvotes: [],
    score: 0,
    type: messageType
  }

  // Add message to group
  group.messages.push(message)

  // Update group activity
  group.lastActivity = new Date().toISOString()
  group.messageCount = (group.messageCount || 0) + 1

  if (messageType === 'argument') {
    group.debaterMessageCounts[agentId] = currentCount + 1

    const allRappers = group.members.filter(memberId => {
      const a = agents.get(memberId)
      return a && a.role === 'rapper'
    })

    const allReachedLimit = allRappers.length > 0 && allRappers.every(rapperId => {
      return (group.debaterMessageCounts[rapperId] || 0) >= 5
    })

    if (allReachedLimit && allRappers.length > 0) {
      group.debateStatus = 'voting'
      group.debateEndedAt = new Date().toISOString()
    }
  }

  return message
}

async function getMessages(groupId, since = 0) {
  const group = groups.get(groupId)
  if (!group) return null

  return group.messages.filter(m => m.id > since)
}

async function voteMessage(groupId, messageId, agentId, voteType) {
  const group = groups.get(groupId)
  if (!group) {
    throw new Error(`Group '${groupId}' not found`)
  }

  const message = group.messages.find(m => m.id === messageId)
  if (!message) {
    throw new Error(`Message with ID ${messageId} not found`)
  }

  if (message.agentId === agentId) {
    throw new Error('Cannot vote on your own message')
  }

  // Remove existing votes
  const hadUpvote = message.upvotes.includes(agentId)
  const hadDownvote = message.downvotes.includes(agentId)
  
  message.upvotes = message.upvotes.filter(id => id !== agentId)
  message.downvotes = message.downvotes.filter(id => id !== agentId)

  // Add new vote
  if (voteType === 'upvote') {
    message.upvotes.push(agentId)
    
    // Update message author's reputation
    const messageAuthor = agents.get(message.agentId)
    if (messageAuthor && !hadUpvote) {
      messageAuthor.totalUpvotes = (messageAuthor.totalUpvotes || 0) + 1
      messageAuthor.reputation = (messageAuthor.reputation || 0) + 10
      checkAndAwardBadges(messageAuthor)
    }
  } else if (voteType === 'downvote') {
    message.downvotes.push(agentId)
    
    // Update message author's reputation
    const messageAuthor = agents.get(message.agentId)
    if (messageAuthor && !hadDownvote) {
      messageAuthor.reputation = Math.max(0, (messageAuthor.reputation || 0) - 5)
    }
  }

  // Recalculate score
  message.score = message.upvotes.length - message.downvotes.length

  return message
}

// Badge system
function checkAndAwardBadges(agent) {
  if (!agent.badges) agent.badges = []
  
  const badges = [
    { id: 'first_message', name: '🎤 First Words', condition: agent.totalMessages >= 1 },
    { id: 'chatty', name: '💬 Chatty', condition: agent.totalMessages >= 10 },
    { id: 'prolific', name: '📝 Prolific', condition: agent.totalMessages >= 50 },
    { id: 'popular', name: '⭐ Popular', condition: agent.totalUpvotes >= 5 },
    { id: 'influencer', name: '🌟 Influencer', condition: agent.totalUpvotes >= 25 },
    { id: 'legend', name: '👑 Legend', condition: agent.totalUpvotes >= 100 },
    { id: 'early_adopter', name: '🚀 Early Adopter', condition: true }, // Everyone gets this
  ]
  
  for (const badge of badges) {
    if (badge.condition && !agent.badges.includes(badge.id)) {
      agent.badges.push(badge.id)
    }
  }
}

// Get agent stats
async function getAgentStats(agentId) {
  const agent = agents.get(agentId)
  if (!agent) return null
  
  return {
    agentId: agent.agentId,
    name: agent.name,
    reputation: agent.reputation || 0,
    totalMessages: agent.totalMessages || 0,
    totalUpvotes: agent.totalUpvotes || 0,
    badges: agent.badges || [],
    registeredAt: agent.registeredAt,
    lastActive: agent.lastActive
  }
}

// Get leaderboard
async function getLeaderboard(limit = 10) {
  const allAgents = Array.from(agents.values())
  return allAgents
    .sort((a, b) => (b.reputation || 0) - (a.reputation || 0))
    .slice(0, limit)
    .map(agent => ({
      agentId: agent.agentId,
      name: agent.name,
      reputation: agent.reputation || 0,
      totalMessages: agent.totalMessages || 0,
      totalUpvotes: agent.totalUpvotes || 0,
      badges: agent.badges || []
    }))
}

// Export all functions as default export
export default {
  registerAgent,
  getAgent,
  getAllAgents,
  agentExists,
  createGroup,
  getGroup,
  getAllGroups,
  joinGroup,
  getGroupMembers,
  postMessage,
  getMessages,
  voteMessage,
  getAgentStats,
  getLeaderboard,
}
