import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Send } from 'lucide-react';

interface EditWhatsAppMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (message: string) => void;
  initialMessage: string;
  customerName: string;
  phoneNumber: string;
}

const EditWhatsAppMessageModal: React.FC<EditWhatsAppMessageModalProps> = ({
  isOpen,
  onClose,
  onSend,
  initialMessage,
  customerName,
  phoneNumber
}) => {
  const [message, setMessage] = useState(initialMessage);
  const [sending, setSending] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setMessage(initialMessage);
    }
  }, [isOpen, initialMessage]);

  const handleSend = async () => {
    if (!message.trim()) return;
    
    setSending(true);
    try {
      await onSend(message);
      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleCancel = () => {
    setMessage(initialMessage);
    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">Edit WhatsApp Message</h2>
          <button
            type="button"
            onClick={handleCancel}
            disabled={sending}
            className="rounded-full opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[var(--light-green)] focus:border-transparent disabled:pointer-events-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-sm text-[var(--light-green-2)] mb-4">
            Review and edit the message before sending.
          </p>
          
          {/* Customer Info */}
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <div className="text-sm font-medium">Sending to:</div>
            <div className="text-sm">{customerName}</div>
            <div className="text-sm">{phoneNumber}</div>
          </div>

          {/* Message Editor */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Message
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--light-green)] focus:border-[var(--light-green)] resize-none text-sm"
              placeholder="Enter your message..."
              rows={8}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={sending}
            />
          </div>

          {/* Character count */}
          <div className="text-xs text-[var(--light-green-2)] mb-4">
            {message.length} characters
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex-shrink-0">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={sending}
              className="flex-1 bg-gray-100 border focus:outline-none hover:bg-[var(--orange)] focus:ring-2 focus:ring-[var(--light-green)] hover:text-white font-medium py-2.5 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || !message.trim()}
              className="flex bg-[var(--light-green)] focus:outline-none hover:bg-[var(--light-green-2)] text-white font-medium py-2.5 px-4 rounded-md items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {sending ? 'Sending...' : 'Send via WhatsApp'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default EditWhatsAppMessageModal;