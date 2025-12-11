
import React, { useState } from 'react';
import { FileSpreadsheet, Printer, Search, AlertTriangle, Package, DollarSign } from 'lucide-react';
import { MOCK_PRODUCTS, MOCK_BRANDS, MOCK_CATEGORIES } from '../../services/mockData';
import { CompanySettings } from '../../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface InventoryReportProps {
  settings?: CompanySettings;
}

export default function InventoryReport({ settings }: InventoryReportProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const currency = settings?.currencySymbol || 'S/';

  // Helper functions
  const getBrandName = (id: string) => MOCK_BRANDS.find(b => b.id === id)?.name || '-';
  const getCategoryName = (id: string) => MOCK_CATEGORIES.find(c => c.id === id)?.name || '-';

  // Filter Logic
  const filteredProducts = MOCK_PRODUCTS.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistics
  const totalProducts = MOCK_PRODUCTS.length;
  const totalStock = MOCK_PRODUCTS.reduce((acc, curr) => acc + curr.stock, 0);
  const totalValue = MOCK_PRODUCTS.reduce((acc, curr) => acc + (curr.buyPrice * curr.stock), 0);
  // Updated Logic: Count products where stock <= minStock
  const lowStockCount = MOCK_PRODUCTS.filter(p => p.stock <= p.minStock).length;

  // Generate PDF Function
  const handlePrintPDF = () => {
    const doc = new jsPDF();

    // -- Header --
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text(settings?.name || 'Reporte de Inventario', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Fecha de Reporte: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 28);
    
    // -- Stats Summary in PDF --
    doc.setFontSize(10);
    doc.text(`Total Productos: ${totalProducts}`, 14, 36);
    doc.text(`Unidades Totales: ${totalStock}`, 80, 36);
    doc.text(`Valor Inventario: ${currency} ${totalValue.toLocaleString()}`, 140, 36);

    // -- Table Columns --
    const tableColumn = ["Código", "Producto", "Marca", "Categoría", "Stock", "Mínimo", "Costo", "Valor Total"];
    
    // -- Table Rows --
    const tableRows = filteredProducts.map(product => [
      product.code,
      product.name,
      getBrandName(product.brandId),
      getCategoryName(product.categoryId),
      product.stock,
      product.minStock, // Added Min Stock to PDF
      `${currency} ${product.buyPrice.toFixed(2)}`,
      `${currency} ${(product.stock * product.buyPrice).toFixed(2)}`
    ]);

    // -- Add Totals Row --
    tableRows.push([
      "", 
      "TOTALES", 
      "", 
      "", 
      totalStock.toString(), 
      "",
      "-", 
      `${currency} ${totalValue.toFixed(2)}`
    ]);

    // -- Generate Table --
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 42,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' },
      didParseCell: (data) => {
        // Highlight totals row
        if (data.row.index === tableRows.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [240, 240, 240];
        }
      }
    });

    // -- Footer --
    const pageCount = doc.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Página ${i} de ${pageCount} - Generado por PerfiSoft POS`, 105, 290, { align: 'center' });
    }

    // -- Open PDF in new Tab (Allows Print & Download) --
    window.open(doc.output('bloburl'), '_blank');
  };

  // Export to Excel (CSV) Function
  const handleExport = () => {
    const headers = ['Código', 'Producto', 'Marca', 'Categoría', 'Stock', 'Stock Mínimo', 'Costo Unit.', 'Precio Venta', 'Valor Total'];
    
    const rows = filteredProducts.map(p => [
      p.code,
      `"${p.name.replace(/"/g, '""')}"`, // Escape quotes
      getBrandName(p.brandId),
      getCategoryName(p.categoryId),
      p.stock,
      p.minStock,
      p.buyPrice.toFixed(2),
      p.priceRetail.toFixed(2),
      (p.stock * p.buyPrice).toFixed(2)
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inventario_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Reporte General de Inventario</h2>
          <p className="text-gray-500 text-sm">Vista detallada del stock y valoración.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium shadow-sm"
          >
            <FileSpreadsheet size={18} /> Exportar Excel
          </button>
          <button 
            onClick={handlePrintPDF}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-colors font-medium shadow-sm"
          >
            <Printer size={18} /> Imprimir / Ver PDF
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Package size={24}/></div>
          <div>
            <div className="text-sm text-gray-500">Productos</div>
            <div className="text-xl font-bold text-gray-800">{totalProducts}</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg"><Package size={24}/></div>
          <div>
            <div className="text-sm text-gray-500">Unidades Totales</div>
            <div className="text-xl font-bold text-gray-800">{totalStock}</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg"><DollarSign size={24}/></div>
          <div>
            <div className="text-sm text-gray-500">Valor Inventario</div>
            <div className="text-xl font-bold text-gray-800">{currency} {totalValue.toLocaleString()}</div>
          </div>
        </div>
        <div className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 ${lowStockCount > 0 ? 'border-red-200 bg-red-50' : ''}`}>
          <div className={`p-3 rounded-lg ${lowStockCount > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}><AlertTriangle size={24}/></div>
          <div>
            <div className="text-sm text-gray-500">Stock Bajo</div>
            <div className={`text-xl font-bold ${lowStockCount > 0 ? 'text-red-600' : 'text-gray-800'}`}>{lowStockCount}</div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
           <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="Buscar por código o nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
            <tr>
              <th className="p-4">Código</th>
              <th className="p-4">Producto</th>
              <th className="p-4">Marca</th>
              <th className="p-4">Categoría</th>
              <th className="p-4 text-center">Stock</th>
              <th className="p-4 text-center">Mínimo</th>
              <th className="p-4 text-right">Costo Unit.</th>
              <th className="p-4 text-right">Valor Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.map(product => {
                const isLowStock = product.stock <= product.minStock;
                return (
                  <tr key={product.id} className={`hover:bg-gray-50 ${isLowStock ? 'bg-red-50/50' : ''}`}>
                    <td className="p-4 font-mono text-xs font-medium">{product.code}</td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{product.name}</div>
                      {isLowStock && <span className="text-[10px] text-red-600 font-bold flex items-center gap-1"><AlertTriangle size={10} /> Stock Bajo</span>}
                    </td>
                    <td className="p-4">{getBrandName(product.brandId)}</td>
                    <td className="p-4">{getCategoryName(product.categoryId)}</td>
                    <td className={`p-4 text-center font-bold ${isLowStock ? 'text-red-600' : 'text-gray-700'}`}>
                      {product.stock}
                    </td>
                    <td className="p-4 text-center text-gray-400">
                      {product.minStock}
                    </td>
                    <td className="p-4 text-right">{currency} {product.buyPrice.toFixed(2)}</td>
                    <td className="p-4 text-right font-medium text-gray-900">
                      {currency} {(product.stock * product.buyPrice).toFixed(2)}
                    </td>
                  </tr>
                );
            })}
          </tbody>
          <tfoot className="bg-gray-50 font-bold text-gray-800 border-t border-gray-200">
             <tr>
               <td className="p-4" colSpan={4}>TOTALES</td>
               <td className="p-4 text-center">{totalStock}</td>
               <td className="p-4 text-center">-</td>
               <td className="p-4 text-right">-</td>
               <td className="p-4 text-right">{currency} {totalValue.toFixed(2)}</td>
             </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
