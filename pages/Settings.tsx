import React, { useState, useEffect } from 'react';
import { Save, Building2, Receipt, Image as ImageIcon, Upload } from 'lucide-react';
import { CompanySettings } from '../types';

interface SettingsProps {
  settings: CompanySettings;
  onSave: (settings: CompanySettings) => void;
}

export default function SettingsPage({ settings: initialSettings, onSave }: SettingsProps) {
  const [formData, setFormData] = useState<CompanySettings>(initialSettings);
  const [showSuccess, setShowSuccess] = useState(false);

  // Update internal state if props change (e.g. initial load)
  useEffect(() => {
    setFormData(initialSettings);
  }, [initialSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'taxRate' ? parseFloat(value) : value
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          logoUrl: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Configuración del Sistema</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
            <Building2 className="text-blue-600" size={20} />
            <h3 className="font-bold text-gray-700">Información de la Empresa</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Empresa</label>
              <input 
                type="text" 
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <input 
                type="text" 
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input 
                type="text" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
            <div className="col-span-2">
               <label className="block text-sm font-medium text-gray-700 mb-2">Logo de la Empresa</label>
               <div className="flex gap-6 items-start">
                 <div className="flex-1">
                   <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 mb-3 text-gray-400" />
                              <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click para subir</span> o arrastra la imagen</p>
                              <p className="text-xs text-gray-500">PNG, JPG, GIF (Max. 2MB)</p>
                          </div>
                          <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                      </label>
                  </div> 
                  <div className="mt-2 text-xs text-gray-400">
                    O pega una URL directa:
                  </div>
                  <input 
                   type="text" 
                   name="logoUrl"
                   value={formData.logoUrl}
                   onChange={handleChange}
                   placeholder="https://ejemplo.com/logo.png"
                   className="w-full mt-1 border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                 />
                 </div>
                 
                 <div className="shrink-0">
                    <div className="text-xs text-gray-500 mb-1 text-center">Vista Previa</div>
                    <div className="w-32 h-32 border rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden relative">
                      {formData.logoUrl ? (
                        <img src={formData.logoUrl} alt="Preview" className="w-full h-full object-contain" />
                      ) : (
                        <ImageIcon className="text-gray-300" size={40} />
                      )}
                    </div>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Financial Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
            <Receipt className="text-green-600" size={20} />
            <h3 className="font-bold text-gray-700">Datos Financieros e Impuestos</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Símbolo de Moneda</label>
              <input 
                type="text" 
                name="currencySymbol"
                required
                value={formData.currencySymbol}
                onChange={handleChange}
                placeholder="S/ o $ o €"
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Impuesto</label>
              <input 
                type="text" 
                name="taxName"
                required
                value={formData.taxName}
                onChange={handleChange}
                placeholder="IGV, IVA, VAT"
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tasa de Impuesto (%)</label>
              <input 
                type="number" 
                name="taxRate"
                required
                min="0"
                max="100"
                step="0.01"
                value={formData.taxRate}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
           {showSuccess && (
             <span className="text-green-600 font-medium animate-pulse">¡Configuración guardada automáticamente!</span>
           )}
           <button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-bold shadow-lg shadow-blue-200 transition-all"
           >
             <Save size={20} />
             Guardar Cambios
           </button>
        </div>
      </form>
    </div>
  );
}