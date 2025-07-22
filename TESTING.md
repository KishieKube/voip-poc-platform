# VoIP POC - Testing Guide

## 🧪 Testing Strategy

### 1. Manual Testing Checklist

#### Frontend Testing
- [ ] Dashboard loads with statistics
- [ ] Navigation between all pages works
- [ ] Real-time updates work on Live Calls page
- [ ] Forms submit successfully (Virtual Numbers, IVR, Users)
- [ ] Call simulation buttons work
- [ ] Charts and graphs display correctly
- [ ] Responsive design works on mobile

#### Backend API Testing
- [ ] All API endpoints respond correctly
- [ ] WebSocket connections establish
- [ ] Real-time events are emitted
- [ ] Data persistence works
- [ ] Error handling works properly

### 2. Automated Testing

#### API Testing with curl
```bash
# Test dashboard stats
curl -X GET http://localhost:3001/api/dashboard/stats

# Test call creation
curl -X POST http://localhost:3001/api/call \
  -H "Content-Type: application/json" \
  -d '{"from":"+91 9876543210","to":"+91 8045612345","type":"inbound"}'

# Test CDR retrieval
curl -X GET "http://localhost:3001/api/cdr?limit=10"

# Test virtual numbers
curl -X GET http://localhost:3001/api/virtual-numbers
```

#### Load Testing
```bash
# Install artillery for load testing
npm install -g artillery

# Create load test config
cat > load-test.yml << EOF
config:
  target: 'http://localhost:3001'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "API Load Test"
    requests:
      - get:
          url: "/api/dashboard/stats"
      - post:
          url: "/api/call"
          json:
            from: "+91 9876543210"
            to: "+91 8045612345"
            type: "inbound"
EOF

# Run load test
artillery run load-test.yml
```

### 3. Integration Testing

#### WebSocket Testing
```javascript
// Test WebSocket connection
const io = require('socket.io-client');
const socket = io('http://localhost:3001');

socket.on('connect', () => {
  console.log('Connected to WebSocket');
});

socket.on('call-started', (data) => {
  console.log('Call started:', data);
});
```

### 4. Browser Testing

#### Cross-browser Compatibility
Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

#### Mobile Testing
Test on:
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Responsive breakpoints

### 5. Performance Testing

#### Frontend Performance
```bash
# Lighthouse audit
npm install -g lighthouse
lighthouse http://localhost:5173 --output html --output-path ./lighthouse-report.html
```

#### Backend Performance
```bash
# Monitor API response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3001/api/dashboard/stats
```

Create `curl-format.txt`:
```
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
```

### 6. Error Testing

#### Test Error Scenarios
- [ ] Server offline (backend down)
- [ ] Network timeout
- [ ] Invalid API responses
- [ ] WebSocket disconnection
- [ ] Form validation errors
- [ ] Large data sets

### 7. Security Testing

#### Basic Security Checks
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Input validation
- [ ] SQL injection prevention
- [ ] Rate limiting
- [ ] CORS configuration

### 8. Test Data

#### Sample Test Data
```json
{
  "testCalls": [
    {
      "from": "+91 9876543210",
      "to": "+91 8045612345",
      "type": "inbound",
      "duration": 120
    }
  ],
  "testUsers": [
    {
      "username": "test.agent",
      "extension": "1001",
      "department": "Sales"
    }
  ],
  "testNumbers": [
    {
      "number": "+91 8045612999",
      "routeTo": "agent_001",
      "department": "Support"
    }
  ]
}
```

### 9. Monitoring and Alerts

#### Health Check Endpoints
```bash
# API health
curl http://localhost:3001/api/dashboard/stats

# Database connectivity
curl http://localhost:3001/api/health/db

# WebSocket connectivity
curl http://localhost:3001/socket.io/
```

### 10. Test Reports

Generate test reports:
```bash
# Create test report directory
mkdir test-reports

# Run all tests and generate reports
npm run test:all > test-reports/test-results.txt
```

## Test Environment Setup

### Prerequisites
- Node.js 16+
- All dependencies installed
- Both frontend and backend running

### Test Commands
```bash
# Start test environment
npm run dev

# Run API tests
npm run test:api

# Run frontend tests
npm run test:frontend

# Run integration tests
npm run test:integration

# Run all tests
npm run test:all
```