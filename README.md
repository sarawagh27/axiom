# Pingbomb Bot

Pingbomb Bot is a **modular Discord bot** built using **Node.js** and **discord.js**, designed to demonstrate clean architecture, safety-first command handling, and real-world bot features such as cooldowns, logging, persistence, and owner controls.

The project focuses on **controlled usage**, **maintainability**, and **24/7 deployment readiness**, rather than spam or abuse.

---

## Why This Project Exists

This bot was built as a learning and showcase project to:

- Practice real Discord bot architecture
- Implement safety mechanisms (cooldowns, opt-in, owner controls)
- Learn structured logging and persistent state handling
- Prepare a bot for cloud deployment (Railway / Render)
- Follow clean, modular JavaScript design

---

## Key Features

### Core Functionality
- Slash-command based interface
- Controlled pingbomb system
- Multi-target ping support
- Start, Stop, and StopAll controls

### Safety & Control
- Cooldown per caller (prevents spam)
- Owner-only StopAll command
- User opt-in system
- Automatic timeout handling

### Engineering Features
- Modular file structure
- Persistent state (`state.json`)
- Structured logging (`pingbomb.log`)
- Clean separation of logic
- Easy to extend and maintain

### Deployment Ready
- Environment variable support
- No secrets committed to GitHub
- Works locally and on cloud platforms
- Designed for 24/7 hosting

---

## Commands Overview

| Command | Description |
|-------|-------------|
| `/pingbomb start` | Start a controlled pingbomb |
| `/pingbomb stop` | Stop an active pingbomb |
| `/pingbomb stopall` | Stop all pingbombs (owner only) |
| `/pingbomb status` | View current pingbomb status |
| `/pingbomb optin` | Allow yourself to be pinged |

---

## Project Structure

```txt
discord-bot/
│
├── index.js        # Bot entry point
├── commands.js     # Slash command definitions
├── pingbomb.js     # Core pingbomb logic
├── cooldown.js     # Cooldown handling
├── state.js        # Persistent state manager
├── logger.js       # File-based logging
├── config.js       # Central configuration
│
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
