import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import Message from './Message';

const MessagesList = () => {
  const messages = useSelector((state) => state.messages.messages);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="messages">
      {messages.map((msg, index) => (
        <Message key={index} index={index} text={msg.text} from={msg.from} timestamp={msg.timestamp} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessagesList;
