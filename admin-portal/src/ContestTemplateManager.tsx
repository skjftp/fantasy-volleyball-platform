import React, { useState, useEffect } from 'react';

interface ContestTemplate {
  templateId: string;
  name: string;
  description: string;
  entryFee: number;
  totalPrizePool: number;
  maxSpots: number;
  maxTeamsPerUser: number;
  isGuaranteed: boolean;
  prizeDistribution: PrizeRank[];
  createdAt: string;
}

interface PrizeRank {
  rankStart: number;
  rankEnd: number;
  prizeAmount: number;
  prizeType: 'cash' | 'kind';
  prizeDesc: string;
}

interface ContestTemplateManagerProps {
  getAuthHeaders: () => Record<string, string>;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const ContestTemplateManager: React.FC<ContestTemplateManagerProps> = ({ getAuthHeaders, loading, setLoading }) => {
  const [templates, setTemplates] = useState<ContestTemplate[]>([]);
  const [prizeRanks, setPrizeRanks] = useState<PrizeRank[]>([
    { rankStart: 1, rankEnd: 1, prizeAmount: 15000, prizeType: 'cash', prizeDesc: '' }
  ]);

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    entryFee: 0,
    totalPrizePool: 75000,
    maxSpots: 10000,
    maxTeamsPerUser: 6,
    isGuaranteed: true
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      const response = await fetch(`${apiUrl}/admin/contest-templates`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPrizeRank = () => {
    setPrizeRanks([...prizeRanks, { 
      rankStart: 1, 
      rankEnd: 1, 
      prizeAmount: 5000, 
      prizeType: 'cash', 
      prizeDesc: '' 
    }]);
  };

  const updatePrizeRank = (index: number, field: keyof PrizeRank, value: any) => {
    const updated = [...prizeRanks];
    updated[index] = { ...updated[index], [field]: value };
    setPrizeRanks(updated);
  };

  const removePrizeRank = (index: number) => {
    setPrizeRanks(prizeRanks.filter((_, i) => i !== index));
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      const templateData = {
        templateId: `template_${Date.now()}`,
        ...newTemplate,
        prizeDistribution: prizeRanks,
        createdAt: new Date().toISOString()
      };

      const response = await fetch(`${apiUrl}/admin/contest-templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(templateData)
      });

      if (response.ok) {
        alert('Contest template created successfully!');
        setNewTemplate({
          name: '', description: '', entryFee: 0, totalPrizePool: 75000,
          maxSpots: 10000, maxTeamsPerUser: 6, isGuaranteed: true
        });
        setPrizeRanks([{ rankStart: 1, rankEnd: 1, prizeAmount: 15000, prizeType: 'cash', prizeDesc: '' }]);
        fetchTemplates();
      } else {
        const errorText = await response.text();
        alert(`Failed to create template: ${errorText}`);
      }
    } catch (error) {
      console.error('Error creating template:', error);
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this contest template?')) {
      return;
    }

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      const response = await fetch(`${apiUrl}/admin/contest-templates/${templateId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        alert('Contest template deleted successfully!');
        fetchTemplates();
      } else {
        alert('Failed to delete template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="space-y-8">
      {/* Create Contest Template */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Step 6: Create Contest Templates with Prize Distribution
        </h2>
        <form onSubmit={handleCreateTemplate} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
              <input
                type="text"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Mega Contest"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <input
                type="text"
                value={newTemplate.description}
                onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Win big in this mega contest!"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Entry Fee (₹)</label>
              <input
                type="number"
                min="0"
                value={newTemplate.entryFee}
                onChange={(e) => setNewTemplate({...newTemplate, entryFee: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Prize Pool (₹)</label>
              <input
                type="number"
                min="0"
                value={newTemplate.totalPrizePool}
                onChange={(e) => setNewTemplate({...newTemplate, totalPrizePool: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Spots</label>
              <input
                type="number"
                min="1"
                value={newTemplate.maxSpots}
                onChange={(e) => setNewTemplate({...newTemplate, maxSpots: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Teams Per User</label>
              <input
                type="number"
                min="1"
                max="10"
                value={newTemplate.maxTeamsPerUser}
                onChange={(e) => setNewTemplate({...newTemplate, maxTeamsPerUser: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newTemplate.isGuaranteed}
                  onChange={(e) => setNewTemplate({...newTemplate, isGuaranteed: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Guaranteed Contest</span>
              </label>
            </div>
          </div>

          {/* Prize Distribution */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">Prize Distribution</label>
              <button
                type="button"
                onClick={addPrizeRank}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
              >
                Add Prize Rank
              </button>
            </div>

            <div className="space-y-3">
              {prizeRanks.map((rank, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center space-x-4 mb-3">
                    <h4 className="font-medium text-gray-800">Prize {index + 1}</h4>
                    {prizeRanks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePrizeRank(index)}
                        className="text-red-600 text-sm hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-5 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Rank Start</label>
                      <input
                        type="number"
                        min="1"
                        value={rank.rankStart}
                        onChange={(e) => updatePrizeRank(index, 'rankStart', parseInt(e.target.value))}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Rank End</label>
                      <input
                        type="number"
                        min={rank.rankStart}
                        value={rank.rankEnd}
                        onChange={(e) => updatePrizeRank(index, 'rankEnd', parseInt(e.target.value))}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Prize Type</label>
                      <select
                        value={rank.prizeType}
                        onChange={(e) => updatePrizeRank(index, 'prizeType', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="cash">Cash</option>
                        <option value="kind">Kind</option>
                      </select>
                    </div>
                    {rank.prizeType === 'cash' ? (
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Amount (₹)</label>
                        <input
                          type="number"
                          min="0"
                          value={rank.prizeAmount}
                          onChange={(e) => updatePrizeRank(index, 'prizeAmount', parseInt(e.target.value))}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Prize Description</label>
                        <input
                          type="text"
                          value={rank.prizeDesc}
                          onChange={(e) => updatePrizeRank(index, 'prizeDesc', e.target.value)}
                          placeholder="e.g., Trophy, Certificate"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    )}
                    <div className="flex items-end">
                      <div className="text-xs text-gray-600">
                        {rank.rankStart === rank.rankEnd ? `Rank ${rank.rankStart}` : `Ranks ${rank.rankStart}-${rank.rankEnd}`}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-md font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creating Template...' : 'Create Contest Template'}
          </button>
        </form>
      </div>

      {/* Templates List */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Contest Templates</h3>
        </div>
        <div className="divide-y">
          {templates.map((template) => (
            <div key={template.templateId} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800 mb-2">{template.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Entry Fee:</span> ₹{template.entryFee}
                    </div>
                    <div>
                      <span className="font-medium">Total Prize Pool:</span> ₹{template.totalPrizePool.toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Max Spots:</span> {template.maxSpots.toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Teams per User:</span> {template.maxTeamsPerUser}
                    </div>
                  </div>

                  {template.prizeDistribution && template.prizeDistribution.length > 0 && (
                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Prize Distribution:</h5>
                      <div className="space-y-1">
                        {template.prizeDistribution.map((prize, idx) => (
                          <div key={idx} className="text-xs text-gray-600">
                            {formatPrizeDisplay(prize)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => alert('Template editing coming soon!')}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.templateId)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Helper function (defined inside component for access to PrizeRank type)
  function formatPrizeDisplay(prizeRank: PrizeRank): string {
    const rankText = prizeRank.rankStart === prizeRank.rankEnd 
      ? `Rank ${prizeRank.rankStart}` 
      : `Rank ${prizeRank.rankStart}-${prizeRank.rankEnd}`;
    
    const prizeText = prizeRank.prizeType === 'cash' 
      ? `₹${prizeRank.prizeAmount.toLocaleString()}` 
      : prizeRank.prizeDesc;
    
    return `${rankText}: ${prizeText}`;
  }
};

export default ContestTemplateManager;