/**
 * Funciones de ayuda para operaciones con Tenant.
 * 
 * Este archivo actúa como wrapper sobre los modelos de /estructura/
 * para mantener compatibilidad con el código existente.
 */

import Tenant, { type TenantSettings, type BusinessType } from '@/estructura/Tenant';

/**
 * Datos para crear un tenant y usuario.
 */
interface CreateTenantAndUserData {
  userId: string;
  email: string;
  displayName: string;
  businessName: string;
  businessType?: BusinessType;
}

/**
 * Crea un tenant y su usuario owner.
 * Si el usuario ya existe, retorna los datos existentes.
 * 
 * @param data - Datos del usuario y negocio
 * @returns Objeto con tenantId y userId
 */
export async function createTenantAndUser(data: CreateTenantAndUserData): Promise<{
  tenantId: string;
  userId: string;
  isNewUser: boolean;
}> {
  console.log('📦 createTenantAndUser wrapper called');
  
  const result = await Tenant.createWithOwner({
    userId: data.userId,
    email: data.email,
    displayName: data.displayName,
    businessName: data.businessName,
    businessType: data.businessType,
  });

  // Determinar si es un usuario nuevo basado en si el tenant ya existía
  const isNewUser = result.usuario.createdAt.getTime() > Date.now() - 5000; // Creado hace menos de 5 segundos

  return {
    tenantId: result.tenant.docId,
    userId: result.usuario.docId,
    isNewUser,
  };
}

/**
 * Actualiza la configuración de un tenant.
 * 
 * @param tenantId - ID del tenant a actualizar
 * @param updates - Campos a actualizar en settings
 */
export async function updateTenant(
  tenantId: string,
  updates: Partial<TenantSettings>
): Promise<void> {
  console.log('📦 updateTenant wrapper called for:', tenantId);
  
  const tenant = await Tenant.getById(tenantId);
  
  if (!tenant) {
    throw new Error(`Tenant not found: ${tenantId}`);
  }

  // Actualizar settings
  tenant.updateSettings(updates);
  
  // Guardar cambios
  await tenant.save();
  
  console.log('✅ Tenant updated successfully');
}

/**
 * Obtiene un tenant por su ID.
 * 
 * @param tenantId - ID del tenant
 * @returns Instancia de Tenant o null
 */
export async function getTenant(tenantId: string): Promise<Tenant | null> {
  return await Tenant.getById(tenantId);
}

/**
 * Obtiene el tenant de un usuario por su ownerId.
 * 
 * @param ownerId - UID del owner
 * @returns Instancia de Tenant o null
 */
export async function getTenantByOwner(ownerId: string): Promise<Tenant | null> {
  return await Tenant.getByOwnerId(ownerId);
}
