import React, { useState } from 'react';
import { X, Users, Calculator, Plus, Trash2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export const SplitBillModal = ({ isOpen, onClose, onLogShare }) => {
  const [billTitle, setBillTitle] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [members, setMembers] = useState(['You', 'Roommate 1']);
  const [category, setCategory] = useState('Food');
  const [newMemberName, setNewMemberName] = useState('');

  if (!isOpen) return null;

  const numTotal = parseFloat(totalAmount) || 0;
  const numMembers = Math.max(1, members.length);
  const perPersonShare = Math.round((numTotal / numMembers) * 100) / 100;

  const handleAddMember = () => {
    if (newMemberName.trim() && !members.includes(newMemberName.trim())) {
      setMembers([...members, newMemberName.trim()]);
      setNewMemberName('');
    }
  };

  const handleRemoveMember = (index) => {
    if (members.length > 2) {
      setMembers(members.filter((_, idx) => idx !== index));
    }
  };

  const handleApplyMyShare = () => {
    if (perPersonShare <= 0) return;
    onLogShare({
      title: `${billTitle.trim() || 'Shared Bill'} (My Share of ${formatCurrency(numTotal)})`,
      amount: perPersonShare,
      category,
      description: `Split among ${members.join(', ')} (${formatCurrency(perPersonShare)} each)`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="glass-card max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-purple/20 text-brand-purpleLight flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-main">Roommate Bill Splitter</h3>
              <p className="text-[11px] text-text-muted">Split canteen, auto, or WiFi bills easily</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-main transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Bill Details */}
          <div>
            <label className="block font-semibold text-text-secondary mb-1">
              Bill / Occasion Name
            </label>
            <input
              type="text"
              placeholder="e.g. Friday Pizza Night, Room WiFi, Station Auto"
              value={billTitle}
              onChange={(e) => setBillTitle(e.target.value)}
              className="w-full bg-bg-input border border-border-subtle focus:border-brand-purple rounded-xl px-3.5 py-2 text-text-main placeholder-text-muted focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-text-secondary mb-1">
                Total Bill Amount (₹) *
              </label>
              <input
                type="number"
                min="1"
                placeholder="600"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className="w-full bg-bg-input border border-border-subtle focus:border-brand-purple rounded-xl px-3.5 py-2 text-text-main font-semibold focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-text-secondary mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-bg-input border border-border-subtle focus:border-brand-purple rounded-xl px-3 py-2 text-text-main focus:outline-none cursor-pointer"
              >
                <option value="Food">Food</option>
                <option value="Snacks">Snacks</option>
                <option value="Travel">Travel</option>
                <option value="Personal">Personal</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Members List */}
          <div>
            <label className="block font-semibold text-text-secondary mb-1.5">
              People Splitting ({members.length})
            </label>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {members.map((member, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-xl bg-bg-cardHover border border-border-subtle flex items-center justify-between"
                >
                  <span className="font-semibold text-text-main">{member}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-brand-purpleLight font-bold">
                      {formatCurrency(perPersonShare)}
                    </span>
                    {idx > 1 && (
                      <button
                        onClick={() => handleRemoveMember(idx)}
                        className="text-text-muted hover:text-status-danger transition"
                        title="Remove member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Member input */}
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                placeholder="Add roommate name..."
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddMember();
                  }
                }}
                className="flex-1 bg-bg-input border border-border-subtle rounded-xl px-3 py-1.5 text-text-main placeholder-text-muted focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddMember}
                className="px-3 py-1.5 rounded-xl bg-bg-cardHover hover:bg-bg-input border border-border-subtle text-text-main font-semibold flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          </div>

          {/* Split Result Summary */}
          {numTotal > 0 && (
            <div className="p-3 rounded-xl bg-brand-purple/10 border border-brand-purple/30 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-text-muted">Your Individual Share:</p>
                <p className="text-base font-extrabold text-brand-purpleLight">
                  {formatCurrency(perPersonShare)}
                </p>
              </div>
              <button
                type="button"
                onClick={handleApplyMyShare}
                className="px-3 py-2 rounded-xl bg-brand-purple hover:bg-brand-purpleDark text-white font-bold shadow-soft-purple transition flex items-center gap-1.5"
              >
                <span>Log My Share</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SplitBillModal;
