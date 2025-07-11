interface IElectronAPI {
  getAppVersion: () => Promise<string>;
  showMessageBox: (options: any) => Promise<any>;
  onMenuNewTask: (callback: () => void) => void;
  onMainProcessMessage: (callback: (event: any, message: string) => void) => void;
  removeAllListeners: (channel: string) => void;

  // Database methods
  getAllRepairs: () => Promise<Repair[]>;
  getRepairById: (id: number) => Promise<Repair | null>;
  getRepairsBySerialNumber: (serialNumber: string) => Promise<Repair[]>;
  addRepair: (repair: RepairData) => Promise<number>;
  updateRepair: (id: number, updates: Partial<RepairData>) => Promise<boolean>;
  deleteRepair: (id: number) => Promise<boolean>;
  exportData: () => Promise<any>;
  getAllCustomers: () => Promise<Customer[]>;
  getCustomerRepairs: (customerName: string, contact?: string) => Promise<Repair[]>;
  updateCustomerInfo: (oldCustomerName: string, oldContact: string, newCustomerName: string, newContact: string) => Promise<boolean>;
  deleteCustomer: (customerName: string, contact?: string) => Promise<number>;
  searchCustomers: (searchTerm: string) => Promise<Customer[]>;

  // Authentication methods
  login: (username: string, password: string) => Promise<{ id: number, username: string } | null>;
  createDefaultAdmin: () => Promise<boolean>;
  createUser: (username: string, password: string) => Promise<number>;
  getAllUsers: () => Promise<{ id: number, username: string, created_at: string }[]>;
  deleteUser: (userId: number) => Promise<{ success: boolean, deletedUser?: string, error?: string }>;
  
  // Suggestions methods
  getAllSuggestions: (type: 'brand' | 'model' | 'parts') => Promise<string[]>;
  addSuggestion: (type: 'brand' | 'model' | 'parts', value: string) => Promise<number | null>;
  removeSuggestion: (type: 'brand' | 'model' | 'parts', value: string) => Promise<boolean>;
  clearAllSuggestions: (type: 'brand' | 'model' | 'parts') => Promise<number>;

  // Items/Stock management methods
  getAllItems: () => Promise<StockItem[]>;
  getItemById: (id: number) => Promise<StockItem | null>;
  getItemBySerialNumber: (serialNumber: string) => Promise<StockItem | null>;
  addItem: (item: ItemData) => Promise<number>;
  updateItem: (id: number, updates: Partial<ItemData>) => Promise<boolean>;
  deleteItem: (id: number) => Promise<boolean>;
  markItemAsSold: (id: number, salePrice: number) => Promise<boolean>;
  markItemAsAvailable: (id: number) => Promise<boolean>;
  searchItems: (searchTerm: string) => Promise<StockItem[]>;
  getItemsByCategory: (category: string) => Promise<StockItem[]>;
  getItemsByStatus: (sold?: boolean | null) => Promise<StockItem[]>;

  // Google Drive backup methods
  backupToGoogleDrive: () => Promise<any>;
  restoreFromGoogleDrive: (fileId: string) => Promise<any>;
  // ... existing code ...

  googleDriveAuthDeviceCode: () => Promise<{
    success: boolean;
    deviceCode?: string;
    userCode?: string;
    verificationUrl?: string;
    verificationUrlComplete?: string;
    expiresIn?: number;
    interval?: number;
    error?: string;
  }>;

  googleDrivePollToken: (deviceCode: string, interval: number) => Promise<{
    success: boolean;
    pending?: boolean;
    slowDown?: boolean;
    tokens?: any;
    error?: string;
  }>;

  // WhatsApp Templates
  getAllWhatsAppTemplates: () => Promise<WhatsAppTemplate[]>;
  getWhatsAppTemplateByStatus: (status: string) => Promise<WhatsAppTemplate | undefined>;
  updateWhatsAppTemplate: (status: string, template: string) => Promise<boolean>;
  updateAllWhatsAppTemplates: (templates: { [key: string]: string }) => Promise<number>;
  resetWhatsAppTemplatesToDefault: () => Promise<number>;

  getShopOverviewStats: () => Promise<{
    itemsLoggedToday: number;
    totalItemsFixed: number;
    itemsAwaitingFix: number;
  }>;

  openExternal: (url: string) => Promise<{ success: boolean; error?: string }>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}

interface Customer {
  customer_name: string;
  contact: string | null;
  repair_count: number;
  last_repair_date: string;
  first_repair_date: string;
}

interface StockItem {
  id: number;
  model: string;
  category: string | null;
  power_rate: string | null;
  serial_number: string | null;
  notes: string | null;
  status: string;
  sold: number;
  sale_price: number | null;
  sale_date: string | null;
  date_added: string;
  created_at: string;
  updated_at: string;
}

interface ItemData {
  model: string;
  category?: string;
  power_rate?: string;
  serial_number?: string;
  notes?: string;
  status?: string;
  sold?: boolean;
  sale_price?: number;
  sale_date?: string;
}

interface WhatsAppTemplate {
  id: number;
  status: string;
  template: string;
  created_at: string;
  updated_at: string;
}