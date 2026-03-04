export function LoginHeroPanel() {
  return (
    <aside className="m-2 hidden rounded-[20px] border border-white/25 bg-[linear-gradient(148deg,#070b19_0%,#1a2552_44%,#36457f_100%)] p-6 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_20px_46px_rgba(8,12,28,0.46)] lg:flex lg:flex-col">
      <div className="space-y-2">
        <h2 className="text-[42px] leading-[0.9] font-semibold tracking-[-0.03em] opacity-35">
          +
        </h2>
        <h3 className="max-w-[420px] text-[34px] leading-tight font-semibold tracking-[-0.03em] text-white">
          Effortlessly manage your team and operations.
        </h3>
        <p className="max-w-[400px] text-[13px] text-white/85">
          Log in to access your CRM dashboard and manage your team.
        </p>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/30 bg-white/95 p-4 text-black shadow-[0_16px_36px_rgba(6,8,20,0.32)]">
        <img
          src="/login-dashboard-preview.png"
          alt="Dashboard preview on desktop and mobile"
          className="h-auto w-full rounded-xl border border-black/15"
        />
      </div>

      <div className="mt-5 rounded-2xl border border-white/25 bg-black/10 px-4 py-3 text-sm text-white/92 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        SSO options are planned in the next release.
      </div>
    </aside>
  );
}
