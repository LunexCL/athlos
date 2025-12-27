import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import PaymentModel from '@/estructura/Payment';
import { toast } from 'sonner';
import type { Payment, CreatePaymentData, UpdatePaymentData, PaymentStats } from '../types';

// Convertir modelo a interfaz para compatibilidad
const toPaymentInterface = (payment: PaymentModel): Payment => ({
  id: payment.docId,
  tenantId: payment.tenantId,
  appointmentId: payment.appointmentId,
  clientId: payment.clientId,
  clientName: payment.clientName,
  amount: payment.amount,
  currency: payment.currency,
  provider: payment.provider,
  method: payment.method,
  status: payment.status,
  paymentToken: payment.paymentToken || undefined,
  externalId: payment.externalId,
  preferenceId: payment.preferenceId,
  merchantOrderId: payment.merchantOrderId,
  proofUrl: payment.proofUrl,
  proofStatus: payment.proofStatus,
  reviewedBy: payment.reviewedBy,
  reviewedAt: payment.reviewedAt,
  rejectionReason: payment.rejectionReason,
  paidAt: payment.paidAt,
  createdAt: payment.createdAt,
  updatedAt: payment.updatedAt,
});

export const usePayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const { tenant, user } = useAuth();

  useEffect(() => {
    if (!tenant?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Listener en tiempo real usando el modelo Payment
    const unsubscribe = PaymentModel.onSnapshotOrdered(
      tenant.id,
      'createdAt',
      'desc',
      (paymentModels) => {
        setPayments(paymentModels.map(toPaymentInterface));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [tenant?.id]);

  const addPayment = async (data: CreatePaymentData): Promise<string | null> => {
    if (!tenant?.id) {
      toast.error('Error', { description: 'No se encontró el tenant' });
      return null;
    }

    if (!user?.uid) {
      toast.error('Error', { description: 'Usuario no autenticado' });
      return null;
    }

    try {
      const payment = new PaymentModel(tenant.id);
      payment.appointmentId = data.appointmentId;
      payment.clientId = data.clientId || user.uid;
      payment.clientName = data.clientName || user.displayName || 'Cliente';
      payment.amount = data.amount;
      payment.currency = 'CLP';
      payment.provider = data.provider || 'manual';
      payment.method = data.method;
      payment.status = 'pending';
      payment.proofUrl = data.proofUrl || null;
      payment.proofStatus = data.proofStatus || null;
      payment.paymentToken = data.paymentToken || null;

      await payment.save();
      
      toast.success('Pago registrado', {
        description: 'El pago ha sido registrado exitosamente',
      });

      return payment.docId;
    } catch (error) {
      console.error('Error creating payment:', error);
      toast.error('Error al registrar pago', {
        description: 'No se pudo registrar el pago',
      });
      return null;
    }
  };

  const updatePayment = async (id: string, updates: UpdatePaymentData): Promise<boolean> => {
    if (!tenant?.id) {
      toast.error('Error', { description: 'No se encontró el tenant' });
      return false;
    }

    try {
      const payment = await PaymentModel.getById(tenant.id, id);
      if (!payment) {
        toast.error('Error', { description: 'Pago no encontrado' });
        return false;
      }

      if (updates.status !== undefined) payment.status = updates.status;
      if (updates.proofUrl !== undefined) payment.proofUrl = updates.proofUrl;
      if (updates.proofStatus !== undefined) payment.proofStatus = updates.proofStatus;
      if (updates.reviewedBy !== undefined) payment.reviewedBy = updates.reviewedBy;
      if (updates.reviewedAt !== undefined) payment.reviewedAt = updates.reviewedAt;
      if (updates.rejectionReason !== undefined) payment.rejectionReason = updates.rejectionReason;
      if (updates.paidAt !== undefined) payment.paidAt = updates.paidAt;
      if (updates.externalId !== undefined) payment.externalId = updates.externalId;
      if (updates.preferenceId !== undefined) payment.preferenceId = updates.preferenceId;
      if (updates.merchantOrderId !== undefined) payment.merchantOrderId = updates.merchantOrderId;

      await payment.save();
      return true;
    } catch (error) {
      console.error('Error updating payment:', error);
      toast.error('Error al actualizar pago', {
        description: 'No se pudo actualizar el pago',
      });
      return false;
    }
  };

  const approveProof = async (paymentId: string, userId: string): Promise<boolean> => {
    if (!tenant?.id) return false;

    try {
      const payment = await PaymentModel.getById(tenant.id, paymentId);
      if (!payment) return false;

      payment.approveProof(userId);
      await payment.save();

      toast.success('Comprobante aprobado', {
        description: 'El pago ha sido confirmado',
      });

      return true;
    } catch (error) {
      console.error('Error approving proof:', error);
      return false;
    }
  };

  const rejectProof = async (
    paymentId: string,
    userId: string,
    reason: string
  ): Promise<boolean> => {
    if (!tenant?.id) return false;

    try {
      const payment = await PaymentModel.getById(tenant.id, paymentId);
      if (!payment) return false;

      payment.rejectProof(userId, reason);
      await payment.save();

      toast.success('Comprobante rechazado', {
        description: 'Se ha notificado al cliente',
      });

      return true;
    } catch (error) {
      console.error('Error rejecting proof:', error);
      return false;
    }
  };

  const deletePayment = async (id: string): Promise<boolean> => {
    if (!tenant?.id) {
      toast.error('Error', { description: 'No se encontró el tenant' });
      return false;
    }

    try {
      const payment = await PaymentModel.getById(tenant.id, id);
      if (!payment) {
        toast.error('Error', { description: 'Pago no encontrado' });
        return false;
      }

      await payment.delete();

      toast.success('Pago eliminado', {
        description: 'El registro de pago ha sido eliminado',
      });

      return true;
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast.error('Error al eliminar pago', {
        description: 'No se pudo eliminar el pago',
      });
      return false;
    }
  };

  const getPaymentsByAppointment = (appointmentId: string): Payment[] => {
    return payments.filter((payment) => payment.appointmentId === appointmentId);
  };

  const getPaymentsByClient = (clientId: string): Payment[] => {
    return payments.filter((payment) => payment.clientId === clientId);
  };

  const getPendingProofs = (): Payment[] => {
    return payments.filter(
      (payment) =>
        payment.provider === 'manual' &&
        payment.proofStatus === 'pending' &&
        payment.proofUrl
    );
  };

  const getPaymentStats = (): PaymentStats => {
    const completed = payments.filter((p) => p.status === 'completed');
    const pending = payments.filter((p) => p.status === 'pending');
    
    const totalRevenue = completed.reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = pending.reduce((sum, p) => sum + p.amount, 0);
    
    // Monthly revenue (current month)
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyPayments = completed.filter(
      (p) => p.paidAt && new Date(p.paidAt) >= monthStart
    );
    const monthlyRevenue = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);
    
    const averageTicket = completed.length > 0 ? totalRevenue / completed.length : 0;

    return {
      totalRevenue,
      pendingAmount,
      completedCount: completed.length,
      pendingCount: pending.length,
      monthlyRevenue,
      averageTicket,
    };
  };

  return {
    payments,
    loading,
    addPayment,
    updatePayment,
    approveProof,
    rejectProof,
    deletePayment,
    getPaymentsByAppointment,
    getPaymentsByClient,
    getPendingProofs,
    getPaymentStats,
  };
};
