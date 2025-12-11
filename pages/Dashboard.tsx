
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, Users, Package, ShoppingCart, DollarSign } from 'lucide-react';
import { MOCK_SALES, MOCK_PRODUCTS, MOCK_CLIENTS } from '../services/mockData';

// Placeholder data for charts (would require more complex date aggregation for real implementation)
const data = [
  { name: 'Ene', ventas: 4000 },
  { name: 'Feb', ventas: 3000 },
  { name: 'Mar', ventas: 2000 },
  { name: 'Abr', ventas: 2780 },
  { name: 'May', ventas: 1890 },
  { name: 'Jun', ventas: 2390 },
  { name: 'Jul', ventas: 3490 },
];

const categoryData = [
  { name: 'Zapatillas', value: 400, color: '#ff6b6b' },
  { name: 'Electrónica', value: 300, color: '#4ecdc4' },
  { name: 'Accesorios', value: 300, color: '#ffe66d' },
];

const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </div>
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
    <div className="mt-4 flex items-center gap-2">
      <TrendingUp size={16} className="text-green-500" />
      <span className="text-sm text-green-500 font-medium">{trend}</span>
      <span className="text-sm text-gray-400">actividad reciente</span>
    </div>
  </div>
);

export default function Dashboard() {
  // Calculate dynamic stats
  const totalSales = MOCK_SALES.reduce((sum, sale) => sum + sale.total, 0);
  const totalOrders = MOCK_SALES.length;
  const totalClients = MOCK_CLIENTS.length;
  const totalProducts = MOCK_PRODUCTS.length;
  const lowStockProducts = MOCK_PRODUCTS.filter(p => p.stock <= p.minStock).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Panel de Control</h2>
        <div className="flex gap-2">
           <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-bold border border-blue-100">
              Datos Actualizados
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Ventas Totales" 
          value={`S/ ${totalSales.toLocaleString(undefined, {minimumFractionDigits: 2})}`} 
          icon={DollarSign} 
          trend="Calculado" 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Ordenes" 
          value={totalOrders} 
          icon={ShoppingCart} 
          trend="Acumulado" 
          color="bg-indigo-500" 
        />
        <StatCard 
          title="Clientes" 
          value={totalClients} 
          icon={Users} 
          trend="Registrados" 
          color="bg-purple-500" 
        />
        <StatCard 
          title="Productos" 
          value={totalProducts} 
          icon={Package} 
          trend={`${lowStockProducts} stock bajo`} 
          color={lowStockProducts > 0 ? "bg-red-500" : "bg-pink-500"} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Tendencia de Ventas (Demo)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `S/ ${value}`} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                />
                <Bar dataKey="ventas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Ventas por Categoría (Demo)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4 flex-wrap">
               {categoryData.map((item) => (
                 <div key={item.name} className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                    <span className="text-xs text-gray-500">{item.name}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
