import { createContext, useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import ROUTES from "@/lib/routes";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await axios.get("/api/auth/checkAuth", {
          withCredentials: true,
        });
        setUser(res.data.user);
      } catch (err) {
        setUser(null);
      }
    }
    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      setUser(res.data.user);
      // router.push("/dashboard");
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
      router.push(ROUTES.HOME);
    } catch (error) {
      console.error(error.response.data.message);
    }
  };

  const logout = async () => {
    try {
      await axios.post("/api/auth/logout");
      setUser(null);
      // router.push("/");
      router.push(ROUTES.HOME);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, googleSignIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
