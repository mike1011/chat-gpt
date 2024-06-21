import React from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import 'prismjs/components/prism-typescript'; // Import TypeScript grammar

const Message = ({ text, from }) => {
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

  return (
    <div className={from === 'user' ? 'user-message' : 'ai-message'}>
      {renderText(text)}
    </div>
  );
};

export default Message;
