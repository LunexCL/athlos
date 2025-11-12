import { useAuth } from '../auth/AuthContext';
import { DashboardLayout } from '@/app/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Activity, TrendingUp } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { user, userProfile, tenant } = useAuth();

  const stats = [
    {
      title: 'Clientes Activos',
      value: '0',
      icon: Users,
      description: 'Total de clientes registrados',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Clases Esta Semana',
      value: '0',
      icon: Calendar,
      description: 'Clases programadas',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Rutinas Activas',
      value: '0',
      icon: Activity,
      description: 'Rutinas asignadas',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Ingresos del Mes',
      value: '$0',
      icon: TrendingUp,
      description: 'Total facturado',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            ¡Bienvenido, {user?.displayName?.split(' ')[0] || 'Usuario'}! 👋
          </h1>
          <p className="text-lg text-gray-500">
            Aquí está un resumen de tu actividad
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={index} 
                className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-white"
              >
                {/* Gradient background */}
                <div className={`absolute inset-0 opacity-5 ${stat.bgColor}`} />
                
                <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-3 rounded-xl ${stat.bgColor} shadow-lg`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <p className="text-xs text-gray-500">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Profile */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="border-b bg-white/50">
              <CardTitle className="text-xl">Tu Perfil</CardTitle>
              <CardDescription>Información de tu cuenta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1 pt-6">
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Email</span>
                <span className="text-sm font-semibold text-gray-900">{user?.email}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Rol</span>
                <span className="text-sm font-semibold text-gray-900 capitalize">{user?.role}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Estado</span>
                <span className={`text-sm font-semibold inline-flex items-center px-2.5 py-0.5 rounded-full ${user?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {user?.isActive ? '● Activo' : '● Inactivo'}
                </span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-sm font-medium text-gray-600">Email verificado</span>
                <span className={`text-sm font-semibold inline-flex items-center px-2.5 py-0.5 rounded-full ${user?.emailVerified ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                  {user?.emailVerified ? '✓ Verificado' : '⏱ Pendiente'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Tenant Info */}
          {tenant && (
            <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50">
              <CardHeader className="border-b bg-white/50">
                <CardTitle className="text-xl">Tu Negocio</CardTitle>
                <CardDescription>Información de tu cuenta empresarial</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1 pt-6">
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Nombre</span>
                  <span className="text-sm font-semibold text-gray-900">{tenant.name}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Plan</span>
                  <span className="text-sm font-semibold inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 capitalize">
                    {tenant.plan}
                  </span>
                </div>
                {tenant.settings?.businessType && (
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Tipo</span>
                    <span className="text-sm font-semibold text-gray-900 capitalize">
                      {tenant.settings.businessType === 'gym' ? 'Gimnasio' :
                       tenant.settings.businessType === 'clinic' ? 'Clínica' :
                       tenant.settings.businessType === 'personal_training' ? 'Entrenamiento Personal' :
                       'Otro'}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-3">
                  <span className="text-sm font-medium text-gray-600">Estado</span>
                  <span className={`text-sm font-semibold inline-flex items-center px-2.5 py-0.5 rounded-full ${tenant.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {tenant.isActive ? '● Activo' : '● Inactivo'}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-gray-50 to-white">
          <CardHeader className="border-b bg-white/50">
            <CardTitle className="text-xl">Próximas Funcionalidades</CardTitle>
            <CardDescription>Estas funcionalidades estarán disponibles pronto</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="group p-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-not-allowed opacity-60 bg-white">
                <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Calendar className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Gestionar Agenda</h3>
                <p className="text-sm text-gray-600">
                  Programa y gestiona tus clases con un calendario visual
                </p>
              </div>
              <div className="group p-6 border-2 border-gray-200 rounded-xl hover:border-green-300 hover:shadow-lg transition-all duration-300 cursor-not-allowed opacity-60 bg-white">
                <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-7 w-7 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Administrar Clientes</h3>
                <p className="text-sm text-gray-600">
                  Agrega y gestiona la información de tus clientes
                </p>
              </div>
              <div className="group p-6 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-lg transition-all duration-300 cursor-not-allowed opacity-60 bg-white">
                <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Activity className="h-7 w-7 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Crear Rutinas</h3>
                <p className="text-sm text-gray-600">
                  Diseña planes de entrenamiento personalizados
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};
