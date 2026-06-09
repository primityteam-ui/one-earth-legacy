import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api, { setAccessToken } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function bootstrap() {
    try {
      const response = await api.post("/auth/refresh-token");
      setAccessToken(response.data.accessToken);
      setUser(response.data.user);
    } catch {
      setAccessToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    bootstrap();
  }, []);

  async function sendOtp(email) {
    await api.post("/auth/email/send-otp", { email });
  }

  async function verifyOtp(email, otp) {
    const response = await api.post("/auth/email/verify-otp", { email, otp });
    setAccessToken(response.data.accessToken);
    setUser(response.data.user);
    return response.data.user;
  }

  async function logout() {
    await api.post("/auth/logout");
    setAccessToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      sendOtp,
      verifyOtp,
      logout,
      setUser
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}