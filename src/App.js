import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import MessagesList from './components/MessagesList';
import ChatInput from './components/ChatInput';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <header>Chat Application</header>
        <div className="ChatRoom">
          <MessagesList />
          <ChatInput />
        </div>
      </div>
    </Provider>
  );
}

export default App;
