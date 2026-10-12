import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { Link, useNavigate, useParams } from "react-router-dom";
import { db } from "../services/firebase";

export default function AddCoachSeason() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [season, setSeason] = useState("");
  const [teamName, setTeamName] = useState("");
  const [teamType, setTeamType] = useState("club");
  const [matches, setMatches] = useState("0");
  const [wins, setWins] = useState("0");
  const [draws, setDraws] = useState("0");
  const [losses, setLosses] = useState("0");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!season.trim() || !teamName.trim()) {
      setError("Preencha a temporada e o nome do clube ou seleção.");
      return;
    }

    const numericFields = {
      matches: Number(matches),
      wins: Number(wins),
      draws: Number(draws),
      losses: Number(losses),
    };

    if (
      Object.values(numericFields).some(
        (value) => !Number.isFinite(value) || value < 0
      )
    ) {
      setError("As estatísticas devem ser iguais ou maiores que zero.");
      return;
    }

    if (
      numericFields.wins + numericFields.draws + numericFields.losses >
      numericFields.matches
    ) {
      setError("Vitórias, empates e derrotas não podem superar o total de jogos.");
      return;
    }

    try {
      setSaving(true);

      await addDoc(collection(db, "coachSeasons"), {
        coachId: id,
        season: season.trim(),
        teamName: teamName.trim(),
        teamType,
        ...numericFields,
        createdAt: new Date().toISOString(),
      });

      navigate(`/coach/${id}`);
    } catch (err) {
      console.error("Erro ao salvar temporada do treinador:", err);
      setError("Não foi possível salvar a temporada. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page form-page">
      <header className="header form-header">
        <Link to={`/coach/${id}`} className="back-button">
          Voltar ao perfil
        </Link>

        <Link to="/" className="logo">
          Football<span>Stats</span>
        </Link>
      </header>

      <main className="form-card">
        <div className="form-section">
          <span className="section-label">HISTÓRICO DA CARREIRA</span>
          <h1>Adicionar temporada</h1>
          <p>
            Registre a passagem do treinador por um clube ou seleção e os
            resultados daquela temporada.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <section className="form-section">
            <h2 className="form-section-title">Dados da temporada</h2>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="season">Temporada ou ano *</label>
                <input
                  id="season"
                  className="input"
                  type="text"
                  placeholder="Ex.: 2025/26"
                  value={season}
                  onChange={(event) => setSeason(event.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="teamName">Clube ou seleção *</label>
                <input
                  id="teamName"
                  className="input"
                  type="text"
                  placeholder="Ex.: Manchester City"
                  value={teamName}
                  onChange={(event) => setTeamName(event.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="teamType">Tipo de equipe</label>
                <select
                  id="teamType"
                  className="input"
                  value={teamType}
                  onChange={(event) => setTeamType(event.target.value)}
                >
                  <option value="club">Clube</option>
                  <option value="national">Seleção</option>
                </select>
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2 className="form-section-title">Resultados</h2>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="matches">Jogos</label>
                <input
                  id="matches"
                  className="input"
                  type="number"
                  min="0"
                  value={matches}
                  onChange={(event) => setMatches(event.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="wins">Vitórias</label>
                <input
                  id="wins"
                  className="input"
                  type="number"
                  min="0"
                  value={wins}
                  onChange={(event) => setWins(event.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="draws">Empates</label>
                <input
                  id="draws"
                  className="input"
                  type="number"
                  min="0"
                  value={draws}
                  onChange={(event) => setDraws(event.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="losses">Derrotas</label>
                <input
                  id="losses"
                  className="input"
                  type="number"
                  min="0"
                  value={losses}
                  onChange={(event) => setLosses(event.target.value)}
                />
              </div>
            </div>
          </section>

          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}

          <div className="form-footer">
            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate(`/coach/${id}`)}
              disabled={saving}
            >
              Cancelar
            </button>

            <button type="submit" className="button" disabled={saving}>
              {saving ? "Salvando..." : "Salvar temporada"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
