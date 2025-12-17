const userInput = document.getElementById("userInput");
const chatResponse = document.getElementById("chatResponse");

let allVoices = [];

// 🔁 Load voices for speech synthesis
function loadVoices() {
  allVoices = window.speechSynthesis.getVoices();
  if (allVoices.length === 0) {
    setTimeout(loadVoices, 100);
  }
}
loadVoices();
window.speechSynthesis.onvoiceschanged = loadVoices;

// 🚀 Send user message to backend
async function sendMessage() {
  const message = userInput.value;
  if (!message) return;

  chatResponse.innerHTML = "⏳ Thinking...";

  try {
    const response = await fetch("http://localhost:4000/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });

    const data = await response.json();

    if (data.reply) {
      chatResponse.innerText = data.reply;
      speak(data.reply);
    } else {
      chatResponse.innerText = "❌ No reply received.";
    }

  } catch (err) {
    chatResponse.innerText = "❌ Server error: " + err.message;
  }
}

// 🔊 Speak reply
function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = allVoices.find(v => v.lang === "en-IN") || allVoices[0];
  utterance.voice = voice;
  utterance.lang = "en-IN";
  speechSynthesis.speak(utterance);
}

// 🎤 Start voice input
function startVoice() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-IN";
  recognition.interimResults = false;

  recognition.onstart = () => {
    chatResponse.innerText = "🎤 Listening...";
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    userInput.value = transcript;
    sendMessage();
  };

  recognition.onerror = (event) => {
    chatResponse.innerText = "⚠️ Voice error: " + event.error;
  };

  recognition.start();
}

// 🚨 Scam Alert Info
function showScamAlert() {
  chatResponse.innerText = "⚠️ Never share your OTP, UPI PIN, or bank password. Sakhi warns you to always verify payment links.";
}

// 📢 Language Info
function toggleLanguage() {
  chatResponse.innerText = "🌐 Currently available in English. More languages coming soon!";
}
