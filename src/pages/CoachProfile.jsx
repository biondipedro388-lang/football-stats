import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { Link, useNavigate, useParams } from "react-router-dom";
import { db } from "../services/firebase";
import CoachAchievements from "../components/CoachAchievements";

export function CoachProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [coach, setCoach] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);
      setError("");

      try {
        const coachDoc = await getDoc(doc(db, "coaches", id));

        if (!active) return;

        if (!coachDoc.exists()) {
          setCoach(null);
          setSeasons([]);
          return;
        }

        setCoach({ id: coachDoc.id, ...coachDoc.data() });

        const seasonsQuery = query(
          collection(db, "coachSeasons"),
          where("coachId", "==", id)
        );

        const seasonsSnapshot = await getDocs(seasonsQuery);

        if (!active) return;

        const seasonsData = seasonsSnapshot.docs.map((seasonDoc) => ({
          id: seasonDoc.id,
          ...seasonDoc.data(),
        }));

        seasonsData.sort((a, b) =>
          String(b.season || "").localeCompare(String(a.season || ""))
        );

        setSeasons(seasonsData);
      } catch (err) {
        console.error("Erro ao carregar perfil do treinador:", err);

        if (active) {
          setError("Não foi possível carregar os dados do treinador.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [id]);

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

    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleDateString("pt-BR");
  }

  const totalMatches = seasons.reduce(
    (total, season) => total + (Number(season.matches) || 0),
    0
  );

  const totalWins = seasons.reduce(
    (total, season) => total + (Number(season.wins) || 0),
    0
  );

  const totalDraws = seasons.reduce(
    (total, season) => total + (Number(season.draws) || 0),
    0
  );

  const totalLosses = seasons.reduce(
    (total, season) => total + (Number(season.losses) || 0),
    0
  );

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
          <p>Aguarde enquanto buscamos os dados do treinador.</p>
        </div>
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="page">
        <header className="header">
          <Link to="/" className="logo">
            Football<span>Stats</span>
          </Link>
        </header>

        <div className="empty-state">
          <h3>Treinador não encontrado</h3>
          <p>Esse treinador não existe ou não está mais cadastrado.</p>

          <button
            className="button"
            type="button"
            onClick={() => navigate("/dashboard")}
          >
            Voltar ao dashboard
          </button>
        </div>
      </div>
    );
  }

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

        <div className="topbar-spacer" />
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
              {getInitials(coach.name)}
            </div>

            <div className="profile-main">
              <span className="profile-label">PERFIL DO TREINADOR</span>

              <h1 className="profile-name">{coach.name}</h1>

              <p className="profile-subtitle">
                {coach.nationality || "Nacionalidade não informada"} · Treinador
              </p>

              <Link
                className="season-action-button"
                to={`/coach/${id}/edit`}
                style={{ marginTop: "14px" }}
              >
                Editar perfil
              </Link>
            </div>
          </div>

          <div className="profile-info-grid">
            <div className="profile-info-box">
              <span>NACIONALIDADE</span>
              <strong>{coach.nationality || "Não informado"}</strong>
            </div>

            <div className="profile-info-box">
              <span>NASCIMENTO</span>
              <strong>{formatDate(coach.birthDate)}</strong>
            </div>

            <div className="profile-info-box">
              <span>FORMAÇÃO PREFERIDA</span>
              <strong>
                {coach.preferredFormation || "Não informada"}
              </strong>
            </div>

            <div className="profile-info-box">
              <span>TEMPORADAS</span>
              <strong>{seasons.length}</strong>
            </div>
          </div>
        </section>

        <section className="career-section">
          <div className="section-header">
            <div>
              <span className="section-label">DESEMPENHO</span>
              <h2>Resumo da carreira</h2>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <span>TEMPORADAS</span>
              <strong>{seasons.length}</strong>
            </div>

            <div className="stat-card">
              <span>JOGOS</span>
              <strong>{totalMatches}</strong>
            </div>

            <div className="stat-card">
              <span>VITÓRIAS</span>
              <strong>{totalWins}</strong>
            </div>

            <div className="stat-card">
              <span>EMPATES</span>
              <strong>{totalDraws}</strong>
            </div>

            <div className="stat-card">
              <span>DERROTAS</span>
              <strong>{totalLosses}</strong>
            </div>
          </div>
        </section>

        <section className="career-section">
          <div className="section-header">
            <div>
              <span className="section-label">HISTÓRICO</span>
              <h2>Temporadas como treinador</h2>
            </div>

            <Link className="button" to={`/coach/${id}/add-season`}>
              + Adicionar temporada
            </Link>
          </div>

          {seasons.length === 0 ? (
            <div className="empty-state">
              <h3>Nenhuma temporada cadastrada</h3>
              <p>
                Adicione a primeira temporada para registrar os clubes,
                seleções e resultados da carreira.
              </p>

              <Link className="button" to={`/coach/${id}/add-season`}>
                Adicionar temporada
              </Link>
            </div>
          ) : (
            <div className="seasons-list">
              {seasons.map((season) => (
                <article className="season-card" key={season.id}>
                  <div className="season-card-header">
                    <div>
                      <span className="season-year">
                        {season.season || "Temporada não informada"}
                      </span>

                      <h3>{season.teamName || "Equipe não informada"}</h3>
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
                      <span>Vitórias</span>
                      <strong>{Number(season.wins) || 0}</strong>
                    </div>

                    <div>
                      <span>Empates</span>
                      <strong>{Number(season.draws) || 0}</strong>
                    </div>

                    <div>
                      <span>Derrotas</span>
                      <strong>{Number(season.losses) || 0}</strong>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <CoachAchievements coachId={id} />
      </main>
    </div>
  );
}
