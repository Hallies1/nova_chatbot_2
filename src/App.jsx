import React, { useState, useRef, useEffect } from 'react';

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

export default function App() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hey! I'm Nova 👋 I'm here to help you navigate college life — no question is too basic or too embarrassing to ask. What's on your mind today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage(text) {
    const userText = text || input.trim();
    if (!userText || loading) return;

    setInput('');
    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-5',
          max_tokens: 1000,
          system:
            'You are Nova, a warm friendly AI advisor for first-generation college students. Help them navigate financial aid, choosing a major, campus resources, study strategies, and college life. Be encouraging and clear. Always end with a follow up question or suggested next step.',
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();
      const reply =
        data.content?.map((b) => b.text || '').join('') || 'Sorry, try again!';
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
    } catch (e) {
      console.error(e);
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'Something went wrong — please try again.',
        },
      ]);
    }

    setLoading(false);
  }

  return (
    <div
      style={{
        fontFamily: 'Georgia, serif',
        background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        minHeight: '100vh',
        color: '#f0ece4',
        display: 'flex',
        flexDirection: 'column',
        padding: 24,
      }}
    >
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>Nova ✦</h1>
      <p style={{ color: '#9ca3af', marginBottom: 24, fontStyle: 'italic' }}>
        AI Student Advisor — Portfolio Project by Halimah Oluwabunmi Idowu
      </p>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          marginBottom: 16,
          minHeight: 300,
          maxHeight: '60vh',
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                maxWidth: '70%',
                padding: '12px 16px',
                borderRadius: 16,
                background:
                  m.role === 'user'
                    ? 'linear-gradient(135deg, #7c3aed, #a78bfa)'
                    : 'rgba(255,255,255,0.07)',
                border:
                  m.role === 'assistant'
                    ? '1px solid rgba(255,255,255,0.1)'
                    : 'none',
                fontSize: 15,
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
              }}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ color: '#a78bfa', padding: '8px 16px' }}>
            Nova is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask anything about college life..."
          style={{
            flex: 1,
            padding: '14px 18px',
            borderRadius: 28,
            border: '1px solid rgba(167,139,250,0.3)',
            background: 'rgba(255,255,255,0.06)',
            color: '#f0ece4',
            fontSize: 15,
            outline: 'none',
          }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          style={{
            padding: '14px 24px',
            borderRadius: 28,
            border: 'none',
            background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
            color: '#fff',
            fontSize: 15,
            fontWeight: 600,
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            opacity: loading || !input.trim() ? 0.6 : 1,
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
