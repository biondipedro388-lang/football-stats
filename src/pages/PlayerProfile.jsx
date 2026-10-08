import { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { Link, useNavigate, useParams } from "react-router-dom";
import { db } from "../services/firebase";

const positions = {
  GOL: "Goleiro",
  LD: "Lateral Direito",
  LE: "Lateral Esquerdo",
  ZAG: "Zagueiro",
  VOL: "Volante",
  MC: "Meio-Campista",
  MEI: "Meia",
  MD: "Meia Direito",
  ME: "Meia Esquerdo",
  PD: "Ponta Direita",
  PE: "Ponta Esquerda",
  SA: "Segundo Atacante",
  CA: "Centroavante",
  goalkeeper: "Goleiro",
  defender: "Zagueiro",
  leftBack: "Lateral-esquerdo",
  rightBack: "Lateral-direito",
  midfielder: "Volante",
  centralMidfielder: "Meio-campista",
  attackingMidfielder: "Meia-atacante",
  leftWinger: "Ponta-esquerda",
  rightWinger: "Ponta-direita",
  striker: "Atacante",
};

const nationalities = {
  AF: "Afeganistão",
  ZA: "África do Sul",
  AL: "Albânia",
  DE: "Alemanha",
  AD: "Andorra",
  AO: "Angola",
  AR: "Argentina",
  AU: "Austrália",
  AT: "Áustria",
  BE: "Bélgica",
  BR: "Brasil",
  CA: "Canadá",
  CL: "Chile",
  CN: "China",
  CO: "Colômbia",
  KR: "Coreia do Sul",
  HR: "Croácia",
  DK: "Dinamarca",
  EG: "Egito",
  EC: "Equador",
  ES: "Espanha",
  US: "Estados Unidos",
  FR: "França",
  GH: "Gana",
  GR: "Grécia",
  NL: "Holanda",
  GB: "Inglaterra",
  IT: "Itália",
  JP: "Japão",
  MA: "Marrocos",
  MX: "México",
  NG: "Nigéria",
  NO: "Noruega",
  PY: "Paraguai",
  PE: "Peru",
  PL: "Polônia",
  PT: "Portugal",
  CZ: "República Tcheca",
  RO: "Romênia",
  RU: "Rússia",
  SN: "Senegal",
  RS: "Sérvia",
  SE: "Suécia",
  CH: "Suíça",
  TR: "Turquia",
  UA: "Ucrânia",
  UY: "Uruguai",
  VE: "Venezuela",
  Brazil: "Brasil",
  Argentina: "Argentina",
  Portugal: "Portugal",
  Spain: "Espanha",
  France: "França",
  Germany: "Alemanha",
  Italy: "Itália",
  England: "Inglaterra",
  Uruguay: "Uruguai",
};

export function PlayerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [player, setPlayer] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingSeason, setDeletingSeason] = useState(null);

  async function loadPlayer() {
    const playerDoc = await getDoc(doc(db, "players", id));

    if (!playerDoc.exists()) {
      setPlayer(null);
      return;
    }

    setPlayer({
      id: playerDoc.id,
      ...playerDoc.data(),
    });
  }

  async function loadSeasons() {
    const seasonsQuery = query(
      collection(db, "seasons"),
      where("playerId", "==", id)
    );

    const snapshot = await getDocs(seasonsQuery);

    const seasonsData = snapshot.docs.map((seasonDoc) => ({
      id: seasonDoc.id,
      ...seasonDoc.data(),
    }));

    seasonsData.sort((a, b) =>
      String(b.season || "").localeCompare(String(a.season || ""))
    );

    setSeasons(seasonsData);
  }

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setError("");

      try {
        await Promise.all([loadPlayer(), loadSeasons()]);
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
        setError("Não foi possível carregar os dados do jogador.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [id]);

  async function handleDeleteSeason(seasonId) {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir esta temporada? Essa ação não pode ser desfeita."
    );

    if (!confirmed) {
      return;
    }

    setDeletingSeason(seasonId);
    setError("");

    try {
      await deleteDoc(doc(db, "seasons", seasonId));
      await loadSeasons();
    } catch (err) {
      console.error("Erro ao excluir temporada:", err);
      setError("Não foi possível excluir a temporada. Tente novamente.");
    } finally {
      setDeletingSeason(null);
    }
  }

  const totalMatches = seasons.reduce(
    (total, season) => total + (Number(season.matches) || 0),
    0
  );

  const totalGoals = seasons.reduce(
    (total, season) => total + (Number(season.goals) || 0),
    0
  );

  const totalAssists = seasons.reduce(
    (total, season) => total + (Number(season.assists) || 0),
    0
  );

  function getInitials(name) {
    if (!name) return "?";

    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }

  function formatDate(date) {
    if (!date) return "Não informado";

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("pt-BR");
  }

  if (loading) {
    return (
      <div className="page">
        <header className="header">
          <Link to="/" className="logo">
            Football<span>Stats</span>
          </Link>
        </header>

        <div className="empty-state">
          <h3>Carregando perfil...</h3>
          <p>Aguarde enquanto buscamos os dados do jogador.</p>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="page">
        <header className="header">
          <Link to="/" className="logo">
            Football<span>Stats</span>
          </Link>
        </header>

        <div className="empty-state">
          <h3>Jogador não encontrado</h3>
          <p>Esse jogador não existe ou não está mais cadastrado.</p>

          <button
            className="button"
            type="button"
            onClick={() => navigate("/dashboard")}
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const nationality =
    nationalities[player.nationality] ||
    player.nationality ||
    "Não informado";

  const position =
    positions[player.position] ||
    player.position ||
    "Não informado";

  return (
    <div className="page">
      <header className="header">
        <button
          className="back-button"
          type="button"
          onClick={() => navigate("/dashboard")}
        >
          Voltar
        </button>

        <Link to="/" className="logo">
          Football<span>Stats</span>
        </Link>

        <div className="topbar-spacer"></div>
      </header>

      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}

      <main>
        <section className="profile-card">
          <div className="profile-top">
            <div className="profile-avatar">
              {getInitials(player.name)}
            </div>

            <div className="profile-main">
              <span className="profile-label">PERFIL DO JOGADOR</span>

              <h1 className="profile-name">{player.name}</h1>

              <p className="profile-subtitle">
                {nationality} · {position}
              </p>

              <Link
                className="season-action-button"
                to={`/player/${id}/edit`}
                style={{ marginTop: "14px" }}
              >
                Editar perfil
              </Link>
            </div>
          </div>

          <div className="profile-info-grid">
            <div className="profile-info-box">
              <span>NACIONALIDADE</span>
              <strong>{nationality}</strong>
            </div>

            <div className="profile-info-box">
              <span>POSIÇÃO</span>
              <strong>{position}</strong>
            </div>

            <div className="profile-info-box">
              <span>NASCIMENTO</span>
              <strong>{formatDate(player.birthDate)}</strong>
            </div>

            <div className="profile-info-box">
              <span>PÉ PREFERIDO</span>
              <strong>{player.preferredFoot || "Não informado"}</strong>
            </div>
          </div>
        </section>

        <section className="career-section">
          <div className="section-header">
            <div>
              <span className="section-label">DESEMPENHO</span>
              <h2>Estatísticas da carreira</h2>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <span>JOGOS</span>
              <strong>{totalMatches}</strong>
            </div>

            <div className="stat-card">
              <span>GOLS</span>
              <strong>{totalGoals}</strong>
            </div>

            <div className="stat-card">
              <span>ASSISTÊNCIAS</span>
              <strong>{totalAssists}</strong>
            </div>

            <div className="stat-card">
              <span>TEMPORADAS</span>
              <strong>{seasons.length}</strong>
            </div>
          </div>
        </section>

        <section className="career-section">
          <div className="section-header">
            <div>
              <span className="section-label">HISTÓRICO</span>
              <h2>Temporadas</h2>
            </div>

            <Link className="button" to={`/player/${id}/add-season`}>
              + Adicionar temporada
            </Link>
          </div>

          {seasons.length === 0 ? (
            <div className="empty-state">
              <h3>Nenhuma temporada cadastrada</h3>
              <p>
                Adicione a primeira temporada para começar a registrar os
                números da carreira.
              </p>

              <Link className="button" to={`/player/${id}/add-season`}>
                Adicionar temporada
              </Link>
            </div>
          ) : (
            <div className="seasons-list">
              {seasons.map((season) => (
                <article className="season-card" key={season.id}>
                  <div className="season-card-header">
                    <div>
                      <span className="season-year">{season.season}</span>
                      <h3>{season.teamName}</h3>
                    </div>

                    <span className="season-type">
                      {season.teamType === "national" ? "SELEÇÃO" : "CLUBE"}
                    </span>
                  </div>

                  <div className="season-stats">
                    <div>
                      <span>Jogos</span>
                      <strong>{Number(season.matches) || 0}</strong>
                    </div>

                    <div>
                      <span>Gols</span>
                      <strong>{Number(season.goals) || 0}</strong>
                    </div>

                    <div>
                      <span>Assistências</span>
                      <strong>{Number(season.assists) || 0}</strong>
                    </div>
                  </div>

                  <div className="season-actions">
                    <Link
                      className="season-action-button"
                      to={`/player/${id}/edit-season/${season.id}`}
                    >
                      Editar
                    </Link>

                    <button
                      className="season-action-button delete"
                      type="button"
                      disabled={deletingSeason === season.id}
                      onClick={() => handleDeleteSeason(season.id)}
                    >
                      {deletingSeason === season.id
                        ? "Excluindo..."
                        : "Excluir"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}