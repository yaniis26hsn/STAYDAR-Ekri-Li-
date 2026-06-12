const API_BASE = 'https://staydar-api.onrender.com/api/v1';
const CLOSE_RADIUS_KM = 15;
const TOKEN_STORAGE_KEY = "staydar_token";
let appartements = [];
let displayedAppartements = [];
let selectedReservation = null;
let adminUsers = [];
let selectedAdminUser = null;
let cursorGlow = null;

function startGoogleAuth() {
  window.location.href = `${API_BASE}/google`;
}

function handleOAuthRedirect() {
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  const params = new URLSearchParams(hash);
  const token = params.get("token");

  if (!token) {
    return;
  }

  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  window.history.replaceState(null, "", window.location.pathname + window.location.search);

  const feedback = document.getElementById("auth-feedback");
  if (feedback) {
    feedback.className = "auth-feedback auth-feedback-success";
    feedback.textContent = "Connexion Google reussie.";
  }

  const modal = document.getElementById("auth-modal");
  if (modal && !modal.classList.contains("hidden")) {
    closeAuthModal();
  }
}

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
  displayedAppartements = Array.isArray(data) ? [...data] : [];

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
    const ratingValue = getAppartementRating(item);
    const ratingText = ratingValue ? `${ratingValue.toFixed(1)} / 5` : "Pas encore note";
    const ratingStars = getRatingStars(ratingValue);
    const ratingCount = item.ratersNbr ? `${item.ratersNbr} avis` : "Aucun avis";
    const ratingPickerId = `rating-picker-${item._id || ""}`;

    return `
      <article class="card-hover listing-card">
        <div class="listing-visual">
          <div class="listing-badge">${badge}</div>
          <div class="listing-visual-copy">
            <span class="listing-visual-kicker">${town}</span>
            <span class="listing-visual-title">${surface}</span>
          </div>
        </div>
        <div class="listing-body">
          <div class="listing-topline">
            <div>
              <h3 class="listing-title">${title}</h3>
              <p class="listing-address">${address}</p>
            </div>
            <span class="listing-surface">${surface}</span>
          </div>
          <div class="listing-meta">
            <span><i class="fas fa-location-dot"></i> ${town}</span>
            <span><i class="fas fa-bolt"></i> Disponible</span>
          </div>
          <div class="listing-rating">
            <div>
              <div class="listing-rating-stars">${ratingStars}</div>
              <div class="listing-rating-copy">
                <strong>${ratingText}</strong>
                <span>${ratingCount}</span>
              </div>
            </div>
            <div class="listing-rating-action">
              <div id="${ratingPickerId}" class="listing-rating-picker" data-selected-rating="0" aria-label="Choisir une note pour ${escapeForAttribute(title)}">
                <button type="button" class="listing-picker-star" data-value="1" aria-label="1 etoile" onmouseenter="previewRating('${ratingPickerId}', 1)" onmouseleave="resetRatingPreview('${ratingPickerId}')" onclick="selectRating('${ratingPickerId}', 1)">☆</button>
                <button type="button" class="listing-picker-star" data-value="2" aria-label="2 etoiles" onmouseenter="previewRating('${ratingPickerId}', 2)" onmouseleave="resetRatingPreview('${ratingPickerId}')" onclick="selectRating('${ratingPickerId}', 2)">☆</button>
                <button type="button" class="listing-picker-star" data-value="3" aria-label="3 etoiles" onmouseenter="previewRating('${ratingPickerId}', 3)" onmouseleave="resetRatingPreview('${ratingPickerId}')" onclick="selectRating('${ratingPickerId}', 3)">☆</button>
                <button type="button" class="listing-picker-star" data-value="4" aria-label="4 etoiles" onmouseenter="previewRating('${ratingPickerId}', 4)" onmouseleave="resetRatingPreview('${ratingPickerId}')" onclick="selectRating('${ratingPickerId}', 4)">☆</button>
                <button type="button" class="listing-picker-star" data-value="5" aria-label="5 etoiles" onmouseenter="previewRating('${ratingPickerId}', 5)" onmouseleave="resetRatingPreview('${ratingPickerId}')" onclick="selectRating('${ratingPickerId}', 5)">☆</button>
              </div>
              <button onclick="handleRateClick('${item._id || ""}', '${escapeForAttribute(title)}', '${ratingPickerId}')" class="listing-rate-button">
                Noter
              </button>
            </div>
          </div>
          <p class="listing-description">${teaser}</p>
          <div class="listing-footer">
            <div>
              <span class="listing-price-label">A partir de</span>
              <p class="listing-price">${price}</p>
            </div>
            <button onclick="openAuthModal('${item._id || ""}', '${escapeForAttribute(title)}')"
                    class="listing-cta">
              Reserver
            </button>
          </div>
        </div>
      </article>
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
  
  // Check if user is logged in
  const token = getStoredToken();
  if (token) {
    // User is logged in, show owner contact details
    fetchAndShowOwnerDetails(id, title);
  } else {
    // User is not logged in, show auth modal
    const modal = document.getElementById("auth-modal");
    const subtitle = document.getElementById("auth-modal-subtitle");

    subtitle.textContent = `Identifie-toi ou cree un compte pour reserver ${title}.`;
    modal.classList.remove("hidden");
    document.body.classList.add("modal-open");
    setAuthMode("login");
    clearAuthFeedback();
  }
}

async function fetchAndShowOwnerDetails(apartmentId, title) {
  const token = getStoredToken();
  
  try {
    const res = await fetch(`${API_BASE}/ContactAppartOwner/${apartmentId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const ownerData = await res.json();
    showOwnerContactModal(ownerData, title, apartmentId);
  } catch (err) {
    console.error("Erreur chargement contact proprietaire:", err);
    const feedback = document.getElementById("owner-contact-feedback");
    if (feedback) {
      feedback.className = "auth-feedback auth-feedback-error";
      feedback.textContent = "Impossible de charger les informations du proprietaire.";
    }
  }
}

function showOwnerContactModal(ownerData, title, apartmentId) {
  const modal = document.getElementById("owner-contact-modal");
  if (!modal) {
    console.error("Owner contact modal not found");
    return;
  }

  // Populate owner details
  document.getElementById("owner-name").textContent = `${ownerData.fname || ""} ${ownerData.lname || ""}`.trim() || "Proprietaire";
  document.getElementById("owner-email").textContent = ownerData.email || "Email non disponible";
  document.getElementById("owner-phone").textContent = ownerData.phone || "Telephone non disponible";
  document.getElementById("owner-town").textContent = ownerData.town || "Ville non renseignee";
  
  // Create contact link(s) — `ownerData.contact` expected to be an array of links
  const contactLinkContainer = document.getElementById("owner-contact-link");
  contactLinkContainer.innerHTML = "";

  const links = Array.isArray(ownerData.contact) ? ownerData.contact : (ownerData.contact ? [ownerData.contact] : []);

  if (links.length === 0) {
    contactLinkContainer.innerHTML = '<span class="owner-contact-unavailable">Lien de contact non disponible</span>';
  } else {
    const list = document.createElement("div");
    list.className = "owner-contact-link-list";

    links.forEach((lnk) => {
      if (!lnk || typeof lnk !== "string") return;
      let href = lnk;
      // ensure scheme exists for URL parsing
      if (!/^\w+:\/\//.test(href) && !href.startsWith("mailto:") && !href.startsWith("tel:")) {
        href = href.startsWith("//") ? window.location.protocol + href : ("https://" + href);
      }

      const { iconClass, label } = getIconAndLabelForLink(href);

      const a = document.createElement("a");
      a.className = "owner-contact-link-item";
      a.href = href;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.innerHTML = `<i class="${iconClass}"></i> <span class="owner-contact-link-label">${escapeHtml(label)}</span>`;

      list.appendChild(a);
    });

    contactLinkContainer.appendChild(list);
  }

  // Helpers
  function getIconAndLabelForLink(href) {
    try {
      const lowered = href.toLowerCase();
      if (lowered.startsWith("mailto:")) return { iconClass: "fas fa-envelope", label: href.replace(/mailto:/i, "") };
      if (lowered.startsWith("tel:")) return { iconClass: "fas fa-phone", label: href.replace(/tel:/i, "") };
      const url = new URL(href);
      const host = url.hostname;

      if (host.includes("wa.me") || host.includes("whatsapp")) return { iconClass: "fab fa-whatsapp", label: "WhatsApp" };
      if (host.includes("facebook.com")) return { iconClass: "fab fa-facebook", label: "Facebook" };
      if (host.includes("instagram.com")) return { iconClass: "fab fa-instagram", label: "Instagram" };
      if (host.includes("t.me") || host.includes("telegram")) return { iconClass: "fab fa-telegram", label: "Telegram" };
      if (host.includes("linkedin.com")) return { iconClass: "fab fa-linkedin", label: "LinkedIn" };
      if (host.includes("twitter.com") || host.includes("x.com")) return { iconClass: "fab fa-x-twitter", label: "Twitter" };
      if (host.includes("tiktok.com")) return { iconClass: "fab fa-tiktok", label: "TikTok" };

      // fallback: show hostname
      return { iconClass: "fas fa-link", label: host.replace(/^www\./, "") };
    } catch (err) {
      return { iconClass: "fas fa-link", label: href };
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
  }

  // Show modal
  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");
  clearAuthFeedback();
}

function closeOwnerContactModal() {
  const modal = document.getElementById("owner-contact-modal");
  if (modal) {
    modal.classList.add("hidden");
  }
  document.body.classList.remove("modal-open");
}

function openRatingAuth(id, title) {
  selectedReservation = { id, title, action: "rating", value: selectedReservation?.value || null };
  const modal = document.getElementById("auth-modal");
  const subtitle = document.getElementById("auth-modal-subtitle");

  subtitle.textContent = `Connecte-toi ou cree un compte pour noter ${title}.`;
  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");
  setAuthMode("login");
  clearAuthFeedback();
}

function handleRateClick(id, title, selectId) {
  const picker = document.getElementById(selectId);
  const value = Number(picker?.dataset.selectedRating || 0);

  if (!Number.isInteger(value) || value < 1 || value > 5) {
    window.alert("Choisis une note en passant le curseur sur les etoiles puis clique sur Noter.");
    return;
  }

  const userId = getUserIdFromStoredToken();

  if (!userId) {
    selectedReservation = { id, title, action: "rating", value };
    openRatingAuth(id, title);
    return;
  }

  submitRating(id, title, value, userId);
}

function openAuthEntry(mode = "login") {
  selectedReservation = null;
  const modal = document.getElementById("auth-modal");
  const subtitle = document.getElementById("auth-modal-subtitle");

  subtitle.textContent = mode === "register"
    ? "Cree ton compte Staydar pour retrouver tes logements, ton token et tes prochaines reservations."
    : "Connecte-toi a ton espace Staydar pour reprendre ton parcours, meme sans lancer une reservation.";

  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");
  setAuthMode(mode);
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

function getStoredToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

function getUserIdFromStoredToken() {
  const token = getStoredToken();
  if (!token) {
    return null;
  }

  try {
    const [, payload] = token.split(".");
    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const decoded = JSON.parse(atob(padded));
    return decoded?.userId || null;
  } catch (err) {
    console.error("Token invalide:", err);
    return null;
  }
}

function getUserRoleFromStoredToken() {
  const token = getStoredToken();
  if (!token) {
    return null;
  }

  try {
    const [, payload] = token.split(".");
    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const decoded = JSON.parse(atob(padded));
    return decoded?.role || null;
  } catch (err) {
    console.error("Token invalide:", err);
    return null;
  }
}

function isAdminUser() {
  return getUserRoleFromStoredToken() === "admin";
}

function setAdminPanelMessage(message) {
  const msg = document.getElementById("admin-panel-message");
  if (msg) {
    msg.textContent = message;
  }
}

function renderAdminUserList(users) {
  const list = document.getElementById("admin-user-list");
  if (!list) return;

  if (!Array.isArray(users) || users.length === 0) {
    list.innerHTML = '<p class="col-span-full text-center text-slate-500 text-lg">Aucun utilisateur trouve.</p>';
    return;
  }

  list.innerHTML = users.map((user) => {
    const name = `${user.fname || ""} ${user.lname || ""}`.trim() || user.username || "Utilisateur";
    return `
      <article class="listing-card admin-user-card">
        <div class="listing-body">
          <div class="listing-topline">
            <div>
              <h3 class="listing-title">${escapeForAttribute(name)}</h3>
              <p class="listing-address">${escapeForAttribute(user.email || "Pas d'email")}</p>
            </div>
            <span class="listing-surface">${escapeForAttribute(user.role || "normal")}</span>
          </div>
          <div class="listing-meta">
            <span><i class="fas fa-phone"></i> ${escapeForAttribute(user.phone || "-")}</span>
            <span><i class="fas fa-map-marker-alt"></i> ${escapeForAttribute(user.town || "-")}</span>
          </div>
          <div class="listing-footer">
            <button class="listing-cta" onclick="selectAdminUser('${user._id}')">Voir</button>
            <button class="listing-cta listing-cta-secondary" onclick="deleteAdminUser('${user._id}', '${escapeForAttribute(name)}')">Supprimer</button>
            <button class="listing-cta listing-cta-tertiary" onclick="showUserRating('${user._id}')">Rating</button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

async function loadAdminUsers() {
  const list = document.getElementById("admin-user-list");
  const detail = document.getElementById("admin-user-detail");
  const myApparts = document.getElementById("admin-my-apparts");

  if (detail) detail.classList.add("hidden");
  if (myApparts) myApparts.innerHTML = "";
  setAdminPanelMessage("Chargement des utilisateurs...");

  if (!getStoredToken()) {
    if (list) list.innerHTML = '<p class="col-span-full text-center text-slate-500 text-lg">Connectez-vous pour utiliser le panneau admin.</p>';
    return;
  }

  if (!isAdminUser()) {
    if (list) list.innerHTML = '<p class="col-span-full text-center text-slate-500 text-lg">Vous n\'êtes pas admin. Les actions restent restreintes.</p>';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/user`, {
      headers: getAuthHeaders()
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    adminUsers = await res.json();
    renderAdminUserList(adminUsers);
    setAdminPanelMessage(`Liste des utilisateurs (${adminUsers.length}). Cliquez sur Voir pour details.`);
  } catch (err) {
    console.error("Erreur chargement admin users:", err);
    if (list) list.innerHTML = '<p class="col-span-full text-center text-rose-400 text-lg">Impossible de charger les utilisateurs.</p>';
    setAdminPanelMessage("Erreur lors du chargement des utilisateurs.");
  }
}

async function searchAdminUsers() {
  const town = document.getElementById("admin-search-town")?.value.trim();
  const endpoint = town ? `${API_BASE}/getUsersOfATown/${encodeURIComponent(town)}` : `${API_BASE}/user`;
  const list = document.getElementById("admin-user-list");

  if (!getStoredToken()) {
    if (list) list.innerHTML = '<p class="col-span-full text-center text-slate-500 text-lg">Connectez-vous pour utiliser le panneau admin.</p>';
    setAdminPanelMessage("Connexion requise.");
    return;
  }

  if (!isAdminUser()) {
    if (list) list.innerHTML = '<p class="col-span-full text-center text-slate-500 text-lg">Vous n\'êtes pas admin.</p>';
    setAdminPanelMessage("Administration non autorisee.");
    return;
  }

  try {
    setAdminPanelMessage(town ? `Recherche des utilisateurs a ${town}...` : "Chargement des utilisateurs...");
    const res = await fetch(endpoint, {
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const users = await res.json();
    renderAdminUserList(users);
    setAdminPanelMessage(users.length ? `Trouvé ${users.length} utilisateur(s).` : "Aucun utilisateur trouve.");
  } catch (err) {
    console.error("Erreur recherche admin users:", err);
    if (list) list.innerHTML = '<p class="col-span-full text-center text-rose-400 text-lg">Impossible de rechercher les utilisateurs.</p>';
    setAdminPanelMessage("Erreur lors de la recherche.");
  }
}

function resetAdminFilters() {
  const townInput = document.getElementById("admin-search-town");
  if (townInput) townInput.value = "";
  loadAdminUsers();
}

async function selectAdminUser(userId) {
  const detail = document.getElementById("admin-user-detail");
  if (!detail) return;
  detail.classList.add("hidden");
  setAdminPanelMessage("Chargement du detail utilisateur...");

  if (!getStoredToken() || !isAdminUser()) {
    setAdminPanelMessage("Connexion admin requise pour voir les details.");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/user/${userId}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const user = await res.json();
    selectedAdminUser = user;
    renderAdminUserDetail(user);
    setAdminPanelMessage(`Details de ${user.fname || user.username || "utilisateur"}.`);
  } catch (err) {
    console.error("Erreur detail utilisateur:", err);
    setAdminPanelMessage("Impossible de charger les details de l'utilisateur.");
  }
}

async function deleteAdminUser(userId, userName) {
  if (!window.confirm(`Supprimer l'utilisateur ${userName} ?`)) {
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/user/${userId}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    setAdminPanelMessage(`Utilisateur ${userName} supprime.`);
    loadAdminUsers();
  } catch (err) {
    console.error("Erreur suppression utilisateur:", err);
    setAdminPanelMessage("Impossible de supprimer l'utilisateur.");
  }
}

async function showUserRating(userId) {
  if (!getStoredToken() || !isAdminUser()) {
    setAdminPanelMessage("Connexion admin requise pour voir la note utilisateur.");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/userRating/${userId}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const rating = await res.json();
    if (selectedAdminUser) {
      renderAdminUserDetail(selectedAdminUser, rating);
    } else {
      setAdminPanelMessage(`Note recuperee : ${rating || "-"}. Cliquez sur Voir pour afficher le detail.`);
    }
  } catch (err) {
    console.error("Erreur recup note utilisateur:", err);
    setAdminPanelMessage("Impossible de recuperer la note utilisateur.");
  }
}

function renderAdminUserDetail(user, rating = null) {
  const detail = document.getElementById("admin-user-detail");
  if (!detail) return;
  detail.classList.remove("hidden");

  const fields = ["fname", "lname", "username", "email", "phone", "town", "address"];
  const formFields = fields.map((f) => `
    <label>
      <span>${f.charAt(0).toUpperCase() + f.slice(1)}</span>
      <input type="text" name="${f}" value="${escapeForAttribute(user[f] || "")}" class="filter-input">
    </label>
  `).join("");

  detail.innerHTML = `
    <div class="profile-card-head">
      <div>
        <p class="profile-card-kicker">Détails utilisateur</p>
        <h3>${escapeForAttribute(`${user.fname || ""} ${user.lname || ""}`.trim() || user.username || "Utilisateur")}</h3>
      </div>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
        <span class="profile-pill">${escapeForAttribute(user.role || "normal")}</span>
        <span class="profile-pill" style="background:rgba(244,124,44,0.12);border-color:rgba(244,124,44,0.24);">Note: ${rating !== null ? escapeForAttribute(String(rating)) : "Cliquez Rating"}</span>
      </div>
    </div>
    <form id="admin-user-edit-form" class="profile-form" onsubmit="updateAdminUser(event)">
      <div class="profile-form-grid">
        ${formFields}
      </div>
      <div style="display:flex;gap:12px;margin-top:8px;">
        <button type="submit" class="filter-button">Enregistrer</button>
        <button type="button" class="filter-button filter-button-secondary" onclick="selectAdminUser('${user._id}')">Annuler</button>
      </div>
    </form>
  `;
}

async function updateAdminUser(event) {
  event.preventDefault();
  if (!selectedAdminUser?._id) return;
  setAdminPanelMessage("Mise a jour en cours...");

  const form = event.currentTarget;
  const payload = Object.fromEntries(new FormData(form).entries());

  try {
    const res = await fetch(`${API_BASE}/user/${selectedAdminUser._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders()
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    setAdminPanelMessage("Utilisateur mis a jour avec succes.");
    selectAdminUser(selectedAdminUser._id);
  } catch (err) {
    console.error("Erreur mise a jour utilisateur:", err);
    setAdminPanelMessage("Impossible de mettre a jour l'utilisateur.");
  }
}

async function loadMyAppartmentsAdmin() {
  const list = document.getElementById("admin-my-apparts");
  if (!list) return;

  if (!getStoredToken()) {
    list.innerHTML = '<p class="col-span-full text-center text-slate-500 text-lg">Connectez-vous pour voir vos appartements.</p>';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/getUserApparts`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const appartments = await res.json();
    if (!Array.isArray(appartments) || appartments.length === 0) {
      list.innerHTML = '<p class="col-span-full text-center text-slate-500 text-lg">Aucun appartement trouve.</p>';
      return;
    }
    list.innerHTML = appartments.map((app) => `
      <article class="listing-card">
        <div class="listing-body">
          <h3 class="listing-title">${escapeForAttribute(app.type || "Appartement")}</h3>
          <p class="listing-address">${escapeForAttribute(app.address || "-")}</p>
          <div class="listing-meta">
            <span>${escapeForAttribute(app.town || "-")}</span>
            <span>${escapeForAttribute(app.surface ? `${app.surface} m2` : "-")}</span>
          </div>
        </div>
      </article>
    `).join("");
  } catch (err) {
    console.error("Erreur chargement mes appartements:", err);
    list.innerHTML = '<p class="col-span-full text-center text-rose-400 text-lg">Impossible de charger vos appartements.</p>';
  }
}

async function submitRating(id, title, value, userId) {
  try {
    const res = await fetch(`${API_BASE}/rateAppartement/${value}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        Uid: userId,
        Aid: id
      })
    });

    const responseBody = res.headers.get("content-type")?.includes("application/json")
      ? await res.json()
      : await res.text();

    if (!res.ok) {
      throw new Error(typeof responseBody === "string" ? responseBody : "Erreur de notation.");
    }

    window.alert(`Merci, ta note de ${value}/5 pour ${title} a ete enregistree.`);
    await fetchListings();
  } catch (err) {
    console.error("Erreur rating:", err);
    window.alert("Impossible d envoyer la note pour le moment.");
  }
}

function previewRating(pickerId, value) {
  paintRatingPicker(pickerId, value);
}

function resetRatingPreview(pickerId) {
  const picker = document.getElementById(pickerId);
  if (!picker) {
    return;
  }

  const selectedValue = Number(picker.dataset.selectedRating || 0);
  paintRatingPicker(pickerId, selectedValue);
}

function selectRating(pickerId, value) {
  const picker = document.getElementById(pickerId);
  if (!picker) {
    return;
  }

  picker.dataset.selectedRating = String(value);
  paintRatingPicker(pickerId, value);
}

function paintRatingPicker(pickerId, value) {
  const picker = document.getElementById(pickerId);
  if (!picker) {
    return;
  }

  picker.querySelectorAll(".listing-picker-star").forEach((star) => {
    const starValue = Number(star.dataset.value || 0);
    const active = starValue <= value;
    star.textContent = active ? "★" : "☆";
    star.classList.toggle("listing-picker-star-active", active);
  });
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
    const responseBody = res.headers.get("content-type")?.includes("application/json")
      ? await res.json()
      : await res.text();

    if (!res.ok) {
      feedback.className = "auth-feedback auth-feedback-error";
      feedback.textContent = typeof responseBody === "string"
        ? responseBody
        : responseBody?.error || "Une erreur est survenue.";
      return;
    }

    if (mode === "login" && responseBody?.token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, responseBody.token);
    }

    feedback.className = "auth-feedback auth-feedback-success";
    feedback.textContent = mode === "login"
      ? `Connexion reussie. Vous pouvez maintenant ${selectedReservation?.action === "rating" ? `noter ${selectedReservation?.title || "ce logement"}` : `reserver ${selectedReservation?.title || "ce logement"}`}.`
      : "Compte cree avec succes. Connectez-vous pour finaliser votre reservation.";

    if (mode === "register") {
      setAuthMode("login");
      document.querySelector("#login-form input[name='email']").value = payload.email || "";
      return;
    }

    if (mode === "login" && selectedReservation?.action === "rating") {
      const userId = getUserIdFromStoredToken();
      const pendingRating = Number(selectedReservation?.value);

      if (!userId || !pendingRating) {
        feedback.className = "auth-feedback auth-feedback-error";
        feedback.textContent = "Connexion reussie, mais la note selectionnee est introuvable.";
        return;
      }

      await submitRating(selectedReservation.id, selectedReservation.title, pendingRating, userId);
      closeAuthModal();
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
  if (n === 5) {
    loadAdminUsers();
  }
}

async function searchAll() {
  const query = document.getElementById("search").value.trim().toLowerCase();

  if (!query) {
    renderListings(appartements);
    return;
  }

  const container = document.getElementById("listings");
  updateListingSummary(`Recherche pour ${query}...`);
  container.innerHTML = '<p class="col-span-full text-center text-slate-500 text-lg">Recherche en cours...</p>';

  try {
    const res = await fetch(`${API_BASE}/getByTown/${encodeURIComponent(query)}`);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const results = await res.json();
    renderListings(results);
  } catch (err) {
    console.error("Erreur recherche par ville:", err);
    updateListingSummary("Recherche indisponible");
    container.innerHTML = '<p class="col-span-full text-center text-rose-400 text-lg">Impossible de rechercher cette ville.</p>';
  }
}

function findClosestAppartements() {
  if (!navigator.geolocation) {
    updateListingSummary("Geolocalisation indisponible");
    document.getElementById("listings").innerHTML = '<p class="col-span-full text-center text-rose-400 text-lg">Votre navigateur ne supporte pas la geolocalisation.</p>';
    return;
  }

  const container = document.getElementById("listings");
  updateListingSummary("Recherche des logements proches...");
  container.innerHTML = '<p class="col-span-full text-center text-slate-500 text-lg">Autorisez la geolocalisation pour afficher les logements proches.</p>';

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      const endpoint = `${API_BASE}/closeAppartements?X=${encodeURIComponent(latitude)}&Y=${encodeURIComponent(longitude)}&radius=${CLOSE_RADIUS_KM}`;
      await loadListingsFromEndpoint(endpoint, `Logements dans un rayon de ${CLOSE_RADIUS_KM} km`);
    },
    (error) => {
      console.error("Erreur geolocalisation:", error);
      updateListingSummary("Geolocalisation refusee");
      container.innerHTML = '<p class="col-span-full text-center text-rose-400 text-lg">Impossible d obtenir votre position.</p>';
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
}

async function applyFilters() {
  const type = document.getElementById("filter-type").value.trim();
  const minPrice = document.getElementById("filter-min-price").value.trim();
  const maxPrice = document.getElementById("filter-max-price").value.trim();
  const minSurface = document.getElementById("filter-min-surface").value.trim();
  const maxSurface = document.getElementById("filter-max-surface").value.trim();
  const ratingFilters = getNormalizedRatingFilters();
  const exactRating = ratingFilters.exactRating;
  const minRating = ratingFilters.minRating;
  const maxRating = ratingFilters.maxRating;
  const sort = document.getElementById("filter-sort").value.trim();
  const town = document.getElementById("search").value.trim();

  const params = new URLSearchParams();
  if (town) params.set("town", town);
  if (type) params.set("type", type);
  if (minPrice) params.set("minPrice", minPrice);
  if (maxPrice) params.set("maxPrice", maxPrice);
  if (minSurface) params.set("minSurface", minSurface);
  if (maxSurface) params.set("maxSurface", maxSurface);
  if (minRating) params.set("minRating", minRating);
  if (maxRating) params.set("maxRating", maxRating);
  if (sort) params.set("sort", sort);

  const endpoint = params.toString()
    ? `${API_BASE}/search?${params.toString()}`
    : `${API_BASE}/appartements`;

  await loadListingsFromEndpoint(endpoint, "Filtrage en cours...");
}

function resetFilters() {
  document.getElementById("filter-type").value = "";
  document.getElementById("filter-min-price").value = "";
  document.getElementById("filter-max-price").value = "";
  document.getElementById("filter-min-surface").value = "";
  document.getElementById("filter-max-surface").value = "";
  document.getElementById("filter-min-rating").value = "";
  document.getElementById("filter-max-rating").value = "";
  document.getElementById("filter-exact-rating").value = "";
  document.getElementById("filter-sort").value = "";
  document.getElementById("search").value = "";
  updateRatingFilterState();
  fetchListings();
}

async function loadListingsFromEndpoint(endpoint, loadingMessage) {
  const container = document.getElementById("listings");
  updateListingSummary(loadingMessage);
  container.innerHTML = '<p class="col-span-full text-center text-slate-500 text-lg">Chargement...</p>';

  try {
    const res = await fetch(endpoint);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const results = await res.json();
    renderListings(results);
  } catch (err) {
    console.error("Erreur filtrage:", err);
    updateListingSummary("Filtrage indisponible");
    container.innerHTML = '<p class="col-span-full text-center text-rose-400 text-lg">Impossible d appliquer les filtres.</p>';
  }
}

function getAppartementRating(item) {
  const ratersNbr = Number(item?.ratersNbr);
  const rateSum = Number(item?.rateSum);

  if (!ratersNbr || !Number.isFinite(rateSum)) {
    return 0;
  }

  return rateSum / ratersNbr;
}

function getNormalizedRatingFilters() {
  const minInput = document.getElementById("filter-min-rating");
  const maxInput = document.getElementById("filter-max-rating");
  const exactInput = document.getElementById("filter-exact-rating");

  const rawMin = minInput.value.trim();
  const rawMax = maxInput.value.trim();
  const rawExact = exactInput.value.trim();

  if (rawExact) {
    minInput.value = "";
    maxInput.value = "";
    updateRatingFilterState();
    return {
      exactRating: rawExact,
      minRating: rawExact,
      maxRating: rawExact
    };
  }

  if (!rawMin && !rawMax) {
    updateRatingFilterState();
    return {
      exactRating: "",
      minRating: "",
      maxRating: ""
    };
  }

  const parsedMin = rawMin ? Number(rawMin) : null;
  const parsedMax = rawMax ? Number(rawMax) : null;

  if (parsedMin !== null && parsedMax !== null && parsedMin > parsedMax) {
    minInput.value = String(parsedMax);
    maxInput.value = String(parsedMin);
  }

  updateRatingFilterState();

  return {
    exactRating: "",
    minRating: minInput.value.trim(),
    maxRating: maxInput.value.trim()
  };
}

function updateRatingFilterState() {
  const minInput = document.getElementById("filter-min-rating");
  const maxInput = document.getElementById("filter-max-rating");
  const exactInput = document.getElementById("filter-exact-rating");
  const hasRange = Boolean(minInput.value.trim() || maxInput.value.trim());
  const hasExact = Boolean(exactInput.value.trim());

  exactInput.disabled = hasRange;
  minInput.disabled = hasExact;
  maxInput.disabled = hasExact;
}

function getRatingStars(value) {
  if (!value) {
    return '<span class="listing-rating-empty">☆☆☆☆☆</span>';
  }

  const rounded = Math.max(0, Math.min(5, Math.round(value)));
  const fullStars = "★".repeat(rounded);
  const emptyStars = "☆".repeat(5 - rounded);
  return `${fullStars}${emptyStars}`;
}

window.onload = () => {
  cursorGlow = document.getElementById("cursor-glow");
  document.addEventListener("pointermove", handlePointerMove);
  document.addEventListener("pointerleave", handlePointerLeave);
  document.getElementById("filter-min-rating").addEventListener("input", updateRatingFilterState);
  document.getElementById("filter-max-rating").addEventListener("input", updateRatingFilterState);
  document.getElementById("filter-exact-rating").addEventListener("input", updateRatingFilterState);
  updateRatingFilterState();
  handleOAuthRedirect();
  fetchListings();
};

function handlePointerMove(event) {
  if (!cursorGlow) {
    return;
  }

  cursorGlow.style.opacity = "1";
  cursorGlow.style.left = `${event.clientX}px`;
  cursorGlow.style.top = `${event.clientY}px`;
}

function handlePointerLeave() {
  if (!cursorGlow) {
    return;
  }

  cursorGlow.style.opacity = "0";
}
