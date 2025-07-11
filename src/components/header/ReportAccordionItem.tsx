import React, { useState } from 'react';
import { ChevronDown, Calendar, X } from 'lucide-react';
import { Repair } from '../../types/repair';

interface ReportAccordionItemProps {
  reportType: string;
  icon: React.ComponentType<any>;
  isExpanded: boolean;
  onToggle: () => void;
  fromDate: Date | null;
  toDate: Date;
  showFromDatePicker: boolean;
  showToDatePicker: boolean;
  currentMonth: Date;
  setShowFromDatePicker: (show: boolean) => void;
  setShowToDatePicker: (show: boolean) => void;
  setCurrentMonth: (date: Date) => void;
  handleDateSelect: (date: Date, type: 'from' | 'to') => void;
  formatDate: (date: Date | null) => string;
  DatePicker: React.ComponentType<any>;
}

interface ReportResult {
  totalCost: number;
  itemsFixed: number;
  repairsInRange: Repair[];
  isLoading: boolean;
  error: string | null;
}

const ReportAccordionItem: React.FC<ReportAccordionItemProps> = ({
  reportType,
  icon: Icon,
  isExpanded,
  onToggle,
  fromDate,
  toDate,
  showFromDatePicker,
  showToDatePicker,
  currentMonth,
  setShowFromDatePicker,
  setShowToDatePicker,
  setCurrentMonth,
  handleDateSelect,
  formatDate,
  DatePicker,
}) => {
  const [reportResult, setReportResult] = useState<ReportResult>({
    totalCost: 0,
    itemsFixed: 0,
    repairsInRange: [],
    isLoading: false,
    error: null
  });
  const [hasGeneratedReport, setHasGeneratedReport] = useState(false);

  const handleGenerateReport = async () => {
    if (!fromDate) {
      setReportResult(prev => ({ ...prev, error: 'Please select a from date' }));
      return;
    }

    setReportResult(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const api = (window as any).electronAPI;
      if (!api) {
        throw new Error('Electron API not available');
      }

      // Get all repairs from the database
      const allRepairs: Repair[] = await api.getAllRepairs();
      
      // Filter repairs by date range
      const fromDateTime = fromDate.getTime();
      const toDateTime = toDate.getTime() + (24 * 60 * 60 * 1000 - 1); // End of day
      
      const repairsInRange = allRepairs.filter(repair => {
        const repairDate = new Date(repair.created_at).getTime();
        return repairDate >= fromDateTime && repairDate <= toDateTime;
      });

      // Calculate total cost (sum of repair_cost for completed repairs)
      const totalCost = repairsInRange
        .filter(repair => repair.status === 'completed' || repair.status === 'picked-up')
        .reduce((sum, repair) => sum + (repair.repair_cost || 0), 0);

      // Calculate items fixed (count of completed/picked-up repairs)
      const itemsFixed = repairsInRange
        .filter(repair => repair.status === 'completed' || repair.status === 'picked-up')
        .length;

      setReportResult({
        totalCost,
        itemsFixed,
        repairsInRange,
        isLoading: false,
        error: null
      });
      setHasGeneratedReport(true);
      
    } catch (error) {
      console.error('Error generating report:', error);
      setReportResult(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to generate report'
      }));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="border-b-0">
      <h3 className="flex">
        <button
          type="button"
          onClick={onToggle}
          className="flex flex-1 items-center justify-between transition-all text-md font-medium hover:no-underline py-3"
          aria-expanded={isExpanded}
        >
          <div className="flex items-center gap-2">
            <Icon className="w-[18px] h-[18px]" />
            {reportType}
          </div>
          <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      </h3>
      {isExpanded && (
        <div className="overflow-hidden text-sm transition-all pb-4 pt-2 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <div className="">
                <button
                  onClick={() => {
                    setShowFromDatePicker(true);
                    setShowToDatePicker(false);
                    setCurrentMonth(fromDate || new Date());
                  }}
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input hover:bg-[var(--orange)] hover:text-white bg-gray-100 h-10 px-4 py-2 w-full justify-start text-left font-normal text-[var(--light-green-2)]"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(fromDate)}</span>
                </button>
                <DatePicker
                  isOpen={showFromDatePicker}
                  onClose={() => setShowFromDatePicker(false)}
                  onDateSelect={(date: Date) => handleDateSelect(date, 'from')}
                  selectedDate={fromDate}
                  type="from"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <div className="">
                <button
                  onClick={() => {
                    setShowToDatePicker(true);
                    setShowFromDatePicker(false);
                    setCurrentMonth(toDate);
                  }}
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input hover:bg-[var(--orange)] hover:text-white bg-gray-100 h-10 px-4 py-2 w-full justify-start text-left font-normal text-[var(--light-gray)]"
                  id="cost-to-date"
                  type="button"
                >
                  <Calendar className="w-4 h-4" />
                  {formatDate(toDate)}
                </button>
                <DatePicker
                  isOpen={showToDatePicker}
                  onClose={() => setShowToDatePicker(false)}
                  onDateSelect={(date: Date) => handleDateSelect(date, 'to')}
                  selectedDate={toDate}
                  type="to"
                />
              </div>
            </div>
          </div>

          {reportResult.error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{reportResult.error}</p>
            </div>
          )}

          <button
            onClick={handleGenerateReport}
            disabled={reportResult.isLoading}
            className="w-full bg-[var(--light-green)] hover:bg-[var(--light-green-2)] text-white font-medium py-2 px-4 rounded-md transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {reportResult.isLoading ? 'Generating...' : 'Generate Report'}
          </button>

          {hasGeneratedReport && !reportResult.isLoading && !reportResult.error && (
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm mt-4">
              <div className="flex flex-col space-y-1.5 p-6">
                <div className="text-2xl font-semibold leading-none tracking-tight">Report Results</div>
                <p className="text-sm text-gray-500">
                  {fromDate ? formatDate(fromDate) : 'Start'} - {formatDate(toDate)}
                </p>
              </div>
              <div className="p-6 pt-0">
                {reportType === 'Total Cost Report' ? (
                  <>
                    <p className="text-lg font-semibold mb-2">
                      Total Revenue: {formatCurrency(reportResult.totalCost)}
                    </p>
                    <p className="text-sm text-gray-500 mb-2">
                      From {reportResult.repairsInRange.filter(r => r.status === 'completed' || r.status === 'picked-up').length} completed repairs
                    </p>
                    <p className="text-sm text-gray-500">
                      Total repairs in period: {reportResult.repairsInRange.length}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-semibold mb-2">
                      Items Fixed: {reportResult.itemsFixed}
                    </p>
                    <p className="text-sm text-gray-500 mb-2">
                      Total revenue: {formatCurrency(reportResult.totalCost)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Total repairs in period: {reportResult.repairsInRange.length}
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportAccordionItem;