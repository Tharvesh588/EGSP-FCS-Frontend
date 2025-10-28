"use client";

import { LoginScreen } from "@/components/ui/login-1";
import { Suspense } from "react";

function LoginPageContent() {
  return <LoginScreen />;
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageContent />
    </Suspense>
  );
}
