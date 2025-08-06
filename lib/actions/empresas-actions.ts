"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { empresaSchema, sucursalSchema } from "@/lib/validations/empresas"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createEmpresaAction(formData: FormData) {
  // TODO: Cuando reactivemos auth, validar que user.role === 'gama_admin'

  console.log("=== CREATE EMPRESA ACTION ===")
  console.log("FormData entries:", Array.from(formData.entries()))

  const rawData = {
    nombre: (formData.get("nombre") as string)?.trim() || "",
    email_contacto: (formData.get("email_contacto") as string)?.trim() || "",
    telefono: (formData.get("telefono") as string)?.trim() || "",
    direccion: (formData.get("direccion") as string)?.trim() || "",
    plan_id: (formData.get("plan_id") as string)?.trim() || "",
    descuento_porcentaje: Number.parseFloat((formData.get("descuento_porcentaje") as string) || "0"),
    activa: formData.get("activa") !== "false",
  }

  console.log("Raw data:", rawData)

  // Validar datos de empresa
  const validatedFields = empresaSchema.safeParse(rawData)

  if (!validatedFields.success) {
    console.error("Validation errors:", validatedFields.error.flatten())
    return {
      error: "Datos inválidos",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    }
  }

  console.log("Validated data:", validatedFields.data)

  // Limpiar campos vacíos - convertir strings vacíos a null
  const cleanData = {
    nombre: validatedFields.data.nombre,
    email_contacto: validatedFields.data.email_contacto || null,
    telefono: validatedFields.data.telefono || null,
    direccion: validatedFields.data.direccion || null,
    plan_id: validatedFields.data.plan_id || null,
    descuento_porcentaje: validatedFields.data.descuento_porcentaje || 0,
    activa: validatedFields.data.activa,
  }

  console.log("Clean data for insert:", cleanData)

  // Crear empresa
  const { data: empresaData, error: empresaError } = await supabaseAdmin
    .from("empresas")
    .insert(cleanData)
    .select()
    .single()

  if (empresaError) {
    console.error("Supabase error creating empresa:", empresaError)
    return {
      error: `Error al crear la empresa: ${empresaError.message}`,
    }
  }

  console.log("Empresa created successfully:", empresaData)

  // Procesar sucursales si existen
  const sucursalesData = formData.get("sucursales") as string
  if (sucursalesData) {
    try {
      const sucursales = JSON.parse(sucursalesData)
      console.log("Sucursales to create:", sucursales)

      for (const sucursal of sucursales) {
        const sucursalToInsert = {
          nombre: sucursal.nombre,
          direccion: sucursal.direccion,
          telefono: sucursal.responsable_telefono || null,
          responsable_nombre: sucursal.responsable_nombre,
          responsable_telefono: sucursal.responsable_telefono || null,
          dias_entrega: sucursal.dias_entrega,
          empresa_id: empresaData.id,
          activa: true,
        }

        const { error: sucursalError } = await supabaseAdmin.from("sucursales").insert(sucursalToInsert)

        if (sucursalError) {
          console.error("Error creating sucursal:", sucursalError)
          // Continuar con las demás sucursales aunque una falle
        }
      }
    } catch (error) {
      console.error("Error parsing sucursales data:", error)
    }
  }

  revalidatePath("/gama/empresas")
  redirect("/gama/empresas")
}

export async function updateEmpresaAction(id: string, formData: FormData) {
  // TODO: Cuando reactivemos auth, validar que user.role === 'gama_admin'

  const rawData = {
    nombre: (formData.get("nombre") as string)?.trim() || "",
    email_contacto: (formData.get("email_contacto") as string)?.trim() || "",
    telefono: (formData.get("telefono") as string)?.trim() || "",
    direccion: (formData.get("direccion") as string)?.trim() || "",
    plan_id: (formData.get("plan_id") as string)?.trim() || "",
    descuento_porcentaje: Number.parseFloat((formData.get("descuento_porcentaje") as string) || "0"),
    activa: formData.get("activa") !== "false",
  }

  const validatedFields = empresaSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      error: "Datos inválidos",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const cleanData = {
    nombre: validatedFields.data.nombre,
    email_contacto: validatedFields.data.email_contacto || null,
    telefono: validatedFields.data.telefono || null,
    direccion: validatedFields.data.direccion || null,
    plan_id: validatedFields.data.plan_id || null,
    descuento_porcentaje: validatedFields.data.descuento_porcentaje || 0,
    activa: validatedFields.data.activa,
  }

  const { data, error } = await supabaseAdmin.from("empresas").update(cleanData).eq("id", id).select()

  if (error) {
    console.error("Error updating empresa:", error)
    return {
      error: `Error al actualizar la empresa: ${error.message}`,
    }
  }

  revalidatePath("/gama/empresas")
  revalidatePath(`/gama/empresas/${id}`)
  redirect("/gama/empresas")
}

export async function deleteEmpresaAction(id: string) {
  // TODO: Cuando reactivemos auth, validar que user.role === 'gama_admin'

  // Verificar si la empresa tiene usuarios asociados
  const { data: usuariosAsociados } = await supabaseAdmin.from("users").select("id").eq("empresa_id", id).limit(1)

  if (usuariosAsociados && usuariosAsociados.length > 0) {
    return {
      error: "No se puede eliminar la empresa porque tiene usuarios asociados.",
    }
  }

  // Verificar si la empresa tiene pedidos a través de sus sucursales
  const { data: sucursales } = await supabaseAdmin.from("sucursales").select("id").eq("empresa_id", id)

  if (sucursales && sucursales.length > 0) {
    const sucursalIds = sucursales.map((s) => s.id)
    const { data: pedidosAsociados } = await supabaseAdmin
      .from("pedidos")
      .select("id")
      .in("sucursal_id", sucursalIds)
      .limit(1)

    if (pedidosAsociados && pedidosAsociados.length > 0) {
      return {
        error: "No se puede eliminar la empresa porque tiene pedidos asociados.",
      }
    }
  }

  const { error } = await supabaseAdmin.from("empresas").delete().eq("id", id)

  if (error) {
    console.error("Error deleting empresa:", error)
    return {
      error: "Error al eliminar la empresa. Intenta nuevamente.",
    }
  }

  revalidatePath("/gama/empresas")
  return { success: true }
}

// Actions para sucursales
export async function createSucursalAction(empresaId: string, formData: FormData) {
  // TODO: Cuando reactivemos auth, validar permisos

  const rawData = {
    nombre: (formData.get("nombre") as string)?.trim() || "",
    direccion: (formData.get("direccion") as string)?.trim() || "",
    telefono: (formData.get("telefono") as string)?.trim() || "",
    responsable_nombre: (formData.get("responsable_nombre") as string)?.trim() || "",
    responsable_telefono: (formData.get("responsable_telefono") as string)?.trim() || "",
    dias_entrega: JSON.parse((formData.get("dias_entrega") as string) || "[1,2,3,4,5]"),
    activa: formData.get("activa") !== "false",
  }

  const validatedFields = sucursalSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      error: "Datos inválidos",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const sucursalData = {
    nombre: validatedFields.data.nombre,
    direccion: validatedFields.data.direccion,
    telefono: validatedFields.data.telefono || null,
    responsable_nombre: validatedFields.data.responsable_nombre,
    responsable_telefono: validatedFields.data.responsable_telefono || null,
    dias_entrega: validatedFields.data.dias_entrega,
    empresa_id: empresaId,
    activa: validatedFields.data.activa,
  }

  const { data, error } = await supabaseAdmin.from("sucursales").insert(sucursalData).select()

  if (error) {
    console.error("Error creating sucursal:", error)
    return {
      error: "Error al crear la sucursal. Intenta nuevamente.",
    }
  }

  revalidatePath(`/gama/empresas/${empresaId}`)
  return { success: true, data: data[0] }
}

export async function updateSucursalAction(id: string, formData: FormData) {
  // TODO: Cuando reactivemos auth, validar permisos

  const rawData = {
    nombre: (formData.get("nombre") as string)?.trim() || "",
    direccion: (formData.get("direccion") as string)?.trim() || "",
    telefono: (formData.get("telefono") as string)?.trim() || "",
    responsable_nombre: (formData.get("responsable_nombre") as string)?.trim() || "",
    responsable_telefono: (formData.get("responsable_telefono") as string)?.trim() || "",
    dias_entrega: JSON.parse((formData.get("dias_entrega") as string) || "[1,2,3,4,5]"),
    activa: formData.get("activa") !== "false",
  }

  const validatedFields = sucursalSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      error: "Datos inválidos",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const cleanData = {
    nombre: validatedFields.data.nombre,
    direccion: validatedFields.data.direccion,
    telefono: validatedFields.data.telefono || null,
    responsable_nombre: validatedFields.data.responsable_nombre,
    responsable_telefono: validatedFields.data.responsable_telefono || null,
    dias_entrega: validatedFields.data.dias_entrega,
    activa: validatedFields.data.activa,
  }

  const { data, error } = await supabaseAdmin.from("sucursales").update(cleanData).eq("id", id).select()

  if (error) {
    console.error("Error updating sucursal:", error)
    return {
      error: "Error al actualizar la sucursal. Intenta nuevamente.",
    }
  }

  // Obtener empresa_id para revalidar
  const { data: sucursal } = await supabaseAdmin.from("sucursales").select("empresa_id").eq("id", id).single()

  if (sucursal) {
    revalidatePath(`/gama/empresas/${sucursal.empresa_id}`)
  }

  return { success: true, data: data[0] }
}

export async function deleteSucursalAction(id: string) {
  // TODO: Cuando reactivemos auth, validar permisos

  // Verificar si la sucursal tiene pedidos
  const { data: pedidosAsociados } = await supabaseAdmin.from("pedidos").select("id").eq("sucursal_id", id).limit(1)

  if (pedidosAsociados && pedidosAsociados.length > 0) {
    return {
      error: "No se puede eliminar la sucursal porque tiene pedidos asociados.",
    }
  }

  // Obtener empresa_id antes de eliminar
  const { data: sucursal } = await supabaseAdmin.from("sucursales").select("empresa_id").eq("id", id).single()

  const { error } = await supabaseAdmin.from("sucursales").delete().eq("id", id)

  if (error) {
    console.error("Error deleting sucursal:", error)
    return {
      error: "Error al eliminar la sucursal. Intenta nuevamente.",
    }
  }

  if (sucursal) {
    revalidatePath(`/gama/empresas/${sucursal.empresa_id}`)
  }

  return { success: true }
}
