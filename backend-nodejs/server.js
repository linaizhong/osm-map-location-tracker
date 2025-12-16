const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database setup
const dbPath = path.join(__dirname, 'locations.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Create id_generator table for sequence management
    db.run(`
      CREATE TABLE IF NOT EXISTS id_generator (
        gen_name TEXT PRIMARY KEY,
        gen_value INTEGER NOT NULL
      )
    `);

    // Initialize location_id sequence if not exists
    db.run(`
      INSERT OR IGNORE INTO id_generator (gen_name, gen_value)
      VALUES ('location_id', 0)
    `);

    // Create locations table
    db.run(`
      CREATE TABLE IF NOT EXISTS locations (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        address TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        timestamp TEXT
      )
    `, (err) => {
      if (err) {
        console.error('Error creating locations table:', err);
      } else {
        console.log('Database tables initialized');
      }
    });
  });
}

// Helper function to get next ID
function getNextId() {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE id_generator SET gen_value = gen_value + 1 WHERE gen_name = ?',
      ['location_id'],
      function(err) {
        if (err) reject(err);
        else {
          db.get(
            'SELECT gen_value FROM id_generator WHERE gen_name = ?',
            ['location_id'],
            (err, row) => {
              if (err) reject(err);
              else resolve(row.gen_value);
            }
          );
        }
      }
    );
  });
}

// API Routes

// GET search locations by keyword
app.get('/api/locations/search', (req, res) => {
  const { keyword } = req.query;

  if (!keyword) {
    return res.status(400).json({ error: 'Keyword parameter is required' });
  }

  const searchPattern = `%${keyword}%`;

  db.all(
    `SELECT * FROM locations
     WHERE name LIKE ? OR address LIKE ?
     ORDER BY id DESC`,
    [searchPattern, searchPattern],
    (err, rows) => {
      if (err) {
        console.error('Error searching locations:', err);
        return res.status(500).json({ error: 'Failed to search locations' });
      }
      res.json(rows);
    }
  );
});

// GET all locations
app.get('/api/locations', (req, res) => {
  db.all('SELECT * FROM locations ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      console.error('Error fetching locations:', err);
      return res.status(500).json({ error: 'Failed to fetch locations' });
    }
    res.json(rows);
  });
});

// POST create new location
app.post('/api/locations', async (req, res) => {
  const { name, address, latitude, longitude } = req.body;

  // Validation
  if (!name || !address || latitude === undefined || longitude === undefined) {
    return res.status(400).json({
      error: 'Missing required fields: name, address, latitude, longitude'
    });
  }

  try {
    const id = await getNextId();
    const timestamp = new Date().toISOString();

    db.run(
      `INSERT INTO locations (id, name, address, latitude, longitude, timestamp)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, name, address, latitude, longitude, timestamp],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ error: 'Location name already exists' });
          }
          console.error('Error saving location:', err);
          return res.status(500).json({ error: 'Failed to save location' });
        }

        // Return the created location
        db.get('SELECT * FROM locations WHERE id = ?', [id], (err, row) => {
          if (err) {
            console.error('Error fetching created location:', err);
            return res.status(500).json({ error: 'Location created but failed to retrieve' });
          }
          res.status(201).json(row);
        });
      }
    );
  } catch (err) {
    console.error('Error generating ID:', err);
    res.status(500).json({ error: 'Failed to save location' });
  }
});

// DELETE location by id
app.delete('/api/locations/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM locations WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error deleting location:', err);
      return res.status(500).json({ error: 'Failed to delete location' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json({ message: 'Location deleted successfully', id: parseInt(id) });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;