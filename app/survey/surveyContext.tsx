import React, { createContext, useContext, useMemo, useState } from "react";
import type { SurveyAnswerItem, SurveyAnswerValue } from "../api/survey";

type SurveyDraft = Record<string, SurveyAnswerValue>;

type SurveyContextType = {
  draft: SurveyDraft;
  setAnswer: (questionKey: string, value: SurveyAnswerValue) => void;
  resetDraft: () => void;
  toAnswersArray: () => SurveyAnswerItem[];
};

const SurveyContext = createContext<SurveyContextType | null>(null);

export function SurveyProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<SurveyDraft>({});

  const setAnswer = (questionKey: string, value: SurveyAnswerValue) => {
    const normalizedKey = questionKey.trim();

    setDraft((prev) => ({
      ...prev,
      [normalizedKey]: value,
    }));
  };

  const resetDraft = () => setDraft({});

  const toAnswersArray = () =>
    Object.entries(draft).map(([questionKey, value]) => ({
      questionKey: questionKey.trim(),
      value,
    }));

  const value = useMemo(
    () => ({
      draft,
      setAnswer,
      resetDraft,
      toAnswersArray,
    }),
    [draft]
  );

  return <SurveyContext.Provider value={value}>{children}</SurveyContext.Provider>;
}

export function useSurveyDraft() {
  const ctx = useContext(SurveyContext);
  if (!ctx) throw new Error("useSurveyDraft must be used within SurveyProvider");
  return ctx;
}