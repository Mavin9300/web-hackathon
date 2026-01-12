import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { API_URL } from "../config";
import AddBookModal from "../components/AddBookModal";
import EditBookModal from "../components/EditBookModal";
import BookDetailsModal from "../components/BookDetailsModal";
import ConvertPointsToReputation from "../components/ConvertPointsToReputation";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import {
  Plus,
  Edit2,
  MessageSquare,
  MessageCircle,
  Search,
  Filter,
  MapPin,
  History,
  Heart,
  Send,
  Book,
  ArrowRightLeft,
  Star,
  TrendingUp,
} from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_books: 0,
    exchanges: 0,
    points: 0,
    reputation: 100,
  });

  const [userName, setUserName] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const mapContainer = useRef(null);
  const map = useRef(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isReputationModalOpen, setIsReputationModalOpen] = useState(false);
  const [reputationWarning, setReputationWarning] = useState("");

  const [selectedBook, setSelectedBook] = useState(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMyBooks, setFilterMyBooks] = useState(false);
  const [filterNearby, setFilterNearby] = useState(false);
  const [nearbyRange, setNearbyRange] = useState(20);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [requestedBookIds, setRequestedBookIds] = useState(new Set());

  useEffect(() => {
    if (user) {
      fetchWishlist();
      fetchRequestedBooks();
    }
  }, [user]);

  // Initialize map when nearby filter is enabled and books are loaded
  useEffect(() => {
    if (filterNearby && showMap && mapContainer.current && !map.current && books.length > 0) {
      // Get user's location from profile or use default
      const initMap = async () => {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          const token = session?.access_token;

          let userLat = 31.5204; // Default Lahore
          let userLng = 74.3587;

          if (token && user) {
            const res = await fetch(`${API_URL}/api/profiles/${user.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              const profile = await res.json();
              if (profile.latitude && profile.longitude) {
                userLat = profile.latitude;
                userLng = profile.longitude;
              }
            }
          }

          map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: {
              version: 8,
              sources: {
                osm: {
                  type: "raster",
                  tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
                  tileSize: 256,
                  attribution: '&copy; OpenStreetMap Contributors',
                },
              },
              layers: [
                {
                  id: "osm",
                  type: "raster",
                  source: "osm",
                },
              ],
            },
            center: [userLng, userLat],
            zoom: 10,
            maxZoom: 19,
            minZoom: 2,
          });

          // Add user location marker
          new maplibregl.Marker({ color: '#3b82f6' })
            .setLngLat([userLng, userLat])
            .setPopup(new maplibregl.Popup().setHTML('<strong>Your Location</strong>'))
            .addTo(map.current);

          // Add markers for books within range
          books.forEach((book) => {
            if (book.latitude && book.longitude) {
              const el = document.createElement('div');
              el.className = 'custom-marker';
              el.style.backgroundImage = 'url(https://cdn-icons-png.flaticon.com/512/2702/2702134.png)';
              el.style.width = '30px';
              el.style.height = '30px';
              el.style.backgroundSize = 'cover';
              el.style.cursor = 'pointer';

              const popup = new maplibregl.Popup({ offset: 25 }).setHTML(
                `<div class="p-2">
                  <h3 class="font-bold text-sm">${book.title}</h3>
                  <p class="text-xs text-gray-600">${book.author}</p>
                  ${book.dist_km !== undefined ? `<p class="text-xs text-blue-600 mt-1">${Number(book.dist_km).toFixed(1)} km away</p>` : ''}
                </div>`
              );

              new maplibregl.Marker(el)
                .setLngLat([book.longitude, book.latitude])
                .setPopup(popup)
                .addTo(map.current);
            }
          });

          // Fit bounds to show all markers
          if (books.length > 0) {
            const bounds = new maplibregl.LngLatBounds();
            bounds.extend([userLng, userLat]);
            books.forEach((book) => {
              if (book.latitude && book.longitude) {
                bounds.extend([book.longitude, book.latitude]);
              }
            });
            map.current.fitBounds(bounds, { padding: 50 });
          }
        } catch (error) {
          console.error('Error initializing map:', error);
        }
      };

      initMap();
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [filterNearby, showMap, books, user]);

  // ... (rest of functions)

  // Header JSX Update
  // Since replace_file_content needs contiguous block, I will target the Header block separately if needed, 
  // but here I am replacing the top state block. 
  // Wait, I can't replace the Header JSX in the *same* call if it's not contiguous with state.
  // I will just do state here. The Header update needs another call. 
  // Actually, I can allow multiple changes via `multi_replace_file_content` but I started with `replace_file_content`.
  // I will just add state here. 
  // WAIT, the previous content I am replacing includes `useEffect`. 
  // Let me look at lines 40-60 in original file.
  // Lines 40-53 are state. Lines 55-60 are useEffect.
  // I will include lines 40-53 to insert `userName` state.


  useEffect(() => {
    if (user) {
      fetchWishlist();
      fetchRequestedBooks();
    }
  }, [user]);

  const fetchRequestedBooks = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const res = await fetch(`${API_URL}/api/requests?type=outgoing`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // Filter for pending requests and create set of book IDs
        const pendingIds = new Set(
          data
            .filter((req) => req.status === "pending")
            .map((req) => req.book_id)
        );
        setRequestedBookIds(pendingIds);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const fetchWishlist = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const res = await fetch(`${API_URL}/api/wishlists/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setWishlistIds(new Set(data.map((item) => item.book_id)));
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  const toggleWishlist = async (e, book) => {
    e.stopPropagation();
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const isInWishlist = wishlistIds.has(book.id);
      const method = isInWishlist ? "DELETE" : "POST";
      const url = isInWishlist
        ? `${API_URL}/api/wishlists/${user.id}/${book.id}`
        : `${API_URL}/api/wishlists`;

      const body = isInWishlist
        ? undefined
        : JSON.stringify({ user_id: user.id, book_id: book.id });

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body,
      });

      if (res.ok) {
        setWishlistIds((prev) => {
          const next = new Set(prev);
          if (isInWishlist) next.delete(book.id);
          else next.add(book.id);
          return next;
        });
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const res = await fetch(`${API_URL}/api/profiles/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setStats({
          total_books: data.total_books || 0,
          exchanges: data.exchanges || 0,
          points: data.points || 0,
          reputation: data.reputation || 100,
        });
      }

      // Fetch Profile for Name
      const profileRes = await fetch(`${API_URL}/api/profiles/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        // Update user display name if available
        if (profileData && profileData.username) {
          setUserName(profileData.username);
          setProfileImage(profileData.image_url || null);
        }
      }
    } catch (error) {
      console.error("Error fetching stats/profile:", error);
    }
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) return;

      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (filterMyBooks) params.append("my_books", "true");
      if (filterNearby) {
        params.append("nearby", "true");
        params.append("radius", nearbyRange);
      }

      const res = await fetch(`${API_URL}/api/books?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setBooks(data);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchBooks();
  }, [filterMyBooks, filterNearby, nearbyRange]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBooks();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleBookAdded = () => {
    fetchBooks();
    fetchStats();
  };

  const handleBookUpdated = (updatedBook) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === updatedBook.id ? updatedBook : b))
    );
  };

  const handleBookDeleted = (deletedBookId) => {
    setBooks((prev) => prev.filter((b) => b.id !== deletedBookId));
    fetchStats();
  };

  const openEditModal = (e, book) => {
    e.stopPropagation();
    setSelectedBook(book);
    setIsEditModalOpen(true);
  };

  const openDetailsModal = (book) => {
    setSelectedBook(book);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="space-y-8 text-[#FDFBF7]">
      {/* Header Section */}
      <div className="bg-[#2C1A11] bg-opacity-90 rounded-2xl p-8 border border-[#8B4513]/30 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-4 mb-2 max-w-full">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-12 h-12 rounded-full flex-shrink-0 object-cover border-2 border-[#D2B48C]"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#8B4513] flex-shrink-0 flex items-center justify-center text-[#FDFBF7] text-xl font-bold border-2 border-[#D2B48C]">
                  {(userName || user?.user_metadata?.username || "U").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[#D2B48C] text-sm font-medium tracking-wide uppercase">
                  Hello,
                </p>
                <h1 className="text-xl md:text-3xl font-bold text-white break-all md:break-words">
                  {userName || user?.user_metadata?.username || "Reader"}
                </h1>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-emerald-400 text-sm font-medium">
              Active Member
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <div className="bg-[#3E2723] p-6 rounded-xl border border-[#8B4513]/50 shadow-lg hover:shadow-[#D2B48C]/10 transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <Book className="text-[#D2B48C]" size={24} />
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">
              {stats.total_books}
            </h3>
            <p className="text-[#D2B48C]/80 text-sm">Total Books</p>
          </div>

          <div className="bg-[#3E2723] p-6 rounded-xl border border-[#8B4513]/50 shadow-lg hover:shadow-[#D2B48C]/10 transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <ArrowRightLeft className="text-[#D2B48C]" size={24} />
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">
              {stats.exchanges}
            </h3>
            <p className="text-[#D2B48C]/80 text-sm">Exchanges</p>
          </div>

          <div className="bg-[#3E2723] p-6 rounded-xl border border-[#8B4513]/50 shadow-lg hover:shadow-[#D2B48C]/10 transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <Star className="text-[#D2B48C]" size={24} />
              <button
                onClick={() => navigate("/buy-points")}
                className="text-[#2C1A11] text-xs font-bold bg-linear-to-r from-[#D2B48C] to-[#C19A6B] hover:brightness-110 px-3 py-1.5 rounded-lg transition-all shadow-md active:scale-95 flex items-center gap-1"
              >
                Buy Points
              </button>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">
              {stats.points}
            </h3>
            <p className="text-[#D2B48C]/80 text-sm">My Points</p>
          </div>

          <div className="bg-[#3E2723] p-6 rounded-xl border border-[#8B4513]/50 shadow-lg hover:shadow-[#D2B48C]/10 transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <TrendingUp className="text-[#D2B48C]" size={24} />
              <button
                onClick={() => setIsReputationModalOpen(true)}
                className="text-[#2C1A11] text-xs font-bold bg-linear-to-r from-[#D2B48C] to-[#C19A6B] hover:brightness-110 px-3 py-1.5 rounded-lg transition-all shadow-md active:scale-95 flex items-center gap-1"
              >
                Get Reputation
              </button>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">
              {stats.reputation}
            </h3>
            <div className="w-full bg-[#2C1A11] rounded-full h-1.5 mt-2">
              <div
                className="bg-[#D2B48C] h-1.5 rounded-full"
                style={{ width: `${Math.min(stats.reputation, 100)}%` }}
              ></div>
            </div>
            <p className="text-[#D2B48C]/80 text-sm mt-1">Reputation</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#FDFBF7] border-b-2 border-[#D2B48C] pb-2 inline-block">
              {filterMyBooks ? "My Library" : "Explore Books"}
            </h2>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#D2B48C] hover:bg-[#C19A6B] text-[#2C1A11] px-6 py-2 rounded-lg flex items-center space-x-2 transition-all transform hover:scale-105 font-bold shadow-lg"
          >
            <Plus size={18} />
            <span>Add Book</span>
          </button>
        </header>

        {/* Search and Filters Bar */}
        <div className="bg-[#2C1A11] border border-[#8B4513]/30 rounded-xl p-4 space-y-4 shadow-lg">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#D2B48C]"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by title or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#3E2723] border border-[#8B4513]/50 rounded-lg pl-10 pr-4 py-2 text-[#FDFBF7] placeholder-[#D2B48C]/50 focus:outline-none focus:border-[#D2B48C] transition-colors"
              />
            </div>

            {/* Filter Toggles */}
            <div className="flex items-center gap-4 flex-wrap">
              {/* My Books Toggle */}
              <button
                onClick={() => setFilterMyBooks(!filterMyBooks)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${filterMyBooks
                    ? "bg-[#D2B48C] text-[#2C1A11]"
                    : "bg-[#3E2723] text-[#D2B48C] border border-[#8B4513]/50 hover:bg-[#4E342E]"
                  }`}
              >
                <Filter size={16} />
                My Books
              </button>

              {/* Nearby Toggle */}
              <button
                onClick={() => setFilterNearby(!filterNearby)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${filterNearby
                    ? "bg-emerald-700/80 text-emerald-100 border border-emerald-500"
                    : "bg-[#3E2723] text-[#D2B48C] border border-[#8B4513]/50 hover:bg-[#4E342E]"
                  }`}
              >
                <MapPin size={16} />
                Nearby
              </button>
            </div>
          </div>

          {/* Expanded Filters (Range Slider and Map) */}
          {filterNearby && (
            <div className="pt-4 border-t border-[#8B4513]/30 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-4">
                <span className="text-sm text-[#D2B48C]">Distance:</span>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={nearbyRange}
                  onChange={(e) => setNearbyRange(parseInt(e.target.value))}
                  className="w-48 h-2 bg-[#1A100A] rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <span className="text-sm font-medium text-emerald-400 min-w-12">
                  {nearbyRange} km
                </span>
                <button
                  onClick={() => setShowMap(!showMap)}
                  className={`ml-auto px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${
                    showMap
                      ? "bg-emerald-700/80 text-emerald-100 border border-emerald-500"
                      : "bg-[#3E2723] text-[#D2B48C] border border-[#8B4513]/50 hover:bg-[#4E342E]"
                  }`}
                >
                  <MapPin size={16} />
                  {showMap ? "Hide Map" : "Show Map"}
                </button>
              </div>

              {/* Map View */}
              {showMap && (
                <div className="w-full h-96 rounded-lg overflow-hidden border-2 border-[#8B4513]/50">
                  <div ref={mapContainer} className="w-full h-full" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Reputation Warning Message */}
        {reputationWarning && (
          <div className="bg-amber-50 border border-amber-300 text-amber-800 p-4 rounded-lg flex items-start gap-3 mb-6">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <span>{reputationWarning}</span>
            </div>
            <button
              onClick={() => setReputationWarning("")}
              className="text-amber-600 hover:text-amber-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D2B48C]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-[#2C1A11]/50 rounded-xl border border-dashed border-[#8B4513]/50">
                <div className="flex flex-col items-center justify-center text-[#D2B48C]/50 mb-4">
                  <Book size={48} />
                </div>
                <p className="text-[#D2B48C]">
                  {searchQuery || filterNearby || filterMyBooks
                    ? "No books found matching your criteria."
                    : "No books in your collection yet"}
                </p>
                {!searchQuery && !filterNearby && !filterMyBooks && (
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="mt-4 bg-[#D2B48C] hover:bg-[#C19A6B] text-[#2C1A11] px-6 py-2 rounded-lg flex items-center gap-2 transition-all font-bold"
                  >
                    <Plus size={18} />
                    Add Book
                  </button>
                )}
              </div>
            ) : (
              books.map((book) => {
                return (
                  <div
                    key={book.id}
                    onClick={() => openDetailsModal(book)}
                    className="bg-[#2C1A11] border border-[#8B4513]/30 rounded-xl p-6 hover:border-[#D2B48C]/50 transition-all duration-300 group relative cursor-pointer shadow-lg"
                  >
                    <div className="p-2">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-[#FDFBF7] mb-1 truncate pr-2">
                            {book.title}
                          </h3>
                          <p className="text-[#D2B48C]/80 text-sm">
                            {book.author}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${book.condition === "new"
                                ? "bg-emerald-900/40 text-emerald-400 border border-emerald-500/30"
                                : "bg-amber-900/40 text-amber-400 border border-amber-500/30"
                              }`}
                          >
                            {book.condition.toUpperCase()}
                          </span>
                          {/* Distance Badge */}
                          {book.dist_km !== undefined && (
                            <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-900/40 text-blue-400 border border-blue-500/30">
                              {Number(book.dist_km).toFixed(1)} km
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Book Image */}
                      <div className="h-48 w-full bg-[#1A100A] mb-4 rounded-lg overflow-hidden border border-[#8B4513]/20">
                        {book.book_images && book.book_images.length > 0 ? (
                          <img
                            src={book.book_images[0].image_url}
                            alt={book.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#5D4037] bg-[#2C1A11]">
                            <span className="text-4xl opacity-50">📚</span>
                          </div>
                        )}
                      </div>

                      {/* Book Description */}
                      <p className="text-[#D2B48C]/70 text-sm mb-4 line-clamp-2">
                        {book.description}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mb-4">
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            
                            // Check reputation requirement for forum
                            const {
                              data: { session },
                            } = await supabase.auth.getSession();
                            const token = session?.access_token;

                            const repCheck = await fetch(`${API_URL}/api/profiles/check-reputation?action=forum`, {
                              headers: {
                                Authorization: `Bearer ${token}`
                              }
                            });

                            if (repCheck.ok) {
                              const repData = await repCheck.json();
                              if (!repData.canPerformAction) {
                                setReputationWarning(`You need ${repData.requiredReputation} reputation points to post in forums. You currently have ${repData.currentReputation}. Earn ${repData.deficit} more reputation points to unlock this feature.`);
                                return;
                              }
                            }
                            
                            navigate(`/forum/${book.id}`);
                          }}
                          disabled={stats.reputation < 30}
                          className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-2 text-sm font-medium ${
                            stats.reputation < 30
                              ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                              : "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                          }`}
                          title={stats.reputation < 30 ? "Need 30 reputation" : "Forum"}
                        >
                          <MessageSquare size={16} />
                          Forum
                        </button>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();

                            // Check if trying to chat with yourself
                            if (book.owner_id === user.id) {
                              alert("You cannot chat with yourself!");
                              return;
                            }

                            try {
                              // Create or get chat with book owner
                              const {
                                data: { session },
                              } = await supabase.auth.getSession();
                              const token = session?.access_token;

                              if (!token) {
                                alert("Please log in to chat");
                                return;
                              }

                              // Check reputation requirement
                              const repCheck = await fetch(`${API_URL}/api/profiles/check-reputation?action=chat`, {
                                headers: {
                                  Authorization: `Bearer ${token}`
                                }
                              });

                              if (repCheck.ok) {
                                const repData = await repCheck.json();
                                if (!repData.canPerformAction) {
                                  setReputationWarning(`You need ${repData.requiredReputation} reputation points to chat. You currently have ${repData.currentReputation}. Earn ${repData.deficit} more reputation points to unlock this feature.`);
                                  return;
                                }
                              }

                              const res = await fetch(
                                `${API_URL}/api/messages/chat/create`,
                                {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                  },
                                  body: JSON.stringify({
                                    user1_id: user.id,
                                    user2_id: book.owner_id,
                                  }),
                                }
                              );

                              if (res.ok) {
                                const chat = await res.json();
                                navigate(`/chat/${chat.id}`, {
                                  state: {
                                    bookTitle: book.title,
                                    ownerName:
                                      book.owner?.username || "Book Owner",
                                    ownerId: book.owner_id,
                                  },
                                });
                              } else {
                                const error = await res.json();
                                console.error("Failed to create chat:", error);
                                alert(
                                  "Failed to create chat: " +
                                  (error.error || "Unknown error")
                                );
                              }
                            } catch (error) {
                              console.error("Error creating chat:", error);
                              alert("Error creating chat. Please try again.");
                            }
                          }}
                          disabled={stats.reputation < 50}
                          className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-2 text-sm font-medium border ${
                            stats.reputation < 50
                              ? "bg-slate-700 text-slate-400 cursor-not-allowed border-slate-600"
                              : "bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 hover:text-blue-300 border-blue-900/50"
                          }`}
                          title={stats.reputation < 50 ? "Need 50 reputation" : "Chat"}
                        >
                          <MessageCircle size={16} />
                          Chat
                        </button>
                      </div>
                      <div className="flex gap-2 mb-4 flex-wrap">
                        {user && book.owner_id === user.id ? (
                          <>
                            <button
                              onClick={(e) => openEditModal(e, book)}
                              className="flex-1 py-2 bg-[#8B4513] hover:bg-[#2C1A11] text-white rounded-lg transition flex items-center justify-center gap-2 text-sm font-medium shadow-sm"
                              title="Edit Book"
                            >
                              <Edit2 size={16} />
                              Edit
                            </button>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (window.confirm('Are you sure you want to delete this book?')) {
                                  try {
                                    const {
                                      data: { session },
                                    } = await supabase.auth.getSession();
                                    const token = session?.access_token;

                                    const res = await fetch(`${API_URL}/api/books/${book.id}`, {
                                      method: 'DELETE',
                                      headers: {
                                        Authorization: `Bearer ${token}`,
                                      },
                                    });

                                    if (res.ok) {
                                      handleBookDeleted(book.id);
                                    } else {
                                      alert('Failed to delete book');
                                    }
                                  } catch (error) {
                                    console.error('Error deleting book:', error);
                                    alert('Error deleting book');
                                  }
                                }
                              }}
                              className="p-2 rounded-lg transition border flex items-center justify-center shadow-sm bg-red-50 border-red-200 text-red-500 hover:bg-red-100"
                              title="Delete Book"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!requestedBookIds.has(book.id) && stats.reputation >= 20)
                                  navigate(`/request/${book.id}`);
                              }}
                              disabled={requestedBookIds.has(book.id) || stats.reputation < 20}
                              className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-2 text-sm font-medium shadow-sm ${requestedBookIds.has(book.id) || stats.reputation < 20
                                  ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                                  : "bg-[#8B4513] hover:bg-[#2C1A11] text-white"
                                }`}
                              title={
                                requestedBookIds.has(book.id)
                                  ? "Request Pending"
                                  : stats.reputation < 20
                                  ? "Need 20 reputation"
                                  : "Request Book"
                              }
                            >
                              {requestedBookIds.has(book.id) ? (
                                <span className="font-bold">Requested</span>
                              ) : (
                                <>
                                  <Send size={16} />
                                  Request
                                </>
                              )}
                            </button>
                            <button
                              onClick={(e) => toggleWishlist(e, book)}
                              className={`p-2 rounded-lg transition border flex items-center justify-center shadow-sm
                              ${wishlistIds.has(book.id)
                                  ? "bg-red-50 border-red-200 text-red-500 hover:bg-red-100"
                                  : "bg-white border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200"
                                }`}
                              title={
                                wishlistIds.has(book.id)
                                  ? "Remove from Wishlist"
                                  : "Add to Wishlist"
                              }
                            >
                              <Heart
                                size={20}
                                fill={
                                  wishlistIds.has(book.id)
                                    ? "currentColor"
                                    : "none"
                                }
                              />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        <AddBookModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onBookAdded={handleBookAdded}
        />

        <EditBookModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          book={selectedBook}
          onBookUpdated={handleBookUpdated}
          onBookDeleted={handleBookDeleted}
        />

        <BookDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          book={selectedBook}
        />

        {/* Reputation Modal */}
        {isReputationModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a0f0a]/95 backdrop-blur-md rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-[#8B4513]/50 shadow-2xl">
              <div className="sticky top-0 bg-[#2C1A11] px-6 py-4 border-b border-[#8B4513]/30 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#FDFBF7]">Get Reputation</h2>
                <button
                  onClick={() => setIsReputationModalOpen(false)}
                  className="text-[#D2B48C] hover:text-[#FDFBF7] transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <ConvertPointsToReputation 
                  userProfile={stats} 
                  onUpdate={(updated) => {
                    setStats({ ...stats, points: updated.points, reputation: updated.reputation });
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
