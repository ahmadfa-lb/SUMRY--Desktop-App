import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CirclePlus, Search, Calendar, ChevronDown, Printer, CircleCheck, Archive, DollarSign, PenLine, Trash2, Undo, ArrowLeft, X, Check } from 'lucide-react';

import AddNewItem from '../components/AddNewItem';
import DateCalendar from '../components/DateCalendar'
import useToast from '../toast/useToast';
import ToastContainer from '../toast/ToastContainer';

interface FormData {
    model: string;
    powerRate: string;
    serialNumber: string;
    category: string;
    notes: string;
}

interface StockItem {
    id: number;
    status: string;
    model: string;
    category: string;
    powerRate: string;
    serialNumber: string;
    dateAdded: string;
    notes: string;
    sold: boolean;
    salePrice?: number;
    saleDate?: string;
}

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'warning'
}) => {
    if (!isOpen) return null;

    const getTypeStyles = () => {
        switch (type) {
            case 'danger':
                return {
                    confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
                    icon: '⚠️'
                };
            case 'warning':
                return {
                    confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white',
                    icon: '⚠️'
                };
            case 'info':
                return {
                    confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white',
                    icon: 'ℹ️'
                };
            default:
                return {
                    confirmButton: 'bg-[var(--light-green)] hover:bg-[var(--light-green-2)] text-white',
                    icon: '❓'
                };
        }
    };

    const styles = getTypeStyles();

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
                onClick={onCancel}
            />
            <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 z-[9999]">
                <button
                    onClick={onCancel}
                    className="absolute right-4 top-4 rounded-full opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[var(--light-green)] focus:border-transparent"
                >
                    <X className="h-5 w-5" />
                </button>
                <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                        <span className="text-2xl">{styles.icon}</span>
                        <h3 className="text-lg font-semibold text-gray-900">
                            {title}
                        </h3>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        {message}
                    </p>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${styles.confirmButton}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const UsedStock = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [selectedStatus, setSelectedStatus] = useState('All Items (Sold & Available)');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSoldModalOpen, setIsSoldModalOpen] = useState(false);
    const [selectedItemForSale, setSelectedItemForSale] = useState<StockItem | null>(null);
    const [selectedItemForEdit, setSelectedItemForEdit] = useState<StockItem | null>(null);
    const [salePrice, setSalePrice] = useState('');
    const [stockItems, setStockItems] = useState<StockItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toasts, showToast, hideToast } = useToast();


    // New state for dropdown
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [isDateCalendarOpen, setIsDateCalendarOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [showAll, setShowAll] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(4);

    // Category options
    const categoryOptions = ['All Categories', '12V', '24V', '48V'];
    // Status options
    const statusOptions = ['All Items (Sold & Available)', 'Available Items Only', 'Sold Items Only'];

    const [confirmationModal, setConfirmationModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        type?: 'danger' | 'warning' | 'info';
        confirmText?: string;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { }
    });

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        try {
            setLoading(true);
            setError(null);
            const api = (window as any).electronAPI;

            const items = await api.getAllItems();
            // Convert database format to component format
            const formattedItems = items.map(item => ({
                id: item.id,
                status: item.status,
                model: item.model,
                category: item.category || 'N/A',
                powerRate: item.power_rate || '',
                serialNumber: item.serial_number || '',
                dateAdded: item.date_added,
                notes: item.notes || '',
                sold: Boolean(item.sold),
                salePrice: item.sale_price || undefined,
                saleDate: item.sale_date || undefined
            }));
            setStockItems(formattedItems);
            // console.log(stockItems);
            // console.log(formattedItems);
        } catch (err) {
            console.error('Error loading items:', err);
            setError('Failed to load stock items');
        } finally {
            setLoading(false);
        }
    };

    // Filter items based on search term and selected category
    const filteredItems = stockItems.filter(item => {
        const matchesSearch = searchTerm === '' ||
            item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.notes.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = selectedCategory === 'All Categories' ||
            item.category === selectedCategory;

        const matchesStatus = selectedStatus === 'All Items (Sold & Available)' ||
            (selectedStatus === 'Available Items Only' && !item.sold) ||
            (selectedStatus === 'Sold Items Only' && item.sold);

        const matchesDate = !selectedDate || item.dateAdded === selectedDate;
        // console.log(item.dateAdded === selectedDate);
        // console.log(item.dateAdded);
        // console.log(selectedDate);
        return matchesSearch && matchesCategory && matchesStatus && matchesDate;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = showAll ? filteredItems : filteredItems.slice(startIndex, endIndex);

    const handleAddNewItem = () => {
        setIsAddModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
    };

    const handleSubmitNewItem = async (formData: FormData) => {
        try {
            const api = (window as any).electronAPI;
            await api.addItem({
                model: formData.model,
                category: formData.category || null,
                power_rate: formData.powerRate || null,
                serial_number: formData.serialNumber || null,
                notes: formData.notes || null,
                status: 'Available',
                sold: false
            });
            showToast({
                type: 'success',
                title: 'Stock Item Added',
                description: `item '${formData.model}' (S/N:${formData.serialNumber}) added to stock.`,
                duration: 5000
            });
            await loadItems(); // Reload the list
            setIsAddModalOpen(false);
        } catch (error) {
            showToast({
                type: 'error',
                title: 'Error Adding Item',
                description: `Failed to add item '${formData.model}' (S/N:${formData.serialNumber}).`,
                duration: 5000
            });
            console.error('Error adding item:', error);
        }
    };

    const handleEditItem = (item: StockItem) => {
        setSelectedItemForEdit(item);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedItemForEdit(null);
    };

    const handleSubmitEditItem = async (formData: FormData) => {
        if (!selectedItemForEdit) return;

        try {
            const api = (window as any).electronAPI;
            await api.updateItem(selectedItemForEdit.id, {
                model: formData.model,
                category: formData.category || null,
                power_rate: formData.powerRate || null,
                serial_number: formData.serialNumber || null,
                notes: formData.notes || null
            });
            showToast({
                type: 'success',
                title: 'Stock Item Updated',
                description: `item '${formData.model}' (S/N:${formData.serialNumber}) updated in stock.`,
                duration: 5000
            });
            await loadItems(); // Reload the list
            setIsEditModalOpen(false);
            setSelectedItemForEdit(null);
        } catch (error) {
            showToast({
                type: 'error',
                title: 'Error Updating Item',
                description: `Failed to update item '${formData.model}' (S/N:${formData.serialNumber}).`,
                duration: 5000
            });
            console.error('Error updating item:', error);
        }
    };

    const handleMarkAsSold = (item: StockItem) => {
        setSelectedItemForSale(item);
        setSalePrice('');
        setIsSoldModalOpen(true);
    };

    const handleCloseSoldModal = () => {
        setIsSoldModalOpen(false);
        setSelectedItemForSale(null);
        setSalePrice('');
    };

    const handleConfirmSale = async () => {
        if (!selectedItemForSale || !salePrice) return;

        try {
            const api = (window as any).electronAPI;
            await api.markItemAsSold(selectedItemForSale.id, parseFloat(salePrice));
            await loadItems(); // Reload the list
            showToast({
                type: 'success',
                title: 'Item Marked Sold',
                description: `'${selectedItemForSale.model}' (S/N:${selectedItemForSale.serialNumber}) marked as sold for ${salePrice} $.`,
                duration: 5000
            });
            handleCloseSoldModal();
        } catch (error) {
            console.error('Error marking item as sold:', error);
            showToast({
                type: 'error',
                title: 'Error Marking Item Sold',
                description: `Failed to mark '${selectedItemForSale.model}' (S/N:${selectedItemForSale.serialNumber}) as sold.`,
                duration: 5000
            });
        }
    };

    // const handleMarkAsAvailable = async (item: StockItem) => {
    //     try {
    //         const api = (window as any).electronAPI;
    //         const response = window.confirm(`Mark as Available?\n\nAre you sure you want to mark ${item.model} (S/N: ${item.serialNumber}) as available again?\n\n𝘛𝘩𝘪𝘴 𝘸𝘪𝘭𝘭 𝘤𝘭𝘦𝘢𝘳 𝘪𝘵𝘴 𝘴𝘰𝘭𝘥 𝘱𝘳𝘪𝘤𝘦 𝘢𝘯𝘥 𝘥𝘢𝘵𝘦..`);
    //         if (!response) return;
    //         await api.markItemAsAvailable(item.id);
    //         showToast({
    //             type: 'success',
    //             title: 'Item Marked Available',
    //             description: `'${item.model}' (S/N:${item.serialNumber}) marked as available.`,
    //             duration: 5000
    //         });
    //         await loadItems(); // Reload the list
    //     } catch (error) {
    //         console.error('Error marking item as available:', error);
    //         showToast({
    //             type: 'error',
    //             title: 'Error Marking Item Available',
    //             description: `Failed to mark '${item.model}' (S/N:${item.serialNumber}) as available.`,
    //             duration: 5000
    //         });
    //     }
    // };

    const handleMarkAsAvailable = (item: StockItem) => {
        setConfirmationModal({
            isOpen: true,
            title: 'Mark as Available',
            message: `Are you sure you want to mark ${item.model} (S/N: ${item.serialNumber}) as available again?\n\nThis will clear its sold price and date..`,
            onConfirm: () => confirmMarkAsAvailable(item),
            type: 'warning',
            confirmText: 'Mark Available'
        });

        const confirmMarkAsAvailable = async (item: StockItem) => {
            try {
                const api = (window as any).electronAPI;
                await api.markItemAsAvailable(item.id);
                showToast({
                    type: 'success',
                    title: 'Item Marked Available',
                    description: `'${item.model}' (S/N:${item.serialNumber}) marked as available.`,
                    duration: 5000
                });
                await loadItems();
            } catch (error) {
                console.error('Error marking item as available:', error);
                showToast({
                    type: 'error',
                    title: 'Error Marking Item Available',
                    description: `Failed to mark '${item.model}' (S/N:${item.serialNumber}) as available.`,
                    duration: 5000
                });
            } finally {
                setConfirmationModal({ ...confirmationModal, isOpen: false });
            }
        };
    };

    // const handleDeleteItem = async (item: StockItem) => {
    //     const confirmDelete = window.confirm(
    //         `Are you sure you want to delete ${item.model} (S/N: ${item.serialNumber})? This action cannot be undone.`
    //     );

    //     if (confirmDelete) {
    //         try {
    //             const api = (window as any).electronAPI;
    //             await api.deleteItem(item.id);
    //             showToast({
    //                 type: 'success',
    //                 title: 'Stock Item Deleted',
    //                 description: `item '${item.model}' (S/N:${item.serialNumber}) deleted from stock.`,
    //                 duration: 5000
    //             });
    //             await loadItems(); // Reload the list
    //         } catch (error) {
    //             console.error('Error deleting item:', error);
    //             showToast({
    //                 type: 'error',
    //                 title: 'Error Deleting Item',
    //                 description: `Failed to delete item '${item.model}' (S/N:${item.serialNumber}).`,
    //                 duration: 5000
    //             });
    //         }
    //     }
    // };

    const handleDeleteItem = (item: StockItem) => {
        setConfirmationModal({
            isOpen: true,
            title: 'Delete Stock Item',
            message: `Are you sure you want to delete ${item.model} (S/N: ${item.serialNumber})? This action cannot be undone.`,
            onConfirm: () => confirmDeleteItem(item),
            type: 'danger',
            confirmText: 'Delete'
        });
    };

    const confirmDeleteItem = async (item: StockItem) => {
        try {
            const api = (window as any).electronAPI;
            await api.deleteItem(item.id);
            showToast({
                type: 'success',
                title: 'Stock Item Deleted',
                description: `item '${item.model}' (S/N:${item.serialNumber}) deleted from stock.`,
                duration: 5000
            });
            await loadItems();
        } catch (error) {
            console.error('Error deleting item:', error);
            showToast({
                type: 'error',
                title: 'Error Deleting Item',
                description: `Failed to delete item '${item.model}' (S/N:${item.serialNumber}).`,
                duration: 5000
            });
        } finally {
            setConfirmationModal({ ...confirmationModal, isOpen: false });
        }
    };

    // New handler for category selection
    const handleCategorySelect = (category: string) => {
        setSelectedCategory(category);
        setIsCategoryDropdownOpen(false);
    };

    // New handler for status selection
    const handleStatusSelect = (status: string) => {
        setSelectedStatus(status);
        setIsStatusDropdownOpen(false);
        loadItems();
    };

    const handleDateSelect = (date: string | null) => {
        // console.log(date);
        setSelectedDate(date);
        setIsDateCalendarOpen(false);
    };

    const handlePrintCurrentList = () => {
        const printWindow = window.open('', '_blank');
        const itemsToPrint = showAll ? filteredItems : paginatedItems;

        const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Used Stock List - ${new Date().toLocaleDateString()}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #4a5568; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f5f5f5; font-weight: bold; }
                .sold { background-color: #fed7d7; }
                .available { background-color: #c6f6d5; }
                .print-info { margin-bottom: 20px; color: #666; }
                @media print {
                    body { margin: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <h1>Used Stock List</h1>
            <div class="print-info">
                <p>Generated on: ${new Date().toLocaleString()}</p>
                <p>Total items: ${itemsToPrint.length}${!showAll ? ` (showing page ${currentPage} of ${totalPages})` : ''}</p>
                <p>Filters applied: Category: ${selectedCategory}, Status: ${selectedStatus}${selectedDate ? `, Date: ${new Date(selectedDate).toLocaleDateString()}` : ''}</p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Status</th>
                        <th>Model</th>
                        <th>Category</th>
                        <th>Power Rate</th>
                        <th>Serial Number</th>
                        <th>Date Added</th>
                        <th>Notes</th>
                        <th>Sale Info</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsToPrint.map(item => `
                        <tr class="${item.sold ? 'sold' : 'available'}">
                            <td>${item.sold ? 'Sold' : 'Available'}</td>
                            <td>${item.model}</td>
                            <td>${item.category}</td>
                            <td>${item.powerRate}</td>
                            <td>${item.serialNumber}</td>
                            <td>${item.dateAdded}</td>
                            <td>${item.notes || '---'}</td>
                            <td>${item.sold ? `$${item.salePrice?.toFixed(2)} on ${item.saleDate}` : '---'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </body>
        </html>
    `;

        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };

    const handleDateButtonClick = () => {
        setIsDateCalendarOpen(!isDateCalendarOpen);
        // Close other dropdowns
        setIsCategoryDropdownOpen(false);
        setIsStatusDropdownOpen(false);
    };

    // Convert StockItem to FormData for editing
    const itemToFormData = (item: StockItem): FormData => ({
        model: item.model,
        powerRate: item.powerRate,
        serialNumber: item.serialNumber,
        category: item.category === 'N/A' ? '' : item.category,
        notes: item.notes
    });

    const handleShowAllToggle = () => {
        setShowAll(!showAll);
        setCurrentPage(1); // Reset to first page when toggling
    };

    if (loading) {
        return (
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="loading">Loading stock items...</div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="error">{error}</div>
                <button onClick={loadItems}>Retry</button>
            </main>
        );
    }

    return (
        <main className="flex-grow container mx-auto px-4 py-8">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-[var(--light-green)] mb-6">
                    Used Stock Management
                </h1>
                <div className="shrink-0 bg-gray-300 h-[1px] w-full mb-8"></div>

                <div className="space-y-6">
                    <div className="rounded-lg border shadow-sm">
                        <div className="flex flex-col space-y-1.5 p-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div className="text-2xl font-semibold leading-none tracking-tight">
                                    Used Stock List ({showAll ? filteredItems.length : `${paginatedItems.length} of ${filteredItems.length}`})
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                    <button
                                        className="flex items-center bg-gray-100 space-x-2 px-4 py-2 rounded-lg hover:bg-[var(--orange)] hover:text-white transition-colors"
                                        onClick={handleShowAllToggle}
                                    >
                                        {showAll ? (
                                            <EyeOff className="mr-2 h-4 w-4" />
                                        ) : (
                                            <Eye className="mr-2 h-4 w-4" />
                                        )}
                                        {showAll ? 'Show Paginated' : 'Show All'}
                                    </button>
                                    <button
                                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus:ring-2 focus:ring-[var(--light-green)] disabled:pointer-events-none disabled:opacity-50 bg-[var(--light-green)] text-white hover:bg-[var(--light-green-2)] h-10 px-4 py-2"
                                        onClick={handleAddNewItem}
                                    >
                                        <CirclePlus className="mr-2" />
                                        Add New Stock Item
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 pt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-4 items-end">
                                {/* Search Input */}
                                <div className="relative flex-grow md:col-span-1 lg:col-span-1">
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 sr-only" htmlFor="stockSearch">
                                        Search by model, S/N, category, notes...
                                    </label>
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        className="flex h-10 w-full rounded-md border px-3 py-2 file:border-0 file:text-sm file:font-medium placeholder:text-[var(--light-green-2)] focus-visible:outline-none focus:ring-2 focus:ring-[var(--light-green)] bg-gray-100 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10"
                                        id="stockSearch"
                                        placeholder="Search by model, S/N, category, notes..."
                                        type="search"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>


                                {/* Date Filter - Updated */}
                                <div className="relative flex items-center gap-2 md:col-span-1 lg:col-span-1">
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 sr-only" htmlFor="stockDateFilter">
                                        Pick a date added
                                    </label>
                                    <button
                                        className={`flex items-center w-full space-x-2 px-3 py-2 border rounded-lg transition-colors ${selectedDate
                                            ? 'bg-green-50 border-[var(--light-green-2)] text-[var(--light-green)]'
                                            : 'bg-gray-100 hover:bg-[var(--orange)] hover:text-white'
                                            }`}
                                        onClick={handleDateButtonClick}
                                    >
                                        <Calendar className="h-4 w-4" />
                                        <span className="text-sm whitespace-nowrap">
                                            {selectedDate
                                                ? new Date(selectedDate).toLocaleDateString('en-US', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })
                                                : 'Pick a date added'}

                                        </span>
                                    </button>

                                    {/* Calendar Component */}
                                    <DateCalendar
                                        isOpen={isDateCalendarOpen}
                                        onClose={() => setIsDateCalendarOpen(false)}
                                        onDateSelect={handleDateSelect}
                                        selectedDate={selectedDate}
                                    />
                                </div>


                                {/* Category Filter */}
                                <div className="relative md:col-span-1 lg:col-span-1">
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 sr-only" htmlFor="stockCategoryFilter">
                                        Filter by Category
                                    </label>
                                    <button
                                        className="flex h-10 w-full items-center bg-gray-100 justify-between rounded-md border focus:ring-2 focus:ring-[var(--light-green)] px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                        onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                                    >
                                        <span>{selectedCategory}</span>
                                        <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isCategoryDropdownOpen && (
                                        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                                            {categoryOptions.map((category) => (
                                                <button
                                                    key={category}
                                                    className="flex items-center justify-between w-full text-left px-3 py-2 text-sm hover:bg-[var(--orange)] hover:text-white first:rounded-t-md last:rounded-b-md"
                                                    onClick={() => handleCategorySelect(category)}
                                                >
                                                    {category}
                                                    {selectedCategory === category && (
                                                        <Check className="w-4 h-4 text-[var(--light-green)]" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Status Filter */}
                                <div className="relative md:col-span-1 lg:col-span-1">
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 sr-only" htmlFor="stockSoldStatusFilter">
                                        Filter by Sale Status
                                    </label>
                                    <button
                                        onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                                        className="flex h-10 w-full bg-gray-100 items-center justify-between rounded-md border focus:ring-2 focus:ring-[var(--light-green)] px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50">
                                        <span>{selectedStatus}</span>
                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isStatusDropdownOpen && (
                                        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                                            {statusOptions.map((status) => (
                                                <button
                                                    key={status}
                                                    className="flex items-center justify-between w-full text-left px-3 py-2 text-sm hover:bg-[var(--orange)] hover:text-white first:rounded-t-md last:rounded-b-md"
                                                    onClick={() => handleStatusSelect(status)}
                                                >
                                                    {status}
                                                    {selectedStatus === status && (
                                                        <Check className="w-4 h-4 text-[var(--light-green)]" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Print Button */}
                                <button
                                    className="flex items-center border space-x-2 pl-12 py-2 rounded-lg hover:bg-[var(--orange)] hover:text-white bg-gray-100 transition-colors"
                                    onClick={handlePrintCurrentList}
                                >
                                    <Printer className="mr-2 h-4 w-4" />
                                    Print Current List
                                </button>
                            </div>

                            {/* Stock Table */}
                            <div id="usedStockDisplayArea">
                                <div className="relative w-full overflow-auto">
                                    <table className="w-full caption-bottom text-sm">
                                        <thead className="[&_tr]:border-b">
                                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Model</th>
                                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Category</th>
                                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Power Rate</th>
                                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Serial Number</th>
                                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date Added</th>
                                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Notes</th>
                                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="[&_tr:last-child]:border-0">
                                            {paginatedItems.map((item) => (
                                                <tr
                                                    key={item.id}
                                                    className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${item.sold ? 'bg-muted/50 opacity-70' : ''}`}
                                                >
                                                    <td className="p-4 align-middle">
                                                        {item.sold ? (
                                                            <div>
                                                                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-[var(--red)] text-white hover:bg-[var(--red)]/80 whitespace-nowrap">
                                                                    <Archive className="mr-1.5" />
                                                                    Sold
                                                                </div>
                                                                <div className="text-xs text-muted-foreground mt-1">
                                                                    @ ${item.salePrice?.toFixed(2)} on {item.saleDate}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 whitespace-nowrap bg-green-100 text-green-700 border-green-300 hover:bg-green-200">
                                                                <CircleCheck className="mr-1.5" />
                                                                Available
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-4 align-middle font-medium">{item.model}</td>
                                                    <td className="p-4 align-middle">{item.category}</td>
                                                    <td className="p-4 align-middle">{item.powerRate}</td>
                                                    <td className="p-4 align-middle">{item.serialNumber}</td>
                                                    <td className="p-4 align-middle">{item.dateAdded}</td>
                                                    <td className="p-4 align-middle max-w-[150px] truncate" title={item.notes}>
                                                        {item.notes || '---'}
                                                    </td>
                                                    <td className="p-4 align-middle text-right space-x-1">
                                                        {item.sold ? (
                                                            <>
                                                                <button
                                                                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-[var(--orange)] hover:text-white h-10 w-10"
                                                                    title="Mark as Available"
                                                                    onClick={() => handleMarkAsAvailable(item)}
                                                                >
                                                                    <Undo className="h-4 w-4 text-blue-600" />
                                                                </button>
                                                                <button
                                                                    className="inline-flex items-center ${} justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-[var(--orange)] hover:text-white h-10 w-10"
                                                                    disabled={item.sold}
                                                                    title="Edit"
                                                                    onClick={() => handleEditItem(item)}
                                                                >
                                                                    <PenLine className="h-4 w-4" />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-[var(--orange)] hover:text-white h-10 w-10"
                                                                    title="Mark as Sold"
                                                                    onClick={() => handleMarkAsSold(item)}
                                                                >
                                                                    <DollarSign className="h-4 w-4 text-green-600" />
                                                                </button>
                                                                <button
                                                                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-[var(--orange)] hover:text-white h-10 w-10"
                                                                    title="Edit"
                                                                    onClick={() => handleEditItem(item)}
                                                                >
                                                                    <PenLine className="h-4 w-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                        <button
                                                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-[var(--orange)] h-10 w-10 text-[var(--red)] hover:text-[var(--red)]/90"
                                                            title="Delete"
                                                            onClick={() => handleDeleteItem(item)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {!showAll && totalPages > 1 && (
                                        <div className="flex items-center justify-between px-4 py-3 border-t">
                                            <div className="text-sm text-gray-700">
                                                Showing {startIndex + 1} to {Math.min(endIndex, filteredItems.length)} of {filteredItems.length} results
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                    disabled={currentPage === 1}
                                                    className="px-3 py-1 text-sm border rounded bg-gray-100 hover:text-white hover:bg-[var(--orange)] disabled:opacity-50 transition-colors duration-150 disabled:cursor-not-allowed"
                                                >
                                                    Previous
                                                </button>
                                                <span className="text-sm text-gray-700">
                                                    Page {currentPage} of {totalPages}
                                                </span>
                                                <button
                                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                    disabled={currentPage === totalPages}
                                                    className="px-3 py-1 text-sm border rounded bg-gray-100 hover:text-white hover:bg-[var(--orange)] disabled:opacity-50 transition-colors duration-150 disabled:cursor-not-allowed"
                                                >
                                                    Next
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Back Button */}
                <button
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-[var(--light-green)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-none hover:text-white fixed top-6 left-6 z-50 h-14 w-14 rounded-full shadow-lg bg-white hover:bg-[var(--light-green)] text-[var(--light-gray)]"
                    title="Go back to previous page"
                    onClick={() => navigate('/')}
                >
                    <ArrowLeft className="h-7 w-7" />
                    <span className="sr-only">Go back to previous page</span>
                </button>
            </div>

            {/* Click outside to close dropdown */}
            {isCategoryDropdownOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsCategoryDropdownOpen(false)}
                />
            )}

            {/* Add New Item Modal */}
            <AddNewItem
                isOpen={isAddModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSubmitNewItem}
            />

            {/* Edit Item Modal */}
            {isEditModalOpen && selectedItemForEdit && (
                <AddNewItem
                    isOpen={isEditModalOpen}
                    onClose={handleCloseEditModal}
                    onSubmit={handleSubmitEditItem}
                    initialData={itemToFormData(selectedItemForEdit)}
                    title="Edit Stock Item"
                    submitButtonText="Update Stock Item"
                />
            )}

            {/* Mark as Sold Modal */}
            {isSoldModalOpen && selectedItemForSale && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={handleCloseSoldModal}
                    ></div>

                    {/* Modal */}
                    <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                        {/* Close Button */}
                        <button
                            onClick={handleCloseSoldModal}
                            className="absolute right-4 top-4 rounded-full opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[var(--light-green)] focus:border-transparent disabled:pointer-events-none"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        {/* Modal Content */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Mark '{selectedItemForSale.model}' as Sold
                            </h3>

                            <p className="text-sm text-[var(--light-green-2)]">
                                Enter the price for which the item (S/N: {selectedItemForSale.serialNumber}) was sold.
                            </p>

                            <div className="space-y-2">
                                <label htmlFor="salePrice" className="block text-sm font-medium text-gray-700">
                                    Sold Price (USD)
                                </label>
                                <input
                                    id="salePrice"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    value={salePrice}
                                    onChange={(e) => setSalePrice(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--light-green)] focus:border-transparent"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    onClick={handleCloseSoldModal}
                                    className="flex items-center space-x-2 px-12 border py-2 rounded-lg hover:bg-[var(--orange)] hover:text-white bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmSale}
                                    disabled={!salePrice || parseFloat(salePrice) <= 0}
                                    className="px-4 py-2 text-sm font-medium text-white bg-[var(--light-green)] hover:bg-[var(--light-green-2)] disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md transition-colors"
                                >
                                    Confirm Sale
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <ConfirmationModal
                isOpen={confirmationModal.isOpen}
                title={confirmationModal.title}
                message={confirmationModal.message}
                onConfirm={confirmationModal.onConfirm}
                onCancel={() => setConfirmationModal({ ...confirmationModal, isOpen: false })}
                type={confirmationModal.type}
                confirmText={confirmationModal.confirmText}
            />
            <ToastContainer toasts={toasts} onHideToast={hideToast} />
        </main>
    );
};

export default UsedStock;
