import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: JSON.parse(localStorage.getItem('chatMessages')) || [],
};

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
      localStorage.setItem('chatMessages', JSON.stringify(state.messages));
    },
    clearMessages: (state) => {
      state.messages = [];
      localStorage.removeItem('chatMessages');
    },
    deleteMessage: (state, action) => {
      state.messages = state.messages.filter((msg, index) => index !== action.payload);
      localStorage.setItem('chatMessages', JSON.stringify(state.messages));
    }
  },
});

export const { addMessage, clearMessages, deleteMessage } = messagesSlice.actions;
export default messagesSlice.reducer;
