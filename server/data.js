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

let roomLogs = {};
const roomLog = (room) => roomLogs[room];
const addMessage = (room, messageInfo) => {
  if (!roomLogs[room]) {
    roomLogs[room] = [];
  }
  roomLogs[room].push(messageInfo);
};


export { registerUser, unregisterUser, isUserNameTaken,roomLog, addMessage };
