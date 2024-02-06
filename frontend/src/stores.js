import { defineStore } from "pinia";
import { io } from "socket.io-client";

export const useSocketStore = defineStore("socket", {
  state: () => ({
    socket: null,
  }),
  actions: {
    setSocket(socket) {
      this.socket = socket;
    },
    initializeSocket() {
      const socket = io("wss://" + window.location.hostname + ":8080", {
        transports: ["websocket"],
      });
      this.setSocket(socket);
    },
    disconnectSocket() {
      if (this.socket) {
        this.socket.disconnect();
        this.setSocket(null);
      }
    },
  },
});
