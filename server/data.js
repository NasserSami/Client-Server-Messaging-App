let users = new Set();

const registerUser = (userName) => {
  users.add(userName);
  console.log(`User registered: ${userName}`);
};

const unregisterUser = (userName) => {
  users.delete(userName);
  console.log(`User removed: ${userName}`);
};

const isUserNameTaken = (userName) => {
  return users.has(userName);
};

//created a room object to store the messages and typing users
// let roomLogs = {};
// const roomLog = (room) => roomLogs[room];
// const addMessage = (room, messageInfo) => {
//   if (!roomLogs[room]) {
//     roomLogs[room] = [];
//   }
//   roomLogs[room].push(messageInfo);
// };

/* data.js */

class Room {
  /* Static Interface */

  static #rooms = {};

  static get(roomName) {
    if (!Room.#rooms[roomName]) {
      Room.#rooms[roomName] = new Room(roomName);
    }
    return this.#rooms[roomName];
  }

  /* Instance Methods */

  #name = "";
  #log = [];
  #typingUsers = new Set();

  constructor(name) {
    this.#name = name;
  }

  get name() {
    return this.#name;
  }

  get log() {
    return this.#log;
  }

  get typingUsers() {
    return this.#typingUsers;
  }

  addMessage(messageInfo) {
    messageInfo.timestamp = Date.now();
    this.#log.push(messageInfo);
  }
  updateTypingStatus(userName, isTyping) {
    if (isTyping) {
      this.#typingUsers.add(userName);
    } else {
      this.#typingUsers.delete(userName);
    }
  }
}

const roomLog = (roomName) => {
  return Room.get(roomName).log;
};

const addMessage = (roomName, messageInfo) => {
  Room.get(roomName).addMessage(messageInfo);
};

const updateTypingStatus = (roomName, userName, isTyping) => {
  Room.get(roomName).updateTypingStatus(userName, isTyping);
};

const getTypingUsers = (roomName) => {
  return Array.from(Room.get(roomName).typingUsers);
};

// Function to find the last message from a specific user
const findLastMessageFromUser = (roomName, userName) => {
  const messages = Room.get(roomName).log;
  
  // Search from most recent to oldest
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    // Only consider messages from this user that are not system messages
    if (message.sender === userName && message.text) {
      return { index: i, message };
    }
  }
  
  return null;
};

//edit message
const editMessage = (roomName, userName, newText) => {
  const result = findLastMessageFromUser(roomName, userName);
  if (!result) return false;

  const { index } = result;
  const messages = Room.get(roomName).log;

  // Don't allow editing already deleted messages
  if (messages[index].deletedAt) return false;

  messages[index].text = newText;
  messages[index].editAt = Date.now();

  return true;
};

// Delete a message
const deleteMessage = (roomName, userName) => {
  const result = findLastMessageFromUser(roomName, userName);
  if (!result) return false;

  const { index } = result;
  const messages = Room.get(roomName).log;

  // Soft delete by setting deletedAt timestamp
  messages[index].deletedAt = Date.now();

  return true;
};



export {
  registerUser,
  unregisterUser,
  isUserNameTaken,
  roomLog,
  addMessage,
  updateTypingStatus,
  getTypingUsers,
  editMessage,
  deleteMessage,
};
