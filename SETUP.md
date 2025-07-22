# Quick Setup Guide for GitHub

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/kishiekube/voip-poc-platform.git
cd voip-poc-platform
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Open in Browser
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## ✅ Quick Test
1. Navigate to Live Calls page
2. Click "Simulate Inbound Call"
3. Watch real-time updates
4. Test other features

## 🔧 If You Get Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📱 What You'll See
- **Dashboard**: Real-time statistics and charts
- **Live Calls**: Active call monitoring with simulation
- **Call Logs**: Complete call history and analytics
- **Virtual Numbers**: Phone number management
- **IVR Flows**: Interactive voice response builder
- **SIP Users**: User and extension management

## 🎯 Ready for Production?
```bash
npm run build
npm run preview
```

That's it! Your VoIP POC is ready to go! 🎉