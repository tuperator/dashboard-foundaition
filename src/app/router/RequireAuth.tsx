import { useEffect, useState } from "react";
import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { refreshToken } from "@/shared/api/auth";
import { appRoutes } from "@/shared/constants/routes";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import {
  clearAuthSession,
  getAuthSession,
  hasValidAccessToken,
  saveAuthSession,
} from "@/shared/lib/auth-session";

type AuthState = "checking" | "allowed" | "denied";

export function RequireAuth({ children }: PropsWithChildren) {
  const location = useLocation();
  const { t } = useI18n();
  const [authState, setAuthState] = useState<AuthState>("checking");

  useEffect(() => {
    let isMounted = true;

    async function verifySession() {
      const session = getAuthSession();
      if (!session) {
        if (isMounted) setAuthState("denied");
        return;
      }

      if (hasValidAccessToken(session)) {
        if (isMounted) setAuthState("allowed");
        return;
      }

      if (!session.refreshToken) {
        clearAuthSession();
        if (isMounted) setAuthState("denied");
        return;
      }

      try {
        const response = await refreshToken({
          refreshToken: session.refreshToken,
        });
        saveAuthSession(response.data, session.rememberMe);
        if (isMounted) setAuthState("allowed");
      } catch {
        clearAuthSession();
        if (isMounted) setAuthState("denied");
      }
    }

    void verifySession();

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  if (authState === "checking") {
    return (
      <main className="bg-background text-foreground grid min-h-screen place-items-center">
        <p className="text-muted-foreground text-sm">
          {t("auth.checkingSession")}
        </p>
      </main>
    );
  }

  if (authState === "denied") {
    return (
      <Navigate
        to={appRoutes.login}
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  return <>{children}</>;
}
