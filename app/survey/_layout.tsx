import React from "react";
import { Stack } from "expo-router";
import { SurveyProvider } from "./surveyContext";

export default function SurveyLayout() {
  return (
    <SurveyProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SurveyProvider>
  );
}