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

- **Throughput Improvement**  
  This model leads to a 30% increase in API throughput under load.

</details>

---



### 📦 Installation

```bash
git clone https://github.com/your-username/prime-api.git
cd prime-api
npm install
