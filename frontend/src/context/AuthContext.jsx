import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem("mb_token");
      const cachedUser = localStorage.getItem("mb_user");

      if (token && cachedUser) {
        setUser(JSON.parse(cachedUser));
        try {
          const { data } = await api.get("/auth/me");
          setUser(data.user);
          localStorage.setItem("mb_user", JSON.stringify(data.user));
        } catch (err) {
          localStorage.removeItem("mb_token");
          localStorage.removeItem("mb_user");
          setUser(null);
        }
      }
      setLoading(false);
    };
    bootstrap();
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("mb_token", token);
    localStorage.setItem("mb_user", JSON.stringify(userData));
    setUser(userData);
  };

  const updateUser = (userData) => {
    localStorage.setItem("mb_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("mb_token");
    localStorage.removeItem("mb_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
