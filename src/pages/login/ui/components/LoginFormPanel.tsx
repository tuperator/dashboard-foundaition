import { Controller } from "react-hook-form";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import type { UseLoginFormResult } from "../../model/useLoginForm";

type LoginFormPanelProps = {
  form: UseLoginFormResult;
};

export function LoginFormPanel({ form }: LoginFormPanelProps) {
  const {
    register,
    control,
    onSubmit,
    showPassword,
    togglePasswordVisibility,
    isSubmitting,
    formState: { errors, isValid },
  } = form;

  return (
    <section className="flex min-h-[640px] flex-col p-6 md:p-10">
      <div className="mb-6 flex items-center gap-2">
        <span className="bg-primary text-primary-foreground inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold">
          T
        </span>
        <span className="text-foreground text-xl font-semibold tracking-[-0.01em]">
          Tuperator
        </span>
      </div>

      <div className="mx-auto flex w-full max-w-[380px] flex-1 flex-col justify-center">
        <div className="mb-7 text-center">
          <h1 className="text-foreground text-[42px] leading-tight font-semibold tracking-[-0.03em]">
            Welcome Back
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Enter your email and password to access your account.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="identity">Email</Label>
            <Input
              id="identity"
              autoComplete="email"
              placeholder="sellostore@company.com"
              className="h-11 rounded-xl px-3 text-sm"
              {...register("identity")}
            />
            {errors.identity ? (
              <p className="text-destructive text-xs">{errors.identity.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                className="h-11 rounded-xl px-3 pr-14 text-sm"
                {...register("password")}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 text-xs transition"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password ? (
              <p className="text-destructive text-xs">{errors.password.message}</p>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-2 pt-0.5">
            <Controller
              control={control}
              name="rememberMe"
              render={({ field }) => (
                <label className="text-muted-foreground inline-flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                  />
                  Remember Me
                </label>
              )}
            />

            <button
              type="button"
              className="text-primary text-sm font-medium transition hover:opacity-80"
            >
              Forgot Your Password?
            </button>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={!isValid || isSubmitting}
            className="h-11 w-full rounded-xl text-sm font-medium"
          >
            {isSubmitting ? "Logging in..." : "Log In"}
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled
            className="h-10 w-full rounded-xl text-sm"
          >
            Login by SSO
            <span className="text-muted-foreground ml-1 text-[10px]">
              Coming soon
            </span>
          </Button>
        </form>

        <p className="text-muted-foreground mt-5 text-center text-sm">
          Need access to the system? Please contact your administrator.
        </p>
      </div>

      <div className="text-muted-foreground mt-8 flex items-center justify-between text-xs">
        <span>Copyright © 2026 Tuperator Enterprises LTD.</span>
        <button type="button" className="hover:text-foreground transition">
          Privacy Policy
        </button>
      </div>
    </section>
  );
}
