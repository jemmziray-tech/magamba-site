const chatbot = document.getElementById("chatbot");
const toggleBtn = document.getElementById("chatbot-toggle");
const messages = document.getElementById("chatbot-messages");
const input = document.getElementById("chatbot-input");
const langToggle = document.getElementById("lang-toggle");
const speakToggle = document.getElementById("speak-toggle");
const settingsToggle = document.getElementById("settings-toggle");
const settingsPanel = document.getElementById("chatbot-settings");
const beepSetting = document.getElementById("beep-setting");
const voiceSetting = document.getElementById("voice-setting");
const autoLangSetting = document.getElementById("auto-lang-setting");
const voiceToggle = document.getElementById("voice-toggle");
const voiceStop = document.getElementById("voice-stop");

let faqData = { faqs: [] };
let currentLanguage = "en";
let lastBotReply = "";
let recognition;
let listenTimeout;

// Load FAQ JSON
fetch("faq.json")
  .then(response => response.json())
  .then(data => faqData = data);

// Toggle chatbot visibility
toggleBtn.addEventListener("click", () => {
  if (chatbot.style.display === "flex") {
    chatbot.style.display = "none";
  } else {
    chatbot.style.display = "flex";
    addMessage("👋 Hello! Karibu Magamba! How can I help you today?", "bot");
    lastBotReply = "Hello! Karibu Magamba! How can I help you today?";
  }
});

// Settings toggle
settingsToggle.addEventListener("click", () => {
  settingsPanel.style.display = settingsPanel.style.display === "none" ? "block" : "none";
});

// Language toggle
langToggle.addEventListener("click", () => {
  currentLanguage = currentLanguage === "en" ? "sw" : "en";
  langToggle.textContent = currentLanguage.toUpperCase();
  const greeting = currentLanguage === "sw"
    ? "👋 Karibu! Unaweza kuniuliza kuhusu Magamba, Lushoto au Tanga."
    : "👋 Welcome! You can ask me about Magamba, Lushoto or Tanga.";
  addMessage(greeting, "bot");
  lastBotReply = greeting;
});

// Speak button
speakToggle.addEventListener("click", () => {
  if (!voiceSetting.checked) return;
  if (lastBotReply) {
    const utterance = new SpeechSynthesisUtterance(lastBotReply);
    utterance.lang = currentLanguage === "sw" ? "sw-TZ" : "en-US";
    speechSynthesis.speak(utterance);
  }
});

// Play beep
function playBeep(frequency=1000, duration=200) {
  if (!beepSetting.checked) return;
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
  oscillator.start();
  oscillator.stop(ctx.currentTime + duration / 1000);
}

// Add message
function addMessage(text, sender="user") {
  const msg = document.createElement("div");
  msg.textContent = text;
  msg.style.margin = "5px 0";
  msg.style.textAlign = sender === "user" ? "right" : "left";
  messages.appendChild(msg);
  messages.scrollTop = messages.scrollHeight;
  if (sender === "bot") lastBotReply = text;
}

// Handle input
input.addEventListener("keypress", function(e) {
  if (e.key === "Enter" && input.value.trim() !== "") {
    const userText = input.value.trim();
    addMessage(userText, "user");
    input.value = "";

    let botReply = currentLanguage === "sw"
      ? "Samahani, bado sijaelewa."
      : "Sorry, I don’t understand yet.";

    if (autoLangSetting.checked) {
      const isSwahili = /hujambo|shule|matokeo|mkoa|wilaya|barua|simu|wanafunzi|karibu/i.test(userText);
      currentLanguage = isSwahili ? "sw" : "en";
    }

    faqData.faqs.forEach(faq => {
      faq.keywords.forEach(keyword => {
        if (userText.toLowerCase().includes(keyword)) {
          botReply = currentLanguage === "sw" ? faq.answer_sw : faq.answer_en;
        }
      });
    });

    addMessage(botReply, "bot");
  }
});

// Voice input
voiceToggle.addEventListener("click", () => {
  if (!('webkitSpeechRecognition' in window)) {
    alert("Sorry, your browser does not support speech recognition.");
    return;
  }

  recognition = new webkitSpeechRecognition();
  recognition.lang = currentLanguage === "sw" ? "sw-TZ" : "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();
  voiceToggle.classList.add("recording");
  playBeep(1200, 200);

  const listeningMsg = document.createElement("div");
  listeningMsg.textContent = currentLanguage === "sw" ? "🎤 Inasikiliza..." : "🎤 Listening...";
  listeningMsg.style.margin = "5px 0";
  listeningMsg.style.textAlign = "left";
  listeningMsg.style.fontStyle = "italic";
  listeningMsg.id = "listening-msg";
  messages.appendChild(listeningMsg);
  messages.scrollTop = messages.scrollHeight;

  listenTimeout = setTimeout(() => {
    recognition.stop();
    voiceToggle.classList.remove("recording");
    playBeep(600, 200);
    const msgEl = document.getElementById("listening-msg");
    if (msgEl) msgEl.textContent = currentLanguage === "sw"
      ? "⏹️ Kusikiliza kumesitishwa (kimya kwa muda mrefu)."
      : "⏹️ Listening stopped (timeout due to silence).";
  }, 10000);

  recognition.onresult = (event) => {
    clearTimeout(listenTimeout);
    const msgEl = document.getElementById("listening-msg");
    if (msgEl) msgEl.remove();

    const spokenText = event.results[0][0].transcript;
    addMessage("🎤 " + spokenText, "user");
    input.value = spokenText;

    const e = new KeyboardEvent("keypress", { key: "Enter" });
    input.dispatchEvent(e);
  };

  recognition.onerror = (event) => {
    clearTimeout(listenTimeout);
    const msgEl = document.getElementById("listening-msg");
    if (msgEl) msgEl.textContent = "⚠️ Voice input error: " + event.error;
    voiceToggle.classList.remove("recording");
    playBeep(400, 200);
  };

  recognition.onend = () => {
    clearTimeout(listenTimeout);
    voiceToggle.classList.remove("recording");
    playBeep(800, 200);
    const msgEl = document.getElementById("listening-msg");
    if (msgEl) msgEl.remove();
  };
});

// Manual stop
voiceStop.addEventListener("click", () => {
  if (recognition) {
    recognition.stop();
    clearTimeout(listenTimeout);
    voiceToggle.classList.remove("recording");
    playBeep(600, 200);
    const msgEl = document.getElementById("listening-msg");
    if (msgEl) msgEl.textContent = currentLanguage === "sw"
      ? "⏹️ Kusikiliza kumesitishwa na mtumiaji."
      : "⏹️ Listening stopped by user.";
  }
});
