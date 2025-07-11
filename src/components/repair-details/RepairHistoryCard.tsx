import React from 'react';
import { History, Share2, ArrowRight } from 'lucide-react';
import { Repair } from '../../types/repair';
import { useNavigate } from 'react-router-dom';
import useToast from '../../toast/useToast';
import ToastContainer from '../../toast/ToastContainer';

interface RepairHistoryCardProps {
  currentRepair: Repair;
  repairHistory: Repair[];
  formatDate: (dateString: string) => string;
  formatCost: (amount: number) => string;
  getStatusBadgeClasses: (status: string) => string;
}

const RepairHistoryCard: React.FC<RepairHistoryCardProps> = ({
  currentRepair,
  repairHistory,
  formatDate,
  formatCost,
  getStatusBadgeClasses
}) => {
  const navigate = useNavigate();
  const { toasts, showToast, hideToast } = useToast();


  const handleShareHistory = async () => {
    if (!currentRepair.contact) {
      showToast({
        type: 'error',
        title: 'No Contact Number',
        description: `No contact number available for this customer.`,
      });
      return;
    }

    // Generate the WhatsApp message
    let message = `Hello ${currentRepair.customer_name},\n\n`;
    message += `Here is the repair history for your ${currentRepair.item_brand}`;
    if (currentRepair.item_model) {
      message += `-${currentRepair.item_model}`;
    }
    message += ` (S/N: ${currentRepair.serial_number}):\n\n`;

    // Add current repair first
    const allRepairs = [currentRepair, ...repairHistory];

    allRepairs.forEach((repair, index) => {
      message += `--- Repair ${index + 1} ---\n`;
      message += `Item: ${repair.item_brand}`;
      if (repair.item_model) {
        message += `-${repair.item_model}`;
      }
      message += `\n`;
      message += `Dropped Off: ${formatDate(repair.created_at)}\n`;

      // Format status for display
      const statusDisplay = repair.status.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      message += `Status: ${statusDisplay}\n`;
      message += `Issue: ${repair.problem_description}\n`;

      // Cost information
      const repairCost = repair.under_warranty ? 0 : (repair.repair_cost || 0);
      const amountPaid = repair.amount_paid || 0;
      const amountLeft = repairCost - amountPaid;

      message += `Repair Cost: ${repair.under_warranty ? 'Free (Warranty)' : formatCost(repairCost)}\n`;
      message += `Amount Paid: ${formatCost(amountPaid)}\n`;
      message += `Amount Left: ${formatCost(amountLeft)}\n\n`;

      // Parts information
      if (repair.parts_used) {
        try {
          const parsedParts = JSON.parse(repair.parts_used);
          if (parsedParts.length > 0) {
            message += `Parts used:\n`;
            parsedParts.forEach((part: string) => {
              message += `• ${part}\n`;
            });
            message += `\n`;
          } else {
            message += `No parts recorded for this repair.\n\n`;
          }
        } catch {
          message += `No parts recorded for this repair.\n\n`;
        }
      } else {
        message += `No parts recorded for this repair.\n\n`;
      }
    });

    message += `From SUMRY.`;

    // Clean up phone number and create WhatsApp URL
    let phoneNumber = currentRepair.contact.replace(/\D/g, '');
    // if (!phoneNumber.startsWith('961')) {
    //   phoneNumber = '961' + phoneNumber;
    // }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;

    try {
      const api = (window as any).electronAPI;
      if (api && api.openExternal) {
        await api.openExternal(whatsappUrl);
      } else {
        // Fallback to window.open if openExternal is not available
        window.open(whatsappUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
      }
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      // Fallback to window.open
      window.open(whatsappUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
    }
  };

  if (!currentRepair.serial_number) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-lg">
      <div className="flex flex-col space-y-1.5 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="font-semibold tracking-tight text-xl font-headline text-[var(--light-green)] flex items-center gap-2">
            <History className="h-5 w-5" />
            Repair History for S/N: {currentRepair.serial_number}
          </div>
          <button
            className="inline-flex items-center focus:ring-2 focus:ring-[var(--light-green)] justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring  disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-[var(--orange)] hover:text-white bg-gray-100 h-9 rounded-md px-3"
            title="Share History"
            onClick={handleShareHistory}
            disabled={!currentRepair.contact}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share History
          </button>
        </div>
        <div className="text-sm text-[var(--light-green-2)]">
          Previous repair jobs logged for this serial number.
        </div>
      </div>
      <div className="p-6 pt-0">
        {repairHistory.length > 0 ? (
          <ul className="space-y-4">
            {repairHistory.map((historyRepair) => {
              const parsedParts = historyRepair.parts_used ? JSON.parse(historyRepair.parts_used) : [];
              const repairCost = historyRepair.under_warranty ? 0 : (historyRepair.repair_cost || 0);
              const amountPaid = historyRepair.amount_paid || 0;
              const amountLeft = repairCost - amountPaid;

              return (
                <li key={historyRepair.id} className="p-4 border rounded-md shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <p className="font-medium text-foreground">
                        {historyRepair.item_brand} - {historyRepair.customer_name}
                        {historyRepair.under_warranty && (
                          <span className="text-xs font-semibold text-green-600 ml-2">
                            (Device Under Warranty?)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-[var(--light-green-2)]">
                        Dropped Off: {formatDate(historyRepair.created_at)}
                      </p>
                      {historyRepair.status === 'completed' && (
                        <p className="text-xs text-[var(--light-green-2)]">
                          Repair Finished: {formatDate(historyRepair.updated_at)}
                        </p>
                      )}
                    </div>
                    <div className={getStatusBadgeClasses(historyRepair.status)}>
                      {historyRepair.status}
                    </div>
                  </div>
                  <p className="text-sm text-[var(--light-green-2)] mt-2 line-clamp-2">
                    {historyRepair.problem_description}
                  </p>
                  <div className="mt-3 pt-2 border-t border-dashed">
                    <h5 className="text-xs font-semibold text-[var(--light-green-2)] mb-1">
                      Repair Cost: {historyRepair.under_warranty ? 'Free (Warranty)' : formatCost(repairCost)}
                    </h5>
                    <h5 className="text-xs font-semibold text-[var(--light-green-2)] mb-1">
                      Amount Paid: {formatCost(amountPaid)}
                    </h5>
                    <h5 className="text-xs font-semibold text-[var(--light-green-2)] mb-1">
                      Amount Left: {formatCost(amountLeft)}
                    </h5>
                    {parsedParts.length > 0 && (
                      <>
                        <h5 className="text-xs font-semibold text-[var(--light-green-2)] mt-1 mb-0.5">
                          Parts Used:
                        </h5>
                        <ul className="list-disc list-inside text-xs text-[var(--light-green-2)] space-y-0.5 ps-2">
                          {parsedParts.map((part: string, index: number) => (
                            <li key={index}>{part}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                  <a
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2  disabled:pointer-events-none disabled:opacity-50 underline-offset-4 hover:underline h-10 text-[var(--orange)] p-0 mt-2"
                    href={`/repairs/${historyRepair.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/repairs/${historyRepair.id}`);
                    }}
                  >
                    View Full Details
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </a>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-[var(--light-green-2)] text-center py-8">
            No previous repairs found for this serial number.
          </p>
        )}
      </div>
      <ToastContainer toasts={toasts} onHideToast={hideToast} />
    </div>
  );
};

export default RepairHistoryCard;