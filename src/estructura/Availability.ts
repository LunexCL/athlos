import { QueryDocumentSnapshot, DocumentData, Timestamp } from 'firebase/firestore';
import SubCollectionModel from './SubCollectionModel';

// Tipos
export type PriceType = 'low' | 'high';

/**
 * Modelo Availability - Disponibilidad horaria del tenant
 * Subcolección: tenants/{tenantId}/availability
 */
export default class Availability extends SubCollectionModel<Availability> {
  static collectionName = 'availability';
  static collectionParentName = 'tenants';

  // Propiedades
  dayOfWeek: number = 0; // 0-6 (Domingo-Sábado)
  startTime: string = ''; // HH:mm format
  endTime: string = ''; // HH:mm format
  duration: number = 60; // minutos
  priceType: PriceType | null = null;
  isActive: boolean = true;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  constructor(tenantId: string, docId: string = '') {
    super(tenantId, docId);
  }

  // ============ MÉTODOS REQUERIDOS POR SubCollectionModel ============

  fromFirestore(doc: QueryDocumentSnapshot<DocumentData>): Availability {
    const data = doc.data();
    
    this.docId = doc.id;
    this.dayOfWeek = data.dayOfWeek ?? 0;
    this.startTime = data.startTime || '';
    this.endTime = data.endTime || '';
    this.duration = data.duration || 60;
    this.priceType = data.priceType || null;
    this.isActive = data.isActive !== false;
    this.createdAt = data.createdAt?.toDate?.() || new Date();
    this.updatedAt = data.updatedAt?.toDate?.() || new Date();
    
    return this;
  }

  toFirestore(): Record<string, any> {
    return {
      dayOfWeek: this.dayOfWeek,
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.duration,
      priceType: this.priceType,
      isActive: this.isActive,
      createdAt: Timestamp.fromDate(this.createdAt),
      updatedAt: Timestamp.fromDate(new Date()),
    };
  }

  // ============ GETTERS PARA TIMESTAMPS ============

  get timestampCreatedAt(): Timestamp {
    return Timestamp.fromDate(this.createdAt);
  }

  get timestampUpdatedAt(): Timestamp {
    return Timestamp.fromDate(this.updatedAt);
  }

  // ============ MÉTODOS ESTÁTICOS ============

  /**
   * Obtiene disponibilidades activas
   */
  static async getActive(tenantId: string): Promise<Availability[]> {
    return Availability.getAllWhere(tenantId, 'isActive', '==', true);
  }

  /**
   * Obtiene disponibilidades por día de la semana
   */
  static async getByDayOfWeek(tenantId: string, dayOfWeek: number): Promise<Availability[]> {
    return Availability.getAllWhere(tenantId, 'dayOfWeek', '==', dayOfWeek);
  }

  /**
   * Listener ordenado por día de la semana
   */
  static onSnapshotByDayOrder(
    tenantId: string,
    callback: (items: Availability[]) => void
  ): () => void {
    return Availability.onSnapshotOrdered(tenantId, 'dayOfWeek', 'asc', callback);
  }

  // ============ GETTERS DE CONVENIENCIA ============

  get id(): string {
    return this.docId;
  }

  get tenantId(): string {
    return this.parentId;
  }

  get dayName(): string {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[this.dayOfWeek] || '';
  }

  get dayNameShort(): string {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return days[this.dayOfWeek] || '';
  }

  get isHighPrice(): boolean {
    return this.priceType === 'high';
  }

  get isLowPrice(): boolean {
    return this.priceType === 'low';
  }

  get timeRange(): string {
    return `${this.startTime} - ${this.endTime}`;
  }

  // ============ MÉTODOS DE INSTANCIA ============

  /**
   * Activa la disponibilidad
   */
  activate(): void {
    this.isActive = true;
  }

  /**
   * Desactiva la disponibilidad
   */
  deactivate(): void {
    this.isActive = false;
  }

  /**
   * Verifica si un horario cae dentro de esta disponibilidad
   */
  containsTimeSlot(startTime: string, endTime: string): boolean {
    return startTime >= this.startTime && endTime <= this.endTime;
  }

  /**
   * Verifica si hay solapamiento con otro bloque de tiempo
   */
  overlaps(startTime: string, endTime: string): boolean {
    return !(endTime <= this.startTime || startTime >= this.endTime);
  }
}
