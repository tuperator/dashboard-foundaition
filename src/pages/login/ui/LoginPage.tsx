import { useLoginForm } from "../model/useLoginForm";
import { LoginFormPanel, LoginHeroPanel } from "./components";

export function LoginPage() {
  const form = useLoginForm();

  return (
    <main className="bg-background min-h-screen p-3 md:p-6">
      <div className="border-border/80 bg-card/70 mx-auto flex min-h-[calc(100vh-1.5rem)] w-full max-w-[1320px] rounded-[28px] border p-2 shadow-[0_18px_50px_rgba(16,24,40,0.08)] backdrop-blur-xl md:min-h-[calc(100vh-3rem)] md:rounded-[32px]">
        <div className="grid w-full rounded-3xl border border-border/60 bg-white/92 dark:bg-card/95 lg:grid-cols-[1fr_0.98fr]">
          <LoginFormPanel form={form} />
          <LoginHeroPanel />
        </div>
      </div>
    </main>
  );
}
