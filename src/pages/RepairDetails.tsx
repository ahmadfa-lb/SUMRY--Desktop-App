import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Calendar, Phone, Package, Fingerprint, User, AlertCircle, Edit, Save, X, Printer, PenLine, ListChecks, CalendarDays, ShieldCheck, ShieldQuestion, DollarSign, Receipt, Coins, History, Share2, CircleAlert, Trash2, Settings2, CirclePlus, ArrowRight, Unlock, AlertTriangle } from 'lucide-react';
import DangerZoneCard from '@/components/repair-details/DangerZoneCard';
import RepairHistoryCard from '@/components/repair-details/RepairHistoryCard';
import CostTrackingCard from '@/components/repair-details/CostTrackingCard';
import StatusUpdateCard from '@/components/repair-details/StatusUpdateCard';
import TimestampsWarrantyCard from '@/components/repair-details/TimestampsWarrantyCard';
import ProblemDescriptionCard from '@/components/repair-details/ProblemDescriptionCard';
import ItemInformationCard from '@/components/repair-details/ItemInformationCard';
import CustomerDetailsCard from '@/components/repair-details/CustomerDetailsCard';
import useToast from '../toast/useToast';
import ToastContainer from '../toast/ToastContainer';
import { title } from 'process';

interface Repair {
  id: number;
  customer_name: string;
  contact?: string;
  item_brand: string;
  item_model?: string;
  serial_number?: string;
  under_warranty: boolean;
  problem_description: string;
  status: 'pending-diagnosis' | 'awaiting-parts' | 'in-progress' | 'completed' | 'awaiting-pickup' | 'picked-up' | 'cancelled';
  repair_cost?: number;
  amount_paid?: number;
  parts_used?: string;
  is_unlocked?: boolean;
  created_at: string;
  updated_at: string;
}

const RepairDetails: React.FC = () => {
  const { repairId } = useParams<{ repairId: string }>();
  const navigate = useNavigate();
  const [repair, setRepair] = useState<Repair | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Separate editing states for each section
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [isEditingItem, setIsEditingItem] = useState(false);
  const [isEditingProblem, setIsEditingProblem] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // Confirmation dialog states
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showDeleteSecondConfirmation, setShowDeleteSecondConfirmation] = useState(false);
  const [showUnlockConfirmation, setShowUnlockConfirmation] = useState(false);

  const [editedRepair, setEditedRepair] = useState<Repair | null>(null);
  const [parts, setParts] = useState<string[]>([]);
  const [newPart, setNewPart] = useState('');
  const [repairCost, setRepairCost] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);

  const [repairHistory, setRepairHistory] = useState<Repair[]>([]);

  const { toasts, showToast, hideToast } = useToast();

  const currentRepair = editedRepair || repair;

  useEffect(() => {
    if (repair?.status === 'picked-up') {
      setIsLocked(!repair.is_unlocked);
    } else {
      setIsLocked(false);
    }
  }, [repair?.status, repair?.is_unlocked]);

  const loadRepairHistory = async (serialNumber: string) => {
    try {
      const api = (window as any).electronAPI;
      if (!api) {
        throw new Error('Electron API not available');
      }

      const historyData = await api.getRepairsBySerialNumber(serialNumber);
      // Filter out the current repair from the history
      const filteredHistory = historyData.filter((r: Repair) => r.id !== parseInt(repairId!));
      setRepairHistory(filteredHistory);
    } catch (err) {
      console.error('Error loading repair history:', err);
    }
  };



  const loadRepair = async () => {
    try {
      setLoading(true);
      setError(null);

      const api = (window as any).electronAPI;
      if (!api) {
        throw new Error('Electron API not available');
      }

      const repairData = await api.getRepairById(parseInt(repairId!));
      // console.log('Repair Data:', repairData);
      if (!repairData) {
        throw new Error('Repair not found');
      }

      setRepair(repairData);
      setEditedRepair(repairData);

      setRepairCost(repairData.repair_cost || 0);
      setAmountPaid(repairData.amount_paid || 0);

      if (repairData.parts_used) {
        try {
          const parsedParts = JSON.parse(repairData.parts_used);
          // console.log(parsedParts);
          setParts(Array.isArray(parsedParts) ? parsedParts : []);
        } catch (parseError) {
          console.error('Error parsing parts_used:', parseError);
          setParts([]);
        }
      } else {
        setParts([]);
      }

      if (repairData.serial_number) {
        await loadRepairHistory(repairData.serial_number);
      }
    } catch (err) {
      console.error('Error loading repair:', err);
      setError(err instanceof Error ? err.message : 'Failed to load repair');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (repairId) {
      loadRepair();
    }
  }, [repairId]);

  const handleSaveCustomer = async () => {
    if (!editedRepair) return;

    try {
      const api = (window as any).electronAPI;
      if (!api) {
        throw new Error('Electron API not available');
      }

      const success = await api.updateRepair(editedRepair.id, editedRepair);
      if (success) {
        setRepair(editedRepair);
        setIsEditingCustomer(false);
      } else {
        throw new Error('Failed to update repair');
      }
    } catch (err) {
      console.error('Error updating repair:', err);
      setError(err instanceof Error ? err.message : 'Failed to update repair');
    }
  };

  const handleCostUpdate = async (updatedParts?: string[]) => {
    if (!currentRepair) return;

    const partsToUse = updatedParts !== undefined ? updatedParts : parts;

    const updatedRepair = {
      ...currentRepair,
      repair_cost: repairCost,
      amount_paid: amountPaid,
      parts_used: JSON.stringify(partsToUse)
    };

  //   const updatedRepair = {
  //   id: currentRepair.id,
  //   customer_name: currentRepair.customer_name,
  //   contact: currentRepair.contact,
  //   item_brand: currentRepair.item_brand,
  //   item_model: currentRepair.item_model,
  //   serial_number: currentRepair.serial_number,
  //   under_warranty: currentRepair.under_warranty,
  //   problem_description: currentRepair.problem_description,
  //   status: currentRepair.status,
  //   repair_cost: repairCost,
  //   amount_paid: amountPaid,
  //   parts_used: JSON.stringify(partsToUse),
  //   is_unlocked: currentRepair.is_unlocked,
  //   created_at: currentRepair.created_at,
  //   updated_at: currentRepair.updated_at
  // };

    try {
      const api = (window as any).electronAPI;
      if (!api) {
        throw new Error('Electron API not available');
      }

      const success = await api.updateRepair(updatedRepair.id, updatedRepair);
      if (success) {
        setRepair(updatedRepair);
        setEditedRepair(updatedRepair);
        showToast({
          type: 'success',
          title: 'Cost Updated',
          description: 'Repair cost and payment information updated successfully',
        });
      } else {
        throw new Error('Failed to update cost information');
      }
    } catch (err) {
      console.error('Error updating cost information:', err);
      showToast({
        type: 'error',
        title: 'Update Failed',
        description: err instanceof Error ? err.message : 'Failed to update cost information',
      });
      setError(err instanceof Error ? err.message : 'Failed to update cost information');
    }
  };


  const calculateAmountLeft = () => {
    const cost = currentRepair?.under_warranty ? 0 : repairCost;
    return cost - amountPaid;
  };

  const formatCost = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleSaveItem = async () => {
    if (!editedRepair) return;

    try {
      const api = (window as any).electronAPI;
      if (!api) {
        throw new Error('Electron API not available');
      }

      const success = await api.updateRepair(editedRepair.id, editedRepair);
      if (success) {
        setRepair(editedRepair);
        setIsEditingItem(false);
      } else {
        throw new Error('Failed to update repair');
      }
    } catch (err) {
      console.error('Error updating repair:', err);
      setError(err instanceof Error ? err.message : 'Failed to update repair');
    }
  };

  const handleSaveProblem = async () => {
    if (!editedRepair) return;

    try {
      const api = (window as any).electronAPI;
      if (!api) {
        throw new Error('Electron API not available');
      }

      const success = await api.updateRepair(editedRepair.id, editedRepair);
      if (success) {
        setRepair(editedRepair);
        setIsEditingProblem(false);
      } else {
        throw new Error('Failed to update repair');
      }
    } catch (err) {
      console.error('Error updating repair:', err);
      setError(err instanceof Error ? err.message : 'Failed to update repair');
    }
  };

  // Add warranty toggle handler
  const handleWarrantyToggle = async () => {
    if (!currentRepair) return;

    const updatedRepair = {
      ...currentRepair,
      under_warranty: !currentRepair.under_warranty
    };

    try {
      const api = (window as any).electronAPI;
      if (!api) {
        throw new Error('Electron API not available');
      }

      const success = await api.updateRepair(updatedRepair.id, updatedRepair);
      if (success) {
        setRepair(updatedRepair);
        setEditedRepair(updatedRepair);
      } else {
        throw new Error('Failed to update warranty status');
      }
    } catch (err) {
      console.error('Error updating warranty status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update warranty status');
    }
  };

  // Add status update handler
  const handleStatusUpdate = async (newStatus: string, isLocked: boolean) => {

    if (!currentRepair) return;

    const updatedRepair = {
      ...currentRepair,
      status: newStatus as 'pending-diagnosis' | 'awaiting-parts' | 'in-progress' | 'completed' | 'awaiting-pickup' | 'picked-up' | 'cancelled',
      is_unlocked: newStatus !== 'picked-up'
    };

    try {
      const api = (window as any).electronAPI;
      if (!api) {
        throw new Error('Electron API not available');
      }

      const success = await api.updateRepair(updatedRepair.id, updatedRepair);
      if (success) {
        setRepair(updatedRepair);
        setEditedRepair(updatedRepair);
      } else {
        throw new Error('Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handleCancelCustomer = () => {
    setEditedRepair(repair);
    setIsEditingCustomer(false);
  };

  const handleCancelItem = () => {
    setEditedRepair(repair);
    setIsEditingItem(false);
  };

  const handleCancelProblem = () => {
    setEditedRepair(repair);
    setIsEditingProblem(false);
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateString;
    }
  };

  const getStatusBadgeClasses = (status: string) => {
    const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent";

    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-700 hover:bg-green-600 text-white`;
      case 'awaiting-pickup':
        return `${baseClasses} bg-green-500 hover:bg-green-600 text-white`;
      case 'pending-diagnosis':
        return `${baseClasses} bg-yellow-500 hover:bg-yellow-600 text-white`;
      case 'in-progress':
        return `${baseClasses} bg-blue-500 hover:bg-blue-600 text-white`;
      case 'awaiting-parts':
        return `${baseClasses} bg-blue-500 hover:bg-blue-600 text-white`;
      case 'cancelled':
        return `${baseClasses} bg-red-500 hover:bg-[var(--red)] text-white`;
      case 'picked-up':
        return `${baseClasses} bg-[#059669] hover:bg-[#047857] text-white`;
      default:
        return `${baseClasses} bg-gray-500 hover:bg-gray-600 text-white`;
    }
  };

  const addPart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPart.trim()) {
      const updatedParts = [...parts, newPart.trim()];
      setParts(updatedParts);
      setNewPart('');

      // Pass the updated parts array directly to avoid state timing issues
      await handleCostUpdate(updatedParts);
    }
  };

  const removePart = async (index: number) => {
    const updatedParts = parts.filter((_, i) => i !== index);
    setParts(updatedParts);

    // Pass the updated parts array directly to avoid state timing issues
    await handleCostUpdate(updatedParts);
  };

  const amountLeft = repairCost - amountPaid;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-[var(--light-green)] text-lg">Loading repair details...</div>
      </div>
    );
  }

  if (error || !repair) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <div className="text-red-500 text-lg mb-4">{error || 'Repair not found'}</div>
          <button
            onClick={() => navigate('/')}
            className="bg-[var(--orange)] hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
          >
            Back to Repairs
          </button>
        </div>
      </div>
    );
  }


  const handleDelete = async () => {
    if (!currentRepair) return;
    setShowDeleteConfirmation(true);
  };

  const confirmFirstDelete = () => {
    setShowDeleteConfirmation(false);
    setShowDeleteSecondConfirmation(true);
  };

  const confirmFinalDelete = async () => {
    if (!currentRepair) return;

    setShowDeleteSecondConfirmation(false);
    
    try {
      const api = (window as any).electronAPI;
      if (!api) {
        throw new Error('Electron API not available');
      }

      // Call the delete API - assuming you have a deleteRepair method
      const success = await api.deleteRepair(currentRepair.id);

      if (success) {
        // Show success message
        showToast({
          type: 'success',
          title: 'Repair Deleted',
          description: `Repair #${currentRepair.id} has been successfully deleted.`,
        });

        // Navigate back to the main repairs list
        navigate('/');
      } else {
        throw new Error('Failed to delete repair');
      }
    } catch (err) {
      console.error('Error deleting repair:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete repair');

      // Show error message to user
      showToast({
        type: 'error',
        title: 'Error deleting repair',
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  };

  const handleRepairUpdate = async (updates: Partial<Repair>) => {
    if (!repair) return;

    try {
      const api = (window as any).electronAPI;
      if (!api) {
        throw new Error('Electron API not available');
      }

      const success = await api.updateRepair(repair.id, updates);
      if (success) {
        const updatedRepair = { ...repair, ...updates };
        setRepair(updatedRepair);
        showToast({
          type: 'info',
          title: '',
          description: 'Repair details updated',
        })
      } else {
        throw new Error('Failed to update repair');
      }
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Error updating repair',
        description: err instanceof Error ? err.message : 'Failed to update repair',
      })
      console.error('Error updating repair:', err);
      setError(err instanceof Error ? err.message : 'Failed to update repair');
    }
  };

  const handlePrintLabel = () => {
    const printContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 400px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="margin: 0; color: #059669;">Repair Label</h2>
      </div>
      
      <div style="margin-bottom: 15px;">
        <strong>${currentRepair.customer_name}</strong><br>
        ${currentRepair.contact || 'No contact info'}
      </div>
      
      <div style="margin-bottom: 15px;">
        <strong>${currentRepair.item_brand}</strong><br>
        ${currentRepair.item_model || ''}<br>
        ${currentRepair.serial_number || 'No serial number'}
      </div>
      
      <div style="margin-bottom: 15px; color: #d97706;">
        <strong>Size & Description</strong>
      </div>
      
      <div style="margin-bottom: 15px;">
        <strong>Problem:</strong><br>
        ${currentRepair.problem_description}
      </div>
      
      <div style="margin-bottom: 15px;">
        <strong>Status:</strong> ${currentRepair.status}<br>
        <strong>Repair ID:</strong> ${currentRepair.id}
      </div>
      
      <div style="margin-top: 20px; font-size: 12px; color: #666;">
        Created: ${formatDate(currentRepair.created_at)}
      </div>
    </div>
  `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
      <html>
        <head>
          <title>Repair Label - ${currentRepair.customer_name}</title>
          <style>
            body { margin: 0; padding: 0; }
            @media print {
              body { -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  const handleUnlock = async () => {
    setShowUnlockConfirmation(true);
  };

  const confirmUnlock = async () => {
    if (!currentRepair) return;

    setShowUnlockConfirmation(false);
    
    try {
      const api = (window as any).electronAPI;
      if (!api) {
        throw new Error('Electron API not available');
      }

      // Update the repair in the database with is_unlocked = true
      const success = await api.updateRepair(currentRepair.id, { is_unlocked: true });

      if (success) {
        setIsLocked(false);
        // Update local repair state
        const updatedRepair = { ...repair, is_unlocked: true };
        setRepair(updatedRepair);
        setEditedRepair(updatedRepair);

        showToast({
          type: 'info',
          title: 'Repair Unlocked',
          description: 'Repair has been unlocked for editing and will remain unlocked.',
        });
      } else {
        throw new Error('Failed to unlock repair in database');
      }
    } catch (err) {
      console.error('Error unlocking repair:', err);
      showToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to unlock repair. Please try again.',
      });
    }
  };

  return (
    <main className="flex-grow container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Main Repair Details Card */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-lg">
          <div className="flex flex-col space-y-1.5 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="font-semibold tracking-tight text-2xl font-headline text-[var(--light-green)] flex items-center gap-2">
                <Package className="h-6 w-6" />
                {currentRepair.item_brand} {currentRepair.item_model || ''}
                {isLocked && (
                  <span className="flex items-center justify-center gap-2 text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full ml-2">
                    <Lock className='h-4 w-4' /> LOCKED
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isLocked && (
                  <button
                    onClick={handleUnlock}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-yellow-100 hover:bg-yellow-200 text-yellow-800 h-9 rounded-md px-3"
                    title="Unlock Repair for Editing"
                  >
                    <Unlock className="h-4 w-4 mr-2" />
                    Unlock for Editing
                  </button>
                )}
                <button
                  onClick={handlePrintLabel}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium  transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-[var(--orange)] hover:text-white bg-gray-100 h-9 rounded-md px-3"
                  title="Print Label">
                  <Printer className="h-4 w-4 mr-2" />
                  Print Label
                </button>
                <div className={`inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent text-white text-base px-3 py-1 ${getStatusBadgeClasses(currentRepair.status)}`}>
                  {currentRepair.status}
                </div>
              </div>
            </div>
            <div className="text-sm text-[var(--light-green-2)] pt-1">
              Repair ID: {currentRepair.id}
            </div>
          </div>
          <div className="p-6 pt-0 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Details */}
              <CustomerDetailsCard repair={repair} onUpdate={handleRepairUpdate} isLocked={isLocked} />

              {/* Item Information */}
              <ItemInformationCard repair={repair} onUpdate={handleRepairUpdate} isLocked={isLocked} />
            </div>

            <div className="shrink-0 bg-gray-300 h-[1px] w-full"></div>

            {/* Problem Description */}
            <ProblemDescriptionCard repair={repair} onUpdate={handleRepairUpdate} isLocked={isLocked} />

            <div className="shrink-0 bg-gray-300 h-[1px] w-full"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Timestamps & Warranty */}
              <TimestampsWarrantyCard
                repair={repair}
                onWarrantyToggle={handleWarrantyToggle}
                formatDate={formatDate}
                isLocked={isLocked}
              />

              {/* Update Status */}
              <StatusUpdateCard
                repair={repair}
                onStatusUpdate={handleStatusUpdate}
                isLocked={isLocked}
              />
            </div>
          </div>
        </div>

        {/* Cost Tracking Card */}
        <CostTrackingCard
          repair={repair}
          repairCost={repairCost}
          amountPaid={amountPaid}
          parts={parts}
          newPart={newPart}
          onCostChange={setRepairCost}
          onAmountPaidChange={setAmountPaid}
          onCostUpdate={handleCostUpdate}
          onNewPartChange={setNewPart}
          onAddPart={addPart}
          onRemovePart={removePart}
          formatCost={formatCost}
          calculateAmountLeft={calculateAmountLeft}
          isLocked={isLocked}
        />

        {/* Repair History Card */}
        {currentRepair.serial_number &&
          <RepairHistoryCard
            currentRepair={repair}
            repairHistory={repairHistory}
            formatDate={formatDate}
            formatCost={formatCost}
            getStatusBadgeClasses={getStatusBadgeClasses}
          />
        }

        {/* Danger Zone Card */}
        < DangerZoneCard
          repair={currentRepair}
          onDelete={handleDelete}
        />
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-none hover:text-white fixed top-6 left-6 z-50 h-14 w-14 rounded-full shadow-lg bg-white hover:bg-[var(--light-green)] text-[var(--light-gray)]"
        aria-label="Go back to previous page"
        title="Go back to previous page"
      >
        <ArrowLeft className="h-7 w-7" />
      </button>

      {/* Delete Confirmation Dialog - First Step */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex flex-col items-center mb-4">
              <AlertTriangle className="w-12 h-12 text-red-500 mb-3" />
              <h3 className="text-xl font-semibold mb-2">Delete Repair</h3>
              <div className="text-gray-600 text-center space-y-2">
                <p>Are you sure you want to delete this repair❓</p>
                <div className="text-sm flex flex-col items-start bg-gray-50 p-3 rounded border-l-4 border-red-500">
                  <p className='max-w-80 truncate'><strong>Customer:</strong> {currentRepair.customer_name}</p>
                  <p className='max-w-80 truncate'><strong>Item:</strong> {currentRepair.item_brand} {currentRepair.item_model || ''}</p>
                  <p className='max-w-80 truncate'><strong>Status:</strong> {currentRepair.status}</p>
                </div>
                <p className="text-xs italic text-gray-500 mt-2">
                  This action cannot be undone and will remove all associated data.
                </p>
              </div>
            </div>
            <div className="flex justify-center gap-3 mt-5">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmation(false)}
                className="px-5 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmFirstDelete}
                className="px-5 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog - Second Step */}
      {showDeleteSecondConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex flex-col items-center mb-4">
              <AlertTriangle className="w-16 h-16 text-red-600 mb-3" />
              <h3 className="text-xl font-semibold mb-2 text-red-600">⚠️ FINAL WARNING ⚠️</h3>
              <div className="text-gray-600 text-center space-y-2">
                <p className="font-medium">This will permanently delete repair #{currentRepair.id}.</p>
                <p className="text-lg font-semibold text-red-600">Are you absolutely sure❓</p>
              </div>
            </div>
            <div className="flex justify-center gap-3 mt-5">
              <button
                type="button"
                onClick={() => setShowDeleteSecondConfirmation(false)}
                className="px-5 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmFinalDelete}
                className="px-5 py-2 rounded-md bg-red-700 text-white hover:bg-red-800 transition-colors font-semibold"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unlock Confirmation Dialog */}
      {showUnlockConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex flex-col items-center mb-4">
              <Unlock className="w-12 h-12 text-yellow-500 mb-3" />
              <h3 className="text-xl font-semibold mb-2">⚠️ UNLOCK REPAIR ⚠️</h3>
              <div className="text-gray-600 text-center space-y-2">
                <p>This will unlock the repair for editing.</p>
                <div className="flex flex-col items-start text-sm bg-gray-50 p-3 rounded border-l-4 border-yellow-500">
                  <p><strong>Repair ID:</strong> {currentRepair.id}</p>
                  <p><strong>Customer:</strong> {currentRepair.customer_name}</p>
                  <p><strong>Status:</strong> {currentRepair.status}</p>
                </div>
                <p className="text-sm">Are you sure you want to unlock this repair?</p>
              </div>
            </div>
            <div className="flex justify-center gap-3 mt-5">
              <button
                type="button"
                onClick={() => setShowUnlockConfirmation(false)}
                className="px-5 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmUnlock}
                className="px-5 py-2 rounded-md bg-yellow-600 text-white hover:bg-yellow-700 transition-colors"
              >
                Unlock Repair
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onHideToast={hideToast} />

    </main>
  );
};

export default RepairDetails;