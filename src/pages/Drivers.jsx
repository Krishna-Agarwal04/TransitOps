import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Users, 
  X, 
  Info,
  ChevronLeft,
  ChevronRight,
  Filter,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiService } from '../services/api';

// Mock driver profiles for dynamic frontend demo
const INITIAL_DRIVERS = [
  { id: '1', name: 'Alex Morgan', licenseNumber: 'DL-123456', licenseCategory: 'Class A', licenseExpiryDate: '2027-12-31', contactNumber: '+91 98765 43210', safetyScore: 98, status: 'AVAILABLE' },
  { id: '2', name: 'Sarah Connor', licenseNumber: 'DL-987654', licenseCategory: 'Heavy Duty', licenseExpiryDate: '2028-06-30', contactNumber: '+91 99999 88888', safetyScore: 95, status: 'ON_TRIP' },
  { id: '3', name: 'Bruce Wayne', licenseNumber: 'DL-007007', licenseCategory: 'Class B', licenseExpiryDate: '2025-05-15', contactNumber: '+91 90000 00000', safetyScore: 85, status: 'SUSPENDED' }, // Expired license!
  { id: '4', name: 'John Doe', licenseNumber: 'DL-112233', licenseCategory: 'Class A', licenseExpiryDate: '2026-03-10', contactNumber: '+91 91122 33445', safetyScore: 90, status: 'OFF_DUTY' }, // Expired license!
  { id: '5', name: 'Clark Kent', licenseNumber: 'DL-555555', licenseCategory: 'Heavy Duty', licenseExpiryDate: '2027-01-01', contactNumber: '+91 95555 44444', safetyScore: 100, status: 'AVAILABLE' }
];

export default function Drivers() {
  const { user, ROLES } = useAuth();
  const { showToast } = useToast();
  const [drivers, setDrivers] = useState(INITIAL_DRIVERS);
  const [isLoading, setIsLoading] = useState(false);

  const loadDrivers = async () => {
    setIsLoading(true);
    try {
      const res = await apiService.drivers.getAll();
      if (res && res.data) {
        const backendDrivers = res.data.map(d => {
          const match = INITIAL_DRIVERS.find(idr => idr.licenseNumber.toLowerCase() === d.licenseNumber.toLowerCase());
          return {
            id: d.id.toString(),
            name: d.name,
            licenseNumber: d.licenseNumber,
            licenseCategory: d.licenseCategory || (match ? match.licenseCategory : 'Class A'),
            licenseExpiryDate: d.licenseExpiry ? d.licenseExpiry.split('T')[0] : (match ? match.licenseExpiryDate : '2027-12-31'),
            contactNumber: d.phone || d.contactNumber || (match ? match.contactNumber : '+91 98765 43210'),
            safetyScore: d.safetyScore || (match ? match.safetyScore : 90),
            status: d.status || 'AVAILABLE'
          };
        });
        setDrivers(backendDrivers);
      }
    } catch (err) {
      console.warn("Could not load drivers from backend, using mock fallback.", err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadDrivers();
  }, []);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [formError, setFormError] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [licenseNum, setLicenseNum] = useState('');
  const [category, setCategory] = useState('Class A');
  const [expiryDate, setExpiryDate] = useState('');
  const [contact, setContact] = useState('');
  const [safetyScore, setSafetyScore] = useState('');
  const [status, setStatus] = useState('AVAILABLE');

  const openAddDialog = () => {
    setEditingDriver(null);
    setName('');
    setLicenseNum('');
    setCategory('Class A');
    setExpiryDate('');
    setContact('');
    setSafetyScore('100');
    setStatus('AVAILABLE');
    setFormError('');
    setIsDialogOpen(true);
  };

  const openEditDialog = (driver) => {
    setEditingDriver(driver);
    setName(driver.name);
    setLicenseNum(driver.licenseNumber);
    setCategory(driver.licenseCategory);
    setExpiryDate(driver.licenseExpiryDate);
    setContact(driver.contactNumber);
    setSafetyScore(driver.safetyScore.toString());
    setStatus(driver.status);
    setFormError('');
    setIsDialogOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setFormError('');

    if (!name || !licenseNum || !category || !expiryDate || !contact || !safetyScore) {
      setFormError('Please fill in all required fields.');
      return;
    }

    const scoreNum = parseFloat(safetyScore);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      setFormError('Safety score must be a number between 0 and 100.');
      return;
    }

    // License number uniqueness
    const exists = drivers.some(
      (d) => d.licenseNumber.toLowerCase() === licenseNum.toLowerCase() && (!editingDriver || d.id !== editingDriver.id)
    );
    if (exists) {
      setFormError('License number must be unique.');
      return;
    }

    const driverData = {
      id: editingDriver ? editingDriver.id : (drivers.length + 1).toString(),
      name,
      licenseNumber: licenseNum.toUpperCase(),
      licenseCategory: category,
      licenseExpiryDate: expiryDate,
      contactNumber: contact,
      safetyScore: scoreNum,
      status
    };

    if (editingDriver) {
      setDrivers(drivers.map((d) => (d.id === editingDriver.id ? driverData : d)));
      showToast('Driver profile updated successfully!');
    } else {
      setDrivers([...drivers, driverData]);
      showToast('New driver registered successfully!');
    }

    const runSave = async () => {
      try {
        const payload = {
          name,
          email: `${name.replace(/\s+/g, '').toLowerCase()}@transitops.com`,
          phone: contact,
          licenseNumber: licenseNum.toUpperCase(),
          licenseExpiry: new Date(expiryDate).toISOString(),
          status
        };
        if (editingDriver) {
          await apiService.drivers.update(editingDriver.id, payload);
          showToast('Driver profile updated on backend!');
        } else {
          await apiService.drivers.create(payload);
          showToast('New driver registered on backend!');
        }
        loadDrivers();
      } catch (err) {
        console.warn("Backend save failed, saved locally.", err);
      }
    };
    runSave();

    setIsDialogOpen(false);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to remove this driver profile?')) {
      const runDelete = async () => {
        try {
          await apiService.drivers.delete(id);
          showToast('Driver profile deleted from backend.', 'info');
          loadDrivers();
        } catch (err) {
          console.warn("Backend delete failed, removing locally.", err);
          setDrivers(drivers.filter((d) => d.id !== id));
          showToast('Driver profile deleted locally.', 'info');
        }
      };
      runDelete();
    }
  };

  const isLicenseExpired = (expiryDateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDateString);
    return expiry < today;
  };

  // Filter & Search Logic
  const filteredDrivers = drivers.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || d.licenseCategory === categoryFilter;
    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDrivers.slice(indexOfFirstItem, indexOfLastItem);

  const getStatusBadge = (driver) => {
    if (isLicenseExpired(driver.licenseExpiryDate)) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border bg-rose-50 text-rose-700 border-rose-200">
          <AlertOctagon className="h-3 w-3" /> EXPIRED LICENSE
        </span>
      );
    }

    switch (driver.status) {
      case 'AVAILABLE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
            AVAILABLE
          </span>
        );
      case 'ON_TRIP':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border bg-blue-50 text-blue-700 border-blue-200">
            ON TRIP
          </span>
        );
      case 'OFF_DUTY':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border bg-slate-50 text-slate-600 border-slate-200">
            OFF DUTY
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border bg-red-50 text-red-700 border-red-200">
            SUSPENDED
          </span>
        );
      default:
        return null;
    }
  };

  const getSafetyScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 50) return 'text-amber-500';
    return 'text-rose-600';
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Driver Registry</h1>
          <p className="text-xs text-slate-500 font-medium">Manage driver list, safety scores, and licensing regulations</p>
        </div>
        <button
          onClick={openAddDialog}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Add Driver Profile
        </button>
      </div>

      {/* Filters & Search Grid */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex flex-wrap items-center gap-3 flex-1 max-w-2xl">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by driver name or license number..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Categories</option>
              <option value="Class A">Class A</option>
              <option value="Class B">Class B</option>
              <option value="Heavy Duty">Heavy Duty</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="ON_TRIP">On Trip</option>
              <option value="OFF_DUTY">Off Duty</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-semibold">
          Total Drivers: {filteredDrivers.length}
        </div>
      </div>

      {/* Main Table view */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50">
                <th className="py-3.5 px-6">Driver Name</th>
                <th className="py-3.5 px-6">License Number</th>
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6">License Expiry</th>
                <th className="py-3.5 px-6">Contact Number</th>
                <th className="py-3.5 px-6">Safety Score</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {currentItems.length > 0 ? (
                currentItems.map((driver) => {
                  const expired = isLicenseExpired(driver.licenseExpiryDate);
                  return (
                    <tr 
                      key={driver.id} 
                      className={`hover:bg-slate-50/40 transition-colors ${
                        expired ? 'bg-red-50/20 hover:bg-red-50/30' : ''
                      }`}
                    >
                      <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-2">
                        <Users className="h-4 w-4 text-slate-400" />
                        {driver.name}
                      </td>
                      <td className="py-4 px-6">{driver.licenseNumber}</td>
                      <td className="py-4 px-6">{driver.licenseCategory}</td>
                      <td className="py-4 px-6 flex items-center gap-1.5">
                        <span className={expired ? 'text-rose-600 font-bold' : 'text-slate-500'}>
                          {driver.licenseExpiryDate}
                        </span>
                        {expired && (
                          <AlertTriangle className="h-4 w-4 text-rose-500 animate-pulse" title="License expired! Cannot assign to trips." />
                        )}
                      </td>
                      <td className="py-4 px-6 text-slate-500">{driver.contactNumber}</td>
                      <td className="py-4 px-6 font-bold">
                        <span className={getSafetyScoreColor(driver.safetyScore)}>
                          {driver.safetyScore}/100
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(driver)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditDialog(driver)}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-50 transition-colors"
                            title="Edit profile"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(driver.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-50 transition-colors"
                            title="Remove profile"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-1.5 text-slate-400">
                      <Info className="h-6 w-6" />
                      <p className="text-sm font-semibold text-slate-500">No driver profiles found</p>
                      <p className="text-xs">Adjust your search parameters and try again</p>
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
                {editingDriver ? 'Edit Driver Profile' : 'Register New Driver'}
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
                    Driver Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    License Number *
                  </label>
                  <input
                    type="text"
                    value={licenseNum}
                    onChange={(e) => setLicenseNum(e.target.value)}
                    placeholder="e.g. DL-123456"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-955 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    License Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="Class A">Class A</option>
                    <option value="Class B">Class B</option>
                    <option value="Heavy Duty">Heavy Duty</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    License Expiry Date *
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Contact Number *
                  </label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Safety Score (0-100) *
                  </label>
                  <input
                    type="number"
                    value={safetyScore}
                    onChange={(e) => setSafetyScore(e.target.value)}
                    placeholder="e.g. 98"
                    min="0"
                    max="100"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-955 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Availability Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-955 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="ON_TRIP">On Trip</option>
                  <option value="OFF_DUTY">Off Duty</option>
                  <option value="SUSPENDED">Suspended</option>
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
                  {editingDriver ? 'Save Changes' : 'Add Profile'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
