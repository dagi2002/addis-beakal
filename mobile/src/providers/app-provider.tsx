import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import type { MobileSession } from "@mobile/src/data/catalog";

type StoredAccount = {
  email: string;
  displayName: string;
};

type PersistedState = {
  savedIds: string[];
  session: MobileSession | null;
  accounts: StoredAccount[];
};

type AuthResult = {
  ok: boolean;
  message?: string;
};

type AppContextValue = {
  ready: boolean;
  savedIds: string[];
  session: MobileSession | null;
  toggleSaved: (businessId: string) => void;
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (displayName: string, email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
};

const STORAGE_KEY = "addis-beakal-mobile-state-v1";
const AppContext = createContext<AppContextValue | null>(null);

const DEMO_ACCOUNTS = [
  {
    email: "demo@addisbeakal.test",
    password: "demo12345",
    displayName: "Demo Member",
    kind: "demo" as const
  },
  {
    email: "admin@addisbeakal.test",
    password: "admin12345",
    displayName: "Admin Preview",
    kind: "demo" as const
  }
] as const;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [session, setSession] = useState<MobileSession | null>(null);
  const [accounts, setAccounts] = useState<StoredAccount[]>([]);

  useEffect(() => {
    void (async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored) as PersistedState;
        setSavedIds(parsed.savedIds ?? []);
        setSession(parsed.session ?? null);
        setAccounts(parsed.accounts ?? []);
      }

      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }

    const payload: PersistedState = {
      savedIds,
      session,
      accounts
    };

    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [accounts, ready, savedIds, session]);

  const value = useMemo<AppContextValue>(
    () => ({
      ready,
      savedIds,
      session,
      toggleSaved: (businessId) => {
        setSavedIds((current) =>
          current.includes(businessId)
            ? current.filter((id) => id !== businessId)
            : [businessId, ...current]
        );
      },
      login: async (email, password) => {
        const normalizedEmail = email.trim().toLowerCase();
        const trimmedPassword = password.trim();

        const demoAccount = DEMO_ACCOUNTS.find(
          (account) =>
            account.email === normalizedEmail && account.password === trimmedPassword
        );

        if (demoAccount) {
          setSession({
            email: demoAccount.email,
            displayName: demoAccount.displayName,
            kind: demoAccount.kind
          });
          return { ok: true };
        }

        const localAccount = accounts.find((account) => account.email === normalizedEmail);

        if (localAccount && trimmedPassword.length >= 8) {
          setSession({
            email: localAccount.email,
            displayName: localAccount.displayName,
            kind: "local"
          });
          return { ok: true };
        }

        return {
          ok: false,
          message:
            "Use the demo credentials shown below or sign up to create a local mobile profile."
        };
      },
      signup: async (displayName, email, password) => {
        const normalizedDisplayName = displayName.trim();
        const normalizedEmail = email.trim().toLowerCase();

        if (normalizedDisplayName.length < 2) {
          return { ok: false, message: "Add a display name with at least 2 characters." };
        }

        if (!normalizedEmail.includes("@")) {
          return { ok: false, message: "Enter a valid email address." };
        }

        if (password.trim().length < 8) {
          return { ok: false, message: "Use at least 8 characters for your password." };
        }

        if (
          DEMO_ACCOUNTS.some((account) => account.email === normalizedEmail) ||
          accounts.some((account) => account.email === normalizedEmail)
        ) {
          return {
            ok: false,
            message: "That email is already in use. Sign in instead."
          };
        }

        const nextAccount = {
          email: normalizedEmail,
          displayName: normalizedDisplayName
        };

        setAccounts((current) => [nextAccount, ...current]);
        setSession({
          email: nextAccount.email,
          displayName: nextAccount.displayName,
          kind: "local"
        });

        return { ok: true };
      },
      logout: async () => {
        setSession(null);
      }
    }),
    [accounts, ready, savedIds, session]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppState must be used inside AppProvider");
  }

  return context;
}
