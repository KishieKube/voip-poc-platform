# VoIP Platform POC - Complete Setup Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Project Structure](#project-structure)
4. [Building the Project](#building-the-project)
5. [Running in Development](#running-in-development)
6. [Testing the Application](#testing-the-application)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)
9. [API Documentation](#api-documentation)

---

## 🔧 Prerequisites

### Required Software
Before starting, install these on your PC:

1. **Node.js** (version 16 or higher)
   - Download from: https://nodejs.org
   - Verify installation: `node --version` and `npm --version`

2. **Git** (recommended)
   - Download from: https://git-scm.com
   - Verify installation: `git --version`

3. **Code Editor** (recommended)
   - VS Code: https://code.visualstudio.com
   - Or any text editor of your choice

### System Requirements
- **OS**: Windows 10+, macOS 10.15+, or Linux
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: 500MB free space
- **Network**: Internet connection for package installation

---

## 📦 Installation

### Step 1: Clone Repository
```bash
git clone https://github.com/kishiekube/voip-poc-platform.git
cd voip-poc-platform
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Start Development Server
```bash
npm run dev
```

This will start:
- Frontend at: http://localhost:5173
- Backend API at: http://localhost:3001

---

## 🏗️ Project Structure

```
voip-poc-platform/
├── src/
│   ├── components/
│   │   └── Layout.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── LiveCalls.tsx
│   │   ├── CallLogs.tsx
│   │   ├── VirtualNumbers.tsx
│   │   ├── IVRFlows.tsx
│   │   └── SIPUsers.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── server/
│   └── index.js
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

---

## 🔨 Building the Project

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

---

## 🚀 Running in Development

### Start the Application
```bash
npm run dev
```

This command:
1. Starts Vite dev server on `http://localhost:5173`
2. Starts Express API server on `http://localhost:3001`
3. Enables hot reload for frontend changes
4. Provides real-time WebSocket connections

### Access Points
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api
- **WebSocket**: ws://localhost:3001

---

## 🧪 Testing the Application

### 1. Basic Functionality Test
1. Open http://localhost:5173
2. Navigate through all sidebar sections:
   - Dashboard
   - Live Calls
   - Call Logs
   - Virtual Numbers
   - IVR Flows
   - SIP Users

### 2. Live Call Simulation
1. Go to **Live Calls** page
2. Click "Simulate Inbound Call" button
3. Verify call appears in active calls list
4. Click "Hangup" to end the call
5. Check that call moves to Call Logs

### 3. Virtual Number Management
1. Go to **Virtual Numbers** page
2. Click "Add Virtual Number"
3. Fill in details and save
4. Verify number appears in the list

### 4. IVR Flow Builder
1. Go to **IVR Flows** page
2. Click "Create IVR Flow"
3. Add nodes and configure options
4. Save and preview the flow

### 5. API Testing
Use these curl commands to test the API:

```bash
# Get dashboard stats
curl http://localhost:3001/api/dashboard/stats

# Get call logs
curl http://localhost:3001/api/cdr

# Create a call
curl -X POST http://localhost:3001/api/call \
  -H "Content-Type: application/json" \
  -d '{"from":"+91 9876543210","to":"+91 8045612345","type":"inbound"}'

# Get virtual numbers
curl http://localhost:3001/api/virtual-numbers
```

### 6. Automated Testing
```bash
# Run all tests
npm run test:all

# Run individual test suites
npm run test:api
npm run test:frontend
npm run test:integration
```

---

## 🌐 Production Deployment

### Option 1: Traditional Server Deployment

#### Prerequisites
- Linux server (Ubuntu 20.04+ recommended)
- Node.js 16+ installed
- Nginx (for reverse proxy)
- PM2 (for process management)

#### Steps
```bash
# 1. Install PM2 globally
npm install -g pm2

# 2. Build the application
npm run build

# 3. Start with PM2
pm2 start server/index.js --name voip-poc-api
pm2 save
pm2 startup

# 4. Serve frontend with Nginx
sudo cp -r dist/* /var/www/html/
```

### Option 2: Docker Deployment

#### Create Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["node", "server/index.js"]
```

#### Deploy with Docker
```bash
# Build and run
docker build -t voip-poc .
docker run -p 3001:3001 voip-poc
```

### Option 3: Cloud Platform Deployment

#### Vercel (Frontend only)
```bash
npm i -g vercel
vercel --prod
```

#### Heroku (Full stack)
```bash
heroku create voip-poc-platform
git push heroku main
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. "Command not found: concurrently"
```bash
npm install -D concurrently
```

#### 2. "Failed to fetch dashboard stats"
```bash
# Ensure backend server is running
npm run server
# Or restart with: npm run dev
```

#### 3. "Port 3001 already in use"
```bash
# On Windows:
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# On Mac/Linux:
lsof -ti:3001 | xargs kill -9
```

#### 4. "Module not found" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 API Documentation

### Base URL
- Development: `http://localhost:3001/api`
- Production: `https://your-domain.com/api`

### Endpoints

#### Call Management
```
POST   /call                 # Create a new call
GET    /call/:id             # Get call details
POST   /call/:id/hangup      # End a call
GET    /calls/active         # Get active calls
```

#### Call Data Records
```
GET    /cdr                  # Get call history
Query params: startDate, endDate, status, limit
```

#### Virtual Numbers
```
GET    /virtual-numbers      # List virtual numbers
POST   /virtual-numbers      # Create virtual number
PUT    /virtual-numbers/:id  # Update virtual number
```

#### IVR Management
```
GET    /ivr-flows           # List IVR flows
POST   /ivr-flows           # Create IVR flow
PUT    /ivr-flows/:id       # Update IVR flow
```

#### SIP Users
```
GET    /sip-users           # List SIP users
POST   /sip-users           # Create SIP user
```

#### Dashboard
```
GET    /dashboard/stats     # Get dashboard statistics
```

### WebSocket Events
```
call-started    # New call initiated
call-updated    # Call status changed
call-ended      # Call terminated
```

---

## 🎯 Features

### ✅ Implemented Features
- **Real-time Call Monitoring** - Live call dashboard with WebSocket updates
- **Call Data Records (CDR)** - Complete call history and analytics
- **Virtual Number Management** - Configure and route virtual numbers
- **IVR Flow Builder** - Visual IVR flow creation and management
- **SIP User Management** - Manage SIP users and extensions
- **Dashboard Analytics** - Real-time statistics and call volume charts
- **Responsive Design** - Works on desktop, tablet, and mobile
- **REST API** - Complete API for all operations
- **WebSocket Support** - Real-time updates across all clients

### 🚀 Next Phase Enhancements
- Real SIP integration with Asterisk/FreeSWITCH
- WebRTC for browser-based calling
- Advanced call queuing and distribution
- Speech recognition in IVR
- Multi-tenant support
- Authentication and authorization
- Advanced analytics and reporting

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📞 Support

For issues or questions:
1. Check this README first
2. Review the troubleshooting section
3. Check browser console for errors
4. Create an issue on GitHub

---

**🎉 Congratulations!** You now have a fully functional VoIP Platform POC running on your system.