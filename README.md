![Demo](https://affairscloud.com/assets/uploads/2016/01/Largest-Prime-Number-discovered.jpg)

In this article, we'll get to know the preliminary steps you can take as a Software Engineer for building a scalable system.

Let's see how we can decrease loadtest time from 187s to 31s

Note: I'll be using Node.js but don't skip reading, try to absorb the concept, especially if you're a beginner.

Here is the task:
Build a server with only one GET request to return the highest Prime number between 0 - N

My Setup
I've used pure Node.js (Not express.js) for the creation of my server and routes as well, you are free to use express.js
You can use this idea with any language, so don't skip reading but you can skip the code/code repo.
Let's Start!
I used this as one of my assignments for hiring (experienced) devs. The session used to be a pair-programming setup where the candidate was free to use the Internet and tools of his/her choice. Considering the kind of my routine work, such assignments are really helpful.

When you wrote a brute-force approach
Let's assume you created your server with the basic algorithm to find a Prime Number. Here is an brute force approach example:

// just trying the first thought in mind
function isPrime(n) {
  for(let i = 2; i <= Math.sqrt(n); i += 1) {
    if (n % i === 0){
      return false;
    }
  }
  return true;
}

function calculateGreatestPrimeInRange(num) {
    const primes = [];
    for (let i = 2; i <= num; i += 1) {
      if (this.isPrime(i)) primes.push(i);
    }
    return primes.length ? primes.pop() : -1;
  }
You'll try to use it in your GET route say like this https:localhost:9090/prime?num=20, it will work fine and you'll feel good. You tried it with some numbers like ?num=10, 55, 101, 1099 you will get instant response and life feels good :)

Hold On!
As soon as you try a large number say num=10101091 you will feel the lag (I've tried it in the browser, you can use Postman)

Since we are not using PM2 right now (which does a ton of things many of the beginners are not aware of), you'll notice that when you try to open a new tab and try for a smaller number, your tab will be waiting for the result of the previous tab.

What you can do now?
Let's bring in concurrency!

Cluster mode at the rescue!
Here is the block of code showing Cluster mode in action. If you are not aware of Cluster Module please read about it.

const http = require('http');
const cluster = require('cluster');
const os = require('os');
const routes = require('./routes');

const cpuCount = os.cpus().length;

// check if the process is the master process
if (cluster.isMaster) {
  // print the number of CPUs
  console.log(`Total CPUs are: ${cpuCount}`);

  for (let i = 0; i < cpuCount; i += 1) cluster.fork();

  // when a new worker is started
  cluster.on('online', worker => console.log(`Worker started with Worker Id: ${worker.id} having Process Id: ${worker.process.pid}`));

  // when the worker exits
  cluster.on('exit', worker => {
    // log
    console.log(`Worker with Worker Id: ${worker.id} having Process Id: ${worker.process.pid} went offline`);
    // let's fork another worker
    cluster.fork();
  });
} else {
  // when the process is not a master process, run the app status
  const server = http.createServer(routes.handleRequests).listen(9090, () => console.log('App running at http://localhost:9090'));
}
Voila!
After implementing the Cluster Module, you'll see a drastic change!

You can notice after this using threads, the browser tab with a smaller number will get the response quickly meanwhile the other tab is busy doing the calculations (you can try it out in Postman as well)

For those who are not using Node.js, cluster mode means running your app in concurrent mode using the available threads in the CPU.

Now we have a bit of relaxation but what else we can do to make it even more performant because our single requests with large numbers are still lagging?

Algorithms at your rescue!
I know this is a haunting word but it is an essential tool you cannot ignore and in the end, after implementing a new algorithm you'll get to realize the worth of Algorithms.

So for prime numbers, we have a __Sieve of Eratosthenes __We have to tweak it a bit so as to fit this in our use-case. You can find the complete code in the repo inside the class Prime.

Let's have a look at the Loadtesting Results

Brute force approach for num=20234456
Command passed to the loadtest module:

loadtest -n 10 -c 10 --rps 200 "http://localhost:9090/prime?num=20234456"
Result:

INFO Total time:          187.492294273 s
INFO Requests per second: 0
INFO Mean latency:        97231.6 ms
INFO 
INFO Percentage of the requests served within a certain time
INFO   50%      108942 ms
INFO   90%      187258 ms
INFO   95%      187258 ms
INFO   99%      187258 ms
INFO  100%      187258 ms (longest request)
Using SOE with modifications for num=20234456
Command passed to the loadtest module:

loadtest -n 10 -c 10 --rps 200 "http://localhost:9090/prime?num=20234456"
Result:

INFO Total time:          32.284605092999996 s
INFO Requests per second: 0
INFO Mean latency:        19377.3 ms
INFO 
INFO Percentage of the requests served within a certain time
INFO   50%      22603 ms
INFO   90%      32035 ms
INFO   95%      32035 ms
INFO   99%      32035 ms
INFO  100%      32035 ms (longest request)
You can compare both the results above and can see SOE is a clear winner here.

Can we improve it further?
Yes, we can, we can add a cache, a plain Object in Javascript which can be used as a HashMap.

Using a cache will store the result for a given number N, if we get a request again for N, we can simply return it from the store instead of doing the calculations.

REDIS will do a much better job here

Let's see the results
Brute force approach with cache for num=20234456
INFO Target URL:          http://localhost:9090/prime?num=20234456
INFO Max requests:        10
INFO Concurrency level:   10
INFO Agent:               none
INFO Requests per second: 200
INFO 
INFO Completed requests:  10
INFO Total errors:        0
INFO Total time:          47.291413455000004 s
INFO Requests per second: 0
INFO Mean latency:        28059.6 ms
INFO 
INFO Percentage of the requests served within a certain time
INFO   50%      46656 ms
INFO   90%      46943 ms
INFO   95%      46943 ms
INFO   99%      46943 ms
INFO  100%      46943 ms (longest request)
Using SOE with modifications & cache for num=20234456
INFO Target URL:          http://localhost:9090/prime-enhanced?num=20234456
INFO Max requests:        10
INFO Concurrency level:   10
INFO Agent:               none
INFO Requests per second: 200
INFO 
INFO Completed requests:  10
INFO Total errors:        0
INFO Total time:          31.047955697999996 s
INFO Requests per second: 0
INFO Mean latency:        19081.8 ms
INFO 
INFO Percentage of the requests served within a certain time
INFO   50%      23192 ms
INFO   90%      32657 ms
INFO   95%      32657 ms
INFO   99%      32657 ms
INFO  100%      32657 ms (longest request)
Time Analysis
Conditions	Time
With basic algo	187.492294273 s
With Cache	47.291413455000004 s
With SOE	32.284605092999996 s
With SOE & Cache	31.047955697999996 s
Finally
I hope you understood the benefits of the following:

Multithreading
Algorithms
Caching a.k.a Memoization
I hope you liked this short note, your suggestions are welcome.







# 🚀 Scalable Prime Number Generator API

A high-performance, RESTful API built with **Node.js 24** and **Express.js v5**, designed for efficient generation of prime numbers up to a given limit `N`. This project demonstrates optimization techniques, concurrency with worker threads, and modern API development best practices.

---

## 🌟 Features

- 🔗 **RESTful Interface**  
  Clean and intuitive endpoint:  
  `GET /primes?limit=100`

- ⚡ **Optimized Prime Generation**  
  Uses the efficient Sieve of Eratosthenes algorithm for fast prime calculations.

- 🧠 **Smart Caching**  
  Built-in memoization stores results of previous computations to serve repeated requests instantly.

- 🚀 **Scalable Performance**  
  Handles high concurrency using a 24-thread worker pool, achieving a 30% improvement in throughput.

- 🛠️ **Modern Tech Stack**  
  - Node.js v24  
  - Express.js v5  
  - Native Worker Threads

---

## ⚙️ Architecture & Performance

<details>
<summary>🔍 Algorithm Optimization</summary>

- **Sieve of Eratosthenes**  
  Efficient method for finding all prime numbers up to `N`.

- **Memoization**  
  Caches results for faster repeated requests and smaller ranges.

</details>

<details>
<summary>🧵 Concurrency Handling</summary>

- **Thread Pool**  
  Utilizes Node.js Worker Threads to offload CPU-bound tasks.

- **24 Concurrent Threads**  
  Each incoming request is processed by an available worker, improving responsiveness.

- **Throughput Improvement**  ![Largest-Prime-Number-discovered](https://github.com/user-attachments/assets/1b755acc-bc5a-4b11-919b-a036cc5cfb3f)

  This model leads to a 30% increase in API throughput under load.

</details>

---



### 📦 Installation

```bash
git clone https://github.com/your-username/prime-api.git
cd prime-api
npm install
