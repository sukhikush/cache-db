const sqlite3 = require('better-sqlite3');
class SQLiteCache {
    /**
     * @description Local in memory cache that runs out of node js procees and takes up the entire memory
     * @returns {SQLiteCache}
     */
    constructor() {
        if (!SQLiteCache.instance) {
            // Create a new SQLite connection and initialize the table
            this.db = new sqlite3(':memory:'); // Use ':memory:' for in-memory mode
            this.db.exec(
                'CREATE TABLE IF NOT EXISTS cache (key TEXT PRIMARY KEY, value TEXT)'
            );
            SQLiteCache.instance = this;
        }
        return SQLiteCache.instance;
    }
    // Get a value by key
    get(key) {
        const stmt = this.db.prepare('SELECT value FROM cache WHERE key = ?');
        const row = stmt.get(key);
        if (row) {
            try {
                // Attempt to parse JSON, fall back to returning raw string
                return JSON.parse(row.value);
            } catch (err) {
                // Not a JSON value, return as raw string
                return row.value;
            }
        }
        return null;
    }
    // Set a value for a key
    set(key, value) {
        let valueToStore;
        try {
            // Attempt to stringify JSON value
            valueToStore = JSON.stringify(value);
        } catch (err) {
            // Not a JSON value, store as string
            valueToStore = String(value);
        }
        const stmt = this.db.prepare(
            'INSERT OR REPLACE INTO cache (key, value) VALUES (?, ?)'
        );
        stmt.run(key, valueToStore);
    }
    // Delete a key
    delete(key) {
        const stmt = this.db.prepare('DELETE FROM cache WHERE key = ?');
        stmt.run(key);
    }
    // Flush all data
    flush() {
        this.db.exec('DELETE FROM cache');
    }
    getAll() {
        const stmt = this.db.prepare('SELECT * FROM cache');
        const row = stmt.all();
        return row;
    }
    getAllStream() {
        const stmt = this.db.prepare('SELECT * FROM cache');
        return stmt.iterate();
    }
}
// Ensure only one instance is created
const instance = new SQLiteCache();
Object.freeze(instance);
// cache memory
const cache = instance;
const { performance } = require('perf_hooks');
const process = require('process');
// Function to print memory usage
function printMemoryUsage(label) {
    const used = process.memoryUsage();
    const rssMB = (used.rss / 1024 / 1024).toFixed(2); // RSS (system memory)
    const heapTotalMB = (used.heapTotal / 1024 / 1024).toFixed(2); // Total heap memory
    const heapUsedMB = (used.heapUsed / 1024 / 1024).toFixed(2); // Used heap memory
    console.log(
        `${label} - Memory Usage -> RSS: ${rssMB} MB, HeapTotal: ${heapTotalMB} MB, HeapUsed: ${heapUsedMB} MB`
    );
}
// Function to create large number of entries
async function testCache() {
    printMemoryUsage('Initial');
    const numEntries = 10000000; // Adjust this number as needed
    console.log(`Populating cache with ${numEntries} entries...`);
    const start = performance.now();
    for (let i = 0; i < numEntries; i++) {
        const key = `key-${i}`;
        const value = { name: `name-${i}`, value: i };
        cache.set(key, value);
        if (i % 10000 === 0) {
            printMemoryUsage(`After ${i} entries`);
        }
    }
    const end = performance.now();
    printMemoryUsage('Final');
    console.log(`Time taken to populate cache: ${(end - start) / 1000} seconds`);
}
// testCache();

(() => {
    console.log(`Adding Data`);
    cache.set("1800contacts.com", { "value1": "value2" });
    cache.set("key12", "value2");
    cache.set("key13", "value3");
    console.log("Fetching data for key1");
    var tt = cache.getAll();
    console.log(tt);

    cache.set("1800contacts.com", "value3585");

    console.log("in looping fashion");

    for (const data of cache.getAllStream()) {
        console.log("--------------------------")
        console.log(data);
        console.log("---------------------------")
    }
})();