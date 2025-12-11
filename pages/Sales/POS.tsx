
import React, { useState, useEffect, useRef } from 'react';
import { Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, User, AlertCircle, CheckCircle, Printer, X, Wallet, AlertTriangle, Layers, ScanBarcode } from 'lucide-react';
import { MOCK_PRODUCTS, MOCK_CLIENTS, MOCK_SALES, MOCK_CATEGORIES } from '../../services/mockData';
import { Product, CartItem, Client, CompanySettings, Sale, PaymentMethod } from '../../types';
import { Modal } from '../../components/Modal';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';

interface POSProps {
  settings: CompanySettings;
  isRegisterOpen: boolean;
  onSaleComplete: (amount: number) => void;
  paymentMethods: PaymentMethod[];
}

type PriceType = 'retail' | 'wholesale' | 'special';

export default function POSPage({ settings, isRegisterOpen, onSaleComplete, paymentMethods }: POSProps) {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [priceType, setPriceType] = useState<PriceType>('retail');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  
  // Creative Improvements: Category Filter & Notifications
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Set default payment method
  useEffect(() => {
    if (paymentMethods.length > 0 && !selectedPaymentMethod) {
      setSelectedPaymentMethod(paymentMethods[0].name);
    }
  }, [paymentMethods]);

  // Focus search on mount for scanning readiness
  useEffect(() => {
    if (isRegisterOpen) {
        searchInputRef.current?.focus();
    }
  }, [isRegisterOpen]);

  // Clear toast after 3 seconds
  useEffect(() => {
    if (errorToast) {
      const timer = setTimeout(() => setErrorToast(null), 3000);
      return () => clearTimeout(timer);
    }
    if (successToast) {
        const timer = setTimeout(() => setSuccessToast(null), 2000);
        return () => clearTimeout(timer);
    }
  }, [errorToast, successToast]);
  
  // States for Success Modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);

  if (!isRegisterOpen) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-red-100 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Caja Cerrada</h2>
          <p className="text-gray-500 mb-6">Debe abrir la caja antes de realizar ventas.</p>
          <button 
            onClick={() => navigate('/cash-register')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 w-full"
          >
            Ir a Caja
          </button>
        </div>
      </div>
    );
  }

  const filteredProducts = MOCK_PRODUCTS.filter(p => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(term) || 
                          p.code.toLowerCase().includes(term);
    const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getPrice = (product: Product, type: PriceType) => {
    switch (type) {
      case 'wholesale': return product.priceWholesale;
      case 'special': return product.priceSpecial;
      default: return product.priceRetail;
    }
  };

  const showError = (msg: string) => {
    setErrorToast(msg);
    // Play error sound
    playBeep(400, 200, 'sawtooth');
  };

  const playBeep = (freq = 800, duration = 100, type: OscillatorType = 'sine') => {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.value = freq;
            osc.type = type;
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            setTimeout(() => osc.stop(), duration);
        }
      } catch (e) {
          console.error("Audio not supported");
      }
  };

  const addToCart = (product: Product) => {
    // Stock Validation Logic
    if (product.stock <= 0) {
        showError(`¡Stock Insuficiente! "${product.name}" agotado.`);
        return;
    }

    const existing = cart.find(item => item.id === product.id);
    const priceToUse = getPrice(product, priceType);

    if (existing) {
      if (existing.quantity + 1 > product.stock) {
         showError(`¡Stock Insuficiente! Quedan ${product.stock} de "${product.name}".`);
         return;
      }
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1, finalPrice: priceToUse } : item));
      setSuccessToast(`+1 ${product.name}`);
    } else {
      setCart([...cart, { ...product, quantity: 1, finalPrice: priceToUse }]);
      setSuccessToast(`${product.name} agregado`);
    }
    // Play success beep
    playBeep(1200, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm) {
        // Barcode Scanner Logic:
        // Scanners act as keyboards that type the code and press Enter.
        // We look for an EXACT match on the Barcode (Code) field.
        const scannedProduct = MOCK_PRODUCTS.find(p => p.code === searchTerm);

        if (scannedProduct) {
            // Found exact barcode match
            addToCart(scannedProduct);
            setSearchTerm(''); // Clear input for next scan
            // Keep focus
            e.preventDefault(); 
        } else {
            // If no exact match, we just leave the search term to filter the list visually
            // but if there is only 1 result in the list, maybe user meant that?
            // For safety, POS usually requires exact barcode match for auto-add.
        }
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    const itemInCart = cart.find(item => item.id === id);
    const originalProduct = MOCK_PRODUCTS.find(p => p.id === id);

    if (!itemInCart || !originalProduct) return;

    // Check stock if adding
    if (delta > 0) {
        if (itemInCart.quantity + delta > originalProduct.stock) {
            showError(`¡Stock máximo alcanzado! Solo hay ${originalProduct.stock} unidades.`);
            return;
        }
    }

    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handlePriceTypeChange = (newType: PriceType) => {
    setPriceType(newType);
    setCart(cart.map(item => ({
      ...item,
      finalPrice: getPrice(item, newType)
    })));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // Calculations
  const subTotal = cart.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
  const taxAmount = (subTotal * settings.taxRate) / 100;
  const total = subTotal + taxAmount;

  const handleCheckout = () => {
    if (!selectedPaymentMethod) {
       showError("Por favor seleccione un método de pago");
       return;
    }

    const sale: Sale = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      clientId: selectedClient?.id || null,
      paymentMethod: selectedPaymentMethod,
      items: [...cart], // Copy cart
      subtotal: subTotal,
      tax: taxAmount,
      total: total,
      status: 'completed'
    };
    
    // Process Sale (In a real app, this would also deduct stock from DB)
    cart.forEach(cartItem => {
        const productIndex = MOCK_PRODUCTS.findIndex(p => p.id === cartItem.id);
        if (productIndex > -1) {
            MOCK_PRODUCTS[productIndex].stock -= cartItem.quantity;
        }
    });

    MOCK_SALES.unshift(sale);
    onSaleComplete(total);
    setLastSale(sale);
    setShowSuccessModal(true);
  };

  const handleNewSale = () => {
    setCart([]);
    setSelectedClient(null);
    setLastSale(null);
    setShowSuccessModal(false);
    setTimeout(() => {
        searchInputRef.current?.focus();
    }, 100);
  };

  const generateTicket = () => {
    if (!lastSale) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 200]
    });

    const centerX = 40;
    let y = 5;

    // --- LOGO ---
    if (settings.logoUrl) {
        try {
            const logoWidth = 30;
            const logoX = (80 - logoWidth) / 2;
            doc.addImage(settings.logoUrl, 'JPEG', logoX, y, logoWidth, 20);
            y += 25; 
        } catch (e) {
            console.error("Error adding logo to PDF", e);
            y += 5;
        }
    } else {
        y += 5;
    }

    // --- HEADER ---
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(settings.name, centerX, y, { align: 'center' });
    y += 5;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    
    if (settings.address) {
      const splitAddress = doc.splitTextToSize(settings.address, 70);
      doc.text(splitAddress, centerX, y, { align: 'center' });
      y += (splitAddress.length * 4);
    }
    
    if (settings.phone) {
      doc.text(`Tel: ${settings.phone}`, centerX, y, { align: 'center' });
      y += 5;
    }

    doc.text('-------------------------------------------', centerX, y, { align: 'center' });
    y += 5;

    // --- TICKET INFO ---
    doc.setFontSize(9);
    doc.text(`Ticket #: ${lastSale.id.slice(-6)}`, 5, y);
    y += 4;
    doc.text(`Fecha: ${new Date(lastSale.date).toLocaleDateString()} ${new Date(lastSale.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`, 5, y);
    y += 4;
    
    const clientName = selectedClient ? selectedClient.name : 'Consumidor Final';
    doc.text(`Cliente: ${clientName.substring(0, 25)}`, 5, y);
    y += 4;
    
    doc.text(`Pago: ${lastSale.paymentMethod}`, 5, y);
    y += 5;

    doc.text('-------------------------------------------', centerX, y, { align: 'center' });
    y += 5;

    // --- ITEMS ---
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text('CANT', 5, y);
    doc.text('DESC', 18, y);
    doc.text('TOTAL', 75, y, { align: 'right' });
    y += 4;
    doc.setFont("helvetica", "normal");

    lastSale.items.forEach((item) => {
      const totalItem = (item.quantity * item.finalPrice).toFixed(2);
      const name = item.name.length > 22 ? item.name.substring(0, 22) + '...' : item.name;
      
      doc.text(`${item.quantity}`, 5, y);
      doc.text(name, 18, y);
      doc.text(totalItem, 75, y, { align: 'right' });
      y += 4;
    });

    y += 2;
    doc.text('-------------------------------------------', centerX, y, { align: 'center' });
    y += 5;

    // --- TOTALS ---
    const currency = settings.currencySymbol;
    
    doc.setFontSize(9);
    doc.text(`Subtotal:`, 40, y, { align: 'right' });
    doc.text(`${currency} ${lastSale.subtotal.toFixed(2)}`, 75, y, { align: 'right' });
    y += 4;

    doc.text(`${settings.taxName}:`, 40, y, { align: 'right' });
    doc.text(`${currency} ${lastSale.tax.toFixed(2)}`, 75, y, { align: 'right' });
    y += 5;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL:`, 40, y, { align: 'right' });
    doc.text(`${currency} ${lastSale.total.toFixed(2)}`, 75, y, { align: 'right' });
    y += 10;

    // --- FOOTER ---
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text('¡Gracias por su preferencia!', centerX, y, { align: 'center' });
    
    window.open(doc.output('bloburl'), '_blank');
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6 relative">
      {/* Notifications */}
      {errorToast && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-5">
           <div className="bg-red-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 font-medium">
             <AlertTriangle size={20} />
             {errorToast}
           </div>
        </div>
      )}
      {successToast && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-5">
           <div className="bg-green-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 font-medium">
             <CheckCircle size={20} />
             {successToast}
           </div>
        </div>
      )}

      {/* Product Grid */}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Search & Price Type */}
        <div className="p-4 border-b border-gray-100 space-y-3">
          <div className="flex gap-4">
            <div className="relative flex-1 group">
              <ScanBarcode className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={24} />
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Escanear Código de Barras o Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-medium text-lg"
                autoFocus
              />
              <div className="absolute right-3 top-3 text-xs text-gray-400 font-mono hidden md:block">
                 [Enter] para agregar
              </div>
            </div>
            <select 
              className="border border-gray-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 font-medium"
              value={priceType}
              onChange={(e) => handlePriceTypeChange(e.target.value as PriceType)}
            >
              <option value="retail">Menudeo</option>
              <option value="wholesale">Mayoreo</option>
              <option value="special">Especial</option>
            </select>
          </div>
          
          {/* Category Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Todos
            </button>
            {MOCK_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${selectedCategory === cat.id ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <span className="w-2 h-2 rounded-full" style={{backgroundColor: cat.color}}></span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map(product => {
              const currentPrice = getPrice(product, priceType);
              const isOutOfStock = product.stock <= 0;
              const isLowStock = !isOutOfStock && product.stock <= product.minStock;

              return (
                <div 
                  key={product.id} 
                  onClick={() => !isOutOfStock && addToCart(product)}
                  className={`bg-white p-3 rounded-lg shadow-sm border transition-all group relative ${
                    isOutOfStock 
                      ? 'border-gray-200 opacity-60 cursor-not-allowed grayscale' 
                      : 'cursor-pointer hover:shadow-md border-gray-200 hover:border-blue-500'
                  }`}
                >
                  <div className="h-32 bg-gray-100 rounded mb-2 overflow-hidden relative">
                     <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                     {isOutOfStock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                           <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">AGOTADO</span>
                        </div>
                     )}
                  </div>
                  <h4 className="font-medium text-sm text-gray-800 line-clamp-2 h-10">{product.name}</h4>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500 font-mono flex items-center gap-0.5">
                       <ScanBarcode size={10} /> {product.code}
                    </span>
                    <span className="font-bold text-blue-600">{settings.currencySymbol} {currentPrice.toFixed(2)}</span>
                  </div>
                  {isLowStock && (
                    <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-700 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm border border-yellow-200 flex items-center gap-1">
                      <AlertTriangle size={8} /> {product.stock} left
                    </div>
                  )}
                  {!isOutOfStock && !isLowStock && product.stock < 20 && (
                      <div className="absolute top-2 right-2 bg-gray-100 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                      Stock: {product.stock}
                    </div>
                  )}
                </div>
              );
            })}
            {filteredProducts.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-400">
                    <Search size={48} className="mb-2 opacity-20" />
                    <p>No se encontraron productos.</p>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* Cart / Ticket */}
      <div className="w-96 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div 
            onClick={() => setIsClientModalOpen(true)}
            className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-blue-400 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <User size={20} />
              </div>
              <div>
                <div className="text-xs text-gray-500">Cliente</div>
                <div className="font-medium text-sm">{selectedClient ? selectedClient.name : 'Seleccionar Cliente'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
               <ShoppingCart size={48} className="mb-2 opacity-50" />
               <p>Carrito vacío</p>
               <p className="text-xs mt-2">Escanee un código para agregar</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-3">
                <img src={item.imageUrl} className="w-12 h-12 rounded object-cover bg-gray-100" />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h5 className="font-medium text-sm text-gray-800 line-clamp-1">{item.name}</h5>
                    <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14}/></button>
                  </div>
                  <div className="flex justify-between items-end mt-1">
                    <div className="flex items-center gap-2 bg-gray-100 rounded px-2 py-1">
                      <button onClick={() => updateQuantity(item.id, -1)} className="hover:text-blue-600"><Minus size={12}/></button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="hover:text-blue-600"><Plus size={12}/></button>
                    </div>
                    <span className="font-bold text-sm text-gray-800">{settings.currencySymbol} {(item.finalPrice * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50">
          {/* Payment Method Selector */}
          <div className="mb-4">
             <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
               <Wallet size={12} /> Método de Pago
             </label>
             <select 
               className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
               value={selectedPaymentMethod}
               onChange={(e) => setSelectedPaymentMethod(e.target.value)}
             >
               <option value="" disabled>Seleccione...</option>
               {paymentMethods.map(pm => (
                 <option key={pm.id} value={pm.name}>{pm.name}</option>
               ))}
             </select>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>{settings.currencySymbol} {subTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>{settings.taxName} ({settings.taxRate}%)</span>
              <span>{settings.currencySymbol} {taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>{settings.currencySymbol} {total.toFixed(2)}</span>
            </div>
          </div>
          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
          >
            <CreditCard size={20} />
            Pagar {settings.currencySymbol} {total.toFixed(2)}
          </button>
        </div>
      </div>

      <Modal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} title="Seleccionar Cliente">
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {MOCK_CLIENTS.map(client => (
            <div 
              key={client.id}
              onClick={() => { setSelectedClient(client); setIsClientModalOpen(false); }}
              className="p-3 border rounded-lg hover:bg-blue-50 cursor-pointer flex justify-between items-center"
            >
              <div>
                <div className="font-bold text-gray-800">{client.name}</div>
                <div className="text-xs text-gray-500">{client.taxId}</div>
              </div>
              {selectedClient?.id === client.id && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
            </div>
          ))}
        </div>
      </Modal>

      {/* Success / Ticket Modal */}
      {showSuccessModal && lastSale && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="bg-green-500 p-6 text-center text-white relative">
                 <button onClick={handleNewSale} className="absolute top-4 right-4 text-white/80 hover:text-white"><X size={24}/></button>
                 <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                   <CheckCircle size={40} className="text-white" />
                 </div>
                 <h3 className="text-2xl font-bold">¡Venta Exitosa!</h3>
                 <p className="text-green-100">La transacción se completó correctamente.</p>
              </div>
              <div className="p-6">
                 <div className="text-center mb-6">
                   <div className="text-sm text-gray-500 uppercase tracking-wide">Monto Total</div>
                   <div className="text-4xl font-bold text-gray-900">{settings.currencySymbol} {lastSale.total.toFixed(2)}</div>
                   <div className="flex justify-center gap-4 text-xs text-gray-500 mt-2">
                      <span>{selectedClient ? selectedClient.name : 'Consumidor Final'}</span>
                      <span>•</span>
                      <span>{lastSale.paymentMethod}</span>
                   </div>
                 </div>

                 <div className="space-y-3">
                    <button 
                      onClick={generateTicket}
                      className="w-full bg-gray-900 hover:bg-black text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-95"
                    >
                      <Printer size={20} />
                      Imprimir Ticket
                    </button>
                    <button 
                      onClick={handleNewSale}
                      className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      <Plus size={20} />
                      Nueva Venta
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
