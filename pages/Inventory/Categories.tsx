import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Layers } from 'lucide-react';
import { MOCK_CATEGORIES } from '../../services/mockData';
import { Category } from '../../types';
import { Modal } from '../../components/Modal';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [color, setColor] = useState('#000000');

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setName(category.name);
      setColor(category.color);
    } else {
      setEditingCategory(null);
      setName('');
      setColor('#000000');
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;

    if (editingCategory) {
      // Update existing
      setCategories(categories.map(c => 
        c.id === editingCategory.id ? { ...c, name, color } : c
      ));
    } else {
      // Create new
      setCategories([...categories, { 
        id: Date.now().toString(), 
        name, 
        color, 
        isActive: true 
      }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta categoría?')) {
      setCategories(categories.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Categorías</h2>
        <button 
          onClick={() => handleOpenModal()} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} /> Nueva Categoría
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold shadow-sm" 
                style={{ backgroundColor: cat.color }}
              >
                {cat.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{cat.name}</h3>
                <span className="text-xs text-gray-400 font-mono">ID: {cat.id}</span>
              </div>
            </div>
            <div className="flex gap-2">
               <button 
                 onClick={() => handleOpenModal(cat)}
                 className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                 title="Editar"
               >
                 <Edit2 size={18}/>
               </button>
               <button 
                 onClick={() => handleDelete(cat.id)}
                 className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                 title="Eliminar"
               >
                 <Trash2 size={18}/>
               </button>
            </div>
          </div>
        ))}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
      >
         <div className="space-y-4">
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Categoría</label>
               <input 
                 type="text" 
                 className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
                 value={name} 
                 onChange={e => setName(e.target.value)} 
                 placeholder="Ej. Zapatillas, Ropa..."
                 autoFocus
               />
            </div>
            
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Color Identificativo</label>
               <div className="flex gap-3 flex-wrap mt-2">
                  {['#ff6b6b', '#4ecdc4', '#ffe66d', '#1a535c', '#ff9f1c', '#3b82f6', '#8b5cf6', '#ec4899'].map(c => (
                     <button 
                       key={c}
                       onClick={() => setColor(c)}
                       className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-gray-900 ring-2 ring-gray-200' : 'border-transparent'}`}
                       style={{backgroundColor: c}}
                       title={c}
                     />
                  ))}
               </div>
               <div className="mt-3 flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-200">
                 <span className="text-xs text-gray-500 font-medium">Color Personalizado:</span>
                 <input 
                   type="color" 
                   value={color}
                   onChange={(e) => setColor(e.target.value)}
                   className="h-8 w-14 rounded cursor-pointer bg-transparent border-none"
                 />
                 <span className="text-xs font-mono text-gray-400">{color}</span>
               </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
               <button 
                 onClick={() => setIsModalOpen(false)} 
                 className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
               >
                 Cancelar
               </button>
               <button 
                 onClick={handleSave} 
                 className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-md transition-colors"
               >
                 {editingCategory ? 'Actualizar' : 'Guardar'}
               </button>
            </div>
         </div>
      </Modal>
    </div>
  );
}