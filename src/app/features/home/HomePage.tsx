import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export const HomePage: React.FC = () => {
  const { user, userProfile, tenant, logout } = useAuth();
  const history = useHistory();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        variant: 'success',
        title: 'Sesión cerrada',
        message: 'Has cerrado sesión exitosamente',
      });
      history.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        variant: 'error',
        title: 'Error',
        message: 'Error al cerrar sesión',
      });
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Inicio</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="space-y-4">
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Bienvenido, {user?.displayName || 'Usuario'}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent className="space-y-2">
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>UID:</strong> {user?.uid}</p>
              <p><strong>Email verificado:</strong> {user?.emailVerified ? 'Sí' : 'No'}</p>
              {user?.role && <p><strong>Rol:</strong> {user.role}</p>}
              {user?.tenantId && <p><strong>Tenant ID:</strong> {user.tenantId}</p>}
              {user?.isActive !== undefined && (
                <p><strong>Activo:</strong> {user.isActive ? 'Sí' : 'No'}</p>
              )}
            </IonCardContent>
          </IonCard>

          {userProfile && (
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Perfil de Usuario</IonCardTitle>
              </IonCardHeader>
              <IonCardContent className="space-y-2">
                <p><strong>Nombre:</strong> {userProfile.displayName}</p>
                <p><strong>Rol:</strong> {userProfile.role}</p>
                <p><strong>Tenant ID:</strong> {userProfile.tenantId}</p>
              </IonCardContent>
            </IonCard>
          )}

          {tenant && (
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Información del Tenant</IonCardTitle>
              </IonCardHeader>
              <IonCardContent className="space-y-2">
                <p><strong>Nombre:</strong> {tenant.name}</p>
                <p><strong>Plan:</strong> {tenant.plan}</p>
                <p><strong>Owner ID:</strong> {tenant.ownerId}</p>
                {tenant.settings?.businessName && (
                  <p><strong>Negocio:</strong> {tenant.settings.businessName}</p>
                )}
                {tenant.settings?.businessType && (
                  <p><strong>Tipo:</strong> {tenant.settings.businessType}</p>
                )}
              </IonCardContent>
            </IonCard>
          )}

          <IonButton expand="block" color="danger" onClick={handleLogout}>
            Cerrar Sesión
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};
