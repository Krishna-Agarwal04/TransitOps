import React, { useState } from 'react';
import { 
  Plus, 
  X, 
  Info,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Fuel,
  TrendingUp,
  DollarSign,
  Calendar,
  Layers,
  PieChart as PieIcon
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
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiService } from '../services/api';

// Mock list of vehicles to link expenses
const MOCK_VEHICLES = [
  { id: 'v1', name: 'Van-05', registrationNumber: 'MH-12-AB-1234' },
  { id: 'v2', name: 'Sedan-03', registrationNumber: 'KA-03-CD-9012' },
  { id: 'v3', name: 'Truck-05', registrationNumber: 'KA-05-JK-1234' },
  { id: 'v4', name: 'Truck-02', registrationNumber: 'DL-01-XY-5678' },
  { id: 'v5', name: 'Truck-04', registrationNumber: 'MH-14-EF-3456' }
];

const INITIAL_FUEL_LOGS = [
  { id: 'FL-004', vehicleName: 'Van-01', liters: 35, cost: 52.5, date: '2026-07-11' },
  { id: 'FL-003', vehicleName: 'Truck-04', liters: 120, cost: 180.0, date: '2026-07-10' },
  { id: 'FL-002', vehicleName: 'Van-05', liters: 45, cost: 67.5, date: '2026-07-09' },
  { id: 'FL-001', vehicleName: 'Truck-02', liters: 110, cost: 165.0, date: '2026-07-08' }
];

const INITIAL_EXPENSES = [
  { id: 'EXP-103', vehicleName: 'Truck-02', category: 'Tolls', amount: 45.0, description: 'National Highway Toll Charges', date: '2026-07-11' },
  { id: 'EXP-102', vehicleName: 'Van-05', category: 'Permits', amount: 150.0, description: 'Interstate Transport Permit Fee', date: '2026-07-10' },
  { id: 'EXP-101', vehicleName: 'Truck-05', category: 'Insurance', amount: 800.0, description: 'Annual Fleet Asset Insurance', date: '2026-07-08' }
];

const EXPENSE_CATEGORIES = ['Tolls', 'Permits', 'Insurance', 'Maintenance', 'Others'];

export default function Expenses() {
  const { user, ROLES } = useAuth();
  const { showToast } = useToast();
  const [fuelLogs, setFuelLogs] = useState(INITIAL_FUEL_LOGS);
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [vehicles, setVehicles] = useState(MOCK_VEHICLES);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const resVehicles = await apiService.vehicles.getAll();
      if (resVehicles && resVehicles.data) {
        setVehicles(resVehicles.data.map(v => ({
          id: v.id.toString(),
          name: v.model || v.name || 'Unknown',
          registrationNumber: v.registrationNumber
        })));
      }

      const resFuel = await apiService.expenses.getFuelLogs();
      if (resFuel && resFuel.data) {
        setFuelLogs(resFuel.data.map(f => ({
          id: `FL-${f.id}`,
          vehicleId: f.vehicleId.toString(),
          vehicleName: f.vehicle?.model || `Vehicle #${f.vehicleId}`,
          liters: f.quantity || f.liters || 50,
          cost: f.cost || 0,
          date: f.date ? f.date.split('T')[0] : (f.createdAt ? f.createdAt.split('T')[0] : '')
        })));
      }
    } catch (err) {
      console.warn("Could not load fuel logs, using mock fallback.", err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);
  const [activeTab, setActiveTab] = useState('fuel'); // 'fuel' or 'expenses'

  // Modals state
  const [isFuelDialogOpen, setIsFuelDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [formError, setFormError] = useState('');

  // Fuel Form Fields
  const [fuelVehicleId, setFuelVehicleId] = useState('');
  const [fuelLiters, setFuelLiters] = useState('');
  const [fuelCost, setFuelCost] = useState('');
  const [fuelDate, setFuelDate] = useState('');

  // Expense Form Fields
  const [expVehicleId, setExpVehicleId] = useState('');
  const [expCategory, setExpCategory] = useState('Tolls');
  const [expAmount, setExpAmount] = useState('');
  const [expDescription, setExpDescription] = useState('');
  const [expDate, setExpDate] = useState('');

  // Pagination states
  const [fuelPage, setFuelPage] = useState(1);
  const [expPage, setExpPage] = useState(1);
  const itemsPerPage = 5;

  const totalFuelCost = fuelLogs.reduce((sum, log) => sum + log.cost, 0);
  const totalExpenseCost = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const grandTotalCost = totalFuelCost + totalExpenseCost;

  // Pie chart aggregation
  const getPieChartData = () => {
    const data = {};
    expenses.forEach((e) => {
      data[e.category] = (data[e.category] || 0) + e.amount;
    });
    data['Fuel'] = totalFuelCost;

    return Object.keys(data).map((key) => ({
      name: key,
      value: data[key],
      color: key === 'Fuel' ? '#3b82f6' : 
             key === 'Tolls' ? '#10b981' : 
             key === 'Permits' ? '#f59e0b' : 
             key === 'Insurance' ? '#8b5cf6' : '#ec4899'
    }));
  };

  const pieChartData = getPieChartData();

  const handleAddFuel = (e) => {
    e.preventDefault();
    setFormError('');

    if (!fuelVehicleId || !fuelLiters || !fuelCost || !fuelDate) {
      setFormError('Please fill in all fields.');
      return;
    }

    const vehicle = vehicles.find(v => v.id === fuelVehicleId);
    const costNum = parseFloat(fuelCost);
    const litersNum = parseFloat(fuelLiters);

    if (isNaN(costNum) || costNum <= 0 || isNaN(litersNum) || litersNum <= 0) {
      setFormError('Values must be positive numbers.');
      return;
    }

    const newLog = {
      id: `FL-${String(100 + fuelLogs.length + 1).slice(1)}`,
      vehicleName: vehicle.name,
      liters: litersNum,
      cost: costNum,
      date: fuelDate
    };

    setFuelLogs([newLog, ...fuelLogs]);

    const runCreate = async () => {
      try {
        const payload = {
          vehicleId: parseInt(fuelVehicleId),
          amount: litersNum,
          cost: costNum,
          date: new Date(fuelDate).toISOString()
        };
        await apiService.expenses.createFuelLog(payload);
        showToast('Fuel log registered on backend!');
        loadData();
      } catch (err) {
        console.warn("Backend save failed, saved locally.", err);
      }
    };
    runCreate();

    setIsFuelDialogOpen(false);
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    setFormError('');

    if (!expVehicleId || !expCategory || !expAmount || !expDescription || !expDate) {
      setFormError('Please fill in all fields.');
      return;
    }

    const vehicle = vehicles.find(v => v.id === expVehicleId);
    const amountNum = parseFloat(expAmount);

    if (isNaN(amountNum) || amountNum <= 0) {
      setFormError('Amount must be a positive number.');
      return;
    }

    const newExpense = {
      id: `EXP-${100 + expenses.length + 1}`,
      vehicleName: vehicle.name,
      category: expCategory,
      amount: amountNum,
      description: expDescription,
      date: expDate
    };

    setExpenses([newExpense, ...expenses]);
    setIsExpenseDialogOpen(false);
  };

  // Pagination lists
  const paginatedFuel = fuelLogs.slice((fuelPage - 1) * itemsPerPage, fuelPage * itemsPerPage);
  const totalFuelPages = Math.ceil(fuelLogs.length / itemsPerPage) || 1;

  const paginatedExp = expenses.slice((expPage - 1) * itemsPerPage, expPage * itemsPerPage);
  const totalExpPages = Math.ceil(expenses.length / itemsPerPage) || 1;

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Expenses & Fuel Logs</h1>
          <p className="text-xs text-slate-500 font-medium">Log refuels, track auxiliary tolls/insurance fees, and audit spending statistics</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'fuel' ? (
            <button
              onClick={() => {
                setFuelVehicleId('');
                setFuelLiters('');
                setFuelCost('');
                setFuelDate(new Date().toISOString().split('T')[0]);
                setFormError('');
                setIsFuelDialogOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" /> Log Refuel
            </button>
          ) : (
            <button
              onClick={() => {
                setExpVehicleId('');
                setExpCategory('Tolls');
                setExpAmount('');
                setExpDescription('');
                setExpDate(new Date().toISOString().split('T')[0]);
                setFormError('');
                setIsExpenseDialogOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" /> Log Expense
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <Fuel className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Fuel Costs</span>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">${totalFuelCost.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Auxiliary Expenses</span>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">${totalExpenseCost.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accumulated Budget</span>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">${grandTotalCost.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* Main Grid: Data Section + Recharts Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Table Records Column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tab selectors */}
          <div className="flex border-b border-slate-200 bg-white px-4 rounded-t-xl border-t border-x">
            <button
              onClick={() => setActiveTab('fuel')}
              className={`py-3 px-4 text-xs font-bold transition-all border-b-2 -mb-px flex items-center gap-2 ${
                activeTab === 'fuel' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Fuel className="h-4 w-4" /> Fuel Logs
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`py-3 px-4 text-xs font-bold transition-all border-b-2 -mb-px flex items-center gap-2 ${
                activeTab === 'expenses' 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Receipt className="h-4 w-4" /> Miscellaneous Expenses
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-b-xl shadow-sm overflow-hidden flex flex-col justify-between min-h-[350px]">
            {activeTab === 'fuel' ? (
              // Fuel Log List
              <div className="flex-1 flex flex-col justify-between">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50">
                        <th className="py-3 px-6">ID</th>
                        <th className="py-3 px-6">Vehicle</th>
                        <th className="py-3 px-6">Refueled Volume</th>
                        <th className="py-3 px-6">Total Cost</th>
                        <th className="py-3 px-6">Price/Litre</th>
                        <th className="py-3 px-6">Refuel Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {paginatedFuel.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="py-4 px-6 font-bold text-slate-900">{log.id}</td>
                          <td className="py-4 px-6 font-bold text-slate-800">{log.vehicleName}</td>
                          <td className="py-4 px-6">{log.liters} L</td>
                          <td className="py-4 px-6 font-bold text-slate-800">${log.cost}</td>
                          <td className="py-4 px-6 text-slate-500">${(log.cost / log.liters).toFixed(2)}/L</td>
                          <td className="py-4 px-6 text-slate-400 font-semibold">{log.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50/50">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase">
                    Page {fuelPage} of {totalFuelPages}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setFuelPage(prev => Math.max(prev - 1, 1))}
                      disabled={fuelPage === 1}
                      className="p-1 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4 text-slate-600" />
                    </button>
                    <button
                      onClick={() => setFuelPage(prev => Math.min(prev + 1, totalFuelPages))}
                      disabled={fuelPage === totalFuelPages}
                      className="p-1 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 transition-colors"
                    >
                      <ChevronRight className="h-4 w-4 text-slate-600" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Expenses Log List
              <div className="flex-1 flex flex-col justify-between">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50">
                        <th className="py-3 px-6">ID</th>
                        <th className="py-3 px-6">Vehicle</th>
                        <th className="py-3 px-6">Category</th>
                        <th className="py-3 px-6">Amount</th>
                        <th className="py-3 px-6">Description</th>
                        <th className="py-3 px-6">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {paginatedExp.map((exp) => (
                        <tr key={exp.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="py-4 px-6 font-bold text-slate-900">{exp.id}</td>
                          <td className="py-4 px-6 font-bold text-slate-800">{exp.vehicleName}</td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              exp.category === 'Tolls' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              exp.category === 'Insurance' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                              'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {exp.category}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-bold text-slate-800">${exp.amount}</td>
                          <td className="py-4 px-6 text-slate-500 max-w-[200px] truncate">{exp.description}</td>
                          <td className="py-4 px-6 text-slate-400 font-semibold">{exp.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50/50">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase">
                    Page {expPage} of {totalExpPages}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setExpPage(prev => Math.max(prev - 1, 1))}
                      disabled={expPage === 1}
                      className="p-1 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4 text-slate-600" />
                    </button>
                    <button
                      onClick={() => setExpPage(prev => Math.min(prev + 1, totalExpPages))}
                      disabled={expPage === totalExpPages}
                      className="p-1 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 transition-colors"
                    >
                      <ChevronRight className="h-4 w-4 text-slate-600" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recharts Analytics Column */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-slate-500" /> Cost Distribution
            </h3>
            <p className="text-xs text-slate-400 font-medium mb-4">Total budget allocation share</p>
          </div>
          <div className="h-56 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value}`} contentStyle={{ fontSize: 11, borderRadius: 6 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Grand Total</span>
              <span className="text-xl font-bold text-slate-800">${grandTotalCost.toLocaleString()}</span>
            </div>
          </div>
          <div className="space-y-2 mt-4 pt-4 border-t border-slate-100 flex-1">
            {pieChartData.map((slice) => (
              <div key={slice.name} className="flex items-center justify-between text-xs font-semibold text-slate-600">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: slice.color }}></span>
                  <span>{slice.name}</span>
                </span>
                <span>${slice.value.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Log Refuel Dialog */}
      {isFuelDialogOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-sm shadow-lg overflow-hidden animate-scale-up">
            
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Record Fuel Purchase</h3>
              <button 
                onClick={() => setIsFuelDialogOpen(false)}
                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddFuel} className="p-6 space-y-4">
              {formError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Select Vehicle *
                </label>
                <select
                  value={fuelVehicleId}
                  onChange={(e) => setFuelVehicleId(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  required
                >
                  <option value="">-- Choose Vehicle --</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.registrationNumber})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Volume (Liters) *
                  </label>
                  <input
                    type="number"
                    value={fuelLiters}
                    onChange={(e) => setFuelLiters(e.target.value)}
                    placeholder="e.g. 45"
                    min="1"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-955 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Total Cost ($) *
                  </label>
                  <input
                    type="number"
                    value={fuelCost}
                    onChange={(e) => setFuelCost(e.target.value)}
                    placeholder="e.g. 67.5"
                    min="1"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-955 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Date of Refuel *
                </label>
                <input
                  type="date"
                  value={fuelDate}
                  onChange={(e) => setFuelDate(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-955 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFuelDialogOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Expense Dialog */}
      {isExpenseDialogOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-sm shadow-lg overflow-hidden animate-scale-up">
            
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Record Operational Expense</h3>
              <button 
                onClick={() => setIsExpenseDialogOpen(false)}
                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="p-6 space-y-4">
              {formError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Select Vehicle *
                  </label>
                  <select
                    value={expVehicleId}
                    onChange={(e) => setExpVehicleId(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    required
                  >
                    <option value="">-- Choose --</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    {EXPENSE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Amount ($) *
                  </label>
                  <input
                    type="number"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    placeholder="e.g. 45"
                    min="1"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-955 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Date of Expense *
                  </label>
                  <input
                    type="date"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-955 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Expense Description *
                </label>
                <textarea
                  value={expDescription}
                  onChange={(e) => setExpDescription(e.target.value)}
                  placeholder="e.g. Toll taxes paid on NH-8 route run"
                  rows="2"
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-955 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsExpenseDialogOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
