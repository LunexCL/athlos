import { QueryDocumentSnapshot, DocumentData, Timestamp } from 'firebase/firestore';
import SubCollectionModel from './SubCollectionModel';

// Tipos
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show' | 'pending';

/**
 * Modelo Appointment - Citas/Clases programadas
 * Subcolección: tenants/{tenantId}/appointments
 */
export default class Appointment extends SubCollectionModel<Appointment> {
  static collectionName = 'appointments';
  static collectionParentName = 'tenants';

  // Propiedades
  clientId: string = '';
  clientName: string = '';
  instructorId: string = '';
  sportType: string = '';
  date: string = ''; // YYYY-MM-DD
  startTime: string = ''; // HH:mm
  endTime: string = ''; // HH:mm
  duration: number = 60; // minutos
  status: AppointmentStatus = 'scheduled';
  isPaid: boolean = false;
  notes: string = '';
  recurringGroupId: string | null = null;
  exerciseIds: string[] = [];
  academyId: string | null = null;
  courtId: string | null = null;
  googleEventId: string | null = null;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  constructor(tenantId: string, docId: string = '') {
    super(tenantId, docId);
  }

  // ============ MÉTODOS REQUERIDOS POR SubCollectionModel ============

  fromFirestore(doc: QueryDocumentSnapshot<DocumentData>): Appointment {
    const data = doc.data();
    
    this.docId = doc.id;
    this.clientId = data.clientId || '';
    this.clientName = data.clientName || '';
    this.instructorId = data.instructorId || '';
    this.sportType = data.sportType || '';
    this.date = data.date || '';
    this.startTime = data.startTime || '';
    this.endTime = data.endTime || '';
    this.duration = data.duration || 60;
    this.status = data.status || 'scheduled';
    this.isPaid = data.isPaid === true;
    this.notes = data.notes || '';
    this.recurringGroupId = data.recurringGroupId || null;
    this.exerciseIds = data.exerciseIds || [];
    this.academyId = data.academyId || null;
    this.courtId = data.courtId || null;
    this.googleEventId = data.googleEventId || null;
    this.createdAt = data.createdAt?.toDate?.() || new Date();
    this.updatedAt = data.updatedAt?.toDate?.() || new Date();
    
    return this;
  }

  toFirestore(): Record<string, any> {
    return {
      clientId: this.clientId,
      clientName: this.clientName,
      instructorId: this.instructorId,
      sportType: this.sportType,
      date: this.date,
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.duration,
      status: this.status,
      isPaid: this.isPaid,
      notes: this.notes,
      recurringGroupId: this.recurringGroupId,
      exerciseIds: this.exerciseIds,
      academyId: this.academyId,
      courtId: this.courtId,
      googleEventId: this.googleEventId,
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
   * Obtiene citas por fecha
   */
  static async getByDate(tenantId: string, date: string): Promise<Appointment[]> {
    return Appointment.getAllWhere(tenantId, 'date', '==', date);
  }

  /**
   * Obtiene citas por cliente
   */
  static async getByClient(tenantId: string, clientId: string): Promise<Appointment[]> {
    return Appointment.getAllWhere(tenantId, 'clientId', '==', clientId);
  }

  /**
   * Obtiene citas por estado
   */
  static async getByStatus(tenantId: string, status: AppointmentStatus): Promise<Appointment[]> {
    return Appointment.getAllWhere(tenantId, 'status', '==', status);
  }

  /**
   * Obtiene citas de una academia
   */
  static async getByAcademy(tenantId: string, academyId: string): Promise<Appointment[]> {
    return Appointment.getAllWhere(tenantId, 'academyId', '==', academyId);
  }

  /**
   * Obtiene citas de un grupo recurrente
   */
  static async getByRecurringGroup(tenantId: string, recurringGroupId: string): Promise<Appointment[]> {
    return Appointment.getAllWhere(tenantId, 'recurringGroupId', '==', recurringGroupId);
  }

  // ============ GETTERS DE CONVENIENCIA ============

  get id(): string {
    return this.docId;
  }

  get tenantId(): string {
    return this.parentId;
  }

  get isScheduled(): boolean {
    return this.status === 'scheduled';
  }

  get isConfirmed(): boolean {
    return this.status === 'confirmed';
  }

  get isCompleted(): boolean {
    return this.status === 'completed';
  }

  get isCancelled(): boolean {
    return this.status === 'cancelled';
  }

  get isNoShow(): boolean {
    return this.status === 'no-show';
  }

  get isAcademyClass(): boolean {
    return !!this.academyId;
  }

  get isRecurring(): boolean {
    return !!this.recurringGroupId;
  }

  get hasExercises(): boolean {
    return this.exerciseIds.length > 0;
  }

  get timeRange(): string {
    return `${this.startTime} - ${this.endTime}`;
  }

  // ============ MÉTODOS DE INSTANCIA ============

  /**
   * Confirma la cita
   */
  confirm(): void {
    this.status = 'confirmed';
  }

  /**
   * Completa la cita
   */
  complete(): void {
    this.status = 'completed';
  }

  /**
   * Cancela la cita
   */
  cancel(): void {
    this.status = 'cancelled';
  }

  /**
   * Marca como no-show
   */
  markNoShow(): void {
    this.status = 'no-show';
  }

  /**
   * Marca como pagada
   */
  markPaid(): void {
    this.isPaid = true;
  }

  /**
   * Marca como no pagada
   */
  markUnpaid(): void {
    this.isPaid = false;
  }

  /**
   * Calcula el endTime basado en startTime y duration
   */
  calculateEndTime(): void {
    const [hours, minutes] = this.startTime.split(':').map(Number);
    const endMinutes = hours * 60 + minutes + this.duration;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    this.endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
  }

  /**
   * Asigna ejercicios a la cita
   */
  assignExercises(exerciseIds: string[]): void {
    this.exerciseIds = exerciseIds;
  }

  /**
   * Agrega un ejercicio
   */
  addExercise(exerciseId: string): void {
    if (!this.exerciseIds.includes(exerciseId)) {
      this.exerciseIds.push(exerciseId);
    }
  }

  /**
   * Quita un ejercicio
   */
  removeExercise(exerciseId: string): void {
    this.exerciseIds = this.exerciseIds.filter(id => id !== exerciseId);
  }
}
