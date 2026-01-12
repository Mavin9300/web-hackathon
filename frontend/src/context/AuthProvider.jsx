import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { API_URL } from "../config";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false); // Stop loading so app can render (or render error)
      return;
    }

    // Check active session
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) ensureProfile(session);
      setLoading(false);
    };

    getSession();

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) ensureProfile(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const ensureProfile = async (session) => {
    // Optimistic check: we can't easily check if profile exists without making an API call.
    // Or we just try to create it and let backend handle duplicate/idempotency.
    // Since our backend createProfile inserts, we should make it idempotent or check first.
    // But `insert` will fail if PK exists.
    // Let's call our API.
    try {
      const token = session.access_token;
      const username = `${session.user.email.split("@")[0]}_${Date.now()
        .toString()
        .slice(-4)}`;

      // We'll trust the backend to handle "if exists" gracefully or we check first?
      // Actually best is to check if profile exists, if not create.

      // 1. Check if profile exists (using backend GET)
      const checkRes = await fetch(
        `${API_URL}/api/profiles/${session.user.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // If 404 or empty, create. (Our getProfile returns 200 with null or 400 if error?)
      // backend getProfile throws error if logic fails, but let's see.
      // profileModel.getProfile throws error if not found?
      // No, `single()` returns error if not user found.

      if (checkRes.ok) {
        // Profile exists
        return;
      }

      // 2. Create Profile if not exists
      // Note: checkRes might adhere to RLS? No, we use backend.

      const res = await fetch(`${API_URL}/api/profiles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: username,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Profile creation failed:", res.status, errText);
      }
    } catch (err) {
      console.error("Error ensuring profile:", err);
    }
  };

  const signUp = async (email, password, username) => {
    // Add username as user_metadata
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
          role: "user", // Default role
        },
      },
    });
  };

  const signIn = (email, password) => {
    return supabase.auth.signInWithPassword({
      email,
      password,
    });
  };

  const signOut = () => {
    return supabase.auth.signOut();
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  if (!supabase) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white p-4">
        <div className="rounded-lg bg-red-900/20 p-8 border border-red-500 text-center max-w-lg">
          <h1 className="text-2xl font-bold text-red-500 mb-4">
            Configuration Error
          </h1>
          <p className="mb-4">Supabase is not configured.</p>
          <p className="mb-4 text-sm text-gray-300">
            Please create a{" "}
            <code className="bg-gray-800 px-1 py-0.5 rounded">.env</code> file
            in the frontend directory with your Supabase credentials:
          </p>
          <pre className="bg-black p-4 rounded text-left text-xs overflow-x-auto mb-4 text-green-400">
            VITE_SUPABASE_URL=your_project_url{"\n"}
            VITE_SUPABASE_ANON_KEY=your_anon_key
          </pre>
          <p className="text-sm">
            After adding the file, restart the dev server.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
