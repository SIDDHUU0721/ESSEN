import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Send, CheckCircle2, Clock, AlertCircle, Headphones } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const Support: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // New ticket form
  const [category, setCategory] = useState('Order Problem');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/support/my-tickets');
      if (res.data?.data?.tickets) {
        setTickets(res.data.data.tickets);
        if (res.data.data.tickets.length > 0) {
          setActiveTicket(res.data.data.tickets[0]);
        }
      }
    } catch {
      // Local fallback
      const sample = [
        {
          _id: 'tck_1',
          ticketNumber: 'TCK-8821',
          category: 'Order Problem',
          subject: 'Clarification regarding dum biryani spices',
          status: 'RESOLVED',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          messages: [
            {
              senderName: 'Aarav Sharma',
              senderRole: 'customer',
              message: 'Hello, could you let the chef know to add milder green chilies next time?',
              timestamp: new Date(Date.now() - 86400000).toISOString(),
            },
            {
              senderName: 'Chef Roy (Manager)',
              senderRole: 'manager',
              message: 'Noted with pleasure! We have updated your customer profile notes with mild spice preferences.',
              timestamp: new Date(Date.now() - 43200000).toISOString(),
            },
          ],
        },
      ];
      setTickets(sample);
      setActiveTicket(sample[0]);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/support', {
        category,
        subject,
        message,
      });
      if (res.data?.success) {
        setCreateModalOpen(false);
        setSubject('');
        setMessage('');
        fetchTickets();
      }
    } catch {
      setCreateModalOpen(false);
      fetchTickets();
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket) return;

    try {
      await api.post(`/support/${activeTicket._id}/messages`, { message: replyText });
      setReplyText('');
      fetchTickets();
    } catch {
      setActiveTicket((prev: any) => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            senderName: user?.name || 'Customer',
            senderRole: 'customer',
            message: replyText,
            timestamp: new Date().toISOString(),
          },
        ],
      }));
      setReplyText('');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Customer Concierge & Support</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Direct communication with restaurant managers and platform support.</p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-brand-500/20 w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>New Support Ticket</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className="glass-card p-4 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-3 h-[520px] overflow-y-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block px-2">Support Tickets</span>
          {tickets.map((t) => (
            <button
              key={t._id}
              onClick={() => setActiveTicket(t)}
              className={`w-full p-3.5 rounded-2xl border text-left transition-all space-y-1.5 ${
                activeTicket?._id === t._id
                  ? 'bg-brand-500/10 border-brand-500 shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-brand-400">{t.ticketNumber}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    t.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  {t.status}
                </span>
              </div>
              <h4 className="text-xs font-bold text-white truncate">{t.subject}</h4>
              <span className="text-[10px] text-slate-500 block">{t.category}</span>
            </button>
          ))}
        </div>

        {/* Thread Conversation Window */}
        <div className="md:col-span-2 glass-card rounded-3xl border border-slate-800 bg-slate-900/80 shadow-2xl flex flex-col justify-between h-[520px] overflow-hidden">
          {activeTicket ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-brand-400">{activeTicket.ticketNumber}</span>
                    <span className="text-xs font-bold text-white">{activeTicket.subject}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">{activeTicket.category}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
                  Status: {activeTicket.status}
                </span>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {activeTicket.messages?.map((m: any, idx: number) => {
                  const isMe = m.senderRole === 'customer';
                  return (
                    <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1">
                        <span className="font-bold">{m.senderName}</span>
                        <span>• {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div
                        className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                          isMe
                            ? 'bg-brand-500 text-white rounded-tr-none'
                            : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                        }`}
                      >
                        {m.message}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Box */}
              <form onSubmit={handleSendReply} className="p-3 border-t border-slate-800 bg-slate-950 flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message or response..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"
                />
                <button
                  type="submit"
                  className="p-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-32 text-slate-500 text-xs">
              Select or create a support ticket to start conversation.
            </div>
          )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-base">Open New Support Ticket</h3>
            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="Order Problem">Order Problem</option>
                  <option value="Payment Problem">Payment Problem</option>
                  <option value="Delivery Problem">Delivery Problem</option>
                  <option value="Restaurant Problem">Restaurant Problem</option>
                  <option value="Reward Problem">Reward & Coin Problem</option>
                  <option value="Refund Problem">Refund Problem</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Subject</label>
                <input
                  type="text"
                  placeholder="Brief summary of issue..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Message</label>
                <textarea
                  rows={4}
                  placeholder="Describe your request or issue in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold"
                >
                  {loading ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
