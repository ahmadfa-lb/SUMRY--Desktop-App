import React, { useState, useRef, useEffect } from "react";
import { CirclePlus, Search, Filter, Check, AlertTriangle } from "lucide-react";
import EmptyState from "./EmptyState";
import RepairCard from "./RepairCard";
import LogNewRepair from "./LogNewRepair";
import useToast from '../toast/useToast';
import ToastContainer from '../toast/ToastContainer';
import { Repair } from "@/types/repair";
import { useShop } from '../contexts/ShopContext';

const CurrentRepairs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [isLogNewRepairOpen, setIsLogNewRepairOpen] = useState(false);
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    show: boolean;
    repairId: number | null;
    repairData: any;
    step: 'first' | 'second';
  }>({ show: false, repairId: null, repairData: null, step: 'first' });
  const [deleting, setDeleting] = useState(false);
  const { toasts, showToast, hideToast } = useToast();
  const { triggerRefresh } = useShop();


  // Load repairs from database
  const loadRepairs = async () => {
    try {
      setLoading(true);
      setError(null);

      const api = (window as any).electronAPI;
      if (!api) {
        throw new Error('Electron API not available');
      }

      const repairsData = await api.getAllRepairs();
      // console.log("all repairs: ", repairsData);
      setRepairs(repairsData || []);
      // console.log(repairs);
    } catch (err) {
      console.error('Error loading repairs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load repairs');
    } finally {
      setLoading(false);
    }
  };

  // Load repairs on component mount
  useEffect(() => {
    loadRepairs();
  }, []);

  // Handle repair addition
  const handleRepairAdded = () => {
    showToast({
      type: 'success',
      title: 'Repair Logged',
      description: 'Repair has been successfully logged.',
      duration: 5000
    });
    loadRepairs();
    triggerRefresh();
  };

  // Complete status options that will be stored directly in the database
  const statusOptions = [
    'pending-diagnosis',
    'awaiting-parts',
    'in-progress',
    'completed',
    'awaiting-pickup',
    'picked-up',
    'cancelled'
  ];

  // Return only the predefined status options
  const getAvailableStatuses = (): string[] => {
    return statusOptions;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleStatusToggle = (status: string) => {
    setSelectedStatuses(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
    // console.log(selectedStatuses);
  };

  const handleShowAll = () => {
    setSelectedStatuses([]);
  };

  // Simplified filtering logic - direct status matching
  const filteredRepairs = repairs.filter(repair => {
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch = !searchTerm || (
      (repair.problem_description?.toLowerCase().includes(searchLower)) ||
      (repair.customer_name?.toLowerCase().includes(searchLower)) ||
      (repair.contact?.toLowerCase().includes(searchLower)) ||
      (repair.serial_number?.toLowerCase().includes(searchLower)) ||
      (repair.item_brand?.toLowerCase().includes(searchLower)) ||
      (repair.item_model?.toLowerCase().includes(searchLower))
    );

    // Direct status matching since database now stores display values
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(repair.status);

    return matchesSearch && matchesStatus;
  });

  const activeFilterCount = selectedStatuses.length;

  const handleEdit = (repairId: number) => {
    // console.log(`Edit repair with ID: ${repairId}`);
    // Implement edit functionality
  };

  const handleDelete = async (repairId: number) => {
    const api = (window as any).electronAPI;
    if (!api) {
      throw new Error('Electron API not available');
    }

    const currentRepair = await api.getRepairById(repairId);
    if (!currentRepair) {
      console.error('Repair not found');
      return;
    }

    // Show first confirmation
    setDeleteConfirmation({
      show: true,
      repairId,
      repairData: currentRepair,
      step: 'first'
    });
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmation.step === 'first') {
      // Move to second confirmation
      setDeleteConfirmation(prev => ({ ...prev, step: 'second' }));
      return;
    }

    // Execute deletion
    if (!deleteConfirmation.repairId || !deleteConfirmation.repairData) return;

    try {
      setDeleting(true);
      const api = (window as any).electronAPI;
      const success = await api.deleteRepair(deleteConfirmation.repairId);
      
      if (success) {
        showToast({
          type: 'success',
          title: 'Repair Deleted',
          description: `The repair for ${deleteConfirmation.repairData.item_brand} ${deleteConfirmation.repairData.item_model || ''} (Customer: ${deleteConfirmation.repairData.customer_name}) has been deleted.`,
          duration: 5000
        });

        // console.log(`Deleted repair with ID: ${deleteConfirmation.repairId}`);
        loadRepairs();
      } else {
        showToast({
          type: 'error',
          title: 'Delete Failed',
          description: 'Failed to delete repair. Please try again.',
          duration: 5000
        });
        console.error('Failed to delete repair');
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Delete Error',
        description: 'An error occurred while deleting the repair.',
        duration: 5000
      });
      console.error('Error deleting repair:', error);
    } finally {
      setDeleting(false);
      setDeleteConfirmation({ show: false, repairId: null, repairData: null, step: 'first' });
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmation({ show: false, repairId: null, repairData: null, step: 'first' });
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-[var(--light-green)] text-lg">Loading repairs...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-red-500 text-lg">Error: {error}</div>
      </div>
    );
  }

  // Get available statuses for the current data
  const availableStatuses = getAvailableStatuses();

  return (
    <div>
      {/* Delete Confirmation Modal */}
      {deleteConfirmation.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {deleteConfirmation.step === 'first' ? 'Delete Repair?' : '⚠️ FINAL WARNING ⚠️'}
                </h3>
              </div>
              
              {deleteConfirmation.step === 'first' ? (
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-3">
                    Are you sure you want to delete this repair❓
                  </p>
                  <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                    <div><strong>Customer:</strong> {deleteConfirmation.repairData?.customer_name}</div>
                    <div><strong>Item:</strong> {deleteConfirmation.repairData?.item_brand} {deleteConfirmation.repairData?.item_model || ''}</div>
                    <div><strong>Status:</strong> {deleteConfirmation.repairData?.status}</div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3 italic">
                    This action cannot be undone and will remove all associated data.
                  </p>
                </div>
              ) : (
                <div className="mb-6">
                  <p className="text-sm text-red-600 mb-2">
                    This will permanently delete repair #{deleteConfirmation.repairData?.id}.
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    Are you absolutely sure❓
                  </p>
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={handleCancelDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : deleteConfirmation.step === 'first' ? 'Yes, Delete' : 'Delete Forever'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-[var(--light-green)]">Current Repairs</h2>

        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md border rounded-lg">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--light-green-2)] w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, phone, SN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-[var(--light-green)] focus:border-transparent outline-none"
            />
          </div>

          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center border space-x-2 px-4 py-2 rounded-lg hover:bg-[var(--orange)] hover:text-white  transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filter by Status ({activeFilterCount})</span>
            </button>

            {isFilterOpen && (
              <div className="absolute top-full mt-2 right-0 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="p-3 border-b border-gray-100">
                  <h3 className="font-medium text-gray-900">Filter by Status</h3>
                </div>

                <div className="p-2">
                  <button
                    onClick={handleShowAll}
                    className="flex items-center justify-between w-full px-3 py-2 text-left hover:bg-gray-50 rounded"
                  >
                    <span className="text-sm text-gray-700">Show All</span>
                    {selectedStatuses.length === 0 && (
                      <Check className="w-4 h-4 text-[var(--light-green)]" />
                    )}
                  </button>

                  {availableStatuses.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusToggle(status)}
                      className="flex items-center justify-between w-full px-3 py-2 text-left hover:bg-gray-50 rounded"
                    >
                      <span className="text-sm text-gray-700">{status}</span>
                      {selectedStatuses.includes(status) && (
                        <Check className="w-4 h-4 text-[var(--light-green)]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsLogNewRepairOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <CirclePlus className="w-4 h-4" />
            <span>Log New Repair</span>
          </button>
        </div>
      </div>

      {filteredRepairs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRepairs.map((repair) => (
            <RepairCard
              repairId={repair.id}
              key={repair.id}
              customerName={repair.customer_name}
              deviceType={repair.item_brand}
              deviceModel={repair.item_model}
              serialNumber={repair.serial_number}
              phoneNumber={repair.contact}
              status={repair.status}
              loggedDate={repair.created_at}
              loggedTime={repair.updated_at}
              notes={repair.problem_description}
              onEdit={() => handleEdit(repair.id)}
              onDelete={() => handleDelete(repair.id)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 min-h-96">
          <EmptyState />
        </div>
      )}

      {isLogNewRepairOpen && (
        <LogNewRepair
          onClose={() => setIsLogNewRepairOpen(false)}
          onRepairAdded={handleRepairAdded}
        />
      )}

      <ToastContainer toasts={toasts} onHideToast={hideToast} />
    </div>
  );
};

export default CurrentRepairs;