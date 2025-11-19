'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import styles from './ChatWidget.module.css';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<{ name: string; phone: string } | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [messages, setMessages] = useState<Array<{ id: number; text: string; sender: 'user' | 'bot'; timestamp: Date }>>([
    {
      id: 1,
      text: 'Hello! How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && formData.phone.trim()) {
      setUserInfo({ name: formData.name, phone: formData.phone });
      setShowContactForm(false);
      
      // Add message about manager connecting
      setTimeout(() => {
        setMessages((prev) => {
          const managerMessage = {
            id: prev.length + 1,
            text: 'Thank you for providing your contact details! Our manager is connecting to the chat...',
            sender: 'bot' as const,
            timestamp: new Date(),
          };
          return [...prev, managerMessage];
        });
      }, 500);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user' as const,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputValue('');

    // Check if this is the first user message
    const isFirstUserMessage = messages.filter(m => m.sender === 'user').length === 0;

    // Simulate bot response
    setTimeout(() => {
      const botMessage = {
        id: messages.length + 2,
        text: isFirstUserMessage 
          ? 'Thank you for your message! To continue, please provide your contact details.'
          : 'Thank you for your message! Our team will get back to you shortly.',
        sender: 'bot' as const,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      
      // Show contact form after first user message
      if (isFirstUserMessage) {
        setTimeout(() => {
          setShowContactForm(true);
        }, 500);
      }
    }, 1000);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.chatWidget}>
      {isOpen && (
        <div className={styles.chatWindow} ref={chatContainerRef}>
          <div className={styles.chatHeader}>
            <div className={styles.chatHeaderContent}>
              <div className={styles.chatHeaderAvatar}>
                <Image
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces"
                  alt="Support Agent"
                  width={48}
                  height={48}
                  className={styles.agentPhoto}
                  unoptimized
                />
              </div>
              <div className={styles.chatHeaderInfo}>
                <h3 className={styles.chatHeaderTitle}>Sarah Johnson</h3>
                <p className={styles.chatHeaderStatus}>Online</p>
              </div>
            </div>
            <button className={styles.chatCloseButton} onClick={handleToggle}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <div className={styles.chatMessages}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`${styles.message} ${styles[message.sender]}`}
              >
                {message.sender === 'user' && userInfo && (
                  <span className={styles.messageSender}>{userInfo.name}</span>
                )}
                <div className={styles.messageContent}>
                  <p className={styles.messageText}>{message.text}</p>
                  <span className={styles.messageTime}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {showContactForm && !userInfo && (
              <div className={styles.contactFormInChat}>
                <form className={styles.contactFormContent} onSubmit={handleFormSubmit}>
                  <input
                    type="text"
                    className={styles.contactFormInput}
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  <input
                    type="tel"
                    className={styles.contactFormInput}
                    placeholder="Your phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                  <button type="submit" className={styles.contactFormButton}>
                    Continue
                  </button>
                </form>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          {!showContactForm || userInfo ? (
            <form className={styles.chatInputForm} onSubmit={handleSend}>
              <input
                type="text"
                className={styles.chatInput}
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                autoFocus
              />
              <button type="submit" className={styles.chatSendButton}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 2L9 11M18 2L12 18L9 11M18 2L2 8L9 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </form>
          ) : null}
        </div>
      )}
      <button className={styles.chatToggleButton} onClick={handleToggle} aria-label="Toggle chat">
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        {!isOpen && userInfo && messages.length > 1 && (
          <span className={styles.chatBadge}>{messages.length - 1}</span>
        )}
      </button>
    </div>
  );
}

