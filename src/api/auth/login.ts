import { UserRole } from "@/dto/constants/UserRole";
import type { AuthSessionResponse } from "@/dto/auth/AuthSessionResponse";
import type { User } from "@/dto/auth/User";
import { demoAccounts } from "@/lib/database/seedData";
import { delay } from "../utils/mock-delay";

export async function login(identifier: string, role?: UserRole): Promise<AuthSessionResponse> {
  await delay(200);
  const cleanId = (identifier || "").trim().toLowerCase();

  if (cleanId) {
    // 1. Try finding by exact username (e.g. patient01, doctor01, pharmacy01)
    const byUsername = demoAccounts.find(
      (acc) => acc.username.toLowerCase() === cleanId
    );
    if (byUsername) {
      return { token: `mock-token-${byUsername.user.id}`, user: byUsername.user };
    }

    // 2. Try finding by exact User ID (e.g. p-01, doc-01, ph-01)
    const byId = demoAccounts.find(
      (acc) => acc.user.id.toLowerCase() === cleanId
    );
    if (byId) {
      return { token: `mock-token-${byId.user.id}`, user: byId.user };
    }

    // 3. Try finding by matching Name substring
    const byName = demoAccounts.find(
      (acc) => acc.user.name.toLowerCase().includes(cleanId)
    );
    if (byName) {
      return { token: `mock-token-${byName.user.id}`, user: byName.user };
    }
  }

  // 4. If role is provided, find first account for that role
  if (role) {
    const byRole = demoAccounts.find((acc) => acc.role === role);
    if (byRole) {
      return { token: `mock-token-${byRole.user.id}`, user: byRole.user };
    }
  }

  // 5. Default fallback to first patient
  const fallback = demoAccounts[0];
  return { token: `mock-token-${fallback.user.id}`, user: fallback.user };
}

export async function register(
  name: string,
  role: UserRole
): Promise<AuthSessionResponse> {
  await delay(300);
  const user: User = { id: `u-${Date.now()}`, name, role };
  return { token: `mock-token-${user.id}`, user };
}
