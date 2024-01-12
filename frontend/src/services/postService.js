import apiClient from "./apiClient";

export default {
  getFeed(page = 1, pageSize = 10) {
    const uri = `post/feed?page=${page}&pageSize=${pageSize}`;
    return apiClient.get(uri, { withCredentials: true });
  },
  createPost(post) {
    return apiClient.post("/post", post, { withCredentials: true });
  },
  updatePost(post, id) {
    const uri = `/post/${id}`;
    return apiClient.patch(uri, post, { withCredentials: true });
  },
  deletePost(id) {
    const uri = `/post/${id}`;
    return apiClient.delete(uri, { withCredentials: true });
  },
  createQuote(content, quotedPostId) {
    const body = {
      content,
      quotedPostId,
    };
    return apiClient.post("/post/quote", body, { withCredentials: true });
  },
  createReply(content, parentId) {
    const body = {
      content,
      parentId,
    };
    return apiClient.post("/post/reply", body, { withCredentials: true });
  },
};
