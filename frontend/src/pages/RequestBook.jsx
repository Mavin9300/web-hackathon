import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { API_URL } from "../config";
import { BookOpen, Coins, ArrowLeft, Send } from "lucide-react";

const RequestBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [userPoints, setUserPoints] = useState(0);
  const [bargainPoints, setBargainPoints] = useState("");
  const [isBargaining, setIsBargaining] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [warningMessage, setWarningMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const token = (await import("../services/supabaseClient")).supabase.auth
        .getSession()
        .then(({ data }) => data.session?.access_token);
      if (!token) return; // Should be handled by protected route

      // Parallel fetch for book and user profile
      const [bookRes, profileRes] = await Promise.all([
        fetch(`${API_URL}/api/books/${id}`, {
          headers: { Authorization: `Bearer ${await token}` },
        }),
        fetch(`${API_URL}/api/profiles/${user.id}`, {
          headers: { Authorization: `Bearer ${await token}` },
        }),
      ]);

      if (bookRes.ok) setBook(await bookRes.json());
      if (profileRes.ok) {
        const profile = await profileRes.json();
        setUserPoints(profile.points);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to load data");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const offeredPoints = isBargaining
      ? parseInt(bargainPoints)
      : book?.points || 10;

    if (offeredPoints > userPoints) {
      setError(
        `Insufficient points. You have ${userPoints} pts but need ${offeredPoints} pts.`
      );
      return;
    }

    try {
      const token = (await import("../services/supabaseClient")).supabase.auth
        .getSession()
        .then(({ data }) => data.session?.access_token);

      // Check reputation requirement
      const repCheck = await fetch(`${API_URL}/api/profiles/check-reputation?action=request`, {
        headers: {
          Authorization: `Bearer ${await token}`
        }
      });

      if (repCheck.ok) {
        const repData = await repCheck.json();
        if (!repData.canPerformAction) {
          setWarningMessage(`You need ${repData.requiredReputation} reputation points to make requests. You currently have ${repData.currentReputation}. Earn ${repData.deficit} more reputation points to unlock this feature.`);
          return;
        }
      }

      const res = await fetch(`${API_URL}/api/requests/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await token}`,
        },
        body: JSON.stringify({
          book_id: book.id,
          offered_points: offeredPoints,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create request");
      }

      setSuccess("Request sent successfully!");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-[#F5F1E8]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513]"></div>
      </div>
    );
  if (!book) return <div className="text-center py-20">Book not found</div>;

  const bookPoints = book.points || 10; // Default points

  return (
    <div className="min-h-screen bg-[#F5F1E8] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-[#8B4513] hover:underline mb-8"
        >
          <ArrowLeft className="mr-2" size={20} /> Back
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-[#E6DCC3]">
          <div className="bg-[#2C1A11] p-6 text-[#FDFBF7]">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <BookOpen size={32} />
              Request Book
            </h1>
            <p className="mt-2 text-gray-300">
              Complete your request for{" "}
              <span className="font-semibold text-white">"{book.title}"</span>
            </p>
          </div>

          <div className="p-8">
            {/* Book & User Info Grid */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <img
                  src={book.book_images?.[0]?.image_url || book.image_url}
                  alt={book.title}
                  className="w-full h-64 object-cover rounded-lg shadow-md"
                />
                <div className="flex justify-between items-center text-[#2C1A11]">
                  <span className="font-semibold">Listed Points:</span>
                  <span className="text-xl font-bold">{bookPoints} pts</span>
                </div>
              </div>

              <div className="bg-[#F9F7F2] p-6 rounded-xl border border-[#E6DCC3] h-fit">
                <h3 className="text-lg font-bold text-[#2C1A11] mb-4 flex items-center gap-2">
                  <Coins size={20} /> Your Wallet
                </h3>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-[#8B4513]">
                    {userPoints} pts
                  </div>
                  <p className="text-sm text-gray-600">Available Balance</p>
                </div>

                {userPoints === 0 && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                    Your balance is zero. You cannot request books without
                    points.
                  </div>
                )}
              </div>
            </div>

            {/* Request Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {warningMessage && (
                <div className="bg-amber-50 border border-amber-300 text-amber-800 p-4 rounded-lg flex items-start gap-3">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{warningMessage}</span>
                </div>
              )}
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 text-green-600 p-4 rounded-lg">
                  {success}
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    id="bargain"
                    checked={isBargaining}
                    onChange={(e) => setIsBargaining(e.target.checked)}
                    className="w-5 h-5 text-[#8B4513] border-gray-300 rounded focus:ring-[#8B4513]"
                  />
                  <label
                    htmlFor="bargain"
                    className="text-[#2C1A11] font-medium cursor-pointer select-none"
                  >
                    Make a Bargain Offer (Request lower points)
                  </label>
                </div>

                {isBargaining && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Offer (Points)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={bookPoints}
                      value={bargainPoints}
                      onChange={(e) => setBargainPoints(e.target.value)}
                      placeholder={`Max ${bookPoints}`}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B4513] focus:border-transparent outline-none"
                      required={isBargaining}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      The owner will review your offer before accepting.
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={userPoints === 0 || loading || success}
                className={`w-full py-4 text-lg font-bold rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] shadow-lg
                                    ${
                                      userPoints === 0 || success
                                        ? "bg-gray-400 cursor-not-allowed text-gray-100"
                                        : "bg-[#8B4513] text-[#FDFBF7] hover:bg-[#2C1A11]"
                                    }`}
              >
                <Send size={24} />
                {loading ? "Processing..." : "Send Request"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestBook;
