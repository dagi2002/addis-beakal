import type { User } from "@/features/businesses/types";

const now = "2026-03-16T12:00:00.000Z";

export const demoUsers: User[] = [
  {
    id: "user-demo-member",
    email: "demo@addisbeakal.test",
    passwordHash: "$argon2id$v=19$m=65536,t=3,p=4$KSjPIXF8Wvt4rLa2jXWMbA$dSgS0GoVFvMnd0WuGemwmoPePIG8MzQ6XuZZ7CBhxRs",
    displayName: "Selam Demo",
    role: "member",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "user-demo-admin",
    email: "admin@addisbeakal.test",
    passwordHash: "$argon2id$v=19$m=65536,t=3,p=4$lCXDqevZluLtdAJNFfXHdQ$zwdh0n7PzI/+5TbGtQSc9caWC4KT3V0LwEUx9uTD0HY",
    displayName: "Admin Demo",
    role: "admin",
    createdAt: now,
    updatedAt: now
  }
];

export const demoCredentials = [
  { email: "demo@addisbeakal.test", password: "demo12345", role: "member" },
  { email: "admin@addisbeakal.test", password: "admin12345", role: "admin" }
] as const;
