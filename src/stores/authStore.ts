import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthSessionResponse } from "@/dto/auth/AuthSessionResponse";
import type { User } from "@/dto/auth/User";
import { login as apiLogin, register as apiRegister } from "@/api/auth/login";
import { UserRole } from "@/dto/constants/UserRole";

interface AuthState {
  user: User | null;
  token: string | null;
  login: (identifier: string, role?: UserRole) => Promise<void>;
  loginUser: (user: User) => void;
  register: (name: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      async login(identifier, role) {
        const session: AuthSessionResponse = await apiLogin(identifier, role);
        set({ user: session.user, token: session.token });
      },
      loginUser(user) {
        set({ user, token: `mock-token-${user.id}` });
      },
      async register(name, role) {
        const session: AuthSessionResponse = await apiRegister(name, role);
        set({ user: session.user, token: session.token });
      },
      logout() {
        set({ user: null, token: null });
      },
    }),
    { name: "swasthya-auth" }
  )
);
