import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { setAccessToken } from "../lib/api";
import { authService } from "../services/auth.service";
import type {
  LoginCredentials,
  RegisterCredentials,
} from "../types/auth.types";
import type IUser from "../types/user.types";

interface AuthContextValue {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (credentails: RegisterCredentials) => Promise<void>;
  refreshUser: () => Promise<IUser>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        await authService.refresh();

        const currentUser = await authService.me();

        if (!cancelled) {
          setUser(currentUser);
        }
      } catch {
        setAccessToken(null);

        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);
  const register = useCallback(async (credentials: RegisterCredentials) => {
    await authService.register(credentials);

    const currentUser = await authService.me();

    setUser(currentUser);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    await authService.login(credentials);

    const currentUser = await authService.me();

    setUser(currentUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    function handleSessionExpired() {
      setUser(null);
    }

    window.addEventListener("auth:session-expired", handleSessionExpired);

    return () => {
      window.removeEventListener("auth:session-expired", handleSessionExpired);
    };
  }, []);

  const refreshUser = useCallback(async () => {
    const currentUser = await authService.me();
    setUser(currentUser);
    return currentUser;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        login,
        logout,
        register,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
}
