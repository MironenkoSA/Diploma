// src/utils/password.ts
import argon2 from 'argon2';
import { config } from '../config';

// Pepper is a secret server-side value added BEFORE hashing.
// Even if DB is compromised, attacker needs the pepper to crack passwords.
// Salt is automatically handled by argon2 (per-hash, stored in hash string).

function applyPepper(password: string): string {
  return `${config.PASSWORD_PEPPER}:${password}`;
}

export async function hashPassword(plaintext: string): Promise<string> {
  const peppered = applyPepper(plaintext);
  return argon2.hash(peppered, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MiB
    timeCost: 3,
    parallelism: 4,
  });
}

export async function verifyPassword(
  plaintext: string,
  hash: string
): Promise<boolean> {
  const peppered = applyPepper(plaintext);
  return argon2.verify(hash, peppered);
}
