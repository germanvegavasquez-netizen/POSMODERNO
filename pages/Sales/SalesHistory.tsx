
import React, { useState } from 'react';
import { Eye, Download, Calendar, User, FileText, X, Trash2, Printer, CreditCard } from 'lucide-react';
import { MOCK_SALES, MOCK_CLIENTS } from '../../services/mockData';
import { CompanySettings, Sale } from '../../types';
import { Modal } from '../../components/Modal';
import jsPDF from 'jspdf';

interface SalesHistoryProps {
  settings?: CompanySettings;
}

export default function SalesHistoryPage({ settings }: SalesHistoryProps) {
  const currency = settings?.currencySymbol || 'S/';
  const taxName = settings?.taxName || 'Impuesto';
  
  const [sales, setSales] = useState<Sale[]>(MOCK_SALES);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getClientName = (id: string | null) => MOCK_CLIENTS.find(c => c.id === id)?.name || 'Consumidor Final';
  const getClientDetails = (id: string | null) => MOCK_CLIENTS.find(c => c.id === id);

  const handleViewDetail = (sale: Sale) => {
    setSelectedSale(sale);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta venta del historial? Esta acción no se puede deshacer.')) {
      setSales(sales.filter(s => s.id !== id));
    }
  };

  const generateTicketPDF = (action: 'print' | 'download') => {
    if (!selectedSale) return;

    // Configuración para Ticket de 80mm (Estándar Térmico)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 200] // Ancho 80mm, Alto variable (seteado alto para que quepa)
    });

    const centerX = 40; // Mitad de 80mm
    let y = 10;

    // --- Header ---
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(settings?.name || 'Punto de Venta', centerX, y, { align: 'center' });
    y += 5;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    if (settings?.address) {
      doc.text(settings.address, centerX, y, { align: 'center' });
      y += 4;
    }
    if (settings?.phone) {
      doc.text(`Tel: ${settings.phone}`, centerX, y, { align: 'center' });
      y += 5;
    }

    doc.text('-------------------------------------------', centerX, y, { align: 'center' });
    y += 5;

    // --- Info Venta ---
    doc.setFontSize(9);
    doc.text(`Ticket #: ${selectedSale.id}`, 5, y);
    y += 4;
    doc.text(`Fecha: ${new Date(selectedSale.date).toLocaleDateString()} ${new Date(selectedSale.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`, 5, y);
    y += 4;
    doc.text(`Cliente: ${getClientName(selectedSale.clientId)}`, 5, y);
    y += 4;
    doc.text(`Pago: ${selectedSale.paymentMethod}`, 5, y);
    y += 5;

    doc.text('-------------------------------------------', centerX, y, { align: 'center' });
    y += 5;

    // --- Items Headers ---
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text('CANT.', 5, y);
    doc.text('DESCRIPCIÓN', 20, y);
    doc.text('TOTAL', 75, y, { align: 'right' });
    y += 4;
    doc.setFont("helvetica", "normal");

    // --- Items Loop ---
    selectedSale.items.forEach((item) => {
      const totalItem = (item.quantity * item.finalPrice).toFixed(2);
      const name = item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name;
      
      doc.text(`${item.quantity}`, 5, y);
      doc.text(name, 20, y);
      doc.text(`${totalItem}`, 75, y, { align: 'right' });
      y += 4;
    });

    y += 2;
    doc.text('-------------------------------------------', centerX, y, { align: 'center' });
    y += 5;

    // --- Totals ---
    const subtotal = selectedSale.subtotal.toFixed(2);
    const tax = saleTax(selectedSale, settings).toFixed(2);
    const total = selectedSale.total.toFixed(2);

    doc.setFontSize(9);
    doc.text(`Subtotal:`, 40, y, { align: 'right' });
    doc.text(`${currency} ${subtotal}`, 75, y, { align: 'right' });
    y += 4;

    doc.text(`${taxName}:`, 40, y, { align: 'right' });
    doc.text(`${currency} ${tax}`, 75, y, { align: 'right' });
    y += 5;

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL:`, 40, y, { align: 'right' });
    doc.text(`${currency} ${total}`, 75, y, { align: 'right' });
    y += 8;

    // --- Footer ---
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text('¡Gracias por su compra!', centerX, y, { align: 'center' });

    // Output
    if (action === 'print') {
      window.open(doc.output('bloburl'), '_blank');
    } else {
      doc.save(`Ticket_${selectedSale.id}.pdf`);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Historial de Ventas</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="p-4">ID Venta</th>
              <th className="p-4">Fecha</th>
              <th className="p-4">Cliente</th>
              <th className="p-4">Método</th>
              <th className="p-4">Total</th>
              <th className="p-4">Estado</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sales.map(sale => (
              <tr key={sale.id} className="hover:bg-gray-50">
                <td className="p-4 font-mono font-medium">#{sale.id}</td>
                <td className="p-4">{new Date(sale.date).toLocaleDateString()} {new Date(sale.date).toLocaleTimeString()}</td>
                <td className="p-4">{getClientName(sale.clientId)}</td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">
                     {sale.paymentMethod || 'Efectivo'}
                  </span>
                </td>
                <td className="p-4 font-bold text-gray-900">{currency} {sale.total.toFixed(2)}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                    sale.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {sale.status === 'completed' ? 'Completada' : 'Cancelada'}
                  </span>
                </td>
                <td className="p-4 text-right flex justify-end gap-2">
                   <button 
                     onClick={() => handleViewDetail(sale)}
                     className="p-2 text-gray-500 hover:bg-gray-100 rounded transition-colors" 
                     title="Ver Detalle"
                   >
                     <Eye size={18}/>
                   </button>
                   <button 
                     onClick={() => handleDelete(sale.id)}
                     className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors" 
                     title="Eliminar del Historial"
                   >
                     <Trash2 size={18}/>
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sales.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No hay registros de ventas.
          </div>
        )}
      </div>

      {/* Sale Detail Modal */}
      {selectedSale && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          title={`Detalle de Venta #${selectedSale.id}`}
        >
          <div className="space-y-6">
            {/* Header Info */}
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div>
                <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Calendar size={12}/> Fecha de Emisión</div>
                <div className="font-medium text-gray-800">
                  {new Date(selectedSale.date).toLocaleDateString()} {new Date(selectedSale.date).toLocaleTimeString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><User size={12}/> Cliente</div>
                <div className="font-medium text-gray-800">{getClientName(selectedSale.clientId)}</div>
                <div className="text-xs text-gray-500 font-mono">
                  {getClientDetails(selectedSale.clientId)?.taxId || 'N/A'}
                </div>
              </div>
              <div className="col-span-2 border-t pt-2 mt-1">
                 <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><CreditCard size={12}/> Método de Pago</div>
                 <div className="font-medium text-gray-800">{selectedSale.paymentMethod || 'Efectivo'}</div>
              </div>
            </div>

            {/* Items Table */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="p-3 text-left">Producto</th>
                    <th className="p-3 text-center">Cant.</th>
                    <th className="p-3 text-right">Precio</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {selectedSale.items.map((item, index) => (
                    <tr key={index}>
                      <td className="p-3">
                        <div className="font-medium text-gray-800">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.code}</div>
                      </td>
                      <td className="p-3 text-center">{item.quantity}</td>
                      <td className="p-3 text-right">{currency} {item.finalPrice.toFixed(2)}</td>
                      <td className="p-3 text-right font-medium">{currency} {(item.finalPrice * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-1/2 space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span>{currency} {selectedSale.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{taxName}</span>
                  <span>{currency} {saleTax(selectedSale, settings).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>{currency} {selectedSale.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-gray-100">
              <div className="flex gap-2 w-full sm:w-auto">
                 <button 
                  onClick={() => generateTicketPDF('print')}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Printer size={18} /> Imprimir Ticket
                </button>
                <button 
                  onClick={() => generateTicketPDF('download')}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Download size={18} /> Descargar
                </button>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Helper to safely calculate tax display if not strictly stored in mock
function saleTax(sale: Sale, settings?: CompanySettings): number {
  if (sale.tax !== undefined) return sale.tax;
  // Fallback calculation if mock data didn't have tax property
  return sale.total - sale.subtotal; 
}
