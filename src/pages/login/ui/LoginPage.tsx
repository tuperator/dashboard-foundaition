import { useLoginForm } from "../model/useLoginForm";
import { LoginFormPanel, LoginHeroPanel } from "./components";

export function LoginPage() {
  const form = useLoginForm();

  return (
    <main className="bg-background min-h-screen p-3 md:p-5">
      <div className="border-border/80 bg-card/70 mx-auto flex min-h-[calc(100vh-1.5rem)] w-full max-w-[1200px] rounded-[24px] border p-2 shadow-[0_16px_42px_rgba(16,24,40,0.08)] backdrop-blur-xl md:min-h-[calc(100vh-2.5rem)] md:rounded-[28px]">
        <div className="grid w-full rounded-2xl border border-border/60 bg-white/94 dark:bg-card/96 lg:grid-cols-[1fr_0.92fr]">
          <LoginFormPanel form={form} />
          <LoginHeroPanel />
        </div>
      </div>
    </main>
  );
}
