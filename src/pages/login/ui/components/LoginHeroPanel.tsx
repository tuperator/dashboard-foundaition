export function LoginHeroPanel() {
  return (
    <aside className="m-2 hidden rounded-[24px] border border-border/30 bg-[linear-gradient(145deg,var(--primary)_0%,var(--chart-2)_100%)] p-8 text-primary-foreground lg:flex lg:flex-col">
      <div>
        <h2 className="text-[50px] leading-[0.9] font-semibold tracking-[-0.03em] opacity-35">
          +
        </h2>
        <h3 className="mt-3 max-w-[440px] text-[44px] leading-tight font-semibold tracking-[-0.03em]">
          Effortlessly manage your team and operations.
        </h3>
        <p className="mt-3 max-w-[420px] text-sm opacity-90">
          Log in to access your CRM dashboard and manage your team.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-white/25 bg-white/92 p-3 text-black shadow-[0_12px_30px_rgba(0,0,0,0.15)]">
        <img
          src="/login-dashboard-preview.png"
          alt="Dashboard preview on desktop and mobile"
          className="h-auto w-full rounded-xl"
        />
      </div>

      <div className="mt-auto rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm">
        SSO options are planned in the next release.
      </div>
    </aside>
  );
}
