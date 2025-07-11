const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
  onMenuNewTask: (callback) => {
    ipcRenderer.on('menu-new-task', callback)
  },
  onMainProcessMessage: (callback) => {
    ipcRenderer.on('main-process-message', callback)
  },
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel)
  },

  showContextMenu: () => ipcRenderer.send('show-context-menu'),

  openExternal: (url) => ipcRenderer.invoke('open-external', url),

  // Add database methods
  getAllRepairs: () => ipcRenderer.invoke('get-all-repairs'),
  getRepairById: (id) => ipcRenderer.invoke('get-repair-by-id', id),
  getRepairsBySerialNumber: (serialNumber) => ipcRenderer.invoke('get-repairs-by-serial-number', serialNumber),
  addRepair: (repair) => ipcRenderer.invoke('add-repair', repair),
  updateRepair: (id, updates) => ipcRenderer.invoke('update-repair', id, updates),
  deleteRepair: (id) => ipcRenderer.invoke('delete-repair', id),
  exportData: () => ipcRenderer.invoke('export-data'),
  getAllCustomers: () => ipcRenderer.invoke('get-all-customers'),
  getCustomerRepairs: (customerName, contact) => ipcRenderer.invoke('get-customer-repairs', customerName, contact),
  updateCustomerInfo: (oldCustomerName, oldContact, newCustomerName, newContact) => ipcRenderer.invoke('update-customer-info', oldCustomerName, oldContact, newCustomerName, newContact),
  deleteCustomer: (customerName, contact) => ipcRenderer.invoke('delete-customer', customerName, contact),
  searchCustomers: (searchTerm) => ipcRenderer.invoke('search-customers', searchTerm),
  canDeleteCustomer: (customerName, contact) => ipcRenderer.invoke('can-delete-customer', customerName, contact),

  // Authentication methods
  login: (username, password) => ipcRenderer.invoke('login', username, password),
  createDefaultAdmin: () => ipcRenderer.invoke('create-default-admin'),
  createUser: (username, password) => ipcRenderer.invoke('create-user', username, password),
  getAllUsers: () => ipcRenderer.invoke('get-all-users'),
  deleteUser: (userId) => ipcRenderer.invoke('delete-user', userId),

  //suggesstion
  getAllSuggestions: (type) => ipcRenderer.invoke('get-all-suggestions', type),
  addSuggestion: (type, value) => ipcRenderer.invoke('add-suggestion', type, value),
  removeSuggestion: (type, value) => ipcRenderer.invoke('remove-suggestion', type, value),
  clearAllSuggestions: (type) => ipcRenderer.invoke('clear-all-suggestions', type),

  // Data management methods
  exportDataAsJSON: () => ipcRenderer.invoke('export-data-json'),
  exportDataAsCSV: () => ipcRenderer.invoke('export-data-csv'),
  importDataFromJSON: (jsonData) => ipcRenderer.invoke('import-data-json', jsonData),
  saveFile: (data, filename, filters) => ipcRenderer.invoke('save-file', data, filename, filters),
  loadFile: () => ipcRenderer.invoke('load-file'),

  // Google Drive methods
  getGoogleDriveAuthUrl: () => ipcRenderer.invoke('google-drive-auth-url'),
  handleGoogleDriveAuthCallback: (code) => ipcRenderer.invoke('google-drive-auth-callback', code),
  checkGoogleDriveAuth: () => ipcRenderer.invoke('check-google-drive-auth'),
  backupToGoogleDrive: () => ipcRenderer.invoke('backup-to-google-drive'),
  restoreFromGoogleDrive: (fileId) => ipcRenderer.invoke('restore-from-google-drive', fileId),
  listGoogleDriveBackups: () => ipcRenderer.invoke('list-google-drive-backups'),
  reAuthenticateGoogleDrive: () => ipcRenderer.invoke('re-authenticate-google-drive'),

  // Auto backup APIs
  enableAutoBackup: (enabled, time) => ipcRenderer.invoke('enable-auto-backup', enabled, time),
  getAutoBackupStatus: () => ipcRenderer.invoke('get-auto-backup-status'),

  // Listen for auto backup completion events
  onAutoBackupCompleted: (callback) => {
    ipcRenderer.on('auto-backup-completed', (event, data) => callback(data));
  },

  // Items/Stock management methods
  getAllItems: () => ipcRenderer.invoke('get-all-items'),
  getItemById: (id) => ipcRenderer.invoke('get-item-by-id', id),
  getItemBySerialNumber: (serialNumber) => ipcRenderer.invoke('get-item-by-serial-number', serialNumber),
  addItem: (item) => ipcRenderer.invoke('add-item', item),
  updateItem: (id, updates) => ipcRenderer.invoke('update-item', id, updates),
  deleteItem: (id) => ipcRenderer.invoke('delete-item', id),
  markItemAsSold: (id, salePrice) => ipcRenderer.invoke('mark-item-as-sold', id, salePrice),
  markItemAsAvailable: (id) => ipcRenderer.invoke('mark-item-as-available', id),
  searchItems: (searchTerm) => ipcRenderer.invoke('search-items', searchTerm),
  getItemsByCategory: (category) => ipcRenderer.invoke('get-items-by-category', category),
  getItemsByStatus: (sold) => ipcRenderer.invoke('get-items-by-status', sold),

  // WhatsApp Templates methods
  getAllWhatsAppTemplates: () => ipcRenderer.invoke('get-all-whatsapp-templates'),
  getWhatsAppTemplateByStatus: (status) => ipcRenderer.invoke('get-whatsapp-template-by-status', status),
  updateWhatsAppTemplate: (status, template) => ipcRenderer.invoke('update-whatsapp-template', status, template),
  updateAllWhatsAppTemplates: (templates) => ipcRenderer.invoke('update-all-whatsapp-templates', templates),
  resetWhatsAppTemplatesToDefault: () => ipcRenderer.invoke('reset-whatsapp-templates-to-default'),

  // Shop overview statistics
  getShopOverviewStats: () => ipcRenderer.invoke('get-shop-overview-stats'),
});