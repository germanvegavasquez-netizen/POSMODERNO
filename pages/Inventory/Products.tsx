
import React, { useState } from 'react';
import { Plus, Search, Filter, Image as ImageIcon, Trash2, Edit2, AlertTriangle, ScanBarcode, RefreshCw } from 'lucide-react';
import { MOCK_PRODUCTS, MOCK_BRANDS, MOCK_CATEGORIES } from '../../services/mockData';
import { Product, CompanySettings } from '../../types';
import { Modal } from '../../components/Modal';

interface ProductsPageProps {
  settings: CompanySettings;
}

export default function ProductsPage({ settings }: ProductsPageProps) {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({ 
    code: '', name: '', 
    buyPrice: 0, priceRetail: 0, priceWholesale: 0, priceSpecial: 0, 
    stock: 0, minStock: 5, categoryId: '', brandId: '', isActive: true 
  });

  const getBrandName = (id: string) => MOCK_BRANDS.find(b => b.id === id)?.name || '-';
  const getCategoryName = (id: string) => MOCK_CATEGORIES.find(c => c.id === id)?.name || '-';

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({ 
        code: '', name: '', 
        buyPrice: 0, priceRetail: 0, priceWholesale: 0, priceSpecial: 0, 
        stock: 0, minStock: 5, categoryId: '', brandId: '', isActive: true 
      });
    }
    setIsModalOpen(true);
  };

  const generateBarcode = () => {
    // Generate a random 13 digit number (EAN-13 simulation)
    const randomCode = Math.floor(1000000000000 + Math.random() * 9000000000000).toString();
    setFormData(prev => ({ ...prev, code: randomCode }));
  };

  const handleSave = () => {
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...formData } as Product : p));
    } else {
      setProducts([...products, { 
        ...formData, 
        id: Date.now().toString(), 
        imageUrl: 'https://picsum.photos/200/200?random=' + Date.now() 
      } as Product]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Productos</h2>
        <button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex gap-2"><Plus /> Nuevo Producto</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map(product => {
          const isLowStock = product.stock <= product.minStock;
          return (
            <div key={product.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden group flex flex-col ${isLowStock ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-100'}`}>
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                 <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                 <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold shadow-sm flex items-center gap-1 ${isLowStock ? 'bg-red-500 text-white animate-pulse' : 'bg-white/90 backdrop-blur text-gray-800'}`}>
                   {isLowStock && <AlertTriangle size={12} />}
                   Stock: {product.stock}
                 </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                 <div className="flex justify-between items-start mb-1">
                   <h3 className="font-bold text-gray-800 line-clamp-1">{product.name}</h3>
                 </div>
                 <div className="flex items-center gap-1 text-xs text-gray-500 mb-2 font-mono bg-gray-50 px-2 py-1 rounded w-fit">
                    <ScanBarcode size={12} />
                    {product.code}
                 </div>
                 <p className="text-xs text-gray-500 mb-2">{getBrandName(product.brandId)} • {getCategoryName(product.categoryId)}</p>
                 
                 {/* Stock Indicator Bar */}
                 <div className="mb-4">
                    <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                      <span>Disponible</span>
                      <span className={isLowStock ? 'text-red-500 font-bold' : ''}>Min: {product.minStock}</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${isLowStock ? 'bg-red-500' : 'bg-green-500'}`} 
                        style={{ width: `${Math.min((product.stock / (product.minStock * 3)) * 100, 100)}%` }}
                      ></div>
                    </div>
                    {isLowStock && <p className="text-[10px] text-red-500 mt-1 font-medium">⚠️ Reabastecer pronto</p>}
                 </div>

                 <div className="flex justify-between items-end mt-auto pt-4 border-t border-dashed mb-4">
                   <div>
                     <div className="text-xs text-gray-400">P. Menudeo</div>
                     <div className="text-lg font-bold text-blue-600">{settings.currencySymbol} {product.priceRetail.toFixed(2)}</div>
                   </div>
                   <div className="text-right">
                     <div className="text-xs text-gray-400">Costo</div>
                     <div className="text-sm font-medium text-gray-600">{settings.currencySymbol} {product.buyPrice.toFixed(2)}</div>
                   </div>
                 </div>

                 <div className="flex gap-2">
                   <button 
                      onClick={() => handleOpenModal(product)}
                      className="flex-1 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                   >
                      <Edit2 size={16} /> Editar
                   </button>
                   <button 
                      onClick={() => handleDelete(product.id)}
                      className="flex-1 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                   >
                      <Trash2 size={16} /> Eliminar
                   </button>
                 </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProduct ? "Editar Producto" : "Nuevo Producto"}>
         <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div className="col-span-2 md:col-span-1">
                  <label className="text-sm font-medium text-gray-700 flex justify-between items-center">
                    Código de Barras 
                    <button onClick={generateBarcode} type="button" className="text-xs text-blue-600 hover:underline flex items-center gap-1"><RefreshCw size={10}/> Generar</button>
                  </label>
                  <div className="relative mt-1">
                    <ScanBarcode className="absolute left-2.5 top-2.5 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      className="w-full border rounded-lg pl-8 p-2 outline-none focus:ring-2 focus:ring-blue-500 font-mono" 
                      value={formData.code} 
                      onChange={e => setFormData({...formData, code: e.target.value})}
                      placeholder="Escanee o ingrese código"
                    />
                  </div>
               </div>
               <div className="col-span-2 md:col-span-1">
                  <label className="text-sm font-medium text-gray-700 block mt-1">Nombre del Producto</label>
                  <input type="text" className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
               </div>
               <div>
                  <label className="text-sm font-medium text-gray-700">Marca</label>
                  <select className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500" value={formData.brandId} onChange={e => setFormData({...formData, brandId: e.target.value})}>
                     <option value="">Seleccionar</option>
                     {MOCK_BRANDS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
               </div>
               <div>
                  <label className="text-sm font-medium text-gray-700">Categoría</label>
                   <select className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500" value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}>
                     <option value="">Seleccionar</option>
                     {MOCK_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
               </div>
               <div>
                  <label className="text-sm font-medium text-gray-700">Costo (Compra)</label>
                  <input type="number" className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500" value={formData.buyPrice} onChange={e => setFormData({...formData, buyPrice: parseFloat(e.target.value)})} />
               </div>
               
               {/* Stock Section */}
               <div className="col-span-2 grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div>
                    <label className="text-sm font-bold text-gray-700">Stock Actual</label>
                    <input type="number" className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-red-600 flex items-center gap-1">
                       <AlertTriangle size={14} /> Stock Mínimo
                    </label>
                    <input type="number" className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-red-500 border-red-200" value={formData.minStock} onChange={e => setFormData({...formData, minStock: parseInt(e.target.value)})} />
                    <span className="text-[10px] text-gray-500">Alerta cuando baje de esta cantidad</span>
                  </div>
               </div>
               
               <div className="col-span-2 border-t pt-2 mt-2">
                 <label className="text-sm font-bold text-gray-700 block mb-2">Precios de Venta</label>
                 <div className="grid grid-cols-3 gap-2">
                   <div>
                      <label className="text-xs text-gray-500">Menudeo</label>
                      <input type="number" placeholder="0.00" className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500" value={formData.priceRetail} onChange={e => setFormData({...formData, priceRetail: parseFloat(e.target.value)})} />
                   </div>
                   <div>
                      <label className="text-xs text-gray-500">Mayoreo</label>
                      <input type="number" placeholder="0.00" className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500" value={formData.priceWholesale} onChange={e => setFormData({...formData, priceWholesale: parseFloat(e.target.value)})} />
                   </div>
                   <div>
                      <label className="text-xs text-gray-500">Especial</label>
                      <input type="number" placeholder="0.00" className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500" value={formData.priceSpecial} onChange={e => setFormData({...formData, priceSpecial: parseFloat(e.target.value)})} />
                   </div>
                 </div>
               </div>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500 cursor-pointer hover:bg-gray-50 transition-colors">
               <ImageIcon className="mx-auto mb-2" />
               <span className="text-sm">Click para subir imagen</span>
            </div>
            <div className="flex justify-end gap-2">
               <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancelar</button>
               <button onClick={handleSave} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Guardar</button>
            </div>
         </div>
      </Modal>
    </div>
  );
}
