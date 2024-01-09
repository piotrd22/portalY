import apiClient from "./apiClient";

export default {
  getFeed(page = 1, pageSize = 10) {
    const uri = `post/feed?page=${page}&pageSize=${pageSize}`;
    return apiClient.get(uri, { withCredentials: true });
  },
};
