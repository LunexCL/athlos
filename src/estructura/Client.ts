import { QueryDocumentSnapshot, DocumentData, Timestamp } from 'firebase/firestore';
import SubCollectionModel from './SubCollectionModel';

/**
 * Estado del cliente.
 */
export type ClientStatus = 'active' | 'invited' | 'inactive';

/**
 * Clase Client que representa un cliente de un tenant.
 * 
 * Es una subcolección de tenants: tenants/{tenantId}/clients
 * 
 * @example
 * ```typescript
 * // Obtener todos los clientes de un tenant
 * const clients = await Client.getAll(tenantId);
 * 
 * // Crear nuevo cliente
 * const client = new Client(tenantId);
 * client.name = 'Juan Pérez';
 * client.email = 'juan@email.com';
 * await client.save();
 * 
 * // Listener en tiempo real
 * const unsubscribe = Client.onSnapshotOrdered(tenantId, 'createdAt', 'desc', (clients) => {
 *   console.log('Clientes actualizados:', clients);
 * });
 * ```
 */
export default class Client extends SubCollectionModel<Client> {
  
  static collectionName: string = 'clients';
  static collectionParentName: string = 'tenants';

  // Campos del cliente
  name: string = '';
  email: string = '';
  phone: string = '';
  notes: string = '';
  status: ClientStatus = 'active';
  invitedAt?: Date;
  acceptedAt?: Date;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  /**
   * Constructor del Cliente.
   * @param tenantId - ID del tenant al que pertenece el cliente.
   * @param docId - ID del documento (opcional, se genera automáticamente si no se proporciona).
   */
  constructor(tenantId: string, docId: string = '') {
    super(tenantId, docId);
  }

  // ============================================================================
  // MÉTODOS REQUERIDOS POR SubCollectionModel
  // ============================================================================

  /**
   * Convierte un documento de Firestore a instancia de Client.
   */
  fromFirestore(doc: QueryDocumentSnapshot<DocumentData>): Client {
    const data = doc.data();
    
    this.docId = doc.id;
    this.name = data.name || '';
    this.email = data.email || '';
    this.phone = data.phone || '';
    this.notes = data.notes || '';
    this.status = data.status || 'active';
    
    // Convertir Timestamps a Date
    this.invitedAt = data.invitedAt?.toDate?.();
    this.acceptedAt = data.acceptedAt?.toDate?.();
    this.createdAt = data.createdAt?.toDate?.() || new Date();
    this.updatedAt = data.updatedAt?.toDate?.() || new Date();
    
    return this;
  }

  /**
   * Convierte la instancia a objeto para Firestore.
   */
  toFirestore(): Record<string, any> {
    const data: Record<string, any> = {
      name: this.name,
      email: this.email,
      phone: this.phone,
      notes: this.notes,
      status: this.status,
      createdAt: Timestamp.fromDate(this.createdAt),
      updatedAt: Timestamp.fromDate(new Date()),
    };

    if (this.invitedAt) {
      data.invitedAt = Timestamp.fromDate(this.invitedAt);
    }
    if (this.acceptedAt) {
      data.acceptedAt = Timestamp.fromDate(this.acceptedAt);
    }

    return data;
  }

  // ============================================================================
  // MÉTODOS ESTÁTICOS DE BÚSQUEDA
  // ============================================================================

  /**
   * Busca un cliente por email dentro de un tenant.
   */
  static async getByEmail(tenantId: string, email: string): Promise<Client | null> {
    const clients = await Client.getAllWhere(tenantId, 'email', '==', email.toLowerCase());
    return clients.length > 0 ? clients[0] : null;
  }

  /**
   * Obtiene todos los clientes activos de un tenant.
   */
  static async getActiveClients(tenantId: string): Promise<Client[]> {
    return await Client.getAllWhere(tenantId, 'status', '==', 'active');
  }

  /**
   * Obtiene clientes por estado.
   */
  static async getByStatus(tenantId: string, status: ClientStatus): Promise<Client[]> {
    return await Client.getAllWhere(tenantId, 'status', '==', status);
  }

  // ============================================================================
  // MÉTODOS DE INSTANCIA
  // ============================================================================

  /**
   * Alias para parentId (el tenantId).
   */
  get tenantId(): string {
    return this.parentId;
  }

  /**
   * Verifica si el cliente está activo.
   */
  get isActive(): boolean {
    return this.status === 'active';
  }

  /**
   * Verifica si el cliente fue invitado pero no ha aceptado.
   */
  get isPending(): boolean {
    return this.status === 'invited';
  }

  /**
   * Activa el cliente.
   */
  activate(): void {
    this.status = 'active';
    this.acceptedAt = new Date();
  }

  /**
   * Desactiva el cliente.
   */
  deactivate(): void {
    this.status = 'inactive';
  }

  /**
   * Marca como invitado.
   */
  invite(): void {
    this.status = 'invited';
    this.invitedAt = new Date();
  }
}
