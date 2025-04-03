# 🌍 Decentralized Uptime Monitor

## 📌 Overview
This project is a **decentralized uptime monitoring system** that tracks whether a website is up or down. Instead of relying on a single centralized service, this system has **validators from around the world** who continuously check website status. Validators are **rewarded in crypto** for their work, making this a distributed and incentivized solution.

## 🚀 Features
- **Global Validation:** Multiple validators verify website uptime from different locations.
- **Crypto Incentives:** Validators are rewarded in cryptocurrency for accurate uptime checks.
- **Trustless & Decentralized:** No single point of failure; verification is distributed.
- **Real-Time Alerts:** Get notified when a website goes down.

## 📂 Project Structure
The repository follows a **monorepo structure** using **Turborepo**:

```
WEBGA...
│── apps
│   ├── api          # Backend API services
│   ├── frontend     # Web-based frontend
│   ├── hub          # Central coordination service
│   ├── validator    # Validator nodes checking uptime
│
│── packages
│   ├── common             # Shared utilities
│   ├── db                 # Database configurations
│   ├── eslint-config      # ESLint rules
│   ├── typescript-config  # Shared TypeScript settings
│   ├── ui                 # UI components
│
│── .gitignore
│── .npmrc
│── bun.lock
│── package.json
│── turbo.json             # Turborepo configuration
│── README.md
```

## 🔧 Installation & Setup
### Prerequisites
- [Node.js](https://nodejs.org/)
- [Bun](https://bun.sh/) (Recommended package manager)
- Crypto wallet (for validator payments)
- Docker (for database setup)

### Clone the Repository
```sh
git clone https://github.com/yourusername/uptime-monitor.git
cd uptime-monitor
```

### Install Dependencies
```sh
bun install
```

### Step-by-Step Setup

#### 1️⃣ Start the Database
The system relies on a database to store uptime data. Run the database using Docker:
```sh
docker-compose up -d
```
(Ensure your `docker-compose.yml` is correctly set up in the `packages/db` directory.)

#### 2️⃣ Start the API Service
Once the database is running, start the backend API:
```sh
bun run dev --filter=api
```

#### 3️⃣ Start the Hub Service
The hub service coordinates communication between validators and the API:
```sh
bun run dev --filter=hub
```

#### 4️⃣ Start the Validator Service
The validators periodically check website uptime and report the status:
```sh
bun run dev --filter=validator
```

#### 5️⃣ Start the Frontend
Finally, launch the frontend to access the web UI:
```sh
bun run dev --filter=frontend
```

Once all services are up and running, your uptime monitor will be fully functional! 🚀

## 🔗 How It Works
1. Website owners register their site for monitoring.
2. Validators across the globe periodically check if the website is up.
3. If a website is found down, validators submit proofs.
4. Honest validators get rewarded in crypto.

## 🏗️ Roadmap
- [ ] Implement on-chain dispute resolution
- [ ] Support for multiple cryptocurrencies
- [ ] Web dashboard for real-time status tracking

## 🤝 Contributing
Pull requests are welcome! Feel free to open an issue or suggest new features.

## 📜 License
This project is licensed under the MIT License.

---

### 📌 Follow & Connect
Let's build a decentralized future together! Feel free to connect with me on [LinkedIn](https://www.linkedin.com/in/srikant-pandey/) 🚀
