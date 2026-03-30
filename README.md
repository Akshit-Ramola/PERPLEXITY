# Perplexity AI Clone

A full-stack, AI-powered search engine and chat application styled after Perplexity. This project utilizes advanced LangChain agents to perform real-time internet searches and includes robust background automation capabilities.

## 🚀 Features

- **Web-Connected AI Search**: Unlike standard LLMs, this application uses **LangChain**, **Google Gemini**, and the **Tavily API** to browse the web in real-time and provide up-to-date answers with sources.
- **Perplexity-Style UI**: A sleek, dark-mode user interface built with React, TailwindCSS, and markdown rendering. It features typing animations, optimistic UI updates, and a clean reading experience.
- **Automated Background Tasks (Cron Jobs)**:
  - Users can create scheduled prompts (e.g., *"Give me a daily summary of tech news every morning at 8:00 AM"*).
  - The backend uses `node-cron` to autonomously wake up, run the complex LangChain search flow, and drop a fully generated markdown briefing into the user's personal chat library.
- **Dynamic Chat Library**:
  - Live filterable chat history accessible via the native `Ctrl + K` global keyboard shortcut.
  - Mistral AI integration automatically reads your first prompt and generates a concise, relevant title for your thread.
- **Real-Time Responsiveness**: Utilizes robust state management (Redux Toolkit) and seamless token streaming simulations to provide the premium "Analyzing sources..." and typewriter effects.
- **Secure Authentication**: JWT and HTTP-Only cookie-based user accounts and sessions.

## 🛠️ Technology Stack

**Frontend:**
- React (Vite)
- Tailwind CSS
- Redux Toolkit (State Management)
- React-Markdown & Remark-GFM (Code and text rendering)
- Axios & React Router

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose (Data persistence)
- Node-Cron (Background task scheduling)
- Socket.io (Real-time communication framework)

**AI & Agents:**
- LangChain (Agent orchestration)
- Google GenAI (`gemini-2.5-flash-lite`) for primary logic and tool utilization
- Mistral AI (`mistral-small-latest`) for fast, efficient chat title generation
- Tavily API (Internet search tool execution)

## ⚙️ How It Works (Workflow Architecture)

1. **User Interaction**: The user submits a prompt in the React frontend. The UI immediately enters an optimistic "Thinking..." state, locking the specific chat to prevent overlapping requests.
2. **Agentic Reasoning**: The Express backend receives the prompt and passes it to the LangChain orchestration layer. 
3. **Tool Execution**: Google Gemini assesses if the prompt requires external knowledge. If so, it invokes the custom `searchInternet` tool connected to the Tavily API, aggregates the results, and synthesizes a final answer.
4. **Data Persistence**: The completed markdown response is securely saved to MongoDB, linking it to both the user and the specific chat thread ID.
5. **Background Automation**: If a user creates a recurring task string via the "Automated Tasks" panel, the backend `taskScheduler` stores the cron instruction in MongoDB. Without needing any frontend interaction, the server will trigger the LangChain agent at exactly the scheduled time, perform the web scrape, and push the results into a brand new chat thread.

## 🏃 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB connection string
- API Keys for Google Gemini, Mistral AI, and Tavily.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Akshit-Ramola/PERPLEXITY.git
   cd PERPLEXITY
   ```

2. **Backend Setup**
   ```bash
   cd Backend
   npm install
   ```
   *Create a `.env` file in the Backend directory:*
   ```env
   PORT=8000
   MONGODB_URI=your_mongo_connection_string
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_google_gemini_key
   MISTRAL_API_KEY=your_mistral_key
   TAVILY_API_KEY=your_tavily_api_key
   ```
   *Start the Backend server:*
   ```bash
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../Frontend
   npm install
   ```
   *Start the React Vite server:*
   ```bash
   npm run dev
   ```

4. **Access the Application**
   Open your browser and navigate to `http://localhost:5173`.
