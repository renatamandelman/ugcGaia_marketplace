"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type UserRole = "creator" | "brand";

export interface AuthState {
  error?: string;
  success?: string;
}

export async function signUp(prev: AuthState, formData: FormData) {
  const supabase = await createClient();

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "");
  const role = String(formData.get("role") ?? "creator") as UserRole;

  if (!email || !password || !fullName) {
    return { error: "Completá todos los campos." };
  }

  // Campos específicos de marca (industria requerida, sitio web opcional)
  const industry = role === "brand" ? String(formData.get("industry") ?? "") : "";
  const website = role === "brand" ? String(formData.get("website") ?? "") : "";

  if (role === "brand" && !industry) {
    return { error: "Indicá la industria de tu marca." };
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
        full_name: fullName,
        ...(industry ? { industry } : {}),
        ...(website ? { website } : {}),
      },
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Si el email no requiere confirmación, ya tenés sesión
  if (data.session) {
    redirect(role === "brand" ? "/profile" : "/dashboard");
  }

  return {
    success:
      "Revisá tu casilla de email para confirmar la cuenta. Cuando confirmes, podés ingresar.",
  };
}

export async function signIn(prev: AuthState, formData: FormData) {
  const supabase = await createClient();

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Completá email y contraseña." };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Email o contraseña incorrectos." };
  }

  const role = (data.user?.user_metadata?.role as string) ?? "creator";
  redirect(role === "brand" ? "/profile" : "/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
