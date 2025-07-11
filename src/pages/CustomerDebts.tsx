import React, { useState, useEffect } from 'react'
import { ArrowLeft, Info, Search, User, Phone, Calendar, DollarSign } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Repair } from '../types/repair'

interface CustomerDebt {
  customer_name: string;
  contact: string | null;
  total_debt: number;
  repair_count: number;
  repair_id: string;
  last_repair_date: string;
  repairs: Repair[];
}

const CustomerDebts = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [customerDebts, setCustomerDebts] = useState<CustomerDebt[]>([]);
  const [filteredDebts, setFilteredDebts] = useState<CustomerDebt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all repairs and calculate debts
  useEffect(() => {
    loadCustomerDebts();
  }, []);

  // Filter debts based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredDebts(customerDebts);
    } else {
      const filtered = customerDebts.filter(debt =>
        debt.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (debt.contact && debt.contact.toLowerCase().includes(searchTerm.toLowerCase())) ||
        debt.repairs.some(repair =>
          repair.serial_number?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredDebts(filtered);
    }
  }, [searchTerm, customerDebts]);

  const loadCustomerDebts = async () => {
    try {
      setLoading(true);
      setError(null);

      const api = (window as any).electronAPI;
      if (!api) {
        throw new Error('Electron API not available');
      }

      // Get all repairs
      const allRepairs: Repair[] = await api.getAllRepairs();

      // Group repairs by customer and calculate debts
      const customerMap = new Map<string, CustomerDebt>();

      allRepairs.forEach(repair => {
        const debt = (repair.repair_cost || 0) - (repair.amount_paid || 0);

        // Only include customers with outstanding debts
        if (debt > 0) {
          const customerKey = `${repair.customer_name.toLowerCase()}_${(repair.contact || '').toLowerCase()}`;

          if (customerMap.has(customerKey)) {
            const existing = customerMap.get(customerKey)!;
            existing.total_debt += debt;
            existing.repair_count += 1;
            existing.repairs.push(repair);

            // Update last repair date if this repair is more recent
            if (new Date(repair.created_at) > new Date(existing.last_repair_date)) {
              existing.last_repair_date = repair.created_at;
            }
          } else {
            customerMap.set(customerKey, {
              customer_name: repair.customer_name,
              contact: repair.contact,
              total_debt: debt,
              repair_count: 1,
              repair_id: repair.id.toString(),
              last_repair_date: repair.created_at,
              repairs: [repair]
            });
          }
        }
      });

      // Convert map to array and sort by total debt (highest first)
      const debtsArray = Array.from(customerMap.values())
        .sort((a, b) => b.total_debt - a.total_debt);

      setCustomerDebts(debtsArray);
    } catch (err) {
      console.error('Error loading customer debts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load customer debts');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTotalOutstandingDebt = () => {
    return filteredDebts.reduce((total, debt) => total + debt.total_debt, 0);
  };

  const handleCustomerClick = (repairId: string) => {
    // Navigate to customer details or repairs
    navigate(`/repairs/${repairId}`);
    // navigate(`/customers?search=${encodeURIComponent(customerName)}`);
  };

  if (loading) {
    return (
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-[var(--light-green)] mb-6">Customer Debts</h1>
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--light-green)] mx-auto"></div>
            <p className="mt-4 text-[var(--light-green)]">Loading customer debts...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-grow container mx-auto px-4 py-8">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-[var(--light-green)] mb-6">Customer Debts</h1>
        <div data-orientation="horizontal" role="none" className="shrink-0 bg-gray-300 h-[1px] w-full mb-8"></div>

        <div className="space-y-6">
          {/* Search Section */}
          <div className="rounded-lg border border-gray-300 bg-none text-[var(--light-gray)] shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="text-2xl font-semibold leading-none tracking-tight text-[var(--light-gray)]">
                Search by customer, phone, S/N...
              </div>
            </div>
            <div className="p-6 pt-0">
              <div className="relative search-input-print-remove">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--light-green)]" />
                <input
                  className="flex h-10 rounded-md border border-none bg-none px-3 py-2 text-base ring-offset-none file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[var(--light-gray)] placeholder:text-[var(--light-green)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--light-green)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10 w-full"
                  placeholder="Search by customer, phone, S/N..."
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="rounded-lg border border-red-300 bg-red-50 text-red-700 shadow-sm p-4">
              <p className="font-medium">Error loading customer debts:</p>
              <p className="text-sm">{error}</p>
              <button
                onClick={loadCustomerDebts}
                className="mt-2 text-sm underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Debts Display Section */}
          <div className="rounded-lg border border-gray-300 bg-none text-[var(--light-gray)] shadow-sm" id="customerDebtsPrintArea">
            <div className="flex flex-col space-y-1.5 p-6 print-header">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex-1">
                  <div className="text-2xl font-semibold leading-none tracking-tight print-title text-[var(--light-gray)]">
                    Outstanding Debts ({filteredDebts.length})
                  </div>
                  <div className="text-sm text-[var(--light-green)] print-description">
                    Total Outstanding Debt: <span className="font-semibold text-red-500">{formatCurrency(getTotalOutstandingDebt())}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0 max-h-[70vh] overflow-y-auto">
              {filteredDebts.length === 0 ? (
                <div className="text-center py-10">
                  <Info className="mx-auto h-12 w-12 text-[var(--light-green)]" />
                  <h3 className="mt-2 text-lg font-medium text-[var(--light-gray)]">
                    {searchTerm ? 'No matching debts found' : 'No Outstanding Debts'}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--light-green)]">
                    {searchTerm
                      ? 'Try adjusting your search terms.'
                      : 'All customer accounts are settled or no active debts found.'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDebts.map((debt, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleCustomerClick(debt.repair_id)}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-4 w-4 text-[var(--light-green)]" />
                            <h3 className="font-semibold text-[var(--light-gray)]">{debt.customer_name}</h3>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-[var(--light-green)]">
                            {debt.contact && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span>{debt.contact}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>Last: {formatDate(debt.last_repair_date)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span>{debt.repair_count} repair{debt.repair_count !== 1 ? 's' : ''} with debt</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-red-500">
                            {formatCurrency(debt.total_debt)}
                          </span>
                        </div>
                      </div>

                      {/* Repair details */}
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="text-xs text-[var(--light-green)] mb-2">Outstanding repairs:</div>
                        <div className="space-y-1">
                          {debt.repairs.map((repair, repairIndex) => {
                            const repairDebt = (repair.repair_cost || 0) - (repair.amount_paid || 0);
                            return (
                              <div key={repairIndex} className="flex justify-between items-center text-xs">
                                <span className="text-[var(--light-gray)]">
                                  {repair.item_brand} {repair.item_model} - {repair.status}
                                  {repair.serial_number && ` (S/N: ${repair.serial_number})`}
                                </span>
                                <span className="font-medium text-red-500 flex gap-5">
                                  <span>
                                    <span className="text-xs text-[var(--light-green)]">Repair Cost: </span>{formatCurrency(repair.repair_cost || 0)}
                                  </span>
                                  <span>
                                    <span className="text-xs text-[var(--light-green)]">Amount Paid: </span>{formatCurrency(repair.amount_paid || 0)}
                                  </span>
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Back Button */}
        <button
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-[var(--light-green)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-none hover:text-white fixed top-6 left-6 z-50 h-14 w-14 rounded-full shadow-lg bg-white hover:bg-[var(--light-green)] text-[var(--light-gray)]"
          aria-label="Go back to previous page"
          title="Go back to previous page"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-7 w-7" />
          <span className="sr-only">Go back to previous page</span>
        </button>
      </div>
    </main>
  );
};

export default CustomerDebts;