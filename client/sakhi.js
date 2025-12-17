let synth = window.speechSynthesis;
let currentUtterance = null;
let recognition;

// Language-specific prompts
const systemPrompt = {
  "en-IN": "You are Sakhi, a helpful assistant for women to understand bank accounts, UPI, savings, schemes, and digital safety in simple English.",
  "hi-IN": "आप सखी हैं, एक सहायक जो महिलाओं को बैंक खाता, UPI, बचत, योजनाएं और डिजिटल सुरक्षा हिंदी में समझाने में मदद करती हैं।",
  "te-IN": "మీరు సఖి, మహిళలకు బ్యాంక్ ఖాతాలు, UPI, పొదుపు, పథకాలు మరియు డిజిటల్ భద్రతను తెలుగులో అర్థమయ్యేలా చెప్పే సహాయకురాలు."
};

async function askSakhi() {
  const input = document.getElementById("userInput").value.trim();
  const lang = document.getElementById("lang").value;
  const chatBox = document.getElementById("chat");
  if (!input) return;

  // Show user message
  chatBox.innerHTML += `<div class="text-right mb-2"><strong>You:</strong> ${input}</div>`;
  document.getElementById("userInput").value = "";

  try {
    const response = await fetch("https://sakhipay-backend.onrender.com/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: `${systemPrompt[lang]}\nUser: ${input}`
      })
    });

    const data = await response.json();

    const reply = data.reply || "Sakhi couldn't answer. Try again.";

    // Display Sakhi's reply
    chatBox.innerHTML += `<div class="text-left mb-4 text-purple-700"><strong>Sakhi:</strong> ${reply}</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;

    // Speak the reply
    if (synth.speaking) synth.cancel();
    currentUtterance = new SpeechSynthesisUtterance(reply);
    currentUtterance.lang = lang;
    synth.speak(currentUtterance);

  } catch (err) {
    console.error("Frontend error:", err);
    chatBox.innerHTML += `<div class="text-left text-red-500">Sakhi: Something went wrong. Please try again.</div>`;
  }
}

function stopSpeaking() {
  if (synth.speaking) synth.cancel();
}

function startListening() {
  const lang = document.getElementById("lang").value;
  recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = lang;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    document.getElementById("userInput").value = transcript;
    askSakhi();
  };

  recognition.onerror = (event) => {
    alert("🎤 Voice input error: " + event.error);
  };
}
