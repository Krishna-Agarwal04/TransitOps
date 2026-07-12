import React, { useState } from 'react';
import { useAuth, ROLE_LABELS } from '../context/AuthContext';
import { 
  Truck, 
  Users, 
  Compass, 
  Wrench, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  PlusCircle, 
  FileSpreadsheet,
  Calendar,
  Filter
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';

// Static/Mock Dashboard Data (Professional Light-themed Mocking)
const mockKpis = {
  activeVehicles: 18,
  availableVehicles: 12,
  vehiclesInMaintenance: 4,
  driversOnDuty: 22,
  fleetUtilization: 82.5,
  activeTrips: 15,
  pendingTrips: 8,
};

const mockExpenseHistory = [
  { name: 'Jan', Fuel: 4500, Maintenance: 2400 },
  { name: 'Feb', Fuel: 5200, Maintenance: 1800 },
  { name: 'Mar', Fuel: 6100, Maintenance: 3200 },
  { name: 'Apr', Fuel: 5800, Maintenance: 2900 },
  { name: 'May', Fuel: 6300, Maintenance: 4100 },
  { name: 'Jun', Fuel: 7100, Maintenance: 3800 },
];

const mockTripHistory = [
  { name: 'Mon', Trips: 12, Efficiency: 8.4 },
  { name: 'Tue', Trips: 15, Efficiency: 8.2 },
  { name: 'Wed', Trips: 18, Efficiency: 8.9 },
  { name: 'Thu', Trips: 14, Efficiency: 9.1 },
  { name: 'Fri', Trips: 21, Efficiency: 8.5 },
  { name: 'Sat', Trips: 10, Efficiency: 8.8 },
  { name: 'Sun', Trips: 8,  Efficiency: 9.0 },
];

const mockRecentTrips = [
  { id: 'TRP-1049', vehicle: 'MH-12-PQ-9081', driver: 'Rahul Sharma', route: 'Mumbai ➔ Pune', cargo: '450 kg', status: 'DISPATCHED' },
  { id: 'TRP-1048', vehicle: 'DL-01-AB-1234', driver: 'Amit Verma', route: 'Delhi ➔ Noida', cargo: '320 kg', status: 'COMPLETED' },
  { id: 'TRP-1047', vehicle: 'KA-03-XY-5678', driver: 'Karan Singh', route: 'Bangalore ➔ Chennai', cargo: '500 kg', status: 'DISPATCHED' },
  { id: 'TRP-1046', vehicle: 'GJ-01-ZZ-9999', driver: 'Vikram Patel', route: 'Ahmedabad ➔ Surat', cargo: '150 kg', status: 'CANCELLED' },
  { id: 'TRP-1045', vehicle: 'MH-12-PQ-9081', driver: 'Rahul Sharma', route: 'Pune ➔ Mumbai', cargo: '400 kg', status: 'COMPLETED' },
];

const mockMaintenance = [
  { vehicle: 'MH-12-PQ-9081', type: 'Oil Change', cost: '₹4,500', date: '12 July 2026', status: 'IN_SHOP' },
  { vehicle: 'DL-01-AB-1234', type: 'Tire Replacement', cost: '₹18,000', date: '10 July 2026', status: 'COMPLETED' },
  { vehicle: 'KA-03-XY-5678', type: 'Brake Servicing', cost: '₹6,200', date: '08 July 2026', status: 'IN_SHOP' },
];

const VEHICLE_STATUS_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
const mockStatusData = [
  { name: 'On Trip', value: 18 },
  { name: 'Available', value: 12 },
  { name: 'In Shop', value: 4 },
  { name: 'Retired', value: 2 },
];

export default function Dashboard() {
  const { user, ROLES } = useAuth();
  const navigate = useNavigate();

  // Filters State
  const [vehicleType, setVehicleType] = useState('All');
  const [region, setRegion] = useState('All');
  const [timeRange, setTimeRange] = useState('Last 7 Days');

  // Quick Action Routing Handler
  const handleQuickAction = (path) => {
    navigate(path);
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Welcome banner & Top Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome Back, {user?.name}!</h1>
          <p className="text-slate-500 text-sm mt-0.5">Here is the current overview of your fleet operations.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-600 font-semibold">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span>12 July 2026</span>
          </div>
          <button className="flex items-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors">
            <FileSpreadsheet className="h-4 w-4" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Interactive Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Filter className="h-4 w-4 text-slate-400" />
          <span>Quick Filters:</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <select 
              value={vehicleType} 
              onChange={(e) => setVehicleType(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="All">All Vehicle Types</option>
              <option value="Truck">Trucks Only</option>
              <option value="Van">Vans Only</option>
              <option value="Sedan">Sedans Only</option>
            </select>
          </div>
          <div>
            <select 
              value={region} 
              onChange={(e) => setRegion(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="All">All Regions</option>
              <option value="North">North Hub</option>
              <option value="East">East Hub</option>
              <option value="South">South Hub</option>
              <option value="West">West Hub</option>
            </select>
          </div>
          <div>
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="This Month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Fleet Utilization */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fleet Utilization</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-2">{mockKpis.fleetUtilization}%</h3>
            <span className="text-[10px] text-green-600 font-semibold flex items-center gap-0.5 mt-1">
              <TrendingUp className="h-3 w-3" /> +1.2% this week
            </span>
          </div>
          <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
            <Activity className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        {/* Card 2: Active Vehicles */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Fleet</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-2">
              {mockKpis.activeVehicles} <span className="text-xs text-slate-400 font-medium">/ {mockKpis.activeVehicles + mockKpis.availableVehicles + mockKpis.vehiclesInMaintenance} total</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-semibold block mt-1">On trip right now</span>
          </div>
          <div className="h-12 w-12 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Truck className="h-6 w-6 text-emerald-600" />
          </div>
        </div>

        {/* Card 3: In Maintenance */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">In Maintenance</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-2">{mockKpis.vehiclesInMaintenance}</h3>
            <span className="text-[10px] text-amber-600 font-semibold block mt-1">Vehicles in shop</span>
          </div>
          <div className="h-12 w-12 rounded-lg bg-amber-50 flex items-center justify-center">
            <Wrench className="h-6 w-6 text-amber-600" />
          </div>
        </div>

        {/* Card 4: Drivers On Duty */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Drivers on Duty</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-2">{mockKpis.driversOnDuty}</h3>
            <span className="text-[10px] text-green-600 font-semibold block mt-1">Active on duty schedules</span>
          </div>
          <div className="h-12 w-12 rounded-lg bg-purple-50 flex items-center justify-center">
            <Users className="h-6 w-6 text-purple-600" />
          </div>
        </div>

      </div>

      {/* Second Row Minor KPIs & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Card: Trip Status Summary */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm lg:col-span-2 flex flex-col md:flex-row justify-between gap-6 items-center">
          <div className="flex-1 w-full space-y-4">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Trip Distribution</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-lg">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Active Trips</p>
                <h3 className="text-2xl font-extrabold text-blue-900 mt-1">{mockKpis.activeTrips}</h3>
              </div>
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-lg">
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Pending Dispatch</p>
                <h3 className="text-2xl font-extrabold text-indigo-900 mt-1">{mockKpis.pendingTrips}</h3>
              </div>
            </div>
          </div>
          <div className="w-px h-20 bg-slate-200 hidden md:block"></div>
          <div className="flex-1 w-full flex flex-col justify-center">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Driver Availability</h4>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              <p className="text-sm text-slate-700 font-medium">
                <strong>14 Drivers</strong> available for instant dispatch
              </p>
            </div>
          </div>
        </div>

        {/* Right Card: Quick Actions */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Quick Operations</h4>
          <div className="grid grid-cols-2 gap-3">
            
            {/* Quick Dispatch - DRIVER or general */}
            <button 
              onClick={() => handleQuickAction('/trips')}
              className="flex flex-col items-center justify-center p-3 border border-slate-200 hover:border-blue-500 hover:bg-blue-50/20 rounded-lg transition-all text-center gap-1.5"
            >
              <Compass className="h-5 w-5 text-blue-600" />
              <span className="text-xs font-semibold text-slate-700">Dispatch Trip</span>
            </button>

            {/* Register Vehicle - MANAGER only in concept, open for demo */}
            <button 
              onClick={() => handleQuickAction('/vehicles')}
              className="flex flex-col items-center justify-center p-3 border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 rounded-lg transition-all text-center gap-1.5"
            >
              <Truck className="h-5 w-5 text-emerald-600" />
              <span className="text-xs font-semibold text-slate-700">Add Vehicle</span>
            </button>

            {/* Add Driver - SAFETY only in concept, open for demo */}
            <button 
              onClick={() => handleQuickAction('/drivers')}
              className="flex flex-col items-center justify-center p-3 border border-slate-200 hover:border-purple-500 hover:bg-purple-50/20 rounded-lg transition-all text-center gap-1.5"
            >
              <Users className="h-5 w-5 text-purple-600" />
              <span className="text-xs font-semibold text-slate-700">Add Driver</span>
            </button>

            {/* Log Fuel/Expenses - ANALYST only in concept, open for demo */}
            <button 
              onClick={() => handleQuickAction('/expenses')}
              className="flex flex-col items-center justify-center p-3 border border-slate-200 hover:border-amber-500 hover:bg-amber-50/20 rounded-lg transition-all text-center gap-1.5"
            >
              <Receipt className="h-5 w-5 text-amber-600" />
              <span className="text-xs font-semibold text-slate-700">Log Expenses</span>
            </button>

          </div>
        </div>

      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Chart: Trip Trends */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Trip Trends & Efficiency</h4>
              <p className="text-xs text-slate-400 mt-0.5">Trips count vs average fuel efficiency (KM/Litre)</p>
            </div>
            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold">Weekly</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockTripHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Area type="monotone" dataKey="Trips" name="Total Trips Completed" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorTrips)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Operating Expenses */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Operating Expenses</h4>
              <p className="text-xs text-slate-400 mt-0.5">Fuel costs vs vehicle maintenance expense (INR)</p>
            </div>
            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold">Monthly</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockExpenseHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Bar dataKey="Fuel" name="Fuel Expense" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Maintenance" name="Maintenance Costs" fill="#fbbf24" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Tables Section (Recent Activity) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Recent Trips Table - Take 2 cols */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden xl:col-span-2">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Recent Dispatch Activity</h4>
              <p className="text-xs text-slate-400 mt-0.5">Latest trip assignments and execution statuses</p>
            </div>
            <button 
              onClick={() => handleQuickAction('/trips')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              View all trips
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Trip ID</th>
                  <th className="p-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Vehicle</th>
                  <th className="p-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Driver</th>
                  <th className="p-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Route</th>
                  <th className="p-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Cargo</th>
                  <th className="p-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockRecentTrips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-medium text-slate-900">{trip.id}</td>
                    <td className="p-4 text-slate-600 font-medium">{trip.vehicle}</td>
                    <td className="p-4 text-slate-600">{trip.driver}</td>
                    <td className="p-4 text-slate-600">{trip.route}</td>
                    <td className="p-4 text-slate-500">{trip.cargo}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        trip.status === 'COMPLETED' ? 'bg-green-50 text-green-700' :
                        trip.status === 'DISPATCHED' ? 'bg-blue-50 text-blue-700' :
                        'bg-red-50 text-red-700'
                      }`}>
                        {trip.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Maintenance Activity Column */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Maintenance shop</h4>
                <p className="text-xs text-slate-400 mt-0.5">Active servicing logs and tire/engine checks</p>
              </div>
              <button 
                onClick={() => handleQuickAction('/maintenance')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Logs
              </button>
            </div>
            <div className="divide-y divide-slate-100 px-6">
              {mockMaintenance.map((maint, idx) => (
                <div key={idx} className="py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{maint.vehicle}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{maint.type} • {maint.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-800">{maint.cost}</p>
                    <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 ${
                      maint.status === 'IN_SHOP' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'
                    }`}>
                      {maint.status === 'IN_SHOP' ? 'In Shop' : 'Closed'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-100">
            <button 
              onClick={() => handleQuickAction('/maintenance')}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg shadow-sm transition-colors"
            >
              <PlusCircle className="h-4 w-4 text-slate-400" />
              <span>Log Maintenance Entry</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
