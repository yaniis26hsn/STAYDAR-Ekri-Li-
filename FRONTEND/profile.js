const PROFILE_TAB_INDEX = 4;
let currentProfileUser = null;
let currentProfileApparts = [];

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getAuthHeaders() {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function isLoggedIn() {
  return Boolean(localStorage.getItem(TOKEN_STORAGE_KEY));
}

function getUserIdFromToken() {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!token) {
    return null;
  }

  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) {
      return null;
    }

    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const decoded = JSON.parse(atob(padded));
    return decoded?.userId || null;
  } catch {
    return null;
  }
}

function hideAllTabs() {
  document.querySelectorAll('.tab-content').forEach((element) => element.classList.add('hidden'));
}

function showOnlyTab(index) {
  hideAllTabs();
  const target = document.getElementById(`tab-${index}`);
  if (target) {
    target.classList.remove('hidden');
  }
}

function updateProfileChip(user = currentProfileUser) {
  const chipLabel = document.querySelector('.profile-chip span');
  if (!chipLabel) {
    return;
  }

  chipLabel.textContent = user ? 'Mon profil' : 'Connexion';
}

function clearProfileFeedback() {
  const feedback = document.getElementById('profile-feedback');
  if (!feedback) {
    return;
  }

  feedback.className = 'profile-feedback hidden';
  feedback.textContent = '';
}

function showProfileFeedback(message, kind = 'info') {
  const feedback = document.getElementById('profile-feedback');
  if (!feedback) {
    return;
  }

  feedback.className = `profile-feedback profile-feedback-${kind}`;
  feedback.textContent = message;
  feedback.classList.remove('hidden');
}

function fillProfileForm(user) {
  const form = document.getElementById('profile-form');
  if (!form || !user) {
    return;
  }

  ['fname', 'lname', 'username', 'email', 'phone', 'town', 'address'].forEach((field) => {
    const input = form.querySelector(`[name="${field}"]`);
    if (input) {
      input.value = user[field] || '';
    }
  });

  // Populate contact inputs (supports multiple links)
  const container = document.getElementById('contact-links-container');
  if (container) {
    container.innerHTML = '';
    const links = Array.isArray(user.contact) ? user.contact : (user.contact ? [user.contact] : []);
    if (links.length === 0) {
      // start with one empty input
      container.appendChild(createContactRow(''));
    } else {
      links.slice(0, 5).forEach((l) => container.appendChild(createContactRow(l)));
    }
  }

  const role = document.getElementById('profile-user-role');
  if (role) {
    role.textContent = user.provider === 'google' ? 'Google' : 'Client';
  }
}

async function loadCurrentUser() {
  if (!isLoggedIn()) {
    currentProfileUser = null;
    updateProfileChip(null);
    return null;
  }

  try {
    const response = await fetch(`${API_BASE}/me`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    currentProfileUser = await response.json();
    updateProfileChip(currentProfileUser);
    fillProfileForm(currentProfileUser);
    return currentProfileUser;
  } catch (error) {
    console.error('Erreur profil:', error);
    currentProfileUser = null;
    updateProfileChip(null);
    return null;
  }
}

async function loadProfileData() {
  clearProfileFeedback();
  const user = currentProfileUser || await loadCurrentUser();

  if (!user) {
    showProfileFeedback('Connecte-toi pour ouvrir ton espace.', 'error');
    openAuthEntry('login');
    return null;
  }

  fillProfileForm(user);
  await loadMyApparts();
  return user;
}

async function loadMyApparts() {
  const container = document.getElementById('my-apparts');
  if (!container) {
    return [];
  }

  if (!isLoggedIn()) {
    currentProfileApparts = [];
    renderMyApparts();
    return [];
  }

  const userId = currentProfileUser?._id || getUserIdFromToken();

  try {
    const response = await fetch(`${API_BASE}/getUserApparts`, {
      headers: getAuthHeaders()
    });

    if (response.ok) {
      currentProfileApparts = await response.json();
      renderMyApparts();
      return currentProfileApparts;
    }

    const fallbackResponse = await fetch(`${API_BASE}/appartements`);
    if (!fallbackResponse.ok) {
      throw new Error(`HTTP ${fallbackResponse.status}`);
    }

    const allApparts = await fallbackResponse.json();
    currentProfileApparts = userId
      ? allApparts.filter((appart) => String(appart.ownerId) === String(userId))
      : [];
    renderMyApparts();
    return currentProfileApparts;
  } catch (error) {
    console.error('Erreur chargement apparts:', error);
    currentProfileApparts = [];
    container.innerHTML = '<p class="profile-empty">Impossible de charger tes appartements.</p>';
    return [];
  }
}

function renderMyApparts() {
  const container = document.getElementById('my-apparts');
  if (!container) {
    return;
  }

  if (!currentProfileApparts.length) {
    container.innerHTML = '<p class="profile-empty">Aucun appartement pour le moment.</p>';
    return;
  }

  container.innerHTML = currentProfileApparts.map((appart) => `
    <article class="profile-appart-card">
      <div class="profile-appart-top">
        <div>
          <h4>${escapeHtml(appart.type || 'Appartement')} - ${escapeHtml(appart.town || 'Ville')}</h4>
          <p>${escapeHtml(appart.address || 'Adresse non renseignee')}</p>
        </div>
        <strong>${Number(appart.price || 0).toLocaleString('fr-DZ')} DA</strong>
      </div>
      <form class="profile-form" onsubmit="saveAppartment(event, '${escapeHtml(appart._id)}')">
        <div class="profile-form-grid profile-form-grid-tight">
          <label>
            <span>Type</span>
            <input type="text" name="type" value="${escapeHtml(appart.type || '')}" required>
          </label>
          <label>
            <span>Town</span>
            <input type="text" name="town" value="${escapeHtml(appart.town || '')}" required>
          </label>
        </div>
        <label>
          <span>Address</span>
          <input type="text" name="address" value="${escapeHtml(appart.address || '')}" required>
        </label>
        <label>
          <span>Description</span>
          <textarea name="description" rows="3" required>${escapeHtml(appart.description || '')}</textarea>
        </label>
        <div class="profile-form-grid profile-form-grid-tight">
          <label>
            <span>Price</span>
            <input type="number" name="price" min="0" value="${Number(appart.price ?? 0)}" required>
          </label>
          <label>
            <span>Surface</span>
            <input type="number" name="surface" min="0" value="${Number(appart.surface ?? 0)}" required>
          </label>
        </div>
        <div class="profile-form-grid profile-form-grid-tight">
          <label>
            <span>Longitude</span>
            <input type="number" name="coordX" step="any" value="${appart.coordX ?? ''}">
          </label>
          <label>
            <span>Latitude</span>
            <input type="number" name="coordY" step="any" value="${appart.coordY ?? ''}">
          </label>
        </div>
        <div class="profile-appart-actions">
          <button type="submit" class="profile-submit profile-submit-small">Enregistrer</button>
          <button type="button" class="profile-delete-button" onclick="deleteAppartment('${escapeHtml(appart._id)}')">Supprimer</button>
        </div>
      </form>
    </article>
  `).join('');
}

function handleProfileClick() {
  if (!isLoggedIn()) {
    openAuthEntry('login');
    return;
  }

  openProfilePage();
}

function openProfilePage() {
  showOnlyTab(PROFILE_TAB_INDEX);
  loadProfileData();
}

function showMainArea() {
  const firstTabLink = document.querySelector('.tab-link');
  if (firstTabLink) {
    switchTab(0, {
      preventDefault() {},
      currentTarget: firstTabLink
    });
    return;
  }

  showOnlyTab(0);
}

async function saveProfile(event) {
  event.preventDefault();
  if (!currentProfileUser) {
    return;
  }

  const form = event.currentTarget;
  const formData = new FormData(form);
  // build payload excluding contact fields
  const payload = Object.fromEntries([...formData.entries()].filter(([k]) => k !== 'contact'));
  // collect all contact inputs
  const contactLinks = formData.getAll('contact').map((s) => String(s || '').trim()).filter(Boolean).slice(0, 5);
  payload.contact = contactLinks;

  try {
    const response = await fetch(`${API_BASE}/user/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    showProfileFeedback('Profil mis a jour avec succes.', 'success');
    await loadCurrentUser();
  } catch (error) {
    console.error('Erreur mise a jour profil:', error);
    showProfileFeedback('Impossible de mettre a jour ton profil.', 'error');
  }
}

// Helpers to manage contact inputs
function createContactRow(value = '') {
  const row = document.createElement('div');
  row.className = 'contact-link-row';

  const input = document.createElement('input');
  input.type = 'text';
  input.name = 'contact';
  input.placeholder = 'https://...';
  input.value = value || '';

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'contact-remove-button';
  removeBtn.textContent = '−';
  removeBtn.onclick = () => removeContactInput(removeBtn);

  row.appendChild(input);
  row.appendChild(removeBtn);
  return row;
}

function addContactInput() {
  const container = document.getElementById('contact-links-container');
  if (!container) return;
  const current = container.querySelectorAll('.contact-link-row').length;
  if (current >= 5) return; // max 5
  container.appendChild(createContactRow(''));
}

function removeContactInput(button) {
  const row = button?.closest('.contact-link-row');
  const container = document.getElementById('contact-links-container');
  if (!row || !container) return;
  // keep at least one input
  if (container.querySelectorAll('.contact-link-row').length <= 1) {
    row.querySelector('input')?.focus();
    row.querySelector('input').value = '';
    return;
  }
  row.remove();
}

async function createAppartment(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const payload = Object.fromEntries(new FormData(form).entries());
  ['price', 'surface', 'coordX', 'coordY'].forEach((field) => {
    if (payload[field] === '') {
      delete payload[field];
      return;
    }

    payload[field] = Number(payload[field]);
  });

  try {
    const response = await fetch(`${API_BASE}/appartement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    form.reset();
    showProfileFeedback('Appartement ajoute avec succes.', 'success');

    loadMyApparts().catch((error) => {
      console.error('Erreur chargement apparts apres ajout:', error);
    });
    fetchListings().catch((error) => {
      console.error('Erreur rechargement logements apres ajout:', error);
    });
  } catch (error) {
    console.error('Erreur ajout appartement:', error);
    showProfileFeedback('Impossible d ajouter l appartement.', 'error');
  }
}

async function saveAppartment(event, appartmentId) {
  event.preventDefault();

  const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
  ['price', 'surface', 'coordX', 'coordY'].forEach((field) => {
    if (payload[field] === '') {
      delete payload[field];
      return;
    }

    payload[field] = Number(payload[field]);
  });

  try {
    const response = await fetch(`${API_BASE}/appartement/${appartmentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    showProfileFeedback('Appartement mis a jour avec succes.', 'success');
    await loadMyApparts();
    await fetchListings();
  } catch (error) {
    console.error('Erreur update appartement:', error);
    showProfileFeedback('Impossible de mettre a jour l appartement.', 'error');
  }
}

async function deleteAppartment(appartmentId) {
  if (!window.confirm('Supprimer cet appartement ?')) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/appartement/${appartmentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    showProfileFeedback('Appartement supprime.', 'success');
    await loadMyApparts();
    await fetchListings();
  } catch (error) {
    console.error('Erreur suppression appartement:', error);
    showProfileFeedback('Impossible de supprimer l appartement.', 'error');
  }
}

async function submitRating(id, title, value) {
  try {
    const response = await fetch(`${API_BASE}/rateAppartement/${value}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ Aid: id })
    });

    const responseBody = response.headers.get('content-type')?.includes('application/json')
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      throw new Error(typeof responseBody === 'string' ? responseBody : 'Erreur de notation.');
    }

    window.alert(`Merci, ta note de ${value}/5 pour ${title} a ete enregistree.`);
    await fetchListings();
  } catch (error) {
    console.error('Erreur rating:', error);
    window.alert('Impossible d envoyer la note pour le moment.');
  }
}

function handleRateClick(id, title, selectId) {
  const picker = document.getElementById(selectId);
  const value = Number(picker?.dataset.selectedRating || 0);

  if (!Number.isInteger(value) || value < 1 || value > 5) {
    window.alert('Choisis une note en passant le curseur sur les etoiles puis clique sur Noter.');
    return;
  }

  if (!isLoggedIn()) {
    selectedReservation = { id, title, action: 'rating', value };
    openAuthEntry('login');
    return;
  }

  submitRating(id, title, value);
}

async function submitAuth(event, mode) {
  event.preventDefault();
  const form = event.currentTarget;
  const feedback = document.getElementById('auth-feedback');
  const payload = Object.fromEntries(new FormData(form).entries());

  feedback.className = 'auth-feedback';
  feedback.textContent = mode === 'login' ? 'Connexion...' : 'Creation du compte...';

  try {
    const response = await fetch(`${API_BASE}/${mode}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const responseBody = response.headers.get('content-type')?.includes('application/json')
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      feedback.className = 'auth-feedback auth-feedback-error';
      feedback.textContent = typeof responseBody === 'string'
        ? responseBody
        : responseBody?.error || 'Une erreur est survenue.';
      return;
    }

    if (mode === 'login' && responseBody?.token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, responseBody.token);
      await loadCurrentUser();
      closeAuthModal();
      if (selectedReservation?.id && selectedReservation?.action !== 'rating') {
        fetchAndShowOwnerDetails(selectedReservation.id, selectedReservation.title);
      } else if (selectedReservation?.action === 'rating') {
        const pendingRating = Number(selectedReservation?.value);
        if (pendingRating) {
          await submitRating(selectedReservation.id, selectedReservation.title, pendingRating);
        }
      }
      selectedReservation = null;
      return;
    }

    if (mode === 'register') {
      feedback.className = 'auth-feedback auth-feedback-success';
      feedback.textContent = 'Compte cree avec succes. Connectez-vous pour finaliser votre reservation.';
      setAuthMode('login');
      document.querySelector('#login-form input[name="email"]').value = payload.email || '';
      return;
    }
  } catch (error) {
    console.error(`Erreur ${mode}:`, error);
    feedback.className = 'auth-feedback auth-feedback-error';
    feedback.textContent = 'Impossible de contacter le serveur.';
  }
}

function handleOAuthRedirect() {
  const hash = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash;
  const params = new URLSearchParams(hash);
  const token = params.get('token');

  if (!token) {
    return;
  }

  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  window.history.replaceState(null, '', window.location.pathname + window.location.search);

  const feedback = document.getElementById('auth-feedback');
  if (feedback) {
    feedback.className = 'auth-feedback auth-feedback-success';
    feedback.textContent = 'Connexion Google reussie.';
  }

  const modal = document.getElementById('auth-modal');
  if (modal && !modal.classList.contains('hidden')) {
    closeAuthModal();
  }

  loadCurrentUser();
}

document.addEventListener('DOMContentLoaded', () => {
  updateProfileChip(null);
  loadCurrentUser();
});







