"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { User, LoginRequest, RegisterRequest } from "@auction-platform/types";
import { authAPI } from "@/lib/api";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (
    data: LoginRequest
  ) => Promise<{ success: boolean; message?: string }>;
  register: (
    data: RegisterRequest
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_USER"; payload: User | null }
  | { type: "LOGOUT" };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Check for stored auth token on app load
    const token = localStorage.getItem("auction_token");
    const userData = localStorage.getItem("auction_user");

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        dispatch({ type: "SET_USER", payload: user });
      } catch {
        localStorage.removeItem("auction_token");
        localStorage.removeItem("auction_user");
        dispatch({ type: "SET_LOADING", payload: false });
      }
    } else {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const login = async (
    data: LoginRequest
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await authAPI.login(data);

      if (response.data.success && response.data.data) {
        const { user, token } = response.data.data;
        localStorage.setItem("auction_token", token);
        localStorage.setItem("auction_user", JSON.stringify(user));
        dispatch({ type: "SET_USER", payload: user });
        return { success: true };
      } else {
        dispatch({ type: "SET_LOADING", payload: false });
        return {
          success: false,
          message: response.data.message || "Login failed",
        };
      }
    } catch (error: unknown) {
      dispatch({ type: "SET_LOADING", payload: false });
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Login failed";
      return {
        success: false,
        message,
      };
    }
  };

  const register = async (
    data: RegisterRequest
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await authAPI.register(data);

      if (response.data.success && response.data.data) {
        const { user, token } = response.data.data;
        localStorage.setItem("auction_token", token);
        localStorage.setItem("auction_user", JSON.stringify(user));
        dispatch({ type: "SET_USER", payload: user });
        return { success: true };
      } else {
        dispatch({ type: "SET_LOADING", payload: false });
        return {
          success: false,
          message: response.data.message || "Registration failed",
        };
      }
    } catch (error: unknown) {
      dispatch({ type: "SET_LOADING", payload: false });
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Registration failed";
      return {
        success: false,
        message,
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("auction_token");
    localStorage.removeItem("auction_user");
    dispatch({ type: "LOGOUT" });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
