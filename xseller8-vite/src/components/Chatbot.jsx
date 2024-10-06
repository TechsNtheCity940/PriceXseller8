import React, { useState, useEffect, useRef } from 'react';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    // Fetch and display conversation history for the current session
    fetchConversationHistory()
      .then((history) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          `Conversation History: ${history.conversation_summary}`,
          `Key Insights: ${history.key_insights}`,
        ]);
      })
      .catch((error) => {
        setMessages((prevMessages) => [...prevMessages, 'Error: Unable to fetch conversation history.']);
      });
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleUserInput = async (e) => {
    e.preventDefault();
    const input = userInput;
    if (input) {
      setMessages((prevMessages) => [...prevMessages, `User: ${input}`]);
      setUserInput('');

      try {
        const response = await fetch('http://localhost:5000/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt: input }),
        });

        const data = await response.json();

        if (response.ok) {
          setMessages((prevMessages) => [...prevMessages, `AI: ${data.response}`]);
        } else {
          setMessages((prevMessages) => [...prevMessages, `Error: ${data.error}`]);
        }
      } catch (error) {
        setMessages((prevMessages) => [...prevMessages, 'Error: Unable to connect to the AI service.']);
      }
    }
  };

  const fetchConversationHistory = async () => {
    try {
      const response = await fetch('http://localhost:5000/session/history', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await response.json();
    } catch (error) {
      throw new Error('Failed to fetch conversation history.');
    }
  };

  return (
    <div className="chatbot-container">
      <h3>Chatbot</h3>
      <div className="chatbot-messages">
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleUserInput}>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Ask the chatbot..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chatbot;
