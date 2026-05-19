import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Download, Trash2, MapPin, Building2, Calculator, AlertOctagon } from 'lucide-react';

const Settings = () => {
  const [config, setConfig] = useState({
    warehouseName: 'Lovely Professional University',
    location: 'Punjab, India',
    gstin: 'xxxxxxxxxxxxxxx',
    defaultHoldingRate: 20,
    currency: 'INR',
    alertThreshold: 10
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const savedConfig = localStorage.getItem('invConfig');
    if (savedConfig) setConfig(JSON.parse(savedConfig));
  }, []);

  const handleChange = (e) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const saveSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('invConfig', JSON.stringify(config));
    setMessage({ type: 'success', text: 'Configuration saved successfully!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const downloadCSV = async () => {
    try {
      const res = await axios.get('http://3.27.145.31:5000/api/spares');
      const data = res.data;
      
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Name,SKU,Current Stock,Unit Price (INR),Annual Demand,EOQ,Status\n";

      data.forEach(row => {
        csvContent += `${row.name},${row.sku},${row.currentStock},${row.unitPrice},${row.annualDemand},${row.eoq},${row.status}\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "inventory_report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to download report.' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <header>
        <h1 className="text-3xl font-extrabold text-slate-800">System Settings</h1>
        <p className="text-slate-500 mt-1">Configure global parameters and warehouse details</p>
      </header>

      {message && (
        <div className={`p-4 rounded-xl border ${message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        
        <section className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
              <Building2 size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-700">Warehouse Profile (India)</h2>
          </div>

          <form onSubmit={saveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Warehouse Name</label>
              <input name="warehouseName" value={config.warehouseName} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 text-slate-400" size={16} />
                <input name="location" value={config.location} onChange={handleChange} className="w-full p-3 pl-9 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">GSTIN Number</label>
              <input name="gstin" value={config.gstin} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="flex items-end">
              <button type="submit" className="flex items-center gap-2 bg-slate-800 text-white px-6 py-3 rounded-xl hover:bg-slate-900 transition-colors">
                <Save size={18} /> Save Profile
              </button>
            </div>
          </form>
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
              <Calculator size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-700">Optimization Defaults</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Default Holding Rate (%)</label>
              <input type="number" name="defaultHoldingRate" value={config.defaultHoldingRate} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
              <p className="text-xs text-slate-400 mt-1">Standard industrial rate is 15-25%</p>
             </div>
             <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Low Stock Alert Level (%)</label>
              <input type="number" name="alertThreshold" value={config.alertThreshold} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
             </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl text-white shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold">Export Data</h3>
                  <p className="text-emerald-100 text-sm mt-1">Download current inventory status as CSV for Excel/Sheets.</p>
                </div>
                <div className="p-2 bg-white/20 rounded-lg"><Download size={24}/></div>
              </div>
              <button onClick={downloadCSV} className="mt-6 w-full py-2 bg-white text-emerald-700 font-bold rounded-lg hover:bg-emerald-50 transition">
                Download CSV Report
              </button>
           </div>

           <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm">
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <AlertOctagon size={20}/>
                <h3 className="font-bold">Danger Zone</h3>
              </div>
              <p className="text-sm text-slate-500 mb-4">Irreversible actions. Be careful.</p>
              <button className="flex items-center justify-center gap-2 w-full py-2 border-2 border-red-100 text-red-600 font-bold rounded-lg hover:bg-red-50 transition">
                <Trash2 size={18}/> Reset Database
              </button>
           </div>
        </section>

      </div>
    </div>
  );
};

export default Settings;