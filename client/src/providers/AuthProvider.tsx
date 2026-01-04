import { createContext, useContext, useEffect, useState } from "react";
import { getMe } from "../api/auth.api";

type User = {
  id: string;
  username: string;
  email: string;
  otp: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
};

export const AuthContext = createContext<AuthContextType | null>(null);
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const fetchUser = async () => {
    try {
      const res = await getMe();
      setUser(res.data.user);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);

  if (ctx == null) {
    throw new Error("ctx is null");
  }
  return ctx;
};

export default AuthProvider;
