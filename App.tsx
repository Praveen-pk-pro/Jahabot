
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, RefreshCcw, Sparkles } from 'lucide-react';
import { Message, ChatState } from './types.ts';
import { GeminiService } from './services/geminiService.ts';
import { APP_NAME, WELCOME_MESSAGE } from './constants.ts';
import ChatMessage from './components/ChatMessage.tsx';

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [chatState, setChatState] = useState<ChatState>({
    messages: [
      {
        id: 'welcome',
        role: 'model',
        text: WELCOME_MESSAGE,
        timestamp: new Date(),
      }
    ],
    isTyping: false,
    error: null,
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const geminiRef = useRef<GeminiService | null>(null);

  // Initialize Gemini Service on mount
  useEffect(() => {
    if (!process.env.API_KEY) {
      setChatState(prev => ({ ...prev, error: "API Key is missing. Please check your environment." }));
      return;
    }
    geminiRef.current = new GeminiService(process.env.API_KEY);
  }, []);

  // Auto-scroll to bottom on message change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatState.messages, chatState.isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || chatState.isTyping || !geminiRef.current) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input.trim(),
      timestamp: new Date(),
    };

    setInput('');
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isTyping: true,
      error: null,
    }));

    try {
      const botResponseText = await geminiRef.current.sendMessage(userMessage.text);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: botResponseText,
        timestamp: new Date(),
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, botMessage],
        isTyping: false,
      }));
    } catch (err: any) {
      setChatState(prev => ({
        ...prev,
        isTyping: false,
        error: err.message || "An unexpected error occurred."
      }));
    }
  };

  const handleReset = () => {
    if (confirm("Reset conversation?")) {
      if (process.env.API_KEY) {
        geminiRef.current = new GeminiService(process.env.API_KEY);
      }
      setChatState({
        messages: [
          {
            id: Date.now().toString(),
            role: 'model',
            text: WELCOME_MESSAGE,
            timestamp: new Date(),
          }
        ],
        isTyping: false,
        error: null,
      });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Bot size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-800">{APP_NAME}</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">Online & Ready</span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={handleReset}
          className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
          title="Reset Chat"
        >
          <RefreshCcw size={20} />
        </button>
      </header>

      {/* Main Chat Area */}
      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 md:px-8 max-w-4xl mx-auto w-full scroll-smooth"
      >
        {chatState.messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        
        {chatState.isTyping && (
          <div className="flex justify-start mb-4">
            <div className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-100 rounded-2xl rounded-tl-none shadow-sm">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></span>
              </div>
              <span className="text-xs font-medium text-gray-400 italic">JAHA is thinking...</span>
            </div>
          </div>
        )}

        {chatState.error && (
          <div className="mx-auto max-w-md my-4 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-center text-sm">
            <p className="font-semibold mb-1">Notice</p>
            {chatState.error}
          </div>
        )}
      </main>

      {/* Persistent Call-to-Action / Input */}
      <footer className="bg-white border-t border-gray-200 p-4 sticky bottom-0 z-10">
        <form 
          onSubmit={handleSend}
          className="max-w-4xl mx-auto flex items-center gap-3"
        >
          <div className="flex-1 relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question here..."
              className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm group-hover:border-gray-300"
              disabled={chatState.isTyping}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none group-focus-within:text-blue-500 transition-colors">
              <Sparkles size={18} />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={!input.trim() || chatState.isTyping}
            className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all shadow-md active:scale-95 ${
              !input.trim() || chatState.isTyping
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
            }`}
          >
            <Send size={20} className={input.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />
          </button>
        </form>
        
        <p className="max-w-4xl mx-auto text-center mt-3 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
          Empowering your productivity with <span className="text-blue-600">JAHA Bot</span> Intelligence
        </p>
      </footer>
    </div>
  );
};

export default App;
