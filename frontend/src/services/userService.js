import apiClient from "./apiClient";

export default {
  createUser(user) {
    return apiClient.post("/users", user);
  },
};
