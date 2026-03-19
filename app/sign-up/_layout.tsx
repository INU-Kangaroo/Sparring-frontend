import React from "react";
import { Stack } from "expo-router";
import { SignupProvider } from "./signupContext";

export default function SignupLayout() {
  return (
    <SignupProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SignupProvider>
  );
}