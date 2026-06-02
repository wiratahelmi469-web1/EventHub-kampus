// ADDED: shorthand handle for AuthContext
"use client";

import { useAuth as useGlobalAuth } from "../context/AuthContext";

export function useAuth() {
  return useGlobalAuth();
}
