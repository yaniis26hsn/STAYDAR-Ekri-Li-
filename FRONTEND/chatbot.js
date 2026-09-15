(function () {
  const fab = document.getElementById("chatbot-fab");
  const panel = document.getElementById("chatbot-panel");
  const messagesEl = document.getElementById("chatbot-messages");
  const form = document.getElementById("chatbot-form");
  const input = document.getElementById("chatbot-input");
  const sendBtn = document.getElementById("chatbot-send");
  const closeBtn = document.getElementById("chatbot-close");

  const API_URL = "https://staydar-api.onrender.com/api/v1/chatbot";
  const MAX_HISTORY = 20;

  let chatHistory = [];

  if (!fab || !panel || !messagesEl || !form || !input || !sendBtn || !closeBtn) {
    return;
  }

  function openChat() {
    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    fab.classList.add("is-open");
    setTimeout(function () {
      input.focus();
    }, 220);
  }

  function closeChat() {
    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
    fab.classList.remove("is-open");
  }

  function toggleChat() {
    if (panel.classList.contains("is-open")) {
      closeChat();
    } else {
      openChat();
    }
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function addMessage(text, role) {
    const div = document.createElement("div");
    div.className = role === "user" ? "chatbot-msg chatbot-msg-user" : "chatbot-msg chatbot-msg-bot";
    const p = document.createElement("p");
    p.textContent = text;
    div.appendChild(p);
    messagesEl.appendChild(div);
    scrollToBottom();
  }

  function addTypingIndicator() {
    const div = document.createElement("div");
    div.className = "chatbot-typing";
    div.setAttribute("aria-label", "L'assistant est en train d'ecrire...");
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement("span");
      div.appendChild(dot);
    }
    messagesEl.appendChild(div);
    scrollToBottom();
    return div;
  }

  function setBusy(busy) {
    input.disabled = busy;
    sendBtn.disabled = busy;
  }

  async function sendMessage(rawText) {
    const text = rawText.trim();
    if (!text || sendBtn.disabled) return;

    addMessage(text, "user");
    input.value = "";
    setBusy(true);

    const typing = addTypingIndicator();

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: chatHistory }),
      });

      if (!res.ok) {
        let detail = "";
        try {
          const errBody = await res.json();
          detail = (errBody && errBody.error) || "";
        } catch (_) { /* not json */ }
        const label = "Erreur serveur (" + res.status + ")" + (detail ? " : " + detail : "");
        console.error("Chatbot:", label);
        throw new Error(label);
      }

      const data = await res.json();
      typing.remove();
      const reply =
        (data && data.reply) || "Je n'ai pas de reponse pour le moment. Reformulez votre question.";
      addMessage(reply, "bot");
      chatHistory = chatHistory
        .concat([
          { role: "user", content: text },
          { role: "assistant", content: reply },
        ])
        .slice(-MAX_HISTORY);
    } catch (err) {
      typing.remove();
      const msg = (err && err.message) || "";
      if (msg.indexOf("Erreur serveur") === 0) {
        addMessage(msg, "error");
      } else {
        addMessage(
          "Je suis desole, je n'arrive pas a me connecter au serveur. " +
            "Verifiez que l'IA est bien activee cote serveur, puis reessayez.",
          "error"
        );
      }
    } finally {
      setBusy(false);
      input.focus();
    }
  }

  fab.addEventListener("click", toggleChat);
  closeBtn.addEventListener("click", closeChat);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    sendMessage(input.value);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && panel.classList.contains("is-open")) {
      closeChat();
    }
  });
})();