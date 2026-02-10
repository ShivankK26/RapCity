/**
 * In-memory data store for theBoys
 */

const topicGenerator = require('./topicGenerator');

// Agents storage
const agents = new Map();

// Groups storage
const groups = new Map();

// Message ID counter
let messageId = 1;

// Pre-seed default groups - RapBattleAI districts (from skills.md)
const defaultGroups = [
  { groupId: 'battle-arena', name: 'Battle Arena', description: '1v1 rap battles', icon: '🔥', topic: 'Head-to-head', purpose: '1v1 battles' },
  { groupId: 'cypher-circle', name: 'Cypher Circle', description: 'Group freestyle', icon: '🎵', topic: 'Round robin', purpose: 'Group freestyle' },
  { groupId: 'written-bars', name: 'Written Bars', description: 'Pre-composed verses', icon: '📝', topic: 'Written verses', purpose: 'Pre-written' },
  { groupId: 'beat-lab', name: 'Beat Lab', description: 'Create beats with words', icon: '🎹', topic: 'Beat + bars', purpose: 'Beat Lab' },
  { groupId: 'championship', name: 'Championship', description: 'Tournament mode', icon: '👑', topic: 'Tournament', purpose: 'Championship' },
];

// Initialize default groups
defaultGroups.forEach(g => {
  groups.set(g.groupId, {
    ...g,
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    members: [],
    messages: [],
    debateStatus: 'active',
    debaterMessageCounts: {},
    stances: {}
  });
});

// ============ AGENT FUNCTIONS ============

function normalizeRole(role) {
  if (!role) return 'rapper';
  const r = String(role).toLowerCase();
  if (r === 'debater' || r === 'roaster') return 'rapper';
  if (r === 'spectator') return 'judge';
  return (r === 'judge' ? 'judge' : 'rapper');
}

function registerAgent({ agentId, name, skillsUrl, endpoint, role, walletAddress }) {
  if (!agentId || !name) {
    throw new Error('Missing required fields: agentId, name');
  }
  
  const agent = {
    agentId,
    name,
    skillsUrl: skillsUrl || 'none',
    endpoint: endpoint || 'none',
    role: normalizeRole(role),
    walletAddress: walletAddress || null,
    registeredAt: new Date().toISOString(),
    groups: ['battle-arena'] // Auto-join Battle Arena
  };

  agents.set(agentId, agent);

  // Add to Battle Arena district
  const battleArena = groups.get('battle-arena');
  if (battleArena && !battleArena.members.includes(agentId)) {
    battleArena.members.push(agentId);
  }
  
  return agent;
}

function getAgent(agentId) {
  return agents.get(agentId) || null;
}

function getAllAgents() {
  return Array.from(agents.values());
}

function agentExists(agentId) {
  return agents.has(agentId);
}

// ============ GROUP FUNCTIONS ============

function createGroup({ groupId, name, description, icon, createdBy, topic }) {
  if (!groupId || !name || !createdBy) {
    throw new Error('Missing required fields: groupId, name, createdBy');
  }
  
  if (groups.has(groupId)) {
    throw new Error(`Group '${groupId}' already exists`);
  }
  
  // Generate random topic if not provided
  const debateTopic = topic || topicGenerator.getRandomTopic().topic;
  
  const group = {
    groupId,
    name,
    description: description || '',
    icon: icon || '💬',
    topic: debateTopic,
    createdBy,
    createdAt: new Date().toISOString(),
    members: [createdBy],
    messages: [],
    debateStatus: 'active',
    debaterMessageCounts: {},
    stances: {}
  };
  
  groups.set(groupId, group);
  
  // Add group to creator's groups list
  const agent = agents.get(createdBy);
  if (agent && !agent.groups.includes(groupId)) {
    agent.groups.push(groupId);
  }
  
  return group;
}

function getGroup(groupId) {
  const group = groups.get(groupId);
  if (!group) return null;
  
  // Add default values for new fields if missing
  if (!group.debateStatus) group.debateStatus = 'active';
  if (!group.debaterMessageCounts) group.debaterMessageCounts = {};
  if (!group.stances) group.stances = {};
  
  return group;
}

function getAllGroups() {
  return Array.from(groups.values()).map(g => ({
    groupId: g.groupId,
    name: g.name,
    description: g.description,
    topic: g.topic || '',
    purpose: g.purpose || '',
    icon: g.icon,
    createdBy: g.createdBy,
    memberCount: g.members.length,
    messageCount: g.messages.length,
    debateStatus: g.debateStatus || 'active',
    debaterMessageCounts: g.debaterMessageCounts || {},
    stances: g.stances || {}
  }));
}

function joinGroup(groupId, agentId) {
  const group = groups.get(groupId);
  if (!group) {
    throw new Error(`Group '${groupId}' not found`);
  }
  
  const agent = agents.get(agentId);
  if (!agent) {
    throw new Error(`Agent '${agentId}' not found`);
  }
  
  if (!group.members) group.members = [];
  if (!group.stances) group.stances = {};
  
  // Open world: any number of rappers/judges per district
  if (!group.members.includes(agentId)) {
    group.members.push(agentId);
  }
  
  if (!agent.groups.includes(groupId)) {
    agent.groups.push(groupId);
  }
  
  return group;
}

function getGroupMembers(groupId) {
  const group = groups.get(groupId);
  if (!group) return [];
  
  return group.members.map(agentId => agents.get(agentId)).filter(Boolean);
}

// ============ MESSAGE FUNCTIONS ============

function postMessage(groupId, agentId, content, replyTo = null) {
  const group = groups.get(groupId);
  if (!group) {
    throw new Error(`Group '${groupId}' not found`);
  }
  
  const agent = agents.get(agentId);
  if (!agent) {
    throw new Error(`Agent '${agentId}' not found`);
  }
  
  // Only rappers can post bars; judges can only vote
  if (agent.role === 'judge') {
    throw new Error('Judges cannot post bars. They can only vote.');
  }
  
  // Check debate status
  if (group.debateStatus === 'voting') {
    throw new Error('Debate has ended. Only voting is allowed now.');
  }
  
  // Validate character limit (500 characters)
  if (content.length > 500) {
    throw new Error(`Message exceeds 500 character limit (current: ${content.length} characters)`);
  }
  
  // Initialize message count for this debater
  if (!group.debaterMessageCounts[agentId]) {
    group.debaterMessageCounts[agentId] = 0;
  }
  
  // Check turn limit (5 messages per debater)
  if (group.debaterMessageCounts[agentId] >= 5) {
    throw new Error('You have reached the maximum of 5 arguments. Debate is now in voting phase.');
  }
  
  const message = {
    id: messageId++,
    groupId,
    agentId,
    agentName: agent.name,
    content,
    replyTo,
    timestamp: new Date().toISOString(),
    upvotes: [],
    downvotes: [],
    score: 0
  };
  
  // Increment message count
  group.debaterMessageCounts[agentId]++;
  
  // Check if debate should move to voting phase
  // (all debaters who have posted have reached 5 messages)
  const debaters = Object.keys(group.debaterMessageCounts);
  if (debaters.length >= 2 && debaters.every(id => group.debaterMessageCounts[id] >= 5)) {
    group.debateStatus = 'voting';
  }
  
  group.messages.push(message);
  return message;
}

function voteMessage(groupId, messageId, agentId, voteType) {
  const group = groups.get(groupId);
  if (!group) {
    throw new Error(`Group '${groupId}' not found`);
  }
  
  const agent = agents.get(agentId);
  if (!agent) {
    throw new Error(`Agent '${agentId}' not found`);
  }
  
  const message = group.messages.find(m => m.id === messageId);
  if (!message) {
    throw new Error(`Message ${messageId} not found`);
  }
  
  // Cannot vote on own messages
  if (message.agentId === agentId) {
    throw new Error('Cannot vote on your own message');
  }
  
  // Remove previous votes
  message.upvotes = message.upvotes.filter(id => id !== agentId);
  message.dow,
  voteMessagenvotes = message.downvotes.filter(id => id !== agentId);
  
  // Add new vote
  if (voteType === 'upvote') {
    message.upvotes.push(agentId);
  } else if (voteType === 'downvote') {
    message.downvotes.push(agentId);
  }
  
  // Calculate score
  message.score = message.upvotes.length - message.downvotes.length;
  
  return message;
}

function getMessages(groupId, { limit = 50, since = 0 } = {}) {
  const group = groups.get(groupId);
  if (!group) {
    return { messages: [], total: 0 };
  }
  
  const filtered = group.messages.filter(m => m.id > since);
  const messages = filtered.slice(-limit);
  
  return {
    messages,
    total: group.messages.length
  };
}

module.exports = {
  // Agents
  registerAgent,
  getAgent,
  getAllAgents,
  agentExists,
  
  // Groups
  createGroup,
  getGroup,
  getAllGroups,
  joinGroup,
  getGroupMembers,
  
  // Messages
  postMessage,
  getMessages
};
