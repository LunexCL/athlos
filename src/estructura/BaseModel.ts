import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  QueryDocumentSnapshot,
  DocumentData,
  WhereFilterOp
} from 'firebase/firestore';
// Importar configuración de Firebase para asegurar inicialización
import '@/lib/firebase';

/**
 * Clase base abstracta para modelos de Firestore.
 * 
 * Proporciona métodos CRUD genéricos que las clases hijas heredan.
 * Las clases hijas deben:
 * 1. Definir `static collectionName: string`
 * 2. Implementar `fromFirestore()` para convertir documento a instancia
 * 3. Implementar `toFirestore()` para convertir instancia a documento
 * 
 * @example
 * ```typescript
 * class Usuario extends BaseModel<Usuario> {
 *   static collectionName = 'usuarios';
 *   nombre: string;
 *   
 *   fromFirestore(doc: QueryDocumentSnapshot): Usuario {
 *     const data = doc.data();
 *     this.nombre = data.nombre;
 *     return this;
 *   }
 *   
 *   toFirestore() {
 *     return { nombre: this.nombre };
 *   }
 * }
 * ```
 */
export default abstract class BaseModel<T extends BaseModel<T>> {
  docId: string;

  constructor(docId: string = '') {
    this.docId = docId;
  }

  // ============================================================================
  // MÉTODOS ABSTRACTOS - Las clases hijas deben implementar
  // ============================================================================

  /**
   * Convierte un documento de Firestore a una instancia del modelo.
   */
  abstract fromFirestore(doc: QueryDocumentSnapshot<DocumentData>): T;

  /**
   * Convierte la instancia del modelo a un objeto para Firestore.
   */
  abstract toFirestore(): any;

  // ============================================================================
  // MÉTODOS DE INSTANCIA
  // ============================================================================

  /**
   * Guarda el documento en Firestore.
   * Si tiene docId, actualiza. Si no, crea uno nuevo.
   */
  async save(): Promise<void> {
    try {
      const db = getFirestore();
      const collectionName = (this.constructor as any).collectionName;
      
      if (!collectionName) {
        throw new Error('collectionName is not defined in the subclass.');
      }
      
      if (this.docId) {
        // Actualizar documento existente
        const docRef = doc(db, collectionName, this.docId);
        await setDoc(docRef, this.toFirestore(), { merge: true });
      } else {
        // Crear nuevo documento
        const docRef = await addDoc(collection(db, collectionName), this.toFirestore());
        this.docId = docRef.id;
      }
    } catch (error) {
      console.error(`Error al guardar el documento en ${(this.constructor as any).collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Elimina el documento de Firestore.
   */
  async delete(): Promise<void> {
    if (!this.docId) return;
    
    try {
      const db = getFirestore();
      const collectionName = (this.constructor as any).collectionName;
      
      if (!collectionName) {
        throw new Error('collectionName is not defined in the subclass.');
      }
      
      const docRef = doc(db, collectionName, this.docId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error al eliminar el documento en ${(this.constructor as any).collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Crea una copia de la instancia actual.
   */
  public clone(): T {
    const copy = new (this.constructor as any)(this.docId);
    Object.assign(copy, this);
    return copy;
  }

  // ============================================================================
  // MÉTODOS ESTÁTICOS
  // ============================================================================

  /**
   * Obtiene un documento por su ID.
   */
  static async getById<T extends BaseModel<T>>(
    this: { new (docId: string): T; collectionName: string },
    docId: string
  ): Promise<T | null> {
    try {
      const db = getFirestore();
      const docRef = doc(db, this.collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return new this(docId).fromFirestore(docSnap as any);
      }
      return null;
    } catch (error) {
      console.error(`Error al obtener el documento en ${this.collectionName}:`, error);
      return null;
    }
  }

  /**
   * Obtiene varios documentos por una lista de IDs.
   */
  static async getByIds<T extends BaseModel<T>>(
    this: { new (docId: string): T; collectionName: string },
    docIds: string[]
  ): Promise<T[]> {
    try {
      const db = getFirestore();
      const docs = await Promise.all(
        docIds.map(async (docId) => {
          const docRef = doc(db, this.collectionName, docId);
          return await getDoc(docRef);
        })
      );
      
      return docs
        .filter((docSnap) => docSnap.exists())
        .map((docSnap) => new this(docSnap.id).fromFirestore(docSnap as any));
    } catch (error) {
      console.error(`Error al obtener los documentos en ${this.collectionName}:`, error);
      return [];
    }
  }

  /**
   * Obtiene todos los documentos de la colección.
   */
  static async getAll<T extends BaseModel<T>>(
    this: { new (docId: string): T; collectionName: string }
  ): Promise<T[]> {
    try {
      const db = getFirestore();
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      return querySnapshot.docs.map((doc) => new this(doc.id).fromFirestore(doc));
    } catch (error) {
      console.error(`Error al obtener los documentos en ${this.collectionName}:`, error);
      return [];
    }
  }

  /**
   * Obtiene todos los documentos que cumplan con una condición.
   * 
   * @example
   * ```typescript
   * const activos = await Usuario.getAllWhere('isActive', '==', true);
   * ```
   */
  static async getAllWhere<T extends BaseModel<T>>(
    this: { new (docId: string): T; collectionName: string },
    field: string,
    operator: WhereFilterOp,
    value: any
  ): Promise<T[]> {
    try {
      const db = getFirestore();
      const q = query(
        collection(db, this.collectionName),
        where(field, operator, value)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => new this(doc.id).fromFirestore(doc));
    } catch (error) {
      console.error(`Error al obtener los documentos con condición en ${this.collectionName}:`, error);
      return [];
    }
  }
}
