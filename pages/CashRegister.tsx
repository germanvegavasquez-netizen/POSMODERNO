import React, { useState, useEffect } from 'react';
import { Lock, Unlock, DollarSign, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { CashRegisterSession, CompanySettings } from '../types';
import { Modal } from '../components/Modal';
import { MOCK_SALES, MOCK_CLIENTS } from '../services/mockData';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface CashRegisterProps {
  settings: CompanySettings;
  onSessionChange: (session: CashRegisterSession | null) => void;
  currentSession: CashRegisterSession | null;
}

export default function CashRegisterPage({ settings, onSessionChange, currentSession }: CashRegisterProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'open' | 'close'>('open');
  const [amount, setAmount] = useState<string>('');
  const [notes, setNotes] = useState('');

  // Mock calculation of sales for current session (in real app, query DB)
  // We'll use a mock random increment for demo purposes or read from SalesHistory
  const [currentSales, setCurrentSales] = useState(0);

  useEffect(() => {
    if (currentSession) {
      // Simulate live sales accumulation since opening
      setCurrentSales(currentSession.salesTotal || 0);
    }
  }, [currentSession]);

  const handleOpenAction = (type: 'open' | 'close') => {
    setActionType(type);
    setAmount('');
    setNotes('');
    setIsModalOpen(true);
  };

  const getClientName = (id: string | null) => MOCK_CLIENTS.find(c => c.id === id)?.name || 'Consumidor Final';

  const generateClosureReport = (session: CashRegisterSession) => {
    const doc = new jsPDF();
    const currency = settings.currencySymbol;

    // --- Header ---
    doc.setFontSize(18);
    doc.text('Reporte de Cierre de Caja', 14, 20);
    
    doc.setFontSize(10);
    doc.text(`${settings.name}`, 14, 28);
    doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 34);

    // --- Session Info ---
    doc.setFontSize(12);
    doc.setTextColor(0, 51, 102);
    doc.text('Resumen del Turno', 14, 45);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);

    const infoData = [
      ['Apertura:', new Date(session.openedAt).toLocaleString()],
      ['Cierre:', session.closedAt ? new Date(session.closedAt).toLocaleString() : '-'],
      ['Monto Inicial:', `${currency} ${session.initialAmount.toFixed(2)}`],
      ['Ventas Registradas:', `${currency} ${session.salesTotal.toFixed(2)}`],
      ['Total Esperado:', `${currency} ${(session.initialAmount + session.salesTotal).toFixed(2)}`],
      ['Monto Real (Contado):', `${currency} ${session.finalAmount?.toFixed(2)}`],
      ['Diferencia:', `${currency} ${((session.finalAmount || 0) - (session.initialAmount + session.salesTotal)).toFixed(2)}`]
    ];

    autoTable(doc, {
      startY: 50,
      head: [],
      body: infoData,
      theme: 'plain',
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } }
    });

    let finalY = (doc as any).lastAutoTable.finalY + 10;

    // --- Sales Breakdown (Simulated payment methods) ---
    doc.setFontSize(12);
    doc.setTextColor(0, 51, 102);
    doc.text('Métodos de Pago', 14, finalY);
    
    const paymentData = [
      ['Efectivo / General', `${currency} ${session.salesTotal.toFixed(2)}`]
    ];

    autoTable(doc, {
      startY: finalY + 5,
      head: [['Método', 'Monto']],
      body: paymentData,
      theme: 'striped',
      headStyles: { fillColor: [60, 60, 60] }
    });

    finalY = (doc as any).lastAutoTable.finalY + 10;

    // --- Sales List (Filtered for this session simulation) ---
    // In a real app, you filter MOCK_SALES where date >= session.openedAt and date <= session.closedAt
    const sessionSales = MOCK_SALES.filter(s => new Date(s.date) >= new Date(session.openedAt));

    doc.setFontSize(12);
    doc.setTextColor(0, 51, 102);
    doc.text('Detalle de Ventas del Turno', 14, finalY);

    const salesRows = sessionSales.map(s => [
      s.id,
      new Date(s.date).toLocaleTimeString(),
      getClientName(s.clientId),
      s.items.length,
      `${currency} ${s.total.toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: finalY + 5,
      head: [['ID Venta', 'Hora', 'Cliente', 'Items', 'Total']],
      body: salesRows,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] }
    });

    window.open(doc.output('bloburl'), '_blank');
  };

  const handleSubmit = () => {
    const numAmount = parseFloat(amount) || 0;
    
    if (actionType === 'open') {
      const newSession: CashRegisterSession = {
        id: Date.now().toString(),
        openedAt: new Date().toISOString(),
        closedAt: null,
        initialAmount: numAmount,
        finalAmount: null,
        salesTotal: 0,
        status: 'open',
        notes: notes
      };
      onSessionChange(newSession);
    } else {
      if (!currentSession) return;
      const closedSession: CashRegisterSession = {
        ...currentSession,
        closedAt: new Date().toISOString(),
        finalAmount: numAmount,
        salesTotal: currentSales, // Capture final sales
        status: 'closed',
        notes: notes ? (currentSession.notes + '\nCierre: ' + notes) : currentSession.notes
      };
      onSessionChange(null); // Clear current active session
      
      // GENERATE PDF REPORT
      setTimeout(() => {
        generateClosureReport(closedSession);
      }, 500);
    }
    setIsModalOpen(false);
  };

  const expectedTotal = currentSession ? (currentSession.initialAmount + currentSales) : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Caja y Arqueo</h2>
      </div>

      {!currentSession ? (
        // Closed State
        <div className="bg-white rounded-xl shadow-lg border border-red-100 p-8 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-red-500" size={40} />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Caja Cerrada</h3>
          <p className="text-gray-500 mb-6">Debe realizar la apertura de caja para comenzar a registrar ventas.</p>
          <button 
            onClick={() => handleOpenAction('open')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg shadow-blue-200 transition-all flex items-center gap-2 mx-auto"
          >
            <Unlock size={20} />
            Abrir Caja
          </button>
        </div>
      ) : (
        // Open State
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-sm text-gray-500 mb-1">Monto Inicial</div>
                <div className="text-2xl font-bold text-gray-800">{settings.currencySymbol} {currentSession.initialAmount.toFixed(2)}</div>
             </div>
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-sm text-gray-500 mb-1">Ventas del Turno</div>
                <div className="text-2xl font-bold text-green-600">+{settings.currencySymbol} {currentSales.toFixed(2)}</div>
             </div>
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 bg-blue-50 border-blue-100">
                <div className="text-sm text-blue-600 mb-1 font-bold">Total Esperado en Caja</div>
                <div className="text-2xl font-bold text-blue-800">{settings.currencySymbol} {expectedTotal.toFixed(2)}</div>
             </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-start">
               <div>
                 <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                    Turno Activo
                 </h3>
                 <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1"><Calendar size={14}/> {new Date(currentSession.openedAt).toLocaleDateString()}</div>
                    <div className="flex items-center gap-1"><Clock size={14}/> {new Date(currentSession.openedAt).toLocaleTimeString()}</div>
                 </div>
               </div>
               <button 
                 onClick={() => handleOpenAction('close')}
                 className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium border border-red-200 transition-colors flex items-center gap-2"
               >
                 <Lock size={16} />
                 Cerrar Caja / Arqueo
               </button>
            </div>
            
            {currentSession.notes && (
              <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
                 <strong>Notas de apertura:</strong> {currentSession.notes}
              </div>
            )}
          </div>
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={actionType === 'open' ? 'Apertura de Caja' : 'Cierre de Caja y Arqueo'}
      >
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
             <AlertTriangle className="text-blue-600 shrink-0 mt-0.5" size={20} />
             <p className="text-sm text-blue-800">
               {actionType === 'open' 
                 ? 'Ingrese el monto de dinero físico con el que inicia el turno.' 
                 : 'Cuente el dinero físico en caja e ingréselo abajo para calcular diferencias. Al cerrar, se generará el reporte PDF automáticamente.'}
             </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {actionType === 'open' ? 'Monto Inicial' : 'Monto Final (Contado)'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500 font-bold">{settings.currencySymbol}</span>
              <input 
                type="number" 
                step="0.01"
                min="0"
                className="w-full border border-gray-300 rounded-lg pl-8 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas / Observaciones</label>
            <textarea 
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
              placeholder="Ej: Cambio en monedas..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>

          {actionType === 'close' && amount && (
             <div className={`p-3 rounded text-center font-bold ${parseFloat(amount) - expectedTotal >= -0.01 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                Diferencia: {settings.currencySymbol} {(parseFloat(amount) - expectedTotal).toFixed(2)}
             </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">Cancelar</button>
            <button 
              onClick={handleSubmit} 
              className={`px-4 py-2 text-white rounded-lg font-bold shadow-lg ${actionType === 'open' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}
            >
              {actionType === 'open' ? 'Abrir Turno' : 'Cerrar Turno'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}