import apiClient from "./apiClient";

export default {
  login(user) {
    return apiClient.post("/auth/login", user, { withCredentials: true });
  },
  logout() {
    return apiClient.get("/auth/logout", { withCredentials: true });
  },
  isAuthenticated() {
    return apiClient.get("/auth", { withCredentials: true });
  },
};
