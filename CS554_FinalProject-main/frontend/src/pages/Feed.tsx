import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { Post, Pagination } from "../types";
import { postService } from "../services/postService";
import PostCard from "../components/Post";

const formatPostDate = (dateString: string): string => {
  const date = new Date(dateString);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  const minutesStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${month} ${day}, ${year} • ${hours}:${minutesStr} ${ampm}`;
};

const Feed: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [page, setPage] = useState<number>(1);

  const [newPostType, setNewPostType] = useState<"workout" | "meal" | "progress">("workout");
  const [newPostContent, setNewPostContent] = useState("");
  const [composerLoading, setComposerLoading] = useState(false);
  const [composerError, setComposerError] = useState<string | null>(null);
  const [likingPostId, setLikingPostId] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    if (!user) return;
    setFeedLoading(true);
    setFeedError(null);
    try {
      const typeParam = filterType === "all" ? undefined : filterType;
      const res = await postService.getPosts(undefined, typeParam, page, 10);
      if (res.success && res.data) {
        setPosts(res.data.posts);
        setPagination(res.data.pagination);
      } else {
        setFeedError(res.message || "Failed to load feed");
      }
    } catch (err: any) {
      setFeedError(err.message || "Failed to load feed");
    } finally {
      setFeedLoading(false);
    }
  }, [user, filterType, page]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleFilterChange = (type: string) => {
    setFilterType(type);
    setPage(1);
  };

  const handleCreatePost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const trimmed = newPostContent.trim();
    if (!trimmed) {
      setComposerError("Please enter some content for your post.");
      return;
    }

    setComposerError(null);
    setComposerLoading(true);

    try {
      const res = await postService.createPost({
        type: newPostType,
        content: trimmed,
      });

      if (!res.success) {
        setComposerError(res.message || "Failed to create post.");
        return;
      }

      setNewPostContent("");
      setNewPostType("workout");
      await loadPosts();
    } catch (err: any) {
      setComposerError(err.message || "Failed to create post.");
    } finally {
      setComposerLoading(false);
    }
  };

  const handleToggleLike = async (postId: string) => {
    if (!user) return;

    setLikingPostId(postId);
    setFeedError(null);

    try {
      const res = await postService.likePost(postId);

      if (!res.success) {
        setFeedError(res.message || "Failed to update like.");
        return;
      }
      const currentUserId = user.id;
      const liked = !!res.data?.liked;
      const likesCount = res.data?.likesCount;

      setPosts((prev) =>
        prev.map((p) => {
          if (p._id !== postId) return p;

          const hasUser = Boolean(currentUserId);
          const alreadyLiked = hasUser ? p.likes.includes(currentUserId) : false;

          let nextLikes = p.likes;
          if (hasUser) {
            if (liked && !alreadyLiked) nextLikes = [...p.likes, currentUserId];
            if (!liked && alreadyLiked) nextLikes = p.likes.filter((id) => id !== currentUserId);
          }
          if (typeof likesCount === "number" && likesCount >= 0 && nextLikes.length !== likesCount) {
            if (hasUser) {
              const withoutUser = nextLikes.filter((id) => id !== currentUserId);
              nextLikes = liked ? [...withoutUser, currentUserId] : withoutUser;
            }
          }

          return { ...p, likes: nextLikes };
        })
      );
    } catch (err: any) {
      setFeedError(err.message || "Failed to update like.");
    } finally {
      setLikingPostId(null);
    }
  };

  const handleAddComment = async (postId: string, text: string) => {
    if (!user) return;
    setFeedError(null);

    const res = await postService.addComment(postId, text);
    if (!res.success) throw new Error(res.message || "Failed to add comment.");
    const newComment: any = res.data;
    const enrichedComment = {
      ...newComment,
      userId: newComment?.userId || user.id,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      replies: newComment?.replies || [],
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p._id !== postId) return p;
        return { ...p, comments: [...(p.comments || []), enrichedComment] };
      })
    );
    loadPosts().catch(() => {});
  };

  const handleAddReply = async (commentId: string, text: string) => {
    if (!user) return;
    setFeedError(null);

    const res = await postService.addReply(commentId, text);
    if (!res.success) throw new Error(res.message || "Failed to add reply.");

    const newReply: any = res.data;
    const enrichedReply = {
      ...newReply,
      userId: newReply?.userId || user.id,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };

    setPosts((prev) =>
      prev.map((p) => {
        const nextComments = (p.comments || []).map((c: any) => {
          if (String(c._id) !== String(commentId)) return c;
          const existingReplies = (c.replies || []) as any[];
          return { ...c, replies: [...existingReplies, enrichedReply] };
        });
        return { ...p, comments: nextComments };
      })
    );

    loadPosts().catch(() => {});
  };

  return (
    <>
      <Navbar isAuthenticated={true} onLogout={handleLogout} />

      <div className="p-5 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Feed</h1>
            <p className="text-gray-600 mt-1">Share updates and view recent activity.</p>
          </div>
        </div>

        <div className="mb-10 p-5 bg-white border border-gray-300 rounded-lg">
          <h2 className="text-2xl font-semibold mb-3">Create a New Post</h2>

          <form onSubmit={handleCreatePost} className="space-y-3">
            <div className="flex flex-wrap gap-2 text-sm">
              <button
                type="button"
                onClick={() => setNewPostType("workout")}
                className={`px-3 py-1 rounded-full border ${
                  newPostType === "workout"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
                }`}
              >
                Workout
              </button>
              <button
                type="button"
                onClick={() => setNewPostType("meal")}
                className={`px-3 py-1 rounded-full border ${
                  newPostType === "meal"
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-purple-50"
                }`}
              >
                Meal
              </button>
              <button
                type="button"
                onClick={() => setNewPostType("progress")}
                className={`px-3 py-1 rounded-full border ${
                  newPostType === "progress"
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-green-50"
                }`}
              >
                Progress
              </button>
            </div>

            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              rows={3}
              placeholder="Share your workout, meal, or progress update..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {composerError && <p className="text-sm text-red-600">{composerError}</p>}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={composerLoading}
                className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
              >
                {composerLoading ? "Posting..." : "Post"}
              </button>
            </div>
          </form>
        </div>

        <div className="p-5 bg-white border border-gray-300 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-2xl font-semibold">
              {filterType === "all"
                ? "Your Activity Feed"
                : `Recent ${filterType.charAt(0).toUpperCase() + filterType.slice(1)} Posts`}
            </h2>
            <div className="flex flex-wrap gap-2 text-sm">
              <button
                type="button"
                onClick={() => handleFilterChange("all")}
                className={`px-3 py-1 rounded-full border ${
                  filterType === "all"
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange("workout")}
                className={`px-3 py-1 rounded-full border ${
                  filterType === "workout"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
                }`}
              >
                Workouts
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange("meal")}
                className={`px-3 py-1 rounded-full border ${
                  filterType === "meal"
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-purple-50"
                }`}
              >
                Meals
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange("progress")}
                className={`px-3 py-1 rounded-full border ${
                  filterType === "progress"
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-green-50"
                }`}
              >
                Progress
              </button>
            </div>
          </div>

          {feedLoading && <p className="text-gray-600 text-sm">Refreshing feed...</p>}
          {feedError && <p className="text-red-600 text-sm mb-2">{feedError}</p>}

          {!feedLoading && !feedError && posts.length === 0 && (
            <p className="text-gray-600 text-sm">No posts yet. Start by logging a workout or meal!</p>
          )}

          {!feedError && posts.length > 0 && (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  formatPostDate={formatPostDate}
                  currentUserId={user?.id}
                  onToggleLike={handleToggleLike}
                  onAddComment={handleAddComment}
                  onAddReply={handleAddReply}
                  liking={likingPostId === post._id}
                  onEdited={loadPosts}
                />
              ))}
            </div>
          )}

          {pagination && pagination.totalPages > 1 && posts.length > 0 && (
            <div className="flex justify-end items-center gap-3 mt-4 text-sm">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Previous
              </button>
              <span className="text-gray-600">
                Page {page} of {pagination.totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={pagination.hasMore === false || page >= pagination.totalPages}
                className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Feed;

