"use client";
//       setToken(token);//Set token from localStorage
import React, { ReactNode } from "react";
import { AuthProvider } from "./context/AuthContext";
// Wrap the app in the AuthProvider
export function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
