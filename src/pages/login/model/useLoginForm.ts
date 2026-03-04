import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { appRoutes } from "@/shared/constants/routes";
import { LOGIN_ENDPOINT, loginSchema, type LoginFormValues } from "./login.schema";

export function useLoginForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

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
        body,
      });
      await new Promise((resolve) => setTimeout(resolve, 700));
      return { ok: true };
    },
    onSuccess: () => {
      navigate(appRoutes.dashboard);
    },
  });

  const onSubmit = form.handleSubmit((values) => loginMutation.mutate(values));

  return {
    ...form,
    showPassword,
    togglePasswordVisibility: () => setShowPassword((prev) => !prev),
    onSubmit,
    isSubmitting: loginMutation.isPending,
  };
}

export type UseLoginFormResult = ReturnType<typeof useLoginForm>;
