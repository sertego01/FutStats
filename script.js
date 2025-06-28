// Gestión localStorage

function getPlayers() {
  return JSON.parse(localStorage.getItem("players") || "[]");
}

function savePlayers(players) {
  localStorage.setItem("players", JSON.stringify(players));
}

function getMatches() {
  return JSON.parse(localStorage.getItem("matches") || "[]");
}

function saveMatches(matches) {
  localStorage.setItem("matches", JSON.stringify(matches));
}

function generateId() {
  return "_" + Math.random().toString(36).substr(2, 9);
}

// Alternar tema
const toggleThemeButton = document.getElementById("toggleTheme");

toggleThemeButton.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const isDarkMode = document.body.classList.contains("dark-mode");

  // Cambiar texto e icono
  toggleThemeButton.innerHTML = isDarkMode
    ? "&#128262;" // Icono de bombilla para modo claro
    : "&#127769;"; // Icono de luna para modo oscuro

  // Guardar preferencia en localStorage
  localStorage.setItem("theme", isDarkMode ? "dark" : "light");
});

// Aplicar el tema guardado al cargar la página
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  document.body.classList.add("dark-mode");
  toggleThemeButton.innerHTML = "&#128262;";
} else {
  toggleThemeButton.innerHTML = "&#127769;";
}

// Gestión de navegación

const content = document.getElementById("content");

const navButtons = {
  addPlayer: document.getElementById("btnAddPlayer"),
  playerStats: document.getElementById("btnPlayerStats"),
  addMatch: document.getElementById("btnAddMatch"),
};

navButtons.addPlayer.addEventListener("click", () => {
  renderAddPlayer();
});
navButtons.playerStats.addEventListener("click", () => {
  renderPlayerStats();
});
navButtons.addMatch.addEventListener("click", () => {
  renderAddMatch();
});

// Renderizar Añadir Jugador

function renderAddPlayer() {
  content.innerHTML = `
    <h2>Añadir jugador</h2>
    <form id="formAddPlayer">
      <label for="playerName">Nombre:</label>
      <input type="text" id="playerName" required />

      <label for="playerNumber">Número:</label>
      <input type="number" id="playerNumber" min="0" required />

      <label for="playerPosition">Posición:</label>
      <select id="playerPosition" required>
        <option value="Portero">Portero</option>
        <option value="Defensa">Defensa</option>
        <option value="Medio">Medio</option>
        <option value="Ataque">Ataque</option>
      </select>

      <button type="submit">Añadir jugador</button>
    </form>
    <p id="msgAddPlayer"></p>
  `;

  const form = document.getElementById("formAddPlayer");
  const msg = document.getElementById("msgAddPlayer");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("playerName").value.trim();
    const number = document.getElementById("playerNumber").value.trim();
    const position = document.getElementById("playerPosition").value;

    if (!name || !number) {
      msg.textContent = "Por favor rellena todos los campos.";
      return;
    }

    const players = getPlayers();
    players.push({
      id: generateId(),
      name,
      number: Number(number),
      position,
    });

    savePlayers(players);

    msg.textContent = "Jugador añadido con éxito.";
    form.reset();
  });
}

// Renderizar Estadísticas jugador

function renderPlayerStats() {
  const players = getPlayers();

  if (players.length === 0) {
    content.innerHTML = "<p>No hay jugadores añadidos.</p>";
    return;
  }

  let options = "";
  players.forEach((p) => {
    options += `<option value="${p.id}">${p.name} (${p.position})</option>`;
  });

  content.innerHTML = `
    <h2>Estadísticas jugador</h2>
    <label for="selectPlayerStats">Selecciona jugador:</label>
    <select id="selectPlayerStats">${options}</select>
    <div id="statsResult"></div>
    <div style="text-align:center; margin-top:15px;">
      <button id="btnDeletePlayer" style="background-color:#d9534f; color:white; border:none; padding:10px 20px; border-radius:6px; cursor:pointer;">
        Eliminar jugador
      </button>
    </div>
    <p id="msgDeletePlayer" style="color:red; text-align:center; margin-top:10px;"></p>
  `;

  const selectPlayer = document.getElementById("selectPlayerStats");
  const statsResult = document.getElementById("statsResult");
  const btnDelete = document.getElementById("btnDeletePlayer");
  const msgDelete = document.getElementById("msgDeletePlayer");

  function updateStats() {
    const playerId = selectPlayer.value;
    const matches = getMatches().filter((m) => m.playerId === playerId);

    const matchesPlayed = matches.length;
    const goals = matches.reduce((a, m) => a + m.goals, 0);
    const assists = matches.reduce((a, m) => a + m.assists, 0);
    const minutes = matches.reduce((a, m) => a + m.minutes, 0);
    const yellowCards = matches.reduce((a, m) => a + m.yellowCards, 0);
    const redCards = matches.reduce((a, m) => a + m.redCards, 0);
    const percentageMinutes =
      matchesPlayed > 0
        ? ((minutes / (matchesPlayed * 80)) * 100).toFixed(2)
        : "0.00";

    statsResult.innerHTML = `
      <table>
        <tbody>
          <tr><td>Partidos Jugados</td><td>${matchesPlayed}</td></tr>
          <tr><td>Goles</td><td>${goals}</td></tr>
          <tr><td>Asistencias</td><td>${assists}</td></tr>
          <tr><td>Minutos</td><td>${minutes}</td></tr>
          <tr><td>% Minutos</td><td>${percentageMinutes}%</td></tr>
          <tr><td>Tarjetas amarillas</td><td>${yellowCards}</td></tr>
          <tr><td>Tarjetas rojas</td><td>${redCards}</td></tr>
        </tbody>
      </table>
    `;
    msgDelete.textContent = "";
  }

  btnDelete.addEventListener("click", () => {
    const playerId = selectPlayer.value;
    const playerName =
      players.find((p) => p.id === playerId)?.name || "este jugador";

    if (
      confirm(
        `¿Estás seguro de que quieres eliminar a ${playerName}? Esta acción eliminará también todos sus partidos.`
      )
    ) {
      let updatedPlayers = getPlayers().filter((p) => p.id !== playerId);
      savePlayers(updatedPlayers);

      let updatedMatches = getMatches().filter((m) => m.playerId !== playerId);
      saveMatches(updatedMatches);

      msgDelete.style.color = "green";
      msgDelete.textContent = `Jugador ${playerName} y sus partidos eliminados correctamente.`;

      renderPlayerStats();
    }
  });

  selectPlayer.addEventListener("change", updateStats);
  updateStats();
}

// Renderizar Añadir partido

function renderAddMatch() {
  const players = getPlayers();

  if (players.length === 0) {
    content.innerHTML = "<p>No hay jugadores añadidos.</p>";
    return;
  }

  let options = "";
  players.forEach((p) => {
    options += `<option value="${p.id}">${p.name} (${p.position})</option>`;
  });

  content.innerHTML = `
    <h2>Añadir partido</h2>
    <form id="formAddMatch">
      <label for="matchPlayer">Jugador:</label>
      <select id="matchPlayer" required>${options}</select>

      <label for="matchGoals">Goles:</label>
      <input type="number" id="matchGoals" min="0" value="0" required />

      <label for="matchAssists">Asistencias:</label>
      <input type="number" id="matchAssists" min="0" value="0" required />

      <label for="matchMinutes">Minutos (0-80):</label>
      <input type="number" id="matchMinutes" min="0" max="80" value="0" required />

      <label for="matchYellowCards">Tarjetas amarillas:</label>
      <input type="number" id="matchYellowCards" min="0" value="0" required />

      <label for="matchRedCards">Tarjetas rojas:</label>
      <input type="number" id="matchRedCards" min="0" value="0" required />

      <button type="submit">Añadir partido</button>
    </form>
    <p id="msgAddMatch"></p>
  `;

  const form = document.getElementById("formAddMatch");
  const msg = document.getElementById("msgAddMatch");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const playerId = document.getElementById("matchPlayer").value;
    const goals = Number(document.getElementById("matchGoals").value);
    const assists = Number(document.getElementById("matchAssists").value);
    const minutes = Number(document.getElementById("matchMinutes").value);
    const yellowCards = Number(
      document.getElementById("matchYellowCards").value
    );
    const redCards = Number(document.getElementById("matchRedCards").value);

    if (minutes < 0 || minutes > 80) {
      msg.textContent = "Los minutos deben estar entre 0 y 80.";
      return;
    }

    const matches = getMatches();

    matches.push({
      id: generateId(),
      playerId,
      goals,
      assists,
      minutes,
      yellowCards,
      redCards,
    });

    saveMatches(matches);

    msg.textContent = "Partido añadido con éxito.";
    form.reset();
  });
}

// Inicializa con añadir jugador
renderAddPlayer();
