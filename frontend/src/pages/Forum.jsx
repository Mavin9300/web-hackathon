import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { API_URL } from "../config";
import { useAuth } from "../context/AuthProvider";
import { contentModerator } from "../services/contentModerator";

const Forum = () => {
  const { bookId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [forum, setForum] = useState(null);
  const [posts, setPosts] = useState([]);
  const [bookDetails, setBookDetails] = useState(null);
  const [newPost, setNewPost] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  // Fetch book details
  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) return;

        const res = await fetch(`${API_URL}/api/books/${bookId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setBookDetails(data);
        }
      } catch (error) {
        console.error("Error fetching book details:", error);
      }
    };

    fetchBookDetails();
  }, [bookId]);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) return;

        const res = await fetch(`${API_URL}/api/profiles`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUserProfile(data);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  // Fetch forum and posts
  useEffect(() => {
    const fetchForumAndPosts = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) return;

        // Get forum for this book
        const forumRes = await fetch(`${API_URL}/api/forums/${bookId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (forumRes.ok) {
          const forumData = await forumRes.json();
          setForum(forumData);

          // Get posts for this forum
          const postsRes = await fetch(
            `${API_URL}/api/forum-posts/${forumData.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (postsRes.ok) {
            const postsData = await postsRes.json();
            setPosts(postsData);
          }
        }
      } catch (error) {
        console.error("Error fetching forum data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchForumAndPosts();
  }, [bookId]);

  const handleSubmitPost = async (e) => {
    e.preventDefault();

    if (!newPost.trim()) {
      console.log("Post is empty, not submitting");
      return;
    }

    console.log("Submitting post...", { forum, user, isAnonymous });
    setSubmitting(true);

    try {
      // Check reputation requirement first
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        console.error("No auth token found");
        setSubmitting(false);
        return;
      }

      const repCheck = await fetch(`${API_URL}/api/profiles/check-reputation?action=forum`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (repCheck.ok) {
        const repData = await repCheck.json();
        if (!repData.canPerformAction) {
          setWarningMessage(
            `You need ${repData.requiredReputation} reputation points to post in forums. You currently have ${repData.currentReputation}. Earn ${repData.deficit} more reputation points to unlock this feature.`
          );
          setShowWarning(true);
          setSubmitting(false);
          return;
        }
      }

      // Step 1: Check content with Gemini AI
      console.log("Checking content for abusive language...");
      const moderationResult = await contentModerator.checkContent(newPost, user.id);

      console.log("Moderation result:", moderationResult);

      if (moderationResult.isFlagged) {
        console.log("Content flagged as abusive");

        // Deduct reputation points
        console.log("Deducting reputation for user:", user.id);
        if (token) {
          const reputationRes = await fetch(`${API_URL}/api/profiles/${user.id}/deduct-reputation`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              amount: 5,
              reason: "Abusive content in forum post",
            }),
          });

          if (reputationRes.ok) {
            const result = await reputationRes.json();
            console.log("Reputation deducted successfully:", result);
          } else {
            const error = await reputationRes.json();
            console.error("Failed to deduct reputation:", error);
          }
        }

        // Show warning popup
        setWarningMessage(
          "⚠️ Your message contains inappropriate content and has been blocked. Your reputation has been reduced by 5 points."
        );
        setShowWarning(true);
        setSubmitting(false);
        setNewPost("");
        return;
      }

      // Step 2: If content is clean, proceed with posting
      if (!forum) {
        console.error("No forum found");
        return;
      }

      console.log("Sending request to:", `${API_URL}/api/forum-posts`);

      const res = await fetch(`${API_URL}/api/forum-posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          forum_id: forum.id,
          user_id: user.id,
          content: newPost,
          is_anonymous: isAnonymous,
          ai_flagged: false,
        }),
      });

      console.log("Response status:", res.status);

      if (res.ok) {
        const newPostData = await res.json();
        console.log("New post created:", newPostData);
        
        // Add profile data to the new post if not anonymous
        const postWithProfile = {
          ...newPostData,
          profile: isAnonymous ? null : {
            username: userProfile?.username,
            image_url: userProfile?.image_url
          }
        };
        
        setPosts([postWithProfile, ...posts]);
        setNewPost("");
      } else {
        const errorData = await res.json();
        console.error("Error response:", errorData);
      }
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a0f0a] flex items-center justify-center">
        <div className="text-[#D2B48C] text-xl">Loading forum...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a0f0a]">
      {/* Warning Popup Modal */}
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#2C1A11] border-2 border-red-500 rounded-xl p-8 max-w-md mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-red-400">Content Blocked</h3>
            </div>
            <p className="text-[#D2B48C]/80 mb-6">{warningMessage}</p>
            <button
              onClick={() => {
                setShowWarning(false);
                setNewPost("");
              }}
              className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all"
            >
              I Understand
            </button>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="border-b border-[#8B4513]/30 bg-[#2C1A11]/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-[#D2B48C] hover:text-[#C19A6B] mb-4 flex items-center gap-2 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Dashboard
          </button>

          {bookDetails && (
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#D2B48C] to-[#C19A6B] bg-clip-text text-transparent">
                {bookDetails.title}
              </h1>
              <p className="text-[#D2B48C]/70">by {bookDetails.author}</p>
              <p className="text-[#D2B48C]/50 text-sm">
                Community Discussion & Reviews
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Anonymous Toggle */}
      <div className="sticky top-0 z-10 bg-[#2C1A11]/95 backdrop-blur-md border-b border-[#8B4513]/30">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#3E2723] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#D2B48C]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D2B48C]"></div>
            </label>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-[#FDFBF7]">
                Post Anonymously
              </span>
              <span className="text-xs text-[#D2B48C]/50">
                {isAnonymous
                  ? "Your identity will be hidden"
                  : "Your profile will be visible"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* New Post Form */}
        <div className="bg-[#2C1A11]/50 border border-[#8B4513]/30 rounded-xl p-6 shadow-md hover:shadow-[#D2B48C]/5 transition-shadow">
          <form onSubmit={handleSubmitPost} className="space-y-4">
            <div className="flex gap-4">
              {!isAnonymous && userProfile?.image_url && (
                <img
                  src={userProfile.image_url}
                  alt={userProfile.username}
                  className="w-10 h-10 rounded-full object-cover border border-[#8B4513]/30"
                />
              )}
              {!isAnonymous && !userProfile?.image_url && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B4513] to-[#A0522D] flex items-center justify-center text-[#FDFBF7] font-semibold border border-[#D2B48C]/30">
                  {userProfile?.username?.[0]?.toUpperCase() || "U"}
                </div>
              )}
              {isAnonymous && (
                <div className="w-10 h-10 rounded-full bg-[#3E2723] flex items-center justify-center text-[#D2B48C]/50 border border-[#8B4513]/30">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              )}

              <div className="flex-1">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder={
                    isAnonymous
                      ? "Share your thoughts anonymously..."
                      : "Share your thoughts about this book..."
                  }
                  className="w-full bg-[#3E2723]/50 border border-[#8B4513]/50 rounded-lg px-4 py-3 text-[#FDFBF7] placeholder-[#D2B48C]/50 focus:outline-none focus:ring-2 focus:ring-[#D2B48C] focus:border-transparent resize-none transition-all"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || !newPost.trim()}
                className="px-6 py-2 bg-gradient-to-r from-[#D2B48C] to-[#C19A6B] hover:from-[#C19A6B] hover:to-[#D2B48C] text-[#2C1A11] rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-[#D2B48C]/20"
              >
                {submitting ? "Posting..." : "Post"}
              </button>
            </div>
          </form>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-[#FDFBF7]">
            Discussion ({posts.length})
          </h2>

          {posts.length === 0 ? (
            <div className="bg-[#2C1A11]/50 border border-[#8B4513]/30 rounded-xl p-12 text-center text-[#D2B48C]">
              <p className="text-[#D2B48C]/70">
                No posts yet. Be the first to share your thoughts!
              </p>
            </div>
          ) : (
            posts.map((post) => {
              // Check if this post is from the current user and apply the toggle state
              const isMyPost = post.user_id === user?.id;
              const shouldShowAnonymous = isMyPost ? isAnonymous : post.is_anonymous;
              const displayProfile = shouldShowAnonymous ? null : post.profile;
              
              return (
              <div
                key={post.id}
                className="bg-[#2C1A11]/50 border border-[#8B4513]/30 rounded-xl p-6 hover:border-[#D2B48C]/30 transition-all shadow-md hover:shadow-[#D2B48C]/5"
              >
                <div className="flex gap-4">
                  {/* Avatar */}
                  {!shouldShowAnonymous && displayProfile?.image_url ? (
                    <img
                      src={displayProfile.image_url}
                      alt={displayProfile.username}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-[#8B4513]/30"
                    />
                  ) : !shouldShowAnonymous && displayProfile?.username ? (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B4513] to-[#A0522D] flex items-center justify-center text-[#FDFBF7] font-semibold flex-shrink-0 border border-[#D2B48C]/30">
                      {displayProfile.username[0].toUpperCase()}
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#3E2723] flex items-center justify-center text-[#D2B48C]/50 flex-shrink-0 border border-[#8B4513]/30">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-[#FDFBF7]">
                        {shouldShowAnonymous
                          ? "Anonymous"
                          : displayProfile?.username || "Unknown User"}
                      </span>
                      <span className="text-[#D2B48C]/50 text-sm">
                        {formatDate(post.created_at)}
                      </span>
                      {post.ai_flagged && (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                          Flagged
                        </span>
                      )}
                    </div>

                    <p className="text-[#D2B48C] whitespace-pre-wrap leading-relaxed">
                      {post.content}
                    </p>
                  </div>
                </div>
              </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Forum;
