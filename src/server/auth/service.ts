import { z } from "zod";

import type { User } from "@/features/businesses/types";
import { readDatabase, updateDatabase } from "@/server/database";
import { hashPassword, verifyPassword } from "@/server/auth/password";

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const signUpSchema = authSchema.extend({
  displayName: z.string().trim().min(2).max(60)
});

export const signInSchema = authSchema;

export const updateProfileSchema = z.object({
  displayName: z.string().trim().min(2).max(60)
});

export type PublicUser = Pick<User, "id" | "email" | "displayName" | "role">;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role
  };
}

export async function signUpUser(input: unknown) {
  const payload = signUpSchema.parse(input);
  const email = normalizeEmail(payload.email);
  const database = await readDatabase();

  if (database.users.some((user) => user.email === email)) {
    throw new Error("An account with that email already exists.");
  }

  const now = new Date().toISOString();
  const user: User = {
    id: `user_${crypto.randomUUID()}`,
    email,
    passwordHash: await hashPassword(payload.password),
    displayName: payload.displayName.trim(),
    role: "member",
    createdAt: now,
    updatedAt: now
  };

  await updateDatabase((current) => ({
    ...current,
    users: [...current.users, user]
  }));

  return toPublicUser(user);
}

export async function signInUser(input: unknown) {
  const payload = signInSchema.parse(input);
  const email = normalizeEmail(payload.email);
  const database = await readDatabase();
  const user = database.users.find((entry) => entry.email === email);

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  const matches = await verifyPassword(user.passwordHash, payload.password);
  if (!matches) {
    throw new Error("Invalid email or password.");
  }

  return toPublicUser(user);
}

export async function updateUserDisplayName(userId: string, input: unknown) {
  const payload = updateProfileSchema.parse(input);
  let updatedUser: User | null = null;

  await updateDatabase((current) => {
    const nextUsers = current.users.map((user) => {
      if (user.id !== userId) {
        return user;
      }

      updatedUser = {
        ...user,
        displayName: payload.displayName.trim(),
        updatedAt: new Date().toISOString()
      };

      return updatedUser;
    });

    return {
      ...current,
      users: nextUsers
    };
  });

  if (!updatedUser) {
    throw new Error("User not found.");
  }

  return toPublicUser(updatedUser);
}
