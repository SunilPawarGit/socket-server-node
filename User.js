const users = [];

const addUser = ({ id, name, room }) => {
  // name = name.trim();
  // room = room.trim().toLowerCase();

  const existingUser = users.find(
    (user) => user.room === room && user.name === name
  );
  // console.log(existingUser, users, name, room);
  if (existingUser) {
    return { error: "Username is taken" };
  }
  const user = { id, name, room };

  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  //   console.log(users, index);
  if (index !== -1) {
    // console.log(users.splice(index, 1)[0]);
    // let uu = users[index];

    // users = users.filter((user) => user.id !== id);
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => users.find((user) => user.id === id);

const getUsersInRoom = (room) => users.filter((user) => user.room === room);

module.exports = { addUser, removeUser, getUser, getUsersInRoom };
