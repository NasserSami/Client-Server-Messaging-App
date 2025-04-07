import { useState, useEffect, useRef } from "react";
import * as fns from "date-fns";
import {
  Box,
  Paper,
  CardHeader,
  CardContent,
  Divider,
  Typography,
  TextField,
  Button,
  List,
  Stack,
  Drawer,
} from "@mui/material";

import SendIcon from "@mui/icons-material/Send";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";

const Chat = (props) => {
  const lastMessageRef = useRef(null);

  /* Menu */

  const [menuOpen, setMenuOpen] = useState(false);

  const renderMenu = () => {
    return (
      <Box sx={{ width: 250 }} role="presentation">
        <Stack>
          <CardHeader
            title={props.roomName}
            subheader={`${props.users.length} current user(s)`}
          />
        </Stack>
        <Divider />
        <CardContent>
          {props.users.map((user) => (
            <Typography
              key={user.userName}
              sx={{
                color: user.color,
                fontSize: 24,
                justifyContent: "left",
                display: "flex",
                alignItems: "space-between",
              }}
            >
              {user.userName}
            </Typography>
          ))}
        </CardContent>
      </Box>
    );
  };

  const renderMessage = (message, index) => {
    /* New Day Messages */
    if (message.newDay) {
      return (
        <div key={index} ref={lastMessageRef} style={{ marginBottom: "1em" }}>
          <Typography variant="h6" textAlign="center">
            <strong>{message.text}</strong>
          </Typography>
        </div>
      );
    }

    /* User Typing Message */

    if (message.typingFeedback) {
      return (
        <Typography
          key="typing-feedback"
          ref={lastMessageRef}
          variant="body1"
          textAlign="center"
          sx={{ marginBottom: "1em" }}
        >
          <i>{message.text}</i>
        </Typography>
      );
    }

    /* Timestamp */
    const messageTimestamp = message.timestamp
      ? fns.format(new Date(message.timestamp), "HH:mm")
      : "";

    /* Meta Chat Messages */

    if (message.sender == "") {
      return (
        <div
          key={index}
          ref={lastMessageRef}
          style={{ marginTop: "1em", marginBottom: "1em" }}
        >
          <Typography variant="h6" textAlign="center">
            <i>{message.text}</i>
          </Typography>
          <Typography variant="body2" sx={{ textAlign: "right" }}>
            {messageTimestamp}
          </Typography>
        </div>
      );
    }

    /* User Messages */

    const yourOwnMessage = message.sender == props.userName;
    const messageClassName = yourOwnMessage ? "user-message" : "message";

    /* Deleted Messages */
    if (message.deletedAt) {
      return (
        <div key={index} ref={lastMessageRef} className={messageClassName}>
          <div
            className="message-bubble"
            style={{ borderColor: message.color }}
          >
            <Typography
              variant="h6"
              className="message-text"
              sx={{ color: message.color }}
            >
              <strong>{message.sender}</strong>
            </Typography>
            <Typography variant="body2" sx={{ textAlign: "right" }}>
              <i>(deleted) {messageTimestamp}</i>
            </Typography>
          </div>
        </div>
      );
    }

    return (
      <div key={index} ref={lastMessageRef} className={messageClassName}>
        <div className="message-bubble" style={{ borderColor: message.color }}>
          <Typography
            variant="h6"
            className="message-text"
            sx={{ color: message.color }}
          >
            <strong>{message.sender}</strong>
          </Typography>
          <Typography variant="h6" className="message-text">
            {message.text}
          </Typography>
          <Typography variant="body2" sx={{ textAlign: "right" }}>
            {message.editAt && <i>(edited) </i>}
            {messageTimestamp}
          </Typography>
        </div>
      </div>
    );
  };

  /* Chat Log */
  const renderChatLog = () => {
    const chat = props.chatLog ?? [];
    const chatWithSpecialMessages = [];

     let lastMessage = null;
     chat.forEach((message) => {
       if (
         !lastMessage ||
         fns.getDay(lastMessage.timestamp) != fns.getDay(message.timestamp)
       ) {
         chatWithSpecialMessages.push({
           // Not a user-sent message
           sender: "",
           // Formatting to the format "Friday, April 29th, 1453"
           text: fns.format(message.timestamp, "PPPP"),
           // A new property we add during rendering to flag this as special
           newDay: true,
         });
       }
       chatWithSpecialMessages.push(message);
       lastMessage = message;
     });


      // Remove yourself from the list - you ALREADY KNOW you're typing
      let typing = props.typingUsers.filter(
        (userName) => userName != props.userName
      );

      if (typing.length > 0) {
        let text = "";

        if (typing.length == 1) {
          text = `${typing[0]} is typing...`;
        } else if (typing.length == 2) {
          text = `${typing[0]} and ${typing[1]} are typing...`;
        } else {
          text = "Multiple users are typing...";
        }

        // Adding the special flag typingFeedback similar to "newDay"
        chatWithSpecialMessages.push({
          sender: "",
          text,
          typingFeedback: true,
        });
      }

    return chatWithSpecialMessages.map(renderMessage);
  };

     useEffect(() => {
       lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
     }, [props.chatLog, props.typingUsers]);

  /* Send Message */

  const [messageText, setMessageText] = useState("");

  const handleSendMessage = () => {
    if (!messageText) return;
    props.sendMessage(messageText);
    setMessageText("");

    const { userName, roomName } = props;
    props.notifyTyping &&
      props.notifyTyping({ roomName, userName, isTyping: false });
  };

  const handleMessageTextChange = (e) => {
    setMessageText(e.target.value);

    // Adding text to an empty field
    const startedTyping = messageText == "" && e.target.value != "";
    // Erasing a text field to empty
    const finishedTyping = messageText != "" && e.target.value == "";

    // Don't spam the notification at every keystroke
    if (startedTyping || finishedTyping) {
      const { userName, roomName } = props;
      let typingInfo = { roomName, userName, isTyping: startedTyping };
      // Prevening the function to be called if the function is not in the props
      props.notifyTyping && props.notifyTyping(typingInfo);
    }
  };

  /* Render Component */

  return (
    <Paper
      elevation={4}
      sx={{ mt: "0.5em", display: "flex", flexDirection: "column" }}
    >
      {/* <CardHeader title={`${props.roomName} (as ${props.userName})`} /> */}
      <Drawer anchor="left" open={menuOpen} onClose={() => setMenuOpen(false)}>
        {renderMenu()}
      </Drawer>
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          pl: "1em",
          pr: "1em",
        }}
      >
        <Button variant="contained" onClick={() => setMenuOpen(true)}>
          <MenuIcon />
        </Button>
        <CardHeader title={props.roomName} />
        <Button variant="contained" onClick={props.onLogout}>
          <LogoutIcon />
        </Button>
      </Stack>
      <Divider />
      <CardContent>
        <List sx={{ height: "60vh", overflowY: "scroll", textAlign: "left" }}>
          {renderChatLog()}
        </List>
        <Divider />
        <Box sx={{ mt: "1em", display: "flex", direction: "row", flex: 1 }}>
          <TextField
            fullWidth
            sx={{ mr: "1em", flex: 9 }}
            // value={messageText} onChange={e => setMessageText(e.target.value)}
            value={messageText}
            onChange={handleMessageTextChange}
            onKeyDown={(e) => e.key == "Enter" && handleSendMessage()}
          />
          <Button
            fullWidth
            variant="contained"
            sx={{ flex: 1 }}
            onClick={handleSendMessage}
          >
            <SendIcon />
          </Button>
        </Box>
      </CardContent>
    </Paper>
  );
};

export default Chat;
