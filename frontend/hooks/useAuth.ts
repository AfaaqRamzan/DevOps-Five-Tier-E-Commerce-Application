import { authService } from "@/services/api/auth.service";
import { IRootState, useAppDispacth } from "@/store";
import { useState } from "react";
import { useSelector } from "react-redux";
import { setAuth } from "../store/slices/authSlice";
import { LoginCredentials } from "../types/auth.types";

export function useAuth() {
  const authState = useSelector((state: IRootState) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispacth();

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.logout();
    } catch (error) {}
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(credentials);

      dispatch(
        setAuth({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          user: response.user,
        }),
      );

      return true;
    } catch (error) {
      setError("Login failed. Please try again" + error);
      return false;
    }
  };

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading,
    error,
    logout,
    login,
  };
}
