"use client";

import { useCallback, useEffect, useState } from "react";
import { api, clearToken, getToken, setToken } from "@/lib/apiClient";
import { useAppStore } from "@/store/useAppStore";
import type { User } from "@/lib/types";

export function useAuth() {
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get<User>("/api/auth/me")
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, [setUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { access_token } = await api.post<{ access_token: string }>("/api/auth/login", { email, password }, { auth: false });
      setToken(access_token);
      const me = await api.get<User>("/api/auth/me");
      setUser(me);
      return me;
    },
    [setUser]
  );

  const register = useCallback(
    async (email: string, password: string, fullName: string) => {
      await api.post<User>("/api/auth/register", { email, password, full_name: fullName }, { auth: false });
      return login(email, password);
    },
    [login]
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, [setUser]);

  return { user, loading, login, register, logout };
}
