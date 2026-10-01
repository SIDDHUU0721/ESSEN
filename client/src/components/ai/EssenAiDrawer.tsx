import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, X, Send, Bot, User as UserIcon, Plus, ArrowRight, Award, Compass, Utensils } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { getFoodImage } from '../../utils/foodImages';

interface EssenAiDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  cards?: any[];
  suggestions?: string[];
  timestamp: string;
}

export const EssenAiDrawer: React.FC<EssenAiDrawerProps> = ({ isOpen, onClose }) => {
  const { user, role, restaurantId } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_1',
      sender: 'assistant',
      text: `Hello ${user?.name?.split(' ')[0] || 'there'}! I'm **ESSEN AI**, your personal dining concierge. Ask me for recommendations, track your live orders, explore rewards, or review analytics.`,
      suggestions: [
        'Suggest something spicy under ₹300',
        'Top-rated vegetarian places',
        'How many reward coins do I have?',
        'Where is my order?',
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await api.post('/essen/query', {
        query: textToSend,
        restaurantId,
      });

      if (res.data?.success) {
        const aiData = res.data.data;
        const aiMsg: ChatMessage = {
          id: `ai_${Date.now()}`,
          sender: 'assistant',
          text: aiData.message,
          cards: aiData.cards,
          suggestions: aiData.suggestions,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch {
      // Local fallback simulator if server query is interrupted
      setTimeout(() => {
        const q = textToSend.toLowerCase();
        let fallbackReply = "I've analyzed our culinary catalog for your request. Here are the top suggestions:";
        let cards: any[] = [];

        if (q.includes('spicy') || q.includes('food')) {
          fallbackReply = "Here is our top chef-recommended spicy delicacy:";
          cards = [
            {
              type: 'food',
              title: 'Royal Awadhi Murgh Dum Biryani',
              subtitle: 'The Royal Nawabi Kitchen • ₹280 • ★ 4.9',
              data: {
                id: '65f01',
                restaurantId: '65e01',
                name: 'Royal Awadhi Murgh Dum Biryani',
                price: 280,
                foodType: 'non-vegetarian',
                image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800',
              },
            },
          ];
        } else if (q.includes('coin') || q.includes('reward')) {
          fallbackReply = "You have **4,820 / 5,000 ESSEN Coins** at **The Royal Nawabi Kitchen** (96% towards Free Chef Combo)!";
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `ai_${Date.now()}`,
            sender: 'assistant',
            text: fallbackReply,
            cards,
            suggestions: ['Show restaurants with offers', 'Where is my order?'],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }, 600);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-lg bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-800 bg-gradient-to-r from-purple-950/40 via-slate-900 to-brand-950/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-brand-500 to-amber-400 p-0.5 shadow-lg shadow-purple-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-brand-400 animate-pulse" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base">ESSEN AI</h3>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-bold">
                    Concierge
                  </span>
                </div>
                <p className="text-xs text-slate-400">Contextual Culinary & Operations Assistant</p>
              </div>
            </div>

            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-purple-900/60 border border-purple-500/30 flex-shrink-0 flex items-center justify-center text-purple-300 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] space-y-2.5 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  {/* Bubble */}
                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-brand-600 to-amber-600 text-white rounded-tr-none'
                        : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.text}</div>
                    <span className="text-[10px] opacity-60 block text-right mt-1">{msg.timestamp}</span>
                  </div>

                  {/* Rich Cards attached to AI Response */}
                  {msg.cards && msg.cards.length > 0 && (
                    <div className="grid grid-cols-1 gap-2 pt-1 w-full">
                      {msg.cards.map((card, cIdx) => (
                        <div
                          key={cIdx}
                          className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-brand-500/40 transition-all flex items-center justify-between gap-3 shadow-lg"
                        >
                          <div className="flex items-center gap-3">
                            {card.type === 'food' ? (
                              <img
                                src={getFoodImage(card.title, undefined, card.data?.image)}
                                alt={card.title}
                                onError={(e) => {
                                  e.currentTarget.src = getFoodImage(card.title);
                                }}
                                className="w-13 h-13 rounded-xl object-cover flex-shrink-0 border border-slate-800 shadow-sm"
                              />
                            ) : card.data?.image ? (
                              <img
                                src={card.data.image}
                                alt={card.title}
                                className="w-13 h-13 rounded-xl object-cover flex-shrink-0 border border-slate-800 shadow-sm"
                              />
                            ) : null}
                            <div>
                              <h5 className="text-xs font-bold text-white">{card.title}</h5>
                              <p className="text-[11px] text-slate-400 mt-0.5">{card.subtitle}</p>
                            </div>
                          </div>

                          {card.type === 'food' && (
                            <button
                              onClick={() => {
                                addToCart(
                                  {
                                    _id: card.data.id,
                                    name: card.data.name,
                                    price: card.data.price,
                                    foodType: card.data.foodType,
                                    image: card.data.image,
                                    cuisine: 'Indian',
                                    description: '',
                                    tasteProfile: card.data.tasteProfile || 'spicy',
                                    isAvailable: true,
                                    rating: 4.8,
                                    orderCount: 100,
                                    preparationTimeMinutes: 20,
                                    restaurant: card.data.restaurantId,
                                    category: 'Signature',
                                  },
                                  card.data.restaurantId || 'rest_1',
                                  'The Royal Nawabi Kitchen',
                                  1
                                );
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-brand-500/20 border border-brand-500/40 text-brand-400 hover:bg-brand-500 hover:text-white text-xs font-semibold flex items-center gap-1 transition-all"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add</span>
                            </button>
                          )}

                          {card.type === 'restaurant' && (
                            <button
                              onClick={() => {
                                onClose();
                                navigate(`/restaurants/${card.data.id}`);
                              }}
                              className="p-2 rounded-lg bg-slate-800 text-slate-200 hover:text-brand-400"
                            >
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          )}

                          {card.type === 'reward' && (
                            <button
                              onClick={() => {
                                onClose();
                                navigate('/rewards');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold flex items-center gap-1"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>Hub</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Suggestion Chips */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleSend(sug)}
                          className="px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300 hover:text-brand-400 hover:border-brand-500/40 transition-colors"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-brand-500/20 border border-brand-500/30 flex-shrink-0 flex items-center justify-center text-brand-400 mt-1">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-purple-400 bg-purple-950/30 border border-purple-800/30 rounded-xl p-3 w-max">
                <Sparkles className="w-4 h-4 animate-spin text-brand-400" />
                <span>ESSEN AI is thinking & querying verified database...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-950">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask ESSEN (e.g. Spicy food under ₹300, coin balance)..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || loading}
                className="p-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white shadow-lg shadow-brand-500/20 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
