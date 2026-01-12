import React, { useState } from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { API_URL } from '../config';

const ConvertPointsToReputation = ({ userProfile, onUpdate }) => {
  const [converting, setConverting] = useState(false);
  const [selectedPoints, setSelectedPoints] = useState(500);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const conversionRatio = 5; // 500 points = 5 reputation
  const pointsPerReputation = 100; // 100 points = 1 reputation

  const handleConvert = async () => {
    if (selectedPoints > userProfile.points) {
      setError('Insufficient points');
      return;
    }

    setConverting(true);
    setError('');
    setSuccess('');

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(`${API_URL}/api/profiles/convert-points-to-reputation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ points: selectedPoints }),
      });

      if (res.ok) {
        const updated = await res.json();
        setSuccess(`Successfully converted ${selectedPoints} points to ${selectedPoints / pointsPerReputation} reputation!`);
        if (onUpdate) {
          onUpdate(updated);
        }
        setTimeout(() => {
          setSuccess('');
          window.location.reload();
        }, 2000);
      } else {
        const data = await res.json();
        setError(data.error || 'Conversion failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="bg-[#2C1A11]/50 border border-[#8B4513]/30 rounded-xl p-6 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-[#D2B48C]" size={24} />
          <h3 className="text-xl font-bold text-[#FDFBF7]">Convert Points to Reputation</h3>
        </div>
        <button
          onClick={handleConvert}
          disabled={converting || selectedPoints > userProfile.points || selectedPoints < 500 || selectedPoints % 500 !== 0}
          className="px-6 py-2 bg-gradient-to-r from-[#D2B48C] to-[#C19A6B] text-[#2C1A11] rounded-lg font-bold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
        >
          {converting ? 'Converting...' : 'Convert Now'}
        </button>
      </div>

      <p className="text-[#D2B48C]/70 text-sm mb-4">
        Exchange your points for reputation to unlock more features. 100 points = 1 reputation point.
      </p>

      <div className="bg-[#1a0f0a] border border-[#8B4513]/30 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-[#D2B48C]/50 mb-1">Your Points</p>
            <p className="text-2xl font-bold text-[#D2B48C]">{userProfile.points}</p>
          </div>
          <div>
            <p className="text-xs text-[#D2B48C]/50 mb-1">Your Reputation</p>
            <p className="text-2xl font-bold text-[#FDFBF7]">{userProfile.reputation}</p>
          </div>
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium text-[#D2B48C] mb-2">
            Points to Convert (Must be multiples of 500)
          </label>
          <input
            type="number"
            min="500"
            step="500"
            value={selectedPoints}
            onChange={(e) => setSelectedPoints(parseInt(e.target.value) || 500)}
            className="w-full px-4 py-2 bg-[#2C1A11] border border-[#8B4513]/50 rounded-lg text-[#FDFBF7] focus:ring-2 focus:ring-[#D2B48C] focus:border-transparent"
          />
        </div>

        <div className="flex items-center justify-between text-sm text-[#D2B48C]/70 mb-4">
          <span>You will receive:</span>
          <span className="text-lg font-bold text-emerald-400">
            +{selectedPoints / pointsPerReputation} Reputation
          </span>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 text-red-400 p-3 rounded-lg mb-3 border border-red-500/30">
            <AlertCircle size={16} />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 p-3 rounded-lg mb-3 border border-emerald-500/30">
            <TrendingUp size={16} />
            <p className="text-sm">{success}</p>
          </div>
        )}
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <p className="text-xs text-blue-400">
          <strong>Reputation Requirements:</strong>
          <br />
          • Chat: 50 reputation
          <br />
          • Forum Posts: 30 reputation
          <br />• Book Requests: 20 reputation
        </p>
      </div>
    </div>
  );
};

export default ConvertPointsToReputation;
