import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, Mic, MicOff, Loader2, StopCircle } from 'lucide-react';
import api from '../api/client';
import './Interview.css';

export default function Interview() {
  const [searchParams] = useSearchParams();
  const interviewId = searchParams.get('id');

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history
  useEffect(() => {
    if (interviewId) {
      api.get(`/interview/${interviewId}/messages`)
        .then(res => {
          if (res.data.messages && res.data.messages.length > 0) {
            setMessages(res.data.messages);
          }
        })
        .catch(err => console.error("Error loading messages", err));
    }
  }, [interviewId]);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setInput((prev) => prev + transcript + ' ');
          } else {
            currentTranscript += transcript;
          }
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setInput(''); // Clear input before listening
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !interviewId) return;
    
    if (isListening) {
      toggleListening();
    }

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await api.post(`/interview/${interviewId}/chat`, {
        message: userMsg
      });
      setMessages(prev => [...prev, { role: 'ai', content: response.data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I lost connection to the server." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const endInterview = async () => {
    if (!interviewId) return;
    setIsEvaluating(true);
    try {
      const response = await api.post(`/interview/${interviewId}/evaluate`);
      setEvaluation(response.data.feedback);
    } catch (err) {
      console.error(err);
      setEvaluation("Failed to retrieve evaluation. Please try again later.");
    } finally {
      setIsEvaluating(false);
    }
  };

  if (evaluation) {
    return (
      <div className="interview-container animate-fade-in">
        <div className="chat-panel glass-panel evaluation-panel">
          <h3>Interview Completed</h3>
          <div className="evaluation-content">
            <h4>AI Feedback & Suggestions</h4>
            <p style={{ whiteSpace: 'pre-wrap' }}>{evaluation}</p>
          </div>
          <button className="primary-btn" onClick={() => window.location.href = '/'}>
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="interview-container animate-fade-in">
      <div className="chat-panel glass-panel">
        <div className="chat-header">
          <h3>Practice Interview</h3>
          <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
            <span className="live-badge">ACTIVE</span>
            <button className="end-btn" onClick={endInterview} disabled={isEvaluating || isTyping}>
              {isEvaluating ? <Loader2 size={16} className="spinner" /> : <StopCircle size={16} />}
              <span style={{marginLeft: '4px'}}>End & Evaluate</span>
            </button>
          </div>
        </div>
        
        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role}`}>
              <div className="message-content">{msg.content}</div>
            </div>
          ))}
          {isTyping && (
            <div className="message ai">
              <div className="message-content" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Loader2 size={16} className="spinner" /> <span>AI is typing...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="chat-input-area">
          <button 
            className={`mic-btn ${isListening ? 'listening' : ''}`} 
            onClick={toggleListening}
            title={isListening ? "Stop Listening" : "Start Speaking"}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <input 
            type="text" 
            placeholder={isListening ? "Listening..." : "Type your response..."} 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            disabled={isTyping}
          />
          <button className="send-btn" onClick={handleSend} disabled={isTyping || !input.trim()}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
