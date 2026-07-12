import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  X, 
  Info,
  ChevronLeft,
  ChevronRight,
  Filter,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  History,
  Clock,
  DollarSign,
  Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Mock list of vehicles to link status updates
const MOCK_VEHICLES = [
  { id: 'v1', name: 'Van-05', registrationNumber: 'MH-12-AB-1234', status: 'AVAILABLE' },
  { id: 'v2', name: 'Sedan-03', registrationNumber: 'KA-03-CD-9012', status: 'AVAILABLE' },
  { id: 'v3', name: 'Truck-05', registrationNumber: 'KA-05-JK-1234', status: 'AVAILABLE' },
  { id: 'v4', name: 'Truck-02', registrationNumber: 'DL-01-XY-5678', status: 'IN_SHOP' },
  { id: 'v5', name: 'Truck-04', registrationNumber: 'MH-14-EF-3456', status: 'ON_TRIP' }
];

const INITIAL_MAINTENANCE = [
  { id: 'MNT-201', vehicleId: 'v4', vehicleName: 'Truck-02', description: 'Tire Replacement & Wheel Alignment', cost: 450, startDate: '2026-07-11', endDate: '', status: 'ACTIVE' },
  { id: 'MNT-200', vehicleId: 'v1', vehicleName: 'Van-05', description: 'Engine Oil Change & Filter Replacement', cost: 80, startDate: '2026-07-10', endDate: '2026-07-11', status: 'CLOSED' },
  { id: 'MNT-199', vehicleId: 'v3', vehicleName: 'Truck-05', description: 'Brake Pad Inspection & Brake Oil Refill', cost: 120, startDate: '2026-07-08', endDate: '2026-07-09', status: 'CLOSED' }
];

export default function Maintenance() {
  const { user, ROLES } = useAuth();
  const [logs, setLogs] = useState(INITIAL_MAINTENANCE);
  const [vehicles, setVehicles] = useState(MOCK_VEHICLES);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Dialog Modals State
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [formError, setFormError] = useState('');

  // Form Fields
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [startDate, setStartDate] = useState('');

  const openLogDialog = () => {
    setSelectedVehicleId('');
    setDescription('');
    setCost('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setFormError('');
    setIsLogOpen(true);
  };

  const handleCreateLog = (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedVehicleId || !description || !cost || !startDate) {
      setFormError('Please fill in all fields.');
      return;
    }

    const vehicle = vehicles.find(v => v.id === selectedVehicleId);
    const costNum = parseFloat(cost);

    if (isNaN(costNum) || costNum <= 0) {
      setFormError('Cost must be a positive number.');
      return;
    }

    const newLog = {
      id: `MNT-${200 + logs.length + 1}`,
      vehicleId: selectedVehicleId,
      vehicleName: vehicle.name,
      description,
      cost: costNum,
      startDate,
      endDate: '',
      status: 'ACTIVE'
    };

    // Update vehicle status in state to IN_SHOP
    setVehicles(vehicles.map(v => v.id === selectedVehicleId ? { ...v, status: 'IN_SHOP' } : v));
    setLogs([newLog, ...logs]);
    setIsLogOpen(false);
  };

  const handleCloseLog = (id) => {
    if (confirm('Are you sure you want to close this service log and restore vehicle to service?')) {
      const today = new Date().toISOString().split('T')[0];
      const log = logs.find(l => l.id === id);

      setLogs(logs.map(l => l.id === id ? { ...l, status: 'CLOSED', endDate: today } : l));
      
      // Update vehicle status back to AVAILABLE
      setVehicles(vehicles.map(v => v.id === log.vehicleId ? { ...v, status: 'AVAILABLE' } : v));
    }
  };

  // Filter & Search Logic
  const filteredLogs = logs.filter((l) => {
    const matchesSearch = l.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          l.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          l.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Maintenance Logs</h1>
          <p className="text-xs text-slate-500 font-medium">Record diagnostics, track service costs, and monitor shop status</p>
        </div>
        <button
          onClick={openLogDialog}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Create Maintenance Log
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex flex-wrap items-center gap-3 flex-1 max-w-xl">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, vehicle model, description..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-colors"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="All">All Logs</option>
            <option value="ACTIVE">Active Shop</option>
            <option value="CLOSED">Completed Service</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-semibold">
          Active In Shop: {logs.filter(l => l.status === 'ACTIVE').length}
        </div>
      </div>

      {/* Main Grid: List Table + Service Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Table column */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3.5 px-6">Log ID</th>
                  <th className="py-3.5 px-6">Vehicle</th>
                  <th className="py-3.5 px-6">Diagnostics / Service</th>
                  <th className="py-3.5 px-6">Cost</th>
                  <th className="py-3.5 px-6">Date In/Out</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {currentItems.length > 0 ? (
                  currentItems.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900">{log.id}</td>
                      <td className="py-4 px-6 font-bold text-slate-800">{log.vehicleName}</td>
                      <td className="py-4 px-6 text-slate-500">{log.description}</td>
                      <td className="py-4 px-6 font-bold text-slate-800">${log.cost}</td>
                      <td className="py-4 px-6 text-slate-400">
                        <div className="flex flex-col">
                          <span>In: {log.startDate}</span>
                          {log.endDate && <span>Out: {log.endDate}</span>}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          log.status === 'ACTIVE' 
                            ? 'bg-amber-50 text-amber-700 border-amber-200' 
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {log.status === 'ACTIVE' ? 'IN SHOP' : 'COMPLETED'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {log.status === 'ACTIVE' ? (
                          <button
                            onClick={() => handleCloseLog(log.id)}
                            className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] rounded transition-colors"
                          >
                            Close Log
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Closed</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-1.5 text-slate-400">
                        <Info className="h-6 w-6" />
                        <p className="text-sm font-semibold text-slate-500">No logs found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Pagination */}
          <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50/50">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-slate-600" />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-slate-600" />
              </button>
            </div>
          </div>

        </div>

        {/* Timeline audit Log */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <History className="h-4 w-4 text-slate-500" /> Audit Timeline
            </h3>
            <p className="text-xs text-slate-400 font-medium mb-4">Lifecycle of active diagnostics</p>
          </div>
          <div className="relative border-l border-slate-100 pl-4 ml-2 space-y-6 flex-1 py-2">
            {logs.map((log, idx) => (
              <div key={idx} className="relative">
                {/* Node icon indicator */}
                <span className={`absolute -left-[23px] top-0 h-4.5 w-4.5 rounded-full flex items-center justify-center border-2 border-white ${
                  log.status === 'ACTIVE' ? 'bg-amber-500' : 'bg-emerald-500'
                }`}>
                  <Wrench className="h-2 w-2 text-white" />
                </span>
                
                <div className="text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900">{log.vehicleName}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{log.startDate}</span>
                  </div>
                  <p className="text-slate-500 mt-1">{log.description}</p>
                  <p className="text-slate-400 font-semibold text-[10px] mt-1 flex items-center gap-1">
                    <DollarSign className="h-3 w-3" /> Cost logged: ${log.cost}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-[11px] text-slate-500 font-medium leading-relaxed mt-4 flex gap-2">
            <Clock className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <span>Vehicles placed in shop will be hidden from dispatching selections immediately.</span>
          </div>
        </div>

      </div>

      {/* Create Log Dialog */}
      {isLogOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-sm shadow-lg overflow-hidden animate-scale-up">
            
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Send Vehicle to Service Shop</h3>
              <button 
                onClick={() => setIsLogOpen(false)}
                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLog} className="p-6 space-y-4">
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
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  required
                >
                  <option value="">-- Choose Vehicle --</option>
                  {vehicles.filter(v => v.status !== 'RETIRED').map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.registrationNumber} - Status: {v.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Diagnostics / Repairs Required *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Front brake replacement and fluid flush"
                  rows="3"
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-955 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Estimated Cost ($) *
                  </label>
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="e.g. 150"
                    min="1"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-955 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Date Placed in Shop *
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-955 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLogOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                >
                  Confirm Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
