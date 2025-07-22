import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// In-memory storage (simulating PostgreSQL + Redis)
const callRecords = [];
const virtualNumbers = [
  { id: '1', number: '+91 8045612345', routeTo: 'agent_001', department: 'Sales', status: 'active' },
  { id: '2', number: '+91 8045612346', routeTo: 'agent_002', department: 'Support', status: 'active' },
  { id: '3', number: '+91 8045612347', routeTo: 'ivr_main', department: 'General', status: 'active' }
];

const sipUsers = [
  { id: 'agent_001', username: 'john.doe', department: 'Sales', status: 'online', extension: '1001' },
  { id: 'agent_002', username: 'jane.smith', department: 'Support', status: 'busy', extension: '1002' },
  { id: 'agent_003', username: 'mike.wilson', department: 'Sales', status: 'offline', extension: '1003' }
];

const ivrFlows = [
  {
    id: 'ivr_main',
    name: 'Main IVR',
    nodes: [
      { id: 'welcome', type: 'prompt', message: 'Welcome to our company. Please select an option.', next: 'menu1' },
      { id: 'menu1', type: 'menu', options: [
        { key: '1', label: 'Sales', action: 'transfer', target: 'agent_001' },
        { key: '2', label: 'Support', action: 'transfer', target: 'agent_002' },
        { key: '0', label: 'Operator', action: 'transfer', target: 'agent_001' }
      ]}
    ]
  }
];

let activeCalls = [];

// API Routes

// Call Management
app.post('/api/call', (req, res) => {
  const { from, to, type = 'outbound' } = req.body;
  const callId = uuidv4();
  
  const call = {
    id: callId,
    from,
    to,
    type,
    status: 'ringing',
    startTime: new Date(),
    duration: 0,
    recording: null
  };
  
  activeCalls.push(call);
  callRecords.push(call);
  
  // Emit real-time update
  io.emit('call-started', call);
  
  // Simulate call progression
  setTimeout(() => {
    const activeCall = activeCalls.find(c => c.id === callId);
    if (activeCall) {
      activeCall.status = 'answered';
      io.emit('call-updated', activeCall);
    }
  }, 2000);
  
  res.json({ success: true, callId, status: 'initiated' });
});

app.get('/api/call/:id', (req, res) => {
  const call = callRecords.find(c => c.id === req.params.id);
  if (!call) {
    return res.status(404).json({ error: 'Call not found' });
  }
  res.json(call);
});

app.post('/api/call/:id/hangup', (req, res) => {
  const callId = req.params.id;
  const callIndex = activeCalls.findIndex(c => c.id === callId);
  
  if (callIndex !== -1) {
    const call = activeCalls[callIndex];
    call.status = 'completed';
    call.endTime = new Date();
    call.duration = Math.floor((call.endTime - call.startTime) / 1000);
    
    activeCalls.splice(callIndex, 1);
    io.emit('call-ended', call);
    
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Active call not found' });
  }
});

// CDR (Call Data Records)
app.get('/api/cdr', (req, res) => {
  const { startDate, endDate, status, limit = 50 } = req.query;
  let filteredRecords = [...callRecords];
  
  if (startDate) {
    filteredRecords = filteredRecords.filter(c => new Date(c.startTime) >= new Date(startDate));
  }
  
  if (endDate) {
    filteredRecords = filteredRecords.filter(c => new Date(c.startTime) <= new Date(endDate));
  }
  
  if (status) {
    filteredRecords = filteredRecords.filter(c => c.status === status);
  }
  
  const limitedRecords = filteredRecords.slice(0, parseInt(limit));
  
  res.json({
    records: limitedRecords,
    total: filteredRecords.length,
    summary: {
      totalCalls: callRecords.length,
      answered: callRecords.filter(c => c.status === 'answered' || c.status === 'completed').length,
      missed: callRecords.filter(c => c.status === 'missed').length,
      avgDuration: callRecords.reduce((acc, c) => acc + (c.duration || 0), 0) / callRecords.length
    }
  });
});

// Virtual Numbers
app.get('/api/virtual-numbers', (req, res) => {
  res.json(virtualNumbers);
});

app.post('/api/virtual-numbers', (req, res) => {
  const { number, routeTo, department } = req.body;
  const newNumber = {
    id: uuidv4(),
    number,
    routeTo,
    department,
    status: 'active'
  };
  virtualNumbers.push(newNumber);
  res.json(newNumber);
});

app.put('/api/virtual-numbers/:id', (req, res) => {
  const index = virtualNumbers.findIndex(n => n.id === req.params.id);
  if (index !== -1) {
    virtualNumbers[index] = { ...virtualNumbers[index], ...req.body };
    res.json(virtualNumbers[index]);
  } else {
    res.status(404).json({ error: 'Virtual number not found' });
  }
});

// SIP Users
app.get('/api/sip-users', (req, res) => {
  res.json(sipUsers);
});

app.post('/api/sip-users', (req, res) => {
  const { username, department, extension } = req.body;
  const newUser = {
    id: uuidv4(),
    username,
    department,
    extension,
    status: 'offline'
  };
  sipUsers.push(newUser);
  res.json(newUser);
});

// IVR Configuration
app.get('/api/ivr-flows', (req, res) => {
  res.json(ivrFlows);
});

app.post('/api/ivr-flows', (req, res) => {
  const { name, nodes } = req.body;
  const newFlow = {
    id: uuidv4(),
    name,
    nodes
  };
  ivrFlows.push(newFlow);
  res.json(newFlow);
});

app.put('/api/ivr-flows/:id', (req, res) => {
  const index = ivrFlows.findIndex(f => f.id === req.params.id);
  if (index !== -1) {
    ivrFlows[index] = { ...ivrFlows[index], ...req.body };
    res.json(ivrFlows[index]);
  } else {
    res.status(404).json({ error: 'IVR flow not found' });
  }
});

// Live call data
app.get('/api/calls/active', (req, res) => {
  res.json(activeCalls);
});

// Dashboard stats
app.get('/api/dashboard/stats', (req, res) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const todaysCalls = callRecords.filter(c => new Date(c.startTime) >= today);
  
  res.json({
    activeCalls: activeCalls.length,
    todaysCalls: todaysCalls.length,
    onlineAgents: sipUsers.filter(u => u.status === 'online').length,
    totalVirtualNumbers: virtualNumbers.length,
    callVolume: Array.from({ length: 24 }, (_, hour) => ({
      hour,
      calls: Math.floor(Math.random() * 20)
    }))
  });
});

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Simulate some initial call data
const generateSampleCalls = () => {
  const sampleCalls = [
    { from: '+91 9876543210', to: '+91 8045612345', type: 'inbound', status: 'completed', duration: 120 },
    { from: '+91 9876543211', to: '+91 8045612346', type: 'inbound', status: 'missed', duration: 0 },
    { from: '+91 8045612345', to: '+91 9876543212', type: 'outbound', status: 'completed', duration: 89 },
    { from: '+91 9876543213', to: '+91 8045612347', type: 'inbound', status: 'completed', duration: 234 }
  ];
  
  sampleCalls.forEach(call => {
    const callRecord = {
      id: uuidv4(),
      ...call,
      startTime: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
      recording: call.status === 'completed' ? `recording_${uuidv4()}.mp3` : null
    };
    callRecords.push(callRecord);
  });
};

generateSampleCalls();

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`VoIP POC Server running on port ${PORT}`);
});