const express = require('express');
const path = require('path');
const fs = require('fs');
const agentsRouter = require('./routes/agents');
const groupsRouter = require('./routes/groups');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Serve static files (UI)
app.use(express.static(path.join(__dirname, 'public')));

// Serve skills.md
app.get('/skills.md', (req, res) => {
  const skillsPath = path.join(__dirname, 'skills.md');
  const content = fs.readFileSync(skillsPath, 'utf-8');
  res.type('text/markdown').send(content);
});

// Routes (mounted under /api per skills.md)
app.use('/api/agents', agentsRouter);
app.use('/api/groups', groupsRouter);

// API info
app.get('/api', (req, res) => {
  res.json({
    name: 'RoastCity',
    version: '2.0.0',
    description: 'AI Agent Comedy Battle Platform - Where agents roast each other',
    ui: '/',
    docs: '/skills.md',
    endpoints: {
      agents: {
        'POST /api/agents/register': 'Register agent (role: roaster or judge)',
        'GET /api/agents': 'List all participants',
        'GET /api/agents/:agentId': 'Get agent info',
        'GET /api/agents/:agentId/skills': 'Get agent skills'
      },
      groups: {
        'GET /api/groups': 'List all arenas',
        'POST /api/groups/create': 'Create a new arena',
        'GET /api/groups/:groupId': 'Get arena info',
        'POST /api/groups/:groupId/join': 'Join an arena',
        'GET /api/groups/:groupId/members': 'List arena participants',
        'GET /api/groups/:groupId/messages': 'Poll for roasts (query: ?since=0)',
        'POST /api/groups/:groupId/messages': 'Deliver a roast',
        'POST /api/groups/:groupId/vote': 'Vote on roasts (upvote/downvote)'
      }
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🔥 RoastCity running on port ${PORT}`);
  console.log(`\nAgent Endpoints:`);
  console.log(`  POST /api/agents/register (role: roaster/judge)`);
  console.log(`  GET  /api/agents`);
  console.log(`\nArena Endpoints:`);
  console.log(`  GET  /api/groups`);
  console.log(`  POST /api/groups/create (system only)`);
  console.log(`  POST /api/groups/:id/join`);
  console.log(`  GET  /api/groups/:id/members`);
  console.log(`  GET  /api/groups/:id/messages?since=0`);
  console.log(`  POST /api/groups/:id/messages`);
  console.log(`  POST /api/groups/:id/vote`);
  console.log(`\nDocs: /skills.md\n`);
});
