
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  Package, 
  Tags, 
  Layers, 
  BarChart3, 
  LogOut, 
  Menu,
  X,
  Bell,
  Search,
  Settings,
  Archive,
  ClipboardList,
  PieChart,
  CreditCard
} from 'lucide-react';
import { User, CompanySettings } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  settings: CompanySettings;
  onLogout: () => void;
}

const SidebarItem = ({ to, icon: Icon, label, active }: { to: string; icon: any; label: string; active: boolean }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      active 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

export const Layout: React.FC<LayoutProps> = ({ children, user, settings, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) {
    return <>{children}</>;
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {!isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden print:hidden"
          onClick={() => setIsSidebarOpen(true)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out print:hidden ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'
        } lg:translate-x-0`}
      >
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center justify-center border-b border-gray-100 px-4">
             {isSidebarOpen ? (
                <div className="flex items-center gap-2 font-bold text-xl text-blue-700 overflow-hidden whitespace-nowrap">
                  {settings.logoUrl ? (
                    <img src={settings.logoUrl} alt="Logo" className="w-8 h-8 rounded object-cover" />
                  ) : (
                    <div className="w-8 h-8 min-w-[2rem] bg-blue-600 rounded-lg flex items-center justify-center text-white">P</div>
                  )}
                  <span className="truncate">{settings.name}</span>
                </div>
             ) : (
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  {settings.name.charAt(0)}
                </div>
             )}
          </div>

          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            <SidebarItem to="/" icon={LayoutDashboard} label={isSidebarOpen ? "Dashboard" : ""} active={isActive('/')} />
            
            <div className="pt-4 pb-2">
               <div className={`text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 ${!isSidebarOpen && 'text-center'}`}>
                {isSidebarOpen ? "Ventas & Caja" : "Ventas"}
              </div>
              <SidebarItem to="/pos" icon={ShoppingBag} label={isSidebarOpen ? "Punto de Venta" : ""} active={isActive('/pos')} />
              <SidebarItem to="/cash-register" icon={Archive} label={isSidebarOpen ? "Caja / Arqueo" : ""} active={isActive('/cash-register')} />
              <SidebarItem to="/sales" icon={BarChart3} label={isSidebarOpen ? "Historial Ventas" : ""} active={isActive('/sales')} />
              <SidebarItem to="/sales/products" icon={PieChart} label={isSidebarOpen ? "Ventas por Prod." : ""} active={isActive('/sales/products')} />
            </div>
            
            <div className="pt-4 pb-2">
              <div className={`text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 ${!isSidebarOpen && 'text-center'}`}>
                {isSidebarOpen ? "Inventario" : "Inv"}
              </div>
              <SidebarItem to="/inventory/products" icon={Package} label={isSidebarOpen ? "Productos" : ""} active={isActive('/inventory/products')} />
              <SidebarItem to="/inventory/categories" icon={Layers} label={isSidebarOpen ? "Categorías" : ""} active={isActive('/inventory/categories')} />
              <SidebarItem to="/inventory/brands" icon={Tags} label={isSidebarOpen ? "Marcas" : ""} active={isActive('/inventory/brands')} />
              <SidebarItem to="/inventory/report" icon={ClipboardList} label={isSidebarOpen ? "Reporte Stock" : ""} active={isActive('/inventory/report')} />
            </div>

            <div className="pt-4 pb-2">
              <div className={`text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 ${!isSidebarOpen && 'text-center'}`}>
                {isSidebarOpen ? "Admin" : "Adm"}
              </div>
              <SidebarItem to="/users" icon={Users} label={isSidebarOpen ? "Usuarios" : ""} active={isActive('/users')} />
              <SidebarItem to="/clients" icon={Users} label={isSidebarOpen ? "Clientes" : ""} active={isActive('/clients')} />
              <SidebarItem to="/payment-methods" icon={CreditCard} label={isSidebarOpen ? "Métodos de Pago" : ""} active={isActive('/payment-methods')} />
              <SidebarItem to="/settings" icon={Settings} label={isSidebarOpen ? "Configuración" : ""} active={isActive('/settings')} />
            </div>
          </div>

          <div className="p-4 border-t border-gray-100">
            <button 
              onClick={onLogout}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors ${!isSidebarOpen && 'justify-center'}`}
            >
              <LogOut size={20} />
              {isSidebarOpen && <span className="font-medium">Cerrar Sesión</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 lg:px-8 z-10 print:hidden">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 lg:hidden"
          >
            <Menu size={24} />
          </button>

          <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 w-96">
            <Search size={18} className="text-gray-400 mr-2" />
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="bg-transparent border-none outline-none text-sm w-full"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-full hover:bg-gray-100 text-gray-600">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-gray-800">{user.name}</div>
                <div className="text-xs text-gray-500">{user.role}</div>
              </div>
              <img 
                src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}`} 
                alt="Profile" 
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 print:p-0 print:overflow-visible">
          {children}
        </main>
      </div>
    </div>
  );
};
