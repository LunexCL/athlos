import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  doc,
  updateDoc,
  deleteDoc,
  where,
} from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import { useAuth } from '../../auth/AuthContext';
import { toast } from 'sonner';
import type { Payment, CreatePaymentData, UpdatePaymentData, PaymentStats } from '../types';

export const usePayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const { tenant } = useAuth();

  useEffect(() => {
    if (!tenant?.id) {
      console.log('❌ No tenant ID for payments');
      setLoading(false);
      return;
    }

    console.log('🔑 Loading payments for tenant:', tenant.id);
    const paymentsRef = collection(db, 'tenants', tenant.id, 'payments');
    const q = query(paymentsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const paymentsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            paidAt: data.paidAt?.toDate() || null,
            reviewedAt: data.reviewedAt?.toDate() || null,
          } as Payment;
        });
        console.log('💳 Payments loaded:', paymentsData.length);
        setPayments(paymentsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading payments:', error);
        toast.error('Error al cargar pagos', {
          description: 'No se pudieron cargar los pagos',
        });
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

    try {
      const paymentsRef = collection(db, 'tenants', tenant.id, 'payments');
      const now = Timestamp.now();

      const paymentData = {
        tenantId: tenant.id,
        appointmentId: data.appointmentId,
        clientId: data.clientId,
        clientName: data.clientName,
        amount: data.amount,
        currency: 'CLP' as const,
        provider: data.provider,
        method: data.method,
        status: 'pending' as const,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(paymentsRef, paymentData);
      console.log('✅ Payment created:', docRef.id);
      
      toast.success('Pago registrado', {
        description: 'El pago ha sido registrado exitosamente',
      });

      return docRef.id;
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
      const paymentRef = doc(db, 'tenants', tenant.id, 'payments', id);
      
      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      // Convert Date objects to Timestamps
      if (updates.paidAt) {
        updateData.paidAt = Timestamp.fromDate(updates.paidAt);
      }
      if (updates.reviewedAt) {
        updateData.reviewedAt = Timestamp.fromDate(updates.reviewedAt);
      }

      await updateDoc(paymentRef, updateData);
      console.log('✅ Payment updated:', id);

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
    const success = await updatePayment(paymentId, {
      proofStatus: 'approved',
      status: 'completed',
      reviewedBy: userId,
      reviewedAt: new Date(),
      paidAt: new Date(),
    });

    if (success) {
      toast.success('Comprobante aprobado', {
        description: 'El pago ha sido confirmado',
      });
    }

    return success;
  };

  const rejectProof = async (
    paymentId: string,
    userId: string,
    reason: string
  ): Promise<boolean> => {
    const success = await updatePayment(paymentId, {
      proofStatus: 'rejected',
      status: 'failed',
      reviewedBy: userId,
      reviewedAt: new Date(),
      rejectionReason: reason,
    });

    if (success) {
      toast.success('Comprobante rechazado', {
        description: 'Se ha notificado al cliente',
      });
    }

    return success;
  };

  const deletePayment = async (id: string): Promise<boolean> => {
    if (!tenant?.id) {
      toast.error('Error', { description: 'No se encontró el tenant' });
      return false;
    }

    try {
      const paymentRef = doc(db, 'tenants', tenant.id, 'payments', id);
      await deleteDoc(paymentRef);
      console.log('✅ Payment deleted:', id);

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
