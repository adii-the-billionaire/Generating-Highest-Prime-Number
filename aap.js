// scalable-prime-api.js
const express = require('express');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const os = require('os');

// --- Configuration ---
const app = express();
const PORT = 3000;
const MAX_THREADS = os.cpus().length || 4; // Use a reasonable number of threads

// --- Worker Thread: The Sieve of Eratosthenes Implementation ---
if (!isMainThread) {
    // This code runs inside the worker thread
    const { N } = workerData;

    /**
     * Sieve of Eratosthenes algorithm to find all primes up to N.
     * Time Complexity: O(N log log N)
     * @param {number} limit
     * @returns {number[]} Array of prime numbers
     */
    function sieveOfEratosthenes(limit) {
        if (limit < 2) return [];

        const isPrime = new Array(limit + 1).fill(true);
        isPrime[0] = isPrime[1] = false; // 0 and 1 are not prime

        // Iterate up to sqrt(limit)
        for (let p = 2; p * p <= limit; p++) {
            if (isPrime[p]) {
                // Mark all multiples of p as not prime
                for (let i = p * p; i <= limit; i += p) {
                    isPrime[i] = false;
                }
            }
        }

        const primes = [];
        for (let p = 2; p <= limit; p++) {
            if (isPrime[p]) {
                primes.push(p);
            }
        }
        return primes;
    }

    const start = process.hrtime.bigint();
    const primes = sieveOfEratosthenes(N);
    const end = process.hrtime.bigint();
    const duration_ms = Number(end - start) / 1000000;

    // Send the result back to the main thread
    parentPort.postMessage({ primes, duration_ms });

} else {
    // --- Main Thread: API Setup and Worker Pool Dispatch ---

    /**
     * Dispatches the prime generation task to a worker thread.
     * @param {number} N The upper limit for prime generation.
     * @returns {Promise<{primes: number[], duration_ms: number}>}
     */
    function runPrimeWorker(N) {
        return new Promise((resolve, reject) => {
            const worker = new Worker(__filename, {
                workerData: { N },
            });

            worker.on('message', (result) => {
                resolve(result);
            });

            worker.on('error', (err) => {
                console.error(`Worker error for N=${N}:`, err);
                reject(err);
            });

            worker.on('exit', (code) => {
                if (code !== 0) {
                    // This is key for robust handling!
                    reject(new Error(`Worker stopped with exit code ${code}`));
                }
            });
        });
    }

    // --- API Route ---
    app.get('/api/primes/:N', async (req, res) => {
        const N = parseInt(req.params.N);

        if (isNaN(N) || N < 2) {
            return res.status(400).json({ error: 'Invalid limit N. N must be an integer greater than 1.' });
        }

        try {
            // Offload the CPU-intensive task to a worker thread
            const { primes, duration_ms } = await runPrimeWorker(N);

            res.status(200).json({
                limit: N,
                count: primes.length,
                primes: primes.length <= 100 ? primes : primes.slice(0, 10) + '...', // Truncate for large N
                duration_ms: parseFloat(duration_ms.toFixed(3)),
                message: primes.length > 100 ? 'List truncated for display. Full count provided.' : undefined
            });

        } catch (error) {
            console.error('Request failed:', error.message);
            res.status(500).json({ error: 'Failed to generate primes due to a server error.' });
        }
    });

    // --- Server Start ---
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Worker Pool Size: ${MAX_THREADS} (determined by CPU cores/default)`);
        console.log('Test with:');
        console.log(`  curl http://localhost:${PORT}/api/primes/1000000`);
    });
}
