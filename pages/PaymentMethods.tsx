
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { PaymentMethod } from '../types';
import { Modal } from '../components/Modal';

interface PaymentMethodsPageProps {
  paymentMethods: PaymentMethod[];
  onUpdate: (methods: PaymentMethod[]) => void;
}

export default function PaymentMethodsPage({ paymentMethods, onUpdate }: PaymentMethodsPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(true);

  const handleOpenModal = (method?: PaymentMethod) => {
    if (method) {
      setEditingMethod(method);
      setName(method.name);
      setIsActive(method.isActive);
    } else {
      setEditingMethod(null);
      setName('');
      setIsActive(true);
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;

    if (editingMethod) {
      onUpdate(paymentMethods.map(m => 
        m.id === editingMethod.id ? { ...m, name, isActive } : m
      ));
    } else {
      onUpdate([...paymentMethods, {
        id: Date.now().toString(),
        name,
        isActive
      }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este método de pago?')) {
      onUpdate(paymentMethods.filter(m => m.id !== id));
    }
  };

  const toggleStatus = (id: string) => {
     onUpdate(paymentMethods.map(m => 
        m.id === id ? { ...m, isActive: !m.isActive } : m
     ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Métodos de Pago</h2>
        <button 
          onClick={() => handleOpenModal()} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} /> Nuevo Método
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paymentMethods.map(method => (
          <div key={method.id} className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-all ${!method.isActive ? 'opacity-75 bg-gray-50' : ''}`}>
             <div className="flex justify-between items-start mb-4">
               <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                  <CreditCard size={24} />
               </div>
               <div className="flex gap-2">
                 <button onClick={() => handleOpenModal(method)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                    <Edit2 size={16} />
                 </button>
                 <button onClick={() => handleDelete(method.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                    <Trash2 size={16} />
                 </button>
               </div>
             </div>
             
             <h3 className="font-bold text-gray-800 text-lg mb-2">{method.name}</h3>
             
             <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                <button 
                  onClick={() => toggleStatus(method.id)}
                  className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 ${method.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}
                >
                  {method.isActive ? <CheckCircle size={12}/> : <XCircle size={12}/>}
                  {method.isActive ? 'Activo' : 'Inactivo'}
                </button>
                <span className="text-xs text-gray-400">ID: {method.id}</span>
             </div>
          </div>
        ))}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingMethod ? 'Editar Método de Pago' : 'Nuevo Método de Pago'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="Ej. Yape, Plin, Efectivo..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input 
              type="checkbox" 
              id="methodActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="methodActive" className="text-sm text-gray-700">Habilitar este método de pago</label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-gray-600">Cancelar</button>
            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">Guardar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
