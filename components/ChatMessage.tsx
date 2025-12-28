
import React from 'react';
import { Message } from '../types.ts';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.role === 'model';
  
  return (
    <div className={`flex w-full mb-4 ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[80%] ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
          isBot ? 'bg-blue-600 text-white mr-2' : 'bg-gray-400 text-white ml-2'
        }`}>
          {isBot ? 'JB' : 'ME'}
        </div>
        <div className={`px-4 py-2 rounded-2xl text-sm shadow-sm transition-all ${
          isBot 
            ? 'bg-white text-gray-800 border border-gray-100 rounded-tl-none' 
            : 'bg-blue-600 text-white rounded-tr-none'
        }`}>
          <div className="whitespace-pre-wrap leading-relaxed">
            {message.text}
          </div>
          <div className={`text-[10px] mt-1 opacity-60 ${isBot ? 'text-gray-400' : 'text-blue-100'}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
