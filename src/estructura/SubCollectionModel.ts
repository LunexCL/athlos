import {
  getFirestore,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  QueryDocumentSnapshot,
  DocumentData,
  WhereFilterOp,
  OrderByDirection,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
// Importar configuración de Firebase
import '@/lib/firebase';

/**
 * Clase base abstracta para modelos de subcolecciones en Firestore.
 * 
 * Las subcolecciones son colecciones anidadas dentro de un documento padre.
 * Ejemplo: tenants/{tenantId}/clients
 * 
 * Las clases hijas deben:
 * 1. Definir `static collectionName: string` - Nombre de la subcolección
 * 2. Definir `static collectionParentName: string` - Nombre de la colección padre
 * 3. Implementar `fromFirestore()` y `toFirestore()`
 * 
 * @example
 * ```typescript
 * class Client extends SubCollectionModel<Client> {
 *   static collectionName = 'clients';
 *   static collectionParentName = 'tenants';
 *   
 *   name: string;
 *   
 *   fromFirestore(doc: QueryDocumentSnapshot): Client {
 *     const data = doc.data();
 *     this.name = data.name;
 *     return this;
 *   }
 *   
 *   toFirestore() {
 *     return { name: this.name };
 *   }
 * }
 * 
 * // Uso:
 * const clients = await Client.getAll(tenantId);
 * ```
 */
export default abstract class SubCollectionModel<T extends SubCollectionModel<T>> {
  docId: string;
  parentId: string;

  constructor(parentId: string, docId: string = '') {
    this.parentId = parentId;
    this.docId = docId;
  }

  // ============================================================================
  // MÉTODOS ABSTRACTOS
  // ============================================================================

  abstract fromFirestore(doc: QueryDocumentSnapshot<DocumentData>): T;
  abstract toFirestore(): Record<string, any>;

  // ============================================================================
  // MÉTODOS DE INSTANCIA
  // ============================================================================

  /**
   * Guarda el documento en Firestore.
   */
  async save(): Promise<void> {
    const constructor = this.constructor as typeof SubCollectionModel & {
      collectionName: string;
      collectionParentName: string;
    };
    
    try {
      const db = getFirestore();
      const { collectionName, collectionParentName } = constructor;

      if (!collectionName || !collectionParentName) {
        throw new Error('collectionName or collectionParentName is not defined.');
      }

      const path = `${collectionParentName}/${this.parentId}/${collectionName}`;

      if (this.docId) {
        const docRef = doc(db, path, this.docId);
        await setDoc(docRef, this.toFirestore(), { merge: true });
      } else {
        const docRef = await addDoc(collection(db, path), this.toFirestore());
        this.docId = docRef.id;
      }
    } catch (error) {
      console.error(`Error al guardar en ${constructor.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Elimina el documento de Firestore.
   */
  async delete(): Promise<void> {
    const constructor = this.constructor as typeof SubCollectionModel & {
      collectionName: string;
      collectionParentName: string;
    };
    
    if (!this.docId) return;
    
    try {
      const db = getFirestore();
      const { collectionName, collectionParentName } = constructor;
      const path = `${collectionParentName}/${this.parentId}/${collectionName}`;
      const docRef = doc(db, path, this.docId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error al eliminar en ${constructor.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Crea una copia de la instancia.
   */
  public clone(): T {
    const copy = new (this.constructor as any)(this.parentId, this.docId);
    Object.assign(copy, this);
    return copy;
  }

  /**
   * Alias para docId (compatibilidad).
   */
  get id(): string {
    return this.docId;
  }

  // ============================================================================
  // MÉTODOS ESTÁTICOS
  // ============================================================================

  /**
   * Obtiene un documento por su ID.
   */
  static async getById<T extends SubCollectionModel<T>>(
    this: { new (parentId: string, docId?: string): T; collectionName: string; collectionParentName: string },
    parentId: string,
    docId: string
  ): Promise<T | null> {
    try {
      const db = getFirestore();
      const path = `${this.collectionParentName}/${parentId}/${this.collectionName}`;
      const docRef = doc(db, path, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return new this(parentId, docId).fromFirestore(docSnap as any);
      }
      return null;
    } catch (error) {
      console.error(`Error al obtener en ${this.collectionName}:`, error);
      return null;
    }
  }

  /**
   * Obtiene varios documentos por IDs.
   */
  static async getByIds<T extends SubCollectionModel<T>>(
    this: { new (parentId: string, docId?: string): T; collectionName: string; collectionParentName: string },
    parentId: string,
    docIds: string[]
  ): Promise<T[]> {
    try {
      const db = getFirestore();
      const path = `${this.collectionParentName}/${parentId}/${this.collectionName}`;

      const docs = await Promise.all(
        docIds.map(async (docId) => {
          const docRef = doc(db, path, docId);
          return await getDoc(docRef);
        })
      );

      return docs
        .filter((docSnap) => docSnap.exists())
        .map((docSnap) => new this(parentId, docSnap.id).fromFirestore(docSnap as any));
    } catch (error) {
      console.error(`Error al obtener en ${this.collectionName}:`, error);
      return [];
    }
  }

  /**
   * Obtiene todos los documentos de la subcolección.
   */
  static async getAll<T extends SubCollectionModel<T>>(
    this: { new (parentId: string, docId?: string): T; collectionName: string; collectionParentName: string },
    parentId: string
  ): Promise<T[]> {
    try {
      const db = getFirestore();
      const path = `${this.collectionParentName}/${parentId}/${this.collectionName}`;
      const querySnapshot = await getDocs(collection(db, path));

      return querySnapshot.docs.map((doc) => new this(parentId, doc.id).fromFirestore(doc));
    } catch (error) {
      console.error(`Error al obtener en ${this.collectionName}:`, error);
      return [];
    }
  }

  /**
   * Obtiene documentos que cumplan con una condición.
   */
  static async getAllWhere<T extends SubCollectionModel<T>>(
    this: { new (parentId: string, docId?: string): T; collectionName: string; collectionParentName: string },
    parentId: string,
    field: string,
    operator: WhereFilterOp,
    value: any
  ): Promise<T[]> {
    try {
      const db = getFirestore();
      const path = `${this.collectionParentName}/${parentId}/${this.collectionName}`;
      const q = query(collection(db, path), where(field, operator, value));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => new this(parentId, doc.id).fromFirestore(doc));
    } catch (error) {
      console.error(`Error al obtener con condición en ${this.collectionName}:`, error);
      return [];
    }
  }

  /**
   * Obtiene documentos ordenados por un campo.
   */
  static async getAllOrdered<T extends SubCollectionModel<T>>(
    this: { new (parentId: string, docId?: string): T; collectionName: string; collectionParentName: string },
    parentId: string,
    field: string,
    direction: OrderByDirection = 'asc'
  ): Promise<T[]> {
    try {
      const db = getFirestore();
      const path = `${this.collectionParentName}/${parentId}/${this.collectionName}`;
      const q = query(collection(db, path), orderBy(field, direction));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => new this(parentId, doc.id).fromFirestore(doc));
    } catch (error) {
      console.error(`Error al obtener ordenados en ${this.collectionName}:`, error);
      return [];
    }
  }

  // ============================================================================
  // LISTENERS EN TIEMPO REAL
  // ============================================================================

  /**
   * Crea un listener en tiempo real para todos los documentos.
   */
  static onSnapshot<T extends SubCollectionModel<T>>(
    this: { new (parentId: string, docId?: string): T; collectionName: string; collectionParentName: string },
    parentId: string,
    callback: (items: T[]) => void
  ): Unsubscribe {
    try {
      const db = getFirestore();
      const path = `${this.collectionParentName}/${parentId}/${this.collectionName}`;
      
      return onSnapshot(
        collection(db, path),
        (querySnapshot) => {
          const list: T[] = querySnapshot.docs.map((doc) =>
            new this(parentId, doc.id).fromFirestore(doc)
          );
          callback(list);
        },
        (error) => {
          console.error(`Error en listener de ${this.collectionName}:`, error);
          callback([]);
        }
      );
    } catch (error) {
      console.error(`Error al crear listener en ${this.collectionName}:`, error);
      return () => {};
    }
  }

  /**
   * Crea un listener en tiempo real con filtro.
   */
  static onSnapshotWhere<T extends SubCollectionModel<T>>(
    this: { new (parentId: string, docId?: string): T; collectionName: string; collectionParentName: string },
    parentId: string,
    field: string,
    operator: WhereFilterOp,
    value: any,
    callback: (items: T[]) => void
  ): Unsubscribe {
    try {
      const db = getFirestore();
      const path = `${this.collectionParentName}/${parentId}/${this.collectionName}`;
      const q = query(collection(db, path), where(field, operator, value));
      
      return onSnapshot(
        q,
        (querySnapshot) => {
          const list: T[] = querySnapshot.docs.map((doc) =>
            new this(parentId, doc.id).fromFirestore(doc)
          );
          callback(list);
        },
        (error) => {
          console.error(`Error en listener filtrado de ${this.collectionName}:`, error);
          callback([]);
        }
      );
    } catch (error) {
      console.error(`Error al crear listener filtrado en ${this.collectionName}:`, error);
      return () => {};
    }
  }

  /**
   * Crea un listener en tiempo real ordenado.
   */
  static onSnapshotOrdered<T extends SubCollectionModel<T>>(
    this: { new (parentId: string, docId?: string): T; collectionName: string; collectionParentName: string },
    parentId: string,
    field: string,
    direction: OrderByDirection,
    callback: (items: T[]) => void
  ): Unsubscribe {
    try {
      const db = getFirestore();
      const path = `${this.collectionParentName}/${parentId}/${this.collectionName}`;
      const q = query(collection(db, path), orderBy(field, direction));
      
      return onSnapshot(
        q,
        (querySnapshot) => {
          const list: T[] = querySnapshot.docs.map((doc) =>
            new this(parentId, doc.id).fromFirestore(doc)
          );
          callback(list);
        },
        (error) => {
          console.error(`Error en listener ordenado de ${this.collectionName}:`, error);
          callback([]);
        }
      );
    } catch (error) {
      console.error(`Error al crear listener ordenado en ${this.collectionName}:`, error);
      return () => {};
    }
  }
}
