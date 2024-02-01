import apiClient from "./apiClient";

export default {
  getFeed(lastCreatedAt, pageSize = 10) {
    const uri = `post/feed?lastCreatedAt=${
      lastCreatedAt || new Date().toISOString()
    }&pageSize=${pageSize}`;
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
  getPostById(id) {
    const uri = `/post/${id}`;
    return apiClient.get(uri, { withCredentials: true });
  },
  getPostReplies(id, lastCreatedAt, pageSize = 10) {
    const uri = `/post/${id}/replies?lastCreatedAt=${
      lastCreatedAt || new Date().toISOString()
    }&pageSize=${pageSize}`;
    return apiClient.get(uri, { withCredentials: true });
  },
  getNewPostReplies(id, firstCreatedAt) {
    const uri = `/post/${id}/replies/new?firstCreatedAt=${
      firstCreatedAt || new Date(0).toISOString()
    }`;
    return apiClient.get(uri, { withCredentials: true });
  },
  getPostQuotedBy(id, lastCreatedAt, pageSize = 10) {
    const uri = `/post/${id}/quoted?lastCreatedAt=${
      lastCreatedAt || new Date().toISOString()
    }&pageSize=${pageSize}`;
    return apiClient.get(uri, { withCredentials: true });
  },
  getNewPostsOnFeed(firstCreatedAt) {
    const uri = `post/feed/new?firstCreatedAt=${
      firstCreatedAt || new Date(0).toISOString()
    }`;
    return apiClient.get(uri, { withCredentials: true });
  },
};
