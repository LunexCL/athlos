import { QueryDocumentSnapshot, DocumentData, Timestamp } from 'firebase/firestore';
import BaseModel from './BaseModel';
import Usuario, { UserRole } from './Usuario';
import type { SportType } from '@/app/shared/types/sports';

/**
 * Tipos de plan del tenant.
 */
export enum TenantPlan {
  FREE = 'free',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

/**
 * Tipo de negocio - usa SportType para compatibilidad.
 */
export type BusinessType = SportType;

/**
 * Configuración de features del tenant.
 */
export interface TenantFeatures {
  calendar?: boolean;
  payments?: boolean;
  routines?: boolean;
  activities?: boolean;
}

/**
 * Configuración del tenant.
 */
export interface TenantSettings {
  businessName?: string;
  businessType?: BusinessType;
  address?: string;
  phone?: string;
  website?: string;
  logo?: string;
  timezone?: string;
  currency?: 'CLP' | 'USD';
  sports?: string[];
  onboardingCompleted?: boolean;
  features?: TenantFeatures;
}

/**
 * Clase Tenant que representa un negocio/organización en el sistema.
 * 
 * Extiende BaseModel para operaciones CRUD genéricas.
 * Usa la colección 'tenants' en Firestore.
 */
export default class Tenant extends BaseModel<Tenant> {
  
  static collectionName: string = 'tenants';

  // Campos del tenant
  name: string = '';
  ownerId: string = '';
  plan: TenantPlan = TenantPlan.FREE;
  settings: TenantSettings = {};
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
  isActive: boolean = true;
  subscriptionEndDate?: Date;
  trialEndDate?: Date;

  /**
   * Constructor del Tenant.
   */
  constructor(docId: string = '') {
    super(docId);
  }

  // ============================================================================
  // MÉTODOS REQUERIDOS POR BaseModel
  // ============================================================================

  /**
   * Convierte un documento de Firestore a instancia de Tenant.
   */
  fromFirestore(doc: QueryDocumentSnapshot<DocumentData>): Tenant {
    const data = doc.data();
    
    this.docId = doc.id;
    this.name = data.name || '';
    this.ownerId = data.ownerId || '';
    this.plan = data.plan || TenantPlan.FREE;
    this.settings = data.settings || {};
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    
    // Convertir Timestamps a Date
    this.createdAt = data.createdAt?.toDate?.() || new Date();
    this.updatedAt = data.updatedAt?.toDate?.() || new Date();
    this.subscriptionEndDate = data.subscriptionEndDate?.toDate?.();
    this.trialEndDate = data.trialEndDate?.toDate?.();
    
    return this;
  }

  /**
   * Convierte la instancia a objeto para Firestore.
   */
  toFirestore(): Record<string, any> {
    const data: Record<string, any> = {
      name: this.name,
      ownerId: this.ownerId,
      plan: this.plan,
      settings: this.settings,
      isActive: this.isActive,
      createdAt: Timestamp.fromDate(this.createdAt),
      updatedAt: Timestamp.fromDate(new Date()),
    };

    if (this.subscriptionEndDate) {
      data.subscriptionEndDate = Timestamp.fromDate(this.subscriptionEndDate);
    }
    if (this.trialEndDate) {
      data.trialEndDate = Timestamp.fromDate(this.trialEndDate);
    }

    return data;
  }

  // ============================================================================
  // MÉTODOS ESTÁTICOS DE BÚSQUEDA
  // ============================================================================

  /**
   * Busca un tenant por su owner (dueño).
   */
  static async getByOwnerId(ownerId: string): Promise<Tenant | null> {
    const tenants = await Tenant.getAllWhere('ownerId', '==', ownerId);
    return tenants.length > 0 ? tenants[0] : null;
  }

  /**
   * Obtiene todos los tenants activos.
   */
  static async getActiveTenants(): Promise<Tenant[]> {
    return await Tenant.getAllWhere('isActive', '==', true);
  }

  /**
   * Obtiene tenants por plan.
   */
  static async getByPlan(plan: TenantPlan): Promise<Tenant[]> {
    return await Tenant.getAllWhere('plan', '==', plan);
  }

  // ============================================================================
  // MÉTODOS DE INSTANCIA
  // ============================================================================

  /**
   * Alias para docId (compatibilidad con código anterior).
   */
  get id(): string {
    return this.docId;
  }

  /**
   * Nombre del negocio para mostrar.
   */
  get businessName(): string {
    return this.settings.businessName || this.name;
  }

  /**
   * Verifica si el onboarding está completado.
   */
  get onboardingCompleted(): boolean {
    return this.settings.onboardingCompleted || false;
  }

  /**
   * Verifica si el tenant tiene plan pro o superior.
   */
  get isPro(): boolean {
    return this.plan === TenantPlan.PRO || this.plan === TenantPlan.ENTERPRISE;
  }

  /**
   * Verifica si el tenant tiene plan enterprise.
   */
  get isEnterprise(): boolean {
    return this.plan === TenantPlan.ENTERPRISE;
  }

  /**
   * Verifica si el trial ha expirado.
   */
  get isTrialExpired(): boolean {
    if (!this.trialEndDate) return false;
    return new Date() > this.trialEndDate;
  }

  /**
   * Verifica si la suscripción ha expirado.
   */
  get isSubscriptionExpired(): boolean {
    if (!this.subscriptionEndDate) return false;
    return new Date() > this.subscriptionEndDate;
  }

  /**
   * Actualiza la configuración del tenant.
   */
  updateSettings(newSettings: Partial<TenantSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  // ============================================================================
  // MÉTODOS ESTÁTICOS DE CREACIÓN
  // ============================================================================

  /**
   * Datos para crear un tenant con su owner.
   */
  static async createWithOwner(data: {
    userId: string;
    email: string;
    displayName: string;
    businessName: string;
    businessType?: BusinessType;
  }): Promise<{ tenant: Tenant; usuario: Usuario }> {
    console.log('🔥 Tenant.createWithOwner called with:', { userId: data.userId, email: data.email });

    try {
      // Verificar si el usuario ya existe
      const existingUser = await Usuario.getById(data.userId);
      if (existingUser) {
        console.log('✅ User already exists, loading existing tenant');
        const existingTenant = existingUser.tenantId 
          ? await Tenant.getById(existingUser.tenantId)
          : null;
        return { 
          tenant: existingTenant!, 
          usuario: existingUser 
        };
      }

      // Crear nuevo tenant
      console.log('🏢 Creating tenant...');
      const tenant = new Tenant();
      tenant.name = data.businessName;
      tenant.ownerId = data.userId;
      tenant.plan = TenantPlan.FREE;
      tenant.settings = {
        businessName: data.businessName,
        businessType: data.businessType || 'other',
        timezone: 'America/Santiago',
        currency: 'CLP',
        features: {
          calendar: true,
          payments: true,
          routines: true,
          activities: true,
        },
      };
      tenant.isActive = true;
      await tenant.save();
      console.log(`✅ Tenant created with ID: ${tenant.docId}`);

      // Crear usuario owner
      console.log('👤 Creating user...');
      const usuario = new Usuario(data.userId);
      usuario.uid = data.userId;
      usuario.email = data.email;
      usuario.displayName = data.displayName;
      usuario.role = UserRole.OWNER;
      usuario.tenantId = tenant.docId;
      usuario.isActive = true;
      await usuario.save();
      console.log(`✅ User created for ${data.userId}`);

      console.log('🎉 Tenant and user creation completed!');
      return { tenant, usuario };
    } catch (error) {
      console.error('❌ Error creating tenant and user:', error);
      throw error;
    }
  }
}
