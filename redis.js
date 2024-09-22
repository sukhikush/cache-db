require("dotenv").config()

const { Redis } = require('ioredis');



(() => {
    const redis = new Redis(
        {
            host: process.env.redis_host, //'redis-16875.c259.us-central1-2.gce.cloud.redislabs.com',
            port: process.env.redis_port, //'16875',
            password: process.env.redis_password,//'SLst6VKz4u06T5ROxB7s7tEdipyGCfZ0', // Use environment variable
            enableReadyCheck: true  // enable ready check
        }
    );

    redis.on('ready', async () => {
        console.log("Connected to redis");

        // await redis.hset('vonage-offline', 'A_A_newport', '11');
        // await redis.hset('vonage-offline', 'B_A_newport', '22');
        // await redis.hset('vonage-offline', 'C_A_newport', '33');
        // await redis.hset('vonage-offline', 'AA', '11');
        // await redis.hset('vonage-offline', 'AB', '22');
        // await redis.hset('vonage-offline', 'CC', '33');

        // var Q = await redis.hget('vonage-offline', 'AA');
        // console.log("Data A", Q)

        // var t = await redis.hgetall('vonage-offline');
        // console.log(JSON.stringify(t));
        // console.log(typeof t);

        // await redis.hdel('vonage-offline', ['A']);

        // // Call the function with your hash key
        // var data = readHashData('vonage-offline');
        // console.log("data", data);

        // readHashInChunks("vonage-offline").catch(err => {
        //     console.error('Error reading hash:', err);
        // });


        scanKeys('*_newport').then(keys => {
            console.log('Matched keys:', keys);
        }).catch(err => {
            console.error('Error scanning keys:', err);
        });

        // redis.disconnect();
    });

    redis.on('error', (error) => {
        console.error('Error connecting to Redis:', error);
        throw error;
    });


    async function readHashInChunks(hashName) {
        let cursor = '1'; // Initialize cursor for hscan
        do {
            // Use hscan to read a chunk of the hash
            const [newCursor, items] = await redis.hscan(hashName, cursor, 'COUNT', 2);
            cursor = newCursor; // Update cursor for next iteration

            // Process each item in the chunk
            for (let i = 0; i < items.length; i += 2) {
                const key = items[i];
                const value = items[i + 1];
                console.log(`Key: ${key}, Value: ${value}`);
                // You can process your data here
            }
        } while (cursor !== '0'); // Continue until the cursor returns to '0'

        console.log('All keys have been processed!');
    }

    // Function to read all hash data in a streaming way
    function readHashData(hashKey) {
        return new Promise((resolve, reject) => {

            const stream = redis.hscanStream(hashKey, {
                count: 1,  // Number of items per chunk (you can adjust this based on performance needs)
            });

            // Listen for 'data' event to process each batch of entries
            stream.on('data', (batch) => {
                console.log("first batch")
                console.log(batch)

                if (batch.length === 0) {
                    console.log('No data found.');
                    return;
                }

                // stream.pause();
                for (let i = 0; i < batch.length; i += 2) {
                    const field = batch[i];
                    const value = batch[i + 1];
                    console.log(`Field: ${field}, Value: ${value}`);
                }
                // stream.resume();

            });

            stream.on('end', () => {
                resolve('Stream ended');
            });

            stream.on('error', (err) => {
                reject('Error in stream:', err);
            });
        });
    }

    async function scanKeys(pattern) {
        let cursor = '0';
        const keys = [];

        do {
            const result = await redis.hscan('vonage-offline', cursor, 'MATCH', pattern, 'COUNT', 100);
            cursor = result[0]; // Update cursor
            keys.push(...result[1]); // Add found keys to the array
        } while (cursor !== '0'); // Continue until cursor is 0

        return keys;
    }

})();
