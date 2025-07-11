import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MessageSquareText, X, Save, RotateCcw, AlertTriangle } from 'lucide-react';
import useToast from '../../toast/useToast';
import ToastContainer from '../../toast/ToastContainer';

interface WhatsAppTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WhatsAppTemplate {
  id: number;
  status: string;
  template: string;
  created_at: string;
  updated_at: string;
}

const WhatsAppTemplatesModal: React.FC<WhatsAppTemplatesModalProps> = ({ isOpen, onClose }) => {
  const [templates, setTemplates] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const { toasts, showToast, hideToast } = useToast();

  // Load templates when modal opens
  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const api = (window as any).electronAPI;
      const templateData: WhatsAppTemplate[] = await api.getAllWhatsAppTemplates();
      // console.log(templateData);
      const templatesMap: { [key: string]: string } = {};
      templateData.forEach(template => {
        templatesMap[template.status] = template.template;
      });
      
      setTemplates(templatesMap);
    } catch (err) {
      console.error('Error loading WhatsApp templates:', err);
      setError('Failed to load templates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (status: string, value: string) => {
    setTemplates(prev => ({
      ...prev,
      [status]: value
    }));
  };

  const handleSaveTemplates = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const api = (window as any).electronAPI;
      const updatedCount = await api.updateAllWhatsAppTemplates(templates);
      
      if (updatedCount > 0) {
        // console.log(`Successfully updated ${updatedCount} WhatsApp templates`);
        showToast({
          type: 'success',
          title: 'Templates Saved',
          description: 'WhatsApp templates have been saved successfully.',
        });
        onClose();
      } else {
        setError('No templates were updated. Please check your changes.');
      }
    } catch (err) {
      console.error('Error saving WhatsApp templates:', err);
      setError('Failed to save templates. Please try again.');
      showToast({
        type: 'error',
        title: 'Save Failed',
        description: 'Failed to save templates. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = async () => {
    if (!showResetConfirmation) {
      setShowResetConfirmation(true);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setShowResetConfirmation(false);
      
      const api = (window as any).electronAPI;
      await api.resetWhatsAppTemplatesToDefault();
      await loadTemplates(); // Reload templates after reset
      
      showToast({
        type: 'success',
        title: 'Templates Reset',
        description: 'WhatsApp templates have been reset to default successfully.',
      });
    } catch (err) {
      console.error('Error resetting WhatsApp templates:', err);
      setError('Failed to reset templates. Please try again.');
      showToast({
        type: 'error',
        title: 'Reset Failed',
        description: 'Failed to reset templates. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  const cancelReset = () => {
    setShowResetConfirmation(false);
  };

  if (!isOpen) return null;

  const statuses = [
    'Pending Diagnosis',
    'Awaiting Parts', 
    'In Progress',
    'Completed',
    'Awaiting Pickup',
    'Picked Up',
    'Cancelled'
  ];

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquareText className="w-5 h-5 text-[var(--light-green)]" />
            <h2 className="text-lg font-semibold text-gray-900">Customize WhatsApp Status Messages</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-full opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[var(--light-green)] focus:border-transparent disabled:pointer-events-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {showResetConfirmation && (
            <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <h3 className="font-medium text-orange-800">Confirm Reset</h3>
              </div>
              <p className="text-sm text-orange-700 mb-3">
                Are you sure you want to reset all templates to default? This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleResetToDefault}
                  disabled={saving}
                  className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded transition-colors disabled:opacity-50"
                >
                  {saving ? 'Resetting...' : 'Yes, Reset'}
                </button>
                <button
                  onClick={cancelReset}
                  disabled={saving}
                  className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          <p className="text-sm text-[var(--light-green)] mb-4">
            Set custom message templates for each repair status. These templates will be used when sending WhatsApp updates.
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-[var(--light-green)]">Loading templates...</div>
            </div>
          ) : (
            <>
              {/* Form Area */}
              <div className="space-y-4 mb-4">
                {statuses.map((status) => (
                  <div key={status}>
                    <label className="block text-sm font-medium text-[var(--light-gray)] mb-2">
                      {status}
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none placeholder:text-[var(--light-green)] focus:ring-2 focus:ring-[var(--light-green)] focus:border-[var(--light-green)] resize-none text-sm"
                      placeholder={`Enter custom message for ${status}...`}
                      rows={3}
                      value={templates[status] || ''}
                      onChange={(e) => handleTemplateChange(status, e.target.value)}
                      disabled={saving}
                    />
                  </div>
                ))}
              </div>

              {/* Placeholders Info */}
              <div className="text-xs text-gray-500 mb-6 p-3 bg-gray-50 rounded">
                <div className="font-medium mb-2">Available placeholders:</div>
                <div className="grid grid-cols-2 gap-2">
                  <code className="bg-white px-2 py-1 rounded text-xs">{'{'}{"customerName"}{'}'}</code>
                  <code className="bg-white px-2 py-1 rounded text-xs">{'{'}{"itemBrand"}{'}'}</code>
                  <code className="bg-white px-2 py-1 rounded text-xs">{'{'}{"itemModel"}{'}'}</code>
                  <code className="bg-white px-2 py-1 rounded text-xs">{'{'}{"serialNumber"}{'}'}</code>
                  <code className="bg-white px-2 py-1 rounded text-xs">{'{'}{"status"}{'}'}</code>
                  <code className="bg-white px-2 py-1 rounded text-xs">{'{'}{"repairId"}{'}'}</code>
                  <code className="bg-white px-2 py-1 rounded text-xs">{'{'}{"repairCost"}{'}'}</code>
                  <code className="bg-white px-2 py-1 rounded text-xs">{'{'}{"amountPaid"}{'}'}</code>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Fixed Footer with Action Buttons */}
        <div className="border-t border-gray-200 p-4 flex-shrink-0">
          {!loading && (
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={handleSaveTemplates}
                disabled={saving}
                className="flex-1 bg-[var(--light-green)] hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save WhatsApp Templates'}
              </button>
              
              <button
                type="button"
                onClick={handleResetToDefault}
                disabled={saving}
                className={`font-medium py-2.5 px-4 rounded-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  showResetConfirmation 
                    ? 'bg-gray-300 text-gray-600' 
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                {showResetConfirmation ? 'Confirm Reset' : 'Reset to Default'}
              </button>
            </div>
          )}
          
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="w-full bg-gray-100 hover:bg-[var(--orange)] hover:text-white text-[var(--light-gray)] font-medium py-2.5 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Close
          </button>
        </div>
      </div>
      <ToastContainer toasts={toasts} onHideToast={hideToast} />
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default WhatsAppTemplatesModal;