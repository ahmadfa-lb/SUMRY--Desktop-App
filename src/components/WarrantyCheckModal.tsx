import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ShieldQuestion } from 'lucide-react';
import useToast from '../toast/useToast';
import ToastContainer from '../toast/ToastContainer';

interface WarrantyCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WarrantyCheckModal: React.FC<WarrantyCheckModalProps> = ({ isOpen, onClose }) => {
  const [serialNumber, setSerialNumber] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const { toasts, showToast, hideToast } = useToast();


  const handleCheckWarranty = async () => {
    if (!serialNumber.trim()) {
      showToast({
        type: 'error',
        title: 'Serial Number Required',
        description: `Please enter a serial number`,
      });
      return;
    }

    setIsChecking(true);
    try {
      const warrantyUrl = `https://sumrylebanon.com/certificate.php?serial_number=${serialNumber.trim()}`;
      const result = await (window as any).electronAPI.openExternal(warrantyUrl);

      if (result.success) {
        onClose();
        setSerialNumber('');
      } else {
        showToast({
          type: 'error',
          title: 'Warranty Check Failed',
          description: `Failed to check warranty for S/N ${serialNumber}: ${result.error || 'Unknown error'}`,
        });
      }
    } catch (error) {
      console.error('Error opening warranty page:', error);
      showToast({
        type: 'error',
        title: 'Warranty Check Failed',
        description: `Failed to check warranty for S/N ${serialNumber}: ${error || 'Unknown error'}`,
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleClose = () => {
    setSerialNumber('');
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCheckWarranty();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <ShieldQuestion className="w-5 h-5 text-[var(--orange)]" />
            <h2 className="text-lg font-semibold text-gray-900">Check Warranty by Serial Number</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors focus:ring-2 focus:ring-[var(--light-green)] rounded-full"
            disabled={isChecking}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-[var(--light-green-2)] mb-4">
            Enter the serial number to check its warranty status on your provider's website.
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700 mb-2">
                S/N
              </label>
              <input
                id="serialNumber"
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="710082202407140615"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--light-green)] focus:border-transparent"
                disabled={isChecking}
                autoFocus
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50 rounded-b-lg">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-[var(--orange)] hover:text-white focus:outline-none focus:ring-2 focus:ring-[var(--orange)] transition-colors"
            disabled={isChecking}
          >
            Cancel
          </button>
          <button
            onClick={handleCheckWarranty}
            disabled={isChecking || !serialNumber.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-[var(--light-green)] hover:bg-[var(--light-green-2)] border border-transparent rounded-md hover:bg-[var(--light-green)]/90 focus:outline-none focus:ring-2 focus:ring-[var(--orange)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isChecking ? 'Checking...' : 'Check Warranty'}
          </button>
        </div>
      </div>
      <ToastContainer toasts={toasts} onHideToast={hideToast} />
    </div>,
    document.body
  );
};

export default WarrantyCheckModal;