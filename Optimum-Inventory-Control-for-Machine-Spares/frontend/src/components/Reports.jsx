import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { IndianRupee, ArrowDownLeft, ArrowUpRight, Calendar, Clock, Trash2, PlusCircle } from 'lucide-react';

const Reports = () => {
  const [transactions, setTransactions] = useState([]);
  const [currentValue, setCurrentValue] = useState(0);
  const [stats, setStats] = useState({ addedToday: 0, dispatchedToday: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const invRes = await axios.get('http://localhost:5000/api/spares');
      const totalVal = invRes.data.reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0);
      setCurrentValue(totalVal);

      const transRes = await axios.get('http://localhost:5000/api/transactions');
      setTransactions(transRes.data);

      const today = new Date().toDateString();
      let added = 0;
      let dispatched = 0;

      transRes.data.forEach(t => {
        const tDate = new Date(t.date).toDateString();
        if (tDate === today) {
          if (t.type === 'IN') added += t.quantity;
          if (t.type === 'OUT') dispatched += t.quantity;
        }
      });

      setStats({ addedToday: added, dispatchedToday: dispatched });

    } catch (err) { console.error(err); }
  };

  const renderBadge = (type) => {
    switch (type) {
      case 'IN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
            <ArrowDownLeft size={12}/> Received
          </span>
        );
      case 'OUT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">
            <ArrowUpRight size={12}/> Dispatched
          </span>
        );
      case 'DELETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-50 text-red-700 text-xs font-bold border border-red-100">
            <Trash2 size={12}/> Deleted
          </span>
        );
      case 'CREATED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-teal-50 text-teal-700 text-xs font-bold border border-teal-100">
            <PlusCircle size={12}/> New Item
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-extrabold text-slate-800">Inventory Reports</h1>
        <p className="text-slate-500 mt-1">Real-time asset value and transaction history</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2 opacity-90">
            <IndianRupee size={20} />
            <span className="font-semibold">Current Asset Worth</span>
          </div>
          <p className="text-3xl font-bold">₹ {currentValue.toLocaleString('en-IN')}</p>
          <p className="text-xs text-emerald-100 mt-2">Value of items physically in store</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-semibold">Received Today</p>
            <p className="text-3xl font-bold text-slate-800">{stats.addedToday} <span className="text-sm font-normal text-slate-400">units</span></p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
            <ArrowDownLeft size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-semibold">Dispatched Today</p>
            <p className="text-3xl font-bold text-slate-800">{stats.dispatchedToday} <span className="text-sm font-normal text-slate-400">units</span></p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-full">
            <ArrowUpRight size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
            <Clock className="text-slate-400" size={20}/> Activity Logs
          </h2>
          <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1 rounded-full">Sorted by Newest</span>
        </div>
        
        <div className="max-h-[500px] overflow-y-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold sticky top-0 bg-white z-10 shadow-sm">
              <tr>
                <th className="p-4">Time</th>
                <th className="p-4">Action</th>
                <th className="p-4">Item Details</th>
                <th className="p-4 text-right">Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {transactions.map((t) => (
                <tr key={t._id} className={`hover:bg-slate-50 transition-colors ${t.type === 'DELETED' ? 'bg-red-50/30' : ''}`}>
                  <td className="p-4 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <Calendar size={14}/>
                      {new Date(t.date).toLocaleDateString()} 
                      <span className="text-slate-300">|</span> 
                      {new Date(t.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </td>
                  <td className="p-4">
                    {renderBadge(t.type)}
                  </td>
                  <td className="p-4">
                    <p className={`font-bold ${t.type === 'DELETED' ? 'text-red-800 line-through' : 'text-slate-700'}`}>
                      {t.itemName}
                    </p>
                    <p className="text-xs text-slate-400">SKU: {t.sku}</p>
                  </td>
                  <td className={`p-4 text-right font-bold text-lg 
                    ${t.type === 'IN' || t.type === 'CREATED' ? 'text-blue-600' : 
                      t.type === 'DELETED' ? 'text-red-500' : 'text-amber-600'}`}>
                    {t.type === 'IN' || t.type === 'CREATED' ? '+' : '-'}{t.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;