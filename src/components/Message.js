import React from 'react';
import { useDispatch } from 'react-redux';
import { deleteMessage } from '../store/features/messages/messagesSlice';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import 'prismjs/components/prism-typescript';
import { format, isValid } from 'date-fns';

const Message = ({ text, from, timestamp, index }) => {
  const dispatch = useDispatch();

  const handleDelete = () => {
    dispatch(deleteMessage(index));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  const renderText = (text) => {
    const codeBlockRegex = /```(.*?)```/gs;
    const parts = text.split(codeBlockRegex);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return (
          <pre key={index} className="language-typescript">
            <code
              dangerouslySetInnerHTML={{
                __html: Prism.highlight(part, Prism.languages.typescript, 'typescript'),
              }}
            />
          </pre>
        );
      }
      return <p key={index}>{part}</p>;
    });
  };

  const date = new Date(timestamp);
  const formattedTimestamp = isValid(date) ? format(date, 'dd MMMM, EEEE yyyy - hh:mm a') : 'Invalid date';

  return (
    <div className={from === 'user' ? 'user-message' : 'ai-message'}>
      {renderText(text)}
      <div className="message-meta">
        <span className="timestamp">{formattedTimestamp}</span>
        {from !== 'user' &&
          <button onClick={handleCopy}>Copy</button>
        }
        <button onClick={handleDelete}>Delete</button>
      </div>
    </div>
  );
};

export default Message;
