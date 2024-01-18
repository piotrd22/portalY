import apiClient from "./apiClient";

export default {
  createUser(user) {
    return apiClient.post("/users", user);
  },
  getUserById(id) {
    const uri = `/users/${id}`;
    return apiClient.get(uri, { withCredentials: true });
  },
  deleteUser(id) {
    const uri = `/users/${id}`;
    return apiClient.delete(uri, { withCredentials: true });
  },
  followUser(id) {
    const uri = `/users/${id}/follow`;
    return apiClient.patch(uri, {}, { withCredentials: true });
  },
  unfollowUser(id) {
    const uri = `/users/${id}/unfollow`;
    return apiClient.patch(uri, {}, { withCredentials: true });
  },
  blockUser(id) {
    const uri = `/users/${id}/block`;
    return apiClient.patch(uri, {}, { withCredentials: true });
  },
  unblockUser(id) {
    const uri = `/users/${id}/unblock`;
    return apiClient.patch(uri, {}, { withCredentials: true });
  },
  searchUsers(keyword, lastCreatedAt, pageSize = 10) {
    const uri = `/users/search?keyword=${keyword}&lastCreatedAt=${
      lastCreatedAt || new Date().toISOString()
    }&pageSize=${pageSize}`;
    return apiClient.get(uri, { withCredentials: true });
  },
  getUserFollowers(id, lastCreatedAt, pageSize = 10) {
    const uri = `/users/${id}/followers?lastCreatedAt=${
      lastCreatedAt || new Date().toISOString()
    }&pageSize=${pageSize}`;
    return apiClient.get(uri, { withCredentials: true });
  },
  getUserFollowings(id, lastCreatedAt, pageSize = 10) {
    const uri = `/users/${id}/followings?lastCreatedAt=${
      lastCreatedAt || new Date().toISOString()
    }&pageSize=${pageSize}`;
    return apiClient.get(uri, { withCredentials: true });
  },
  getBlockedUsers(id, lastCreatedAt, pageSize = 10) {
    const uri = `/users/${id}/blocked?lastCreatedAt=${
      lastCreatedAt || new Date().toISOString()
    }&pageSize=${pageSize}`;
    return apiClient.get(uri, { withCredentials: true });
  },
  updatePassword(id, password, oldPassword) {
    const uri = `/users/${id}/password`;
    const body = {
      password,
      oldPassword,
    };
    return apiClient.patch(uri, body, { withCredentials: true });
  },
  updateUsername(id, username) {
    const uri = `/users/${id}/username`;
    const body = {
      username,
    };
    return apiClient.patch(uri, body, { withCredentials: true });
  },
  updateUser(id, body) {
    const uri = `/users/${id}`;
    return apiClient.patch(uri, body, { withCredentials: true });
  },
  getUserPosts(id, lastCreatedAt, pageSize = 10) {
    const uri = `/users/${id}/posts?lastCreatedAt=${
      lastCreatedAt || new Date().toISOString()
    }&pageSize=${pageSize}`;
    return apiClient.get(uri, { withCredentials: true });
  },
  getUserReplies(id, lastCreatedAt, pageSize = 10) {
    const uri = `/users/${id}/replies?lastCreatedAt=${
      lastCreatedAt || new Date().toISOString()
    }&pageSize=${pageSize}`;
    return apiClient.get(uri, { withCredentials: true });
  },
  updateAvatar(id, file) {
    const formData = new FormData();
    formData.append("file", file);
    const uri = `/users/${id}/avatar`;
    return apiClient.post(uri, formData, {
      withCredentials: true,
      headers: {
        "Content-Type": "multipar/form-data",
      },
    });
  },
  deleteAvatar(id) {
    const uri = `/users/${id}/avatar`;
    return apiClient.delete(uri, { withCredentials: true });
  },
};
