import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Check, 
  X, 
  Info,
  ChevronLeft,
  ChevronRight,
  Filter,
  Navigation,
  CheckCircle2,
  XCircle,
  Clock,
  Compass,
  ArrowRight,
  Scale,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiService } from '../services/api';

// Mock shared states for Vehicles & Drivers to test validations
const MOCK_VEHICLES = [
  { id: 'v1', name: 'Van-05', registrationNumber: 'MH-12-AB-1234', type: 'Van', maxLoadCapacity: 500, odometer: 12000, status: 'AVAILABLE' },
  { id: 'v2', name: 'Sedan-03', registrationNumber: 'KA-03-CD-9012', type: 'Sedan', maxLoadCapacity: 300, odometer: 8000, status: 'AVAILABLE' },
  { id: 'v3', name: 'Truck-05', registrationNumber: 'KA-05-JK-1234', type: 'Truck', maxLoadCapacity: 2500, odometer: 71000, status: 'AVAILABLE' },
  { id: 'v4', name: 'Truck-02', registrationNumber: 'DL-01-XY-5678', type: 'Truck', maxLoadCapacity: 1500, odometer: 45000, status: 'IN_SHOP' }, // Cannot select
  { id: 'v5', name: 'Truck-04', registrationNumber: 'MH-14-EF-3456', type: 'Truck', maxLoadCapacity: 2000, odometer: 62000, status: 'ON_TRIP' } // Cannot select
];

const MOCK_DRIVERS = [
  { id: 'd1', name: 'Alex Morgan', licenseNumber: 'DL-123456', licenseExpiryDate: '2027-12-31', status: 'AVAILABLE' },
  { id: 'd2', name: 'Clark Kent', licenseNumber: 'DL-555555', licenseExpiryDate: '2027-01-01', status: 'AVAILABLE' },
  { id: 'd3', name: 'Sarah Connor', licenseNumber: 'DL-987654', licenseExpiryDate: '2028-06-30', status: 'ON_TRIP' }, // Cannot select
  { id: 'd4', name: 'Bruce Wayne', licenseNumber: 'DL-007007', licenseExpiryDate: '2025-05-15', status: 'SUSPENDED' }, // Expired
  { id: 'd5', name: 'John Doe', licenseNumber: 'DL-112233', licenseExpiryDate: '2026-03-10', status: 'OFF_DUTY' } // Expired
];

const INITIAL_TRIPS = [
  { id: 'TRP-104', source: 'Mumbai Hub', destination: 'Pune Depot', vehicleId: 'v5', vehicleName: 'Truck-04', driverId: 'd3', driverName: 'Sarah Connor', cargoWeight: 450, plannedDistance: 150, status: 'DISPATCHED', date: 'Jul 12, 10:15 AM' },
  { id: 'TRP-103', source: 'Delhi Warehouse', destination: 'Noida Hub', vehicleId: 'v1', vehicleName: 'Van-05', driverId: 'd1', driverName: 'Alex Morgan', cargoWeight: 220, plannedDistance: 45, status: 'COMPLETED', finalOdometer: 12045, fuelConsumed: 12, date: 'Jul 12, 09:30 AM' },
  { id: 'TRP-102', source: 'Bangalore Hub', destination: 'Mysore Warehouse', vehicleId: 'v4', vehicleName: 'Truck-02', driverId: 'd4', driverName: 'Bruce Wayne', cargoWeight: 890, plannedDistance: 140, status: 'CANCELLED', date: 'Jul 11, 04:45 PM' },
  { id: 'TRP-101', source: 'Mumbai Hub', destination: 'Thane Hub', vehicleId: 'v1', vehicleName: 'Van-05', driverId: 'd1', driverName: 'Alex Morgan', cargoWeight: 150, plannedDistance: 35, status: 'COMPLETED', finalOdometer: 11955, fuelConsumed: 8, date: 'Jul 11, 02:00 PM' }
];

export default function Trips() {
  const { user, ROLES } = useAuth();
  const { showToast } = useToast();
  const [trips, setTrips] = useState(INITIAL_TRIPS);
  const [vehicles, setVehicles] = useState(MOCK_VEHICLES);
  const [drivers, setDrivers] = useState(MOCK_DRIVERS);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const resVehicles = await apiService.vehicles.getAll();
      if (resVehicles && resVehicles.data) {
        setVehicles(resVehicles.data.map(v => {
          const match = MOCK_VEHICLES.find(mv => mv.registrationNumber.toLowerCase() === v.registrationNumber.toLowerCase());
          return {
            id: v.id.toString(),
            name: v.model || v.name || (match ? match.name : 'Unknown Model'),
            registrationNumber: v.registrationNumber,
            type: v.type || (match ? match.type : 'Truck'),
            maxLoadCapacity: v.capacity || (match ? match.maxLoadCapacity : 5000),
            odometer: v.odometer || (match ? match.odometer : 10000),
            status: v.status || 'AVAILABLE'
          };
        }));
      }

      const resDrivers = await apiService.drivers.getAll();
      if (resDrivers && resDrivers.data) {
        setDrivers(resDrivers.data.map(d => {
          const match = MOCK_DRIVERS.find(md => md.licenseNumber.toLowerCase() === d.licenseNumber.toLowerCase());
          return {
            id: d.id.toString(),
            name: d.name,
            licenseNumber: d.licenseNumber,
            licenseExpiryDate: d.licenseExpiry ? d.licenseExpiry.split('T')[0] : (match ? match.licenseExpiryDate : '2027-12-31'),
            status: d.status || 'AVAILABLE'
          };
        }));
      }

      const resTrips = await apiService.trips.getAll();
      if (resTrips && resTrips.data) {
        setTrips(resTrips.data.map(t => ({
          id: `TRP-${t.id}`,
          source: t.startLocation,
          destination: t.endLocation,
          vehicleId: t.vehicleId.toString(),
          vehicleName: t.vehicle?.model || `Vehicle #${t.vehicleId}`,
          driverId: t.driverId.toString(),
          driverName: t.driver?.name || `Driver #${t.driverId}`,
          cargoWeight: t.cargoWeight,
          plannedDistance: t.plannedDistance || 120,
          status: t.status,
          date: t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'Just Now'
        })));
      }
    } catch (err) {
      console.warn("Could not load dispatches from backend, using mock fallback data.", err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  // Search/Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Dialog Modals State
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [formError, setFormError] = useState('');

  // Dispatch Form Fields
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [plannedDistance, setPlannedDistance] = useState('');

  // Completion Form Fields
  const [finalOdo, setFinalOdo] = useState('');
  const [fuelConsumed, setFuelConsumed] = useState('');

  const isLicenseExpired = (expiryDateString) => {
    return new Date(expiryDateString) < new Date();
  };

  // Get only available assets for dispatch
  const availableVehicles = vehicles.filter(v => v.status === 'AVAILABLE');
  const availableDrivers = drivers.filter(d => d.status === 'AVAILABLE' && !isLicenseExpired(d.licenseExpiryDate));

  const openDispatchDialog = () => {
    setSource('');
    setDestination('');
    setSelectedVehicleId('');
    setSelectedDriverId('');
    setCargoWeight('');
    setPlannedDistance('');
    setFormError('');
    setIsDispatchOpen(true);
  };

  const handleDispatch = (e) => {
    e.preventDefault();
    setFormError('');

    if (!source || !destination || !selectedVehicleId || !selectedDriverId || !cargoWeight || !plannedDistance) {
      setFormError('Please fill in all fields.');
      return;
    }

    const vehicle = vehicles.find(v => v.id === selectedVehicleId);
    const driver = drivers.find(d => d.id === selectedDriverId);

    // Business Rule: Cargo Weight must not exceed vehicle's max capacity
    const weightNum = parseFloat(cargoWeight);
    if (weightNum > vehicle.maxLoadCapacity) {
      setFormError(`Cargo weight (${weightNum}kg) exceeds selected vehicle's max load capacity (${vehicle.maxLoadCapacity}kg).`);
      return;
    }

    const newTrip = {
      id: `TRP-${100 + trips.length + 1}`,
      source,
      destination,
      vehicleId: selectedVehicleId,
      vehicleName: vehicle.name,
      driverId: selectedDriverId,
      driverName: driver.name,
      cargoWeight: weightNum,
      plannedDistance: parseFloat(plannedDistance),
      status: 'DISPATCHED',
      date: 'Just Now'
    };

    // Update statuses of vehicle and driver to ON_TRIP
    setVehicles(vehicles.map(v => v.id === selectedVehicleId ? { ...v, status: 'ON_TRIP' } : v));
    setDrivers(drivers.map(d => d.id === selectedDriverId ? { ...d, status: 'ON_TRIP' } : d));
    
    setTrips([newTrip, ...trips]);
    showToast(`Trip ${newTrip.id} dispatched successfully!`);

    const runDispatch = async () => {
      try {
        const payload = {
          vehicleId: parseInt(selectedVehicleId),
          driverId: parseInt(selectedDriverId),
          startLocation: source,
          endLocation: destination,
          cargoWeight: parseFloat(cargoWeight)
        };
        // Shubh's routes: POST /api/trips to create, then PATCH /api/trips/:id/dispatch
        const res = await apiService.trips.create(payload);
        if (res && res.data) {
          await apiService.trips.dispatch(res.data.id);
          showToast(`Trip ${newTrip.id} dispatched on backend!`);
        }
        loadData();
      } catch (err) {
        console.warn("Backend dispatch failed, updated locally.", err);
      }
    };
    runDispatch();

    setIsDispatchOpen(false);
  };

  const openCompleteDialog = (trip) => {
    setSelectedTrip(trip);
    setFinalOdo('');
    setFuelConsumed('');
    setFormError('');
    setIsCompleteOpen(true);
  };

  const handleComplete = (e) => {
    e.preventDefault();
    setFormError('');

    if (!finalOdo || !fuelConsumed) {
      setFormError('Please fill in all fields.');
      return;
    }

    const finalOdoNum = parseFloat(finalOdo);
    const vehicle = vehicles.find(v => v.id === selectedTrip.vehicleId);

    // Validation: final odometer must be greater than current odometer
    if (finalOdoNum <= vehicle.odometer) {
      setFormError(`Final odometer (${finalOdoNum}km) must be greater than vehicle's current odometer (${vehicle.odometer}km).`);
      return;
    }

    // Update trip details
    setTrips(trips.map(t => t.id === selectedTrip.id ? { 
      ...t, 
      status: 'COMPLETED', 
      finalOdometer: finalOdoNum, 
      fuelConsumed: parseFloat(fuelConsumed) 
    } : t));

    // Restore vehicle and driver to AVAILABLE, update vehicle's odometer
    setVehicles(vehicles.map(v => v.id === selectedTrip.vehicleId ? { 
      ...v, 
      status: 'AVAILABLE', 
      odometer: finalOdoNum 
    } : v));

    setDrivers(drivers.map(d => d.id === selectedTrip.driverId ? { 
      ...d, 
      status: 'AVAILABLE' 
    } : d));

    showToast(`Trip ${selectedTrip.id} marked as completed.`);

    const runComplete = async () => {
      try {
        const tripId = selectedTrip.id.replace('TRP-', '');
        const payload = {
          finalOdometer: finalOdoNum,
          fuelConsumed: parseFloat(fuelConsumed)
        };
        await apiService.trips.complete(tripId, payload);
        showToast(`Trip ${selectedTrip.id} completed on backend!`);
        loadData();
      } catch (err) {
        console.warn("Backend completion failed, completed locally.", err);
      }
    };
    runComplete();

    setIsCompleteOpen(false);
  };

  const handleCancel = (trip) => {
    if (confirm(`Are you sure you want to cancel Trip ${trip.id}?`)) {
      setTrips(trips.map(t => t.id === trip.id ? { ...t, status: 'CANCELLED' } : t));

      // Restore vehicle and driver to AVAILABLE
      setVehicles(vehicles.map(v => v.id === trip.vehicleId ? { ...v, status: 'AVAILABLE' } : v));
      setDrivers(drivers.map(d => d.id === trip.driverId ? { ...d, status: 'AVAILABLE' } : d));
      showToast(`Trip ${trip.id} has been cancelled.`, 'info');

      const runCancel = async () => {
        try {
          const tripId = trip.id.replace('TRP-', '');
          await apiService.trips.cancel(tripId);
          showToast(`Trip ${trip.id} cancelled on backend!`, 'info');
          loadData();
        } catch (err) {
          console.warn("Backend cancel failed, cancelled locally.", err);
        }
      };
      runCancel();
    }
  };

  // Filter & Search
  const filteredTrips = trips.filter((t) => {
    const matchesSearch = t.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTrips.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTrips.slice(indexOfFirstItem, indexOfLastItem);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'DISPATCHED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'DRAFT':
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Trip Dispatch Management</h1>
          <p className="text-xs text-slate-500 font-medium">Create delivery runs, enforce capacity checks, and manage run sheets</p>
        </div>
        <button
          onClick={openDispatchDialog}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Dispatch Trip
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex flex-wrap items-center gap-3 flex-1 max-w-xl">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, route, vehicle, driver..."
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
            <option value="All">All Statuses</option>
            <option value="DISPATCHED">Dispatched</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-semibold">
          Active Dispatches: {trips.filter(t => t.status === 'DISPATCHED').length}
        </div>
      </div>

      {/* Trips Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50">
                <th className="py-3.5 px-6">Trip ID</th>
                <th className="py-3.5 px-6">Route (Source ➔ Dest)</th>
                <th className="py-3.5 px-6">Vehicle</th>
                <th className="py-3.5 px-6">Driver</th>
                <th className="py-3.5 px-6">Load Weight</th>
                <th className="py-3.5 px-6">Distance</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {currentItems.length > 0 ? (
                currentItems.map((trip) => (
                  <tr key={trip.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">{trip.id}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{trip.source}</span>
                        <ArrowRight className="h-3 w-3 text-slate-400" />
                        <span className="font-semibold text-slate-800">{trip.destination}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">{trip.vehicleName}</td>
                    <td className="py-4 px-6">{trip.driverName}</td>
                    <td className="py-4 px-6 text-slate-500">{trip.cargoWeight} kg</td>
                    <td className="py-4 px-6 text-slate-500">{trip.plannedDistance} km</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(trip.status)}`}>
                        {trip.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {trip.status === 'DISPATCHED' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openCompleteDialog(trip)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded transition-colors"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => handleCancel(trip)}
                            className="px-2 py-1 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold text-[10px] rounded border border-slate-200 hover:border-rose-200 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : trip.status === 'COMPLETED' ? (
                        <div className="text-[10px] text-slate-400 font-semibold flex flex-col items-end">
                          <span>Odo: {trip.finalOdometer}km</span>
                          <span>Fuel: {trip.fuelConsumed}L</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-semibold italic">Cancelled</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-1.5 text-slate-400">
                      <Info className="h-6 w-6" />
                      <p className="text-sm font-semibold text-slate-500">No dispatches found</p>
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

      {/* Dispatch Modal */}
      {isDispatchOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md shadow-lg overflow-hidden animate-scale-up">
            
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Dispatch Delivery Trip</h3>
              <button 
                onClick={() => setIsDispatchOpen(false)}
                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleDispatch} className="p-6 space-y-4">
              {formError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Source Hub *
                  </label>
                  <input
                    type="text"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="e.g. Mumbai Hub"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-955 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Destination Hub *
                  </label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Pune Depot"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-955 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Select Available Vehicle *
                </label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  required
                >
                  <option value="">-- Choose Available Vehicle --</option>
                  {availableVehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.type} - Max Cap: {v.maxLoadCapacity}kg)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Select Available Driver *
                </label>
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-955 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  required
                >
                  <option value="">-- Choose Available Driver --</option>
                  {availableDrivers.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} (Lic: {d.licenseNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Cargo Weight (kg) *
                  </label>
                  <input
                    type="number"
                    value={cargoWeight}
                    onChange={(e) => setCargoWeight(e.target.value)}
                    placeholder="e.g. 450"
                    min="1"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-955 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Planned Distance (km) *
                  </label>
                  <input
                    type="number"
                    value={plannedDistance}
                    onChange={(e) => setPlannedDistance(e.target.value)}
                    placeholder="e.g. 150"
                    min="1"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-955 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDispatchOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                >
                  Dispatch Run
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Modal */}
      {isCompleteOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-sm shadow-lg overflow-hidden animate-scale-up">
            
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Complete Trip run ({selectedTrip?.id})</h3>
              <button 
                onClick={() => setIsCompleteOpen(false)}
                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleComplete} className="p-6 space-y-4">
              {formError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Final Odometer reading (km) *
                </label>
                <input
                  type="number"
                  value={finalOdo}
                  onChange={(e) => setFinalOdo(e.target.value)}
                  placeholder={`Current Odo: ${vehicles.find(v => v.id === selectedTrip?.vehicleId)?.odometer}km`}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Fuel Consumed (Liters) *
                </label>
                <input
                  type="number"
                  value={fuelConsumed}
                  onChange={(e) => setFuelConsumed(e.target.value)}
                  placeholder="e.g. 15"
                  min="1"
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-955 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCompleteOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                >
                  Confirm Completion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
