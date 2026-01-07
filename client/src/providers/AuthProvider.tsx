import { createContext, useContext, useEffect, useState } from "react";
import { getMe } from "../api/auth.api";

type User = {
  id: string;
  username: string;
  email: string;
  otp: string;
  profilePic?: string | null;
  status: string;
  lastSeen: string;
};

type AuthContextType = {
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  user: User | null;
  isAuthenticated: boolean;
  isloading: boolean;
};

export const AuthContext = createContext<AuthContextType | null>(null);
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isloading, setIsloading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const fetchUser = async () => {
    try {
      const res = await getMe();
      setUser(res.data.user);
    } catch (error) {
      console.log(error);
    } finally {
      setIsloading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        setUser,
        user,
        isAuthenticated: !!user,
        isloading,
      }}
    >
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
