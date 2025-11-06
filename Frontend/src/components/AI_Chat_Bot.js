import React, { useState, useRef, useEffect, useContext } from 'react';
function AIChatbotModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m your AI assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Ref for the chat messages container
  const messagesEndRef = useRef(null);

  const quickReplies = [
    'How does the free trial work?',
    'What features are included?',
    'How do I get started?',
    'Contact support'
  ];

  const handleSendMessage = async (message = inputMessage) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponse = generateAIResponse(message);
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: botResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000); // Random delay for realism
  };

  const generateAIResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('trial') || lowerMessage.includes('free')) {
      return 'Our free trial gives you 14 days of full access to all features with no credit card charges. You can cancel anytime during the trial period. Would you like me to help you get started?';
    }
    
    if (lowerMessage.includes('feature') || lowerMessage.includes('include')) {
      return 'Learnlytics includes real-time analytics, AI-powered insights, student engagement monitoring, dropout risk prediction, personalized recommendations, and comprehensive reporting. Which aspect interests you most?';
    }
    
    if (lowerMessage.includes('start') || lowerMessage.includes('begin')) {
      return 'Getting started is easy! Click any "Start Free Trial" button on our pricing plans, fill out the form, and you\'ll have instant access. I can walk you through the setup process if you\'d like.';
    }
    
    if (lowerMessage.includes('support') || lowerMessage.includes('contact') || lowerMessage.includes('help')) {
      return 'I\'m here to help! For technical support, you can email us at support@learnlytics.app or call 1800-LEARN-ED. Is there something specific I can assist you with?';
    }
    
    if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return 'We offer three plans: Starter ($99/month), Professional ($299/month), and Enterprise (custom pricing). All plans include a 14-day free trial. What size institution are you working with?';
    }
    
    return 'That\'s a great question! Let me connect you with our team for more detailed information. In the meantime, you can explore our features or start a free trial to see Learnlytics in action.';
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-scroll to bottom when messages change or typing starts
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleQuickReply = (reply) => {
    handleSendMessage(reply);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content chatbot-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header chatbot-header">
          <div className="chatbot-title">
            <div className="chatbot-avatar">🤖</div>
            <div>
              <h3>AI Assistant</h3>
              <span className="chatbot-status">Online</span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="chatbot-body">
          <div className="chat-messages">
            {messages.map((message) => (
              <div key={message.id} className={`chat-message ${message.type}`}>
                <div className="message-content">
                  {message.content}
                </div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="chat-message bot typing">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            {/* Invisible element for auto-scrolling */}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="quick-replies">
            {quickReplies.map((reply, index) => (
              <button 
                key={index} 
                className="quick-reply-btn"
                onClick={() => handleQuickReply(reply)}
              >
                {reply}
              </button>
            ))}
          </div>
          
          <form className="chat-input-form" onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
            <div className="chat-input-container">
              <input
                type="text"
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="chat-input"
              />
              <button type="submit" className="chat-send-btn" disabled={!inputMessage.trim()}>
                <span>→</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
export default AIChatbotModal;