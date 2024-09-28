const Memcached = require('memcached');

// Create a new Memcached client
const memcached = new Memcached('localhost:11211'); // Specify your Memcached server address and port here

function m_flush() {
    return new Promise((resolve, reject) => {
        try {
            memcached.flush((err) => {
                if (err) {
                    console.log("unable to Flush")
                }
                resolve("Data Flused")
            })
        } catch (eer) {
            reject(eer)
        }
    });
}


function m_set(key, value) {
    return new Promise((resolve, reject) => {
        try {
            memcached.set(key, value, 600, (err) => {
                if (err) {
                    reject(`Error setting value in Memcached: ${err}`);
                }
                resolve('Value set successfully in Memcached');
            });
        } catch (eer) {
            reject(eer)
        }
    });
}

function m_get(key) {
    return new Promise((resolve, reject) => {
        try {
            memcached.get(key, (err, value) => {
                if (err) {
                    reject('Error retrieving value from Memcached:', err);
                    return;
                }
                resolve(value);
            });
        } catch (eer) {
            reject(eer)
        }
    });
}


function m_del(key) {
    return new Promise((resolve, reject) => {
        try {
            memcached.del(key, (err) => {
                if (err) {
                    reject('Error deleting value from Memcached:', err);
                    return;
                }
                resolve(true);
            });
        } catch (eer) {
            reject(eer)
        }
    });
}

function getAllKeys() {

    return new Promise((resolve, reject) => {
        memcached.items((err, stats) => {
            if (err) {
                console.error('Error retrieving stats:', err);
                return;
            }

            console.log(stats);

            // Iterate over each slab
            for (const slab in stats) {
                const slabId = slab.split(':')[1]; // Extract slab ID
                console.log(`Fetching keys from slab ${slabId}...`);

                // Fetch cached items from the slab
                memcached.cachedump(slabId, 0, (err, data) => {
                    if (err) {
                        console.error(`Error retrieving cachedump for slab ${slabId}:`, err);
                        return;
                    }

                    // Log the keys retrieved from the slab
                    data.forEach(item => {
                        console.log(`Key: ${item.key}, Value: ${item.value}`);
                    });
                });
            }
        });
    });
    // Get stats about items in Memcached

}

(async () => {

    try {

        await m_flush();
        var t;
        console.log("Set Start");
        t = await m_set("sukh", "Sukhdev");
        await memcached.expire('stateCity', (5 * 60 * 60)) //setting expiry
        console.log("Done data set", t)
        t = await m_get("sukh");
        console.log("Set END", t);
    } catch (eer) {
        console.log(eer)
    }
    // Close the Memcached connection

    await getAllKeys();

    memcached.end();

})();



import { createClient } from 'redis';

const createClient = require('redis').createClient;


(async () => {
    const client = await createClient({
        password: 'SLst6VKz4u06T5ROxB7s7tEdipyGCfZ0',
        socket: {
            host: 'redis-16875.c259.us-central1-2.gce.cloud.redislabs.com',
            port: 16875
        }
    })
        .on('error', err => console.log('Redis Client Error', err))
        .connect();

    console.log("Connected to Redis");

    await client.hSet('vonage-offline', 'A', '11');
    await client.hSet('vonage-offline', 'B', '22');
    await client.hSet('vonage-offline', 'C', '33');

    var Q = await client.hGet('vonage-offline', 'A');
    console.log("Data A", Q)
    var t = await client.hGetAll('vonage-offline');
    console.log(JSON.stringify(t));

    client.disconnect();
})();
