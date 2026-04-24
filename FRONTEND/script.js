const API_BASE = "http://localhost:4000/api/v1";
let appartements = [];

async function fetchListings() {
  const container = document.getElementById("listings");
  container.innerHTML = '<p class="col-span-full text-center text-gray-500 text-lg">Chargement des logements...</p>';

  try {
    const res = await fetch(`${API_BASE}/appartements`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    appartements = await res.json();
    renderListings(appartements);
  } catch (err) {
    console.error("Erreur chargement logements:", err);
    container.innerHTML = '<p class="col-span-full text-center text-red-500 text-lg">Impossible de charger les logements.</p>';
  }
}

function renderListings(data) {
  const container = document.getElementById("listings");

  if (!Array.isArray(data) || data.length === 0) {
    container.innerHTML = '<p class="col-span-full text-center text-gray-500 text-lg">Aucun logement trouve.</p>';
    return;
  }

  container.innerHTML = data.map((item) => {
    const title = `${item.type || "Logement"} a ${item.town || "Algerie"}`;
    const description = item.description || item.address || "Aucune description disponible.";
    const surface = item.surface ? `${item.surface} m2` : "Surface non renseignee";
    const town = item.town || "Ville non renseignee";
    const address = item.address || "Adresse non renseignee";
    const price = typeof item.price === "number"
      ? `${item.price.toLocaleString("fr-DZ")} DA`
      : "Prix non renseigne";

    return `
      <div class="card-hover bg-white rounded-3xl overflow-hidden shadow">
        <div class="h-60 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-6xl">
          <span>Logement</span>
        </div>
        <div class="p-6">
          <div class="flex items-start justify-between gap-4">
            <h3 class="font-semibold text-xl">${title}</h3>
            <span class="bg-orange-50 text-[#c2410f] px-3 py-1 rounded-full text-sm font-medium">${surface}</span>
          </div>
          <p class="text-gray-500 mt-2">${town}</p>
          <p class="text-gray-400 text-sm mt-1">${address}</p>
          <p class="text-gray-600 mt-4">${description}</p>
          <p class="text-2xl font-bold text-[#c2410f] mt-4">${price}</p>
          <button onclick="alert('Reservation ouverte pour ${title}')"
                  class="mt-6 w-full bg-[#c2410f] text-white py-4 rounded-3xl font-medium">
            Reserver
          </button>
        </div>
      </div>
    `;
  }).join("");
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
