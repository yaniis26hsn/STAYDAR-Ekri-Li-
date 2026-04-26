const API_BASE = "http://localhost:4000/api/v1";
let appartements = [];
let selectedReservation = null;

async function fetchListings() {
  const container = document.getElementById("listings");
  updateListingSummary("Chargement des logements...");
  container.innerHTML = '<p class="col-span-full text-center text-slate-500 text-lg">Chargement des logements...</p>';

  try {
    const res = await fetch(`${API_BASE}/appartements`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    appartements = await res.json();
    renderListings(appartements);
  } catch (err) {
    console.error("Erreur chargement logements:", err);
    updateListingSummary("Impossible de recuperer les logements");
    container.innerHTML = '<p class="col-span-full text-center text-rose-400 text-lg">Impossible de charger les logements.</p>';
  }
}

function renderListings(data) {
  const container = document.getElementById("listings");

  if (!Array.isArray(data) || data.length === 0) {
    updateListingSummary("0 resultat");
    container.innerHTML = '<p class="col-span-full text-center text-slate-500 text-lg">Aucun logement trouve.</p>';
    return;
  }

  updateListingSummary(`${data.length} logement${data.length > 1 ? "s" : ""} disponible${data.length > 1 ? "s" : ""}`);

  container.innerHTML = data.map((item) => {
    const title = `${item.type || "Logement"} a ${item.town || "Algerie"}`;
    const description = item.description || item.address || "Aucune description disponible.";
    const surface = item.surface ? `${item.surface} m2` : "Surface non renseignee";
    const town = item.town || "Ville non renseignee";
    const address = item.address || "Adresse non renseignee";
    const badge = item.type ? String(item.type).toUpperCase() : "SEJOUR";
    const teaser = description.length > 88 ? `${description.slice(0, 88)}...` : description;
    const price = typeof item.price === "number"
      ? `${item.price.toLocaleString("fr-DZ")} DA`
      : "Prix non renseigne";

    return `
      <div class="card-hover listing-card bg-[#12141a] border border-white/14 rounded-3xl overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
        <div class="listing-visual h-60 bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.34),_rgba(18,20,26,0.98)_58%)]">
          <div class="listing-badge">${badge}</div>
          <div class="listing-visual-copy">
            <span class="listing-visual-kicker">${town}</span>
            <span class="listing-visual-title">${surface}</span>
          </div>
        </div>
        <div class="p-6">
          <div class="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 class="font-semibold text-xl text-white">${title}</h3>
              <p class="text-slate-400 text-sm mt-1">${address}</p>
            </div>
            <span class="bg-orange-500/16 text-orange-100 border border-orange-400/30 px-3 py-1 rounded-full text-sm font-medium">${surface}</span>
          </div>
          <div class="listing-meta">
            <span><i class="fas fa-location-dot"></i> ${town}</span>
            <span><i class="fas fa-bolt"></i> Disponible</span>
          </div>
          <p class="text-slate-200 mt-4">${teaser}</p>
          <div class="listing-footer">
            <div>
              <span class="listing-price-label">A partir de</span>
              <p class="text-2xl font-bold text-orange-300 mt-1">${price}</p>
            </div>
            <button onclick="openAuthModal('${item._id || ""}', '${escapeForAttribute(title)}')"
                    class="listing-cta mt-6 w-full bg-orange-500 text-white py-4 rounded-3xl font-medium shadow-[0_18px_40px_rgba(249,115,22,0.24)]">
              Reserver
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function updateListingSummary(message) {
  const summary = document.getElementById("listing-summary");
  if (summary) {
    summary.textContent = message;
  }
}

function escapeForAttribute(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/'/g, "&#39;")
    .replace(/"/g, "&quot;");
}

function openAuthModal(id, title) {
  selectedReservation = { id, title };
  const modal = document.getElementById("auth-modal");
  const subtitle = document.getElementById("auth-modal-subtitle");

  subtitle.textContent = `Identifie-toi ou cree un compte pour reserver ${title}.`;
  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");
  setAuthMode("login");
  clearAuthFeedback();
}

function closeAuthModal() {
  document.getElementById("auth-modal").classList.add("hidden");
  document.body.classList.remove("modal-open");
  document.getElementById("login-form").reset();
  document.getElementById("register-form").reset();
  clearAuthFeedback();
  selectedReservation = null;
}

function setAuthMode(mode) {
  const isLogin = mode === "login";
  document.getElementById("login-form").classList.toggle("hidden", !isLogin);
  document.getElementById("register-form").classList.toggle("hidden", isLogin);
  document.getElementById("login-tab").classList.toggle("auth-tab-active", isLogin);
  document.getElementById("register-tab").classList.toggle("auth-tab-active", !isLogin);
  clearAuthFeedback();
}

function clearAuthFeedback() {
  const feedback = document.getElementById("auth-feedback");
  feedback.textContent = "";
  feedback.className = "auth-feedback hidden";
}

async function submitAuth(event, mode) {
  event.preventDefault();
  const form = event.currentTarget;
  const feedback = document.getElementById("auth-feedback");
  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  feedback.className = "auth-feedback";
  feedback.textContent = mode === "login" ? "Connexion..." : "Creation du compte...";

  try {
    const res = await fetch(`${API_BASE}/${mode}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const message = await res.text();

    if (!res.ok) {
      feedback.className = "auth-feedback auth-feedback-error";
      feedback.textContent = message || "Une erreur est survenue.";
      return;
    }

    feedback.className = "auth-feedback auth-feedback-success";
    feedback.textContent = mode === "login"
      ? `Connexion reussie. Vous pouvez maintenant reserver ${selectedReservation?.title || "ce logement"}.`
      : "Compte cree avec succes. Connectez-vous pour finaliser votre reservation.";

    if (mode === "register") {
      setAuthMode("login");
      document.querySelector("#login-form input[name='email']").value = payload.email || "";
    }
  } catch (err) {
    console.error(`Erreur ${mode}:`, err);
    feedback.className = "auth-feedback auth-feedback-error";
    feedback.textContent = "Impossible de contacter le serveur.";
  }
}

function switchTab(n, event) {
  if (event) event.preventDefault();
  document.querySelectorAll(".tab-content").forEach((el) => el.classList.add("hidden"));
  document.getElementById("tab-" + n).classList.remove("hidden");
  document.querySelectorAll(".tab-link").forEach((el) => el.classList.remove("tab-active"));
  if (event) event.currentTarget.classList.add("tab-active");
}

function searchAll() {
  const query = document.getElementById("search").value.trim().toLowerCase();

  if (!query) {
    renderListings(appartements);
    return;
  }

  const filteredAppartements = appartements.filter((item) => {
    return [item.town, item.address, item.type, item.description]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query));
  });

  renderListings(filteredAppartements);
}

window.onload = () => {
  fetchListings();
};
