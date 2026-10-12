import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../services/firebase";

export default function CreateCoach() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [nationality, setNationality] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [preferredFormation, setPreferredFormation] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!name.trim() || !nationality.trim()) {
      setError("Preencha o nome e a nacionalidade do treinador.");
      return;
    }

    try {
      setSaving(true);

      await addDoc(collection(db, "coaches"), {
        name: name.trim(),
        nationality: nationality.trim(),
        birthDate,
        preferredFormation: preferredFormation.trim(),
        createdAt: new Date().toISOString(),
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Erro ao cadastrar treinador:", error);
      setError("Não foi possível cadastrar o treinador. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page form-page">
      <header className="header form-header">
        <button
          type="button"
          className="secondary-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Voltar
        </button>

        <div className="logo">FootballStats</div>
      </header>

      <main className="form-card">
        <div className="form-section">
          <span className="section-label">NOVA CARREIRA</span>
          <h1>Cadastrar treinador</h1>
          <p>
            Registre um treinador e comece a acompanhar sua trajetória.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <section className="form-section">
            <h2 className="form-section-title">Informações pessoais</h2>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="coach-name">Nome completo *</label>
                <input
                  id="coach-name"
                  className="input"
                  type="text"
                  placeholder="Ex.: Pep Guardiola"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="coach-nationality">Nacionalidade *</label>
                <input
                  id="coach-nationality"
                  className="input"
                  type="text"
                  placeholder="Ex.: Espanha"
                  value={nationality}
                  onChange={(event) => setNationality(event.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="coach-birth-date">Data de nascimento</label>
                <input
                  id="coach-birth-date"
                  className="input"
                  type="date"
                  value={birthDate}
                  onChange={(event) => setBirthDate(event.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="coach-formation">Formação preferida</label>
                <input
                  id="coach-formation"
                  className="input"
                  type="text"
                  placeholder="Ex.: 4-3-3"
                  value={preferredFormation}
                  onChange={(event) =>
                    setPreferredFormation(event.target.value)
                  }
                />
              </div>
            </div>
          </section>

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <div className="form-footer">
            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate("/dashboard")}
              disabled={saving}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="button"
              disabled={saving}
            >
              {saving ? "Salvando..." : "Cadastrar treinador"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}