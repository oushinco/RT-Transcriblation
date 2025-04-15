
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const OpenAI = require('openai');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const os = require('os');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 10000;

// ✅ Path to Users File
const USERS_FILE = path.join(__dirname, 'users.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// ✅ Configure Multer (Temp Storage for Audio Files)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, os.tmpdir()), // Temp directory
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

// ✅ Configure OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ✅ User Authentication (Login)
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    try {
        const users = JSON.parse(fs.readFileSync(USERS_FILE));

        const user = users.find(u => u.username === username && u.password === password);
        if (!user) {
            return res.status(400).json({ error: "Invalid username or password." });
        }

        res.json({ message: "Login successful!", username });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Login failed." });
    }
});

// ✅ Transcription API (Audio to Text)
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file provided' });
        }

        // ✅ Allowed Audio Formats
        const allowedFormats = ['audio/flac', 'audio/m4a', 'audio/mp3', 'audio/mp4', 'audio/mpeg', 'audio/mpga', 'audio/oga', 'audio/ogg', 'audio/wav', 'audio/webm'];
        if (!allowedFormats.includes(req.file.mimetype)) {
            fs.promises.unlink(req.file.path).catch(console.error);
            return res.status(400).json({ error: `Unsupported file format: ${req.file.mimetype}. Please upload a valid audio file.` });
        }

        // ✅ Send File to OpenAI Whisper
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(req.file.path),
            model: "whisper-1",
            language: "auto"
        });

        // ✅ Delete Temp File
        fs.promises.unlink(req.file.path).catch(console.error);

        // res.json({ text: transcription.text || "No transcription available." });
        res.json({ 
            text: transcription.text || "No transcription available.",
            detectedLanguage: transcription.language || "Unknown" 
        });

    } catch (error) {
        console.error('Error transcribing audio:', error);
        res.status(500).json({ error: 'Failed to transcribe audio' });
    }
});

// ✅ Translation API (Text to Multiple Languages)
app.post('/api/translate', async (req, res) => {
    try {
        const { text, targetLanguage } = req.body;
        if (!text || !targetLanguage) {
            return res.status(400).json({ error: 'Text and target language are required' });
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: `Translate the following text to ${targetLanguage}. Only return the translated text.` },
                { role: "user", content: text }
            ],
        });

        const translation = completion.choices[0]?.message?.content || "Translation failed.";
        res.json({ translation });

    } catch (error) {
        console.error('Error translating text:', error);
        res.status(500).json({ error: 'Failed to translate text' });
    }
});

// ✅ Start Server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
