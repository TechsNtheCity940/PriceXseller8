import React, { useState, useEffect } from 'react';

const Chatbot = ({ log }) => {
  const [messages, setMessages] = useState([
    'Welcome to Xseller8! How can I assist you today?'
  ]);

  useEffect(() => {
    if (log) {
      setMessages(prevMessages => [...prevMessages, log]);
    }
  }, [log]);

  const handleUserInput = (e) => {
    e.preventDefault();
    const input = e.target.elements.userInput.value;
    if (input) {
      setMessages(prevMessages => [...prevMessages, `User: ${input}`]);
      e.target.elements.userInput.value = ''; // Clear the input
    }
  };

  return (
    <div className="chatbot-container">
      <h3>Chatbot</h3>
      <div className="chatbot-messages">
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
      <form onSubmit={handleUserInput}>
        <input type="text" name="userInput" placeholder="Ask the chatbot..." />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chatbot;
