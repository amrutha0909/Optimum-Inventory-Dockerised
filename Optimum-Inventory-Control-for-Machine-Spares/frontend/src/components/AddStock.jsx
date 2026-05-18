import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { PackagePlus, Search, Truck, History, Trash2 } from 'lucide-react'; // Added Trash2 icon

const AddStock = () => {
  const navigate = useNavigate();
  const [spares, setSpares] = useState([]);
  const [selectedSpare, setSelectedSpare] = useState('');
  const [quantity, setQuantity] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [recentLogs, setRecentLogs] = useState(() => {
    const savedLogs = localStorage.getItem('localStockLogs');
    return savedLogs ? JSON.parse(savedLogs) : [];
  });

  useEffect(() => {
    fetchSpares();
  }, []);

  useEffect(() => {
    localStorage.setItem('localStockLogs', JSON.stringify(recentLogs));
  }, [recentLogs]);

  const clearLogs = () => {
    if (window.confirm("Are you sure you want to clear the activity history?")) {
      setRecentLogs([]);
      localStorage.removeItem('localStockLogs');
    }
  };

  const fetchSpares = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/spares');
      setSpares(res.data);
    } catch (err) { console.error(err); }
  };

  const handleRestock = async (e) => {
    e.preventDefault();
    if (!selectedSpare || !quantity) return;

    try {
      await axios.patch(`http://localhost:5000/api/spares/${selectedSpare}/restock`, {
        quantity: parseInt(quantity)
      });
      
      const item = spares.find(s => s._id === selectedSpare);
      const newLog = {
        id: Date.now(),
        name: item.name,
        qty: quantity,
        time: new Date().toLocaleString(), 
        sku: item.sku
      };
      
      setRecentLogs([newLog, ...recentLogs]); 
      setQuantity('');
      setSelectedSpare('');
      fetchSpares();
      alert(`Successfully added ${quantity} units to inventory.`);
    } catch (err) {
      console.error(err);
      alert('Error updating stock');
    }
  };

  const filteredSpares = spares.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-extrabold text-slate-800">Incoming Stock Entry</h1>
        <p className="text-slate-500 mt-1">Record new shipments and update inventory levels</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 h-fit">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50">
            <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
              <Truck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Receive Shipment</h2>
              <p className="text-xs text-slate-400">Goods Receipt Note (GRN)</p>
            </div>
          </div>

          <form onSubmit={handleRestock} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">1. Select Item</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search by Name or SKU..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-3 pl-10 mb-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <select 
                value={selectedSpare} 
                onChange={(e) => setSelectedSpare(e.target.value)}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
                size={5} 
                required
              >
                <option value="" disabled className="p-2 text-gray-400 italic">-- Select an Item to Restock --</option>
                {filteredSpares.map(spare => (
                  <option key={spare._id} value={spare._id} className="p-2 hover:bg-indigo-50 cursor-pointer border-b border-slate-50">
                    {spare.name} (Current: {spare.currentStock}) - SKU: {spare.sku}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">2. Quantity Received</label>
              <div className="flex items-center gap-4">
                <input 
                  type="number" 
                  value={quantity} 
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="00" 
                  className="w-full p-4 text-2xl font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <button type="submit" className="h-full px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition flex items-center gap-2">
                  <PackagePlus size={20} /> Restock
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="bg-slate-900 p-8 rounded-2xl shadow-xl text-white h-fit">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
               <History className="text-emerald-400" />
               <h2 className="text-lg font-bold">Activity History</h2>
            </div>
            {recentLogs.length > 0 && (
              <button 
                onClick={clearLogs} 
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg border border-white/10"
                title="Clear all history"
              >
                <Trash2 size={12} /> Clear
              </button>
            )}
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {recentLogs.length === 0 ? (
              <p className="text-slate-500 text-sm italic">No history available.</p>
            ) : (
              recentLogs.map(log => (
                <div key={log.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                  <div>
                    <p className="font-bold text-white">{log.name}</p>
                    <p className="text-xs text-slate-400">SKU: {log.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-bold text-lg">+{log.qty}</p>
                    <p className="text-[10px] text-slate-500">{log.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-slate-500">Need to create a brand new item?</p>
            <p 
              onClick={() => navigate('/')} 
              className="text-sm text-indigo-400 cursor-pointer hover:text-indigo-300 font-semibold"
            >
              Go to Dashboard to register new parts.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AddStock;