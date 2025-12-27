import { QueryDocumentSnapshot, DocumentData, Timestamp } from 'firebase/firestore';
import SubCollectionModel from './SubCollectionModel';

// Tipos
export type PaymentProvider = 'mercadopago' | 'manual';
export type PaymentMethod = 'card' | 'mercadopago_wallet' | 'transfer' | 'cash' | 'debit_card' | 'credit_card';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'under_review';
export type ProofStatus = 'pending' | 'approved' | 'rejected';

/**
 * Modelo Payment - Pagos
 * Subcolección: tenants/{tenantId}/payments
 */
export default class Payment extends SubCollectionModel<Payment> {
  static collectionName = 'payments';
  static collectionParentName = 'tenants';

  // Propiedades
  appointmentId: string = '';
  clientId: string = '';
  clientName: string = '';
  amount: number = 0;
  currency: 'CLP' = 'CLP';
  provider: PaymentProvider = 'manual';
  method: PaymentMethod = 'transfer';
  status: PaymentStatus = 'pending';
  paymentToken: string | null = null;
  
  // Mercado Pago specific
  externalId: string | null = null;
  preferenceId: string | null = null;
  merchantOrderId: string | null = null;
  
  // Manual payment specific
  proofUrl: string | null = null;
  proofStatus: ProofStatus | null = null;
  reviewedBy: string | null = null;
  reviewedAt: Date | null = null;
  rejectionReason: string | null = null;
  
  paidAt: Date | null = null;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  constructor(tenantId: string, docId: string = '') {
    super(tenantId, docId);
  }

  // ============ MÉTODOS REQUERIDOS POR SubCollectionModel ============

  fromFirestore(doc: QueryDocumentSnapshot<DocumentData>): Payment {
    const data = doc.data();
    
    this.docId = doc.id;
    this.appointmentId = data.appointmentId || '';
    this.clientId = data.clientId || '';
    this.clientName = data.clientName || '';
    this.amount = data.amount || 0;
    this.currency = data.currency || 'CLP';
    this.provider = data.provider || 'manual';
    this.method = data.method || 'transfer';
    this.status = data.status || 'pending';
    this.paymentToken = data.paymentToken || null;
    
    // Mercado Pago
    this.externalId = data.externalId || null;
    this.preferenceId = data.preferenceId || null;
    this.merchantOrderId = data.merchantOrderId || null;
    
    // Manual
    this.proofUrl = data.proofUrl || null;
    this.proofStatus = data.proofStatus || null;
    this.reviewedBy = data.reviewedBy || null;
    this.reviewedAt = data.reviewedAt?.toDate?.() || null;
    this.rejectionReason = data.rejectionReason || null;
    
    this.paidAt = data.paidAt?.toDate?.() || null;
    this.createdAt = data.createdAt?.toDate?.() || new Date();
    this.updatedAt = data.updatedAt?.toDate?.() || new Date();
    
    return this;
  }

  toFirestore(): Record<string, any> {
    const data: Record<string, any> = {
      appointmentId: this.appointmentId,
      clientId: this.clientId,
      clientName: this.clientName,
      amount: this.amount,
      currency: this.currency,
      provider: this.provider,
      method: this.method,
      status: this.status,
      paymentToken: this.paymentToken,
      externalId: this.externalId,
      preferenceId: this.preferenceId,
      merchantOrderId: this.merchantOrderId,
      proofUrl: this.proofUrl,
      proofStatus: this.proofStatus,
      reviewedBy: this.reviewedBy,
      rejectionReason: this.rejectionReason,
      createdAt: Timestamp.fromDate(this.createdAt),
      updatedAt: Timestamp.fromDate(new Date()),
    };

    if (this.reviewedAt) {
      data.reviewedAt = Timestamp.fromDate(this.reviewedAt);
    }
    if (this.paidAt) {
      data.paidAt = Timestamp.fromDate(this.paidAt);
    }

    return data;
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
   * Obtiene pagos por cita
   */
  static async getByAppointment(tenantId: string, appointmentId: string): Promise<Payment[]> {
    return Payment.getAllWhere(tenantId, 'appointmentId', '==', appointmentId);
  }

  /**
   * Obtiene pagos por cliente
   */
  static async getByClient(tenantId: string, clientId: string): Promise<Payment[]> {
    return Payment.getAllWhere(tenantId, 'clientId', '==', clientId);
  }

  /**
   * Obtiene pagos por estado
   */
  static async getByStatus(tenantId: string, status: PaymentStatus): Promise<Payment[]> {
    return Payment.getAllWhere(tenantId, 'status', '==', status);
  }

  /**
   * Obtiene pagos pendientes de revisión
   */
  static async getPendingProofs(tenantId: string): Promise<Payment[]> {
    return Payment.getAllWhere(tenantId, 'proofStatus', '==', 'pending');
  }

  // ============ GETTERS DE CONVENIENCIA ============

  get id(): string {
    return this.docId;
  }

  get tenantId(): string {
    return this.parentId;
  }

  get isPending(): boolean {
    return this.status === 'pending';
  }

  get isCompleted(): boolean {
    return this.status === 'completed';
  }

  get isFailed(): boolean {
    return this.status === 'failed';
  }

  get isRefunded(): boolean {
    return this.status === 'refunded';
  }

  get isUnderReview(): boolean {
    return this.status === 'under_review';
  }

  get isManual(): boolean {
    return this.provider === 'manual';
  }

  get isMercadoPago(): boolean {
    return this.provider === 'mercadopago';
  }

  get hasProof(): boolean {
    return !!this.proofUrl;
  }

  get isProofPending(): boolean {
    return this.proofStatus === 'pending';
  }

  get isProofApproved(): boolean {
    return this.proofStatus === 'approved';
  }

  get isProofRejected(): boolean {
    return this.proofStatus === 'rejected';
  }

  get amountFormatted(): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(this.amount);
  }

  // ============ MÉTODOS DE INSTANCIA ============

  /**
   * Aprueba el comprobante
   */
  approveProof(reviewerId: string): void {
    this.proofStatus = 'approved';
    this.status = 'completed';
    this.reviewedBy = reviewerId;
    this.reviewedAt = new Date();
    this.paidAt = new Date();
  }

  /**
   * Rechaza el comprobante
   */
  rejectProof(reviewerId: string, reason: string): void {
    this.proofStatus = 'rejected';
    this.status = 'failed';
    this.reviewedBy = reviewerId;
    this.reviewedAt = new Date();
    this.rejectionReason = reason;
  }

  /**
   * Marca como completado
   */
  complete(): void {
    this.status = 'completed';
    this.paidAt = new Date();
  }

  /**
   * Marca como fallido
   */
  fail(): void {
    this.status = 'failed';
  }

  /**
   * Marca como reembolsado
   */
  refund(): void {
    this.status = 'refunded';
  }
}
