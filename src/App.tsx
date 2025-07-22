import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CallLogs from './pages/CallLogs';
import VirtualNumbers from './pages/VirtualNumbers';
import IVRFlows from './pages/IVRFlows';
import SIPUsers from './pages/SIPUsers';
import LiveCalls from './pages/LiveCalls';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/live-calls" element={<LiveCalls />} />
          <Route path="/call-logs" element={<CallLogs />} />
          <Route path="/virtual-numbers" element={<VirtualNumbers />} />
          <Route path="/ivr-flows" element={<IVRFlows />} />
          <Route path="/sip-users" element={<SIPUsers />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;