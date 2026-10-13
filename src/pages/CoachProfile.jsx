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
import { onAuthStateChanged } from "firebase/auth";
import { Link, useNavigate, useParams } from "react-router-dom";
import { auth, db } from "../services/firebase";
import CoachAchievements from "../components/CoachAchievements";

function CoachSeasonCard({
  season,
  getSeasonStats,
  formatPercentage,
  coachId,
  deletingSeason,
  onDelete,
}) {
  const stats = getSeasonStats(season);

  return (
    <article className="season-card">
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
          <span>Jogos cadastrados</span>
          <strong>{stats.matches}</strong>
        </div>
        <div>
          <span>Jogos com resultado</span>
          <strong>{stats.playedMatches}</strong>
        </div>
        <div>
          <span>Vitórias</span>
          <strong>{stats.wins}</strong>
        </div>
        <div>
          <span>Empates</span>
          <strong>{stats.draws}</strong>
        </div>
        <div>
          <span>Derrotas</span>
          <strong>{stats.losses}</strong>
        </div>
        <div>
          <span>Aproveitamento</span>
          <strong>{formatPercentage(stats.pointsPercentage)}</strong>
        </div>
        <div>
          <span>Taxa de vitórias</span>
          <strong>{formatPercentage(stats.winPercentage)}</strong>
        </div>
      </div>

      <div className="season-actions">
        <Link
          className="season-action-button"
          to={`/coach/${coachId}/edit-season/${season.id}`}
        >
          Editar
        </Link>

        <button
          className="season-action-button delete"
          type="button"
          disabled={deletingSeason === season.id}
          onClick={() => onDelete(season.id)}
        >
          {deletingSeason === season.id ? "Excluindo..." : "Excluir"}
        </button>
      </div>
    </article>
  );
}

export function CoachProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [coach, setCoach] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingSeason, setDeletingSeason] = useState(null);

  async function loadSeasons(userId) {
    const seasonsQuery = query(
      collection(db, "coachSeasons"),
      where("ownerId", "==", userId),
      where("coachId", "==", id)
    );

    const seasonsSnapshot = await getDocs(seasonsQuery);

    const seasonsData = seasonsSnapshot.docs.map((seasonDoc) => ({
      id: seasonDoc.id,
      ...seasonDoc.data(),
    }));

    seasonsData.sort((a, b) =>
      String(b.season || "").localeCompare(
        String(a.season || ""),
        "pt-BR",
        { numeric: true }
      )
    );

    setSeasons(seasonsData);
  }

  useEffect(() => {
    let active = true;

    async function loadProfile(user) {
      setLoading(true);
      setError("");
      setCoach(null);
      setSeasons([]);

      try {
        const coachDoc = await getDoc(doc(db, "coaches", id));

        if (!active) return;

        if (!coachDoc.exists() || coachDoc.data().ownerId !== user.uid) {
          setCoach(null);
          setSeasons([]);
          return;
        }

        const coachData = {
          id: coachDoc.id,
          ...coachDoc.data(),
        };

        const seasonsQuery = query(
          collection(db, "coachSeasons"),
          where("ownerId", "==", user.uid),
          where("coachId", "==", id)
        );

        const seasonsSnapshot = await getDocs(seasonsQuery);

        if (!active) return;

        const seasonsData = seasonsSnapshot.docs.map((seasonDoc) => ({
          id: seasonDoc.id,
          ...seasonDoc.data(),
        }));

        seasonsData.sort((a, b) =>
          String(b.season || "").localeCompare(
            String(a.season || ""),
            "pt-BR",
            { numeric: true }
          )
        );

        setCoach(coachData);
        setSeasons(seasonsData);
      } catch (err) {
        console.error("Erro ao carregar perfil do treinador:", err);

        if (active) {
          setError("Não foi possível carregar os dados do treinador.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!active) return;

      if (!user) {
        setLoading(false);
        navigate("/login", { replace: true });
        return;
      }

      loadProfile(user);
    });

    return () => {
      active = false;
      unsubscribeAuth();
    };
  }, [id, navigate]);

  async function handleDeleteSeason(seasonId) {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir esta temporada? Essa ação não pode ser desfeita."
    );

    if (!confirmed) return;

    const user = auth.currentUser;

    if (!user) {
      setError("Sua sessão expirou. Entre novamente na sua conta.");
      navigate("/login", { replace: true });
      return;
    }

    setDeletingSeason(seasonId);
    setError("");

    try {
      const coachRef = doc(db, "coaches", id);
      const coachDoc = await getDoc(coachRef);

      if (!coachDoc.exists() || coachDoc.data().ownerId !== user.uid) {
        setError("Você não tem permissão para acessar este treinador.");
        return;
      }

      const seasonRef = doc(db, "coachSeasons", seasonId);
      const seasonDoc = await getDoc(seasonRef);

      if (!seasonDoc.exists()) {
        setError("Temporada não encontrada.");
        await loadSeasons(user.uid);
        return;
      }

      const seasonData = seasonDoc.data();

      if (
        seasonData.ownerId !== user.uid ||
        seasonData.coachId !== id
      ) {
        setError("Você não tem permissão para excluir esta temporada.");
        return;
      }

      await deleteDoc(seasonRef);
      await loadSeasons(user.uid);
    } catch (err) {
      console.error("Erro ao excluir temporada:", err);
      setError("Não foi possível excluir a temporada. Tente novamente.");
    } finally {
      setDeletingSeason(null);
    }
  }

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

  function formatPercentage(value) {
    const percentage = Number(value);

    return `${(Number.isFinite(percentage) ? percentage : 0).toLocaleString(
      "pt-BR",
      {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }
    )}%`;
  }

  function getSeasonStats(season) {
    const matches = Math.max(0, Number(season.matches) || 0);
    const wins = Math.max(0, Number(season.wins) || 0);
    const draws = Math.max(0, Number(season.draws) || 0);
    const losses = Math.max(0, Number(season.losses) || 0);

    const playedMatches = wins + draws + losses;
    const points = wins * 3 + draws;

    return {
      matches,
      wins,
      draws,
      losses,
      playedMatches,
      points,
      winPercentage:
        playedMatches > 0 ? (wins / playedMatches) * 100 : 0,
      pointsPercentage:
        playedMatches > 0
          ? (points / (playedMatches * 3)) * 100
          : 0,
    };
  }

  const clubSeasons = seasons.filter(
    (season) => season.teamType !== "national"
  );

  const nationalSeasons = seasons.filter(
    (season) => season.teamType === "national"
  );

  const totalMatches = seasons.reduce(
    (total, season) => total + getSeasonStats(season).matches,
    0
  );

  const totalWins = seasons.reduce(
    (total, season) => total + getSeasonStats(season).wins,
    0
  );

  const totalDraws = seasons.reduce(
    (total, season) => total + getSeasonStats(season).draws,
    0
  );

  const totalLosses = seasons.reduce(
    (total, season) => total + getSeasonStats(season).losses,
    0
  );

  const totalPlayedMatches = totalWins + totalDraws + totalLosses;
  const totalPoints = totalWins * 3 + totalDraws;

  const overallPointsPercentage =
    totalPlayedMatches > 0
      ? (totalPoints / (totalPlayedMatches * 3)) * 100
      : 0;

  const overallWinPercentage =
    totalPlayedMatches > 0
      ? (totalWins / totalPlayedMatches) * 100
      : 0;

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

        {error ? (
          <div className="empty-state">
            <h3>Não foi possível carregar o perfil</h3>
            <p>{error}</p>
          </div>
        ) : (
          <div className="empty-state">
            <h3>Treinador não encontrado</h3>
            <p>Esse treinador não existe ou não está mais cadastrado.</p>
          </div>
        )}

        <button
          className="button"
          type="button"
          onClick={() => navigate("/dashboard")}
        >
          Voltar ao dashboard
        </button>
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
              <strong>{coach.preferredFormation || "Não informada"}</strong>
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
              <span>JOGOS CADASTRADOS</span>
              <strong>{totalMatches}</strong>
            </div>
            <div className="stat-card">
              <span>JOGOS COM RESULTADO</span>
              <strong>{totalPlayedMatches}</strong>
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
            <div className="stat-card">
              <span>APROVEITAMENTO</span>
              <strong>{formatPercentage(overallPointsPercentage)}</strong>
            </div>
            <div className="stat-card">
              <span>TAXA DE VITÓRIAS</span>
              <strong>{formatPercentage(overallWinPercentage)}</strong>
            </div>
          </div>

          <p className="section-label" style={{ marginTop: "12px" }}>
            O aproveitamento considera 3 pontos por vitória, 1 por empate e 0
            por derrota. Os percentuais usam apenas jogos com resultado
            registrado.
          </p>
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
            <>
              <section className="career-section">
                <div className="section-header">
                  <div>
                    <span className="section-label">CARREIRA EM CLUBES</span>
                    <h2>Clubes</h2>
                  </div>
                  <span>{clubSeasons.length} temporadas</span>
                </div>

                {clubSeasons.length === 0 ? (
                  <div className="empty-state">
                    <p>Nenhuma temporada por clube cadastrada.</p>
                  </div>
                ) : (
                  <div className="seasons-list">
                    {clubSeasons.map((season) => (
                      <CoachSeasonCard
                        key={season.id}
                        season={season}
                        getSeasonStats={getSeasonStats}
                        formatPercentage={formatPercentage}
                        coachId={id}
                        deletingSeason={deletingSeason}
                        onDelete={handleDeleteSeason}
                      />
                    ))}
                  </div>
                )}
              </section>

              <section className="career-section">
                <div className="section-header">
                  <div>
                    <span className="section-label">
                      CARREIRA INTERNACIONAL
                    </span>
                    <h2>Seleções</h2>
                  </div>
                  <span>{nationalSeasons.length} temporadas</span>
                </div>

                {nationalSeasons.length === 0 ? (
                  <div className="empty-state">
                    <p>Nenhuma temporada por seleção cadastrada.</p>
                  </div>
                ) : (
                  <div className="seasons-list">
                    {nationalSeasons.map((season) => (
                      <CoachSeasonCard
                        key={season.id}
                        season={season}
                        getSeasonStats={getSeasonStats}
                        formatPercentage={formatPercentage}
                        coachId={id}
                        deletingSeason={deletingSeason}
                        onDelete={handleDeleteSeason}
                      />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </section>

        <CoachAchievements coachId={id} />
      </main>
    </div>
  );
}
