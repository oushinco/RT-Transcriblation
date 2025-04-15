



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
// const admin = require('firebase-admin');

// admin.initializeApp();

// // 🔐 Bind secret (available only at runtime)
// const OPENAI_API_KEY = defineSecret('OPENAI_API_KEY');

// // ✅ Setup Express app
// const app = express();
// app.use(cors());
// app.use(bodyParser.json());
// app.use(express.static('public'));

// // ✅ Middleware to verify Firebase ID token
// const verifyFirebaseToken = async (req, res, next) => {
//   const authHeader = req.headers.authorization || '';
//   const match = authHeader.match(/^Bearer (.+)$/);

//   if (!match) return res.status(401).json({ error: 'Missing or invalid Authorization header' });

//   try {
//     const decoded = await admin.auth().verifyIdToken(match[1]);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     console.error('Token verification error:', err);
//     res.status(401).json({ error: 'Unauthorized' });
//   }
// };

// // ✅ Multer setup for audio file handling
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, os.tmpdir()),
//   filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
// });
// const upload = multer({ storage });

// // ✅ Optional: basic login for dev/test environments
// const USERS_FILE = path.join(__dirname, 'users.json');

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

// // ✅ /api/transcribe
// app.post('/api/transcribe', verifyFirebaseToken, upload.single('audio'), async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ error: 'No audio file provided' });

//     const allowedFormats = ['audio/flac', 'audio/m4a', 'audio/mp3', 'audio/mp4', 'audio/mpeg', 'audio/mpga', 'audio/oga', 'audio/ogg', 'audio/wav', 'audio/webm'];
//     if (!allowedFormats.includes(req.file.mimetype)) {
//       await fs.promises.unlink(req.file.path);
//       return res.status(400).json({ error: `Unsupported file format: ${req.file.mimetype}` }); // 🔧 FIXED syntax here
//     }

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

// // ✅ /api/translate
// app.post('/api/translate', verifyFirebaseToken, async (req, res) => {
//   try {
//     const { text, targetLanguage } = req.body;
//     if (!text || !targetLanguage) {
//       return res.status(400).json({ error: 'Text and target language are required' });
//     }

//     const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

//     const completion = await openai.chat.completions.create({
//       model: "gpt-4o",
//       messages: [
//         { role: "system", content: `Translate the following text to ${targetLanguage}. Only return the translated text.` }, // 🔧 FIXED string quotes
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

// // ✅ Export HTTPS function with secret
// exports.api = https.onRequest(
//   { secrets: [OPENAI_API_KEY] },
//   app
// );





// document.addEventListener('DOMContentLoaded', () => {
//     // UI Elements
//     const loginBtn = document.getElementById("loginBtn");
//     const logoutBtn = document.getElementById("logoutBtn");
//     const appContent = document.getElementById("appContent");
//     const authContent = document.getElementById("authContent");
//     const startBtn = document.getElementById('startRecording');
//     const stopBtn = document.getElementById('stopRecording');
//     const statusElement = document.getElementById('recordingStatus');
//     const transcriptionOutput = document.getElementById('transcriptionOutput');
//     const translationsContainer = document.getElementById('translationsContainer');
//     const historyOutput = document.getElementById('historyOutput');
//     const saveHistoryBtn = document.getElementById('saveHistory');
//     const clearHistoryBtn = document.getElementById('clearHistory');
//     const inputLanguageSelect = document.getElementById('inputLanguageSelect');
//     const languageOptions = document.querySelectorAll("#languageOptions input[type='checkbox']");
//     const BASE_URL = "https://api-q7oacaanwa-uc.a.run.app";
  
//     // Firebase Config
//     const firebaseConfig = {
//       apiKey: "AIzaSyA1LROq3tU_eu12Z3YAiGmlADrncPYpGaY",
//       authDomain: "rt-transcriblation.firebaseapp.com",
//       projectId: "rt-transcriblation",
//       storageBucket: "rt-transcriblation.firebasestorage.app",
//       messagingSenderId: "250626866531",
//       appId: "1:250626866531:web:f0800ca33d0da6efb22756",
//       measurementId: "G-5D3P02K14N"
//     };
  
//     firebase.initializeApp(firebaseConfig);
//     const auth = firebase.auth();
//     const provider = new firebase.auth.GoogleAuthProvider();
  
//     loginBtn.addEventListener("click", () => {
//       auth.signInWithPopup(provider)
//         .then(showApp)
//         .catch(err => {
//           console.error("Login failed", err);
//           alert("Login failed. See console for details.");
//         });
//     });
  
//     logoutBtn.addEventListener("click", () => {
//       auth.signOut().then(showLogin);
//     });
  
//     auth.onAuthStateChanged(user => {
//       user ? showApp() : showLogin();
//     });
  
//     function showApp() {
//       authContent.style.display = "none";
//       appContent.style.display = "block";
//     }
  
//     function showLogin() {
//       authContent.style.display = "block";
//       appContent.style.display = "none";
//     }
  
//     // 🎤 Speech Recognition
//     let recognition;
//     let isRecording = false;
//     let transcriptionHistory = [];
//     let translationHistory = {};
  
//     startBtn.addEventListener('click', () => {
//       if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
//         statusElement.textContent = 'Speech recognition not supported in this browser.';
//         return;
//       }
  
//       recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
//       recognition.continuous = true;
//       recognition.interimResults = true;
//       recognition.lang = inputLanguageSelect.value;
//       isRecording = true;
  
//       statusElement.textContent = 'Listening...';
//       startBtn.disabled = true;
//       stopBtn.disabled = false;
//       transcriptionOutput.value = '';
//       translationsContainer.innerHTML = '';
  
//       recognition.onresult = async (event) => {
//         let lastSentence = "";
//         for (let i = event.resultIndex; i < event.results.length; i++) {
//           if (event.results[i].isFinal) {
//             lastSentence = event.results[i][0].transcript;
//           }
//         }
  
//         if (lastSentence.trim()) {
//           transcriptionOutput.value = lastSentence;
//           transcriptionHistory.push(lastSentence);
//           await translateText(lastSentence);
//         }
//       };
  
//       recognition.onerror = (event) => {
//         console.error('Speech error:', event.error);
//         stopRecording();
//       };
  
//       recognition.start();
//     });
  
//     stopBtn.addEventListener('click', stopRecording);
  
//     function stopRecording() {
//       if (recognition && isRecording) {
//         recognition.stop();
//         isRecording = false;
//         statusElement.textContent = 'Stopped recording.';
//         startBtn.disabled = false;
//         stopBtn.disabled = true;
//         updateHistoryUI();
//       }
//     }
  
//     // 🌍 Translate using OpenAI via Firebase
//     async function translateText(text) {
//       try {
//         const user = firebase.auth().currentUser;
//         if (!user) throw new Error("User not authenticated");
//         const idToken = await user.getIdToken();
  
//         const selectedLanguages = Array.from(languageOptions)
//           .filter(cb => cb.checked)
//           .map(cb => cb.value);
  
//         statusElement.textContent = "Translating...";
//         translationsContainer.innerHTML = "";
  
//         for (const lang of selectedLanguages) {
//           const response = await fetch(`${BASE_URL}/api/translate`, {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json',
//               'Authorization': `Bearer ${idToken}`
//             },
//             body: JSON.stringify({ text, targetLanguage: lang })
//           });
  
//           const data = await response.json();
//           if (data.error) throw new Error(data.error);
  
//           if (!translationHistory[lang]) translationHistory[lang] = [];
//           translationHistory[lang].push(data.translation);
  
//           const div = document.createElement("div");
//           div.classList.add("output-box");
//           div.innerHTML = `<b>${lang}:</b> ${data.translation}`;
//           translationsContainer.appendChild(div);
//         }
  
//         statusElement.textContent = "Translation complete.";
//         updateHistoryUI();
//       } catch (err) {
//         console.error("Translation error:", err);
//         statusElement.textContent = "Translation failed.";
//       }
//     }
  
//     // 📝 History UI
//     function updateHistoryUI() {
//       historyOutput.innerHTML = `<h3>Full Transcription:</h3><p>${transcriptionHistory.join("<br>")}</p>`;
//       for (const [lang, list] of Object.entries(translationHistory)) {
//         historyOutput.innerHTML += `<h3>${lang}:</h3><p>${list.join("<br>")}</p>`;
//       }
//     }
  
//     saveHistoryBtn.addEventListener('click', () => {
//       saveFile("transcription.txt", transcriptionHistory.join("\n"));
//       for (const [lang, list] of Object.entries(translationHistory)) {
//         saveFile(`${lang}.txt`, list.join("\n"));
//       }
//     });
  
//     clearHistoryBtn.addEventListener('click', () => {
//       transcriptionHistory = [];
//       translationHistory = {};
//       historyOutput.innerHTML = "<h3>History cleared.</h3>";
//     });
  
//     function saveFile(filename, content) {
//       const blob = new Blob([content], { type: "text/plain" });
//       const a = document.createElement('a');
//       a.href = URL.createObjectURL(blob);
//       a.download = filename;
//       a.click();
//     }
//   });
  

document.addEventListener('DOMContentLoaded', () => {
    const BASE_URL = "https://api-q7oacaanwa-uc.a.run.app";
  
    const appContent = document.getElementById("appContent");
    const authContent = document.getElementById("authContent");
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const startBtn = document.getElementById("startRecording");
    const stopBtn = document.getElementById("stopRecording");
    const statusElement = document.getElementById("recordingStatus");
    const transcriptionOutput = document.getElementById("transcriptionOutput");
    const translationsContainer = document.getElementById("translationsContainer");
    const historyOutput = document.getElementById("historyOutput");
    const saveHistoryBtn = document.getElementById("saveHistory");
    const languageOptions = document.querySelectorAll("#languageOptions input[type='checkbox']");
    const inputLanguageSelect = document.getElementById('inputLanguageSelect');
  
    // Firebase setup
    const firebaseConfig = {
      apiKey: "AIzaSyA1LROq3tU_eu12Z3YAiGmlADrncPYpGaY",
      authDomain: "rt-transcriblation.firebaseapp.com",
      projectId: "rt-transcriblation",
      storageBucket: "rt-transcriblation.firebasestorage.app",
      messagingSenderId: "250626866531",
      appId: "1:250626866531:web:f0800ca33d0da6efb22756",
      measurementId: "G-5D3P02K14N"
    };
  
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const provider = new firebase.auth.GoogleAuthProvider();
  
    // Prompt for switching account
    auth.onAuthStateChanged(user => {
        if (user) {
          showApp(); // ✅ Show the app directly
          console.log(`Signed in as ${user.email}`);
        } else {
          showLogin();
        }
      });
  
      loginBtn.addEventListener("click", async () => {
        try {
          const user = firebase.auth().currentUser;
          if (user) {
            const choice = confirm(`You are already signed in as ${user.email}.\n\nDo you want to continue with this account?\n\nClick "Cancel" to switch accounts.`);
            if (choice) {
              showApp();
              return;
            } else {
              await auth.signOut(); // Sign out before switching
            }
          }
      
          await auth.signInWithPopup(provider);
          showApp();
      
        } catch (err) {
          console.error("Login failed:", err);
          alert("Login failed. See console for details.");
        }
      });
  
    logoutBtn.addEventListener("click", () => {
      auth.signOut().then(showLogin).catch(console.error);
    });
  
    function showApp() {
      appContent.style.display = "block";
      authContent.style.display = "none";
    }
  
    function showLogin() {
      appContent.style.display = "none";
      authContent.style.display = "block";
    }
  
    // Speech Recognition
    let recognition;
    let isRecording = false;
    let transcriptionHistory = [];
    let translationHistory = {};
  
    document.getElementById("clearHistory").addEventListener("click", () => {
      transcriptionHistory = [];
      translationHistory = {};
      historyOutput.innerHTML = "<h3>History cleared.</h3>";
    });
  
    startBtn.addEventListener('click', () => {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        statusElement.textContent = 'Speech recognition is not supported in this browser.';
        return;
      }
  
      recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = inputLanguageSelect.value;
      isRecording = true;
  
      statusElement.textContent = 'Listening... Speak now.';
      startBtn.disabled = true;
      stopBtn.disabled = false;
      transcriptionOutput.value = '';
      translationsContainer.innerHTML = '';
  
      recognition.onresult = async (event) => {
        let lastSentence = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            lastSentence = event.results[i][0].transcript;
          }
        }
  
        if (lastSentence.trim() !== "") {
          transcriptionOutput.value = lastSentence;
          transcriptionHistory.push(lastSentence);
          await translateText(lastSentence);
        }
      };
  
      recognition.onerror = (event) => {
        console.error('Speech Recognition Error:', event.error);
        stopRecording();
      };
  
      recognition.start();
    });
  
    stopBtn.addEventListener('click', stopRecording);
  
    function stopRecording() {
      if (recognition && isRecording) {
        recognition.stop();
        isRecording = false;
        statusElement.textContent = 'Stopped recording.';
        startBtn.disabled = false;
        stopBtn.disabled = true;
        updateHistoryUI();
      }
    }
  
    async function translateText(text) {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");
        const idToken = await user.getIdToken();
  
        const selectedLanguages = Array.from(languageOptions)
          .filter(checkbox => checkbox.checked)
          .map(checkbox => checkbox.value);
  
        statusElement.textContent = "Translating...";
        translationsContainer.innerHTML = "";
  
        for (const language of selectedLanguages) {
          const response = await fetch(`${BASE_URL}/api/translate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({ text, targetLanguage: language })
          });
  
          const translationData = await response.json();
          if (translationData.error) throw new Error(translationData.error);
  
          if (!translationHistory[language]) translationHistory[language] = [];
          translationHistory[language].push(translationData.translation);
  
          const translationDiv = document.createElement("div");
          translationDiv.classList.add("output-box");
          translationDiv.innerHTML = `<b>${language}:</b> ${translationData.translation}`;
          translationsContainer.appendChild(translationDiv);
        }
  
        statusElement.textContent = "Translation complete.";
        updateHistoryUI();
      } catch (error) {
        console.error('Translation error:', error);
        statusElement.textContent = 'Translation error.';
      }
    }
  
    function updateHistoryUI() {
      historyOutput.innerHTML = `<h3>Full Transcription:</h3><p>${transcriptionHistory.join("<br>")}</p>`;
      for (const [language, translations] of Object.entries(translationHistory)) {
        historyOutput.innerHTML += `<h3>${language}:</h3><p>${translations.join("<br>")}</p>`;
      }
    }
  
    saveHistoryBtn.addEventListener('click', () => {
      saveFile("transcription.txt", transcriptionHistory.join("\n"));
      for (const [language, translations] of Object.entries(translationHistory)) {
        saveFile(`${language}.txt`, translations.join("\n"));
      }
    });
  
    function saveFile(filename, content) {
      const blob = new Blob([content], { type: "text/plain" });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  });
  