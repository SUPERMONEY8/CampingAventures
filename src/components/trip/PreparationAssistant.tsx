/**
 * Preparation Assistant Component
 * 
 * AI-powered chatbot assistant for trip preparation with personalized advice
 * based on user profile, trip details, weather, and difficulty.
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Backpack,
  X,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { matchQuestionToAnswer } from '../../utils/preparationAI';
import { useAuth } from '../../hooks/useAuth';
import { useUserProfile } from '../../hooks/useUser';
import type { Trip, WeatherForecast } from '../../types';

/**
 * Message interface
 */
interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/**
 * PreparationAssistant props
 */
interface PreparationAssistantProps {
  /**
   * Trip data
   */
  trip: Trip;

  /**
   * Weather forecast
   */
  weather?: WeatherForecast[];

  /**
   * Whether assistant is open (if used as modal)
   */
  open?: boolean;

  /**
   * Close handler (if used as modal)
   */
  onClose?: () => void;

  /**
   * Compact mode (for sidebar)
   */
  compact?: boolean;
}

/**
 * Quick question suggestions
 */
const quickQuestions = [
  'Que dois-je emporter ?',
  'Quel temps fera-t-il ?',
  'Comment me préparer physiquement ?',
  'Que faire en cas d\'urgence ?',
  'Où est le point de rendez-vous ?',
];

/**
 * PreparationAssistant Component
 */
export function PreparationAssistant({
  trip,
  weather,
  open = true,
  onClose,
  compact = false,
}: PreparationAssistantProps) {
  const { user } = useAuth();
  const { data: userProfile } = useUserProfile(user?.id);
  
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Initialize with welcome message
   */
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'assistant',
        content: `Bonjour ${userProfile?.name || 'cher participant'} ! 👋\n\nJe suis votre assistant de préparation pour **${trip.title}**.\n\nJe peux vous aider avec :\n- L'équipement à emporter\n- La météo prévue\n- La préparation physique\n- Les urgences\n- Le point de rendez-vous\n\nPosez-moi une question ou choisissez une suggestion ci-dessous !`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [trip.title, userProfile?.name, messages.length]);

  /**
   * Scroll to bottom when new message
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  /**
   * Focus input when opened
   */
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  /**
   * Handle send message
   */
  const handleSend = async (question?: string): Promise<void> => {
    const questionText = question || inputValue.trim();
    if (!questionText) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: questionText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate typing delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Get AI response
    const answer = matchQuestionToAnswer(questionText, trip, userProfile || null, weather);
    
    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      type: 'assistant',
      content: answer,
      timestamp: new Date(),
    };

    setIsTyping(false);
    setMessages((prev) => [...prev, assistantMessage]);
  };

  /**
   * Handle quick question click
   */
  const handleQuickQuestion = (question: string): void => {
    setInputValue(question);
    handleSend(question);
  };

  /**
   * Format message content (simple markdown)
   */
  const formatMessage = (content: string): React.ReactElement => {
    // Split by newlines
    const lines = content.split('\n');
    
    return (
      <div className="space-y-1">
        {lines.map((line, idx) => {
          // Bold text
          if (line.startsWith('**') && line.endsWith('**')) {
            const text = line.slice(2, -2);
            return (
              <strong key={idx} className="font-semibold text-gray-900 dark:text-white">
                {text}
              </strong>
            );
          }
          
          // Bold at start
          if (line.startsWith('**')) {
            const parts = line.split('**');
            return (
              <p key={idx}>
                {parts.map((part, i) => 
                  i % 2 === 1 ? (
                    <strong key={i} className="font-semibold text-gray-900 dark:text-white">
                      {part}
                    </strong>
                  ) : (
                    <span key={i}>{part}</span>
                  )
                )}
              </p>
            );
          }
          
          // List item
          if (line.trim().startsWith('- ')) {
            return (
              <p key={idx} className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{line.trim().slice(2)}</span>
              </p>
            );
          }
          
          // Numbered list
          if (/^\d+\.\s/.test(line.trim())) {
            return (
              <p key={idx} className="flex items-start gap-2">
                <span className="text-primary font-semibold mt-0.5">
                  {line.match(/^\d+/)?.[0]}.
                </span>
                <span>{line.replace(/^\d+\.\s/, '')}</span>
              </p>
            );
          }
          
          // Regular line
          if (line.trim()) {
            return <p key={idx}>{line}</p>;
          }
          
          return <br key={idx} />;
        })}
      </div>
    );
  };

  if (compact) {
    return (
      <Card variant="glassmorphism" className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Backpack className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Assistant IA</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">Posez vos questions</p>
          </div>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            // Open full assistant (would need parent state)
            alert('Ouvrir l\'assistant complet');
          }}
          className="w-full"
        >
          Ouvrir l'assistant
        </Button>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-[600px] max-h-[80vh]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Backpack className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Assistant de Préparation</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">IA • En ligne</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-3 ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.type === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Backpack className="w-4 h-4 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.type === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">
                  {formatMessage(message.content)}
                </div>
                <p className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              {message.type === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                    {userProfile?.name.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 justify-start"
          >
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Backpack className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <motion.div
                  className="w-2 h-2 bg-gray-400 rounded-full"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  className="w-2 h-2 bg-gray-400 rounded-full"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-2 h-2 bg-gray-400 rounded-full"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Questions rapides :</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickQuestion(question)}
                className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-primary hover:text-white transition-colors flex items-center gap-1"
              >
                {question}
                <ChevronRight className="w-3 h-3" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Posez votre question..."
            className="flex-1 medical-input text-sm"
            disabled={isTyping}
          />
          <Button
            type="submit"
            variant="primary"
            size="sm"
            icon={isTyping ? Loader2 : Send}
            disabled={!inputValue.trim() || isTyping}
            className="flex-shrink-0"
          >
            {isTyping ? 'Envoi...' : 'Envoyer'}
          </Button>
        </form>
      </div>
    </Card>
  );
}

