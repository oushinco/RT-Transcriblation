
// import config from './config.js'; 

document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('startRecording');
    const stopBtn = document.getElementById('stopRecording');
    const statusElement = document.getElementById('recordingStatus');
    const transcriptionOutput = document.getElementById('transcriptionOutput');
    const translationsContainer = document.getElementById('translationsContainer');
    const historyOutput = document.getElementById('historyOutput');
    const saveHistoryBtn = document.getElementById('saveHistory');
    const languageOptions = document.querySelectorAll("#languageOptions input[type='checkbox']");
    const inputLanguageSelect = document.getElementById('inputLanguageSelect'); // ✅ Added input language dropdown

    const BASE_URL = "https://api-q7oacaanwa-uc.a.run.app"; // Update API URL
    //  const BASE_URL = "https://api-q7oacaanwa-uc.a.run.app"; // Update API URL
    // const BASE_URL = config.API_URL; // ✅ Use API_URL from config.js


    // ---------------- GOOGLE AUTH ----------------

    const appContent = document.getElementById("appContent");
    const authContent = document.getElementById("authContent");
    const loginBtn = document.getElementById("loginBtn");

    // Firebase config
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

    loginBtn.addEventListener("click", () => {
        auth.signInWithPopup(provider)
        .then(() => {
            showApp();
        })
        .catch(console.error);
    });

    auth.onAuthStateChanged(user => {
        if (user) {
        showApp();
        } else {
        showLogin();
        }
    });

    function showApp() {
        appContent.style.display = "block";
        authContent.style.display = "none";
    }

    function showLogin() {
        appContent.style.display = "none";
        authContent.style.display = "block";
    }



    let recognition;
    let isRecording = false;
    let transcriptionHistory = [];
    let translationHistory = {}; // Stores full translation history per language

    document.getElementById("clearHistory").addEventListener("click", () => {
            transcriptionHistory = [];
            translationHistory = {};
            
            historyOutput.innerHTML = "<h3>History cleared.</h3>";
            
            console.log("History cleared");
        });
    
    startBtn.addEventListener('click', () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            statusElement.textContent = 'Speech recognition is not supported in this browser.';
            return;
        }

        statusElement.textContent = 'Listening... Speak now.';
        startBtn.disabled = true;
        stopBtn.disabled = false;
        transcriptionOutput.value = ''; 
        translationsContainer.innerHTML = '';

        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = true;
        recognition.interimResults = true;
        // recognition.lang = 'en-US';
        recognition.lang = inputLanguageSelect.value; 
        isRecording = true;

        recognition.onresult = async (event) => {
            let lastSentence = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    lastSentence = event.results[i][0].transcript;
                }
            }

            if (lastSentence.trim() !== "") {
                transcriptionOutput.value = lastSentence;  // Show only last sentence in transcription
                transcriptionHistory.push(lastSentence);  // Store full history
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
            const selectedLanguages = Array.from(languageOptions)
                .filter(checkbox => checkbox.checked)
                .map(checkbox => checkbox.value);

            statusElement.textContent = "Translating...";

            translationsContainer.innerHTML = ""; // Clear previous translations (only last sentence shows)

            for (const language of selectedLanguages) {
                // const response = await fetch('/api/translate', {
                const response = await fetch(`${BASE_URL}/api/translate`, { 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text, targetLanguage: language })
                });

                const translationData = await response.json();
                if (translationData.error) throw new Error(translationData.error);

                // Store full translation history
                if (!translationHistory[language]) {
                    translationHistory[language] = [];
                }
                translationHistory[language].push(translationData.translation);

                // Display only the last sentence for each selected language
                const translationDiv = document.createElement("div");
                translationDiv.classList.add("output-box");
                translationDiv.innerHTML = `<b>${language}:</b> ${translationData.translation}`;
                translationsContainer.appendChild(translationDiv);
            }

            statusElement.textContent = "Translation complete.";
            updateHistoryUI();

        } catch (error) {
            console.error('Error translating text:', error);
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



