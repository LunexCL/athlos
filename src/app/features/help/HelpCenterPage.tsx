import React, { useState } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  HelpCircle, 
  Search,
  Calendar,
  Users,
  CreditCard,
  Settings,
  MessageCircle,
  Mail,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Video,
  FileText,
  Zap,
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqItems: FAQItem[] = [
  {
    category: 'Calendario',
    question: '¿Cómo agendo una clase con un cliente?',
    answer: 'Ve a la sección "Calendario", haz clic en el día deseado y selecciona "Nueva Cita". Elige el cliente, la hora y duración, y guarda. La cita aparecerá en tu calendario automáticamente.',
  },
  {
    category: 'Calendario',
    question: '¿Cómo configuro mi disponibilidad horaria?',
    answer: 'En el menú lateral, ve a "Disponibilidad". Ahí puedes agregar los bloques de horarios en los que estás disponible para recibir clientes. Puedes seleccionar múltiples días a la vez.',
  },
  {
    category: 'Calendario',
    question: '¿Puedo crear clases recurrentes?',
    answer: 'Sí, al crear una cita puedes marcar la opción "Clase recurrente" y definir cada cuánto se repite (semanal, quincenal, etc.) y hasta qué fecha. Todas las clases se crearán automáticamente.',
  },
  {
    category: 'Clientes',
    question: '¿Cómo agrego un nuevo cliente?',
    answer: 'Ve a "Clientes" en el menú lateral y haz clic en "Nuevo Cliente". Completa los datos básicos como nombre, email y teléfono. El cliente quedará registrado y podrás agendarle clases.',
  },
  {
    category: 'Clientes',
    question: '¿Puedo importar clientes desde Excel?',
    answer: 'Esta función estará disponible próximamente. Por ahora, puedes agregar clientes manualmente uno por uno desde la sección de Clientes.',
  },
  {
    category: 'Pagos',
    question: '¿Cómo configuro los pagos?',
    answer: 'Ve a "Configuración de Pagos" en el menú. Puedes elegir entre pago manual (transferencia bancaria) o Mercado Pago. Configura tus precios por deporte, duración y cantidad de participantes.',
  },
  {
    category: 'Pagos',
    question: '¿Cómo apruebo un comprobante de pago?',
    answer: 'Cuando un cliente sube un comprobante, aparecerá en "Comprobantes Pendientes". Revisa que el monto y fecha coincidan, y haz clic en "Aprobar" o "Rechazar" según corresponda.',
  },
  {
    category: 'Pagos',
    question: '¿Puedo ver el historial de pagos?',
    answer: 'Sí, en "Historial de Pagos" puedes ver todos los pagos recibidos, filtrar por estado y exportar la información. También verás estadísticas de tu recaudación.',
  },
  {
    category: 'Grupos',
    question: '¿Qué son las academias/grupos?',
    answer: 'Las academias te permiten agrupar clases con múltiples alumnos. Por ejemplo, una "Academia de Tenis Infantil" donde tienes clases grupales los martes y jueves. Puedes gestionar inscripciones y asistencia.',
  },
  {
    category: 'Cuenta',
    question: '¿Cómo cambio mi contraseña?',
    answer: 'Ve a Configuración (ícono de engranaje) y selecciona "Cambiar contraseña". Ingresa tu contraseña actual y la nueva contraseña dos veces para confirmar.',
  },
];

const categories = [
  { id: 'all', label: 'Todas', icon: HelpCircle },
  { id: 'Calendario', label: 'Calendario', icon: Calendar },
  { id: 'Clientes', label: 'Clientes', icon: Users },
  { id: 'Pagos', label: 'Pagos', icon: CreditCard },
  { id: 'Grupos', label: 'Grupos', icon: Users },
  { id: 'Cuenta', label: 'Cuenta', icon: Settings },
];

const resources = [
  {
    title: 'Guía de inicio rápido',
    description: 'Aprende lo básico en 5 minutos',
    icon: Zap,
    color: 'bg-yellow-100 text-yellow-600',
  },
  {
    title: 'Video tutoriales',
    description: 'Tutoriales paso a paso',
    icon: Video,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    title: 'Documentación',
    description: 'Guías detalladas',
    icon: BookOpen,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    title: 'Notas de versión',
    description: 'Últimas actualizaciones',
    icon: FileText,
    color: 'bg-green-100 text-green-600',
  },
];

export const HelpCenterPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const filteredFAQs = faqItems.filter(item => {
    const matchesSearch = 
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const toggleExpand = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Centro de Ayuda
          </h1>
          <p className="text-gray-500 mt-2">
            Encuentra respuestas a tus preguntas o contáctanos para soporte
          </p>
          
          {/* Search */}
          <div className="relative mt-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Buscar en preguntas frecuentes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 py-6 text-lg"
            />
          </div>
        </div>

        {/* Quick Resources */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {resources.map((resource, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6 text-center">
                <div className={`inline-flex p-3 rounded-full ${resource.color} mb-3`}>
                  <resource.icon className="h-5 w-5" />
                </div>
                <h3 className="font-medium text-sm">{resource.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{resource.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="gap-2"
            >
              <category.icon className="h-4 w-4" />
              {category.label}
            </Button>
          ))}
        </div>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle>Preguntas Frecuentes</CardTitle>
            <CardDescription>
              {filteredFAQs.length} {filteredFAQs.length === 1 ? 'pregunta encontrada' : 'preguntas encontradas'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No se encontraron preguntas que coincidan</p>
                <p className="text-sm mt-1">Intenta con otros términos o contacta a soporte</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFAQs.map((item, index) => (
                  <div
                    key={index}
                    className="border rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => toggleExpand(index)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                          {item.category}
                        </span>
                        <span className="font-medium">{item.question}</span>
                      </div>
                      {expandedItems.has(index) ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    
                    {expandedItems.has(index) && (
                      <div className="px-4 pb-4 pt-0 text-gray-600 border-t bg-gray-50">
                        <p className="pt-4">{item.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <MessageCircle className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">¿No encontraste lo que buscabas?</h3>
                  <p className="text-gray-600">Nuestro equipo está listo para ayudarte</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button variant="outline" className="gap-2">
                  <Mail className="h-4 w-4" />
                  Enviar email
                </Button>
                <Button className="gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Chat en vivo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};
