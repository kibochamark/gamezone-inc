"use client";
import { KindeProvider } from "@kinde-oss/kinde-auth-nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { ReactNode } from "react";

const queryClient = new QueryClient();

export const KindeAuthProvider = ({ children }: { children: ReactNode }) => {
  return (
    <KindeProvider>{children}</KindeProvider>
  );
};
