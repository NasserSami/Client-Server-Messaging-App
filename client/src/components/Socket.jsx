import { useState, useEffect, useRef } from "react";
import {
  Paper,
  CardHeader,
  CardContent,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import io from "socket.io-client";

const Socket = () => {
  /* Text Field */

  const [text, setText] = useState("");

  /* Logging */

  const [log, setLog] = useState([]);

  // https://react.dev/reference/react/useState#setstate
  // If you pass a function as nextState, it will be treated as an updater function
  // It should take the pending state as its only argument and return the next state
  const appendToLog = (newLine) =>
    setLog((currentLog) => [...currentLog, newLine]);
  const renderLog = () =>
    log.map((line, index) => (
      <div key={index}>
        <Typography variant="h6">{line}</Typography>
      </div>
    ));

  /* WebSocket */

  // https://react.dev/reference/react/useRef
  // useRef is a React Hook that lets you reference a value that’s not needed for rendering
  const effectRan = useRef(false);
  const socket = useRef();

  const connectToServer = () => {
    if (effectRan.current) return; // Don't run twice with Strict Mode

    try {
      appendToLog("Trying to connect...");

      // TODO: Will have to be dynamic for AWS deployment
      const ws = io.connect("localhost:9000", {
        forceNew: true,
        transports: ["websocket"],
      });

      ws.on("connect", () => appendToLog("Client connected"));
      ws.on("disconnect", () => appendToLog("Client disconnected"));

      ws.on("a hello from the server", (data) => appendToLog(data));

      socket.current = ws;
      effectRan.current = true; // Flag to prevent connecting twice
    } catch (e) {
      console.warn(e);
    }
  };

  const emitEvent = (data) => {
    socket.current.emit("a custom event name", data);
  };

  /* Component Life Cycle */

  useEffect(() => {
    connectToServer();
  }, []);

  /* Component Rendering */

  return (
    <>
      <Paper elevation={4} sx={{ mt: "0.5em" }}>
        <CardContent>
          <CardHeader title="Emit Event From Client" />
          <TextField
            fullWidth
            label="Event Data"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: "1em" }}
            onClick={() => emitEvent(text)}
          >
            Emit Event
          </Button>
        </CardContent>
      </Paper>
      <Paper elevation={4} sx={{ mt: "0.5em" }}>
        <CardHeader title="Log" />
        <CardContent>{renderLog()}</CardContent>
      </Paper>
    </>
  );
};

export default Socket;
