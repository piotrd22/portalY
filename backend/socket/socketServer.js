module.exports = (sio) => {
  // let timeoutId;
  // let newPostsCount = 0;

  sio.on("connection", (socket) => {
    socket.on("joinRoom", (room) => {
      socket.join(room);
      console.log(`Socket joined room: ${room}`);
    });

    socket.on("leaveRoom", (room) => {
      // clearTimeout(timeoutId);
      // timeoutId = null;
      // newPostsCount = 0;
      socket.leave(room);
      console.log(`Socket left room: ${room}`);
    });

    // TODO Change it so that there is no timeout on the side and move it to the front. On the front end, in the thread, you will collect information and simply display these things.
    socket.on("newPost", (room) => {
      socket.to(room).emit("newPosts"); // To everyone in the room except this user
      // newPostsCount++;
      // if (!timeoutId) {
      //   timeoutId = setTimeout(() => {
      //     if (newPostsCount > 1) {
      //       sio.to(room).emit("newPosts"); // To everyone in the room
      //     } else {
      //       socket.to(room).emit("newPosts"); // To everyone in the room except this user
      //     }
      //     newPostsCount = 0;
      //     timeoutId = null;
      //   }, 10000);
      // }
    });

    socket.on("disconnect", () => {
      // clearTimeout(timeoutId);
      // timeoutId = null;
      // newPostsCount = 0;
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return sio;
};
