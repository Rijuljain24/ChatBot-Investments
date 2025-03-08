import React, { useState } from "react";
import ChatBotIcon from "./components/ChatBotIcon";
import ChatForm from "./components/ChatForm";
import ChatMessage from "./components/ChatMessage";

const App = () => {
  const [chatHistory, setChatHistory] = useState([]);

  const generateBotResponse = async (history) => {
    const updateHistory = (text) => {
      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "Thinking..."),
        { role: "model", text },
      ]);
    };
  
    // Convert history into the required format
    history = history.map(({ role, text }) => ({ role, parts: [{ text }] }));
  
    const requestOptions = {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: history }),
    };
  
    try {
      // Fetching API data
      const response = await fetch(import.meta.env.VITE_API_URL, requestOptions);
  
      // If the response isn't ok, throw an error
      if (!response.ok) throw new Error("API request failed");
  
      // Parse the response to JSON
      const data = await response.json();
      console.log("API response data:", data); // Log the response to inspect its structure
  
      // Check if the response contains the required structure
      if (
        !data ||
        !data.candidates ||
        !data.candidates[0] ||
        !data.candidates[0].content ||
        !data.candidates[0].content.parts
      ) {
        throw new Error("Invalid API response format or missing parts");
      }
  
      // Extract text from the response, removing markdown formatting
      const apiResponseText = data.candidates[0].content.parts[0].text
        .replace(/\*\*(.*?)\*\*/g, "$1") // Remove markdown bold
        .trim();
  
      // Update chat history with bot's response
      updateHistory(apiResponseText);
    } catch (error) {
      console.error("Error:", error.message);
    }
  };
  

  return (
    <div className="container">
      <div className="chatbot-popup">
        <div className="chat-header">
          <div className="header-info">
            <ChatBotIcon />
            <h2 className="logo-text">Chatbot</h2>
          </div>
          <button className="material-symbols-rounded">
            keyboard_arrow_down
          </button>
        </div>
        <div className="chat-body">
          <div className="message bot-message">
            <ChatBotIcon />
            <p className="message-text">
              Hey There! <br /> How can I help you today?
            </p>
          </div>
          {chatHistory.map((chat, index) => (
            <ChatMessage key={index} chat={chat} />
          ))}
        </div>
        <div className="chat-footer">
          <ChatForm
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            generateBotResponse={generateBotResponse}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
