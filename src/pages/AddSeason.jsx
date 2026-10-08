import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../services/firebase";

export function AddSeason() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [season, setSeason] = useState("");
  const [teamType, setTeamType] = useState("club");
  const [teamName, setTeamName] = useState("");
  const [matches, setMatches] = useState("");
  const [goals, setGoals] = useState("");
  const [assists, setAssists] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!season || !teamName) {
      return;
    }

    setSaving(true);

    try {
      await addDoc(collection(db, "seasons"), {
        playerId: id,
        season: season,
        teamType: teamType,
        teamName: teamName,
        matches: Number(matches) || 0,
        goals: Number(goals) || 0,
        assists: Number(assists) || 0,
        createdAt: new Date(),
      });

      navigate("/player/" + id);
    } catch (error) {
      console.error("Erro ao salvar temporada:", error);
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <header className="header">
        <button
          className="back-button"
          type="button"
          onClick={() => navigate("/player/" + id)}
        >
          ← Voltar
        </button>

        <div className="logo">
          Football<span>Stats</span>
        </div>

        <div></div>
      </header>

      <main>
        <div className="form-header">
          <span className="section-label">CARREIRA • TEMPORADA</span>

          <h1>Adicionar temporada</h1>

          <p>
            Registre os números do jogador nesta temporada.
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
                    {teamType === "club"
                      ? "Nome do clube"
                      : "Nome da seleção"}
                  </label>

                  <input
                    className="input"
                    type="text"
                    placeholder={
                      teamType === "club"
                        ? "Ex: São Paulo"
                        : "Ex: Brasil"
                    }
                    value={teamName}
                    onChange={(event) => setTeamName(event.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Jogos</label>

                  <input
                    className="input"
                    type="number"
                    min="0"
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
                    placeholder="0"
                    value={assists}
                    onChange={(event) => setAssists(event.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="form-footer">
              <button
                className="secondary-button"
                type="button"
                onClick={() => navigate("/player/" + id)}
              >
                Cancelar
              </button>

              <button className="button" type="submit" disabled={saving}>
                {saving ? "Salvando..." : "Salvar temporada"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}