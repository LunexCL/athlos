import { QueryDocumentSnapshot, DocumentData, Timestamp } from 'firebase/firestore';
import SubCollectionModel from './SubCollectionModel';

// Tipos
export type ExerciseCategory = 'warm-up' | 'drill' | 'game' | 'cool-down' | 'technique';
export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced';

/**
 * Modelo Exercise - Ejercicios de entrenamiento
 * Subcolección: tenants/{tenantId}/exercises
 */
export default class Exercise extends SubCollectionModel<Exercise> {
  static collectionName = 'exercises';
  static collectionParentName = 'tenants';

  // Propiedades
  name: string = '';
  description: string = '';
  duration: number = 0; // minutos
  materials: string[] = []; // Equipamiento necesario
  objectives: string[] = [];
  category: ExerciseCategory = 'drill';
  sportType: string = '';
  difficulty: ExerciseDifficulty = 'beginner';
  videoUrl: string = '';
  imageUrl: string = '';
  instructions: string = '';
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  constructor(tenantId: string, docId: string = '') {
    super(tenantId, docId);
  }

  // ============ MÉTODOS REQUERIDOS POR SubCollectionModel ============

  fromFirestore(doc: QueryDocumentSnapshot<DocumentData>): Exercise {
    const data = doc.data();
    
    this.docId = doc.id;
    this.name = data.name || '';
    this.description = data.description || '';
    this.duration = data.duration || 0;
    this.materials = data.materials || [];
    this.objectives = data.objectives || [];
    this.category = data.category || 'drill';
    this.sportType = data.sportType || '';
    this.difficulty = data.difficulty || 'beginner';
    this.videoUrl = data.videoUrl || '';
    this.imageUrl = data.imageUrl || '';
    this.instructions = data.instructions || '';
    this.createdAt = data.createdAt?.toDate?.() || new Date();
    this.updatedAt = data.updatedAt?.toDate?.() || new Date();
    
    return this;
  }

  toFirestore(): Record<string, any> {
    return {
      name: this.name,
      description: this.description,
      duration: this.duration,
      materials: this.materials,
      objectives: this.objectives,
      category: this.category,
      sportType: this.sportType,
      difficulty: this.difficulty,
      videoUrl: this.videoUrl,
      imageUrl: this.imageUrl,
      instructions: this.instructions,
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

  // ============ GETTERS DE CONVENIENCIA ============

  get id(): string {
    return this.docId;
  }

  get isWarmUp(): boolean {
    return this.category === 'warm-up';
  }

  get isDrill(): boolean {
    return this.category === 'drill';
  }

  get isGame(): boolean {
    return this.category === 'game';
  }

  get isCoolDown(): boolean {
    return this.category === 'cool-down';
  }

  get isTechnique(): boolean {
    return this.category === 'technique';
  }

  get hasVideo(): boolean {
    return !!this.videoUrl;
  }

  get hasImage(): boolean {
    return !!this.imageUrl;
  }

  get durationFormatted(): string {
    if (this.duration < 60) {
      return `${this.duration} min`;
    }
    const hours = Math.floor(this.duration / 60);
    const mins = this.duration % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  }
}
