import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '../auth/AuthContext';
import { usePayments } from './hooks/usePayments';
import { 
  History, 
  Search, 
  Filter, 
  Download,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  FileText,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { PaymentStatus } from './types';

const statusConfig: Record<PaymentStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  completed: { label: 'Completado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  failed: { label: 'Fallido', color: 'bg-red-100 text-red-800', icon: XCircle },
  refunded: { label: 'Reembolsado', color: 'bg-purple-100 text-purple-800', icon: History },
  under_review: { label: 'En revisión', color: 'bg-blue-100 text-blue-800', icon: FileText },
};

export const PaymentHistoryPage: React.FC = () => {
  const { tenant } = useAuth();
  const { payments, loading } = usePayments();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate totals
  const totalCompleted = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

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
    });
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <History className="h-7 w-7 text-primary" />
              Historial de Pagos
            </h1>
            <p className="text-gray-500 mt-1">
              Revisa todos los pagos recibidos de tus clientes
            </p>
          </div>
          
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Recaudado</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(totalCompleted)}</p>
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
                  <p className="text-sm text-gray-500">Pagos Completados</p>
                  <p className="text-2xl font-bold">{payments.filter(p => p.status === 'completed').length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600">{payments.filter(p => p.status === 'pending').length}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por cliente o ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | 'all')}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  <option value="all">Todos los estados</option>
                  <option value="completed">Completados</option>
                  <option value="pending">Pendientes</option>
                  <option value="under_review">En revisión</option>
                  <option value="failed">Fallidos</option>
                  <option value="refunded">Reembolsados</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pagos ({filteredPayments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : paginatedPayments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No se encontraron pagos</p>
              </div>
            ) : (
              <div className="space-y-3">
                {paginatedPayments.map((payment) => {
                  const status = statusConfig[payment.status] || statusConfig.pending;
                  const StatusIcon = status.icon;
                  
                  return (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${payment.provider === 'mercadopago' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          {payment.provider === 'mercadopago' ? (
                            <CreditCard className="h-5 w-5 text-blue-600" />
                          ) : (
                            <FileText className="h-5 w-5 text-gray-600" />
                          )}
                        </div>
                        
                        <div>
                          <p className="font-medium">{payment.clientName || 'Cliente'}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-3 w-3" />
                            {formatDate(payment.createdAt)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${status.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </span>
                        
                        <span className="font-bold text-lg">
                          {formatCurrency(payment.amount)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <p className="text-sm text-gray-500">
                  Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredPayments.length)} de {filteredPayments.length}
                </p>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};
