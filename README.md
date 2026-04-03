Corsair — Autonomous Finance Interface (CARV-1 + Arbitrum)

---

Overview

Corsair is a conversational, operator-style interface for interacting with autonomous financial systems.

It combines:
- A chat-based control surface
- Connected wallet interaction (user-side)
- Backend treasury execution (agent-side)
- Managed strategy runtime visibility (CARV-1)

Corsair is designed to feel like a high-agency operator, not a passive assistant.

---

Core Components

1. Corsair Chat (Frontend)
2. Arbitrum Backend (Treasury Execution Layer)
3. CARV-1 Strategy Runtime (Managed Strategy Engine)

These components are intentionally separated to enforce clear execution boundaries.

---

Architecture

[ User ]
   ↓
Corsair Chat (Next.js / Vercel)
   ↓
Route Controller (/api/chat)
   ↓
-----------------------------------
| Backend Services                |
|                                |
| 1. Arbitrum Backend (port 3001)|
| 2. Strategy API (port 8787)    |
-----------------------------------

---

Wallet Model (Critical Design)

Corsair enforces strict separation between:

1. Connected User Wallet
   - Controlled by the user (e.g. MetaMask)
   - Used for deposits and user-triggered transactions
   - Requires explicit approval

2. Corsair Treasury Wallet
   - Controlled by backend services
   - Executes managed strategy actions
   - Not directly exposed to user control

This separation prevents ambiguity and aligns with real-world asset custody models.

---

Arbitrum Integration

Corsair operates on Arbitrum Sepolia for testing.

Capabilities:
- Read treasury wallet state
- Execute treasury transactions via backend
- Execute user-wallet transactions via frontend (wagmi/MetaMask)

Supported flows:

1. Treasury Execution
   Example:
   send 0.001 ETH to 0x...

   - Executed by backend
   - Uses Corsair treasury wallet

2. User Wallet Execution
   Example:
   send 0.001 ETH from my wallet to 0x...

   - Opens connected wallet
   - Requires user approval

---

CARV-1 (Managed Strategy Runtime)

CARV-1 is a managed strategy engine integrated into Corsair.

It is NOT:
- A direct trading wallet
- A user-controlled execution account

It IS:
- A backend-controlled strategy runtime
- A vault-style accounting system
- A signal + execution gating engine

---

CARV-1 Responsibilities

- Maintain vault accounting
- Track deposits and shares
- Enforce risk policies
- Gate execution based on:
  - capital
  - signal quality
  - risk thresholds
- Expose runtime state to Corsair

---

CARV-1 Runtime Model

Runtime modes:
- safe → non-live mode
- live → eligible for execution

Execution modes:
- simulated → paper execution
- live → real execution

Live state:
- live → execution allowed
- paper → simulation only
- blocked → execution prevented

---

CARV-1 Data Exposure

Via Strategy API (port 8787):

Endpoints:
GET /strategies
GET /strategies/carv-1?agent=agent-001

Exposed data includes:
- runtime state (mode, liveState, reason)
- execution configuration
- vault overview (TVL, shares, liquidity)
- risk policy
- deposit/withdrawal rules
- accounting parameters

---

Chat Capabilities

Corsair chat supports:

Strategy:
- show strategies
- show CARV-1

Wallet:
- read my wallet
- read arbitrum wallet
- switch to arbitrum sepolia

Execution:
- send ETH (treasury)
- send ETH from my wallet (user wallet)

Strategy Interaction:
- deposit into CARV-1
- withdraw from CARV-1

---

Environment Variables

Frontend (Vercel / Next.js):

OPENROUTER_API_KEY=
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

CORSAIR_ARBITRUM_BACKEND_URL=http://<backend-ip>:3001
CORSAIR_STRATEGY_API_URL=http://<backend-ip>:8787

---

Backend Services (VPS)

You must host:

1. Arbitrum Backend (port 3001)
2. Strategy API (port 8787)

These replace localhost dependencies.

---

Deployment Notes

Local development works because:
- Chat → localhost:3001
- Chat → localhost:8787

Production requires:
- VPS hosting both services
- Vercel pointing to VPS endpoints

---

Execution Philosophy

Corsair is not a chatbot.

It is:
- an operator interface
- a control surface for autonomous systems
- a bridge between user intent and backend execution

---

Current Status

Working:
- Chat interface
- Wallet connection
- User-wallet execution
- Treasury execution
- CARV-1 strategy visibility
- Runtime state exposure

In progress:
- Full deposit/withdraw UX
- Strategy execution automation depth
- UI polish

---

Summary

Corsair combines:
- conversational control
- wallet interaction
- backend execution
- managed strategy runtime

CARV-1 provides:
- structured strategy logic
- risk enforcement
- vault accounting
- execution gating

Arbitrum provides:
- execution environment
- transaction settlement
- wallet interaction layer

Together, they form a minimal autonomous finance system.

---