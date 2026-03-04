import { z } from "zod";

export const LOGIN_ENDPOINT = "/api/v1/auth/login";

export const loginSchema = z.object({
  identity: z
    .string()
    .trim()
    .min(1, "Please enter your email.")
    .pipe(z.email("Email format is not valid.")),
  password: z
    .string()
    .min(1, "Please enter your password.")
    .min(6, "Password must have at least 6 characters."),
  rememberMe: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
