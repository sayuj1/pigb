import { createContext, useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import ROUTES from "@/lib/routes";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Preliminary check from localStorage
    const savedAuth = localStorage.getItem("isAuth") === "true";
    setIsAuthenticated(savedAuth);

    async function fetchUser() {
      try {
        const res = await axios.get("/api/auth/checkAuth", {
          withCredentials: true,
        });
        setUser(res.data.user);
        setIsAuthenticated(true);
        localStorage.setItem("isAuth", "true");
      } catch (err) {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem("isAuth");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      setUser(res.data.user);
      setIsAuthenticated(true);
      localStorage.setItem("isAuth", "true");
      router.push(ROUTES.DASHBOARD);
    } catch (error) {
      console.error(error.response.data.message);
    }
  };

  const signup = async (name, email, password) => {
    try {
      await axios.post("/api/auth/signup", { name, email, password });
      router.push(ROUTES.LOGIN);
    } catch (error) {
      console.error(error.response.data.message);
    }
  };

  const googleSignIn = async (tokenId) => {
    try {
      const res = await axios.post("/api/auth/google", { tokenId });
      setUser(res.data.user);
      setIsAuthenticated(true);
      localStorage.setItem("isAuth", "true");
      router.push(ROUTES.HOME);
    } catch (error) {
      console.error(error.response.data.message);
    }
  };

  const logout = async () => {
    try {
      await axios.post("/api/auth/logout");
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("isAuth");
      router.push(ROUTES.HOME);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, signup, googleSignIn, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

