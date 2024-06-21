import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Prism from "prismjs";
import "prismjs/themes/prism.css";
import { Spinner } from "react-bootstrap";
import rateLimit from "axios-rate-limit";

const MAX_CHAR_COUNT = 5000;
const http = rateLimit(axios.create(), { maxRequests: 5, perMilliseconds: 1000 });

function Message({ text, from }) {
  const renderText = (text) => {
    const codeBlockRegex = /```([^```]+)```/g;
    const parts = text.split(codeBlockRegex);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return (
          <pre key={index} className="language-js">
            <code
              dangerouslySetInnerHTML={{
                __html: Prism.highlight(part, Prism.languages.javascript, "javascript"),
              }}
            />
          </pre>
        );
      }
      return <p key={index}>{part}</p>;
    });
  };

  return (
    <div className={from === "user" ? "user-message" : "ai-message"}>
      {renderText(text)}
    </div>
  );
}

function ChatRoom() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [apiModel, setApiModel] = useState(process.env.REACT_APP_OPENAI_API_MODEL);
  const [apiTemperature, setApiTemperature] = useState(0.7);
  const [apiMaxTokens, setApiMaxTokens] = useState(150);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const savedMessages = localStorage.getItem("chatMessages");
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (input.trim() === "") {
      setError("Message cannot be empty.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await http.post(
        `${process.env.REACT_APP_OPENAI_API_BASE_URL}/chat/completions`,
        {
          model: apiModel,
          messages: [{ role: "user", content: input }],
          temperature: apiTemperature,
          max_tokens: apiMaxTokens,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          },
        }
      );

      const aiResponse = response.data.choices[0].message.content;

      setInput("");
      setMessages([...messages, { text: input, from: "user" }, { text: aiResponse, from: "Chat AI" }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const text = await file.text();
      setInput(`\`\`\`${file.type}\n${text}\n\`\`\``);
    }
  };

  return (
    <div className="ChatRoom">
      <div className="messages">
        {messages.map((msg, index) => (
          <Message key={index} text={msg.text} from={msg.from} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-area">
        <textarea
          value={input}
          rows={8}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your Message"
          className="chatbox"
          onKeyPress={handleKeyPress}
          maxLength={MAX_CHAR_COUNT}
        />
        <div className="char-count">{input.length}/{MAX_CHAR_COUNT}</div>
        <input type="file" onChange={handleFileUpload} />
        <button onClick={sendMessage} disabled={loading}>Send</button>
        {loading && <Spinner animation="border" />}
      </div>
      {error && <p className="error">{error}</p>}
      <div className="api-params">
        <label>
          Model:
          <input type="text" value={apiModel} onChange={(e) => setApiModel(e.target.value)} />
        </label>
        <label>
          Temperature:
          <input type="number" value={apiTemperature} onChange={(e) => setApiTemperature(e.target.value)} min="0" max="1" step="0.1" />
        </label>
        <label>
          Max Tokens:
          <input type="number" value={apiMaxTokens} onChange={(e) => setApiMaxTokens(e.target.value)} min="1" max="4096" />
        </label>
      </div>
      <button onClick={() => setMessages([])}>Clear Chat History</button>
    </div>
  );
}

export default ChatRoom;
