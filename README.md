# ⚡ Axiom  
### Controlled Discord Automation Engine

> A modular Discord automation engine built with Node.js and discord.js  
> Designed for controlled execution, safety, and scalable architecture.

---

## 🚀 Overview

**Axiom** is a structured Discord automation framework focused on controlled, monitored command execution.

It includes built-in cooldown systems, logging, persistent state handling, and safety controls to ensure reliable operation across servers.

Built with clean modular architecture for maintainability and scalability.

---

## ✨ Core Features

- ⚙️ Slash command architecture
- 🎯 Controlled multi-target execution system
- 🛑 Stop / Emergency stop controls
- ⏳ Intelligent cooldown management
- 💾 Persistent state storage
- 📜 Structured logging system
- 🧩 Modular file architecture
- ☁️ 24/7 deployment ready (Render + UptimeRobot)

---

## 🧠 Project Structure

```
axiom/
│
├── index.js        → Entry point
├── commands.js     → Slash command registration
├── pingbomb.js     → Core automation logic
├── cooldown.js     → Cooldown system
├── logger.js       → Logging module
├── state.js        → Persistent state handler
├── server.js       → Keep-alive server (for hosting)
├── config.js       → Config file
├── .env            → Environment variables
└── package.json
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js |
| Framework | discord.js |
| Config | dotenv |
| Hosting | Render |
| Monitoring | UptimeRobot |
| Version Control | Git + GitHub |

---

## 🔐 Safety Architecture

Axiom is built with controlled automation in mind:

- Owner-restricted execution
- Global stop system
- Cooldown enforcement
- Execution logging
- Persistent state safety

---

## 🧪 Running Locally

### 1️⃣ Install dependencies

```
npm install
```

### 2️⃣ Create `.env` file

```
TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
GUILD_ID=your_guild_id_here
```

### 3️⃣ Start the bot

```
node index.js
```

---

## ☁️ 24/7 Hosting (Render + UptimeRobot)

1. Deploy repository to Render
2. Add environment variables in Render dashboard
3. Ensure `server.js` runs to keep process alive
4. Use UptimeRobot to ping your Render URL every 5 minutes

---

## 🎯 Vision

Axiom is designed as a scalable automation engine, not just a basic Discord bot.

Future improvements may include:

- Role-based permission system
- Multi-guild scaling
- Web dashboard
- Metrics tracking

---

## 👩‍💻 Author

**Sara Wagh**  
Computer Science Engineer  
Focused on scalable system design and automation architecture.

---

## 📜 License

MIT License
