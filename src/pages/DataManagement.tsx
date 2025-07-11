// import React, { useEffect, useState } from 'react'
// import { ArrowLeft, CloudUpload, DatabaseBackup, DatabaseZap, Download, FileCode, FileUp, FolderKey, KeyRound, List, Settings, Upload, X } from 'lucide-react'
// import { useNavigate } from 'react-router-dom'

// const DataManagement = () => {
//     const navigate = useNavigate();
//     const [isLoading, setIsLoading] = useState(false);
//     const [selectedFile, setSelectedFile] = useState<File | null>(null);
//     const [googleDriveFileId, setGoogleDriveFileId] = useState('');
//     const [isExporting, setIsExporting] = useState(false);
//     const [isImporting, setIsImporting] = useState(false);
//     const [isBackingUp, setIsBackingUp] = useState(false);
//     const [isGoogleDriveAuthenticated, setIsGoogleDriveAuthenticated] = useState(false);
//     const [googleDriveBackups, setGoogleDriveBackups] = useState([]);
//     const [showBackupsList, setShowBackupsList] = useState(false);
//     const [isAuthenticating, setIsAuthenticating] = useState(false);
//     // New state variables for the authorization code modal
//     const [showAuthCodeModal, setShowAuthCodeModal] = useState(false);
//     const [authCode, setAuthCode] = useState('');
//     const [authError, setAuthError] = useState('');

//     // Check Google Drive authentication status on component mount
//     useEffect(() => {
//         checkGoogleDriveAuth();
//     }, []);

//     const checkGoogleDriveAuth = async () => {
//         try {
//             const api = (window as any).electronAPI;
//             const result = await api.checkGoogleDriveAuth();
//             setIsGoogleDriveAuthenticated(result.authenticated);
//         } catch (error) {
//             console.error('Error checking Google Drive auth:', error);
//             setIsGoogleDriveAuthenticated(false);
//         }
//     };

//     const handleReAuthenticate = async () => {
//         try {
//             setIsAuthenticating(true);
//             const api = (window as any).electronAPI;

//             // Clear existing authentication
//             const result = await api.reAuthenticateGoogleDrive();

//             if (result.success) {
//                 // Update authentication status
//                 setIsGoogleDriveAuthenticated(false);

//                 // Show success message
//                 await api.showMessageBox({
//                     type: 'info',
//                     title: 'Re-authentication Required',
//                     message: 'Previous authentication cleared. Please click "Authenticate with Google Drive" to re-authenticate.'
//                 });
//             } else {
//                 await api.showMessageBox({
//                     type: 'error',
//                     title: 'Re-authentication Failed',
//                     message: result.error || 'Failed to clear authentication. Please try again.'
//                 });
//             }
//         } catch (error) {
//             console.error('Re-authentication error:', error);
//             await (window as any).electronAPI.showMessageBox({
//                 type: 'error',
//                 title: 'Error',
//                 message: 'An error occurred during re-authentication. Please try again.'
//             });
//         } finally {
//             setIsAuthenticating(false);
//         }
//     };

//     // Updated Google Drive Authentication with modal
//     const handleGoogleDriveAuth = async () => {
//         try {
//             const api = (window as any).electronAPI;
//             setIsAuthenticating(true);
//             const authUrl = await api.getGoogleDriveAuthUrl();

//             // Open the auth URL in the default browser
//             await api.openExternal(authUrl);

//             // Show modal for user to paste the authorization code
//             setShowAuthCodeModal(true);
//         } catch (error) {
//             console.error('Error initiating Google Drive auth:', error);
//             setAuthError('Failed to initiate authentication');
//         } finally {
//             setIsAuthenticating(false);
//         }
//     };

//     // Handle authorization code submission
//     const handleAuthCodeSubmit = async () => {
//         if (!authCode.trim()) {
//             setAuthError('Please enter the authorization code');
//             return;
//         }

//         try {
//             setIsAuthenticating(true);
//             setAuthError('');
//             const api = (window as any).electronAPI;
//             const result = await api.handleGoogleDriveAuthCallback(authCode.trim());

//             if (result.success) {
//                 setIsGoogleDriveAuthenticated(true);
//                 setShowAuthCodeModal(false);
//                 setAuthCode('');
//                 console.log('Google Drive authentication successful');
//             }
//         } catch (error) {
//             console.error('Error during auth callback:', error);
//             setAuthError('Authentication failed. Please try again.');
//         } finally {
//             setIsAuthenticating(false);
//         }
//     };

//     // Handle modal close
//     const handleAuthCodeModalClose = () => {
//         setShowAuthCodeModal(false);
//         setAuthCode('');
//         setAuthError('');
//     };

//     // List Google Drive backups
//     const handleListGoogleDriveBackups = async () => {
//         if (!isGoogleDriveAuthenticated) {
//             await (window as any).electronAPI.showMessageBox({
//                 type: 'warning',
//                 title: 'Authentication Required',
//                 message: 'Please authenticate with Google Drive first.'
//             });
//             return;
//         }

//         try {
//             const api = (window as any).electronAPI;
//             const result = await api.listGoogleDriveBackups();

//             if (result.success) {
//                 setGoogleDriveBackups(result.files);
//                 setShowBackupsList(true);
//             } else {
//                 await api.showMessageBox({
//                     type: 'error',
//                     title: 'Error',
//                     message: result.error || 'Failed to list Google Drive backups'
//                 });
//             }
//         } catch (error) {
//             console.error('Error listing Google Drive backups:', error);
//         }
//     };

//     // Google Drive Backup
//     const handleGoogleDriveBackup = async () => {
//         if (!isGoogleDriveAuthenticated) {
//             await (window as any).electronAPI.showMessageBox({
//                 type: 'warning',
//                 title: 'Authentication Required',
//                 message: 'Please authenticate with Google Drive first.'
//             });
//             return;
//         }

//         setIsBackingUp(true);
//         try {
//             const api = (window as any).electronAPI;
//             const result = await api.backupToGoogleDrive();
//             console.log(result);
//             if (result.success) {
//                 await api.showMessageBox({
//                     type: 'info',
//                     title: 'Backup Successful',
//                     message: `Backup created successfully!\n\nFile: ${result.filename}\nFile ID: ${result.fileId}\nCreated: ${new Date(result.createdTime).toLocaleString()}`
//                 });
//             } else {
//                 await api.showMessageBox({
//                     type: 'error',
//                     title: 'Backup Failed',
//                     message: result.error || 'Failed to create backup'
//                 });
//             }
//         } catch (error) {
//             console.error('Google Drive backup error:', error);
//             await (window as any).electronAPI.showMessageBox({
//                 type: 'error',
//                 title: 'Error',
//                 message: 'An unexpected error occurred during backup'
//             });
//         } finally {
//             setIsBackingUp(false);
//         }
//     };

//     // Export to CSV
//     const handleExportCSV = async () => {
//         setIsExporting(true);
//         try {
//             const api = (window as any).electronAPI;
//             const csvContent = await api.exportDataAsCSV();
//             const now = new Date();
//             const dateStr = now.toISOString().split('T')[0];
//             const filename = `repairs_export_${dateStr}.csv`;
//             const result = await api.saveFile(
//                 csvContent,
//                 filename,
//                 [{ name: 'CSV Files', extensions: ['csv'] }]
//             );
//         } catch (error) {
//             console.error('CSV export error:', error);
//         } finally {
//             setIsExporting(false);
//         }
//     };

//     // Export to JSON
//     const handleExportJSON = async () => {
//         setIsExporting(true);
//         try {
//             const api = (window as any).electronAPI;
//             const jsonData = await api.exportDataAsJSON();
//             const jsonContent = JSON.stringify(jsonData, null, 2);
//             const now = new Date();
//             const dateStr = now.toISOString().split('T')[0];
//             const filename = `repairs_backup_${dateStr}.json`;
//             const result = await api.saveFile(
//                 jsonContent,
//                 filename,
//                 [{ name: 'JSON Files', extensions: ['json'] }]
//             );
//         } catch (error) {
//             console.error('JSON export error:', error);
//         } finally {
//             setIsExporting(false);
//         }
//     };

//     // Handle file selection for import
//     const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
//         const file = event.target.files?.[0];
//         if (file) {
//             if (file.type === 'application/json' || file.name.endsWith('.json')) {
//                 setSelectedFile(file);
//             } else {
//                 event.target.value = '';
//             }
//         }
//     };

//     // Import from JSON file
//     const handleImportJSON = async () => {
//         if (!selectedFile) {
//             return;
//         }

//         setIsImporting(true);
//         try {
//             const fileContent = await selectedFile.text();
//             const api = (window as any).electronAPI;
//             const result = await api.importDataFromJSON(fileContent);

//             if (result && typeof result === 'object') {
//                 console.log('Import successful! Imported counts:', result);
//                 setSelectedFile(null);
//                 const fileInput = document.getElementById('import-file-input') as HTMLInputElement;
//                 if (fileInput) fileInput.value = '';
//             } else {
//                 console.error('Import failed: Invalid response format');
//             }
//         } catch (error) {
//             console.error('JSON import error:', error);
//         } finally {
//             setIsImporting(false);
//         }
//     };

//     // Import from Google Drive
//     const handleGoogleDriveImport = async () => {
//         if (!isGoogleDriveAuthenticated) {
//             await (window as any).electronAPI.showMessageBox({
//                 type: 'warning',
//                 title: 'Authentication Required',
//                 message: 'Please authenticate with Google Drive first.'
//             });
//             return;
//         }

//         if (!googleDriveFileId.trim()) {
//             await (window as any).electronAPI.showMessageBox({
//                 type: 'warning',
//                 title: 'File ID Required',
//                 message: 'Please enter a Google Drive File ID.'
//             });
//             return;
//         }

//         setIsImporting(true);
//         try {
//             const api = (window as any).electronAPI;
//             const result = await api.restoreFromGoogleDrive(googleDriveFileId.trim());

//             if (result.success) {
//                 setGoogleDriveFileId('');
//                 const counts = result.importedCounts;
//                 await api.showMessageBox({
//                     type: 'info',
//                     title: 'Import Successful',
//                     message: `Data imported successfully!\n\nImported:\n- ${counts.repairs} repairs\n- ${counts.users} users\n- ${counts.suggestions} suggestions\n- ${counts.whatsapp_templates} WhatsApp templates\n- ${counts.items} items`
//                 });
//             } else {
//                 await api.showMessageBox({
//                     type: 'error',
//                     title: 'Import Failed',
//                     message: result.error || 'Failed to import data from Google Drive'
//                 });
//             }
//         } catch (error) {
//             console.error('Google Drive import error:', error);
//             await (window as any).electronAPI.showMessageBox({
//                 type: 'error',
//                 title: 'Error',
//                 message: 'An unexpected error occurred during import'
//             });
//         } finally {
//             setIsImporting(false);
//         }
//     };

//     return (
//         <div className="container mx-auto px-4 py-8">
//             <h1 className="text-3xl font-bold text-[var(--light-green)] mb-6">Data Management</h1>
//             <div data-orientation="horizontal" role="none" className="shrink-0 bg-gray-300 h-[1px] w-full mb-8"></div>

//             {/* Authorization Code Modal */}
//             {showAuthCodeModal && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                     <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
//                         <h3 className="text-lg font-semibold mb-4">Google Drive Authorization</h3>
//                         <p className="text-sm text-gray-600 mb-4">
//                             A browser window has opened for Google authentication. After authorizing the app:
//                             <br /><br />
//                             1. Google will show you an authorization code
//                             <br />
//                             2. Copy the entire code
//                             <br />
//                             3. Paste it below
//                         </p>
//                         <input
//                             type="text"
//                             value={authCode}
//                             onChange={(e) => setAuthCode(e.target.value)}
//                             placeholder="Paste authorization code here"
//                             className="w-full p-2 border border-gray-300 rounded mb-4 focus-visible:ring-2 focus-visible:ring-[var(--light-green)] outline-none"
//                         />
//                         {authError && (
//                             <p className="text-red-500 text-sm mb-4">{authError}</p>
//                         )}
//                         <div className="flex justify-end space-x-2">
//                             <button
//                                 onClick={handleAuthCodeModalClose}
//                                 className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-[var(--orange)] hover:text-white transition-colors duration-150"
//                                 disabled={isAuthenticating}
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={handleAuthCodeSubmit}
//                                 className="px-4 py-2 bg-[var(--light-green)] text-white rounded hover:bg-[var(--dark-green)] disabled:opacity-50"
//                                 disabled={isAuthenticating || !authCode.trim()}
//                             >
//                                 {isAuthenticating ? 'Authenticating...' : 'Submit'}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             <div className="space-y-8 py-4">

//                 {/* Google Drive Backup */}
//                 <div>
//                     <h3 className="text-xl font-semibold text-[var(--light-green)] mb-2 flex items-center gap-2">
//                         <DatabaseZap className="w-6 h-6" />
//                         Google Drive Backup
//                     </h3>

//                     {/* Authentication Status */}
//                     <div className="mb-4 p-3 rounded-md bg-gray-50">
//                         <div className="flex items-center justify-between">
//                             <p className="text-sm">
//                                 <strong>Status:</strong> {isGoogleDriveAuthenticated ?
//                                     <span className="text-green-600">✓ Authenticated</span> :
//                                     <span className="text-red-600">✗ Not Authenticated</span>
//                                 }
//                             </p>
//                             {isGoogleDriveAuthenticated && (
//                                 <button
//                                     onClick={handleReAuthenticate}
//                                     disabled={isAuthenticating}
//                                     className="text-xs px-3 py-1 bg-green-100 text-[var(--light-green)] border rounded hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
//                                 >
//                                     {isAuthenticating ? 'Re-authenticating...' : 'Re-authenticate'}
//                                 </button>
//                             )}
//                         </div>
//                     </div>

//                     {!isGoogleDriveAuthenticated && (
//                         <div className="space-y-4">
//                             <button
//                                 onClick={handleGoogleDriveAuth}
//                                 disabled={isAuthenticating}
//                                 className="w-full flex items-center justify-center gap-2 bg-[var(--light-green)] text-white py-2 px-4 rounded hover:bg-[var(--dark-green)] disabled:opacity-50"
//                             >   
//                                 <FolderKey />
//                                 {isAuthenticating ? 'Setting up authentication...' : 'Authenticate with Google Drive'}
//                             </button>
//                         </div>
//                     )}

//                     {isGoogleDriveAuthenticated && (
//                         <>
//                             <p className="text-sm text-[var(--light-green-2)] mb-3">Backup (JSON) includes repairs, suggestions, usernames, and custom WhatsApp messages.</p>
//                             <div className="space-y-2">
//                                 <button
//                                     className="inline-flex items-center border justify-center gap-2 rounded-md text-sm font-medium bg-none hover:bg-[var(--orange)] hover:text-white bg-gray-100 h-10 px-4 py-2 w-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//                                     onClick={handleGoogleDriveBackup}
//                                     disabled={isBackingUp}
//                                 >
//                                     <CloudUpload className="w-4 h-4" />
//                                     {isBackingUp ? 'Backing up...' : 'Backup Data to Google Drive'}
//                                 </button>

//                                 <button
//                                     className="inline-flex border items-center justify-center gap-2 rounded-md text-sm font-medium bg-none hover:bg-[var(--orange)] hover:text-white bg-gray-100 h-10 px-4 py-2 w-full transition-colors duration-200"
//                                     onClick={handleListGoogleDriveBackups}
//                                 >
//                                     <List className="w-4 h-4" />
//                                     List Available Backups
//                                 </button>
//                             </div>
//                         </>
//                     )}

//                     {/* Backups List Modal/Section */}
//                     {showBackupsList && (
//                         <div className="mt-4 p-4 border rounded-md bg-gray-50">
//                             <div className="flex justify-between items-center mb-3">
//                                 <h4 className="font-medium">Available Backups</h4>
//                                 <button
//                                     onClick={() => setShowBackupsList(false)}
//                                     className="text-gray-500 hover:text-gray-700"
//                                 >
//                                     <X className='hover:text-[var(--red)]'/>
//                                 </button>
//                             </div>
//                             {googleDriveBackups.length === 0 ? (
//                                 <p className="text-sm text-gray-600">No backups found.</p>
//                             ) : (
//                                 <div className="space-y-2 max-h-40 overflow-y-auto">
//                                     {googleDriveBackups.map((backup: any) => (
//                                         <div key={backup.id} className="flex justify-between items-center p-2 bg-white rounded border">
//                                             <div>
//                                                 <p className="text-sm font-medium">{backup.name}</p>
//                                                 <p className="text-xs text-gray-500">
//                                                     {new Date(backup.createdTime).toLocaleString()}
//                                                 </p>
//                                             </div>
//                                             <button
//                                                 onClick={() => {
//                                                     setGoogleDriveFileId(backup.id);
//                                                     setShowBackupsList(false);
//                                                 }}
//                                                 className="text-xs px-2 py-1 bg-green-100 border text-[var(--light-green)] rounded hover:bg-green-200"
//                                             >
//                                                 Select
//                                             </button>
//                                         </div>
//                                     ))}
//                                 </div>
//                             )}
//                         </div>
//                     )}
//                 </div>

//                 {/* Local Data Export */}
//                 <div>
//                     <h3 className="text-xl font-semibold text-[var(--light-green)] mb-2 mt-6 flex items-center gap-2">
//                         <Download className="w-6 h-6" />
//                         Local Data Export
//                     </h3>
//                     <div className="space-y-3">
//                         <p className="text-sm text-[var(--light-green-2)]">Download all data (repairs, suggestions, users with passwords, custom WhatsApp messages) as a CSV file.</p>
//                         <button
//                             className="inline-flex border items-center justify-center gap-2 rounded-md text-sm font-medium bg-none hover:bg-[var(--orange)] hover:text-white bg-gray-100 h-10 px-4 py-2 w-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//                             onClick={handleExportCSV}
//                             disabled={isExporting}
//                         >
//                             <Download className="w-4 h-4" />
//                             {isExporting ? 'Exporting...' : 'Export Data to CSV (Excel)'}
//                         </button>

//                         <p className="text-sm text-[var(--light-green-2)] mt-3">Download all data (repairs, suggestions, users with passwords, custom WhatsApp messages) as a JSON file.</p>
//                         <button
//                             className="inline-flex items-center border justify-center gap-2 rounded-md text-sm font-medium bg-none hover:bg-[var(--orange)] hover:text-white bg-gray-100 h-10 px-4 py-2 w-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//                             onClick={handleExportJSON}
//                             disabled={isExporting}
//                         >
//                             <FileCode className="w-4 h-4" />
//                             {isExporting ? 'Exporting...' : 'Export Data to JSON'}
//                         </button>
//                     </div>
//                 </div>

//                 {/* Import Data */}
//                 <div>
//                     <h3 className="text-xl font-semibold text-[var(--light-green)] mb-2 mt-6 flex items-center gap-2">
//                         <FileUp className="w-6 h-6" />
//                         Import Data
//                     </h3>

//                     <h4 className="text-lg font-medium text-[var(--light-gray)] mt-4 mb-2">Import Data from Local JSON File</h4>
//                     <p className="text-sm text-[var(--light-green-2)] mb-3">Import data from a JSON file. This will OVERWRITE existing repairs, suggestions, user accounts, and custom WhatsApp messages.</p>
//                     <div className="space-y-2">
//                         <input
//                             id="import-file-input"
//                             type="file"
//                             accept=".json"
//                             onChange={handleFileSelect}
//                             className="flex h-10 w-full rounded-md border border-none bg-none px-3 py-2 placeholder:text-[var(--light-green)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--light-green)] text-sm file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gray-200 file:text-[var(--light-green)] hover:file:bg-[var(--light-green)]/80"
//                         />
//                         <button
//                             className="inline-flex items-center border justify-center gap-2 rounded-md text-sm font-medium bg-background hover:bg-[var(--orange)] hover:text-white bg-gray-100 h-10 px-4 py-2 w-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//                             onClick={handleImportJSON}
//                             disabled={!selectedFile || isImporting}
//                         >
//                             <Upload className="w-4 h-4" />
//                             {isImporting ? 'Importing...' : 'Import from JSON File'}
//                         </button>
//                     </div>

//                     <h4 className="text-lg font-medium text-[var(--light-gray)] mt-6 mb-2">Import from Google Drive (Backup File ID)</h4>
//                     <p className="text-sm text-[var(--light-green-2)] mb-3">Paste the File ID of a JSON backup file from Google Drive. This will fetch and import the data.</p>
//                     <div className="space-y-2">
//                         <input
//                             id="google-drive-file-id-input"
//                             type="text"
//                             placeholder="Enter Google Drive File ID of backup file"
//                             value={googleDriveFileId}
//                             onChange={(e) => setGoogleDriveFileId(e.target.value)}
//                             className="flex h-10 w-full rounded-md border border-input bg-none px-3 py-2 placeholder:text-[var(--light-green-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--light-green)] text-sm"
//                         />
//                         <button
//                             className="inline-flex items-center border justify-center gap-2 rounded-md text-sm font-medium bg-background hover:bg-[var(--orange)] hover:text-white bg-gray-100 h-10 px-4 py-2 w-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//                             onClick={handleGoogleDriveImport}
//                             disabled={!googleDriveFileId.trim() || isImporting}
//                         >
//                             <DatabaseBackup className="w-4 h-4" />
//                             {isImporting ? 'Importing...' : 'Import from Google Drive'}
//                         </button>
//                     </div>
//                 </div>

//             </div>

//             {/* Back Button */}
//             <button
//                 className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-[var(--light-green)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-none hover:text-white fixed top-6 left-6 z-50 h-14 w-14 rounded-full shadow-lg bg-white hover:bg-[var(--light-green)] text-[var(--light-gray)]"
//                 aria-label="Go back to previous page" title="Go back to previous page"
//                 onClick={() => navigate('/')}
//             >
//                 <ArrowLeft className="h-7 w-7" />
//                 <span className="sr-only">Go back to previous page</span>
//             </button>
//         </div>
//     )
// }

// export default DataManagement

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Upload, FileUp, FileCode, DatabaseZap, CloudUpload, List, X, FolderKey, DatabaseBackup, Clock, Settings } from 'lucide-react';
import { count } from 'console';

const DataManagement: React.FC = () => {
    const navigate = useNavigate();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [isGoogleDriveAuthenticated, setIsGoogleDriveAuthenticated] = useState(false);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [showAuthCodeModal, setShowAuthCodeModal] = useState(false);
    const [authCode, setAuthCode] = useState('');
    const [authError, setAuthError] = useState('');
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [googleDriveBackups, setGoogleDriveBackups] = useState([]);
    const [showBackupsList, setShowBackupsList] = useState(false);
    const [googleDriveFileId, setGoogleDriveFileId] = useState('');

    // Auto backup states
    const [isAutoBackupEnabled, setIsAutoBackupEnabled] = useState(false);
    const [autoBackupTime, setAutoBackupTime] = useState('13:00'); // Default to 1:00 PM
    const [isUpdatingAutoBackup, setIsUpdatingAutoBackup] = useState(false);
    const [lastAutoBackupTime, setLastAutoBackupTime] = useState<string | null>(null);


    useEffect(() => {
        checkGoogleDriveAuth();
        loadAutoBackupStatus();
    }, []);


    useEffect(() => {
        const handleAutoBackupCompleted = (data: any) => {
            if (data.success) {
                setLastAutoBackupTime(new Date().toLocaleString());
                // console.log('Auto backup completed successfully');
            } else {
                console.error('Auto backup failed:', data.error);
            }
        };

        (window as any).electronAPI.onAutoBackupCompleted(handleAutoBackupCompleted);

        return () => {
            // Cleanup if needed
        };
    }, []);

    // Load auto backup status
    const loadAutoBackupStatus = async () => {
        try {
            const api = (window as any).electronAPI;
            const status = await api.getAutoBackupStatus();
            setIsAutoBackupEnabled(status.enabled);
            if (status.time) {
                setAutoBackupTime(status.time);
            }
            if (status.lastBackupTime) {
                setLastAutoBackupTime(status.lastBackupTime);
            }
        } catch (error) {
            console.error('Failed to load auto backup status:', error);
        }
    };

    // Toggle auto backup
    const handleAutoBackupToggle = async () => {
        if (!isGoogleDriveAuthenticated) {
            await (window as any).electronAPI.showMessageBox({
                type: 'warning',
                title: 'Authentication Required',
                message: 'Please authenticate with Google Drive first to enable auto backup.'
            });
            return;
        }

        setIsUpdatingAutoBackup(true);
        try {
            const api = (window as any).electronAPI;
            const newEnabled = !isAutoBackupEnabled;

            const result = await api.enableAutoBackup(newEnabled, autoBackupTime);
            // console.log(result);
            if (result.success) {
                setIsAutoBackupEnabled(newEnabled);
                await api.showMessageBox({
                    type: 'info',
                    title: 'Auto Backup Updated',
                    message: newEnabled
                        ? `Auto backup enabled! Daily backups will occur at ${autoBackupTime}.`
                        : 'Auto backup disabled.'
                });
            } else {
                await api.showMessageBox({
                    type: 'error',
                    title: 'Error',
                    message: result.error || 'Failed to update auto backup settings'
                });
            }
        } catch (error) {
            console.error('Auto backup toggle error:', error);
            await (window as any).electronAPI.showMessageBox({
                type: 'error',
                title: 'Error',
                message: 'An unexpected error occurred while updating auto backup settings'
            });
        } finally {
            setIsUpdatingAutoBackup(false);
        }
    };

    // Update auto backup time
    const handleAutoBackupTimeChange = async (newTime: string) => {
        if (!isAutoBackupEnabled) {
            setAutoBackupTime(newTime);
            return;
        }

        setIsUpdatingAutoBackup(true);
        try {
            const api = (window as any).electronAPI;
            const result = await api.enableAutoBackup(true, newTime);

            if (result.success) {
                setAutoBackupTime(newTime);
                await api.showMessageBox({
                    type: 'info',
                    title: 'Auto Backup Time Updated',
                    message: `Auto backup time updated to ${newTime}.`
                });
            } else {
                await api.showMessageBox({
                    type: 'error',
                    title: 'Error',
                    message: result.error || 'Failed to update auto backup time'
                });
            }
        } catch (error) {
            console.error('Auto backup time update error:', error);
            await (window as any).electronAPI.showMessageBox({
                type: 'error',
                title: 'Error',
                message: 'An unexpected error occurred while updating auto backup time'
            });
        } finally {
            setIsUpdatingAutoBackup(false);
        }
    };

    const checkGoogleDriveAuth = async () => {
        try {
            const api = (window as any).electronAPI;
            const response = await api.checkGoogleDriveAuth();
            // Extract the authenticated property from the response object
            const isAuthenticated = response.authenticated;
            setIsGoogleDriveAuthenticated(isAuthenticated);
        } catch (error) {
            console.error('Failed to check Google Drive auth:', error);
            setIsGoogleDriveAuthenticated(false);
        }
    };

    const handleGoogleDriveAuth = async () => {
        setIsAuthenticating(true);
        setAuthError('');
        try {
            const api = (window as any).electronAPI;
            const authUrl = await api.getGoogleDriveAuthUrl();

            await api.openExternal(authUrl);
            setShowAuthCodeModal(true);
            setIsAuthenticating(false);
        } catch (error) {
            console.error('Google Drive auth error:', error);
            setIsAuthenticating(false);
            await (window as any).electronAPI.showMessageBox({
                type: 'error',
                title: 'Authentication Error',
                message: 'Failed to start Google Drive authentication process'
            });
        }
    };

    const handleAuthCodeSubmit = async () => {
        if (!authCode.trim()) {
            setAuthError('Please enter the authorization code');
            return;
        }

        try {
            setIsAuthenticating(true);
            setAuthError('');
            const api = (window as any).electronAPI;
            const result = await api.handleGoogleDriveAuthCallback(authCode.trim());

            if (result.success) {
                setIsGoogleDriveAuthenticated(true);
                setShowAuthCodeModal(false);
                setAuthCode('');
                console.log('Google Drive authentication successful');
            }
        } catch (error) {
            console.error('Error during auth callback:', error);
            setAuthError('Authentication failed. Please try again.');
        } finally {
            setIsAuthenticating(false);
        }
    };

    const handleAuthCodeModalClose = () => {
        setShowAuthCodeModal(false);
        setAuthCode('');
        setAuthError('');
    };

    // const handleReAuthenticate = async () => {
    //     setIsAuthenticating(true);
    //     try {
    //         const api = (window as any).electronAPI;
    //         const result = await api.reAuthenticateGoogleDrive();

    //         if (result.success) {
    //             await api.showMessageBox({
    //                 type: 'info',
    //                 title: 'Re-authentication Successful',
    //                 message: 'Google Drive re-authentication completed successfully!'
    //             });
    //         } else {
    //             await api.showMessageBox({
    //                 type: 'error',
    //                 title: 'Re-authentication Failed',
    //                 message: result.error || 'Failed to re-authenticate with Google Drive'
    //             });
    //         }
    //     } catch (error) {
    //         console.error('Re-authentication error:', error);
    //         await (window as any).electronAPI.showMessageBox({
    //             type: 'error',
    //             title: 'Error',
    //             message: 'An unexpected error occurred during re-authentication'
    //         });
    //     } finally {
    //         setIsAuthenticating(false);
    //     }
    // };

    const handleReAuthenticate = async () => {
        try {
            setIsAuthenticating(true);
            const api = (window as any).electronAPI;

            // Clear existing authentication
            const result = await api.reAuthenticateGoogleDrive();

            if (result.success) {
                // Update authentication status
                setIsGoogleDriveAuthenticated(false);

                // Show success message
                await api.showMessageBox({
                    type: 'info',
                    title: 'Re-authentication Required',
                    message: 'Previous authentication cleared. Please click "Authenticate with Google Drive" to re-authenticate.'
                });
            } else {
                await api.showMessageBox({
                    type: 'error',
                    title: 'Re-authentication Failed',
                    message: result.error || 'Failed to clear authentication. Please try again.'
                });
            }
        } catch (error) {
            console.error('Re-authentication error:', error);
            await (window as any).electronAPI.showMessageBox({
                type: 'error',
                title: 'Error',
                message: 'An error occurred during re-authentication. Please try again.'
            });
        } finally {
            setIsAuthenticating(false);
        }
    };

    const handleGoogleDriveBackup = async () => {
        setIsBackingUp(true);
        try {
            const api = (window as any).electronAPI;
            const result = await api.backupToGoogleDrive();

            if (result.success) {
                await api.showMessageBox({
                    type: 'info',
                    title: 'Backup Successful',
                    message: `Data backed up successfully to Google Drive!\n\nFile ID: ${result.fileId}\nFile Name: ${result.fileName}`
                });
            } else {
                await api.showMessageBox({
                    type: 'error',
                    title: 'Backup Failed',
                    message: result.error || 'Failed to backup data to Google Drive'
                });
            }
        } catch (error) {
            console.error('Google Drive backup error:', error);
            await (window as any).electronAPI.showMessageBox({
                type: 'error',
                title: 'Error',
                message: 'An unexpected error occurred during backup'
            });
        } finally {
            setIsBackingUp(false);
        }
    };

    const handleListGoogleDriveBackups = async () => {
        try {
            const api = (window as any).electronAPI;
            const result = await api.listGoogleDriveBackups();

            if (result.success) {
                setGoogleDriveBackups(result.files || []);
                setShowBackupsList(true);
            } else {
                await api.showMessageBox({
                    type: 'error',
                    title: 'Failed to List Backups',
                    message: result.error || 'Failed to retrieve backup list from Google Drive'
                });
            }
        } catch (error) {
            console.error('List backups error:', error);
            await (window as any).electronAPI.showMessageBox({
                type: 'error',
                title: 'Error',
                message: 'An unexpected error occurred while listing backups'
            });
        }
    };

    // Export to CSV
    const handleExportCSV = async () => {
        setIsExporting(true);
        try {
            const api = (window as any).electronAPI;
            const csvContent = await api.exportDataAsCSV();
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0];
            const filename = `sumry-backup-${dateStr}.csv`;
            const result = await api.saveFile(
                csvContent,
                filename,
                [{ name: 'CSV Files', extensions: ['csv'] }]
            );
        } catch (error) {
            console.error('CSV export error:', error);
        } finally {
            setIsExporting(false);
        }
    };

    // Export to JSON
    const handleExportJSON = async () => {
        setIsExporting(true);
        try {
            const api = (window as any).electronAPI;
            const jsonData = await api.exportDataAsJSON();
            const jsonContent = JSON.stringify(jsonData, null, 2);
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0];
            const filename = `sumry-backup-${dateStr}.json`;
            const result = await api.saveFile(
                jsonContent,
                filename,
                [{ name: 'JSON Files', extensions: ['json'] }]
            );
        } catch (error) {
            console.error('JSON export error:', error);
        } finally {
            setIsExporting(false);
        }
    };

    // Handle file selection for import
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.type === 'application/json' || file.name.endsWith('.json')) {
                setSelectedFile(file);
            } else {
                alert('Please select a valid JSON file.');
                event.target.value = '';
            }
        }
    };

    // Import from JSON file
    const handleImportJSON = async () => {
        if (!selectedFile) {
            return;
        }

        setIsImporting(true);
        try {
            const fileContent = await selectedFile.text();
            const api = (window as any).electronAPI;
            const result = await api.importDataFromJSON(fileContent);

            if (result && typeof result === 'object') {
                // console.log('Import successful! Imported counts:', result);
                setSelectedFile(null);
                const fileInput = document.getElementById('import-file-input') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
            } else {
                console.error('Import failed: Invalid response format');
            }
        } catch (error) {
            console.error('JSON import error:', error);
        } finally {
            setIsImporting(false);
        }
    };

    // Import from Google Drive
    const handleGoogleDriveImport = async () => {
        if (!isGoogleDriveAuthenticated) {
            await (window as any).electronAPI.showMessageBox({
                type: 'warning',
                title: 'Authentication Required',
                message: 'Please authenticate with Google Drive first.'
            });
            return;
        }

        if (!googleDriveFileId.trim()) {
            await (window as any).electronAPI.showMessageBox({
                type: 'warning',
                title: 'File ID Required',
                message: 'Please enter a Google Drive File ID.'
            });
            return;
        }

        setIsImporting(true);
        try {
            const api = (window as any).electronAPI;
            const result = await api.restoreFromGoogleDrive(googleDriveFileId.trim());

            if (result.success) {
                console.log(result);
                setGoogleDriveFileId('');
                const counts = result.importedCounts;
                await api.showMessageBox({
                    type: 'info',
                    title: 'Import Successful',
                    message: `Data imported successfully!\n\nImported:\n- ${counts.repairs} repairs\n- ${counts.users} users\n- ${counts.suggestions} suggestions\n- ${counts.whatsapp_templates} WhatsApp templates\n- ${counts.items} items\n- ${counts.settings} settings`
                });
            } else {
                await api.showMessageBox({
                    type: 'error',
                    title: 'Import Failed',
                    message: result.error || 'Failed to import data from Google Drive'
                });
            }
        } catch (error) {
            console.error('Google Drive import error:', error);
            await (window as any).electronAPI.showMessageBox({
                type: 'error',
                title: 'Error',
                message: 'An unexpected error occurred during import'
            });
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-[var(--light-green)] mb-6">Data Management</h1>
            <div data-orientation="horizontal" role="none" className="shrink-0 bg-gray-300 h-[1px] w-full mb-8"></div>

            {/* Authorization Code Modal */}
            {showAuthCodeModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Google Drive Authorization</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            A browser window has opened for Google authentication. After authorizing the app:
                            <br /><br />
                            1. Google will show you an authorization code
                            <br />
                            2. Copy the entire code
                            <br />
                            3. Paste it below
                        </p>
                        <input
                            type="text"
                            value={authCode}
                            onChange={(e) => setAuthCode(e.target.value)}
                            placeholder="Paste authorization code here"
                            className="w-full p-2 border border-gray-300 rounded mb-4 focus-visible:ring-2 focus-visible:ring-[var(--light-green)] outline-none"
                        />
                        {authError && (
                            <p className="text-red-500 text-sm mb-4">{authError}</p>
                        )}
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={handleAuthCodeModalClose}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-[var(--orange)] hover:text-white transition-colors duration-150"
                                disabled={isAuthenticating}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAuthCodeSubmit}
                                className="px-4 py-2 bg-[var(--light-green)] text-white rounded hover:bg-[var(--dark-green)] disabled:opacity-50"
                                disabled={isAuthenticating || !authCode.trim()}
                            >
                                {isAuthenticating ? 'Authenticating...' : 'Submit'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-8 py-4">

                {/* Google Drive Backup */}
                <div>
                    <h3 className="text-xl font-semibold text-[var(--light-green)] mb-2 flex items-center gap-2">
                        <DatabaseZap className="w-6 h-6" />
                        Google Drive Backup
                    </h3>

                    {/* Authentication Status */}
                    <div className="mb-4 p-3 rounded-md bg-gray-50">
                        <div className="flex items-center justify-between">
                            <p className="text-sm">
                                <strong>Status:</strong> {isGoogleDriveAuthenticated ?
                                    <span className="text-green-600">✓ Authenticated</span> :
                                    <span className="text-red-600">✗ Not Authenticated</span>
                                }
                            </p>
                            {isGoogleDriveAuthenticated && (
                                <button
                                    onClick={handleReAuthenticate}
                                    disabled={isAuthenticating}
                                    className="text-xs px-3 py-1 bg-green-100 text-[var(--light-green)] border rounded hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                >
                                    {isAuthenticating ? 'Re-authenticating...' : 'Re-authenticate'}
                                </button>
                            )}
                        </div>
                    </div>

                    {!isGoogleDriveAuthenticated && (
                        <div className="space-y-4">
                            <button
                                onClick={handleGoogleDriveAuth}
                                disabled={isAuthenticating}
                                className="w-full flex items-center justify-center gap-2 bg-[var(--light-green)] text-white py-2 px-4 rounded hover:bg-[var(--dark-green)] disabled:opacity-50"
                            >
                                <FolderKey />
                                {isAuthenticating ? 'Setting up authentication...' : 'Authenticate with Google Drive'}
                            </button>
                        </div>
                    )}

                    {isGoogleDriveAuthenticated && (
                        <>
                            <p className="text-sm text-[var(--light-green-2)] mb-3">Backup (JSON) includes repairs, suggestions, usernames, and custom WhatsApp messages.</p>

                            {/* Auto Backup Section */}
                            <div className="mb-4 p-4 border rounded-md bg-green-50">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-[var(--light-green)]" />
                                        <h4 className="font-medium text-[var(--light-green)]">Automatic Daily Backup</h4>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={isAutoBackupEnabled}
                                                onChange={handleAutoBackupToggle}
                                                disabled={isUpdatingAutoBackup}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                        </label>
                                        {isUpdatingAutoBackup && (
                                            <Settings className="w-4 h-4 animate-spin text-[var(--light-green)]" />
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm font-medium text-[var(--light-green)]">Backup Time:</label>
                                        <input
                                            type="time"
                                            value={autoBackupTime}
                                            onChange={(e) => handleAutoBackupTimeChange(e.target.value)}
                                            disabled={isUpdatingAutoBackup}
                                            className="px-2 py-1 border border-green-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[var(--light-green)] disabled:opacity-50"
                                        />
                                    </div>

                                    {lastAutoBackupTime && (
                                        <p className="text-xs text-[var(--light-green)]">
                                            Last auto backup: {lastAutoBackupTime}
                                        </p>
                                    )}

                                    <p className="text-xs text-[var(--light-green)]">
                                        {isAutoBackupEnabled
                                            ? `Auto backup is enabled and will run daily at ${autoBackupTime}`
                                            : 'Auto backup is disabled'
                                        }
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <button
                                    className="inline-flex items-center border justify-center gap-2 rounded-md text-sm font-medium bg-none hover:bg-[var(--orange)] hover:text-white bg-gray-100 h-10 px-4 py-2 w-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={handleGoogleDriveBackup}
                                    disabled={isBackingUp}
                                >
                                    <CloudUpload className="w-4 h-4" />
                                    {isBackingUp ? 'Backing up...' : 'Backup Data to Google Drive'}
                                </button>

                                <button
                                    className="inline-flex border items-center justify-center gap-2 rounded-md text-sm font-medium bg-none hover:bg-[var(--orange)] hover:text-white bg-gray-100 h-10 px-4 py-2 w-full transition-colors duration-200"
                                    onClick={handleListGoogleDriveBackups}
                                >
                                    <List className="w-4 h-4" />
                                    List Available Backups
                                </button>
                            </div>
                        </>
                    )}

                    {/* Backups List Modal/Section */}
                    {showBackupsList && (
                        <div className="mt-4 p-4 border rounded-md bg-gray-50">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="font-medium">Available Backups</h4>
                                <button
                                    onClick={() => setShowBackupsList(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X className='hover:text-[var(--red)]' />
                                </button>
                            </div>
                            {googleDriveBackups.length === 0 ? (
                                <p className="text-sm text-gray-600">No backups found.</p>
                            ) : (
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {googleDriveBackups.map((backup: any) => (
                                        <div key={backup.id} className="flex justify-between items-center p-2 bg-white rounded border">
                                            <div>
                                                <p className="text-sm font-medium">{backup.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(backup.createdTime).toLocaleString()}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setGoogleDriveFileId(backup.id);
                                                    setShowBackupsList(false);
                                                }}
                                                className="text-xs px-2 py-1 bg-green-100 border text-[var(--light-green)] rounded hover:bg-green-200"
                                            >
                                                Select
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Local Data Export */}
                <div>
                    <h3 className="text-xl font-semibold text-[var(--light-green)] mb-2 mt-6 flex items-center gap-2">
                        <Download className="w-6 h-6" />
                        Local Data Export
                    </h3>
                    <div className="space-y-3">
                        <p className="text-sm text-[var(--light-green-2)]">Download all data (repairs, suggestions, users with passwords, custom WhatsApp messages) as a CSV file.</p>
                        <button
                            className="inline-flex border items-center justify-center gap-2 rounded-md text-sm font-medium bg-none hover:bg-[var(--orange)] hover:text-white bg-gray-100 h-10 px-4 py-2 w-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleExportCSV}
                            disabled={isExporting}
                        >
                            <Download className="w-4 h-4" />
                            {isExporting ? 'Exporting...' : 'Export Data to CSV (Excel)'}
                        </button>

                        <p className="text-sm text-[var(--light-green-2)] mt-3">Download all data (repairs, suggestions, users with passwords, custom WhatsApp messages) as a JSON file.</p>
                        <button
                            className="inline-flex items-center border justify-center gap-2 rounded-md text-sm font-medium bg-none hover:bg-[var(--orange)] hover:text-white bg-gray-100 h-10 px-4 py-2 w-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleExportJSON}
                            disabled={isExporting}
                        >
                            <FileCode className="w-4 h-4" />
                            {isExporting ? 'Exporting...' : 'Export Data to JSON'}
                        </button>
                    </div>
                </div>

                {/* Import Data */}
                <div>
                    <h3 className="text-xl font-semibold text-[var(--light-green)] mb-2 mt-6 flex items-center gap-2">
                        <FileUp className="w-6 h-6" />
                        Import Data
                    </h3>

                    <h4 className="text-lg font-medium text-[var(--light-gray)] mt-4 mb-2">Import Data from Local JSON File</h4>
                    <p className="text-sm text-[var(--light-green-2)] mb-3">Import data from a JSON file. This will OVERWRITE existing repairs, suggestions, user accounts, and custom WhatsApp messages.</p>
                    <div className="space-y-2">
                        <input
                            id="import-file-input"
                            type="file"
                            accept=".json"
                            onChange={handleFileSelect}
                            className="flex h-10 w-full rounded-md border border-none bg-none px-3 py-2 placeholder:text-[var(--light-green)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--light-green)] text-sm file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gray-200 file:text-[var(--light-green)] hover:file:bg-[var(--light-green)]/80"
                        />
                        <button
                            className="inline-flex items-center border justify-center gap-2 rounded-md text-sm font-medium bg-background hover:bg-[var(--orange)] hover:text-white bg-gray-100 h-10 px-4 py-2 w-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleImportJSON}
                            disabled={!selectedFile || isImporting}
                        >
                            <Upload className="w-4 h-4" />
                            {isImporting ? 'Importing...' : 'Import from JSON File'}
                        </button>
                    </div>

                    <h4 className="text-lg font-medium text-[var(--light-gray)] mt-6 mb-2">Import from Google Drive (Backup File ID)</h4>
                    <p className="text-sm text-[var(--light-green-2)] mb-3">Paste the File ID of a JSON backup file from Google Drive. This will fetch and import the data.</p>
                    <div className="space-y-2">
                        <input
                            id="google-drive-file-id-input"
                            type="text"
                            placeholder="Enter Google Drive File ID of backup file"
                            value={googleDriveFileId}
                            onChange={(e) => setGoogleDriveFileId(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-none px-3 py-2 placeholder:text-[var(--light-green-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--light-green)] text-sm"
                        />
                        <button
                            className="inline-flex items-center border justify-center gap-2 rounded-md text-sm font-medium bg-background hover:bg-[var(--orange)] hover:text-white bg-gray-100 h-10 px-4 py-2 w-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleGoogleDriveImport}
                            disabled={!googleDriveFileId.trim() || isImporting}
                        >
                            <DatabaseBackup className="w-4 h-4" />
                            {isImporting ? 'Importing...' : 'Import from Google Drive'}
                        </button>
                    </div>
                </div>

            </div>

            {/* Back Button */}
            <button
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-[var(--light-green)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-none hover:text-white fixed top-6 left-6 z-50 h-14 w-14 rounded-full shadow-lg bg-white hover:bg-[var(--light-green)] text-[var(--light-gray)]"
                aria-label="Go back to previous page" title="Go back to previous page"
                onClick={() => navigate('/')}
            >
                <ArrowLeft className="h-7 w-7" />
                <span className="sr-only">Go back to previous page</span>
            </button>
        </div>
    )
}

export default DataManagement