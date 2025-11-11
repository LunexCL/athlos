import { useIonToast } from '@ionic/react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  title?: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
}

/**
 * Custom hook for showing toast notifications
 * Uses Ionic Toast component
 */
export const useToast = () => {
  const [present] = useIonToast();

  const toast = ({ title, message, variant = 'info', duration = 3000 }: ToastOptions) => {
    const colors: Record<ToastVariant, string> = {
      success: 'success',
      error: 'danger',
      warning: 'warning',
      info: 'primary',
    };

    const icons: Record<ToastVariant, string> = {
      success: 'checkmark-circle',
      error: 'close-circle',
      warning: 'warning',
      info: 'information-circle',
    };

    present({
      message: title ? `<strong>${title}</strong><br/>${message}` : message,
      duration,
      color: colors[variant],
      icon: icons[variant],
      position: 'top',
      buttons: [
        {
          text: 'Cerrar',
          role: 'cancel',
        },
      ],
    });
  };

  return { toast };
};
