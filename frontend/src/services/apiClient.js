import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://" + window.location.hostname + ":8080/api",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export default apiClient;
