"use server"

import { createServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { z } from "zod"

// Esquemas de validación
const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

const signupSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  apellido: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  role: z.enum(["gama_admin", "empresa_admin", "empleado"]),
  empresa_id: z.string().uuid().optional(),
})

const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
})

export async function loginAction(formData: FormData) {
  const supabase = createServerClient() // Cliente normal para el login

  // Validar datos
  const validatedFields = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!validatedFields.success) {
    return { error: "Datos inválidos" }
  }

  const { email, password } = validatedFields.data

  // 1. Autenticar al usuario con el cliente normal
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError) {
    return { error: "Credenciales inválidas. Por favor, verifica tu email y contraseña." }
  }

  // 2. Usar el cliente de ADMINISTRADOR para buscar el perfil, saltando RLS
  const { data: userProfile, error: profileError } = await supabaseAdmin
    .from("users")
    .select("role, activo")
    .eq("id", authData.user.id)
    .single() // .single() es seguro aquí porque el admin puede leer todo

  if (profileError || !userProfile) {
    // Si aún no se encuentra, el problema es de datos, no de permisos.
    await supabase.auth.signOut()
    return { error: "Perfil de usuario no encontrado. Por favor, contacta al administrador." }
  }

  if (!userProfile.activo) {
    await supabase.auth.signOut()
    return { error: "Tu cuenta está inactiva. Por favor, contacta al administrador." }
  }

  // ¡CAMBIO CLAVE! En lugar de redirigir, devolvemos un objeto de éxito.
  return {
    success: true,
    redirectTo: getDefaultRouteForRole(userProfile.role),
  }
}

export async function signupAction(formData: FormData) {
  const supabase = createServerClient()

  // Validar datos
  const validatedFields = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    nombre: formData.get("nombre"),
    apellido: formData.get("apellido"),
    role: formData.get("role"),
    empresa_id: formData.get("empresa_id") || undefined,
  })

  if (!validatedFields.success) {
    return {
      error: "Datos inválidos",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password, nombre, apellido, role, empresa_id } = validatedFields.data

  // Crear usuario en Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return {
      error: error.message,
    }
  }

  if (!data.user) {
    return {
      error: "Error al crear usuario",
    }
  }

  // Crear perfil en la tabla users
  const { error: profileError } = await supabase.from("users").insert({
    id: data.user.id,
    email,
    nombre,
    apellido,
    role,
    empresa_id,
    activo: true,
  })

  if (profileError) {
    // Si falla la creación del perfil, eliminar el usuario de auth
    await supabase.auth.admin.deleteUser(data.user.id)
    return {
      error: "Error al crear perfil de usuario",
    }
  }

  return {
    success: true,
    message: "Usuario creado exitosamente. Revisa tu email para confirmar tu cuenta.",
  }
}

export async function forgotPasswordAction(formData: FormData) {
  const supabase = createServerClient()

  // Validar datos
  const validatedFields = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  })

  if (!validatedFields.success) {
    return {
      error: "Email inválido",
    }
  }

  const { email } = validatedFields.data

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  })

  if (error) {
    return {
      error: "Error al enviar email de recuperación",
    }
  }

  return {
    success: true,
    message: "Se ha enviado un email con instrucciones para restablecer tu contraseña.",
  }
}

export async function signOutAction() {
  const supabase = createServerClient()
  await supabase.auth.signOut()
  redirect("/login")
}

function getDefaultRouteForRole(role: string): string {
  switch (role) {
    case "gama_admin":
      return "/gama/dashboard"
    case "empresa_admin":
      return "/empresa/dashboard"
    case "empleado":
      return "/empleado/menu"
    default:
      return "/login"
  }
}
