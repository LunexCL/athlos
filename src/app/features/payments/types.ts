/**
 * Payment types for Sprint 4
 * Supports Mercado Pago and Manual payment methods
 */

export type PaymentProvider = 'mercadopago' | 'manual';

export type PaymentMethod = 
  | 'card'                    // Tarjeta de crédito/débito
  | 'mercadopago_wallet'      // Saldo de Mercado Pago
  | 'transfer'                // Transferencia bancaria
  | 'cash'                    // Efectivo (PagoFácil, Rapipago)
  | 'debit_card'              // Tarjeta de débito
  | 'credit_card';            // Tarjeta de crédito

export type PaymentStatus = 
  | 'pending'                 // Pendiente de pago
  | 'completed'               // Pago completado
  | 'failed'                  // Pago fallido
  | 'refunded'                // Pago reembolsado
  | 'under_review';           // En revisión (para pagos manuales)

export type ProofStatus = 
  | 'pending'                 // Comprobante pendiente de revisión
  | 'approved'                // Comprobante aprobado
  | 'rejected';               // Comprobante rechazado

export interface BankInfo {
  bank: string;               // Nombre del banco
  accountType: 'Cuenta Corriente' | 'Cuenta Vista' | 'Cuenta de Ahorro';
  accountNumber: string;      // Número de cuenta
  rut: string;                // RUT del titular
  name: string;               // Nombre del titular
  email?: string;             // Email de confirmación (opcional)
}

export interface MercadoPagoConfig {
  accessToken: string;        // Access Token (encriptado en backend)
  publicKey: string;          // Public Key
  isTestMode: boolean;        // Modo sandbox/producción
}

export type TimeSlotType = 'low' | 'high'; // Horario bajo o alto

export interface TimeSlotPricing {
  type: TimeSlotType;
  label: string;              // "Horario Bajo", "Horario Alto"
  startTime: string;          // HH:mm
  endTime: string;            // HH:mm
  prices: {
    [duration: number]: number; // duration en minutos → precio en CLP
  };
}

export interface PricingConfig {
  [sportType: string]: {
    timeSlots: TimeSlotPricing[];
  };
}

export interface PaymentConfig {
  id: string;
  tenantId: string;
  provider: PaymentProvider;
  isActive: boolean;
  
  // Mercado Pago configuration
  mercadoPago?: MercadoPagoConfig;
  
  // Manual payment configuration
  bankInfo?: BankInfo;
  
  // Pricing configuration (común para ambos métodos)
  pricing: PricingConfig;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  tenantId: string;
  appointmentId: string;
  clientId: string;
  clientName: string;         // Denormalizado para facilitar búsqueda
  
  amount: number;
  currency: 'CLP';
  
  provider: PaymentProvider;
  method: PaymentMethod;
  status: PaymentStatus;
  
  // Mercado Pago specific fields
  externalId?: string | null;        // MP payment ID
  preferenceId?: string | null;      // MP preference ID
  merchantOrderId?: string | null;   // MP merchant order ID
  
  // Manual payment specific fields
  proofUrl?: string | null;          // Storage URL del comprobante
  proofStatus?: ProofStatus | null;  // Estado del comprobante
  reviewedBy?: string | null;        // UID del profesor que revisó
  reviewedAt?: Date | null;          // Fecha de revisión
  rejectionReason?: string | null;   // Razón de rechazo (si aplica)
  
  paidAt?: Date | null;              // Fecha de pago confirmado
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentData {
  appointmentId: string;
  clientId: string;
  clientName: string;
  amount: number;
  provider: PaymentProvider;
  method: PaymentMethod;
}

export interface UpdatePaymentData {
  status?: PaymentStatus;
  proofUrl?: string;
  proofStatus?: ProofStatus;
  reviewedBy?: string;
  reviewedAt?: Date;
  rejectionReason?: string;
  paidAt?: Date;
  externalId?: string;
  preferenceId?: string;
  merchantOrderId?: string;
}

// Form data types
export interface PaymentConfigFormData {
  provider: PaymentProvider;
  
  // Manual fields
  bank?: string;
  accountType?: 'Cuenta Corriente' | 'Cuenta Vista' | 'Cuenta de Ahorro';
  accountNumber?: string;
  rut?: string;
  accountName?: string;
  email?: string;
  
  // Mercado Pago fields
  accessToken?: string;
  publicKey?: string;
  isTestMode?: boolean;
}

export interface PricingFormData {
  sportType: string;
  duration60: number;
  duration90: number;
  duration120: number;
}

// Stats types
export interface PaymentStats {
  totalRevenue: number;
  pendingAmount: number;
  completedCount: number;
  pendingCount: number;
  monthlyRevenue: number;
  averageTicket: number;
}

// Mercado Pago Preference (for API integration)
export interface MercadoPagoPreference {
  items: Array<{
    title: string;
    description: string;
    quantity: number;
    currency_id: string;
    unit_price: number;
  }>;
  payer?: {
    name?: string;
    email?: string;
  };
  back_urls?: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return?: 'approved' | 'all';
  external_reference?: string;
  notification_url?: string;
}

// Mercado Pago Payment Response
export interface MercadoPagoPayment {
  id: number;
  status: string;
  status_detail: string;
  external_reference?: string;
  transaction_amount: number;
  date_approved?: string;
  payment_method_id: string;
  payment_type_id: string;
}
