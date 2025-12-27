import { QueryDocumentSnapshot, DocumentData, Timestamp } from 'firebase/firestore';
import BaseModel from './BaseModel';

/**
 * Roles de usuario en el sistema.
 */
export enum UserRole {
  OWNER = 'owner',           // Dueño del tenant (profesor/instructor principal)
  INSTRUCTOR = 'instructor', // Instructor adicional en el tenant
  CLIENT = 'client',         // Cliente del tenant
  ADMIN = 'admin',           // Administrador del sistema
}

/**
 * Clase Usuario que representa a un usuario del sistema.
 * 
 * Extiende BaseModel para operaciones CRUD genéricas.
 * Usa la colección 'users' en Firestore.
 */
export default class Usuario extends BaseModel<Usuario> {
  
  static collectionName: string = 'users';

  // Campos del usuario
  uid: string = '';
  email: string = '';
  displayName: string = '';
  photoURL: string = '';
  phoneNumber: string = '';
  role: UserRole = UserRole.CLIENT;
  tenantId: string = '';
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
  emailVerified: boolean = false;
  isActive: boolean = true;

  /**
   * Constructor del Usuario.
   */
  constructor(docId: string = '') {
    super(docId);
  }

  // ============================================================================
  // MÉTODOS REQUERIDOS POR BaseModel
  // ============================================================================

  /**
   * Convierte un documento de Firestore a instancia de Usuario.
   */
  fromFirestore(doc: QueryDocumentSnapshot<DocumentData>): Usuario {
    const data = doc.data();
    
    this.docId = doc.id;
    this.uid = data.uid || doc.id;
    this.email = data.email || '';
    this.displayName = data.displayName || '';
    this.photoURL = data.photoURL || '';
    this.phoneNumber = data.phoneNumber || '';
    this.role = data.role || UserRole.CLIENT;
    this.tenantId = data.tenantId || '';
    this.emailVerified = data.emailVerified || false;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    
    // Convertir Timestamps a Date
    this.createdAt = data.createdAt?.toDate?.() || new Date();
    this.updatedAt = data.updatedAt?.toDate?.() || new Date();
    
    return this;
  }

  /**
   * Convierte la instancia a objeto para Firestore.
   */
  toFirestore(): Record<string, any> {
    return {
      uid: this.uid,
      email: this.email,
      displayName: this.displayName,
      photoURL: this.photoURL,
      phoneNumber: this.phoneNumber,
      role: this.role,
      tenantId: this.tenantId,
      emailVerified: this.emailVerified,
      isActive: this.isActive,
      createdAt: Timestamp.fromDate(this.createdAt),
      updatedAt: Timestamp.fromDate(new Date()),
    };
  }

  // ============================================================================
  // MÉTODOS ESTÁTICOS DE BÚSQUEDA
  // ============================================================================

  /**
   * Busca un usuario por su UID de Firebase Auth.
   */
  static async getByUid(uid: string): Promise<Usuario | null> {
    const usuarios = await Usuario.getAllWhere('uid', '==', uid);
    return usuarios.length > 0 ? usuarios[0] : null;
  }

  /**
   * Busca un usuario por su email.
   */
  static async getByEmail(email: string): Promise<Usuario | null> {
    const usuarios = await Usuario.getAllWhere('email', '==', email.toLowerCase());
    return usuarios.length > 0 ? usuarios[0] : null;
  }

  /**
   * Obtiene todos los usuarios de un tenant.
   */
  static async getByTenantId(tenantId: string): Promise<Usuario[]> {
    return await Usuario.getAllWhere('tenantId', '==', tenantId);
  }

  /**
   * Obtiene todos los usuarios activos.
   */
  static async getActiveUsers(): Promise<Usuario[]> {
    return await Usuario.getAllWhere('isActive', '==', true);
  }

  // ============================================================================
  // MÉTODOS DE INSTANCIA
  // ============================================================================

  /**
   * Nombre completo para mostrar.
   */
  get nombreCompleto(): string {
    return this.displayName || this.email;
  }

  /**
   * Verifica si el usuario es owner del tenant.
   */
  get isOwner(): boolean {
    return this.role === UserRole.OWNER;
  }

  /**
   * Verifica si el usuario es instructor.
   */
  get isInstructor(): boolean {
    return this.role === UserRole.INSTRUCTOR || this.role === UserRole.OWNER;
  }

  /**
   * Verifica si el usuario es admin del sistema.
   */
  get isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }
}
