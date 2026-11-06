# RayyAi Protected

## Run locally
1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env`.
4. Put your NEW Groq API key in `.env` as `GROQ_API_KEY=...`.
5. Run `npm start` and open `http://localhost:3000`.

## Deploy on Render
- Create a Web Service and connect this GitHub repository.
- Build Command: `npm install`
- Start Command: `npm start`
- Choose the Free plan if available.
- Add `GROQ_API_KEY` in Render's Environment settings. Do not commit `.env`.
- `GROQ_MODEL` is optional; default is `openai/gpt-oss-120b`.

The server listens on `0.0.0.0` and uses Render's `PORT` automatically.
