"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabaseBrowser } from "@/lib/supabase/client";

const loginSchema = z.object({
  email: z.string().email("Informe um e-mail válido."),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
});

const signupSchema = loginSchema.extend({
  fullName: z.string().min(2, "Informe seu nome completo."),
});

type AuthFormProps = {
  variant: "login" | "signup";
};

function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabaseBrowser.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm text-slate-300">
          E-mail
        </label>
        <Input
          id="email"
          type="email"
          {...form.register("email")}
          placeholder="seu@email.com"
          autoComplete="email"
        />
        {form.formState.errors.email && (
          <p className="text-xs text-red-400">{form.formState.errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm text-slate-300">
          Senha
        </label>
        <Input
          id="password"
          type="password"
          {...form.register("password")}
          placeholder="••••••••"
          autoComplete="current-password"
        />
        {form.formState.errors.password && (
          <p className="text-xs text-red-400">{form.formState.errors.password.message}</p>
        )}
      </div>

      {message && <p className="text-sm text-brand-300">{message}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Aguarde..." : "Entrar"}
      </Button>
    </form>
  );
}

function SignupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "", fullName: "" },
  });

  async function onSubmit(values: z.infer<typeof signupSchema>) {
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabaseBrowser.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
          },
        },
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage("Cadastro realizado! Verifique seu e-mail para confirmar a conta.");
      form.reset();
      router.push("/auth/confirm");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="fullName" className="text-sm text-slate-300">
          Nome completo
        </label>
        <Input
          id="fullName"
          {...form.register("fullName")}
          placeholder="Seu nome"
          autoComplete="name"
        />
        {form.formState.errors.fullName && (
          <p className="text-xs text-red-400">{form.formState.errors.fullName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm text-slate-300">
          E-mail
        </label>
        <Input
          id="email"
          type="email"
          {...form.register("email")}
          placeholder="seu@email.com"
          autoComplete="email"
        />
        {form.formState.errors.email && (
          <p className="text-xs text-red-400">{form.formState.errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm text-slate-300">
          Senha
        </label>
        <Input
          id="password"
          type="password"
          {...form.register("password")}
          placeholder="••••••••"
          autoComplete="new-password"
        />
        {form.formState.errors.password && (
          <p className="text-xs text-red-400">{form.formState.errors.password.message}</p>
        )}
      </div>

      {message && <p className="text-sm text-brand-300">{message}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Aguarde..." : "Criar conta"}
      </Button>
    </form>
  );
}

export function AuthForm({ variant }: AuthFormProps) {
  return variant === "login" ? <LoginForm /> : <SignupForm />;
}
