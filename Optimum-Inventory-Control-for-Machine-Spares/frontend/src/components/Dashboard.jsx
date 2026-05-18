import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { AlertTriangle, CheckCircle, TrendingUp, Trash2 } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [spares, setSpares] = useState([]);
  const [formData, setFormData] = useState({
    name: '', sku: '', annualDemand: '', orderingCost: '', unitPrice: '', 
    holdingCostRate: '', leadTimeDays: '', currentStock: ''
  });

  useEffect(() => {
    fetchSpares();
  }, []);

  const fetchSpares = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/spares');
      setSpares(res.data);
    } catch (err) { console.error(err); }
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/api/spares', formData);
    fetchSpares();
    setFormData({ name: '', sku: '', annualDemand: '', orderingCost: '', unitPrice: '', holdingCostRate: '', leadTimeDays: '', currentStock: '' });
  };

  const consumeItem = async (id, currentStock) => {
    const qtyStr = prompt(`How many units do you want to dispatch? (Max: ${currentStock})`, "1");
    if (qtyStr === null) return;
    const qty = parseInt(qtyStr);

    if (isNaN(qty) || qty <= 0) {
      alert("Please enter a valid positive number.");
      return;
    }

    if (qty > currentStock) {
      alert(`Error: Insufficient stock! You only have ${currentStock} units available.`);
      return;
    }

    try {
      await axios.patch(`http://localhost:5000/api/spares/${id}/consume`, { quantity: qty });
      fetchSpares();
    } catch (err) {
      console.error(err);
      alert("Failed to update stock.");
    }
  };

  const deleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item permanently?')) {
      try {
        await axios.delete(`http://localhost:5000/api/spares/${id}`);
        fetchSpares();
      } catch (err) {
        console.error("Delete Failed:", err);
        alert("Failed to delete.");
      }
    }
  };

  const chartData = {
    labels: spares.map(s => s.name),
    datasets: [
      { label: 'Current Stock', data: spares.map(s => s.currentStock), backgroundColor: '#6366f1', borderRadius: 6 },
      { label: 'Reorder Point', data: spares.map(s => s.reorderPoint), backgroundColor: '#ef4444', borderRadius: 6 }
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, 
    plugins: { legend: { position: 'top' } },
    scales: {
      y: { grid: { color: '#f3f4f6' } },
      x: { grid: { display: false } }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-indigo-600">
            Dashboard Overview
          </h1>
          <p className="text-slate-500 mt-1">Real-time inventory metrics</p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-slate-700">Location: India</p>
          <p className="text-xs text-slate-400">Currency: INR (₹)</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                Stock vs Reorder Levels
              </h2>
            </div>
            
            <div className="relative h-72 w-full">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50">
              <h2 className="text-lg font-bold text-slate-700">Live Inventory Status</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold tracking-wider">
                  <tr>
                    <th className="p-4">Item</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">EOQ</th>
                    <th className="p-4">ROP</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {spares.map((spare) => (
                    <tr key={spare._id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="p-4 font-medium text-slate-700">{spare.name}</td>
                      <td className="p-4 font-bold text-slate-800">{spare.currentStock}</td>
                      <td className="p-4 text-indigo-600 font-semibold">{spare.eoq}</td>
                      <td className="p-4 text-slate-500">{spare.reorderPoint}</td>
                      <td className="p-4">
                        {spare.status === 'Reorder Now' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold border border-red-100">
                            <AlertTriangle size={12}/> Reorder
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100">
                            <CheckCircle size={12}/> Healthy
                          </span>
                        )}
                      </td>
                      <td className="p-4 flex items-center gap-2">
                        <button 
                          onClick={() => consumeItem(spare._id, spare.currentStock)} 
                          className="text-xs bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-lg transition-colors">
                          Dispatch
                        </button>
                        
                        <button 
                          onClick={() => deleteItem(spare._id)} 
                          className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          title="Delete Item">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 h-fit sticky top-8">
          <div className="mb-6 pb-4 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-800">Add New Spare</h2>
            <p className="text-xs text-slate-400 mt-1">Enter details to auto-calculate EOQ</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <input name="name" placeholder="Item Name" value={formData.name} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" required />
              
              <div className="grid grid-cols-2 gap-3">
                <input name="sku" placeholder="SKU ID" value={formData.sku} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" required />
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400 text-sm">₹</span>
                  <input name="unitPrice" type="number" placeholder="Price" value={formData.unitPrice} onChange={handleInputChange} className="w-full p-3 pl-7 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" required />
                </div>
              </div>

              <input name="currentStock" type="number" placeholder="Current Stock Qty" value={formData.currentStock} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" required />
            </div>

            <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-3">
              <p className="text-xs font-bold text-indigo-800 uppercase tracking-wide">Optimization Parameters</p>
              <div className="grid grid-cols-2 gap-3">
                <input name="annualDemand" type="number" placeholder="Ann. Demand" value={formData.annualDemand} onChange={handleInputChange} className="p-2 text-sm border-0 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-indigo-500" required />
                <input name="orderingCost" type="number" placeholder="Order Cost (₹)" value={formData.orderingCost} onChange={handleInputChange} className="p-2 text-sm border-0 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-indigo-500" required />
                <input name="holdingCostRate" type="number" placeholder="Hold Rate %" value={formData.holdingCostRate} onChange={handleInputChange} className="p-2 text-sm border-0 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-indigo-500" required />
                <input name="leadTimeDays" type="number" placeholder="Lead Time" value={formData.leadTimeDays} onChange={handleInputChange} className="p-2 text-sm border-0 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-indigo-500" required />
              </div>
            </div>

            <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 transition-all transform active:scale-95">
              Add to Inventory
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;