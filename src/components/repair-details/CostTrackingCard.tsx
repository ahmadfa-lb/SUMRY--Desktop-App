import React, { useState, useEffect, useRef } from 'react';
import { DollarSign, Coins, Receipt, Settings2, CirclePlus, Trash2, ChevronDown } from 'lucide-react';
import { Repair } from '../../types/repair';
import PartsSuggestions from './PartsSuggestions';
import useToast from '../../toast/useToast';
import ToastContainer from '../../toast/ToastContainer';

interface CostTrackingCardProps {
    repair: Repair;
    repairCost: number;
    amountPaid: number;
    parts: string[];
    newPart: string;
    onCostChange: (cost: number) => void;
    onAmountPaidChange: (amount: number) => void;
    onCostUpdate: () => Promise<void>;
    onNewPartChange: (part: string) => void;
    onAddPart: (e: React.FormEvent) => void;
    onRemovePart: (index: number) => void;
    formatCost: (amount: number) => string;
    calculateAmountLeft: () => number;
    isLocked?: boolean;
}

const CostTrackingCard: React.FC<CostTrackingCardProps> = ({
    repair,
    repairCost,
    amountPaid,
    parts,
    newPart,
    onCostChange,
    onAmountPaidChange,
    onCostUpdate,
    onNewPartChange,
    onAddPart,
    onRemovePart,
    formatCost,
    calculateAmountLeft,
    isLocked
}) => {
    const amountLeft = calculateAmountLeft();
    const isWarranty = repair?.under_warranty;

    // Parts suggestions state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [partSuggestions, setPartSuggestions] = useState<string[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { toasts, showToast, hideToast } = useToast();


    // Load parts suggestions from database on component mount
    useEffect(() => {
        loadPartsSuggestions();
    }, []);

    // Filter suggestions based on input
    useEffect(() => {
        if (newPart.trim()) {
            const filtered = partSuggestions.filter(suggestion =>
                suggestion.toLowerCase().includes(newPart.toLowerCase())
            );
            setFilteredSuggestions(filtered);
        } else {
            setFilteredSuggestions(partSuggestions);
        }
    }, [newPart, partSuggestions]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
                inputRef.current && !inputRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadPartsSuggestions = async () => {
        try {
            // console.log('Loading parts suggestions...');
            const api = (window as any).electronAPI;
            const suggestions = await api.getAllSuggestions('parts');
            // console.log('Loaded suggestions:', suggestions);
            setPartSuggestions(suggestions);
        } catch (error) {
            console.error('Error loading parts suggestions:', error);
            // Show user-friendly error
            showToast({
                type: 'error',
                title: 'Suggestions Load Failed',
                description: `Failed to load suggestions. Please try again.`,
            });
        }
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleAddSuggestion = async (suggestion: string) => {
        try {
            // console.log('Adding suggestion:', suggestion);
            const api = (window as any).electronAPI;
            const result = await api.addSuggestion('parts', suggestion);
            // console.log('Add suggestion result:', result);

            if (result !== null) {
                // console.log('Suggestion added successfully, reloading...');
                await loadPartsSuggestions(); // Reload suggestions
                showToast({
                    type: 'success',
                    title: 'Suggestion Added',
                    description: `Suggestion added successfully`,
                });
            } else {
                // console.log('Suggestion already exists');
                showToast({
                    type: 'error',
                    title: 'Suggestion Already Exists',
                    description: `Suggestion already exists`,
                });
            }
        } catch (error) {
            console.error('Error adding suggestion:', error);
            showToast({
                type: 'error',
                title: 'Suggestion Addition Failed',
                description: `Failed to add suggestion. Please try again.`,
            });
        }
    };

    const handleRemoveSuggestion = async (index: number) => {
        try {
            const suggestionToRemove = partSuggestions[index];
            // console.log('Removing suggestion:', suggestionToRemove);
            const api = (window as any).electronAPI;
            const result = await api.removeSuggestion('parts', suggestionToRemove);
            // console.log('Remove suggestion result:', result);

            if (result) {
                await loadPartsSuggestions(); // Reload suggestions
                showToast({
                    type: 'success',
                    title: 'Suggestion Removed',
                    description: `Suggestion removed successfully`,
                });
            } else {
                showToast({
                    type: 'error',
                    title: 'Suggestion Removal Failed',
                    description: `Failed to remove suggestion. Please try again.`,
                });
            }
        } catch (error) {
            console.error('Error removing suggestion:', error);
            showToast({
                type: 'error',
                title: 'Suggestion Removal Failed',
                description: `Failed to remove suggestion. Please try again.`,
            });
        }
    };

    const handleClearAllSuggestions = async () => {
        try {
            // console.log('Clearing all suggestions...');
            const api = (window as any).electronAPI;
            const result = await api.clearAllSuggestions('parts');
            // console.log('Clear all suggestions result:', result);

            await loadPartsSuggestions(); // Reload suggestions
            showToast({
                type: 'success',
                title: 'Suggestions Cleared',
                description: `Cleared ${result} suggestions successfully`,
            });
        } catch (error) {
            console.error('Error clearing suggestions:', error);
            showToast({
                type: 'error',
                title: 'Suggestions Clearing Failed',
                description: `Failed to clear suggestions. Please try again.`,
            });
        }
    };

    const handleInputFocus = () => {
        setShowDropdown(true);
    };

    const handleSuggestionClick = (suggestion: string) => {
        onNewPartChange(suggestion);
        setShowDropdown(false);
        inputRef.current?.focus();
    };

    const handleInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown' && filteredSuggestions.length > 0) {
            e.preventDefault();
            setShowDropdown(true);
        } else if (e.key === 'Escape') {
            setShowDropdown(false);
        }
    };

    return (
        <>
            <div className="rounded-lg border bg-card text-card-foreground shadow-lg">
                {/* Header */}
                <div className="flex flex-col space-y-1.5 p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="font-semibold tracking-tight text-xl font-headline text-[var(--light-green)] flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Cost Tracking
                        </div>
                        <button
                            onClick={handleOpenModal}
                            disabled={isLocked}
                            className="inline-flex items-center justify-center gap-2 text-sm font-medium transition-colors focus-visible:outline-none focus:ring-2 focus:ring-[var(--light-green)] focus-visible:ring-2 focus-visible:ring-ring  disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-[var(--orange)] hover:text-white bg-gray-100 h-9 rounded-md px-3 whitespace-nowrap"
                        >
                            <Settings2 className="h-4 w-4" />
                            Manage Part Suggestions
                        </button>
                    </div>
                    <div className="text-sm text-[var(--light-green-2)]">
                        List parts used and set the Repair Cost and Amount Paid.
                        {isWarranty && '(Warranty Active: Repair Cost set to $0).'}
                    </div>
                </div>

                {/* Parts Section */}
                <div className="p-6 pt-0 space-y-4">
                    <div>
                        <h4 className="text-md font-semibold text-foreground mb-1">
                            Parts Used
                        </h4>
                        <div className="mt-2">
                            <div className="relative w-full overflow-auto">
                                <table className="w-full caption-bottom text-sm">
                                    <thead className="[&_tr]:border-b">
                                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                            <th className="h-12 px-4 text-left align-middle font-medium text-[var(--light-green-2)]">
                                                Description
                                            </th>
                                            <th className="h-12 px-4 align-middle font-medium text-[var(--light-green-2)] text-right w-10">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="[&_tr:last-child]:border-0">
                                        {parts.map((part, index) => (
                                            <tr key={index} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                <td className="p-4 align-middle">
                                                    {part}
                                                </td>
                                                <td className="p-4 align-middle text-right">
                                                    <button
                                                        onClick={() => onRemovePart(index)}
                                                        className="inline-flex items-center justify-center focus:ring-2 focus:ring-[var(--light-green)] gap-2 whitespace-nowrap rounded-md text-sm font-medium  transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring  disabled:pointer-events-none disabled:opacity-50 hover:bg-[var(--orange)] h-8 w-8 text-[var(--red)] hover:text-white"
                                                        type="button"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-2">
                                <form onSubmit={onAddPart} className="flex flex-col sm:flex-row items-start gap-3 p-1 border border-[var(--light-green-2)] rounded-lg">
                                    <div className="space-y-2 flex-grow relative">
                                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 sr-only" htmlFor="part-description">
                                            Part Description
                                        </label>
                                        <div className="relative">
                                            <input
                                                ref={inputRef}
                                                disabled={isLocked}
                                                className="flex h-10 w-full rounded-md border px-3 py-2 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[var(--light-gray)] placeholder:text-[var(--light-green-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--light-green)] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pr-8"
                                                placeholder="Part description (e.g., Screen, Diode, RAM Stick)"
                                                id="part-description"
                                                value={newPart}
                                                onChange={(e) => onNewPartChange(e.target.value)}
                                                onFocus={handleInputFocus}
                                                onKeyDown={handleInputKeyDown}
                                                name="description"
                                                autoComplete="off"
                                            />
                                            {partSuggestions.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowDropdown(!showDropdown)}
                                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[var(--light-green-2)] hover:text-[var(--light-green)] transition-colors"
                                                >
                                                    <ChevronDown className={`h-4 w-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                                                </button>
                                            )}
                                        </div>

                                        {/* Dropdown suggestions */}
                                        {showDropdown && filteredSuggestions.length > 0 && (
                                            <div
                                                ref={dropdownRef}
                                                className="absolute top-full left-0 right-0 z-50 bg-white border border-[var(--light-green-2)] rounded-md shadow-lg max-h-48 overflow-y-auto mt-1"
                                            >
                                                {filteredSuggestions.map((suggestion, index) => (
                                                    <button
                                                        key={index}
                                                        type="button"
                                                        onClick={() => handleSuggestionClick(suggestion)}
                                                        className="w-full text-left px-3 py-2 hover:bg-green-100 hover:text-[var(--light-green)] transition-colors text-sm border-b border-gray-100 last:border-b-0"
                                                    >
                                                        {suggestion}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        className="inline-flex items-center justify-center gap-2 focus:ring-2 focus:ring-[var(--light-green)] whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring  disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-[var(--orange)] hover:text-white bg-gray-100 h-9 rounded-md px-3 mt-2 w-full sm:w-auto"
                                        type="submit"
                                        disabled={isLocked}
                                    >
                                        <CirclePlus className="h-4 w-4 mr-1" />
                                        Add
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Separator */}
                    <div className="shrink-0 bg-border h-[1px] w-full"></div>

                    {/* Cost Tracking Section */}
                    <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                            <label className="text-md font-semibold text-foreground flex items-center gap-1.5">
                                <DollarSign className="h-4 w-4" />
                                Repair Cost
                            </label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-[var(--light-green-2)]">
                                    {isWarranty ? 'Free (Warranty)' : 'USD'}
                                </span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={isWarranty ? 0 : repairCost}
                                    onChange={(e) => onCostChange(parseFloat(e.target.value) || 0)}
                                    onBlur={() => onCostUpdate()}
                                    disabled={isWarranty || isLocked}
                                    className="flex h-10 rounded-md border px-3 py-2 text-base  file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[var(--light-gray)] placeholder:text-[var(--light-green-2)] focus-visible:outline-none focus-visible:ring-2 focus:ring-2 focus:ring-[var(--light-green)]  disabled:cursor-not-allowed disabled:opacity-50 md:text-sm w-auto max-w-[120px] text-right"
                                    placeholder="0.00"
                                    aria-label="Repair Cost"
                                />
                            </div>
                        </div>

                        {isWarranty ? (
                            <p className="text-xs text-[var(--light-green-2)] mt-1 text-right">
                                Repair cost is $0.00 as the item is under warranty.
                            </p>
                        ) : ""}

                        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                            <label className="text-md font-semibold text-foreground flex items-center gap-1.5">
                                <Receipt className="h-4 w-4" />
                                Amount Paid
                            </label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-[var(--light-green-2)]">USD</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={amountPaid}
                                    onChange={(e) => onAmountPaidChange(parseFloat(e.target.value) || 0)}
                                    onBlur={() => onCostUpdate()}
                                    className="flex h-10 rounded-md border px-3 py-2 text-base  file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[var(--light-gray)] placeholder:text-[var(--light-green-2)] focus-visible:outline-none focus-visible:ring-2 focus:ring-2 focus:ring-[var(--light-green)]  disabled:cursor-not-allowed disabled:opacity-50 md:text-sm w-auto max-w-[120px] text-right"
                                    placeholder="0.00"
                                    aria-label="Amount Paid"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                            <label className="text-md font-semibold text-foreground flex items-center gap-1.5">
                                <Coins className="h-4 w-4" />
                                Amount Left
                            </label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-[var(--light-green-2)]">USD</span>
                                <input
                                    className="flex h-10 rounded-md border px-3 py-2 text-[var(--red)] file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[var(--light-gray)] placeholder:text-[var(--light-green-2)] focus-visible:outline-none focus-visible:ring-2 focus:ring-2 focus:ring-[var(--light-green)]  disabled:cursor-not-allowed md:text-sm w-auto max-w-[120px] text-right"
                                    readOnly
                                    disabled
                                    aria-label="Amount Left"
                                    type="text"
                                    value={formatCost(amountLeft)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Parts Suggestions Modal */}
            <PartsSuggestions
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                suggestions={partSuggestions}
                onAddSuggestion={handleAddSuggestion}
                onRemoveSuggestion={handleRemoveSuggestion}
                onClearAllSuggestions={handleClearAllSuggestions}
            />
            <ToastContainer toasts={toasts} onHideToast={hideToast} />
        </>
    );
};

export default CostTrackingCard;