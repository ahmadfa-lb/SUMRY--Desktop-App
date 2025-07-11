import { app, BrowserWindow, Menu, ipcMain } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import dotenv from 'dotenv';
import { shell } from 'electron';
const { google } = require('googleapis');
const fs = require('fs').promises;
// const cron = require('node-cron');
import cron from 'node-cron';

const http = require('http');
const url = require('url');

let oauthServer = null;
let pendingAuthResolve = null;

const https = require('https');
const querystring = require('querystring');
dotenv.config();

// Add this near the top with other imports
const databaseService = require('./database.cjs');

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SCOPES } = process.env;

// Google OAuth2 configuration for Desktop Application
const GOOGLE_CLIENT_ID = "1033737566088-noa8bfdjlj4kfed2c0d5obvgjo0jbb4a.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";
const SCOPES = "https://www.googleapis.com/auth/drive.file";

// OAuth2 client
let oauth2Client = null;

// function createOAuth2Client(port = 3000) {
//   const client = new google.auth.OAuth2(
//     GOOGLE_CLIENT_ID,
//     GOOGLE_CLIENT_SECRET,
//     `http://localhost:${port}/oauth/callback`
//   );

//   // Disable PKCE for desktop applications
//   client.generateAuthUrlAsync = undefined;

//   return client;
// }

function createOAuth2Client(port = 3000) {
  const client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    `http://localhost:${port}/oauth/callback`
  );

  // Completely override the getToken method to avoid PKCE
  const originalTransporter = client.transporter;

  client.getToken = async function (codeOrOptions) {
    const options = typeof codeOrOptions === 'string'
      ? { code: codeOrOptions }
      : codeOrOptions;

    // Make direct HTTP request without PKCE parameters
    const tokenData = {
      code: options.code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: `http://localhost:${port}/oauth/callback`,
      grant_type: 'authorization_code'
    };

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(tokenData).toString()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Token exchange failed: ${errorData.error} - ${errorData.error_description}`);
    }

    const tokens = await response.json();
    this.setCredentials(tokens);
    return { tokens };
  };

  return client;
}

// The built directory structure
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, '../public')

let win

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: true,
      contextIsolation: true
    },
    titleBarStyle: 'default',
    show: false
  })

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date()).toLocaleString())
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    // win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }

  win.once('ready-to-show', () => {
    win.show()
  })
}

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
});


let autoBackupJob = null;

function setupAutoBackup() {
  try {
    // Load auto backup settings from database
    const settings = databaseService.getAutoBackupSettings();

    if (settings.enabled) {
      const [hour, minute] = settings.time.split(':').map(Number);

      autoBackupJob = cron.schedule(`${minute} ${hour} * * *`, async () => {
        console.log('Running automatic Google Drive backup...');
        try {
          const auth = await loadSavedTokens(); // Fix: await the async function
          if (auth) {
            const result = await databaseService.backupToGoogleDrive(auth);

            if (win && !win.isDestroyed()) { // Fix: use 'win' instead of 'mainWindow'
              win.webContents.send('auto-backup-completed', {
                success: result.success,
                message: result.success ?
                  `Auto backup completed: ${result.filename}` :
                  `Auto backup failed: ${result.error}`,
                timestamp: new Date().toISOString()
              });
            }
          } else {
            console.log('No Google Drive authentication found for auto backup');
            if (win && !win.isDestroyed()) { // Fix: use 'win' instead of 'mainWindow'
              win.webContents.send('auto-backup-completed', {
                success: false,
                message: 'Auto backup failed: Google Drive not authenticated',
                timestamp: new Date().toISOString()
              });
            }
          }
        } catch (error) {
          console.error('Auto backup error:', error);
          if (win && !win.isDestroyed()) { // Fix: use 'win' instead of 'mainWindow'
            win.webContents.send('auto-backup-completed', {
              success: false,
              message: `Auto backup failed: ${error.message}`,
              timestamp: new Date().toISOString()
            });
          }
        }
      }, {
        scheduled: false,
        timezone: 'Asia/Beirut'
      });

      autoBackupJob.start();
      console.log(`Auto backup restored from settings: ${settings.time} daily`);
    }
  } catch (error) {
    console.error('Error setting up auto backup from saved settings:', error);
  }
}

app.whenReady().then(() => {
  createWindow()


  // Set up application menu
  const template = [
    {
      label: 'File',
      submenu: [
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit()
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)



  // Register IPC handlers
  registerIpcHandlers();

  // Setup auto backup scheduler
  // const backupJob = setupAutoBackup();
  setupAutoBackup();
  databaseService.createDefaultAdminIfNeeded();
  // Start the backup job
  // backupJob.start();
  console.log('Auto backup scheduler started - will run daily at 1:00 PM');
})

function createOAuthServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer();
    let serverPort = null;

    server.on('request', (req, res) => {
      const parsedUrl = url.parse(req.url, true);

      if (parsedUrl.pathname === '/oauth/callback') {
        const { code, error } = parsedUrl.query;

        if (error) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end(`<html><body><h1>Authentication Failed</h1><p>Error: ${error}</p><p>You can close this window.</p></body></html>`);
        } else if (code) {
          // Display the authorization code for manual copying
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <head>
                <title>Google Drive Authorization</title>
                <style>
                  body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
                  .code-container { background: #f5f5f5; padding: 20px; margin: 20px; border-radius: 8px; }
                  .auth-code { font-family: monospace; font-size: 16px; word-break: break-all; background: white; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
                  .copy-btn { background: #4285f4; color: white; border: none; padding: 10px 20px; margin: 10px; border-radius: 4px; cursor: pointer; }
                  .copy-btn:hover { background: #3367d6; }
                </style>
              </head>
              <body>
                <h1>Authorization Successful!</h1>
                <div class="code-container">
                  <h3>Copy this authorization code:</h3>
                  <div class="auth-code" id="authCode">${code}</div>
                  <button class="copy-btn" onclick="copyCode()">Copy Code</button>
                </div>
                <p>Paste this code into the application and click "Submit".</p>
                <p>You can close this window after copying the code.</p>
                <script>
                  function copyCode() {
                    const codeElement = document.getElementById('authCode');
                    navigator.clipboard.writeText(codeElement.textContent).then(() => {
                      alert('Code copied to clipboard!');
                    });
                  }
                </script>
              </body>
            </html>
          `);
        } else {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end('<html><body><h1>Invalid Request</h1><p>You can close this window.</p></body></html>');
        }

        // Keep server running for manual code entry
        // Don't close the server automatically
      } else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<html><body><h1>Not Found</h1></body></html>');
      }
    });

    // Try port 3000 first
    const tryPort = (port) => {
      server.listen(port, 'localhost', () => {
        serverPort = port;
        console.log(`OAuth callback server started on http://localhost:${port}`);
        resolve({ server, port });
      });
    };

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        if (serverPort === null) {
          console.log('Port 3000 is busy, trying port 3001...');
          tryPort(3001);
        } else {
          console.error('Both ports 3000 and 3001 are busy');
          reject(new Error('Unable to start OAuth server: both ports 3000 and 3001 are in use'));
        }
      } else {
        reject(err);
      }
    });

    tryPort(3000);
  });
}

function registerIpcHandlers() {
  // Basic IPC handlers
  ipcMain.handle('get-app-version', () => {
    return app.getVersion()
  })

    ipcMain.on('show-context-menu', (event) => {
    const template = [
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { type: 'separator' },
      { role: 'selectAll' }
    ];
    
    const menu = Menu.buildFromTemplate(template);
    menu.popup({ window: BrowserWindow.fromWebContents(event.sender) });
  });

  ipcMain.handle('open-external', async (event, url) => {
    try {
      await shell.openExternal(url);
      return { success: true };
    } catch (error) {
      console.error('Error opening external URL:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('show-message-box', async (event, options) => {
    const { dialog } = await import('electron')
    const result = await dialog.showMessageBox(win, options)
    return result
  })

  // Database handlers
  ipcMain.handle('login', async (_, username, password) => {
    return databaseService.getUserByCredentials(username, password);
  });

  ipcMain.handle('create-default-admin', async () => {
    return databaseService.createDefaultAdminIfNeeded();
  });

  ipcMain.handle('create-user', async (_, username, password) => {
    try {
      const userId = databaseService.addUser(username, password);
      return { success: true, userId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('get-all-users', async () => {
    return databaseService.getAllUsers();
  });

  ipcMain.handle('delete-user', async (_, userId) => {
    try {
      return databaseService.deleteUser(userId);
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Repair handlers
  ipcMain.handle('get-all-repairs', async () => {
    return databaseService.getAllRepairs();
  });

  ipcMain.handle('get-repair-by-id', async (_, id) => {
    return databaseService.getRepairById(id);
  });

  ipcMain.handle('get-repairs-by-serial-number', async (_, serialNumber) => {
    return databaseService.getRepairsBySerialNumber(serialNumber);
  });

  ipcMain.handle('add-repair', async (_, repair) => {
    return databaseService.addRepair(repair);
  });

  ipcMain.handle('update-repair', async (_, id, updates) => {
    return databaseService.updateRepair(id, updates);
  });

  ipcMain.handle('delete-repair', async (_, id) => {
    return databaseService.deleteRepair(id);
  });

  // Customer handlers
  ipcMain.handle('get-all-customers', async () => {
    return databaseService.getAllCustomers();
  });

  ipcMain.handle('get-customer-repairs', async (_, customerName, contact) => {
    return databaseService.getCustomerRepairs(customerName, contact);
  });

  ipcMain.handle('update-customer-info', async (_, oldCustomerName, oldContact, newCustomerName, newContact) => {
    return databaseService.updateCustomerInfo(oldCustomerName, oldContact, newCustomerName, newContact);
  });

  ipcMain.handle('delete-customer', async (_, customerName, contact) => {
    return databaseService.deleteCustomer(customerName, contact);
  });

  ipcMain.handle('search-customers', async (_, searchTerm) => {
    return databaseService.searchCustomers(searchTerm);
  });

  ipcMain.handle('can-delete-customer', async (_, customerName, contact) => {
    return databaseService.canDeleteCustomer(customerName, contact);
  });

  // Suggestion handlers
  ipcMain.handle('get-all-suggestions', async (_, type) => {
    return databaseService.getAllSuggestions(type);
  });

  ipcMain.handle('add-suggestion', async (_, type, value) => {
    return databaseService.addSuggestion(type, value);
  });

  ipcMain.handle('remove-suggestion', async (_, type, value) => {
    return databaseService.removeSuggestion(type, value);
  });

  ipcMain.handle('clear-all-suggestions', async (_, type) => {
    return databaseService.clearAllSuggestions(type);
  });

  // Data export/import handlers
  ipcMain.handle('export-data-json', async () => {
    return databaseService.exportDataAsJSON();
  });

  ipcMain.handle('export-data-csv', async () => {
    return databaseService.exportDataAsCSV();
  });

  ipcMain.handle('import-data-json', async (_, jsonData) => {
    return databaseService.importDataFromJSON(jsonData);
  });

  // File operations
  ipcMain.handle('save-file', async (event, data, filename, filters) => {
    const { dialog } = await import('electron');
    try {
      const result = await dialog.showSaveDialog(win, {
        defaultPath: filename,
        filters: filters || [
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'CSV Files', extensions: ['csv'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (!result.canceled && result.filePath) {
        const fs = await import('fs/promises');
        await fs.writeFile(result.filePath, data, 'utf8');
        return { success: true, filePath: result.filePath };
      }

      return { success: false, canceled: true };
    } catch (error) {
      console.error('Error saving file:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('load-file', async () => {
    const { dialog } = await import('electron');
    try {
      const result = await dialog.showOpenDialog(win, {
        filters: [
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile']
      });

      if (!result.canceled && result.filePaths.length > 0) {
        const fs = await import('fs/promises');
        const data = await fs.readFile(result.filePaths[0], 'utf8');
        return { success: true, data, filePath: result.filePaths[0] };
      }

      return { success: false, canceled: true };
    } catch (error) {
      console.error('Error loading file:', error);
      return { success: false, error: error.message };
    }
  });

  // Google Drive authentication handlers
  // ipcMain.handle('google-drive-auth-url', async () => {
  //   try {
  //     const oauth2Client = createOAuth2Client();
  //     const authUrl = oauth2Client.generateAuthUrl({
  //       access_type: 'offline',
  //       scope: SCOPES
  //     });
  //     console.log('Generated auth URL:', authUrl);
  //     return authUrl;
  //   } catch (error) {
  //     console.error('Error generating auth URL:', error);
  //     throw error;
  //   }
  // });

  ipcMain.handle('google-drive-auth-url', async () => {
    try {
      // Close any existing server first
      if (oauthServer) {
        oauthServer.close();
        oauthServer = null;
      }

      // Start the OAuth callback server
      const { server, port } = await createOAuthServer();
      oauthServer = server;

      const oauth2Client = createOAuth2Client(port);
      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent' // Force consent screen to get refresh token
      });
      console.log('Generated auth URL:', authUrl);
      return authUrl;
    } catch (error) {
      console.error('Error generating auth URL:', error);
      throw error;
    }
  });

  ipcMain.handle('google-drive-auth-callback', async (event, code) => {
    try {
      console.log('Received authorization code:', code);

      // Determine the port from the running server
      const port = oauthServer && oauthServer.address() ? oauthServer.address().port : 3000;
      const oauth2Client = createOAuth2Client(port);

      // Exchange code for tokens
      const { tokens } = await oauth2Client.getToken(code);
      console.log('Received tokens:', tokens);

      // Save tokens to file
      const userDataPath = app.getPath('userData');
      const tokensPath = path.join(userDataPath, 'google-tokens.json');
      await fs.writeFile(tokensPath, JSON.stringify(tokens, null, 2));
      console.log('Tokens saved to:', tokensPath);

      // Close the OAuth server after successful authentication
      if (oauthServer) {
        oauthServer.close();
        oauthServer = null;
        console.log('OAuth server closed');
      }

      return { success: true, tokens };
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);

      // Close server even on error
      if (oauthServer) {
        oauthServer.close();
        oauthServer = null;
      }

      return { success: false, error: error.message };
    }
  });

  // Load saved tokens
  // async function loadSavedTokens() {
  //   try {
  //     const tokensPath = path.join(__dirname, 'google-tokens.json');
  //     const tokensData = await fs.readFile(tokensPath, 'utf8');

  //     if (!tokensData.trim()) {
  //       return null;
  //     }

  //     const tokens = JSON.parse(tokensData);

  //     oauth2Client = createOAuth2Client();
  //     oauth2Client.setCredentials(tokens);

  //     return oauth2Client;
  //   } catch (error) {
  //     if (error.code === 'ENOENT') {
  //       // File doesn't exist, this is normal for first run
  //       console.log('No saved tokens found (first run)');
  //       return null;
  //     }
  //     console.error('Error loading saved tokens:', error);
  //     return null;
  //   }
  // }

  async function loadSavedTokens() {
    try {
      // Use userData directory instead of __dirname
      const userDataPath = app.getPath('userData');
      const tokensPath = path.join(userDataPath, 'google-tokens.json');
      const tokensData = await fs.readFile(tokensPath, 'utf8');

      if (!tokensData.trim()) {
        return null;
      }

      const tokens = JSON.parse(tokensData);

      oauth2Client = createOAuth2Client();
      oauth2Client.setCredentials(tokens);

      return oauth2Client;
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, this is normal for first run
        console.log('No saved tokens found (first run)');
        return null;
      }
      console.error('Error loading saved tokens:', error);
      return null;
    }
  }

  // Google Drive backup handlers
  ipcMain.handle('backup-to-google-drive', async () => {
    try {
      const auth = await loadSavedTokens();
      if (!auth) {
        return { success: false, error: 'Google Drive authentication required' };
      }

      const result = await databaseService.backupToGoogleDrive(auth);
      return result;
    } catch (error) {
      console.error('Error in backup-to-google-drive handler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('enable-auto-backup', async (event, enabled, time) => {
    try {
      const settings = {
        enabled: enabled,
        time: time || '13:00'
      };

      // Save settings to database
      databaseService.setAutoBackupSettings(settings);

      if (enabled) {
        // Parse time (format: "HH:MM")
        const [hour, minute] = time.split(':').map(Number);

        // Stop existing job if any
        if (autoBackupJob) {
          autoBackupJob.stop();
          autoBackupJob.destroy();
        }

        // Create new cron job for daily backup at specified time
        autoBackupJob = cron.schedule(`${minute} ${hour} * * *`, async () => {
          console.log('Running automatic Google Drive backup...');
          try {
            const auth = await loadSavedTokens(); // Fix: await the async function
            if (auth) {
              const result = await databaseService.backupToGoogleDrive(auth);

              // Send notification to renderer
              if (win && !win.isDestroyed()) { // Fix: use 'win' instead of 'mainWindow'
                win.webContents.send('auto-backup-completed', {
                  success: result.success,
                  message: result.success ?
                    `Auto backup completed: ${result.filename}` :
                    `Auto backup failed: ${result.error}`,
                  timestamp: new Date().toISOString()
                });
              }
            } else {
              console.log('No Google Drive authentication found for auto backup');
              if (win && !win.isDestroyed()) { // Fix: use 'win' instead of 'mainWindow'
                win.webContents.send('auto-backup-completed', {
                  success: false,
                  message: 'Auto backup failed: Google Drive not authenticated',
                  timestamp: new Date().toISOString()
                });
              }
            }
          } catch (error) {
            console.error('Auto backup error:', error);
            if (win && !win.isDestroyed()) { // Fix: use 'win' instead of 'mainWindow'
              win.webContents.send('auto-backup-completed', {
                success: false,
                message: `Auto backup failed: ${error.message}`,
                timestamp: new Date().toISOString()
              });
            }
          }
        }, {
          scheduled: false,
          timezone: 'Asia/Beirut'
        });

        autoBackupJob.start();
        console.log(`Auto backup scheduled for ${time} daily`);
      } else {
        // Stop and destroy existing job
        if (autoBackupJob) {
          autoBackupJob.stop();
          autoBackupJob.destroy();
          autoBackupJob = null;
        }
        console.log('Auto backup disabled');
      }

      return { success: true, settings };
    } catch (error) {
      console.error('Error setting up auto backup:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('get-auto-backup-status', async () => {
    try {
      const settings = databaseService.getAutoBackupSettings();
      const hasActiveJob = autoBackupJob !== null;

      return {
        success: true,
        enabled: settings.enabled,
        time: settings.time,
        nextRun: autoBackupJob && autoBackupJob.nextDates ? autoBackupJob.nextDates(1)[0]?.toISOString() : null,
        jobActive: hasActiveJob
      };
    } catch (error) {
      console.error('Error getting auto backup status:', error);
      return { success: false, error: error.message };
    }
  });



  ipcMain.handle('restore-from-google-drive', async (event, fileId) => {
    try {
      const auth = await loadSavedTokens();
      if (!auth) {
        return { success: false, error: 'Google Drive authentication required' };
      }

      const result = await databaseService.restoreFromGoogleDrive(auth, fileId);
      return result;
    } catch (error) {
      console.error('Error in restore-from-google-drive handler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('list-google-drive-backups', async () => {
    try {
      const auth = await loadSavedTokens();
      if (!auth) {
        return { success: false, error: 'Google Drive authentication required' };
      }

      const result = await databaseService.listGoogleDriveBackups(auth);
      return result;
    } catch (error) {
      console.error('Error in list-google-drive-backups handler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('check-google-drive-auth', async () => {
    try {
      const auth = await loadSavedTokens();
      return { success: true, authenticated: !!auth };
    } catch (error) {
      return { success: true, authenticated: false };
    }
  });

  ipcMain.handle('re-authenticate-google-drive', async () => {
    try {
      // Delete the existing tokens file to force re-authentication
      // const tokensPath = path.join(__dirname, 'google-tokens.json');
      const userDataPath = app.getPath('userData');
      const tokensPath = path.join(userDataPath, 'google-tokens.json');
      try {
        await fs.unlink(tokensPath);
        console.log('Existing Google Drive tokens deleted');
      } catch (error) {
        if (error.code !== 'ENOENT') {
          console.error('Error deleting tokens file:', error);
        }
      }

      // Reset the oauth2Client
      oauth2Client = null;

      return { success: true, message: 'Re-authentication initiated. Please authenticate again.' };
    } catch (error) {
      console.error('Error during re-authentication:', error);
      return { success: false, error: error.message };
    }
  });


  // Items/Stock management handlers
  ipcMain.handle('get-all-items', async () => {
    return databaseService.getAllItems();
  });

  ipcMain.handle('get-item-by-id', async (_, id) => {
    return databaseService.getItemById(id);
  });

  ipcMain.handle('get-item-by-serial-number', async (_, serialNumber) => {
    return databaseService.getItemBySerialNumber(serialNumber);
  });

  ipcMain.handle('add-item', async (_, item) => {
    return databaseService.addItem(item);
  });

  ipcMain.handle('update-item', async (_, id, updates) => {
    return databaseService.updateItem(id, updates);
  });

  ipcMain.handle('delete-item', async (_, id) => {
    return databaseService.deleteItem(id);
  });

  ipcMain.handle('mark-item-as-sold', async (_, id, salePrice) => {
    return databaseService.markItemAsSold(id, salePrice);
  });

  ipcMain.handle('mark-item-as-available', async (_, id) => {
    return databaseService.markItemAsAvailable(id);
  });

  ipcMain.handle('search-items', async (_, searchTerm) => {
    return databaseService.searchItems(searchTerm);
  });

  ipcMain.handle('get-items-by-category', async (_, category) => {
    return databaseService.getItemsByCategory(category);
  });

  ipcMain.handle('get-items-by-status', async (_, sold) => {
    return databaseService.getItemsByStatus(sold);
  });

  // WhatsApp Templates handlers
  ipcMain.handle('get-all-whatsapp-templates', async () => {
    return databaseService.getAllWhatsAppTemplates();
  });

  ipcMain.handle('get-whatsapp-template-by-status', async (_, status) => {
    return databaseService.getWhatsAppTemplateByStatus(status);
  });

  ipcMain.handle('update-whatsapp-template', async (_, status, template) => {
    return databaseService.updateWhatsAppTemplate(status, template);
  });

  ipcMain.handle('update-all-whatsapp-templates', async (_, templates) => {
    return databaseService.updateAllWhatsAppTemplates(templates);
  });

  ipcMain.handle('reset-whatsapp-templates-to-default', async () => {
    return databaseService.resetWhatsAppTemplatesToDefault();
  });

  ipcMain.handle('get-shop-overview-stats', async () => {
    try {
      return await databaseService.getShopOverviewStats();
    } catch (error) {
      console.error('Error getting shop overview stats:', error);
      throw error;
    }
  });
}