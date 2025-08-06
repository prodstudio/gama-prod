'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { PlatoFormData } from '@/lib/validations/platos'

export async function getPlatos() {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('platos')
      .select('*')
      .eq('activo', true)
      .order('nombre')

    if (error) {
      console.error('Error fetching platos:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getPlatos:', error)
    return null
  }
}

export async function getPlato(id: string) {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('platos')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching plato:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getPlato:', error)
    return null
  }
}

export async function createPlato(formData: FormData) {
  try {
    const supabase = createClient()

    const platoData: PlatoFormData = {
      nombre: formData.get('nombre') as string,
      descripcion: formData.get('descripcion') as string,
      tipo: formData.get('tipo') as string,
      precio: parseFloat(formData.get('precio') as string),
      calorias: parseInt(formData.get('calorias') as string) || null,
      proteinas: parseFloat(formData.get('proteinas') as string) || null,
      carbohidratos: parseFloat(formData.get('carbohidratos') as string) || null,
      grasas: parseFloat(formData.get('grasas') as string) || null,
      fibra: parseFloat(formData.get('fibra') as string) || null,
      sodio: parseFloat(formData.get('sodio') as string) || null,
      azucar: parseFloat(formData.get('azucar') as string) || null,
      ingredientes: formData.get('ingredientes') as string,
      alergenos: formData.get('alergenos') as string,
      imagen_url: formData.get('imagen_url') as string,
      activo: true,
    }

    const { data, error } = await supabase
      .from('platos')
      .insert(platoData)
      .select()
      .single()

    if (error) {
      console.error('Error creating plato:', error)
      return { success: false, error: 'Error al crear el plato' }
    }

    revalidatePath('/gama/platos')
    return { success: true, data }
  } catch (error) {
    console.error('Error in createPlato:', error)
    return { success: false, error: 'Error inesperado al crear el plato' }
  }
}

export async function updatePlato(id: string, formData: FormData) {
  try {
    const supabase = createClient()

    const platoData: Partial<PlatoFormData> = {
      nombre: formData.get('nombre') as string,
      descripcion: formData.get('descripcion') as string,
      tipo: formData.get('tipo') as string,
      precio: parseFloat(formData.get('precio') as string),
      calorias: parseInt(formData.get('calorias') as string) || null,
      proteinas: parseFloat(formData.get('proteinas') as string) || null,
      carbohidratos: parseFloat(formData.get('carbohidratos') as string) || null,
      grasas: parseFloat(formData.get('grasas') as string) || null,
      fibra: parseFloat(formData.get('fibra') as string) || null,
      sodio: parseFloat(formData.get('sodio') as string) || null,
      azucar: parseFloat(formData.get('azucar') as string) || null,
      ingredientes: formData.get('ingredientes') as string,
      alergenos: formData.get('alergenos') as string,
      imagen_url: formData.get('imagen_url') as string,
    }

    const { data, error } = await supabase
      .from('platos')
      .update(platoData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating plato:', error)
      return { success: false, error: 'Error al actualizar el plato' }
    }

    revalidatePath('/gama/platos')
    return { success: true, data }
  } catch (error) {
    console.error('Error in updatePlato:', error)
    return { success: false, error: 'Error inesperado al actualizar el plato' }
  }
}

export async function deletePlato(id: string) {
  try {
    const supabase = createClient()

    // Soft delete - marcar como inactivo
    const { error } = await supabase
      .from('platos')
      .update({ activo: false })
      .eq('id', id)

    if (error) {
      console.error('Error deleting plato:', error)
      return { success: false, error: 'Error al eliminar el plato' }
    }

    revalidatePath('/gama/platos')
    return { success: true }
  } catch (error) {
    console.error('Error in deletePlato:', error)
    return { success: false, error: 'Error inesperado al eliminar el plato' }
  }
}

// Alias exports for compatibility
export const createPlatoAction = createPlato
export const updatePlatoAction = updatePlato
