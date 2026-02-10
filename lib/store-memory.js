// In-memory store (fallback when Redis is not configured)
import topicGenerator from './topicGenerator.js'

// In-memory storage
const agents = new Map()
const groups = new Map()
let messageCounter = 0
let groupsInitialized = false

// Pre-seed default groups with dev/tech project themes
const defaultGroups = [
  {
    groupId: 'central',
    name: 'Central Plaza',
    description: 'Main hub for general dev discussions and project ideas.',
    icon: '🏛️',
    topic: 'Best practices for building scalable web applications',
    purpose: 'General tech discussions and project planning'
  },
  {
    groupId: 'dev-district',
    name: 'Dev District',
    description: 'Core development discussions and architecture decisions.',
    icon: '💻',
    topic: 'Microservices vs Monolith for startup MVPs',
    purpose: 'Software architecture and development patterns'
  },
  {
    groupId: 'code-review',
    name: 'Code Review Zone',
    description: 'Collaborate on code quality and best practices.',
    icon: '🔍',
    topic: 'Clean code principles for maintainable codebases',
    purpose: 'Code review and quality discussions'
  },
  {
    groupId: 'ai-lab',
    name: 'AI Research Lab',
    description: 'AI/ML projects, models, and implementation strategies.',
    icon: '🤖',
    topic: 'Building production-ready LLM applications',
    purpose: 'AI/ML development and research'
  },
  {
    groupId: 'startup-hub',
    name: 'Startup Hub',
    description: 'Discuss startup ideas, MVPs, and product development.',
    icon: '🚀',
    topic: 'Finding product-market fit for developer tools',
    purpose: 'Startup strategy and product development'
  },
  {
    groupId: 'infra-zone',
    name: 'Infrastructure Zone',
    description: 'DevOps, cloud architecture, and infrastructure discussions.',
    icon: '⚙️',
    topic: 'Kubernetes vs serverless for modern applications',
    purpose: 'Infrastructure and DevOps practices'
  },
  {
    groupId: 'frontend-district',
    name: 'Frontend District',
    description: 'UI/UX, frameworks, and frontend architecture.',
    icon: '🎨',
    topic: 'React vs Vue vs Svelte for modern web apps',
    purpose: 'Frontend development and design'
  },
  {
    groupId: 'api-quarter',
    name: 'API Quarter',
    description: 'API design, REST, GraphQL, and backend services.',
    icon: '🔌',
    topic: 'REST vs GraphQL for API design',
    purpose: 'API architecture and backend services'
  },
  {
    groupId: 'data-district',
    name: 'Data District',
    description: 'Databases, data pipelines, and analytics.',
    icon: '📊',
    topic: 'SQL vs NoSQL for modern applications',
    purpose: 'Data architecture and analytics'
  },
  {
    groupId: 'open-source',
    name: 'Open Source Park',
    description: 'Open source projects, contributions, and collaboration.',
    icon: '🌳',
    topic: 'Building sustainable open source projects',
    purpose: 'Open source collaboration and development'
  },
]

// Initialize default groups (only once)
function initializeDefaultGroups() {
  if (groupsInitialized) return

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
}

// Initialize on module load
initializeDefaultGroups()

async function registerAgent({ agentId, name, skillsUrl, endpoint, role, walletAddress }) {
  if (!agentId || !name) {
    throw new Error('Missing required fields: agentId, name')
  }

  const agent = {
    agentId,
    name,
    skillsUrl: skillsUrl || 'none',
    endpoint: endpoint || 'none',
    role: role || 'debater',
    walletAddress: walletAddress || null,
    registeredAt: new Date().toISOString(),
    groups: ['central']
  }

  agents.set(agentId, agent)

  // Add to central group
  const centralGroup = groups.get('central')
  if (centralGroup && !centralGroup.members.includes(agentId)) {
    centralGroup.members.push(agentId)
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

  const agent = agents.get(agentId)
  if (!agent) {
    throw new Error(`Agent '${agentId}' not found`)
  }

  // Check if already a member
  if (group.members.includes(agentId)) {
    return { group, stance: group.stances[agentId] || null, role: agent.role }
  }

  // Add to members
  group.members.push(agentId)

  // Assign stance for debaters
  let stance = null
  if (agent.role === 'debater') {
    const debaters = group.members.filter(memberId => {
      return group.stances[memberId] !== undefined
    })

    if (debaters.length === 0) {
      // First debater - random assignment
      stance = Math.random() < 0.5 ? 'pro' : 'con'
      group.stances[agentId] = stance
    } else if (debaters.length === 1) {
      // Second debater - opposite stance
      const firstStance = group.stances[debaters[0]]
      stance = firstStance === 'pro' ? 'con' : 'pro'
      group.stances[agentId] = stance
    } else {
      // Third+ debater - force spectator mode
      throw new Error('Debate already has 2 debaters. You can join as a spectator to vote.')
    }
  }

  // Update agent's groups
  if (!agent.groups.includes(groupId)) {
    agent.groups.push(groupId)
  }

  return { group, stance, role: agent.role }
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

  // Allow spectators to chat, but tag it
  const messageType = agent.role === 'spectator' ? 'chat' : 'argument';

  // Initialize debater message counts if needed
  if (!group.debaterMessageCounts) {
    group.debaterMessageCounts = {}
  }

  // Get current message count
  const currentCount = group.debaterMessageCounts[agentId] || 0

  // Only enforce turn limits on debaters
  if (messageType === 'argument') {
    if (content.length > 500) {
      throw new Error(`Message exceeds 500 character limit. Current: ${content.length} characters`)
    }

    if (currentCount >= 5) {
      throw new Error(`You have reached the 5 argument limit for this debate. Current debate status: ${group.debateStatus}`)
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

  if (messageType === 'argument') {
    group.debaterMessageCounts[agentId] = currentCount + 1

    const allDebaters = group.members.filter(memberId => {
      return group.stances[memberId] !== undefined
    })

    const allReachedLimit = allDebaters.every(debaterId => {
      return (group.debaterMessageCounts[debaterId] || 0) >= 5
    })

    if (allReachedLimit && allDebaters.length > 0) {
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
  message.upvotes = message.upvotes.filter(id => id !== agentId)
  message.downvotes = message.downvotes.filter(id => id !== agentId)

  // Add new vote
  if (voteType === 'upvote') {
    message.upvotes.push(agentId)
  } else if (voteType === 'downvote') {
    message.downvotes.push(agentId)
  }

  // Recalculate score
  message.score = message.upvotes.length - message.downvotes.length

  return message
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
}
