import React, { useState } from "react";
import { Post } from "../types";
import Like from "./Like";
import Comment from "./Comment";
import { postService } from "../services/postService";

interface PostCardProps {
  post: Post;
  formatPostDate: (dateString: string) => string;
  currentUserId?: string;
  onToggleLike: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void | Promise<void>;
  onAddReply?: (commentId: string, text: string) => void | Promise<void>;
  liking?: boolean;
  onEdited?: () => void | Promise<void>;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  formatPostDate,
  currentUserId,
  onToggleLike,
  onAddComment,
  onAddReply,
  liking = false,
  onEdited,
}) => {
  const isLikedByUser = currentUserId ? post.likes.includes(currentUserId) : false;
  const isOwner = currentUserId ? post.userId === currentUserId : false;

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(post.content);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const handleStartEdit = () => {
    setEditError(null);
    setEditValue(post.content);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditError(null);
    setEditValue(post.content);
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    const trimmed = editValue.trim();
    if (!trimmed) {
      setEditError("Post content cannot be empty.");
      return;
    }

    setEditError(null);
    setEditSaving(true);

    try {
      const res = await postService.updatePost(post._id, { content: trimmed });

      if (!res.success) {
        setEditError(res.message || "Failed to update post.");
        return;
      }

      setIsEditing(false);

      if (onEdited) {
        await onEdited();
      }
    } catch (err: any) {
      setEditError(err.message || "Failed to update post.");
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-sm font-semibold text-gray-800">
            {post.user?.firstName
              ? `${post.user.firstName} ${post.user.lastName || ""}`.trim()
              : post.userId}
          </p>
          <p className="text-xs text-gray-500">
            {formatPostDate(post.createdAt)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
            {post.type}
          </span>

          {isOwner && !isEditing && (
            <button
              type="button"
              onClick={handleStartEdit}
              className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-100"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      <div className="mt-2">
        {!isEditing && <p className="text-sm text-gray-800">{post.content}</p>}

        {isEditing && (
          <div className="space-y-2">
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {editError && <p className="text-sm text-red-600">{editError}</p>}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={editSaving}
                className="px-3 py-1 rounded border border-gray-300 text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={editSaving}
                className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 text-xs text-gray-600">
        <Like
          isLiked={isLikedByUser}
          count={post.likes.length}
          disabled={liking}
          onToggle={() => onToggleLike(post._id)}
        />

        <Comment
          comments={post.comments}
          onAdd={(text) => onAddComment(post._id, text)}
          onReply={onAddReply}
        />
      </div>
    </div>
  );
};

export default PostCard;
