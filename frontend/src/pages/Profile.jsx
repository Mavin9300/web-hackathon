import React, { useState, useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useAuth } from "../context/AuthProvider";
import { supabase } from "../services/supabaseClient";
import { API_URL } from "../config";

const Profile = () => {
  const { user } = useAuth();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    username: "",
    location: "",
    image: "",
  });
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  // Fetch Profile
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;

        const res = await fetch(`${API_URL}/api/profiles/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setProfile({
            username: data.username || "",
            location: data.location || "",
            image: data.image_url || "",
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Initialize Map
  useEffect(() => {
    if (loading || !mapContainer.current) return;
    if (map.current) return; // already initialized

    // Default to Lahore, Pakistan if no location is set
    let initialCenter = [74.3587, 31.5204];
    let zoom = 12;

    // Try to parse location string "Lng, Lat"
    if (profile.location && profile.location.includes(",")) {
      const parts = profile.location.split(",").map(Number);
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        initialCenter = parts;
        zoom = 14;
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
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxzoom: 19,
          },
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
            minzoom: 0,
            maxzoom: 22,
          },
        ],
      },
      center: initialCenter,
      zoom: zoom,
      maxZoom: 19,
      minZoom: 2,
    });

    // Add navigation control (zoom buttons)
    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    // Add geolocate control
    const geolocate = new maplibregl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
    });
    map.current.addControl(geolocate, "top-right");

    // Add marker
    marker.current = new maplibregl.Marker({ draggable: true })
      .setLngLat(initialCenter)
      .addTo(map.current);

    // Update location on drag end
    marker.current.on("dragend", () => {
      const lngLat = marker.current.getLngLat();
      setProfile((prev) => ({
        ...prev,
        location: `${lngLat.lng.toFixed(6)}, ${lngLat.lat.toFixed(6)}`,
      }));
    });

    // Valid click handler
    map.current.on("click", (e) => {
      marker.current.setLngLat(e.lngLat);
      setProfile((prev) => ({
        ...prev,
        location: `${e.lngLat.lng.toFixed(6)}, ${e.lngLat.lat.toFixed(6)}`,
      }));

      // Fly to location and zoom in
      map.current.flyTo({
        center: e.lngLat,
        zoom: 16,
        speed: 1.5,
      });
    });

    // Listen to geolocate event
    geolocate.on("geolocate", (e) => {
      const lng = e.coords.longitude;
      const lat = e.coords.latitude;
      marker.current.setLngLat([lng, lat]);
      setProfile((prev) => ({
        ...prev,
        location: `${lng.toFixed(6)}, ${lat.toFixed(6)}`,
      }));
      // Map automatically flies to user location with geolocate control, but we can ensure zoom:
      map.current.zoomTo(14);
    });
  }, [loading]); // Re-run when loading finishes and profile is ready

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMsg("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      // Update Profile (Username, Location) in Backend
      const res = await fetch(`${API_URL}/api/profiles/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: profile.username,
          location: profile.location,
          image_url: profile.image,
        }),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      // Update Password via Supabase Auth if provided
      if (password) {
        if (password.length < 6)
          throw new Error("Password must be at least 6 characters");
        const { error: pwdError } = await supabase.auth.updateUser({
          password,
        });
        if (pwdError) throw pwdError;
      }

      setMsg("Profile updated successfully!");
      setPassword(""); // Clear password field
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-[#D2B48C] p-8">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pt-8">
      <header>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#D2B48C] to-[#C19A6B] bg-clip-text text-transparent">
          Edit Profile
        </h1>
        <p className="text-[#D2B48C]/70 mt-2">Update your personal information</p>
      </header>

      <div className="bg-[#2C1A11] border border-[#8B4513]/30 rounded-xl p-8 shadow-xl">
        {msg && (
          <div className="bg-green-500/10 text-green-400 p-4 rounded mb-6 border border-green-500/20">
            {msg}
          </div>
        )}
        {error && (
          <div className="bg-red-500/10 text-red-400 p-4 rounded mb-6 border border-red-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#8B4513] bg-[#3E2723]">
                  {profile.image ? (
                    <img
                      src={profile.image}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#D2B48C] text-4xl">
                      {profile.username
                        ? profile.username[0].toUpperCase()
                        : "?"}
                    </div>
                  )}
                </div>
                <div>
                  <label className="cursor-pointer bg-[#3E2723] hover:bg-[#4E342E] text-[#D2B48C] hover:text-[#FDFBF7] py-2 px-4 rounded-lg border border-[#8B4513]/50 transition-all text-sm shadow-md">
                    Change Photo
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;

                        try {
                          setSaving(true);
                          const fileExt = file.name.split(".").pop();
                          const fileName = `${user.id
                            }-${Date.now()}.${fileExt}`;
                          const filePath = `${fileName}`;

                          const { error: uploadError } = await supabase.storage
                            .from("hackathon")
                            .upload(filePath, file);

                          if (uploadError) throw uploadError;

                          const {
                            data: { publicUrl },
                          } = supabase.storage
                            .from("hackathon")
                            .getPublicUrl(filePath);

                          setProfile((prev) => ({ ...prev, image: publicUrl }));
                          setSaving(false);
                        } catch (err) {
                          setError("Error uploading image: " + err.message);
                          setSaving(false);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#D2B48C] mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={profile.username}
                  onChange={(e) =>
                    setProfile({ ...profile, username: e.target.value })
                  }
                  className="w-full bg-[#1A100A] border border-[#8B4513]/50 rounded-lg px-4 py-3 text-[#FDFBF7] focus:ring-2 focus:ring-[#D2B48C] focus:border-transparent transition-all outline-none"
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#D2B48C] mb-2">
                  New Password (optional)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1A100A] border border-[#8B4513]/50 rounded-lg px-4 py-3 text-[#FDFBF7] focus:ring-2 focus:ring-[#D2B48C] focus:border-transparent transition-all outline-none"
                  placeholder="Leave blank to keep current"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#D2B48C] mb-2">
                  Location (Lng, Lat)
                </label>
                <input
                  type="text"
                  value={profile.location}
                  readOnly
                  className="w-full bg-[#1A100A]/50 border border-[#8B4513]/30 rounded-lg px-4 py-3 text-[#D2B48C]/50 cursor-not-allowed"
                  placeholder="Click on map to select"
                />
                <p className="text-xs text-[#D2B48C]/60 mt-1">
                  Select your location on the map
                </p>
              </div>
            </div>

            <div className="h-[400px] bg-[#1A100A] rounded-xl overflow-hidden border border-[#8B4513]/50 relative">
              <div ref={mapContainer} className="w-full h-full" />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[#8B4513]/30">
            <button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-[#D2B48C] to-[#C19A6B] hover:shadow-lg text-[#2C1A11] font-bold px-8 py-3 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
