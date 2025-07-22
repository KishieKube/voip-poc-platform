import React, { useState, useEffect } from 'react';
import { Phone, PhoneIncoming, PhoneOutgoing, Download, Play, Search, Filter } from 'lucide-react';

interface CallRecord {
  id: string;
  from: string;
  to: string;
  type: 'inbound' | 'outbound';
  status: string;
  startTime: string;
  duration: number;
  recording?: string;
}

interface CDRSummary {
  totalCalls: number;
  answered: number;
  missed: number;
  avgDuration: number;
}

const CallLogs: React.FC = () => {
  const [callRecords, setCallRecords] = useState<CallRecord[]>([]);
  const [summary, setSummary] = useState<CDRSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchCallRecords();
  }, []);

  const fetchCallRecords = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/cdr');
      const data = await response.json();
      setCallRecords(data.records);
      setSummary(data.summary);
    } catch (error) {
      console.error('Failed to fetch call records:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'missed':
        return 'bg-red-100 text-red-800';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRecords = callRecords.filter(record => {
    const matchesSearch = record.from.includes(searchTerm) || record.to.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Call Logs</h1>
        <p className="mt-2 text-gray-600">View and analyze call data records (CDR)</p>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Calls</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{summary.totalCalls}</dd>
          </div>
          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Answered</dt>
            <dd className="mt-1 text-3xl font-semibold text-green-600">{summary.answered}</dd>
          </div>
          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Missed</dt>
            <dd className="mt-1 text-3xl font-semibold text-red-600">{summary.missed}</dd>
          </div>
          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Avg Duration</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{formatDuration(Math.floor(summary.avgDuration))}</dd>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 min-w-0">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search by phone number..."
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="missed">Missed</option>
                <option value="busy">Busy</option>
              </select>
            </div>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Call Records Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Call Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  From
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {record.type === 'inbound' ? (
                        <PhoneIncoming className="h-5 w-5 text-green-500" />
                      ) : (
                        <PhoneOutgoing className="h-5 w-5 text-blue-500" />
                      )}
                      <span className="ml-2 text-sm font-medium text-gray-900 capitalize">
                        {record.type}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.from}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.to}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.duration > 0 ? formatDuration(record.duration) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(record.startTime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {record.recording && (
                        <button className="text-blue-600 hover:text-blue-900 transition-colors">
                          <Play className="h-4 w-4" />
                        </button>
                      )}
                      <button className="text-gray-400 hover:text-gray-600 transition-colors">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredRecords.length === 0 && (
          <div className="text-center py-12">
            <Phone className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No call records found</h3>
            <p className="mt-2 text-gray-500">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallLogs;