import React, { useState } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '../auth/AuthContext';
import { usePayments } from './hooks/usePayments';
import { useToast } from '@/components/ui/use-toast';
import { 
  FileCheck, 
  Clock, 
  CheckCircle, 
  XCircle,
  Image,
  User,
  Calendar,
  DollarSign,
  Eye,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const PendingProofsPage: React.FC = () => {
  const { tenant, user } = useAuth();
  const { payments, loading, approveProof, rejectProof } = usePayments();
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedProof, setSelectedProof] = useState<string | null>(null);

  // Filter only payments with pending proofs (manual payments under review)
  const pendingProofs = payments.filter(
    p => p.provider === 'manual' && (p.status === 'under_review' || p.status === 'pending') && p.proofUrl
  );

  const handleApprove = async (paymentId: string) => {
    if (!user?.uid) return;
    setProcessingId(paymentId);
    try {
      const success = await approveProof(paymentId, user.uid);
      if (success) {
        toast({
          variant: 'success',
          title: 'Comprobante aprobado',
          message: 'El pago ha sido marcado como completado',
        });
      }
    } catch (error) {
      toast({
        variant: 'error',
        title: 'Error',
        message: 'No se pudo aprobar el comprobante',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (paymentId: string) => {
    if (!user?.uid) return;
    setProcessingId(paymentId);
    try {
      const success = await rejectProof(paymentId, user.uid, 'Comprobante rechazado');
      if (success) {
        toast({
          variant: 'success',
          title: 'Comprobante rechazado',
          message: 'El pago ha sido marcado como fallido',
        });
      }
    } catch (error) {
      toast({
        variant: 'error',
        title: 'Error',
        message: 'No se pudo rechazar el comprobante',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileCheck className="h-7 w-7 text-primary" />
            Comprobantes Pendientes
          </h1>
          <p className="text-gray-500 mt-1">
            Revisa y aprueba los comprobantes de pago de tus clientes
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Por Revisar</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingProofs.length}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Aprobados Hoy</p>
                  <p className="text-2xl font-bold text-green-600">
                    {payments.filter(p => 
                      p.status === 'completed' && 
                      p.provider === 'manual' &&
                      new Date(p.updatedAt).toDateString() === new Date().toDateString()
                    ).length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Monto Pendiente</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(pendingProofs.reduce((sum, p) => sum + (p.amount || 0), 0))}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Proofs List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Comprobantes por Revisar</CardTitle>
            <CardDescription>
              Verifica que los datos del comprobante coincidan con el monto y aprueba o rechaza
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : pendingProofs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
                <p className="font-medium">¡Todo al día!</p>
                <p className="text-sm">No hay comprobantes pendientes de revisión</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingProofs.map((payment) => (
                  <div
                    key={payment.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Payment Info */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{payment.clientName || 'Cliente'}</span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(payment.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {formatCurrency(payment.amount)}
                          </span>
                        </div>
                        
                        {payment.rejectionReason && (
                          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            {payment.rejectionReason}
                          </p>
                        )}
                      </div>
                      
                      {/* Proof Image */}
                      <div className="flex items-center gap-3">
                        {payment.proofUrl && (
                          <a
                            href={payment.proofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            <Image className="h-4 w-4" />
                            <span className="text-sm">Ver comprobante</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(payment.id)}
                          disabled={processingId === payment.id}
                          className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <ThumbsDown className="h-4 w-4" />
                          Rechazar
                        </Button>
                        
                        <Button
                          size="sm"
                          onClick={() => handleApprove(payment.id)}
                          disabled={processingId === payment.id}
                          className="gap-1 bg-green-600 hover:bg-green-700"
                        >
                          {processingId === payment.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          ) : (
                            <ThumbsUp className="h-4 w-4" />
                          )}
                          Aprobar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900">¿Cómo revisar comprobantes?</h3>
                <ul className="mt-2 text-sm text-blue-800 space-y-1">
                  <li>• Verifica que el monto del comprobante coincida con el monto a pagar</li>
                  <li>• Confirma que la fecha de la transferencia sea reciente</li>
                  <li>• Revisa que el nombre del cliente coincida (si está visible)</li>
                  <li>• Si el comprobante es válido, haz clic en "Aprobar"</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};
