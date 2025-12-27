import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import ClientModel from '@/estructura/Client';
import type { ClientStatus } from '@/estructura/Client';

// Re-exportar tipo para compatibilidad con código existente
export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  status: ClientStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Convertir modelo a interfaz para compatibilidad
const toClientInterface = (client: ClientModel): Client => ({
  id: client.docId,
  name: client.name,
  email: client.email,
  phone: client.phone || undefined,
  notes: client.notes || undefined,
  status: client.status,
  createdAt: client.createdAt,
  updatedAt: client.updatedAt,
});

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { tenant, user } = useAuth();

  useEffect(() => {
    if (!tenant?.id) {
      setClients([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Listener en tiempo real usando el modelo Client
    const unsubscribe = ClientModel.onSnapshotOrdered(
      tenant.id,
      'createdAt',
      'desc',
      (clientModels) => {
        setClients(clientModels.map(toClientInterface));
        setLoading(false);
        setError(null);
      }
    );

    return () => unsubscribe();
  }, [tenant?.id]);

  const addClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    if (!tenant?.id) throw new Error('No tenant ID');

    // Validar que el correo del cliente no sea el mismo que el del tenant
    if (user?.email && clientData.email.toLowerCase() === user.email.toLowerCase()) {
      throw new Error('NO_PUEDE_CREAR_CLIENTE_CON_SU_PROPIO_EMAIL');
    }

    const client = new ClientModel(tenant.id);
    client.name = clientData.name;
    client.email = clientData.email;
    client.phone = clientData.phone || '';
    client.notes = clientData.notes || '';
    client.status = 'active';
    
    await client.save();
    return client.docId;
  };

  const updateClient = async (clientId: string, updates: Partial<Omit<Client, 'id' | 'createdAt' | 'updatedAt'>>) => {
    if (!tenant?.id) throw new Error('No tenant ID');

    // Validar que si se está actualizando el email, no sea el mismo que el del tenant
    if (updates.email && user?.email && updates.email.toLowerCase() === user.email.toLowerCase()) {
      throw new Error('NO_PUEDE_ACTUALIZAR_CLIENTE_CON_SU_PROPIO_EMAIL');
    }

    const client = await ClientModel.getById(tenant.id, clientId);
    if (!client) throw new Error('Cliente no encontrado');

    if (updates.name !== undefined) client.name = updates.name;
    if (updates.email !== undefined) client.email = updates.email;
    if (updates.phone !== undefined) client.phone = updates.phone || '';
    if (updates.notes !== undefined) client.notes = updates.notes || '';
    if (updates.status !== undefined) client.status = updates.status;
    
    await client.save();
  };

  const deleteClient = async (clientId: string) => {
    if (!tenant?.id) throw new Error('No tenant ID');

    const client = await ClientModel.getById(tenant.id, clientId);
    if (!client) throw new Error('Cliente no encontrado');
    
    await client.delete();
  };

  return {
    clients,
    loading,
    error,
    addClient,
    updateClient,
    deleteClient,
  };
};
