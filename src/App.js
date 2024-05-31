import logo from "./logo.svg";
import "./App.css";
import ChatRoom from "./Chatroom";

function App() {
  return (
    <div className="App">
      <header style={{ height: "50px" }}>
          My Chatroom
      </header>
      <ChatRoom />
    </div>
  );
}

export default App;
