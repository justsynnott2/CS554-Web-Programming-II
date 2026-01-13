import React, { useState } from "react";
import { Comment as Comments } from "../types";

interface CommentProps {
  comments: Comments[];
  onAdd: (text: string) => void | Promise<void>;
  onReply?: (commentId: string, text: string) => void | Promise<void>;
  hideComposer?: boolean;
}

const Comment: React.FC<CommentProps> = ({
  comments,
  onAdd,
  onReply,
  hideComposer = false,
}) => {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = text.trim();
    if (!trimmed) {
      setError("Comment cannot be empty.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await onAdd(trimmed);
      setText("");
    } catch (err: any) {
      setError(err.message || "Failed to add comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent, commentId: string) => {
    e.preventDefault();

    const trimmed = replyText.trim();
    if (!trimmed) {
      setReplyError("Reply cannot be empty.");
      return;
    }

    if (!onReply) {
      setReplyError("Replies are not available.");
      return;
    }

    setReplyError(null);
    setReplySubmitting(true);

    try {
      await onReply(commentId, trimmed);
      setReplyText("");
      setReplyingTo(null);
    } catch (err: any) {
      setReplyError(err.message || "Failed to add reply.");
    } finally {
      setReplySubmitting(false);
    }
  };

  return (
    <div className="mt-3 border-t pt-3">
      <div className="space-y-2 mb-3">
        {comments.slice(0, 3).map((c) => (
          <div key={c._id} className="text-xs text-gray-700">
            <div className="flex items-center justify-between">
              <span className="font-semibold">
                {c.user?.firstName
                  ? `${c.user.firstName} ${c.user.lastName || ""}`.trim()
                  : c.userId}
              </span>

              {onReply && (
                <button
                  type="button"
                  onClick={() => {
                    setReplyError(null);
                    if (replyingTo === c._id) {
                      setReplyingTo(null);
                      setReplyText("");
                    } else {
                      setReplyingTo(c._id);
                      setReplyText("");
                    }
                  }}
                  className="text-[11px] text-blue-600 hover:underline"
                >
                  {replyingTo === c._id ? "Cancel" : "Reply"}
                </button>
              )}
            </div>
            <div className="mt-1">
              <p className="text-xs text-gray-800 whitespace-pre-wrap">{c.text}</p>
            </div>

            {replyingTo === c._id && onReply && (
              <form
                onSubmit={(e) => handleReplySubmit(e, c._id)}
                className="flex items-center gap-2 mt-2"
              >
                <input
                  type="text"
                  value={replyText}
                  placeholder="Write a reply..."
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                  type="submit"
                  disabled={replySubmitting}
                  className="text-xs px-3 py-1 rounded bg-gray-800 text-white hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {replySubmitting ? "Posting..." : "Reply"}
                </button>
              </form>
            )}

            {replyingTo === c._id && replyError && (
              <p className="text-red-600 text-xs mt-1">{replyError}</p>
            )}

            {(c as any).replies?.length > 0 && (
              <div className="ml-4 mt-2">
                <Comment
                  comments={(c as any).replies || []}
                  onAdd={() => {}}
                  hideComposer
                />
              </div>
            )}
          </div>
        ))}

        {comments.length > 3 && (
          <p className="text-xs text-blue-600 cursor-pointer hover:underline">
            View all {comments.length} comments
          </p>
        )}
      </div>

      {!hideComposer && (
        <>
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={text}
              placeholder="Add a comment..."
              onChange={(e) => setText(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="submit"
              disabled={submitting}
              className="text-xs px-3 py-1 rounded bg-gray-800 text-white hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Posting..." : "Post"}
            </button>
          </form>

          {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
        </>
      )}
    </div>
  );
};

export default Comment;
