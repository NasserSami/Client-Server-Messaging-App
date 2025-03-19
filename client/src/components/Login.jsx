import { useState } from "react";
import logo from "../assets/chat-icon.png";
import {
  Paper,
  CardHeader,
  CardContent,
  TextField,
  Button,
  Alert,
} from "@mui/material";

const Login = (props) => {
  const [roomName, setRoomName] = useState("");
  const [userName, setUserName] = useState("");

  return (
    <Paper elevation={4} sx={{ mt: "0.5em" }}>
      <img
        style={{ width: "40%", maxWidth: "200px" }}
        src={logo}
        className="App-logo"
        alt="logo"
      />
      <CardContent>
        <CardHeader title="Join a Room" />
        <TextField
          fullWidth
          label="User Name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          sx={{ mb: "1em" }}
        />
        <TextField
          fullWidth
          label="Room Name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          sx={{ mb: "1em" }}
        />
        <Button
          fullWidth
          variant="contained"
          disabled={!roomName || !userName}
          onClick={() => props.joinRoom({ roomName, userName })}
        >
          Join Room
        </Button>
      </CardContent>
      {props.error && <Alert severity="error">{props.error}</Alert>}
    </Paper>
  );
};

export default Login;