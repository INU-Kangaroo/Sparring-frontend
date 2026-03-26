import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { SignupRequest } from "../api/signup";

type SignupDraft = Partial<SignupRequest> & {
  verificationId?: string;
};

type Ctx = {
  draft: SignupDraft;
  setDraft: (patch: Partial<SignupDraft>) => void;
  resetDraft: () => void;
};

const SignupContext = createContext<Ctx | null>(null);

export function SignupProvider({ children }: { children: ReactNode }) {
  const [draft, setDraftState] = useState<SignupDraft>({});

  const setDraft = (patch: Partial<SignupDraft>) => {
    setDraftState((prev) => ({ ...prev, ...patch }));
  };

  const resetDraft = () => setDraftState({});

  const value = useMemo(() => ({ draft, setDraft, resetDraft }), [draft]);

  return (
    <SignupContext.Provider value={value}>
      {children}
    </SignupContext.Provider>
  );
}

export function useSignupDraft() {
  const ctx = useContext(SignupContext);
  if (!ctx) throw new Error("useSignupDraft must be used within SignupProvider");
  return ctx;
}