import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import { Navigate, useNavigate } from 'react-router-dom';
import { Calendar, Phone, Smartphone, MoreHorizontal, Trash2, Package, Fingerprint, HelpCircle, ShieldQuestion } from 'lucide-react';
import useToast from '../toast/useToast';
import ToastContainer from '../toast/ToastContainer';

interface RepairCardProps {
    repairId: number;
    customerName: string;
    deviceType: string;
    deviceModel?: string;
    serialNumber?: string;
    phoneNumber?: string;
    status: string;
    loggedDate: string;
    loggedTime: string;
    notes?: string;
    onEdit?: () => void;
    onDelete?: () => void;
}

// Helper function to format date
const formatDate = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return dateString;
    }
};

// Helper function to format time
const formatTime = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    } catch {
        return dateString;
    }
};

// Helper function to get status badge color
const getStatusBadgeClasses = (status: string): string => {
    switch (status.toLowerCase()) {
        case 'pending-diagnosis':
            return 'bg-yellow-500 hover:bg-yellow-600 text-white';
        case 'in-progress':
            return 'bg-blue-500 hover:bg-blue-600 text-white';
        case 'awaiting-parts':
            return 'bg-blue-500 hover:bg-blue-600 text-white';
        case 'awaiting-pickup':
            return 'bg-green-500 hover:bg-green-600 text-white';
        case 'completed':
            return 'bg-green-700 hover:bg-green-600 text-white';
        case 'picked-up':
            return 'bg-[#059669] hover:bg-[#047857] text-white';
        case 'cancelled':
            return 'bg-red-500 hover:bg-[var(--red)] text-white';
        default:
            return 'bg-gray-500 hover:bg-gray-600 text-white';
    }
};

// Helper function to format status display
const formatStatus = (status: string): string => {
    switch (status.toLowerCase()) {
        case 'pending':
            return 'Pending Diagnosis';
        case 'in-progress':
            return 'In Progress';
        case 'completed':
            return 'Completed';
        case 'cancelled':
            return 'Cancelled';
        default:
            return status.charAt(0).toUpperCase() + status.slice(1);
    }
};

// Main Repair Card Component
const RepairCard: React.FC<RepairCardProps> = ({
    repairId,
    customerName,
    deviceType,
    deviceModel,
    serialNumber,
    phoneNumber,
    status,
    loggedDate,
    loggedTime,
    notes,
    onEdit,
    onDelete
}) => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { toasts, showToast, hideToast } = useToast();

    // const handleEdit = (e: React.MouseEvent) => {
    //     e.preventDefault();
    //     e.stopPropagation();
    //     onEdit?.();
    // };

    const handleCheckWarranty = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!serialNumber) {
            showToast({
                type: 'error',
                title: 'Warranty Error',
                description: `No serial number available for this repair`,
            });
            return;
        }

        try {
            const warrantyUrl = `https://sumrylebanon.com/certificate.php?serial_number=${serialNumber}`;
            const result = await (window as any).electronAPI.openExternal(warrantyUrl);

            if (!result.success) {
                showToast({
                    type: 'error',
                    title: 'Warranty Error',
                    description: `Failed to open warranty page: ${result.error || 'Unknown error'}`,
                });
                return;
            }
        } catch (error) {
            console.error('Error opening warranty page:', error);
            showToast({
                type: 'error',
                title: 'Warranty Error',
                description: `Failed to open warranty page`,
            });
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onDelete?.();
    };

    const handleCardClick = () => {
        navigate(`/repairs/${repairId}`);
    };

    return (
        <div className="rounded-lg border bg-card w-full shadow-lg hover:shadow-xl transition-shadow duration-200 flex flex-col cursor-pointer h-full" onClick={handleCardClick}>
            <div className="flex flex-col space-y-1.5 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div className="flex-grow space-y-1 min-w-0">
                        <div className="font-semibold tracking-tight text-lg sm:text-xl font-headline text-[var(--orange)] truncate">
                            {customerName || 'Unknown Customer'}
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-sm sm:text-md font-semibold text-[var(--light-green)] truncate">
                                {deviceType || 'Unknown Device'}
                            </p>
                            {deviceModel && (
                                <p className="text-xs text-[var(--light-green-2)] flex items-center gap-1.5">
                                    <Package className="w-4 h-4 flex-shrink-0" />
                                    <span className="truncate">{deviceModel}</span>
                                </p>
                            )}
                            {serialNumber && (
                                <p className="text-xs text-[var(--light-green-2)] flex items-center gap-1.5">
                                    <Fingerprint className="w-4 h-4 flex-shrink-0" />
                                    <span className="truncate">{serialNumber}</span>
                                </p>
                            )}
                            {phoneNumber && (
                                <p className="text-xs text-[var(--light-green-2)] flex items-center gap-1.5">
                                    <Phone className="w-4 h-4 flex-shrink-0" />
                                    <span className="truncate">{phoneNumber}</span>
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start space-x-2 sm:space-x-0 sm:space-y-2 shrink-0 mt-2 sm:mt-0">
                        <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent ${getStatusBadgeClasses(status)}`}>
                            {formatStatus(status)}
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                className="inline-flex items-center justify-center gap-2 hover:bg[var(--orange)] h-8 w-8 text-[var(--light-green)] hover:text-white hover:bg-[var(--orange)] rounded-lg"
                                aria-label="Check Warranty Online"
                                title="Check Warranty Online"
                                onClick={handleCheckWarranty}
                            >
                                <ShieldQuestion className="w-4 h-4" />
                            </button>
                            {onDelete && (
                                <button
                                    onClick={handleDelete}
                                    className="inline-flex items-center text-red-500 justify-center gap-2 hover:bg-destructive/10 h-8 w-8 hover:text-white hover:bg-[var(--orange)] rounded-lg"
                                    type="button"
                                    aria-label="Delete Repair"
                                    title="Delete Repair"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span className="sr-only">Delete Repair</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-4 sm:p-6 space-y-3 flex-grow pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[var(--light-green-2)] flex-shrink-0" />
                        <strong>Logged:</strong>
                    </div>
                    <span className="break-words">
                        {formatDate(loggedDate)}, {formatTime(loggedDate)}
                    </span>
                </div>
                {notes && (
                    <p className="text-sm text-[var(--light-green-2)] line-clamp-2 break-words">
                        {notes}
                    </p>
                )}
            </div>
            <ToastContainer toasts={toasts} onHideToast={hideToast} />
        </div>
    );
};

export default RepairCard;