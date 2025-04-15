// const { defineSecret } = require('firebase-functions/params');
// const { https } = require('firebase-functions/v2');
// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const multer = require('multer');
// const fs = require('fs');
// const path = require('path');
// const os = require('os');
// const OpenAI = require('openai');

// // ✅ Bind OpenAI API key secret
// const OPENAI_API_KEY = defineSecret('OPENAI_API_KEY');

// // ✅ Setup Express app
// const app = express();
// app.use(cors());
// app.use(bodyParser.json());
// app.use(express.static('public'));

// // ✅ Multer setup
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, os.tmpdir()),
//   filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
// });
// const upload = multer({ storage });

// // ✅ Path to users file
// const USERS_FILE = path.join(__dirname, 'users.json');

// // ✅ Login endpoint
// app.post('/api/login', (req, res) => {
//   const { username, password } = req.body;
//   try {
//     const users = JSON.parse(fs.readFileSync(USERS_FILE));
//     const user = users.find(u => u.username === username && u.password === password);
//     if (!user) return res.status(400).json({ error: "Invalid username or password." });
//     res.json({ message: "Login successful!", username });
//   } catch (error) {
//     console.error("Login Error:", error);
//     res.status(500).json({ error: "Login failed." });
//   }
// });

// // ✅ Transcription endpoint
// app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ error: 'No audio file provided' });

//     const allowedFormats = ['audio/flac', 'audio/m4a', 'audio/mp3', 'audio/mp4', 'audio/mpeg', 'audio/mpga', 'audio/oga', 'audio/ogg', 'audio/wav', 'audio/webm'];
//     if (!allowedFormats.includes(req.file.mimetype)) {
//       await fs.promises.unlink(req.file.path);
//       return res.status(400).json({ error: `Unsupported file format: ${req.file.mimetype}` });
//     }

//     // ✅ OpenAI instantiated inside the request
//     const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

//     const transcription = await openai.audio.transcriptions.create({
//       file: fs.createReadStream(req.file.path),
//       model: "whisper-1",
//       language: "auto"
//     });

//     await fs.promises.unlink(req.file.path);
//     res.json({
//       text: transcription.text || "No transcription available.",
//       detectedLanguage: transcription.language || "Unknown"
//     });

//   } catch (error) {
//     console.error('Error transcribing audio:', error);
//     res.status(500).json({ error: 'Failed to transcribe audio' });
//   }
// });

// // ✅ Translation endpoint
// app.post('/api/translate', async (req, res) => {
//   try {
//     const { text, targetLanguage } = req.body;
//     if (!text || !targetLanguage) {
//       return res.status(400).json({ error: 'Text and target language are required' });
//     }

//     const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

//     const completion = await openai.chat.completions.create({
//       model: "gpt-4o-mini", // ✅ Use official model name
//       messages: [
//         { role: "system", content: `Translate the following text to ${targetLanguage}. Only return the translated text.` },
//         { role: "user", content: text }
//       ]
//     });

//     const translation = completion.choices[0]?.message?.content || "Translation failed.";
//     res.json({ translation });

//   } catch (error) {
//     console.error('Error translating text:', error);
//     res.status(500).json({ error: 'Failed to translate text' });
//   }
// });

// // ✅ Export as HTTPS function with secret binding
// exports.api = https.onRequest(
//   { secrets: [OPENAI_API_KEY] },
//   app
// );

const { defineSecret } = require('firebase-functions/params');
const { https } = require('firebase-functions/v2');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const os = require('os');
const OpenAI = require('openai');

const OPENAI_API_KEY = defineSecret('OPENAI_API_KEY');

// ✅ Setup Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// ✅ Multer for audio uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, os.tmpdir()),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// ✅ Optional login fallback
const USERS_FILE = path.join(__dirname, 'users.json');

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  try {
    const users = JSON.parse(fs.readFileSync(USERS_FILE));
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return res.status(400).json({ error: "Invalid username or password." });
    res.json({ message: "Login successful!", username });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Login failed." });
  }
});

// ✅ /api/transcribe
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No audio file provided' });

    const allowedFormats = [
      'audio/flac', 'audio/m4a', 'audio/mp3', 'audio/mp4',
      'audio/mpeg', 'audio/mpga', 'audio/oga', 'audio/ogg',
      'audio/wav', 'audio/webm'
    ];

    if (!allowedFormats.includes(req.file.mimetype)) {
      await fs.promises.unlink(req.file.path);
      return res.status(400).json({ error: `Unsupported file format: ${req.file.mimetype}` });
    }

    // ✅ Instantiate OpenAI inside the handler
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY.value() });

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
      model: "whisper-1",
      language: "auto"
    });

    await fs.promises.unlink(req.file.path);

    res.json({
      text: transcription.text || "No transcription available.",
      detectedLanguage: transcription.language || "Unknown"
    });

  } catch (error) {
    console.error('Error transcribing audio:', error);
    res.status(500).json({ error: 'Failed to transcribe audio' });
  }
});

// ✅ /api/translate
app.post('/api/translate', async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;
    if (!text || !targetLanguage) {
      return res.status(400).json({ error: 'Text and target language are required' });
    }

    // ✅ Instantiate OpenAI inside the handler
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY.value() });

    const completion = await openai.chat.completions.create({
      // model: "gpt-4.1-nano",
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: `Translate the following text to ${targetLanguage}. Only return the translated text.` },
        { role: "user", content: text }
      ]
    });

    const translation = completion.choices[0]?.message?.content || "Translation failed.";
    res.json({ translation });

  } catch (error) {
    console.error('Error translating text:', error);
    res.status(500).json({ error: 'Failed to translate text' });
  }
});

// ✅ Export function with secret binding (runtime only)
exports.api = https.onRequest({ secrets: [OPENAI_API_KEY] }, app);
