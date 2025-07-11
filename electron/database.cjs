const path = require('path');
const { app } = require('electron');

const Database = (() => {
  try {
    return require('better-sqlite3');
  } catch (err) {
    console.error('Failed to load better-sqlite3:', err);
    throw err;
  }
})();

class DatabaseService {
  constructor() {
    // Store database in user data directory (persists between app updates)
    const userDataPath = app.getPath('userData');
    console.log(userDataPath);
    this.dbPath = path.join(userDataPath, 'sumry.db');
    console.log(`Database path: ${this.dbPath}`);

    // Initialize database connection
    this.db = new Database(this.dbPath);

    // Create tables if they don't exist
    this.initDatabase();
  }

  initDatabase() {
    // Enable foreign keys
    this.db.pragma('foreign_keys = ON');

    // Create tables with a transaction for atomicity
    this.db.transaction(() => {
      // Updated repairs table with more detailed schema
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS repairs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          customer_name TEXT NOT NULL,
          contact TEXT,
          item_brand TEXT NOT NULL,
          item_model TEXT,
          serial_number TEXT,
          under_warranty INTEGER DEFAULT 0,
          problem_description TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'Pending Diagnosis',
          repair_cost REAL DEFAULT 0,
          amount_paid REAL DEFAULT 0,
          parts_used TEXT DEFAULT '[]',
          is_unlocked INTEGER DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);

      // Users table
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
      `);

      // WhatsApp Templates table
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS whatsapp_templates (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          status TEXT NOT NULL UNIQUE,
          template TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);

      // Insert default templates if table is empty
      const templateCount = this.db.prepare('SELECT COUNT(*) as count FROM whatsapp_templates').get();
      if (templateCount.count === 0) {
        const defaultTemplates = [
          { status: 'Pending Diagnosis', template: 'Hello {customerName}, your {itemBrand} {itemModel} (Serial: {serialNumber}) is now under diagnosis. We will update you soon with our findings.' },
          { status: 'Awaiting Parts', template: 'Hi {customerName}, we have diagnosed your {itemBrand} {itemModel} and are currently waiting for parts to arrive. Estimated repair cost: ${repairCost}.' },
          { status: 'In Progress', template: 'Good news {customerName}! We are now working on repairing your {itemBrand} {itemModel}. The repair is in progress.' },
          { status: 'Completed', template: 'Great news {customerName}! Your {itemBrand} {itemModel} repair is completed. Total cost: ${repairCost}. Please come pick it up at your convenience.' },
          { status: 'Awaiting Pickup', template: 'Hello {customerName}, your {itemBrand} {itemModel} is ready for pickup. Please visit us to collect your device.' },
          { status: 'Picked Up', template: 'Thank you {customerName} for choosing our services. Your {itemBrand} {itemModel} has been successfully picked up.' },
          { status: 'Cancelled', template: 'Hello {customerName}, the repair for your {itemBrand} {itemModel} has been cancelled as requested.' }
        ];

        const insertTemplate = this.db.prepare(`
          INSERT INTO whatsapp_templates (status, template, created_at, updated_at)
          VALUES (?, ?, ?, ?)
        `);

        const now = new Date().toISOString();
        for (const template of defaultTemplates) {
          insertTemplate.run(template.status, template.template, now, now);
        }
      }

      // Suggestions table for brands, models, and parts
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS suggestions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL CHECK (type IN ('brand', 'model', 'parts')),
          value TEXT NOT NULL,
          created_at TEXT NOT NULL,
          UNIQUE(type, value)
        );
      `);

      // Settings table for application settings
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          key TEXT NOT NULL UNIQUE,
          value TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);

      // Check if we need to migrate old table structure
      const tableInfo = this.db.prepare("PRAGMA table_info(repairs)").all();
      const hasContactColumn = tableInfo.some(col => col.name === 'contact');
      const hasRepairCostColumn = tableInfo.some(col => col.name === 'repair_cost');

      if (!hasContactColumn) {
        // Migrate old table structure
        this.db.exec(`
          ALTER TABLE repairs ADD COLUMN contact TEXT;
          ALTER TABLE repairs ADD COLUMN item_brand TEXT;
          ALTER TABLE repairs ADD COLUMN item_model TEXT;
          ALTER TABLE repairs ADD COLUMN serial_number TEXT;
          ALTER TABLE repairs ADD COLUMN under_warranty INTEGER DEFAULT 0;
          ALTER TABLE repairs ADD COLUMN problem_description TEXT;
        `);

        // Update existing records to move 'device' to 'item_brand' and 'issue' to 'problem_description'
        this.db.exec(`
          UPDATE repairs SET 
            item_brand = device,
            problem_description = issue
          WHERE item_brand IS NULL;
        `);
      }

      // Add cost tracking columns if they don't exist
      if (!hasRepairCostColumn) {
        this.db.exec(`
          ALTER TABLE repairs ADD COLUMN repair_cost REAL DEFAULT 0;
          ALTER TABLE repairs ADD COLUMN amount_paid REAL DEFAULT 0;
          ALTER TABLE repairs ADD COLUMN parts_used TEXT DEFAULT '[]';
        `);
      }

      this.db.exec(`
        CREATE TABLE IF NOT EXISTS items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          model TEXT NOT NULL,
          category TEXT,
          power_rate TEXT,
          serial_number TEXT UNIQUE,
          notes TEXT,
          status TEXT NOT NULL DEFAULT 'Available',
          sold INTEGER DEFAULT 0,
          sale_price REAL,
          sale_date TEXT,
          date_added TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);
    })();

    console.log('Database initialized successfully');
  }

  // Settings methods
  getSetting(key) {
    const result = this.db.prepare(`
      SELECT value FROM settings WHERE key = ?
    `).get(key);

    if (result) {
      try {
        return JSON.parse(result.value);
      } catch (e) {
        return result.value;
      }
    }
    return null;
  }

  setSetting(key, value) {
    const now = new Date().toISOString();
    const valueStr = typeof value === 'string' ? value : JSON.stringify(value);

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO settings (key, value, created_at, updated_at)
      VALUES (?, ?, COALESCE((SELECT created_at FROM settings WHERE key = ?), ?), ?)
    `);

    return stmt.run(key, valueStr, key, now, now);
  }

  // Auto backup specific methods
  getAutoBackupSettings() {
    return this.getSetting('auto_backup') || {
      enabled: false,
      time: '13:00' // Default to 1:00 PM
    };
  }

  setAutoBackupSettings(settings) {
    return this.setSetting('auto_backup', settings);
  }

  // CRUD operations for repairs
  getAllRepairs() {
    return this.db.prepare(`
      SELECT 
        id,
        customer_name,
        contact,
        item_brand,
        item_model,
        serial_number,
        under_warranty,
        problem_description,
        status,
        repair_cost,
        amount_paid,
        parts_used,
        is_unlocked,
        created_at,
        updated_at
      FROM repairs 
      ORDER BY created_at DESC
    `).all();
  }

  getRepairById(id) {
    return this.db.prepare(`
      SELECT 
        id,
        customer_name,
        contact,
        item_brand,
        item_model,
        serial_number,
        under_warranty,
        problem_description,
        status,
        repair_cost,
        amount_paid,
        parts_used,
        is_unlocked,
        created_at,
        updated_at
      FROM repairs 
      WHERE id = ?
    `).get(id);
  }

  getRepairsBySerialNumber(serialNumber) {
    return this.db.prepare(`
      SELECT
        id,
        customer_name,
        contact,
        item_brand,
        item_model,
        serial_number,
        under_warranty,
        problem_description,
        status,
        repair_cost,
        amount_paid,
        parts_used,
        is_unlocked,
        created_at,
        updated_at
      FROM repairs 
      WHERE serial_number = ?
      ORDER BY created_at DESC
      `).all(serialNumber);
  }

  addRepair(repair) {
    const stmt = this.db.prepare(`
      INSERT INTO repairs (
        customer_name, 
        contact, 
        item_brand, 
        item_model, 
        serial_number, 
        under_warranty, 
        problem_description, 
        status,
        repair_cost,
        amount_paid,
        parts_used,
        is_unlocked,
        created_at, 
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();
    const result = stmt.run(
      repair.customer_name,
      repair.contact || null,
      repair.item_brand,
      repair.item_model || null,
      repair.serial_number || null,
      repair.under_warranty ? 1 : 0,
      repair.problem_description,
      repair.status || "pending-diagnosis",
      repair.repair_cost || 0,
      repair.amount_paid || 0,
      repair.parts_used || '[]',
      repair.is_unlocked ? 1 : 0,
      now,
      now
    );

    return result.lastInsertRowid;
  }

  updateRepair(id, updates) {
    const repair = this.getRepairById(id);
    if (!repair) return false;

    const stmt = this.db.prepare(`
      UPDATE repairs SET 
        customer_name = ?,
        contact = ?,
        item_brand = ?,
        item_model = ?,
        serial_number = ?,
        under_warranty = ?,
        problem_description = ?,
        status = ?,
        repair_cost = ?,
        amount_paid = ?,
        parts_used = ?,
        is_unlocked = ?,
        updated_at = ?
      WHERE id = ?
    `);

    const result = stmt.run(
      updates.customer_name || repair.customer_name,
      updates.contact || repair.contact,
      updates.item_brand || repair.item_brand,
      updates.item_model || repair.item_model,
      updates.serial_number || repair.serial_number,
      updates.under_warranty !== undefined ? (updates.under_warranty ? 1 : 0) : repair.under_warranty,
      updates.problem_description || repair.problem_description,
      updates.status || repair.status,
      updates.repair_cost !== undefined ? updates.repair_cost : repair.repair_cost,
      updates.amount_paid !== undefined ? updates.amount_paid : repair.amount_paid,
      updates.parts_used || repair.parts_used,
      updates.is_unlocked !== undefined ? (updates.is_unlocked ? 1 : 0) : repair.is_unlocked,
      new Date().toISOString(),
      id
    );

    return result.changes > 0;
  }

  deleteRepair(id) {
    const stmt = this.db.prepare('DELETE FROM repairs WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  getAllCustomers() {
    return this.db.prepare(`
      SELECT 
        customer_name,
        contact,
        COUNT(*) as repair_count,
        MAX(created_at) as last_repair_date,
        MIN(created_at) as first_repair_date
      FROM repairs 
      WHERE customer_name IS NOT NULL AND customer_name != ''
      GROUP BY LOWER(TRIM(customer_name)), LOWER(TRIM(COALESCE(contact, '')))
      ORDER BY last_repair_date DESC
    `).all();
  }

  getCustomerRepairs(customerName, contact = null) {
    let query = `
      SELECT * FROM repairs 
      WHERE LOWER(TRIM(customer_name)) = LOWER(TRIM(?))
    `;
    let params = [customerName];

    if (contact) {
      query += ` AND LOWER(TRIM(COALESCE(contact, ''))) = LOWER(TRIM(?))`;
      params.push(contact);
    }

    query += ` ORDER BY created_at DESC`;

    return this.db.prepare(query).all(...params);
  }

  updateCustomerInfo(oldCustomerName, oldContact, newCustomerName, newContact) {
    const stmt = this.db.prepare(`
      UPDATE repairs SET 
        customer_name = ?,
        contact = ?,
        updated_at = ?
      WHERE LOWER(TRIM(customer_name)) = LOWER(TRIM(?))
        AND LOWER(TRIM(COALESCE(contact, ''))) = LOWER(TRIM(COALESCE(?, '')))
    `);

    const result = stmt.run(
      newCustomerName,
      newContact,
      new Date().toISOString(),
      oldCustomerName,
      oldContact || ''
    );

    return result.changes > 0;
  }

  canDeleteCustomer(customerName, contact = null) {
    let query = `
    SELECT 
      COUNT(*) as total_repairs,
      COUNT(CASE WHEN LOWER(status) != 'picked-up' THEN 1 ELSE NULL END) as non_picked_up_repairs,
      GROUP_CONCAT(DISTINCT status) as all_statuses
    FROM repairs 
    WHERE LOWER(TRIM(customer_name)) = LOWER(TRIM(?))
  `;
    let params = [customerName];

    if (contact) {
      query += ` AND LOWER(TRIM(COALESCE(contact, ''))) = LOWER(TRIM(?))`;
      params.push(contact);
    }

    const result = this.db.prepare(query).get(...params);

    return {
      canDelete: result.non_picked_up_repairs === 0,
      totalRepairs: result.total_repairs,
      nonPickedUpRepairs: result.non_picked_up_repairs,
      allStatuses: result.all_statuses ? result.all_statuses.split(',') : []
    };
  }

  // deleteCustomer(customerName, contact = null) {
  //   let query = `DELETE FROM repairs WHERE LOWER(TRIM(customer_name)) = LOWER(TRIM(?))`;
  //   let params = [customerName];

  //   if (contact) {
  //     query += ` AND LOWER(TRIM(COALESCE(contact, ''))) = LOWER(TRIM(?))`;
  //     params.push(contact);
  //   }

  //   const stmt = this.db.prepare(query);
  //   const result = stmt.run(...params);
  //   return result.changes;
  // }

  deleteCustomer(customerName, contact = null) {
    // First check if customer can be deleted
    const deleteCheck = this.canDeleteCustomer(customerName, contact);

    if (!deleteCheck.canDelete) {
      return {
        success: false,
        deletedCount: 0,
        message: `Cannot delete customer. They have ${deleteCheck.nonPickedUpRepairs} repair(s) with status other than 'Picked-up'. All repairs must be marked as 'Picked-up' before deletion.`,
        nonPickedUpCount: deleteCheck.nonPickedUpRepairs,
        totalRepairs: deleteCheck.totalRepairs
      };
    }

    // If we can delete, proceed with deletion
    let query = `DELETE FROM repairs WHERE LOWER(TRIM(customer_name)) = LOWER(TRIM(?))`;
    let params = [customerName];

    if (contact) {
      query += ` AND LOWER(TRIM(COALESCE(contact, ''))) = LOWER(TRIM(?))`;
      params.push(contact);
    }

    const stmt = this.db.prepare(query);
    const result = stmt.run(...params);

    return {
      success: true,
      deletedCount: result.changes,
      message: `Successfully deleted ${result.changes} repair record(s) for ${customerName}`,
      totalRepairs: deleteCheck.totalRepairs
    };
  }

  searchCustomers(searchTerm) {
    return this.db.prepare(`
      SELECT 
        customer_name,
        contact,
        COUNT(*) as repair_count,
        MAX(created_at) as last_repair_date,
        MIN(created_at) as first_repair_date
      FROM repairs 
      WHERE (LOWER(customer_name) LIKE LOWER(?) OR LOWER(COALESCE(contact, '')) LIKE LOWER(?))
        AND customer_name IS NOT NULL AND customer_name != ''
      GROUP BY LOWER(TRIM(customer_name)), LOWER(TRIM(COALESCE(contact, '')))
      ORDER BY last_repair_date DESC
    `).all(`%${searchTerm}%`, `%${searchTerm}%`);
  }

  // Export data for backup
  exportData() {
    const data = {
      repairs: this.getAllRepairs(),
      users: this.db.prepare('SELECT id, username, created_at FROM users').all(),
      settings: this.db.prepare('SELECT * FROM settings').all()
    };
    return data;
  }

  // Export all data as JSON (including passwords)
  exportDataAsJSON() {
    const data = {
      repairs: this.getAllRepairs(),
      users: this.db.prepare('SELECT * FROM users').all(),
      suggestions: this.db.prepare('SELECT * FROM suggestions').all(),
      whatsapp_templates: this.getAllWhatsAppTemplates(),
      items: this.getAllItems(),
      settings: this.db.prepare('SELECT * FROM settings').all(),
      exported_at: new Date().toISOString(),
      version: '1.0'
    };
    return data;
  }

  // Export data as CSV format
  exportDataAsCSV() {
    // Get all data from all tables
    const repairs = this.getAllRepairs();
    const users = this.db.prepare('SELECT * FROM users').all();
    const suggestions = this.db.prepare('SELECT * FROM suggestions').all();
    const whatsappTemplates = this.db.prepare('SELECT * FROM whatsapp_templates').all();
    const items = this.db.prepare('SELECT * FROM items').all();
    const settings = this.db.prepare('SELECT * FROM settings').all();

    let csvContent = '';

    // Export Repairs
    if (repairs.length > 0) {
      csvContent += 'REPAIRS\n';
      const repairHeaders = [
        'ID', 'Customer Name', 'Contact', 'Item Brand', 'Item Model',
        'Serial Number', 'Under Warranty', 'Problem Description', 'Status',
        'Repair Cost', 'Amount Paid', 'Parts Used', 'Created At', 'Updated At'
      ];
      csvContent += repairHeaders.join(',') + '\n';

      const repairRows = repairs.map(repair => [
        repair.id,
        `"${repair.customer_name}"`,
        `"${repair.contact || ''}"`,
        `"${repair.item_brand}"`,
        `"${repair.item_model || ''}"`,
        `"${repair.serial_number || ''}"`,
        repair.under_warranty ? 'Yes' : 'No',
        `"${repair.problem_description}"`,
        `"${repair.status}"`,
        repair.repair_cost || 0,
        repair.amount_paid || 0,
        `"${repair.parts_used || '[]'}"`,
        repair.created_at,
        repair.updated_at
      ]);

      csvContent += repairRows.map(row => row.join(',')).join('\n') + '\n\n';
    }

    // Export Users
    if (users.length > 0) {
      csvContent += 'USERS\n';
      const userHeaders = ['ID', 'Username', 'Password', 'Created At'];
      csvContent += userHeaders.join(',') + '\n';

      const userRows = users.map(user => [
        user.id,
        `"${user.username}"`,
        `"${user.password}"`,
        user.created_at
      ]);

      csvContent += userRows.map(row => row.join(',')).join('\n') + '\n\n';
    }

    // Export Suggestions
    if (suggestions.length > 0) {
      csvContent += 'SUGGESTIONS\n';
      const suggestionHeaders = ['ID', 'Type', 'Value', 'Created At'];
      csvContent += suggestionHeaders.join(',') + '\n';

      const suggestionRows = suggestions.map(suggestion => [
        suggestion.id,
        `"${suggestion.type}"`,
        `"${suggestion.value}"`,
        suggestion.created_at
      ]);

      csvContent += suggestionRows.map(row => row.join(',')).join('\n') + '\n\n';
    }

    // Export WhatsApp Templates
    if (whatsappTemplates.length > 0) {
      csvContent += 'WHATSAPP TEMPLATES\n';
      const templateHeaders = ['ID', 'Status', 'Template', 'Created At', 'Updated At'];
      csvContent += templateHeaders.join(',') + '\n';

      const templateRows = whatsappTemplates.map(template => [
        template.id,
        `"${template.status}"`,
        `"${template.template.replace(/"/g, '""')}"`, // Escape quotes in template
        template.created_at,
        template.updated_at
      ]);

      csvContent += templateRows.map(row => row.join(',')).join('\n') + '\n\n';
    }

    // Export Items
    if (items.length > 0) {
      csvContent += 'ITEMS\n';
      const itemHeaders = [
        'ID', 'Model', 'Category', 'Power Rate', 'Serial Number', 'Notes',
        'Status', 'Sold', 'Sale Price', 'Sale Date', 'Date Added', 'Created At', 'Updated At'
      ];
      csvContent += itemHeaders.join(',') + '\n';

      const itemRows = items.map(item => [
        item.id,
        `"${item.model || ''}"`,
        `"${item.category || ''}"`,
        `"${item.power_rate || ''}"`,
        `"${item.serial_number || ''}"`,
        `"${item.notes || ''}"`,
        `"${item.status || ''}"`,
        item.sold ? 'Yes' : 'No',
        item.sale_price || 0,
        item.sale_date || '',
        item.date_added || '',
        item.created_at,
        item.updated_at
      ]);

      csvContent += itemRows.map(row => row.join(',')).join('\n') + '\n\n';
    }

    if (settings.length > 0) {
      csvContent += 'SETTINGS\n';
      const settingsHeaders = ['Key', 'Value'];
      csvContent += settingsHeaders.join(',') + '\n';

      const settingsRows = settings.map(setting => [
        `"${setting.key}"`,
        `"${setting.value.replace(/"/g, '""')}"`
      ]);

      csvContent += settingsRows.map(row => row.join(',')).join('\n');
    }

    return csvContent;
  }

  // Import data from JSON
  importDataFromJSON(jsonData) {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

      // Validate data structure
      if (!data.repairs || !Array.isArray(data.repairs)) {
        throw new Error('Invalid data format: repairs array is required');
      }

      // Start transaction for atomic operation
      return this.db.transaction(() => {
        // Clear existing data
        this.db.exec('DELETE FROM repairs');
        this.db.exec('DELETE FROM users');
        this.db.exec('DELETE FROM suggestions');
        this.db.exec('DELETE FROM whatsapp_templates');
        this.db.exec('DELETE FROM items');
        this.db.exec('DELETE FROM settings');

        let importedCounts = {
          repairs: 0,
          users: 0,
          suggestions: 0,
          whatsapp_templates: 0,
          items: 0,
          settings: 0
        };

        // Import repairs
        if (data.repairs && data.repairs.length > 0) {
          const repairStmt = this.db.prepare(`
          INSERT INTO repairs (
            customer_name, contact, item_brand, item_model, serial_number,
            under_warranty, problem_description, status, repair_cost,
            amount_paid, parts_used, is_unlocked, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

          for (const repair of data.repairs) {
            repairStmt.run(
              repair.customer_name,
              repair.contact,
              repair.item_brand,
              repair.item_model,
              repair.serial_number,
              repair.under_warranty ? 1 : 0,
              repair.problem_description,
              repair.status,
              repair.repair_cost || 0,
              repair.amount_paid || 0,
              repair.parts_used || '[]',
              repair.is_unlocked ? 1 : 0,
              repair.created_at,
              repair.updated_at
            );
            importedCounts.repairs++;
          }
        }

        // Import users
        if (data.users && data.users.length > 0) {
          const userStmt = this.db.prepare(`
          INSERT INTO users (username, password, created_at)
          VALUES (?, ?, ?)
        `);

          for (const user of data.users) {
            userStmt.run(user.username, user.password, user.created_at);
            importedCounts.users++;
          }
        }

        // Import suggestions
        if (data.suggestions && data.suggestions.length > 0) {
          const suggestionStmt = this.db.prepare(`
          INSERT INTO suggestions (type, value, created_at)
          VALUES (?, ?, ?)
        `);

          for (const suggestion of data.suggestions) {
            suggestionStmt.run(suggestion.type, suggestion.value, suggestion.created_at);
            importedCounts.suggestions++;
          }
        }

        // Import WhatsApp templates
        if (data.whatsapp_templates && data.whatsapp_templates.length > 0) {
          const templateStmt = this.db.prepare(`
          INSERT INTO whatsapp_templates (status, template, created_at, updated_at)
          VALUES (?, ?, ?, ?)
        `);

          for (const template of data.whatsapp_templates) {
            templateStmt.run(template.status, template.template, template.created_at, template.updated_at);
            importedCounts.whatsapp_templates++;
          }
        }

        // Import items
        if (data.items && data.items.length > 0) {
          const itemStmt = this.db.prepare(`
          INSERT INTO items (
            model, category, power_rate, serial_number, notes, status,
            sold, sale_price, sale_date, date_added, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

          for (const item of data.items) {
            itemStmt.run(
              item.model,
              item.category,
              item.power_rate,
              item.serial_number,
              item.notes,
              item.status,
              item.sold ? 1 : 0,
              item.sale_price,
              item.sale_date,
              item.date_added,
              item.created_at,
              item.updated_at
            );
            importedCounts.items++;
          }
        }

        if (data.settings && data.settings.length > 0) {
          // console.log("\nlolllllllllllllllllllllllllllllllllllllllll\n",data.settings, "\nlolllllllllllllllllllllllllllllllllllllllll\n");
          const settingsStmt = this.db.prepare(`
            INSERT INTO settings (id, key, value, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
          `);

          const now = new Date().toISOString();
          for (const setting of data.settings) {
            // Use existing timestamps if available, otherwise use current time
            const id = setting.id || this.generateUUID();
            const key = setting.key;
            const value = setting.value;
            const createdAt = setting.created_at || now;
            const updatedAt = setting.updated_at || now;

            settingsStmt.run(id, key, value, createdAt, updatedAt);
            importedCounts.settings++;
          }
        }

        return importedCounts;
      })();
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }

  // User management methods
  getUserByCredentials(username, password) {
    return this.db.prepare('SELECT id, username FROM users WHERE username = ? AND password = ?').get(username, password);
  }

  addUser(username, password) {
    const stmt = this.db.prepare(`
      INSERT INTO users (username, password, created_at)
      VALUES (?, ?, ?)
    `);

    const now = new Date().toISOString();
    const result = stmt.run(username, password, now);

    return result.lastInsertRowid;
  }

  hasUsers() {
    const count = this.db.prepare('SELECT COUNT(*) as count FROM users').get();
    return count.count > 0;
  }

  validateUsername(username) {
    // Check length (3-8 characters)
    if (!username || username.length < 3 || username.length > 8) {
      return { valid: false, message: 'Username must be between 3 and 8 characters' };
    }

    // Check if username already exists
    const existingUser = this.db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existingUser) {
      return { valid: false, message: 'Username already exists' };
    }

    return { valid: true };
  }

  validatePassword(password) {
    // Check minimum length (6 characters)
    if (!password || password.length < 6) {
      return { valid: false, message: 'Password must be at least 6 characters' };
    }

    return { valid: true };
  }

  createUser(username, password) {
    // Validate username
    const usernameValidation = this.validateUsername(username);
    if (!usernameValidation.valid) {
      throw new Error(usernameValidation.message);
    }

    // Validate password
    const passwordValidation = this.validatePassword(password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.message);
    }

    // Create user
    return this.addUser(username, password);
  }

  getAllUsers() {
    return this.db.prepare('SELECT id, username, created_at FROM users ORDER BY created_at DESC').all();
  }

  deleteUser(userId) {
    // Check if this is the last user
    const userCount = this.db.prepare('SELECT COUNT(*) as count FROM users').get();
    if (userCount.count <= 1) {
      throw new Error('Cannot delete the last user. At least one user must remain.');
    }

    // Check if user exists
    const user = this.db.prepare('SELECT id, username FROM users WHERE id = ?').get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Delete the user
    const stmt = this.db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(userId);

    if (result.changes === 0) {
      throw new Error('Failed to delete user');
    }

    return { success: true, deletedUser: user.username };
  }

  createDefaultAdminIfNeeded() {
    if (!this.hasUsers()) {
      this.addUser('Admin', 'admin123');
      console.log('Created default admin user');
      return true;
    }
    return false;
  }

  // Suggestions management methods
  getAllSuggestions(type) {
    return this.db.prepare('SELECT value FROM suggestions WHERE type = ? ORDER BY value ASC').all(type).map(row => row.value);
  }

  addSuggestion(type, value) {
    try {
      const stmt = this.db.prepare(`
      INSERT INTO suggestions (type, value, created_at)
      VALUES (?, ?, ?)
    `);

      const now = new Date().toISOString();
      const result = stmt.run(type, value.trim(), now);

      return result.lastInsertRowid;
    } catch (error) {
      // Handle duplicate entries gracefully
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return null; // Suggestion already exists
      }
      throw error;
    }
  }

  removeSuggestion(type, value) {
    try {
      const stmt = this.db.prepare('DELETE FROM suggestions WHERE type = ? AND value = ?');
      const result = stmt.run(type, value);
      return result.changes > 0;
    } catch (error) {
      // Handle non-existing suggestion
      if (error.code === 'SQLITE_CONSTRAINT') {
        return false;
      }
      throw error;
    }
  }

  clearAllSuggestions(type) {
    const stmt = this.db.prepare('DELETE FROM suggestions WHERE type = ?');
    const result = stmt.run(type);
    return result.changes;
  }

  // Items/Stock management methods
  getAllItems() {
    return this.db.prepare(`
      SELECT 
        id,
        model,
        category,
        power_rate,
        serial_number,
        notes,
        status,
        sold,
        sale_price,
        sale_date,
        date_added,
        created_at,
        updated_at
      FROM items 
      ORDER BY created_at DESC
    `).all();
  }

  getItemById(id) {
    return this.db.prepare(`
      SELECT 
        id,
        model,
        category,
        power_rate,
        serial_number,
        notes,
        status,
        sold,
        sale_price,
        sale_date,
        date_added,
        created_at,
        updated_at
      FROM items 
      WHERE id = ?
    `).get(id);
  }

  getItemBySerialNumber(serialNumber) {
    return this.db.prepare(`
      SELECT 
        id,
        model,
        category,
        power_rate,
        serial_number,
        notes,
        status,
        sold,
        sale_price,
        sale_date,
        date_added,
        created_at,
        updated_at
      FROM items 
      WHERE serial_number = ?
    `).get(serialNumber);
  }

  addItem(item) {
    // Check if serial number already exists
    if (item.serial_number) {
      const existingItem = this.getItemBySerialNumber(item.serial_number);
      if (existingItem) {
        throw new Error('An item with this serial number already exists');
      }
    }

    const stmt = this.db.prepare(`
      INSERT INTO items (
        model,
        category,
        power_rate,
        serial_number,
        notes,
        status,
        sold,
        date_added,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();
    const dateAdded = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const result = stmt.run(
      item.model,
      item.category || null,
      item.power_rate || null,
      item.serial_number || null,
      item.notes || null,
      item.status || 'Available',
      item.sold ? 1 : 0,
      dateAdded,
      now,
      now
    );

    return result.lastInsertRowid;
  }

  updateItem(id, updates) {
    const item = this.getItemById(id);
    if (!item) return false;

    // Check serial number uniqueness if being updated
    if (updates.serial_number && updates.serial_number !== item.serial_number) {
      const existingItem = this.getItemBySerialNumber(updates.serial_number);
      if (existingItem && existingItem.id !== id) {
        throw new Error('An item with this serial number already exists');
      }
    }

    const stmt = this.db.prepare(`
      UPDATE items SET 
        model = ?,
        category = ?,
        power_rate = ?,
        serial_number = ?,
        notes = ?,
        status = ?,
        sold = ?,
        sale_price = ?,
        sale_date = ?,
        updated_at = ?
      WHERE id = ?
    `);

    const result = stmt.run(
      updates.model !== undefined ? updates.model : item.model,
      updates.category !== undefined ? updates.category : item.category,
      updates.power_rate !== undefined ? updates.power_rate : item.power_rate,
      updates.serial_number !== undefined ? updates.serial_number : item.serial_number,
      updates.notes !== undefined ? updates.notes : item.notes,
      updates.status !== undefined ? updates.status : item.status,
      updates.sold !== undefined ? (updates.sold ? 1 : 0) : item.sold,
      updates.sale_price !== undefined ? updates.sale_price : item.sale_price,
      updates.sale_date !== undefined ? updates.sale_date : item.sale_date,
      new Date().toISOString(),
      id
    );

    return result.changes > 0;
  }

  deleteItem(id) {
    const stmt = this.db.prepare('DELETE FROM items WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  markItemAsSold(id, salePrice) {
    const saleDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    return this.updateItem(id, {
      sold: true,
      status: 'Sold',
      sale_price: salePrice,
      sale_date: saleDate
    });
  }

  markItemAsAvailable(id) {
    return this.updateItem(id, {
      sold: false,
      status: 'Available',
      sale_price: null,
      sale_date: null
    });
  }

  searchItems(searchTerm) {
    return this.db.prepare(`
      SELECT 
        id,
        model,
        category,
        power_rate,
        serial_number,
        notes,
        status,
        sold,
        sale_price,
        sale_date,
        date_added,
        created_at,
        updated_at
      FROM items 
      WHERE (
        LOWER(model) LIKE LOWER(?) OR 
        LOWER(COALESCE(category, '')) LIKE LOWER(?) OR
        LOWER(COALESCE(serial_number, '')) LIKE LOWER(?) OR
        LOWER(COALESCE(notes, '')) LIKE LOWER(?)
      )
      ORDER BY created_at DESC
    `).all(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
  }

  getItemsByCategory(category) {
    return this.db.prepare(`
      SELECT 
        id,
        model,
        category,
        power_rate,
        serial_number,
        notes,
        status,
        sold,
        sale_price,
        sale_date,
        date_added,
        created_at,
        updated_at
      FROM items 
      WHERE LOWER(COALESCE(category, '')) = LOWER(?)
      ORDER BY created_at DESC
    `).all(category);
  }

  getItemsByStatus(sold = null) {
    if (sold === null) {
      return this.getAllItems();
    }

    return this.db.prepare(`
      SELECT 
        id,
        model,
        category,
        power_rate,
        serial_number,
        notes,
        status,
        sold,
        sale_price,
        sale_date,
        date_added,
        created_at,
        updated_at
      FROM items 
      WHERE sold = ?
      ORDER BY created_at DESC
    `).all(sold ? 1 : 0);
  }

  // WhatsApp Templates management methods
  getAllWhatsAppTemplates() {
    return this.db.prepare(`
      SELECT 
        id,
        status,
        template,
        created_at,
        updated_at
      FROM whatsapp_templates 
      ORDER BY 
        CASE status
          WHEN 'Pending Diagnosis' THEN 1
          WHEN 'Awaiting Parts' THEN 2
          WHEN 'In Progress' THEN 3
          WHEN 'Completed' THEN 4
          WHEN 'Awaiting Pickup' THEN 5
          WHEN 'Picked Up' THEN 6
          WHEN 'Cancelled' THEN 7
          ELSE 8
        END
    `).all();
  }

  getWhatsAppTemplateByStatus(status) {
    return this.db.prepare(`
      SELECT 
        id,
        status,
        template,
        created_at,
        updated_at
      FROM whatsapp_templates 
      WHERE status = ?
    `).get(status);
  }

  updateWhatsAppTemplate(status, template) {
    const stmt = this.db.prepare(`
      UPDATE whatsapp_templates 
      SET template = ?, updated_at = ?
      WHERE status = ?
    `);

    const now = new Date().toISOString();
    const result = stmt.run(template, now, status);
    return result.changes > 0;
  }

  updateAllWhatsAppTemplates(templates) {
    const stmt = this.db.prepare(`
      UPDATE whatsapp_templates 
      SET template = ?, updated_at = ?
      WHERE status = ?
    `);

    const now = new Date().toISOString();
    let updatedCount = 0;

    for (const [status, template] of Object.entries(templates)) {
      const result = stmt.run(template, now, status);
      if (result.changes > 0) {
        updatedCount++;
      }
    }

    return updatedCount;
  }

  resetWhatsAppTemplatesToDefault() {
    const defaultTemplates = {
      'Pending Diagnosis': 'Hello {customerName}, your {itemBrand} {itemModel} (Serial: {serialNumber}) is now under diagnosis. We will update you soon with our findings.',
      'Awaiting Parts': 'Hi {customerName}, we have diagnosed your {itemBrand} {itemModel} and are currently waiting for parts to arrive. Estimated repair cost: ${repairCost}.',
      'In Progress': 'Good news {customerName}! We are now working on repairing your {itemBrand} {itemModel}. The repair is in progress.',
      'Completed': 'Great news {customerName}! Your {itemBrand} {itemModel} repair is completed. Total cost: ${repairCost}. Please come pick it up at your convenience.',
      'Awaiting Pickup': 'Hello {customerName}, your {itemBrand} {itemModel} is ready for pickup. Please visit us to collect your device.',
      'Picked Up': 'Thank you {customerName} for choosing our services. Your {itemBrand} {itemModel} has been successfully picked up.',
      'Cancelled': 'Hello {customerName}, the repair for your {itemBrand} {itemModel} has been cancelled as requested.'
    };

    return this.updateAllWhatsAppTemplates(defaultTemplates);
  };

  // Shop Overview Statistics
  getShopOverviewStats() {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

    // Items logged today
    const itemsLoggedToday = this.db.prepare(`
      SELECT COUNT(*) as count 
      FROM repairs 
      WHERE DATE(created_at) = ?
    `).get(today).count;

    // Total items fixed (completed + picked up)
    const totalItemsFixed = this.db.prepare(`
      SELECT COUNT(*) as count 
      FROM repairs 
      WHERE status IN ('completed', 'picked-up')
    `).get().count;

    // Items awaiting fix (pending-diagnosis + awaiting-parts + in-progress)
    const itemsAwaitingFix = this.db.prepare(`
      SELECT COUNT(*) as count 
      FROM repairs 
      WHERE status IN ('pending-diagnosis', 'awaiting-parts', 'in-progress')
    `).get().count;

    return {
      itemsLoggedToday,
      totalItemsFixed,
      itemsAwaitingFix
    };
  }

  // Google Drive backup methods
  async backupToGoogleDrive(auth) {
    try {
      const { google } = require('googleapis');
      const drive = google.drive({ version: 'v3', auth });

      // First, find or create the SUMRY-backups folder
      let folderResponse = await drive.files.list({
        q: "name='SUMRY-backups' and mimeType='application/vnd.google-apps.folder' and trashed=false",
        fields: 'files(id,name)'
      });

      let folderId;

      if (folderResponse.data.files.length === 0) {
        // Create the SUMRY-backups folder if it doesn't exist
        console.log('SUMRY-backups folder not found, creating it...');
        const folderMetadata = {
          name: 'SUMRY-backups',
          mimeType: 'application/vnd.google-apps.folder'
        };

        const createFolderResponse = await drive.files.create({
          resource: folderMetadata,
          fields: 'id'
        });

        folderId = createFolderResponse.data.id;
        console.log('SUMRY-backups folder created with ID:', folderId);
      } else {
        folderId = folderResponse.data.files[0].id;
        console.log('Found existing SUMRY-backups folder with ID:', folderId);
      }

      // Export all data as JSON
      const data = this.exportDataAsJSON();

      // Create backup filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `sumry-backup-${timestamp}.json`;

      // Create file metadata - store in SUMRY-backups folder
      const fileMetadata = {
        name: filename,
        parents: [folderId] // Store in SUMRY-backups folder
      };

      // Create media object
      const media = {
        mimeType: 'application/json',
        body: JSON.stringify(data, null, 2)
      };

      // Upload file to Google Drive
      const response = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id,name,createdTime'
      });

      return {
        success: true,
        fileId: response.data.id,
        filename: response.data.name,
        createdTime: response.data.createdTime,
        message: 'Backup successfully uploaded to SUMRY-backups folder in Google Drive'
      };
    } catch (error) {
      console.error('Error creating backup:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async restoreFromGoogleDrive(auth, fileId) {
    try {
      const { google } = require('googleapis');
      const drive = google.drive({ version: 'v3', auth });

      // Download file from Google Drive
      const response = await drive.files.get({
        fileId: fileId,
        alt: 'media'
      });

      // The response.data is already the parsed content when using alt='media'
      // No need to JSON.parse() it again
      let jsonData;
      if (typeof response.data === 'string') {
        // If it's a string, parse it
        jsonData = JSON.parse(response.data);
      } else {
        // If it's already an object, use it directly
        jsonData = response.data;
      }

      // Import the data using existing method
      const importResult = await this.importDataFromJSON(jsonData);

      return {
        success: true,
        importedCounts: importResult,
        message: 'Data successfully restored from Google Drive'
      };
    } catch (error) {
      console.error('Error restoring from Google Drive:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async listGoogleDriveBackups(auth) {
    try {
      const { google } = require('googleapis');
      const drive = google.drive({ version: 'v3', auth });

      // First, find or create the SUMRY-backups folder
      let folderResponse = await drive.files.list({
        q: "name='SUMRY-backups' and mimeType='application/vnd.google-apps.folder' and trashed=false",
        fields: 'files(id,name)'
      });

      let folderId;

      if (folderResponse.data.files.length === 0) {
        // Create the SUMRY-backups folder if it doesn't exist
        console.log('SUMRY-backups folder not found, creating it...');
        const folderMetadata = {
          name: 'SUMRY-backups',
          mimeType: 'application/vnd.google-apps.folder'
        };

        const createFolderResponse = await drive.files.create({
          resource: folderMetadata,
          fields: 'id'
        });

        folderId = createFolderResponse.data.id;
        console.log('SUMRY-backups folder created with ID:', folderId);

        // Return empty list since we just created the folder
        return {
          success: true,
          files: [],
          message: 'SUMRY-backups folder created. No backups found yet.'
        };
      } else {
        folderId = folderResponse.data.files[0].id;
      }

      // List files in SUMRY-backups folder
      const response = await drive.files.list({
        q: `parents in '${folderId}' and name contains 'sumry-backup' and trashed=false`,
        fields: 'files(id,name,createdTime,size)',
        orderBy: 'createdTime desc'
      });

      return {
        success: true,
        files: response.data.files
      };
    } catch (error) {
      console.error('Error listing backups:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

// Create and export a singleton instance
const databaseService = new DatabaseService();

// Handle process exit
process.on('exit', () => {
  databaseService.close();
});

module.exports = databaseService;