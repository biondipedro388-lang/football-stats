import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate, useParams } from "react-router-dom";
import { auth, db } from "../services/firebase";

export function AddSeason() {
  const { id, seasonId } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(seasonId);

  const [season, setSeason] = useState("");
  const [teamType, setTeamType] = useState("club");
  const [teamName, setTeamName] = useState("");
  const [matches, setMatches] = useState("");
  const [goals, setGoals] = useState("");
  const [assists, setAssists] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let active = true;
    let unsubscribeAuth;

    async function loadSeason(user) {
      setLoading(true);
      setError("");
      setAuthorized(false);

      try {
        const playerSnap = await getDoc(doc(db, "players", id));

        if (!active) return;

        if (
          !playerSnap.exists() ||
          playerSnap.data().ownerId !== user.uid
        ) {
          setError("Jogador não encontrado ou sem permissão.");
          return;
        }

        if (isEditing) {
          const seasonRef = doc(db, "seasons", seasonId);
          const seasonSnap = await getDoc(seasonRef);

          if (!active) return;

          if (!seasonSnap.exists()) {
            setError("Temporada não encontrada.");
            return;
          }

          const data = seasonSnap.data();

          if (
            data.playerId !== id ||
            data.ownerId !== user.uid
          ) {
            setError("Temporada não encontrada ou sem permissão.");
            return;
          }

          setSeason(data.season || "");
          setTeamType(data.teamType || "club");
          setTeamName(data.teamName || "");
          setMatches(String(data.matches ?? ""));
          setGoals(String(data.goals ?? ""));
          setAssists(String(data.assists ?? ""));
        }

        setAuthorized(true);
      } catch (err) {
        console.error("Erro ao carregar temporada:", err);

        if (active) {
          setError("Não foi possível carregar os dados da temporada.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!active) return;

      if (!user) {
        navigate("/login", { replace: true });
        return;
      }

      loadSeason(user);
    });

    return () => {
      active = false;
      if (unsubscribeAuth) unsubscribeAuth();
    };
  }, [id, seasonId, isEditing, navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (saving) return;

    const user = auth.currentUser;

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (!season.trim() || !teamName.trim()) {
      setError("Preencha a temporada e o nome da equipe.");
      return;
    }

    if (!["club", "national"].includes(teamType)) {
      setError("Selecione um tipo de equipe válido.");
      return;
    }

    const numbers = [matches, goals, assists];

    if (
      numbers.some(
        (value) =>
          value !== "" &&
          (!Number.isInteger(Number(value)) || Number(value) < 0)
      )
    ) {
      setError("Use números inteiros iguais ou maiores que zero.");
      return;
    }

    setSaving(true);

    const seasonData = {
      season: season.trim(),
      teamType,
      teamName: teamName.trim(),
      matches: Number(matches) || 0,
      goals: Number(goals) || 0,
      assists: Number(assists) || 0,
    };

    try {
      const playerSnap = await getDoc(doc(db, "players", id));

      if (
        !playerSnap.exists() ||
        playerSnap.data().ownerId !== user.uid
      ) {
        setError("Jogador não encontrado ou sem permissão.");
        setAuthorized(false);
        return;
      }

      if (isEditing) {
        const seasonRef = doc(db, "seasons", seasonId);
        const seasonSnap = await getDoc(seasonRef);

        if (!seasonSnap.exists()) {
          setError("Temporada não encontrada.");
          setAuthorized(false);
          return;
        }

        const existingSeason = seasonSnap.data();

        if (
          existingSeason.playerId !== id ||
          existingSeason.ownerId !== user.uid
        ) {
          setError("Temporada não encontrada ou sem permissão.");
          setAuthorized(false);
          return;
        }

        await updateDoc(seasonRef, seasonData);
      } else {
        await addDoc(collection(db, "seasons"), {
          ownerId: user.uid,
          playerId: id,
          ...seasonData,
          createdAt: new Date(),
        });
      }

      navigate(`/player/${id}`);
    } catch (err) {
      console.error("Erro ao salvar temporada:", err);
      setError("Não foi possível salvar. Verifique sua sessão e tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="empty-state">
          <h3>Carregando temporada...</h3>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="page">
        <div className="empty-state">
          <h3>Não foi possível abrir esta temporada</h3>
          <p>{error || "Jogador ou temporada não encontrados."}</p>
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
    <div className="page form-page">
      <header className="header">
        <button
          className="back-button"
          type="button"
          onClick={() => navigate(`/player/${id}`)}
        >
          Voltar
        </button>

        <div className="logo">
          Football<span>Stats</span>
        </div>

        <div className="topbar-spacer"></div>
      </header>

      <main>
        <div className="form-header">
          <span className="section-label">CARREIRA • TEMPORADA</span>

          <h1>{isEditing ? "Editar temporada" : "Adicionar temporada"}</h1>

          <p>
            {isEditing
              ? "Corrija os dados registrados para esta temporada."
              : "Registre os números do jogador nesta temporada."}
          </p>
        </div>

        <div className="form-card">
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <div className="form-section-title">
                <span>Informações da temporada</span>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Temporada</label>
                  <input
                    className="input"
                    type="text"
                    placeholder="Ex: 2026/27"
                    value={season}
                    onChange={(event) => setSeason(event.target.value)}
                    required
                    disabled={saving}
                  />
                </div>

                <div className="form-group">
                  <label>Tipo</label>
                  <select
                    className="select"
                    value={teamType}
                    onChange={(event) => setTeamType(event.target.value)}
                    disabled={saving}
                  >
                    <option value="club">Clube</option>
                    <option value="national">Seleção</option>
                  </select>
                </div>

                <div className="form-group form-full">
                  <label>
                    {teamType === "club" ? "Nome do clube" : "Nome da seleção"}
                  </label>
                  <input
                    className="input"
                    type="text"
                    placeholder={
                      teamType === "club" ? "Ex: São Paulo" : "Ex: Brasil"
                    }
                    value={teamName}
                    onChange={(event) => setTeamName(event.target.value)}
                    required
                    disabled={saving}
                  />
                </div>

                <div className="form-group">
                  <label>Jogos</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={matches}
                    onChange={(event) => setMatches(event.target.value)}
                    disabled={saving}
                  />
                </div>

                <div className="form-group">
                  <label>Gols</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={goals}
                    onChange={(event) => setGoals(event.target.value)}
                    disabled={saving}
                  />
                </div>

                <div className="form-group">
                  <label>Assistências</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={assists}
                    onChange={(event) => setAssists(event.target.value)}
                    disabled={saving}
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}

            <div className="form-footer">
              <button
                className="secondary-button"
                type="button"
                onClick={() => navigate(`/player/${id}`)}
                disabled={saving}
              >
                Cancelar
              </button>

              <button className="button" type="submit" disabled={saving}>
                {saving
                  ? "Salvando..."
                  : isEditing
                    ? "Salvar alterações"
                    : "Salvar temporada"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}