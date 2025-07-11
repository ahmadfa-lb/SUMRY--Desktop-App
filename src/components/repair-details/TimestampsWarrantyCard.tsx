import React from 'react';
import { CalendarDays, ShieldCheck, ShieldQuestion } from 'lucide-react';
import { Repair } from '../../types/repair';
import useToast from '../../toast/useToast';
import ToastContainer from '../../toast/ToastContainer';

interface TimestampsWarrantyCardProps {
  repair: Repair;
  onWarrantyToggle: () => Promise<void>;
  formatDate: (dateString: string) => string;
  isLocked: boolean;
}

const TimestampsWarrantyCard: React.FC<TimestampsWarrantyCardProps> = ({
  repair,
  onWarrantyToggle,
  formatDate,
  isLocked
}) => {

  const { toasts, showToast, hideToast } = useToast();

  const handleCheckWarranty = async () => {
    if (!repair.serial_number) {
      showToast({
        type: 'error',
        title: 'No S/N',
        description: `No serial number available for this repair`,
      });
      return;
    }

    try {
      const warrantyUrl = `https://sumrylebanon.com/certificate.php?serial_number=${repair.serial_number}`;
      const result = await (window as any).electronAPI.openExternal(warrantyUrl);

      if (!result.success) {
        showToast({
          type: 'error',
          title: 'Failed to open warranty page',
          description: `Failed to open warranty page: ${result.error || 'Unknown error'}`,
        });
      }
    } catch (error) {
      console.error('Error opening warranty page:', error);
      showToast({
        type: 'error',
        title: 'Failed to open warranty page',
        description: `Failed to open warranty page`,
      });
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
        <CalendarDays className="h-5 w-5" />
        Timestamps & Warranty
      </h3>
      <p><strong>Logged:</strong> {formatDate(repair.created_at)}</p>
      <p><strong>Last Updated:</strong> {formatDate(repair.updated_at)}</p>
      <div className="flex items-center space-x-2 mt-3">
        <input
          type="checkbox"
          checked={repair.under_warranty}
          onChange={onWarrantyToggle}
          className="h-4 w-4 shrink-0 rounded-sm border border-primary focus:ring-2 focus:ring-[var(--light-green)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-[var(--light-green)]-foreground cursor-pointer"
          id="isUnderWarranty"
          disabled={isLocked}
        />
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1 cursor-pointer" htmlFor="isUnderWarranty">
          <ShieldCheck className="h-4 w-4 text-green-600" />
          Device Under Warranty?
        </label>
      </div>
      <button
        onClick={handleCheckWarranty}
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium  transition-colors focus-visible:outline-none focus:ring-2 focus:ring-[var(--light-green)] disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-[var(--orange)] hover:text-white bg-gray-100 h-9 rounded-md px-3 mt-3"
        title="Opens the warranty check website (requires S/N)"
      >
        <ShieldQuestion className="h-4 w-4 mr-2" />
        Check Warranty Online
      </button>
      <ToastContainer toasts={toasts} onHideToast={hideToast} />
    </div>
  );
};

export default TimestampsWarrantyCard;