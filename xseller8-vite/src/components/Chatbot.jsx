import React, { useState, useEffect, useRef } from 'react';

const Chatbot = ({ log }) => {
  const [messages, setMessages] = useState([
    'Welcome to Xseller8! How can I assist you today?',
  ]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (log) {
      setMessages((prevMessages) => [...prevMessages, `System: ${log}`]);
    }
  }, [log]);

  // Auto-scroll to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleUserInput = (e) => {
    e.preventDefault();
    const input = e.target.elements.userInput.value;
    if (input) {
      setMessages((prevMessages) => [...prevMessages, `User: ${input}`]);
      e.target.elements.userInput.value = ''; // Clear the input

      // Simulate an AI response (stubbed)
      setTimeout(() => {
        const aiResponse = `AI: I'm learning from your data. Ask me anything about Xseller8.`;
        setMessages((prevMessages) => [...prevMessages, aiResponse]);
      }, 1000); // Simulate delay for AI response
    }
  };

  return (
    <div className="chatbot-container">
      <h3>Chatbot</h3>
      <div className="chatbot-messages">
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
        <div ref={chatEndRef} /> {/* Empty div for auto-scrolling */}
      </div>
      <form onSubmit={handleUserInput}>
        <input type="text" name="userInput" placeholder="Ask the chatbot..." />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chatbot;
