import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Clock, User } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface Call {
  id: string;
  from: string;
  to: string;
  type: 'inbound' | 'outbound';
  status: string;
  startTime: string;
  duration: number;
}

const LiveCalls: React.FC = () => {
  const [activeCalls, setActiveCalls] = useState<Call[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    // Fetch initial active calls
    fetchActiveCalls();

    // Listen for real-time updates
    newSocket.on('call-started', (call: Call) => {
      setActiveCalls(prev => [...prev, call]);
    });

    newSocket.on('call-updated', (updatedCall: Call) => {
      setActiveCalls(prev => 
        prev.map(call => call.id === updatedCall.id ? updatedCall : call)
      );
    });

    newSocket.on('call-ended', (endedCall: Call) => {
      setActiveCalls(prev => prev.filter(call => call.id !== endedCall.id));
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const fetchActiveCalls = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/calls/active');
      const data = await response.json();
      setActiveCalls(data);
    } catch (error) {
      console.error('Failed to fetch active calls:', error);
    }
  };

  const hangupCall = async (callId: string) => {
    try {
      await fetch(`http://localhost:3001/api/call/${callId}/hangup`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Failed to hangup call:', error);
    }
  };

  const formatDuration = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const duration = Math.floor((now.getTime() - start.getTime()) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ringing':
        return 'bg-yellow-100 text-yellow-800';
      case 'answered':
        return 'bg-green-100 text-green-800';
      case 'holding':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Live Calls</h1>
          <p className="mt-2 text-gray-600">Monitor active calls in real-time</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
            <span className="text-sm text-gray-500">Active Calls</span>
            <span className="ml-2 text-lg font-semibold text-gray-900">{activeCalls.length}</span>
          </div>
        </div>
      </div>

      {/* Active Calls */}
      {activeCalls.length === 0 ? (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-12 text-center">
          <Phone className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No Active Calls</h3>
          <p className="mt-2 text-gray-500">All agents are currently available</p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Active Calls</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {activeCalls.map((call) => (
              <div key={call.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${
                      call.type === 'inbound' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      <Phone className={`h-5 w-5 ${
                        call.type === 'inbound' ? 'text-green-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {call.from} → {call.to}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(call.status)}`}>
                          {call.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {call.type === 'inbound' ? 'Incoming' : 'Outgoing'}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDuration(call.startTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => hangupCall(call.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    >
                      <PhoneOff className="h-4 w-4 mr-1" />
                      Hangup
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Call Simulator */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Call Simulator</h3>
        <p className="text-sm text-gray-600 mb-4">Simulate incoming and outgoing calls for testing</p>
        <div className="flex space-x-4">
          <button
            onClick={() => {
              fetch('http://localhost:3001/api/call', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  from: '+91 9876543210',
                  to: '+91 8045612345',
                  type: 'inbound'
                })
              });
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            <Phone className="h-4 w-4 mr-2" />
            Simulate Inbound Call
          </button>
          <button
            onClick={() => {
              fetch('http://localhost:3001/api/call', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  from: '+91 8045612346',
                  to: '+91 9876543211',
                  type: 'outbound'
                })
              });
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Phone className="h-4 w-4 mr-2" />
            Simulate Outbound Call
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveCalls;