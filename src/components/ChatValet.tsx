import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Mail, Phone, User } from 'lucide-react';

interface Message {
  id: string;
  channel: 'sms' | 'email';
  sender: string;
  content: string;
  time: string;
  isAi?: boolean;
}

const MOCK_MESSAGES: Message[] = [
  { id: '1', channel: 'sms', sender: 'Sarah M.', content: 'Hi! Is the Austin event still available for Sept 14?', time: '2:14 PM' },
  { id: '2', channel: 'sms', sender: 'AI Valet', content: 'Yes! The Austin Sky Lantern Festival on Sept 14 still has passes available at $140/person. Would you like me to send a checkout link?', time: '2:14 PM', isAi: true },
  { id: '3', channel: 'email', sender: 'james.r@gmail.com', content: 'Can we get a group discount for 8 people?', time: '2:11 PM' },
  { id: '4', channel: 'email', sender: 'AI Valet', content: 'Groups of 6+ receive 15% off. I can generate a custom group checkout link for 8 guests at $952 total ($119/ea). Shall I send it?', time: '2:11 PM', isAi: true },
  { id: '5', channel: 'sms', sender: 'Mike T.', content: 'What time do gates open?', time: '1:58 PM' },
  { id: '6', channel: 'sms', sender: 'AI Valet', content: 'Gates open at 5:30 PM. The lantern release happens at 8:45 PM after sunset. Arrive early to enjoy live music and food trucks!', time: '1:58 PM', isAi: true },
];

export default function ChatValet() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'unified' | 'sms' | 'email'>('unified');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
      return;
    }
    let i = 0;
    const interval = setInterval(() => {
      if (i < MOCK_MESSAGES.length) {
        setMessages((prev) => [...prev, MOCK_MESSAGES[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 600);
    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const filteredMessages = activeTab === 'unified'
    ? messages
    : messages.filter(m => m.channel === activeTab);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const newMsg: Message = {
      id: `user-${Date.now()}`,
      channel: 'sms',
      sender: 'You',
      content: inputValue,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputValue('');
  };

  return (
    <>
      {/* Floating Bubble */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-[55] w-14 h-14 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 hover:scale-105 active:scale-95 ${
          isOpen
            ? 'bg-slate-800 rotate-0'
            : 'bg-gradient-to-br from-blue-500 to-indigo-600 hover:shadow-[0_8px_30px_rgba(79,70,229,0.3)]'
        }`}
      >
        {isOpen ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <MessageCircle className="w-5 h-5 text-white" />
        )}
      </button>

      {/* Badge */}
      {!isOpen && (
        <div className="fixed bottom-[76px] right-6 z-[55] pointer-events-none">
          <div className="bg-white rounded-lg shadow-lg border border-slate-100 px-3 py-1.5 text-[10px] font-medium text-slate-600 whitespace-nowrap">
            Vendasta AI Chat Valet
          </div>
        </div>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[55] w-[360px] h-[500px] bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-slate-100 flex flex-col overflow-hidden animate-slideUp">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <MessageCircle className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Vendasta AI Chat Valet</div>
                  <div className="text-[9px] text-slate-400">Multi-channel CRM Stream</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] text-emerald-400 font-medium">Online</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-white/[0.06] rounded-lg p-0.5">
              {[
                { id: 'unified' as const, label: 'All', icon: User },
                { id: 'sms' as const, label: 'SMS', icon: Phone },
                { id: 'email' as const, label: 'Email', icon: Mail },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[10px] font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-white/10 text-white'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <tab.icon className="w-3 h-3" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredMessages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.isAi || msg.sender === 'You' ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    msg.channel === 'sms' ? 'bg-emerald-400' : 'bg-blue-400'
                  }`} />
                  <span className="text-[9px] font-medium text-slate-400">
                    {msg.sender} &middot; {msg.time}
                  </span>
                  <span className={`text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    msg.channel === 'sms' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {msg.channel}
                  </span>
                </div>
                <div className={`max-w-[85%] px-3.5 py-2.5 rounded-xl text-xs leading-relaxed ${
                  msg.isAi
                    ? 'bg-slate-800 text-white rounded-br-sm'
                    : msg.sender === 'You'
                    ? 'bg-blue-500 text-white rounded-br-sm'
                    : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-2">
                    <MessageCircle className="w-4 h-4 text-slate-300" />
                  </div>
                  <p className="text-[11px] text-slate-400">Loading CRM stream...</p>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-slate-100 p-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a reply..."
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-700 placeholder-slate-300 focus:outline-none focus:border-slate-200 focus:ring-1 focus:ring-slate-100"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="p-2.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
