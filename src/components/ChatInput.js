import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { addMessage } from '../store/features/messages/messagesSlice';
import { Spinner } from 'react-bootstrap';
import rateLimit from 'axios-rate-limit';

const MAX_CHAR_COUNT = 5000;
const MAX_TOKENS = 500; // Increase this value to allow for longer responses
const http = rateLimit(axios.create(), { maxRequests: 5, perMilliseconds: 1000 });

const ChatInput = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [apiModel, setApiModel] = useState(process.env.REACT_APP_OPENAI_API_MODEL);
  const [apiTemperature, setApiTemperature] = useState(0.7);
  const [apiMaxTokens, setApiMaxTokens] = useState(MAX_TOKENS);
  const dispatch = useDispatch();

  const sendMessage = async (content, append = false) => {
    if (content.trim() === '') {
      setError('Message cannot be empty.');
      return;
    }
    setLoading(true);
    setError('');
    const timestamp = new Date().toISOString(); // Ensure timestamp is a valid ISO string
    try {
      const response = await http.post(
        `${process.env.REACT_APP_OPENAI_API_BASE_URL}/chat/completions`,
        {
          model: apiModel,
          messages: [{ role: 'user', content }],
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
      const isComplete = response.data.choices[0].finish_reason !== 'length';

      dispatch(addMessage({ text: content, from: 'user', timestamp }));
      dispatch(addMessage({ text: aiResponse, from: 'Chat AI', timestamp: new Date().toISOString() }));

      if (!isComplete) {
        await sendMessage('Please continue from where you left off.', true);
      }

      if (!append) setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage(input);
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
    <div className="input-area">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter your Message"
        className="chatbox"
        onKeyPress={handleKeyPress}
        maxLength={MAX_CHAR_COUNT}
        style={{ minHeight: '50px', maxHeight: '500px', overflowY: 'auto' }}
      />
      <div className="char-count">{input.length}/{MAX_CHAR_COUNT}</div>
      <input type="file" onChange={handleFileUpload} />
      <div className="send-options">
        <button onClick={() => sendMessage(input)} disabled={loading}>Send</button>
        {loading && <Spinner animation="border" />}
        {error && <p className="error">{error}</p>}
        <button onClick={() => setShowSettings(!showSettings)}>
          {showSettings ? 'Hide Settings' : 'Show Settings'}
        </button>
      </div>
      {showSettings && (
        <div className="api-params">
          <label>
            Model:
            <input type="text" value={apiModel} onChange={(e) => setApiModel(e.target.value)} />
          </label>
          <label>
            Temperature:
            <input
              type="number"
              value={apiTemperature}
              onChange={(e) => setApiTemperature(e.target.value)}
              min="0"
              max="1"
              step="0.1"
            />
          </label>
          <label>
            Max Tokens:
            <input
              type="number"
              value={apiMaxTokens}
              onChange={(e) => setApiMaxTokens(e.target.value)}
              min="1"
              max="4096"
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default ChatInput;
