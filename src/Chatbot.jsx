import React, { useState, useRef, useEffect } from 'react';
import { X, Send, ChevronDown, ChevronUp, MessageSquare, MessageCircle, List } from 'lucide-react';
import { useChatbot } from './context/ChatbotContext';
import { useContactForm } from './context/ContactFormContext';
import { BOT_NAME, FAQ_CHIPS, FAQ_VISIBLE_COUNT, getAnswerForQuestion, matchUserInput } from './data/chatbotKnowledge';
import { SITE } from './config/site';

const ChipPanel = ({ visibleChips, hasMoreChips, showAllChips, setShowAllChips, onChip, onSendMessage, introText }) => (
  <div className="flex-1 flex flex-col p-4 gap-3 overflow-y-auto">
    {introText && (
      <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
        <p className="text-sm text-gray-600 leading-relaxed">{introText}</p>
      </div>
    )}

    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Popular questions</p>

    <div className="flex flex-col gap-2 flex-1">
      {visibleChips.map((chip) => (
        <button
          key={chip}
          onClick={() => onChip(chip)}
          className="w-full text-left text-sm font-semibold px-4 py-3.5 bg-white border border-orange-100 text-[#0F172A] rounded-xl hover:border-[#F97316] hover:bg-orange-50 transition-colors shadow-sm"
        >
          {chip}
        </button>
      ))}

      {hasMoreChips && (
        <button
          onClick={() => setShowAllChips(!showAllChips)}
          className="w-full flex items-center justify-center gap-1.5 text-sm font-bold px-4 py-3 text-[#F97316] hover:bg-orange-50 rounded-xl transition-colors"
        >
          {showAllChips ? (
            <>Show less <ChevronUp size={16} /></>
          ) : (
            <>More topics <ChevronDown size={16} /></>
          )}
        </button>
      )}

      <button
        onClick={onSendMessage}
        className="w-full flex items-center justify-center gap-2 text-sm font-bold px-4 py-3.5 bg-[#0F172A] text-white rounded-xl hover:bg-slate-800 transition-colors mt-auto"
      >
        <MessageSquare size={16} /> Send a message
      </button>
    </div>
  </div>
);

const Chatbot = () => {
  const { isOpen, toggleChatbot, closeChatbot: closeChatbotCtx } = useChatbot();
  const { openContactForm } = useContactForm();
  const [messages, setMessages] = useState([
    { type: 'text', text: `Hi! I'm ${BOT_NAME}, your research assistant. Pick a topic below or type your question.`, isBot: true },
  ]);
  const [input, setInput] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);
  const [showAllChips, setShowAllChips] = useState(false);
  const [showChipPanel, setShowChipPanel] = useState(true);
  const messagesEndRef = useRef(null);

  const closeChatbot = () => {
    setShowChipPanel(true);
    setShowAllChips(false);
    closeChatbotCtx();
  };

  const visibleChips = showAllChips ? FAQ_CHIPS : FAQ_CHIPS.slice(0, FAQ_VISIBLE_COUNT);
  const hasMoreChips = FAQ_CHIPS.length > FAQ_VISIBLE_COUNT;

  useEffect(() => {
    const seen = sessionStorage.getItem('chatbot_tooltip_seen');
    if (!seen) {
      setShowTooltip(true);
      sessionStorage.setItem('chatbot_tooltip_seen', '1');
      const t = setTimeout(() => setShowTooltip(false), 5000);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showAllChips, showChipPanel]);

  const addBot = (payload) => setMessages((prev) => [...prev, { isBot: true, ...payload }]);
  const addUser = (text) => setMessages((prev) => [...prev, { type: 'text', text, isBot: false }]);

  const openMessageForm = () => {
    closeChatbot();
    openContactForm({ source: 'chatbot' });
  };

  const deliverAnswer = (answer) => {
    if (answer === 'OPEN_FORM') {
      addBot({ type: 'text', text: 'Great! Opening our message form so you can share your requirements.' });
      setTimeout(openMessageForm, 500);
      return;
    }
    addBot({ type: 'text', text: answer || `Reach us at ${SITE.email} or ${SITE.phoneDisplay}.` });
  };

  const handleChip = (chip) => {
    setShowChipPanel(false);
    addUser(chip);
    setTimeout(() => {
      deliverAnswer(getAnswerForQuestion(chip));
    }, 400);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');
    setShowChipPanel(false);
    addUser(text);

    setTimeout(() => {
      const result = matchUserInput(text);

      if (result.type === 'direct') {
        deliverAnswer(result.answer);
        return;
      }

      if (result.type === 'suggest') {
        addBot({
          type: 'suggest',
          text: 'Did you mean one of these?',
          options: result.options,
        });
        return;
      }

      addBot({
        type: 'fallback',
        text: "I couldn't find a close match. Browse our common questions or send us a message and our team will help.",
      });
    }, 400);
  };

  const openTopics = () => {
    setShowAllChips(false);
    setShowChipPanel(true);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-2">
      {showTooltip && !isOpen && (
        <div className="bg-white text-[#0F172A] text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg border border-gray-100 max-w-[220px] text-right">
          Need help with your research? Ask {BOT_NAME}
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-x-0 bottom-0 sm:static sm:inset-auto bg-white w-full sm:w-[340px] h-[75vh] sm:h-[480px] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden">
          <div className="bg-[#F97316] text-white px-4 py-3 flex items-center justify-between shrink-0">
            <span className="font-bold text-lg">{BOT_NAME}</span>
            <button onClick={closeChatbot} className="p-1 hover:bg-white/20 rounded-full transition-colors" aria-label="Close chat">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 flex flex-col min-h-0 bg-gray-50">
            {showChipPanel ? (
              <ChipPanel
                visibleChips={visibleChips}
                hasMoreChips={hasMoreChips}
                showAllChips={showAllChips}
                setShowAllChips={setShowAllChips}
                onChip={handleChip}
                onSendMessage={openMessageForm}
                introText={messages.length <= 1 ? messages[0]?.text : 'Pick another topic or send us a message.'}
              />
            ) : (
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                    <div
                      className={`p-3 rounded-xl max-w-[85%] text-sm leading-relaxed ${
                        msg.isBot ? 'bg-white text-gray-800 border border-gray-100 shadow-sm' : 'bg-[#F97316] text-white'
                      }`}
                    >
                      {msg.text}

                      {msg.type === 'suggest' && msg.options?.length > 0 && (
                        <div className="mt-3 flex flex-col gap-2">
                          {msg.options.map((option) => (
                            <button
                              key={option}
                              onClick={() => handleChip(option)}
                              className="text-left text-xs font-semibold px-3 py-2.5 bg-orange-50 border border-orange-100 text-[#0F172A] rounded-lg hover:border-[#F97316] hover:bg-orange-100 transition-colors"
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}

                      {msg.type === 'fallback' && (
                        <div className="mt-3 flex flex-col gap-2">
                          <button
                            onClick={openTopics}
                            className="flex items-center justify-center gap-1.5 text-xs font-bold px-3 py-2.5 bg-[#0F172A] text-white rounded-lg hover:bg-slate-800 transition-colors"
                          >
                            <List size={14} /> Browse common questions
                          </button>
                          <button
                            onClick={openMessageForm}
                            className="flex items-center justify-center gap-1.5 text-xs font-bold px-3 py-2.5 border border-orange-200 text-[#F97316] rounded-lg hover:bg-orange-50 transition-colors"
                          >
                            <MessageSquare size={14} /> Send a message
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="p-3 bg-white border-t shrink-0 space-y-2">
            {!showChipPanel && (
              <button
                onClick={openTopics}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-bold px-3 py-2 text-[#F97316] border border-orange-100 rounded-lg hover:bg-orange-50 transition-colors"
              >
                <List size={14} /> Browse common questions
              </button>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your question..."
                className="flex-1 p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316] text-sm"
              />
              <button onClick={handleSend} className="bg-[#F97316] text-white p-2.5 rounded-xl hover:bg-[#EA580C] transition-colors shrink-0" aria-label="Send">
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {!isOpen && (
        <button
          onClick={toggleChatbot}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="bg-[#F97316] text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:scale-105 hover:bg-[#EA580C] transition-all"
          aria-label={`Open ${BOT_NAME} chat`}
        >
          <MessageCircle size={26} strokeWidth={2.25} />
        </button>
      )}
    </div>
  );
};

export default Chatbot;
