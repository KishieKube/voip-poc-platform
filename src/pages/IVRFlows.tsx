import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Workflow, Play, Save } from 'lucide-react';

interface IVRNode {
  id: string;
  type: 'prompt' | 'menu' | 'transfer';
  message?: string;
  next?: string;
  options?: Array<{
    key: string;
    label: string;
    action: string;
    target: string;
  }>;
}

interface IVRFlow {
  id: string;
  name: string;
  nodes: IVRNode[];
}

const IVRFlows: React.FC = () => {
  const [ivrFlows, setIvrFlows] = useState<IVRFlow[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingFlow, setEditingFlow] = useState<IVRFlow | null>(null);
  const [selectedFlow, setSelectedFlow] = useState<IVRFlow | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    nodes: [] as IVRNode[]
  });

  useEffect(() => {
    fetchIVRFlows();
  }, []);

  const fetchIVRFlows = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/ivr-flows');
      const data = await response.json();
      setIvrFlows(data);
    } catch (error) {
      console.error('Failed to fetch IVR flows:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingFlow 
        ? `http://localhost:3001/api/ivr-flows/${editingFlow.id}`
        : 'http://localhost:3001/api/ivr-flows';
      
      const method = editingFlow ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        fetchIVRFlows();
        setShowModal(false);
        setEditingFlow(null);
        setFormData({ name: '', nodes: [] });
      }
    } catch (error) {
      console.error('Failed to save IVR flow:', error);
    }
  };

  const handleEdit = (flow: IVRFlow) => {
    setEditingFlow(flow);
    setFormData({
      name: flow.name,
      nodes: flow.nodes
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingFlow(null);
    setFormData({ 
      name: '', 
      nodes: [
        {
          id: 'welcome',
          type: 'prompt',
          message: 'Welcome to our company. Please hold while we connect you.',
          next: 'menu1'
        },
        {
          id: 'menu1',
          type: 'menu',
          options: [
            { key: '1', label: 'Sales', action: 'transfer', target: 'agent_001' },
            { key: '2', label: 'Support', action: 'transfer', target: 'agent_002' },
            { key: '0', label: 'Operator', action: 'transfer', target: 'agent_001' }
          ]
        }
      ]
    });
    setShowModal(true);
  };

  const addNode = () => {
    const newNode: IVRNode = {
      id: `node_${Date.now()}`,
      type: 'prompt',
      message: 'New prompt message'
    };
    setFormData({
      ...formData,
      nodes: [...formData.nodes, newNode]
    });
  };

  const updateNode = (index: number, updatedNode: IVRNode) => {
    const updatedNodes = [...formData.nodes];
    updatedNodes[index] = updatedNode;
    setFormData({ ...formData, nodes: updatedNodes });
  };

  const removeNode = (index: number) => {
    const updatedNodes = formData.nodes.filter((_, i) => i !== index);
    setFormData({ ...formData, nodes: updatedNodes });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">IVR Flows</h1>
          <p className="mt-2 text-gray-600">Configure interactive voice response flows</p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create IVR Flow
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* IVR Flows List */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">IVR Flows</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {ivrFlows.map((flow) => (
              <div key={flow.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Workflow className="h-5 w-5 text-blue-500" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{flow.name}</h4>
                      <p className="text-sm text-gray-500">{flow.nodes.length} nodes</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedFlow(flow)}
                      className="text-green-600 hover:text-green-900 transition-colors"
                      title="Preview Flow"
                    >
                      <Play className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(flow)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                      title="Edit Flow"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-900 transition-colors"
                      title="Delete Flow"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Flow Preview */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {selectedFlow ? `Preview: ${selectedFlow.name}` : 'Flow Preview'}
            </h3>
          </div>
          <div className="p-6">
            {selectedFlow ? (
              <div className="space-y-4">
                {selectedFlow.nodes.map((node, index) => (
                  <div key={node.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {node.id}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        node.type === 'prompt' ? 'bg-blue-100 text-blue-800' :
                        node.type === 'menu' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {node.type}
                      </span>
                    </div>
                    {node.message && (
                      <p className="text-sm text-gray-600 mb-2">{node.message}</p>
                    )}
                    {node.options && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500">Menu Options:</p>
                        {node.options.map((option, optIndex) => (
                          <div key={optIndex} className="text-xs text-gray-600 ml-2">
                            Press {option.key}: {option.label} → {option.target}
                          </div>
                        ))}
                      </div>
                    )}
                    {node.next && (
                      <p className="text-xs text-gray-500 mt-2">Next: {node.next}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Workflow className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No flow selected</h3>
                <p className="mt-1 text-sm text-gray-500">Select a flow to preview its structure</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingFlow ? 'Edit IVR Flow' : 'Create IVR Flow'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Flow Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Main IVR Flow"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Flow Nodes
                    </label>
                    <button
                      type="button"
                      onClick={addNode}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Node
                    </button>
                  </div>
                  
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {formData.nodes.map((node, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <input
                            type="text"
                            value={node.id}
                            onChange={(e) => updateNode(index, { ...node, id: e.target.value })}
                            className="text-sm font-medium border border-gray-300 rounded px-2 py-1"
                            placeholder="Node ID"
                          />
                          <div className="flex items-center space-x-2">
                            <select
                              value={node.type}
                              onChange={(e) => updateNode(index, { ...node, type: e.target.value as any })}
                              className="text-xs border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="prompt">Prompt</option>
                              <option value="menu">Menu</option>
                              <option value="transfer">Transfer</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => removeNode(index)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        {(node.type === 'prompt' || node.type === 'menu') && (
                          <div className="mb-3">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Message
                            </label>
                            <textarea
                              value={node.message || ''}
                              onChange={(e) => updateNode(index, { ...node, message: e.target.value })}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                              rows={2}
                              placeholder="Enter the message to play"
                            />
                          </div>
                        )}

                        {node.type === 'menu' && (
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                              Menu Options
                            </label>
                            <div className="space-y-2">
                              {(node.options || []).map((option, optIndex) => (
                                <div key={optIndex} className="grid grid-cols-4 gap-2">
                                  <input
                                    type="text"
                                    value={option.key}
                                    onChange={(e) => {
                                      const newOptions = [...(node.options || [])];
                                      newOptions[optIndex] = { ...option, key: e.target.value };
                                      updateNode(index, { ...node, options: newOptions });
                                    }}
                                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                                    placeholder="Key"
                                  />
                                  <input
                                    type="text"
                                    value={option.label}
                                    onChange={(e) => {
                                      const newOptions = [...(node.options || [])];
                                      newOptions[optIndex] = { ...option, label: e.target.value };
                                      updateNode(index, { ...node, options: newOptions });
                                    }}
                                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                                    placeholder="Label"
                                  />
                                  <select
                                    value={option.action}
                                    onChange={(e) => {
                                      const newOptions = [...(node.options || [])];
                                      newOptions[optIndex] = { ...option, action: e.target.value };
                                      updateNode(index, { ...node, options: newOptions });
                                    }}
                                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                                  >
                                    <option value="transfer">Transfer</option>
                                    <option value="goto">Go To</option>
                                  </select>
                                  <input
                                    type="text"
                                    value={option.target}
                                    onChange={(e) => {
                                      const newOptions = [...(node.options || [])];
                                      newOptions[optIndex] = { ...option, target: e.target.value };
                                      updateNode(index, { ...node, options: newOptions });
                                    }}
                                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                                    placeholder="Target"
                                  />
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  const newOptions = [...(node.options || []), { key: '', label: '', action: 'transfer', target: '' }];
                                  updateNode(index, { ...node, options: newOptions });
                                }}
                                className="text-xs text-blue-600 hover:text-blue-900"
                              >
                                + Add Option
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingFlow ? 'Update' : 'Create'} Flow
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IVRFlows;