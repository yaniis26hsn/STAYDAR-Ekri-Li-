const API_BASE = "https://staydar-api.onrender.com/api/v1";
const CLOSE_RADIUS_KM = 15;
const TOKEN_STORAGE_KEY = "staydar_token";
let appartements = [];
let displayedAppartements = [];
let selectedReservation = null;
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
  const modal = document.getElementById("auth-modal");
  const subtitle = document.getElementById("auth-modal-subtitle");

  subtitle.textContent = `Identifie-toi ou cree un compte pour reserver ${title}.`;
  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");
  setAuthMode("login");
  clearAuthFeedback();
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
  const exactRating = document.getElementById("filter-exact-rating").value.trim();
  const minRating = exactRating || document.getElementById("filter-min-rating").value.trim();
  const maxRating = exactRating || document.getElementById("filter-max-rating").value.trim();
  const sort = document.getElementById("filter-sort").value.trim();
  const town = document.getElementById("search").value.trim();

  const filtersUsed = [
    Boolean(town),
    Boolean(type),
    Boolean(minPrice || maxPrice),
    Boolean(minSurface || maxSurface),
    Boolean(minRating || maxRating)
  ].filter(Boolean).length;

  let endpoint = `${API_BASE}/appartements`;

  if (filtersUsed === 0 && sort) {
    endpoint = getSortEndpoint(sort);
  } else {
    const params = new URLSearchParams();
    if (town) params.set("town", town);
    if (type) params.set("type", type);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (minSurface) params.set("minSurface", minSurface);
    if (maxSurface) params.set("maxSurface", maxSurface);
    if (minRating) params.set("minRating", minRating);
    if (maxRating) params.set("maxRating", maxRating);
    endpoint = `${API_BASE}/search?${params.toString()}`;
  }

  await loadListingsFromEndpoint(endpoint, "Filtrage en cours...");

  if (sort && filtersUsed > 0) {
    const sorted = [...displayedAppartements].sort(getSortComparator(sort));
    renderListings(sorted);
  }
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

function getSortEndpoint(sort) {
  const sortRoutes = {
    "price-desc": `${API_BASE}/sortByPrice`,
    "price-asc": `${API_BASE}/sortByPriceAsc`,
    "surface-desc": `${API_BASE}/sortBySurface`,
    "surface-asc": `${API_BASE}/sortBySurfaceAsc`,
    "rating-desc": `${API_BASE}/sortByRating`,
    "rating-asc": `${API_BASE}/sortByRatingAsc`
  };

  return sortRoutes[sort] || `${API_BASE}/appartements`;
}

function getSortComparator(sort) {
  const comparators = {
    "price-desc": (a, b) => (b.price || 0) - (a.price || 0),
    "price-asc": (a, b) => (a.price || 0) - (b.price || 0),
    "surface-desc": (a, b) => (b.surface || 0) - (a.surface || 0),
    "surface-asc": (a, b) => (a.surface || 0) - (b.surface || 0),
    "rating-desc": (a, b) => getAppartementRating(b) - getAppartementRating(a),
    "rating-asc": (a, b) => getAppartementRating(a) - getAppartementRating(b)
  };

  return comparators[sort] || (() => 0);
}

function getAppartementRating(item) {
  const ratersNbr = Number(item?.ratersNbr);
  const rateSum = Number(item?.rateSum);

  if (!ratersNbr || !Number.isFinite(rateSum)) {
    return 0;
  }

  return rateSum / ratersNbr;
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
