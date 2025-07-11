import React, { useState, useEffect } from 'react';
import { Receipt, Share2, Settings2 } from 'lucide-react';
import { Repair } from '../../types/repair';
import WhatsAppTemplatesModal from '../header/WhatsappTemplatesModal';
import EditWhatsAppMessageModal from './EditWhatsAppMessageModal';
import ToastContainer from '../../toast/ToastContainer';
import useToast from '../../toast/useToast';

interface StatusUpdateCardProps {
  repair: Repair;
  onStatusUpdate: (newStatus: string, isLocked: boolean) => Promise<void>;
  isLocked?: boolean;
}

const StatusUpdateCard: React.FC<StatusUpdateCardProps> = ({ repair, onStatusUpdate, isLocked }) => {
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showEditMessageModal, setShowEditMessageModal] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<string>('');
  const [preparedMessage, setPreparedMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toasts, showToast, hideToast } = useToast();

  // Load the current template for the repair status
  useEffect(() => {
    loadCurrentTemplate();
  }, [repair.status]);

  const loadCurrentTemplate = async () => {
    try {
      const api = (window as any).electronAPI;
      const template = await api.getWhatsAppTemplateByStatus(repair.status);
      if (template) {
        setCurrentTemplate(template.template);
      }
    } catch (error) {
      console.error('Error loading WhatsApp template:', error);
    }
  };

  const handleCustomizeTemplates = () => {
    setShowWhatsAppModal(true);
  };

  // Add this helper function at the top of the component
  const mapStatusToTemplateFormat = (status: string): string => {
    const statusMap: { [key: string]: string } = {
      'pending-diagnosis': 'Pending Diagnosis',
      'awaiting-parts': 'Awaiting Parts',
      'in-progress': 'In Progress',
      'completed': 'Completed',
      'awaiting-pickup': 'Awaiting Pickup',
      'picked-up': 'Picked Up',
      'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
  };

  // Update the prepareWhatsAppMessage function
  const prepareWhatsAppMessage = async () => {
    if (!repair.contact) {
      showToast({
        type: 'error',
        title: 'No Contact',
        description: 'No contact number available for this customer.',
        duration: 5000
      });
      return;
    }

    try {
      setLoading(true);

      // Get the current template for this status
      const api = (window as any).electronAPI;
      const templateStatus = mapStatusToTemplateFormat(repair.status);
      const template = await api.getWhatsAppTemplateByStatus(templateStatus);

      if (!template) {
        showToast({
          type: 'error',
          title: 'No Template',
          description: 'No WhatsApp template found for this status. Please customize templates first.',
          duration: 5000
        });
        return;
      }

      // Replace placeholders in the template
      let message = template.template
        .replace(/{customerName}/g, repair.customer_name || 'Customer')
        .replace(/{itemBrand}/g, repair.item_brand || 'Item')
        .replace(/{itemModel}/g, repair.item_model || '')
        .replace(/{serialNumber}/g, repair.serial_number || 'N/A')
        .replace(/{status}/g, repair.status)
        .replace(/{repairId}/g, repair.id.toString())
        .replace(/{repairCost}/g, repair.repair_cost ? repair.repair_cost.toString() : '0')
        .replace(/{amountPaid}/g, repair.amount_paid ? repair.amount_paid.toString() : '0');

      setPreparedMessage(message);
      setShowEditMessageModal(true);

    } catch (error) {
      console.error('Error preparing WhatsApp message:', error);
      showToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to prepare WhatsApp message. Please try again.',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendWhatsApp = async (message: string) => {
    try {
      // Clean up the contact number (remove any non-digit characters except +)
      let phoneNumber = repair.contact.replace(/[^\d+]/g, '');

      // Encode the message for URL
      const encodedMessage = encodeURIComponent(message);

      // Create WhatsApp Web URL
      const whatsappUrl = `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;

      // Open WhatsApp Web in the system's default browser
      const api = (window as any).electronAPI;
      if (api.openExternal) {
        await api.openExternal(whatsappUrl);
      } else {
        window.open(whatsappUrl, '_blank');
      }

      showToast({
        type: 'success',
        title: 'WhatsApp Opened',
        description: 'WhatsApp opened with your message ready to send.',
        duration: 5000
      });

    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      showToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to open WhatsApp. Please try again.',
        duration: 5000
      });
      throw error;
    }
  };

  const handleModalClose = () => {
    setShowWhatsAppModal(false);
    loadCurrentTemplate();
  };

  return (
    <>
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Update Status
        </h3>
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Status
            </label>
            <select
              value={repair.status}
              disabled={isLocked}
              onChange={(e) => onStatusUpdate(e.target.value, isLocked)}
              className="flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm placeholder:text-[var(--light-gray)] focus:outline-none focus:ring-2 focus:ring-[var(--light-green)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="pending-diagnosis">Pending Diagnosis</option>
              <option value="awaiting-parts">Awaiting Parts</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="awaiting-pickup">Awaiting Pickup</option>
              <option value="picked-up">Picked Up</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <button
            onClick={prepareWhatsAppMessage}
            disabled={loading || !repair.contact || isLocked}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus:ring-2 focus:ring-[var(--light-green)] disabled:pointer-events-none disabled:opacity-50 bg-gray-100 border hover:text-white hover:bg-[var(--orange)] h-10 rounded-md px-4 w-full"
            title={repair.contact ? "Send WhatsApp Update" : "No contact number available"}
          >
            <Share2 className="h-4 w-4 mr-2" />
            {loading ? 'Preparing...' : 'Send WhatsApp Update'}
          </button>

          <button
            onClick={handleCustomizeTemplates}
            disabled={isLocked}
            className="inline-flex items-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus:ring-2 focus:ring-[var(--light-green)] disabled:pointer-events-none disabled:opacity-50 underline-offset-4 hover:underline rounded-md text-xs text-[var(--light-green)] p-0 justify-start h-auto hover:text-[var(--orange)] w-full"
            title="Customize WhatsApp message templates for all statuses"
          >
            <Settings2 className="h-4 w-4 mr-1.5" />
            Customize Message Templates
          </button>

          {/* Show current template preview if available */}
          {currentTemplate && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md">
              <div className="text-xs font-medium text-gray-600 mb-1">Current Template Preview:</div>
              <div className="text-xs text-gray-700 italic">
                {currentTemplate.length > 100
                  ? currentTemplate.substring(0, 100) + '...'
                  : currentTemplate
                }
              </div>
            </div>
          )}
        </div>
      </div>

      {/* WhatsApp Templates Modal */}
      <WhatsAppTemplatesModal
        isOpen={showWhatsAppModal}
        onClose={handleModalClose}
      />

      {/* Edit WhatsApp Message Modal */}
      <EditWhatsAppMessageModal
        isOpen={showEditMessageModal}
        onClose={() => setShowEditMessageModal(false)}
        onSend={handleSendWhatsApp}
        initialMessage={preparedMessage}
        customerName={repair.customer_name || 'Customer'}
        phoneNumber={repair.contact || ''}
      />

      <ToastContainer toasts={toasts} onHideToast={hideToast} />
    </>
  );
};

export default StatusUpdateCard;