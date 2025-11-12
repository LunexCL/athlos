import { useState } from 'react';
import { DashboardLayout } from '@/app/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Users, UserPlus, UserCheck, UserX } from 'lucide-react';
import { NewClientModal } from './NewClientModal';

export const ClientListPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewClientModal, setShowNewClientModal] = useState(false);

  // Mock data - will be replaced with real data from Firestore
  const clients = [];

  const stats = [
    { label: 'Total Clientes', value: '0', icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { label: 'Activos', value: '0', icon: UserCheck, color: 'text-green-600', bgColor: 'bg-green-50' },
    { label: 'Invitados', value: '0', icon: UserPlus, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { label: 'Inactivos', value: '0', icon: UserX, color: 'text-gray-600', bgColor: 'bg-gray-50' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
            <p className="text-gray-500 mt-1">Gestiona tus clientes y sus invitaciones</p>
          </div>
          <Button
            onClick={() => setShowNewClientModal(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Cliente
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
            <CardDescription>Busca y filtra tus clientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre o email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">Filtros</Button>
            </div>

            {/* Empty State */}
            {clients.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay clientes registrados
                </h3>
                <p className="text-gray-500 mb-6">
                  Comienza agregando tu primer cliente
                </p>
                <Button onClick={() => setShowNewClientModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Cliente
                </Button>
              </div>
            )}

            {/* Client List - will be implemented with real data */}
          </CardContent>
        </Card>
      </div>

      {/* New Client Modal */}
      <NewClientModal
        open={showNewClientModal}
        onOpenChange={setShowNewClientModal}
      />
    </DashboardLayout>
  );
};
