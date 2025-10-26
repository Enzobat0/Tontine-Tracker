// backend/src/db.js
const fs = require('fs');
const { join } = require('path');
const { nanoid } = require('nanoid');

const file = join(__dirname, '..', '..', 'db.json');

const db = {
  data: { users: [], tontines: [] },

  async read() {
    try {
      // If file doesn't exist, create it with default structure
      await fs.promises.access(file).catch(async () => {
        await fs.promises.writeFile(file, JSON.stringify(this.data, null, 2));
      });

      const raw = await fs.promises.readFile(file, 'utf8');
      this.data = raw ? JSON.parse(raw) : { users: [], tontines: [] };
    } catch (err) {
      console.error('Error reading db file:', err);
      // keep default data in case of error
      this.data = this.data || { users: [], tontines: [] };
    }
  },

  async write() {
    try {
      await fs.promises.writeFile(file, JSON.stringify(this.data, null, 2));
    } catch (err) {
      console.error('Error writing db file:', err);
      throw err;
    }
  }
};

// Initialize DB file on import
(async () => {
  await db.read();
})();

function createId() {
  return nanoid();
}

module.exports = { db, createId };
