import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
import { MOCK_BRANDS } from '../../services/mockData';
import { Brand } from '../../types';
import { Modal } from '../../components/Modal';

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>(MOCK_BRANDS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [color, setColor] = useState('#000000');

  const handleOpenModal = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand);
      setName(brand.name);
      setColor(brand.color);
    } else {
      setEditingBrand(null);
      setName('');
      setColor('#000000');
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;

    if (editingBrand) {
      // Update existing
      setBrands(brands.map(b => 
        b.id === editingBrand.id ? { ...b, name, color } : b
      ));
    } else {
      // Create new
      setBrands([...brands, { 
        id: Date.now().toString(), 
        name, 
        color, 
        isActive: true 
      }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta marca?')) {
      setBrands(brands.filter(b => b.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Marcas</h2>
        <button 
          onClick={() => handleOpenModal()} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} /> Nueva Marca
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {brands.map(brand => (
          <div key={brand.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center group relative hover:shadow-md transition-shadow">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mb-3 text-white shadow-sm"
              style={{ backgroundColor: brand.color }}
            >
              <Tag size={24} />
            </div>
            <h3 className="font-bold text-lg text-gray-800 mb-1">{brand.name}</h3>
            <span className="text-xs text-gray-400 mb-4">ID: {brand.id}</span>
            
            <div className="flex gap-2 w-full pt-4 border-t border-gray-100 mt-auto">
              <button 
                onClick={() => handleOpenModal(brand)}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
              >
                <Edit2 size={16} /> Editar
              </button>
              <button 
                onClick={() => handleDelete(brand.id)}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                <Trash2 size={16} /> Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingBrand ? 'Editar Marca' : 'Nueva Marca'}
      >
         <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Marca</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
                value={name} 
                onChange={e => setName(e.target.value)}
                placeholder="Ej. Nike, Adidas..."
                autoFocus
              />
            </div>
            
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Color Identificativo</label>
               <div className="flex gap-2 flex-wrap mt-2">
                  {['#000000', '#0051ba', '#1428a0', '#555555', '#dc2626', '#16a34a', '#d97706', '#9333ea'].map(c => (
                     <button 
                       key={c}
                       onClick={() => setColor(c)}
                       className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-gray-900 ring-2 ring-gray-200' : 'border-transparent'}`}
                       style={{backgroundColor: c}}
                       title={c}
                     />
                  ))}
               </div>
               <div className="mt-2 flex items-center gap-2">
                 <span className="text-xs text-gray-500">Personalizado:</span>
                 <input 
                   type="color" 
                   value={color}
                   onChange={(e) => setColor(e.target.value)}
                   className="h-8 w-14 rounded cursor-pointer"
                 />
               </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
               <button 
                 onClick={() => setIsModalOpen(false)} 
                 className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
               >
                 Cancelar
               </button>
               <button 
                 onClick={handleSave} 
                 className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
               >
                 {editingBrand ? 'Actualizar' : 'Guardar'}
               </button>
            </div>
         </div>
      </Modal>
    </div>
  );
}