import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { IndianRupee, Package, Activity, ArrowUpRight } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

const Analytics = () => {
  const [spares, setSpares] = useState([]);
  const [abcStats, setAbcStats] = useState({ A: 0, B: 0, C: 0 });
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    fetchAndProcessData();
  }, []);

  const fetchAndProcessData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/spares');
      const data = res.data;
      const processedData = data.map(item => ({
        ...item,
        usageValue: item.annualDemand * item.unitPrice
      }));
      processedData.sort((a, b) => b.usageValue - a.usageValue);

      const totalInvValue = processedData.reduce((sum, item) => sum + item.usageValue, 0);
      setTotalValue(totalInvValue);

      let cumulativeValue = 0;
      let counts = { A: 0, B: 0, C: 0 };
      const categorizedData = processedData.map(item => {
        cumulativeValue += item.usageValue;
        const percentage = (cumulativeValue / totalInvValue) * 100;
        let category = 'C';
        if (percentage <= 70) category = 'A';
        else if (percentage <= 90) category = 'B';
        counts[category]++;
        return { ...item, category };
      });

      setSpares(categorizedData);
      setAbcStats(counts);
    } catch (err) { console.error(err); }
  };

  const pieData = {
    labels: ['Class A (High Value)', 'Class B (Medium)', 'Class C (Low Value)'],
    datasets: [{
      data: [abcStats.A, abcStats.B, abcStats.C],
      backgroundColor: ['#6366f1', '#f59e0b', '#10b981'],
      borderWidth: 0,
    }],
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h1 className="text-3xl font-extrabold text-slate-800">Analytics & ABC Classification</h1>
        <p className="text-slate-500 mt-1">Cost analysis in INR (₹)</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-violet-600 p-6 rounded-2xl shadow-lg shadow-indigo-500/20 text-white">
          <div className="absolute top-0 right-0 p-4 opacity-10"><IndianRupee size={100} /></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 opacity-80">
              <IndianRupee size={18} /> <span className="text-sm font-medium">Total Inventory Value</span>
            </div>
            <p className="text-3xl font-bold">₹ {totalValue.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-orange-100 rounded-xl text-orange-600">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total SKU Count</p>
            <p className="text-2xl font-bold text-slate-800">{spares.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-rose-100 rounded-xl text-rose-600">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Critical (Class A)</p>
            <p className="text-2xl font-bold text-slate-800">{abcStats.A}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center justify-center">
          <h2 className="text-lg font-bold text-slate-700 w-full mb-4">Distribution by Count</h2>
          <div className="h-64 w-full flex justify-center">
            <Doughnut data={pieData} options={{ cutout: '70%', plugins: { legend: { position: 'bottom' } } }} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl shadow-xl text-white">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <ArrowUpRight className="text-emerald-400" /> Pareto Principle (80/20)
          </h3>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xl">A</div>
              <div>
                <h4 className="font-bold text-indigo-100">High Value (70% Cost)</h4>
                <p className="text-sm text-slate-400 mt-1">Strict control needed. Order frequently in small batches to save capital.</p>
              </div>
            </div>
            <div className="w-full h-px bg-slate-700/50" />
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xl">B</div>
              <div>
                <h4 className="font-bold text-amber-100">Moderate Value (20% Cost)</h4>
                <p className="text-sm text-slate-400 mt-1">Moderate control. Good record keeping is sufficient.</p>
              </div>
            </div>
            <div className="w-full h-px bg-slate-700/50" />
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xl">C</div>
              <div>
                <h4 className="font-bold text-emerald-100">Low Value (10% Cost)</h4>
                <p className="text-sm text-slate-400 mt-1">Loose control. Bulk ordering to save on ordering costs.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
            <tr>
              <th className="p-4">Spare Name</th>
              <th className="p-4">Annual Usage</th>
              <th className="p-4">Class</th>
              <th className="p-4">Recommendation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {spares.map((spare) => (
              <tr key={spare._id} className="hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-700">{spare.name}</td>
                <td className="p-4 text-slate-600">₹ {spare.usageValue.toLocaleString('en-IN')}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                    spare.category === 'A' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                    spare.category === 'B' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                    'bg-emerald-50 text-emerald-700 border-emerald-100'
                  }`}>
                    {spare.category}
                  </span>
                </td>
                <td className="p-4 text-sm text-slate-500">
                  {spare.category === 'A' ? 'Zero Inventory / JIT' :
                   spare.category === 'B' ? 'Min-Max System' :
                   'Two-Bin System'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Analytics;