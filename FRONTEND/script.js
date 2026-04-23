const API_BASE = "http://localhost:3000/api"; // Change this to your backend URL

async function fetchListings(query = "") {
  try {
    const res = await fetch(`${API_BASE}/listings?search=${encodeURIComponent(query)}`);
    const data = await res.json();
    renderCards('listings', data, 'apartment');
  } catch (err) {
    console.error("Erreur chargement logements:", err);
  }
}

async function fetchRestaurants() {
  try {
    const res = await fetch(`${API_BASE}/restaurants`);
    const data = await res.json();
    renderCards('restaurants', data, 'restaurant');
  } catch (err) {
    console.error("Erreur chargement restaurants:", err);
  }
}

async function fetchTransports() {
  try {
    const res = await fetch(`${API_BASE}/transports`);
    const data = await res.json();
    renderCards('transport', data, 'transport');
  } catch (err) {
    console.error("Erreur chargement transports:", err);
  }
}

function renderCards(containerId, data, type) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  data.forEach(item => {
    const card = `
      <div class="card-hover bg-white rounded-3xl overflow-hidden shadow">
        ${type === 'apartment' ? `<img src="${item.image}" class="w-full h-60 object-cover">` : ''}
        <div class="p-6">
          <h3 class="font-semibold text-xl">${item.title}</h3>
          <p class="text-gray-500">${item.city}</p>
          <p class="text-2xl font-bold text-[#c2410f] mt-4">${item.price.toLocaleString('fr-DZ')} DA</p>
          <button onclick="alert('Réservation ouverte pour ${item.title}')"
                  class="mt-6 w-full bg-[#c2410f] text-white py-4 rounded-3xl font-medium">
            Réserver
          </button>
        </div>
      </div>
    `;
    container.innerHTML += card;
  });
}

function switchTab(n, event) {
  if (event) event.preventDefault();
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.getElementById('tab-' + n).classList.remove('hidden');
  document.querySelectorAll('.tab-link').forEach(el => el.classList.remove('tab-active'));
  if (event) event.currentTarget.classList.add('tab-active');
}

function searchAll() {
  const query = document.getElementById('search').value;
  fetchListings(query);
}

// Chargement initial
window.onload = () => {
  fetchListings();
  fetchRestaurants();
  fetchTransports();
};
