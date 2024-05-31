import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

function ChatRoom() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  // show loading text while waiting for response
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]); // Scroll to bottom whenever messages state changes

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_OPENAI_API_BASE_URL}/chat/completions`,
        {
          model: process.env.REACT_APP_OPENAI_API_MODEL, // Ensure this is a chat-compatible model
          messages: [
            // Optionally include a system message for context. If not needed, remove this.
            //{ role: "system", content: "Your system message here, if any" },
            { role: "user", content: input },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          },
        }
      );

      // Assuming the structure of the response allows direct access to the message text.
      // You can adjust this depending on the actual response structure.
      const aiResponse = response.data.choices[0].message.content;

      setInput("");
      setMessages([
        ...messages,
        { text: input, from: "user" },
        { text: aiResponse, from: "Chat AI" },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key press but prevent form submission if Enter is pressed
  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // Prevents the default action of the enter key (New line)
      sendMessage();
    }
  };

  return (
    <div className="ChatRoom">
      <div className="messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={msg.from === "user" ? "user-message" : "ai-message"}
          >
            {/*  <strong>{msg.from === "user" ? "You => " : "Chat AI => "}</strong> */}
            <p className="content">{msg.text}</p>
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* Empty div to scroll to */}
      </div>
      <p className="loading">{loading ? "Awaiting Response..." : ""}</p>
      <div className="input-area">
        <textarea
          value={input}
          rows={4}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your Message"
          className="chatbox"
          onKeyPress={handleKeyPress} // Listen for key press events
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default ChatRoom;
