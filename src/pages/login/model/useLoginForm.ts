import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { appRoutes } from "@/shared/constants/routes";
import { LOGIN_ENDPOINT, login } from "@/shared/api/auth";
import { normalizeApiError } from "@/shared/api/http";
import { saveAuthSession } from "@/shared/lib/auth-session";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import { createLoginSchema, type LoginFormValues } from "./login.schema";

export function useLoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const loginSchema = useMemo(() => createLoginSchema(t), [t]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      identity: "",
      password: "",
      rememberMe: true,
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (body: LoginFormValues) => {
      console.log("[LOGIN_REQUEST]", {
        url: LOGIN_ENDPOINT,
        body: {
          email: body.identity,
          password: body.password,
        },
      });
      return login({
        email: body.identity,
        password: body.password,
      });
    },
    onSuccess: (response, variables) => {
      saveAuthSession(response.data, variables.rememberMe);

      const state = location.state as { from?: string } | null;
      const redirectTo = state?.from || appRoutes.dashboard;
      navigate(redirectTo, { replace: true });
    },
    onError: (error) => {
      const apiError = normalizeApiError(error);
      setSubmitError(apiError.message);
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    setSubmitError(null);
    loginMutation.mutate(values);
  });

  return {
    ...form,
    showPassword,
    togglePasswordVisibility: () => setShowPassword((prev) => !prev),
    onSubmit,
    isSubmitting: loginMutation.isPending,
    submitError,
  };
}

export type UseLoginFormResult = ReturnType<typeof useLoginForm>;
