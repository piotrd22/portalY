module.exports = (sio) => {
  sio.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("joinRoom", (room) => {
      socket.join(room);
      console.log(`Socket joined room: ${room}`);
    });

    socket.on("leaveRoom", (room) => {
      socket.leave(room);
      console.log(`Socket left room: ${room}`);
    });

    socket.on("newPost", (room) => {
      socket.to(room).emit("newPosts"); // To everyone in the room except this user
    });

    socket.on("newFeedPost", () => {
      socket.request.user.followers.forEach((follower) => {
        socket.to(follower.toString()).emit("newFeedPosts");
      });
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return sio;
};
