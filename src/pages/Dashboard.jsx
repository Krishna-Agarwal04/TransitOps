import React, { useState } from 'react';
import { 
  Truck, 
  Users, 
  Wrench, 
  Compass, 
  TrendingUp, 
  Activity, 
  AlertCircle,
  Plus,
  Receipt,
  FileSpreadsheet
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  Legend 
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Dummy static metrics for clean SaaS visual presentation
const INITIAL_KPIS = {
  activeVehicles: 18,
  availableVehicles: 12,
  vehiclesInMaintenance: 4,
  driversOnDuty: 15,
  fleetUtilization: 82, // percentage
  activeTrips: 8,
  pendingTrips: 5
};

const TRIP_STATS_DATA = [
  { day: 'Mon', trips: 12 },
  { day: 'Tue', trips: 19 },
  { day: 'Wed', trips: 15 },
  { day: 'Thu', trips: 22 },
  { day: 'Fri', trips: 30 },
  { day: 'Sat', trips: 10 },
  { day: 'Sun', trips: 8 }
];

const FUEL_CONSUMPTION_DATA = [
  { name: 'Van-01', liters: 120 },
  { name: 'Truck-04', liters: 340 },
  { name: 'Van-05', liters: 180 },
  { name: 'Truck-02', liters: 410 },
  { name: 'Sedan-03', liters: 90 },
  { name: 'Truck-05', liters: 280 }
];

const VEHICLE_STATUS_DATA = [
  { name: 'Available', value: 12, color: '#3b82f6' }, // Blue
  { name: 'On Trip', value: 8, color: '#10b981' },    // Green
  { name: 'In Shop', value: 4, color: '#f59e0b' },    // Yellow
  { name: 'Retired', value: 2, color: '#ef4444' }     // Red
];

const RECENT_TRIPS = [
  { id: 'TRP-104', vehicle: 'Truck-04', driver: 'Alex Morgan', weight: '450 kg', status: 'DISPATCHED', date: 'Jul 12, 10:15 AM' },
  { id: 'TRP-103', vehicle: 'Van-05', driver: 'Sarah Connor', weight: '220 kg', status: 'COMPLETED', date: 'Jul 12, 09:30 AM' },
  { id: 'TRP-102', vehicle: 'Truck-02', driver: 'Bruce Wayne', weight: '890 kg', status: 'CANCELLED', date: 'Jul 11, 04:45 PM' },
  { id: 'TRP-101', vehicle: 'Van-01', driver: 'John Doe', weight: '150 kg', status: 'COMPLETED', date: 'Jul 11, 02:00 PM' }
];

const RECENT_MAINTENANCE = [
  { vehicle: 'Truck-02', description: 'Tire Replacement', cost: '$450', date: 'Jul 11' },
  { vehicle: 'Van-05', description: 'Oil Change', cost: '$80', date: 'Jul 10' },
  { vehicle: 'Truck-05', description: 'Brake Inspection', cost: '$120', date: 'Jul 08' }
];

export default function Dashboard() {
  const { user, ROLES } = useAuth();
  const navigate = useNavigate();

  // Filters state
  const [vehicleType, setVehicleType] = useState('All');
  const [status, setStatus] = useState('All');
  const [region, setRegion] = useState('All');

  const handleQuickAction = (path) => {
    navigate(path);
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Filters Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vehicle Type</span>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Types</option>
              <option value="Truck">Trucks</option>
              <option value="Van">Vans</option>
              <option value="Sedan">Sedans</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="In Shop">In Shop</option>
              <option value="Available">Available</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Region</span>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Regions</option>
              <option value="North">North Hub</option>
              <option value="South">South Hub</option>
              <option value="East">East Hub</option>
              <option value="West">West Hub</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Showing filtered operations metrics
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">{INITIAL_KPIS.activeVehicles}</h3>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Vehicles in transit</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Available</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">{INITIAL_KPIS.availableVehicles}</h3>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Ready for dispatch</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">In Shop</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">{INITIAL_KPIS.vehiclesInMaintenance}</h3>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Under maintenance</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">On Duty</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">{INITIAL_KPIS.driversOnDuty}</h3>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Drivers logged in</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Utilization</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">{INITIAL_KPIS.fleetUtilization}%</h3>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Fleet activity score</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Trips</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">{INITIAL_KPIS.activeTrips}</h3>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Trips underway</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">{INITIAL_KPIS.pendingTrips}</h3>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Trips in queue</p>
          </div>
        </div>

      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Trip Statistics */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Weekly Trip Statistics</h3>
              <p className="text-xs text-slate-400 font-medium">Daily trip dispatch volume</p>
            </div>
            <div className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 font-semibold">
              Weekly Total: 135
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TRIP_STATS_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: 8, fontSize: 12 }} 
                  labelClassName="font-bold text-slate-700"
                />
                <Area type="monotone" dataKey="trips" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorTrips)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fuel Consumption */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Fuel Usage by Vehicle</h3>
            <p className="text-xs text-slate-400 font-medium mb-4">Top consumers in liters</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={FUEL_CONSUMPTION_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: 8, fontSize: 11 }}
                />
                <Bar dataKey="liters" fill="#475569" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Sub Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Vehicle Status Donut */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">Fleet Status</h3>
            <p className="text-xs text-slate-400 font-medium mb-4">Current state of transport assets</p>
          </div>
          <div className="h-44 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={VEHICLE_STATUS_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {VEHICLE_STATUS_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <span className="text-xs text-slate-400 font-semibold block uppercase">Total</span>
              <span className="text-2xl font-bold text-slate-850">26</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100">
            {VEHICLE_STATUS_DATA.map((status) => (
              <div key={status.name} className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: status.color }}></span>
                <span>{status.name}: {status.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Maintenance Records */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Recent Service Shop Logs</h3>
            <p className="text-xs text-slate-400 font-medium mb-4">Latest vehicles in shop</p>
          </div>
          <div className="space-y-4">
            {RECENT_MAINTENANCE.map((item, idx) => (
              <div key={idx} className="flex items-start justify-between text-xs py-2.5 border-b border-slate-100 last:border-0">
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-800">{item.vehicle}</p>
                  <p className="text-slate-500 font-medium text-[11px]">{item.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800">{item.cost}</p>
                  <p className="text-slate-400 text-[10px] font-medium">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={() => handleQuickAction('/maintenance')}
            className="w-full text-center text-xs font-bold text-blue-600 hover:text-blue-700 mt-4 pt-3 border-t border-slate-100 block"
          >
            View All Maintenance Logs
          </button>
        </div>

        {/* Quick Action Hub */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Action Control Hub</h3>
            <p className="text-xs text-slate-400 font-medium mb-4">Shortcuts for transport managers</p>
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            {user?.role === ROLES.FLEET_MANAGER && (
              <>
                <button 
                  onClick={() => handleQuickAction('/vehicles')}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="h-4 w-4 text-blue-600" /> Register New Vehicle
                  </span>
                  <Truck className="h-4 w-4 text-slate-400" />
                </button>
                <button 
                  onClick={() => handleQuickAction('/maintenance')}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-amber-500" /> Put Vehicle In Shop
                  </span>
                  <Activity className="h-4 w-4 text-slate-400" />
                </button>
              </>
            )}
            {user?.role === ROLES.DRIVER && (
              <button 
                onClick={() => handleQuickAction('/trips')}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Compass className="h-4 w-4 text-emerald-500" /> Dispatch New Trip
                </span>
                <Compass className="h-4 w-4 text-slate-400" />
              </button>
            )}
            {user?.role === ROLES.FINANCIAL_ANALYST && (
              <button 
                onClick={() => handleQuickAction('/expenses')}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-indigo-500" /> Log Refuel / Tolls
                </span>
                <Receipt className="h-4 w-4 text-slate-400" />
              </button>
            )}
            <button 
              onClick={() => handleQuickAction('/reports')}
              className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
            >
              <span className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-teal-600" /> Run ROI & Export CSV
              </span>
              <TrendingUp className="h-4 w-4 text-slate-400" />
            </button>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-[11px] text-slate-500 font-medium leading-relaxed mt-4">
            💡 **Tip**: Change your system access role from the Sidebar switcher to test different screen features instantly!
          </div>
        </div>

      </div>

      {/* Recent Trips Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Recent Dispatches & Trips</h3>
            <p className="text-xs text-slate-400 font-medium">Latest delivery logs</p>
          </div>
          {user?.role === ROLES.DRIVER && (
            <button 
              onClick={() => navigate('/trips')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" /> Dispatch Trip
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50">
                <th className="py-3 px-4">Trip ID</th>
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-4">Assigned Driver</th>
                <th className="py-3 px-4">Cargo Weight</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Dispatch Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {RECENT_TRIPS.map((trip) => (
                <tr key={trip.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{trip.id}</td>
                  <td className="py-3 px-4">{trip.vehicle}</td>
                  <td className="py-3 px-4">{trip.driver}</td>
                  <td className="py-3 px-4 text-slate-500">{trip.weight}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      trip.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      trip.status === 'DISPATCHED' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {trip.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-semibold">{trip.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
