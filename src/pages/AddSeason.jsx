import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../services/firebase";

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
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSeason() {
      if (!seasonId) return;

      try {
        const seasonRef = doc(db, "seasons", seasonId);
        const seasonSnap = await getDoc(seasonRef);

        if (!seasonSnap.exists() || seasonSnap.data().playerId !== id) {
          setError("Temporada não encontrada.");
          return;
        }

        const data = seasonSnap.data();

        setSeason(data.season || "");
        setTeamType(data.teamType || "club");
        setTeamName(data.teamName || "");
        setMatches(String(data.matches ?? ""));
        setGoals(String(data.goals ?? ""));
        setAssists(String(data.assists ?? ""));
      } catch (error) {
        console.error("Erro ao carregar temporada:", error);
        setError("Não foi possível carregar a temporada.");
      } finally {
        setLoading(false);
      }
    }

    loadSeason();
  }, [id, seasonId]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!season.trim() || !teamName.trim()) {
      setError("Preencha a temporada e o nome da equipe.");
      return;
    }

    const numbers = [matches, goals, assists];

    if (
      numbers.some(
        (value) => value !== "" &&
          (!Number.isInteger(Number(value)) || Number(value) < 0)
      )
    ) {
      setError("Use números inteiros iguais ou maiores que zero.");
      return;
    }

    setSaving(true);

    const seasonData = {
      season: season.trim(),
      teamType: teamType,
      teamName: teamName.trim(),
      matches: Number(matches) || 0,
      goals: Number(goals) || 0,
      assists: Number(assists) || 0,
    };

    try {
      if (isEditing) {
        const seasonRef = doc(db, "seasons", seasonId);
        const seasonSnap = await getDoc(seasonRef);

        if (!seasonSnap.exists() || seasonSnap.data().playerId !== id) {
          setError("Temporada não encontrada.");
          setSaving(false);
          return;
        }

        await updateDoc(seasonRef, seasonData);
      } else {
        await addDoc(collection(db, "seasons"), {
          playerId: id,
          ...seasonData,
          createdAt: new Date(),
        });
      }

      navigate("/player/" + id);
    } catch (error) {
      console.error("Erro ao salvar temporada:", error);
      setError("Não foi possível salvar. Tente novamente.");
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

  return (
    <div className="page form-page">
      <header className="header">
        <button
          className="back-button"
          type="button"
          onClick={() => navigate("/player/" + id)}
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
                  />
                </div>

                <div className="form-group">
                  <label>Tipo</label>
                  <select
                    className="select"
                    value={teamType}
                    onChange={(event) => setTeamType(event.target.value)}
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
                  />
                </div>
              </div>
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="form-footer">
              <button
                className="secondary-button"
                type="button"
                onClick={() => navigate("/player/" + id)}
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