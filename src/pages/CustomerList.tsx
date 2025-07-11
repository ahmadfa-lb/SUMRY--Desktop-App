import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Printer, PenLine, Trash2, UserX } from 'lucide-react';
import EditCustomerModal from '../components/EditCustomerModal';
import useToast from '../toast/useToast';
import ToastContainer from '../toast/ToastContainer';

interface Customer {
    customer_name: string;
    contact: string | null;
    repair_count: number;
    first_repair_date: string;
    last_repair_date: string;
}

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel
}) => {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-[99998]"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-[99999] p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {title}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {message}
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={onCancel}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const CustomerList: React.FC = () => {
    const navigate = useNavigate();
    const { toasts, showToast, hideToast } = useToast();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
    const itemsPerPage = 8;

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        try {
            const api = (window as any).electronAPI;
            const customerData = await api.getAllCustomers();
            setCustomers(customerData);
        } catch (error) {
            console.error('Error loading customers:', error);
            showToast({
                type: 'error',
                title: 'Error Loading Customers',
                description: `Error loading customers: ${error}`,
            });
        }
    };

    const filteredCustomers = customers.filter(customer =>
        customer.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.contact && customer.contact.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    // console.log(filteredCustomers);

    // Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCustomers = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    const handleEditCustomer = (customer: Customer) => {
        setSelectedCustomer(customer);
        setIsEditModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setSelectedCustomer(null);
    };

    const handleSaveCustomer = async (updatedCustomer: { name: string; contact: string }) => {
        if (!selectedCustomer) return;

        try {
            const api = (window as any).electronAPI;
            await api.updateCustomerInfo(
                selectedCustomer.customer_name,
                selectedCustomer.contact || '',
                updatedCustomer.name,
                updatedCustomer.contact
            );

            showToast({
                type: 'success',
                title: 'Customer Updated',
                description: `Customer updated successfully`,
            });
            loadCustomers();
            handleCloseModal();
        } catch (error) {
            console.error('Error updating customer:', error);
            showToast({
                type: 'error',
                title: 'Customer Update Failed',
                description: `Customer update failed: ${error}`,
            });
        }
    };

    const handleDeleteCustomer = async (customer: Customer) => {
        try {
            const api = (window as any).electronAPI;
            const canDeleteResponse = await api.canDeleteCustomer(customer.customer_name, customer.contact || '');

            if (!canDeleteResponse.canDelete) {
                showToast({
                    type: 'error',
                    title: 'Cannot Delete Customer',
                    description: `Cannot delete customer with active repairs`,
                });
                return;
            }

            // Show confirmation modal instead of window.confirm
            setCustomerToDelete(customer);
            setIsConfirmModalOpen(true);
        } catch (error) {
            console.error('Error checking if customer can be deleted:', error);
            showToast({
                type: 'error',
                title: 'Error Checking Customer Status',
                description: `Error checking if customer can be deleted: ${error}`,
            });
        }
    };

    const confirmDeleteCustomer = async () => {
        if (!customerToDelete) return;

        try {
            const api = (window as any).electronAPI;
            const response = await api.canDeleteCustomer(customerToDelete.customer_name, customerToDelete.contact || '');
            // console.log(response);
            if (!response.canDelete) {
                showToast({
                    type: 'error',
                    title: 'Cannot Delete Customer',
                    description: `Cannot delete customer with active repairs`,
                });
                return;
            }
            await api.deleteCustomer(customerToDelete.customer_name, customerToDelete.contact || '');

            showToast({
                type: 'success',
                title: 'Customer Deleted',
                description: `Customer deleted successfully`,
            });
            loadCustomers();
        } catch (error) {
            console.error('Error deleting customer:', error);
            showToast({
                type: 'error',
                title: 'Customer Delete Failed',
                description: `Customer delete failed: ${error}`,
            });
        } finally {
            setIsConfirmModalOpen(false);
            setCustomerToDelete(null);
        }
    };

    const cancelDeleteCustomer = () => {
        setIsConfirmModalOpen(false);
        setCustomerToDelete(null);
    };

    const handlePrintCustomerList = () => {
        // Create a new window for printing
        const printWindow = window.open('', '_blank');

        if (!printWindow) {
            showToast({
                type: 'error',
                title: 'Print Failed',
                description: `Please allow popups to print the customer list`,
            });
            return;
        }

        const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Customer List</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 20px; 
                    color: #333;
                }
                h1 { 
                    color: #2d5a3d; 
                    text-align: center; 
                    margin-bottom: 20px; 
                }
                .print-date {
                    text-align: center;
                    margin-bottom: 30px;
                    color: #666;
                    font-size: 14px;
                }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-top: 20px; 
                }
                th, td { 
                    border: 1px solid #ddd; 
                    padding: 12px; 
                    text-align: left; 
                }
                th { 
                    background-color: #f5f5f5; 
                    font-weight: bold; 
                    color: #2d5a3d;
                }
                tr:nth-child(even) { 
                    background-color: #f9f9f9; 
                }
                .total-count {
                    margin-top: 20px;
                    text-align: right;
                    font-weight: bold;
                    color: #2d5a3d;
                }
                @media print {
                    body { margin: 0; }
                    h1 { margin-top: 0; }
                }
            </style>
        </head>
        <body>
            <h1>Customer List</h1>
            <div class="print-date">Printed on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</div>

            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Contact</th>
                        <th>Total Repairs</th>
                        <th>First Repair</th>
                        <th>Last Repair</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredCustomers.map(customer => `
                        <tr>
                            <td>${customer.customer_name}</td>
                            <td>${customer.contact || 'N/A'}</td>
                            <td>${customer.repair_count}</td>
                            <td>${formatDate(customer.first_repair_date)}</td>
                            <td>${formatDate(customer.last_repair_date)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="total-count">
                Total Customers: ${filteredCustomers.length}
            </div>
        </body>
        </html>
    `;

        printWindow.document.write(printContent);
        printWindow.document.close();

        // Wait for content to load, then print and close
        printWindow.onload = () => {
            printWindow.print();
            printWindow.close();
        };
    };

    // Reset to first page when search term changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
                    <p className="text-gray-600 mt-2">View and manage your customer database</p>
                </div>

                <div className="shrink-0 bg-gray-300 h-[1px] w-full mb-8"></div>
                <div className="space-y-6">
                    {/* Search Card */}
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                        <div className="flex flex-col space-y-1.5 p-6">
                            <div className='flex justify-between items-center'>
                                <div className="text-2xl font-semibold leading-none tracking-tight">Search Customers</div>
                                <button onClick={loadCustomers} className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium  transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border hover:bg-[var(--orange)] hover:text-white bg-gray-100 h-9 rounded-md px-3">
                                    Refresh
                                </button>
                            </div>
                            <div className="text-sm text-[var(--light-green)]">
                                You have {customers.length} saved customers.
                            </div>
                        </div>
                        <div className="p-6 pt-0">
                            <div className="relative search-input-print-remove">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--light-green)]" />
                                <input
                                    className="flex h-10 rounded-md border px-3 py-2 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[var(--light-green-2)] placeholder:text-[var(--light-green-2)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50  focus:ring-2 focus:ring-[var(--light-green)] md:text-sm pl-10 w-full"
                                    placeholder="Search by name or contact..."
                                    type="search"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Customer List Card */}
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm" id="customerListPrintArea">
                        <div className="flex flex-col space-y-1.5 p-6 print-header">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <div className="text-2xl font-semibold leading-none tracking-tight print-title">
                                    Saved Customers ({filteredCustomers.length}) {filteredCustomers.length > itemsPerPage ? `- Page ${currentPage} of ${totalPages}` : ''}
                                </div>
                                <button
                                    onClick={handlePrintCustomerList}
                                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium  transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border hover:bg-[var(--orange)] hover:text-white bg-gray-100 h-9 rounded-md px-3"
                                >
                                    <Printer className="mr-2 h-4 w-4" />
                                    Print Customer List
                                </button>
                            </div>
                        </div>

                        <div className="p-6 pt-0">
                            <div className="relative overflow-hidden h-[auto] max-h-[80vh] w-full print:max-h-none print:overflow-visible">
                                <div className="h-full w-full rounded-[inherit] overflow-hidden overflow-y-auto">
                                    <div className="min-w-full">
                                        <div className="relative w-full h-full overflow-y-auto">
                                            <table className="w-full caption-bottom text-sm">
                                                <thead className="[&_tr]:border-b">
                                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                        <th className="h-12 px-4 text-left align-middle font-medium text-[var(--light-green)]">Name</th>
                                                        <th className="h-12 px-4 text-left align-middle font-medium text-[var(--light-green)]">Contact</th>
                                                        <th className="h-12 px-4 text-left align-middle font-medium text-[var(--light-green)]">Total Repairs</th>
                                                        <th className="h-12 px-4 text-left align-middle font-medium text-[var(--light-green)]">First Repair</th>
                                                        <th className="h-12 px-4 text-left align-middle font-medium text-[var(--light-green)]">Last Repair</th>
                                                        <th className="h-12 px-4 align-middle font-medium text-[var(--light-green)] text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="[&_tr:last-child]:border-0">
                                                    {currentCustomers.map((customer, index) => (
                                                        <tr key={`${customer.customer_name}-${customer.contact}-${index}`} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                            <td className="p-4 align-middle">{customer.customer_name}</td>
                                                            <td className="p-4 align-middle">{customer.contact || 'N/A'}</td>
                                                            <td className="p-4 align-middle">{customer.repair_count}</td>
                                                            <td className="p-4 align-middle">{formatDate(customer.first_repair_date)}</td>
                                                            <td className="p-4 align-middle">{formatDate(customer.last_repair_date)}</td>
                                                            <td className="p-4 align-middle text-right space-x-2 print-actions-remove">
                                                                <button
                                                                    onClick={() => handleEditCustomer(customer)}
                                                                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium  transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border hover:bg-[var(--orange)] hover:text-white bg-gray-100 h-9 rounded-md px-3"
                                                                >
                                                                    <PenLine className="mr-1 h-3.5 w-3.5" />
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteCustomer(customer)}
                                                                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[var(--red)] text-white hover:bg-red-500/90 h-9 rounded-md px-3"
                                                                >
                                                                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                                                                    Delete
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}

                                                    {currentCustomers?.length === 0 && filteredCustomers.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={6}>
                                                                <div className="flex flex-col items-center justify-center h-[300px]">
                                                                    <UserX className="h-12 w-12 text-[var(--light-green)] mb-2" />
                                                                    <div className="text-center text-lg font-medium">No Customers Found</div>
                                                                    <div className="text-center text-[var(--light-green-2)]">
                                                                        No saved customers match your search.
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ) : null}

                                                </tbody>
                                            </table>

                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {filteredCustomers.length > itemsPerPage && (
                    <div className="flex items-center justify-between px-2 py-4">
                        <div className="text-sm text-[var(--light-green-2)]">
                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCustomers.length)} of {filteredCustomers.length} customers
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none border hover:bg-[var(--orange)] hover:text-white bg-gray-100 h-9 rounded-md px-3 disabled:opacity-50"
                            >
                                Previous
                            </button>

                            <div className="flex items-center space-x-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 w-9 rounded-md ${currentPage === page
                                            ? 'bg-[var(--light-green)] text-white'
                                            : 'border hover:bg-[var(--orange)] hover:text-white bg-gray-100'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border hover:bg-[var(--orange)] hover:text-white bg-gray-100 h-9 rounded-md px-3 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {isEditModalOpen && selectedCustomer && (
                <EditCustomerModal
                    isOpen={isEditModalOpen}
                    customer={{
                        name: selectedCustomer.customer_name,
                        contact: selectedCustomer.contact || ''
                    }}
                    onClose={handleCloseModal}
                    onSave={handleSaveCustomer}
                    onCancel={() => {
                        setIsEditModalOpen(false);
                        setSelectedCustomer(null);
                    }}
                />
            )}

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                title="Delete Customer"
                message={`Are you sure you want to delete ${customerToDelete?.customer_name}? This action cannot be undone.`}
                onConfirm={confirmDeleteCustomer}
                onCancel={cancelDeleteCustomer}
            />

            {/* Back Button */}
            <button
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-[var(--light-green)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-none hover:text-white fixed top-6 left-6 z-50 h-14 w-14 rounded-full shadow-lg bg-white hover:bg-[var(--light-green)] text-[var(--light-gray)]"
                title="Go back to previous page"
                onClick={() => navigate('/')}
            >
                <ArrowLeft className="h-7 w-7" />
                <span className="sr-only">Go back to previous page</span>
            </button>
            <ToastContainer toasts={toasts} onHideToast={hideToast} />
        </div>
    );
};

export default CustomerList;