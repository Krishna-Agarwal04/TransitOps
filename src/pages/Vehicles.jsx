import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Truck, 
  X, 
  Info,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Mock initial dataset for interactive demo
const INITIAL_VEHICLES = [
  { id: '1', name: 'Van-05', registrationNumber: 'MH-12-AB-1234', type: 'Van', maxLoadCapacity: 500, odometer: 12000, acquisitionCost: 15000, status: 'AVAILABLE' },
  { id: '2', name: 'Truck-02', registrationNumber: 'DL-01-XY-5678', type: 'Truck', maxLoadCapacity: 1500, odometer: 45000, acquisitionCost: 35000, status: 'IN_SHOP' },
  { id: '3', name: 'Sedan-03', registrationNumber: 'KA-03-CD-9012', type: 'Sedan', maxLoadCapacity: 300, odometer: 8000, acquisitionCost: 18000, status: 'AVAILABLE' },
  { id: '4', name: 'Truck-04', registrationNumber: 'MH-14-EF-3456', type: 'Truck', maxLoadCapacity: 2000, odometer: 62000, acquisitionCost: 42000, status: 'ON_TRIP' },
  { id: '5', name: 'Van-01', registrationNumber: 'DL-03-GH-7890', type: 'Van', maxLoadCapacity: 600, odometer: 15000, acquisitionCost: 16000, status: 'AVAILABLE' },
  { id: '6', name: 'Truck-05', registrationNumber: 'KA-05-JK-1234', type: 'Truck', maxLoadCapacity: 2500, odometer: 71000, acquisitionCost: 48000, status: 'AVAILABLE' },
  { id: '7', name: 'Van-02', registrationNumber: 'MH-12-PQ-9999', type: 'Van', maxLoadCapacity: 550, odometer: 18500, acquisitionCost: 15500, status: 'RETIRED' }
];

export default function Vehicles() {
  const { user, ROLES } = useAuth();
  const [vehicles, setVehicles] = useState(INITIAL_VEHICLES);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formError, setFormError] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [regNum, setRegNum] = useState('');
  const [type, setType] = useState('Van');
  const [capacity, setCapacity] = useState('');
  const [odometer, setOdometer] = useState('');
  const [cost, setCost] = useState('');
  const [status, setStatus] = useState('AVAILABLE');

  const openAddDialog = () => {
    setEditingVehicle(null);
    setName('');
    setRegNum('');
    setType('Van');
    setCapacity('');
    setOdometer('');
    setCost('');
    setStatus('AVAILABLE');
    setFormError('');
    setIsDialogOpen(true);
  };

  const openEditDialog = (vehicle) => {
    setEditingVehicle(vehicle);
    setName(vehicle.name);
    setRegNum(vehicle.registrationNumber);
    setType(vehicle.type);
    setCapacity(vehicle.maxLoadCapacity.toString());
    setOdometer(vehicle.odometer.toString());
    setCost(vehicle.acquisitionCost.toString());
    setStatus(vehicle.status);
    setFormError('');
    setIsDialogOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setFormError('');

    if (!name || !regNum || !capacity || !odometer || !cost) {
      setFormError('Please fill in all required fields.');
      return;
    }

    // Uniqueness validation (exclude current vehicle being edited)
    const exists = vehicles.some(
      (v) => v.registrationNumber.toLowerCase() === regNum.toLowerCase() && (!editingVehicle || v.id !== editingVehicle.id)
    );
    if (exists) {
      setFormError('Registration number must be unique.');
      return;
    }

    const vehicleData = {
      id: editingVehicle ? editingVehicle.id : (vehicles.length + 1).toString(),
      name,
      registrationNumber: regNum.toUpperCase(),
      type,
      maxLoadCapacity: parseFloat(capacity),
      odometer: parseFloat(odometer),
      acquisitionCost: parseFloat(cost),
      status
    };

    if (editingVehicle) {
      // Edit
      setVehicles(vehicles.map((v) => (v.id === editingVehicle.id ? vehicleData : v)));
    } else {
      // Add
      setVehicles([...vehicles, vehicleData]);
    }

    setIsDialogOpen(false);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this vehicle from the registry?')) {
      setVehicles(vehicles.filter((v) => v.id !== id));
    }
  };

  // Filter & Search Logic
  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || v.type === typeFilter;
    const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredVehicles.slice(indexOfFirstItem, indexOfLastItem);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'ON_TRIP':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'IN_SHOP':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'RETIRED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Vehicle Registry</h1>
          <p className="text-xs text-slate-500 font-medium">Manage fleet list, capacity configurations, and active statuses</p>
        </div>
        <button
          onClick={openAddDialog}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Register Vehicle
        </button>
      </div>

      {/* Filters & Search Grid */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex flex-wrap items-center gap-3 flex-1 max-w-2xl">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by vehicle name or reg number..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Types</option>
              <option value="Truck">Trucks</option>
              <option value="Van">Vans</option>
              <option value="Sedan">Sedans</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="ON_TRIP">On Trip</option>
              <option value="IN_SHOP">In Shop</option>
              <option value="RETIRED">Retired</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-semibold">
          Total Vehicles: {filteredVehicles.length}
        </div>
      </div>

      {/* Main Table view */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50">
                <th className="py-3.5 px-6">Model / Name</th>
                <th className="py-3.5 px-6">Reg Number</th>
                <th className="py-3.5 px-6">Type</th>
                <th className="py-3.5 px-6">Max Capacity</th>
                <th className="py-3.5 px-6">Odometer</th>
                <th className="py-3.5 px-6">Acquisition Cost</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {currentItems.length > 0 ? (
                currentItems.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-2">
                      <Truck className="h-4 w-4 text-slate-400" />
                      {vehicle.name}
                    </td>
                    <td className="py-4 px-6">{vehicle.registrationNumber}</td>
                    <td className="py-4 px-6">{vehicle.type}</td>
                    <td className="py-4 px-6 text-slate-500">{vehicle.maxLoadCapacity} kg</td>
                    <td className="py-4 px-6 text-slate-500">{vehicle.odometer.toLocaleString()} km</td>
                    <td className="py-4 px-6 text-slate-500">${vehicle.acquisitionCost.toLocaleString()}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(vehicle.status)}`}>
                        {vehicle.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditDialog(vehicle)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-50 transition-colors"
                          title="Edit vehicle details"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(vehicle.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-50 transition-colors"
                          title="Delete vehicle"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-1.5 text-slate-400">
                      <Info className="h-6 w-6" />
                      <p className="text-sm font-semibold text-slate-500">No vehicles found</p>
                      <p className="text-xs">Try adjusting your filters or search terms</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls footer */}
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

      {/* Add / Edit Dialog Modal */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md shadow-lg overflow-hidden animate-scale-up">
            
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">
                {editingVehicle ? 'Edit Vehicle Configuration' : 'Register New Fleet Asset'}
              </h3>
              <button 
                onClick={() => setIsDialogOpen(false)}
                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              
              {formError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Vehicle Name/Model *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Van-05"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Reg Number *
                  </label>
                  <input
                    type="text"
                    value={regNum}
                    onChange={(e) => setRegNum(e.target.value)}
                    placeholder="e.g. MH-12-AB-1234"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-955 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Type *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="Van">Van</option>
                    <option value="Truck">Truck</option>
                    <option value="Sedan">Sedan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Max Capacity (kg) *
                  </label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="e.g. 500"
                    min="1"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Initial Odometer (km) *
                  </label>
                  <input
                    type="number"
                    value={odometer}
                    onChange={(e) => setOdometer(e.target.value)}
                    placeholder="e.g. 12000"
                    min="0"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Acquisition Cost ($) *
                  </label>
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="e.g. 15000"
                    min="0"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Asset Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="ON_TRIP">On Trip</option>
                  <option value="IN_SHOP">In Shop</option>
                  <option value="RETIRED">Retired</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                >
                  {editingVehicle ? 'Update Asset' : 'Register Asset'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
