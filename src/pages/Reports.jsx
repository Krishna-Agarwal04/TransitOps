import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Search, 
  TrendingUp, 
  Download, 
  Info,
  DollarSign,
  TrendingDown,
  Percent,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  Cell
} from 'recharts';
import { useAuth } from '../context/AuthContext';

// Mock fleet data containing acquisition details, revenue logs, and fuel logs
const INITIAL_REPORT_DATA = [
  { id: '1', name: 'Van-05', registrationNumber: 'MH-12-AB-1234', distance: 1500, fuelConsumed: 120, maintenanceCost: 80, fuelCost: 180, revenue: 4200, acquisitionCost: 15000 },
  { id: '2', name: 'Truck-02', registrationNumber: 'DL-01-XY-5678', distance: 8200, fuelConsumed: 880, maintenanceCost: 450, fuelCost: 1320, revenue: 15400, acquisitionCost: 35000 },
  { id: '3', name: 'Sedan-03', registrationNumber: 'KA-03-CD-9012', distance: 3500, fuelConsumed: 220, maintenanceCost: 0, fuelCost: 330, revenue: 3800, acquisitionCost: 18000 },
  { id: '4', name: 'Truck-04', registrationNumber: 'MH-14-EF-3456', distance: 9800, fuelConsumed: 1100, maintenanceCost: 0, fuelCost: 1650, revenue: 21800, acquisitionCost: 42000 },
  { id: '5', name: 'Van-01', registrationNumber: 'DL-03-GH-7890', distance: 4000, fuelConsumed: 320, maintenanceCost: 0, fuelCost: 480, revenue: 5900, acquisitionCost: 16000 },
  { id: '6', name: 'Truck-05', registrationNumber: 'KA-05-JK-1234', distance: 6800, fuelConsumed: 740, maintenanceCost: 120, fuelCost: 1110, revenue: 9800, acquisitionCost: 48000 }
];

export default function Reports() {
  const { user, ROLES } = useAuth();
  const [data, setData] = useState(INITIAL_REPORT_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const [roiFilter, setRoiFilter] = useState('All');

  // ROI & Fuel calculations helper
  const computeMetrics = (item) => {
    const fuelEfficiency = item.fuelConsumed > 0 ? (item.distance / item.fuelConsumed) : 0;
    const totalExpenses = item.maintenanceCost + item.fuelCost;
    const netProfit = item.revenue - totalExpenses;
    
    // ROI Formula: (Revenue - (Maintenance + Fuel)) / Acquisition Cost
    const roiPercentage = item.acquisitionCost > 0 
      ? ((item.revenue - (item.maintenanceCost + item.fuelCost)) / item.acquisitionCost) * 100 
      : 0;

    return {
      fuelEfficiency: parseFloat(fuelEfficiency.toFixed(2)),
      totalExpenses,
      netProfit,
      roi: parseFloat(roiPercentage.toFixed(2))
    };
  };

  const processedData = data.map(item => ({
    ...item,
    ...computeMetrics(item)
  }));

  // Filters logic
  const filteredData = processedData.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (roiFilter === 'High') return matchesSearch && item.roi >= 15;
    if (roiFilter === 'Low') return matchesSearch && item.roi < 15 && item.roi >= 0;
    if (roiFilter === 'Negative') return matchesSearch && item.roi < 0;
    return matchesSearch;
  });

  // Recharts visual data
  const chartData = filteredData.map(item => ({
    name: item.name,
    ROI: item.roi,
    Efficiency: item.fuelEfficiency
  }));

  // Client-side CSV Exporter
  const handleExportCSV = () => {
    const headers = [
      'Vehicle Model',
      'Registration Number',
      'Distance (km)',
      'Fuel Consumed (L)',
      'Fuel Efficiency (km/L)',
      'Maintenance Cost ($)',
      'Fuel Cost ($)',
      'Acquisition Cost ($)',
      'Revenue ($)',
      'ROI (%)'
    ];

    const rows = filteredData.map(item => [
      item.name,
      item.registrationNumber,
      item.distance,
      item.fuelConsumed,
      item.fuelEfficiency,
      item.maintenanceCost,
      item.fuelCost,
      item.acquisitionCost,
      item.revenue,
      `${item.roi}%`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transitops_fleet_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-xs text-slate-500 font-medium">Analyze vehicle ROI margins, distance ratios, and export Excel logs</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-750 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
        >
          <FileSpreadsheet className="h-4 w-4" /> Export Report to CSV
        </button>
      </div>

      {/* Filter and Search Box */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex flex-wrap items-center gap-3 flex-1 max-w-xl">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by vehicle model or reg number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-colors"
            />
          </div>

          <select
            value={roiFilter}
            onChange={(e) => setRoiFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="All">All ROI Levels</option>
            <option value="High">High ROI (≥ 15%)</option>
            <option value="Low">Low ROI (0% - 15%)</option>
            <option value="Negative">Negative ROI (&lt; 0%)</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-semibold">
          Filtered Records: {filteredData.length}
        </div>
      </div>

      {/* Recharts Analytics chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Vehicle Return on Investment (ROI)</h3>
          <p className="text-xs text-slate-400 font-medium mb-4">Comparison of performance percentage across fleet assets</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                formatter={(value) => [`${value}%`, 'ROI']}
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: 8, fontSize: 11 }}
              />
              <Bar dataKey="ROI" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={20}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.ROI >= 15 ? '#10b981' : entry.ROI >= 0 ? '#3b82f6' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Main Reports Table Grid */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50">
                <th className="py-3.5 px-6">Vehicle Asset</th>
                <th className="py-3.5 px-6">Reg Number</th>
                <th className="py-3.5 px-6">Distance (km)</th>
                <th className="py-3.5 px-6">Fuel Consumed</th>
                <th className="py-3.5 px-6">Efficiency (km/L)</th>
                <th className="py-3.5 px-6">Service Costs</th>
                <th className="py-3.5 px-6">Fuel Costs</th>
                <th className="py-3.5 px-6">Acquisition Cost</th>
                <th className="py-3.5 px-6">Revenue</th>
                <th className="py-3.5 px-6 text-right">ROI (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">{item.name}</td>
                    <td className="py-4 px-6">{item.registrationNumber}</td>
                    <td className="py-4 px-6 text-slate-500">{item.distance.toLocaleString()} km</td>
                    <td className="py-4 px-6 text-slate-500">{item.fuelConsumed} L</td>
                    <td className="py-4 px-6 font-bold text-slate-700">{item.fuelEfficiency} km/L</td>
                    <td className="py-4 px-6 text-slate-500">${item.maintenanceCost.toLocaleString()}</td>
                    <td className="py-4 px-6 text-slate-500">${item.fuelCost.toLocaleString()}</td>
                    <td className="py-4 px-6 text-slate-500">${item.acquisitionCost.toLocaleString()}</td>
                    <td className="py-4 px-6 font-bold text-slate-800">${item.revenue.toLocaleString()}</td>
                    <td className="py-4 px-6 text-right">
                      <span className={`inline-flex items-center gap-1 font-bold text-xs ${
                        item.roi >= 15 ? 'text-emerald-600' : item.roi >= 0 ? 'text-blue-600' : 'text-rose-600'
                      }`}>
                        {item.roi >= 15 ? <TrendingUp className="h-3.5 w-3.5" /> : item.roi < 0 ? <TrendingDown className="h-3.5 w-3.5" /> : <Percent className="h-3.5 w-3.5" />}
                        {item.roi}%
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-1.5 text-slate-400">
                      <Info className="h-6 w-6" />
                      <p className="text-sm font-semibold text-slate-500">No report logs available</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
