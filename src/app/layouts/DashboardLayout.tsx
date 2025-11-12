import { ReactNode, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Users, 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Menu,
  X,
  Dumbbell,
  CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface DashboardLayoutProps {
  children: ReactNode;
}

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, tenant, logout } = useAuth();
  const history = useHistory();
  const location = useLocation();

  const navItems: NavItem[] = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/home' },
    { label: 'Agenda', icon: Calendar, path: '/calendar' },
    { label: 'Clientes', icon: Users, path: '/clients' },
    { label: 'Rutinas', icon: Dumbbell, path: '/routines' },
    { label: 'Pagos', icon: CreditCard, path: '/payments' },
    { label: 'Configuración', icon: Settings, path: '/settings' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Sesión cerrada', {
        description: 'Has cerrado sesión exitosamente',
      });
      history.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error', {
        description: 'Error al cerrar sesión',
      });
    }
  };

  const navigateTo = (path: string) => {
    history.push(path);
    setSidebarOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hover:bg-gray-100"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Athlos
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {user?.displayName?.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 shadow-xl lg:shadow-none',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Athlos
            </h1>
          </div>

          {/* User Info */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-br from-gray-50 to-white">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">
                  {user?.displayName?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.displayName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {tenant?.name}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <button
                  key={item.path}
                  onClick={() => navigateTo(item.path)}
                  className={cn(
                    'w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                    active
                      ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 font-medium"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
