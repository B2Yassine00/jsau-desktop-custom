const apiUrl = "http://localhost:4000"; // Votre API

// Vérifie si un utilisateur est connecté
document.addEventListener("DOMContentLoaded", () => {
    showMainContent();
});


// Afficher le contenu principal
function showMainContent() {
  document.getElementById("main-content").style.display = "block";
  navigateTo("documents");
}

// Gestion du formulaire de connexion
document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  if (username.trim()) {
    localStorage.setItem("username", username);
    showMainContent();
  }
});

// Déconnexion
function logout() {
  localStorage.removeItem("username");
  showLoginPage();
}

// Navigation entre les pages
function navigateTo(page) {
  if (page === "documents") {
    getDocuments();
  } else if (page === "favorites") {
    getFavorites();
  }
}

// Récupérer les documents
async function getDocuments(query = "") {
  const response = await fetch(`${apiUrl}/search`);
  const documents = await response.json();

  if (documents.error) {
    alert(documents.error);
    return;
  }

  const filteredDocuments = documents.filter((doc) =>
    doc.recette.toLowerCase().includes(query.toLowerCase())
  );
  renderDocuments(filteredDocuments);
}

// Rechercher des documents
function searchDocuments() {
  const query = document.getElementById("search-bar").value;
  getDocuments(query);
}

// Afficher les documents
function renderDocuments(documents) {
  const content = document.getElementById("content");
  content.innerHTML = `
    <h1>Recettes</h1>
    <input style="border: 0px;" id="search-bar" type="text" placeholder="Search recipes..." />
    <button style="background-color: #ffb6c1; color: #fff; border-radius: 8px;" onclick="searchDocuments()">Search</button>
    <div id="document-list"></div>
  `;

  const documentList = document.getElementById("document-list");
  documents.forEach((doc) => {
    documentList.innerHTML += `
      <div class="document-item" style="display: flex; justify-content: center; gap: 0.5rem; padding: 1rem;">
        <span style="min-width: 100px;">${doc.recette}</span>
        <button style="background-color: #ff69b4; color: #fff; border-radius: 8px;" onclick="viewDocument('${doc.recette}')">View</button>
        <button style="background-color: #ff1493; color: #fff; border-radius: 8px;" onclick="downloadDocument(${doc.id})">Download</button>
        <button style="background-color: #ff69b4; color: #fff; border-radius: 8px;" onclick="addFavorite('${doc.recette}')">Add to Favorites</button>
      </div>
    `;
  });
}

// Afficher un document
function viewDocument(filename) {
  const url = `${apiUrl}/search?recette=${filename}`;
  window.open(url, "_blank");
}

// Télécharger un document via l'ID
function downloadDocument(docId) {
  const url = `${apiUrl}/recette/${docId}`;
  const link = document.createElement("a");
  link.href = url;
  link.download = "";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Récupérer les favoris
async function getFavorites() {
  const response = await fetch(`${apiUrl}/favorites`);
  const favorites = await response.json();

  if (favorites.error) {
    alert(favorites.error);
    return;
  }

  renderFavorites(favorites);
}

// Ajouter un favori
async function addFavorite(recette) {
  const recetteFile = recette.replace(/\s+/g, "_").toLowerCase() + ".html";
  const response = await fetch(`${apiUrl}/favorites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recetteFile }),
  });

  const result = await response.json();
  if (result.error) {
    alert(result.error);
  } else {
    alert("Favorite added successfully!");
  }
}

// Supprimer un favori
async function deleteFavorite(filename) {
  const response = await fetch(`${apiUrl}/favorites`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename }),
  });

  const result = await response.json();
  if (result.error) {
    alert(result.error);
  } else {
    alert("Favorite deleted successfully!");
    getFavorites();
  }
}

// Afficher les favoris
function renderFavorites(favorites) {
  const content = document.getElementById("content");
  content.innerHTML = "<h1>Favorites</h1>";
  favorites.forEach((fav) => {
    content.innerHTML += `
      <div class="favorite-item">
        <span>${fav.recetteFile}</span>
        <button style="background-color: #ff69b4; color: #fff; border-radius: 8px;" onclick="deleteFavorite('${fav.recetteFile}')">Remove</button>
      </div>
    `;
  });
}
