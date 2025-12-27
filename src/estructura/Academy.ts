import { QueryDocumentSnapshot, DocumentData, Timestamp } from 'firebase/firestore';
import SubCollectionModel from './SubCollectionModel';

// Tipos
export type AcademyStatus = 'active' | 'inactive' | 'completed';

export interface Court {
  id: string;
  courtNumber: number;
  assignedCoachId: string;
  assignedCoachName: string;
  clientIds: string[];
  clientNames: string[];
}

export interface AcademySchedule {
  dayOfWeek: number; // 0-6
  startTime: string;
  endTime: string;
  duration: number; // minutes
  startDate: string; // ISO date
  endDate?: string; // ISO date for series end
}

/**
 * Modelo Academy - Academias/Clases grupales
 * Subcolección: tenants/{tenantId}/academies
 */
export default class Academy extends SubCollectionModel<Academy> {
  static collectionName = 'academies';
  static collectionParentName = 'tenants';

  // Propiedades
  name: string = '';
  sportType: string = '';
  description: string = '';
  numberOfCourts: number = 1;
  courtPrice: number = 0;
  pricePerStudent: number = 0;
  headCoachId: string = '';
  headCoachName: string = '';
  courts: Court[] = [];
  schedules: AcademySchedule[] = [];
  exerciseIds: string[] = [];
  status: AcademyStatus = 'active';
  createdBy: string = '';
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  constructor(tenantId: string, docId: string = '') {
    super(tenantId, docId);
  }

  // ============ MÉTODOS REQUERIDOS POR SubCollectionModel ============

  fromFirestore(doc: QueryDocumentSnapshot<DocumentData>): Academy {
    const data = doc.data();
    
    this.docId = doc.id;
    this.name = data.name || '';
    this.sportType = data.sportType || '';
    this.description = data.description || '';
    this.numberOfCourts = data.numberOfCourts || 1;
    this.courtPrice = data.courtPrice || 0;
    this.pricePerStudent = data.pricePerStudent || 0;
    this.headCoachId = data.headCoachId || '';
    this.headCoachName = data.headCoachName || '';
    this.courts = data.courts || [];
    this.schedules = data.schedules || [];
    this.exerciseIds = data.exerciseIds || [];
    this.status = data.status || 'active';
    this.createdBy = data.createdBy || '';
    this.createdAt = data.createdAt?.toDate?.() || new Date();
    this.updatedAt = data.updatedAt?.toDate?.() || new Date();
    
    return this;
  }

  toFirestore(): Record<string, any> {
    return {
      name: this.name,
      sportType: this.sportType,
      description: this.description,
      numberOfCourts: this.numberOfCourts,
      courtPrice: this.courtPrice,
      pricePerStudent: this.pricePerStudent,
      headCoachId: this.headCoachId,
      headCoachName: this.headCoachName,
      courts: this.courts,
      schedules: this.schedules,
      exerciseIds: this.exerciseIds,
      status: this.status,
      createdBy: this.createdBy,
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
   * Obtiene academias activas
   */
  static async getActive(tenantId: string): Promise<Academy[]> {
    return Academy.getAllWhere(tenantId, 'status', '==', 'active');
  }

  /**
   * Obtiene academias por tipo de deporte
   */
  static async getBySportType(tenantId: string, sportType: string): Promise<Academy[]> {
    return Academy.getAllWhere(tenantId, 'sportType', '==', sportType);
  }

  /**
   * Obtiene academias creadas por un usuario
   */
  static async getByCreator(tenantId: string, userId: string): Promise<Academy[]> {
    return Academy.getAllWhere(tenantId, 'createdBy', '==', userId);
  }

  // ============ GETTERS DE CONVENIENCIA ============

  get id(): string {
    return this.docId;
  }

  get tenantId(): string {
    return this.parentId;
  }

  get isActive(): boolean {
    return this.status === 'active';
  }

  get isCompleted(): boolean {
    return this.status === 'completed';
  }

  get totalClients(): number {
    return this.courts.reduce((sum, court) => sum + court.clientIds.length, 0);
  }

  get hasHeadCoach(): boolean {
    return !!this.headCoachId;
  }

  get hasExercises(): boolean {
    return this.exerciseIds.length > 0;
  }

  // ============ MÉTODOS DE INSTANCIA ============

  /**
   * Activa la academia
   */
  activate(): void {
    this.status = 'active';
  }

  /**
   * Desactiva la academia
   */
  deactivate(): void {
    this.status = 'inactive';
  }

  /**
   * Marca como completada
   */
  complete(): void {
    this.status = 'completed';
  }

  /**
   * Agrega un ejercicio a la academia
   */
  addExercise(exerciseId: string): void {
    if (!this.exerciseIds.includes(exerciseId)) {
      this.exerciseIds.push(exerciseId);
    }
  }

  /**
   * Quita un ejercicio de la academia
   */
  removeExercise(exerciseId: string): void {
    this.exerciseIds = this.exerciseIds.filter(id => id !== exerciseId);
  }

  /**
   * Verifica si un coach está asignado a esta academia
   */
  hasCoach(coachId: string): boolean {
    return this.headCoachId === coachId || 
           this.courts.some(court => court.assignedCoachId === coachId);
  }

  /**
   * Obtiene las canchas asignadas a un coach
   */
  getCourtsForCoach(coachId: string): Court[] {
    return this.courts.filter(court => court.assignedCoachId === coachId);
  }

  /**
   * Obtiene el máximo de clientes por cancha según el deporte
   */
  get maxClientsPerCourt(): number {
    return this.sportType === 'padel' ? 4 : 6;
  }

  /**
   * Valida que las canchas no excedan el máximo de clientes
   */
  validateCourts(): boolean {
    return this.courts.every(court => court.clientIds.length <= this.maxClientsPerCourt);
  }

  /**
   * Genera IDs para las canchas que no lo tengan
   */
  generateCourtIds(): void {
    this.courts = this.courts.map((court, index) => ({
      ...court,
      id: court.id || `court_${Date.now()}_${index}`,
    }));
  }
}
