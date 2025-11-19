# AIAhuraChat

This is a chatbot project developed as a **technical test for Green Web Company**.  
It demonstrates a real-time chat interface with both a mock API and a live OpenRouter-powered backend.

---

## Features

- Real-time chat with user and assistant messages.
- Two API modes: **mock chat** and **real OpenRouter chat**.
- Automatic scrolling and typing indicators.
- Responsive design with RTL support.
- Multi-line input with auto-resize up to 8 rows.
- Theme toggle (light/dark mode).
- Custom animated loading indicator.

---

## Demo

![Chatbot Screenshot](./public/Screenshot%202025-11-19%20at%203.24.16 PM.png)

---

## Getting Started

### Prerequisites

- Node.js >= 18
- npm / yarn / pnpm / bun
- OpenRouter API key (if using real chat)

### Installation

```bash
# Install dependencies
npm install
# or
yarn
# or
pnpm install


Open http://localhost:3000
 in your browser to see the chatbot in action.


 Environment Variables
Create a .env.local file at the root of the project and add your OpenRouter API key:
OPENROUTER_API_KEY=your_api_key_here

```

Usage

Switch API mode: Use the button in the chat header to toggle between mock chat (/api/chatMock) and real chat (/api/chat).


Send a message: Type in the input field and press Enter or click the send button.


Typing indicator: Shows animated dots while the assistant is “typing”.

Auto-resize input: Input grows up to 8 rows; after that it scrolls.

Technologies


Next.js 13
React
Tailwind CSS
Lucide Icons
OpenRouter API
LangChain (for backend LLM integration)
Project Structure


app/ – Next.js app routes and pages.

components/ – React components including the chatbot widget.

lib/ – Utility functions (cn, etc.).

app/api/chat/ – API endpoint for real OpenRouter chat.

app/api/chatMock/ – API endpoint for mock chat responses.

Learn More

Next.js Documentation

Tailwind CSS Documentation

LangChain Documentation

OpenRouter API Docs

Deploy
You can deploy the project easily on Vercel:
vercel

Check Next.js Deployment Documentation for more details.
