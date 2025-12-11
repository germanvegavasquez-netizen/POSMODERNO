import React, { useState, useMemo } from 'react';
import { Search, Printer, FileText, Package, Calendar } from 'lucide-react';
import { MOCK_SALES } from '../../services/mockData';
import { CompanySettings } from '../../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface SalesByProductPageProps {
  settings: CompanySettings;
}

interface ProductSalesData {
  id: string;
  code: string;
  name: string;
  quantitySold: number;
  totalRevenue: number;
}

export default function SalesByProductPage({ settings }: SalesByProductPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Aggregate data from sales history
  const aggregatedData = useMemo(() => {
    const productMap = new Map<string, ProductSalesData>();

    MOCK_SALES.forEach(sale => {
      if (sale.status === 'completed') {
        sale.items.forEach(item => {
          const existing = productMap.get(item.id);
          if (existing) {
            existing.quantitySold += item.quantity;
            existing.totalRevenue += (item.finalPrice * item.quantity);
          } else {
            productMap.set(item.id, {
              id: item.id,
              code: item.code,
              name: item.name,
              quantitySold: item.quantity,
              totalRevenue: (item.finalPrice * item.quantity)
            });
          }
        });
      }
    });

    return Array.from(productMap.values());
  }, []);

  const filteredData = aggregatedData.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalQuantity = filteredData.reduce((acc, curr) => acc + curr.quantitySold, 0);
  const totalRevenue = filteredData.reduce((acc, curr) => acc + curr.totalRevenue, 0);

  const generatePDF = () => {
    const doc = new jsPDF();
    const currency = settings.currencySymbol;

    // Header
    doc.setFontSize(18);
    doc.text('Reporte de Ventas por Producto', 14, 20);
    doc.setFontSize(10);
    doc.text(`${settings.name}`, 14, 26);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 32);

    // Summary
    doc.setFontSize(11);
    doc.text(`Total Unidades: ${totalQuantity}`, 14, 42);
    doc.text(`Total Ingresos: ${currency} ${totalRevenue.toFixed(2)}`, 80, 42);

    // Table
    const tableRows = filteredData.map(item => [
      item.code,
      item.name,
      item.quantitySold,
      `${currency} ${item.totalRevenue.toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 48,
      head: [['Código', 'Producto', 'Cant. Vendida', 'Total Ingresos']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      foot: [['', 'TOTALES', totalQuantity, `${currency} ${totalRevenue.toFixed(2)}`]],
      footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' }
    });

    window.open(doc.output('bloburl'), '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Ventas por Producto</h2>
          <p className="text-sm text-gray-500">Análisis detallado de rendimiento de productos</p>
        </div>
        <button 
          onClick={generatePDF}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Printer size={18} />
          Imprimir Reporte
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Package size={24}/></div>
          <div>
            <div className="text-sm text-gray-500">Unidades Vendidas</div>
            <div className="text-2xl font-bold text-gray-800">{totalQuantity}</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg"><DollarSignIcon /></div>
          <div>
            <div className="text-sm text-gray-500">Ingresos Totales</div>
            <div className="text-2xl font-bold text-gray-800">{settings.currencySymbol} {totalRevenue.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
           <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="p-4">Código</th>
              <th className="p-4">Producto</th>
              <th className="p-4 text-center">Cant. Vendida</th>
              <th className="p-4 text-right">Total Ingresos</th>
              <th className="p-4 text-right">% del Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredData.length > 0 ? (
              filteredData.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-4 font-mono text-xs">{item.code}</td>
                  <td className="p-4 font-medium text-gray-900">{item.name}</td>
                  <td className="p-4 text-center">
                    <span className="bg-blue-50 text-blue-700 py-1 px-3 rounded-full text-xs font-bold">
                      {item.quantitySold}
                    </span>
                  </td>
                  <td className="p-4 text-right font-bold">
                    {settings.currencySymbol} {item.totalRevenue.toFixed(2)}
                  </td>
                  <td className="p-4 text-right text-gray-400 text-xs">
                    {totalRevenue > 0 ? ((item.totalRevenue / totalRevenue) * 100).toFixed(1) : 0}%
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  No hay ventas registradas para los criterios de búsqueda.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="bg-gray-50 font-bold text-gray-800">
             <tr>
               <td className="p-4" colSpan={2}>TOTALES</td>
               <td className="p-4 text-center">{totalQuantity}</td>
               <td className="p-4 text-right">{settings.currencySymbol} {totalRevenue.toFixed(2)}</td>
               <td className="p-4"></td>
             </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

const DollarSignIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
);
