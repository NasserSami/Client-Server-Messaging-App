import { useState, useEffect, useRef } from "react"; // Add the useEffect and useRef imports
/* Material UI & Styling */

import { createTheme, ThemeProvider } from "@mui/material";
import { green } from "@mui/material/colors";

import io from "socket.io-client";
import "./App.css";

const theme = createTheme({
  palette: {
    primary: {
      main: green[400],
    },
  },
});

/* Components */

import Header from "./components/Header";
import Login from "./components/Login";
import Chat from "./components/Chat";

/* App Component */

function App() {
  /* Login */

  const [joinInfo, setJoinInfo] = useState({
    userName: "",
    roomName: "",
    error: "",
  });

  const [users, setUsers] = useState([]);
  /* Chat */

  const [chatLog, setChatLog] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  const sendMessage = (text) => {
    socket.current.send(text);
  };

  const notifyTyping = (typingInfo) => {
    socket.current.emit("typing", typingInfo);
  };

  const hasJoined = () =>
    joinInfo.userName && joinInfo.roomName && !joinInfo.error;

  const handleLogout = () => {
    socket.current.disconnect();
    setJoinInfo({
      userName: "",
      roomName: "",
      error: "",
    });
  };

  const joinRoom = (joinData) => {
    if (!socket.current.connected)
        socket.current.connect();
    socket.current.emit("join", joinData);
    socket.current.on("room users", (users) => {
      setUsers(users);
    });
  };

  /* WebSocket */

  // https://react.dev/reference/react/useRef
  // useRef is a React Hook that lets you reference a value that’s not needed for rendering
  const effectRan = useRef(false);
  const socket = useRef();

  const connectToServer = () => {
    if (effectRan.current) return; // Don't run twice with Strict Mode

    try {
      // Only use localhost:9000 if the app is being hosted on port 5173 (i.e. Vite)
      const wsServerAddress =
        window.location.port == 5173 ? "localhost:9000" : "/";
      const ws = io.connect(wsServerAddress, { transports: ["websocket"] });

      // Handle join
      ws.on("join-response", setJoinInfo);
      ws.on("chat update", setChatLog);
      //ws.on("typing", (data) => console.log(data));
      ws.on("typing", setTypingUsers);

      socket.current = ws;
      effectRan.current = true; // Flag to prevent connecting twice
    } catch (e) {
      console.warn(e);
    }
  };

  useEffect(() => {
    connectToServer();
  }, []);

  /* App Rendering */

  return (
    <ThemeProvider theme={theme}>
      <Header title="Chatter Mates - Sam Nasser" />
      {hasJoined() ? (
        <Chat
          {...joinInfo}
          sendMessage={sendMessage}
          onLogout={handleLogout}
          chatLog={chatLog}
          roomName={joinInfo.roomName}
          userInfo={joinInfo}
          users={users}
          typingUsers={typingUsers}
          notifyTyping={notifyTyping}
        />
      ) : (
        <Login joinRoom={joinRoom} error={joinInfo.error} />
      )}
    </ThemeProvider>
  );
}

export default App;
