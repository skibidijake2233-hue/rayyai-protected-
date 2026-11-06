require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "30kb" }));
app.use(express.static(path.join(__dirname)));

app.use("/api/", rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false
}));

app.post("/api/chat", async (req, res) => {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return res.status(503).json({ error: "Server API key is not configured." });

    const incoming = req.body && Array.isArray(req.body.messages) ? req.body.messages : [];
    const messages = incoming.slice(-12).filter(m =>
      m && ["user", "assistant"].includes(m.role) &&
      typeof m.content === "string" && m.content.length <= 4000
    );
    if (!messages.length || messages[messages.length - 1].role !== "user") {
      return res.status(400).json({ error: "Please send a valid message." });
    }

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: "You are RayyAi, a helpful and safe AI assistant. Answer clearly and politely. If the user writes in Burmese, answer in Burmese." },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1200
      })
    });

    const data = await groqResponse.json();
    if (!groqResponse.ok) {
      console.error("Groq API error:", data.error?.message || groqResponse.status);
      return res.status(502).json({ error: "AI service error. Please try again later." });
    }
    const reply = data.choices?.[0]?.message?.content;
    if (typeof reply !== "string") return res.status(502).json({ error: "No response from AI service." });
    res.json({ reply });
  } catch (error) {
    console.error("Chat error:", error.message);
    res.status(500).json({ error: "Server error. Please try again." });
  }
});

app.get("*", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`RayyAi is running on port ${PORT}`);
});
