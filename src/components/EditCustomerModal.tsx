import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

const EditCustomerModal = ({ isOpen, onClose, customer, onSave, onCancel }) => {
    const [customerName, setCustomerName] = useState('');
    const [customerContact, setCustomerContact] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (customer) {
            setCustomerName(customer.name || '');
            setCustomerContact(customer.contact || '');
        }
    }, [customer]);

    const handleSave = () => {
        // Clear any previous errors
        setError('');
        
        if (!customerName.trim()) {
            setError('Customer name is required');
            return;
        }

        if (customerName.trim().length > 40) {
            setError('Customer name must be 40 characters or less');
            return;
        }

        if (!customerContact.trim()) {
            setError('Contact (Phone/Email) is required');
            return;
        }

        if (customerContact.trim().length > 50) {
            setError('Contact must be 50 characters or less');
            return;
        }

        onSave({
            name: customerName.trim(),
            contact: customerContact.trim()
        });
    };

    const handleCancel = () => {
        // Reset form to original values and clear errors
        if (customer) {
            setCustomerName(customer.name || '');
            setCustomerContact(customer.contact || '');
        }
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/50" 
                onClick={handleCancel}
            ></div>
            
            {/* Modal */}
            <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Edit Customer Details</h2>
                    <button
                        onClick={handleCancel}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Close modal"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {/* Form */}
                <div className="space-y-4">
                    {/* Customer Name Field */}
                    <div>
                        <label 
                            htmlFor="customerName" 
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Customer Name *
                        </label>
                        <input
                            id="customerName"
                            type="text"
                            value={customerName}
                            onChange={(e) => {
                                setCustomerName(e.target.value);
                                // Clear error when user starts typing
                                if (error) setError('');
                            }}
                            className={`flex h-10 w-full rounded-md border px-3 py-2 text-base file:border-0 file:text-sm file:font-medium placeholder:text-[var(--light-green-2)] focus-visible:outline-none focus:ring-2 focus:ring-[var(--light-green)] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${
                                error && error.includes('Customer name') ? 'border-red-300 bg-red-50' : 'border-input bg-white'
                            }`}
                            placeholder="Enter customer name"
                            maxLength={40}
                        />
                        <div className="flex justify-between items-center mt-1">
                            <span className={`text-xs ${
                                customerName.length > 40 ? 'text-red-500' : 
                                customerName.length > 35 ? 'text-orange-500' : 'text-gray-500'
                            }`}>
                                {customerName.length}/40 characters
                            </span>
                        </div>
                    </div>

                    {/* Contact Field */}
                    <div>
                        <label 
                            htmlFor="customerContact" 
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Contact (Phone/Email) *
                        </label>
                        <input
                            id="customerContact"
                            type="text"
                            value={customerContact}
                            onChange={(e) => {
                                setCustomerContact(e.target.value);
                                // Clear error when user starts typing
                                if (error) setError('');
                            }}
                            className={`flex h-10 w-full rounded-md border px-3 py-2 text-base file:border-0 file:text-sm file:font-medium placeholder:text-[var(--light-green-2)] focus-visible:outline-none focus:ring-2 focus:ring-[var(--light-green)] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${
                                error && error.includes('Contact') ? 'border-red-300 bg-red-50' : 'border-input bg-white'
                            }`}
                            placeholder="Enter phone number or email"
                            maxLength={50}
                        />
                        <div className="flex justify-between items-center mt-1">
                            <span className={`text-xs ${
                                customerContact.length > 50 ? 'text-red-500' : 
                                customerContact.length > 45 ? 'text-orange-500' : 'text-gray-500'
                            }`}>
                                {customerContact.length}/50 characters
                            </span>
                        </div>
                    </div>

                    {/* Warning Message */}
                    <div className="bg-green-50 border border-green-200 rounded-md p-3">
                        <p className="text-sm text-[var(--light-green)]">
                            <strong>Warning:</strong> Editing the contact number is allowed, but ensure the new number is 
                            unique. This will also update the contact for past repairs associated with the old 
                            number. It's generally recommended to create a new customer entry if the 
                            contact has significantly changed.
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 mt-6">
                    <button
                        onClick={handleCancel}
                        className="inline-flex focus:ring-2 focus:ring-[var(--light-green)] items-center justify-center gap-2 whitespace-nowrap text-sm font-medium  transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 border hover:bg-[var(--orange)] hover:text-white bg-gray-100 h-9 rounded-md px-3"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="inline-flex focus:ring-2 focus:ring-[var(--light-green)] items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 bg-[var(--light-green)] text-white hover:bg-[var(--light-green-2)] h-10 px-4 py-2"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditCustomerModal;