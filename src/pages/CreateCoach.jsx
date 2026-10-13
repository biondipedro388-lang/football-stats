import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDoc, collection } from "firebase/firestore";
import { auth, db } from "../services/firebase";

const countries = [
  { name: "Afeganistão", code: "AF" },
  { name: "África do Sul", code: "ZA" },
  { name: "Albânia", code: "AL" },
  { name: "Alemanha", code: "DE" },
  { name: "Andorra", code: "AD" },
  { name: "Angola", code: "AO" },
  { name: "Argentina", code: "AR" },
  { name: "Austrália", code: "AU" },
  { name: "Áustria", code: "AT" },
  { name: "Bélgica", code: "BE" },
  { name: "Brasil", code: "BR" },
  { name: "Canadá", code: "CA" },
  { name: "Chile", code: "CL" },
  { name: "China", code: "CN" },
  { name: "Colômbia", code: "CO" },
  { name: "Coreia do Sul", code: "KR" },
  { name: "Croácia", code: "HR" },
  { name: "Dinamarca", code: "DK" },
  { name: "Egito", code: "EG" },
  { name: "Equador", code: "EC" },
  { name: "Espanha", code: "ES" },
  { name: "Estados Unidos", code: "US" },
  { name: "França", code: "FR" },
  { name: "Gana", code: "GH" },
  { name: "Grécia", code: "GR" },
  { name: "Holanda", code: "NL" },
  { name: "Inglaterra", code: "GB" },
  { name: "Itália", code: "IT" },
  { name: "Japão", code: "JP" },
  { name: "Marrocos", code: "MA" },
  { name: "México", code: "MX" },
  { name: "Nigéria", code: "NG" },
  { name: "Noruega", code: "NO" },
  { name: "Paraguai", code: "PY" },
  { name: "Peru", code: "PE" },
  { name: "Polônia", code: "PL" },
  { name: "Portugal", code: "PT" },
  { name: "Reino Unido", code: "GB" },
  { name: "República Tcheca", code: "CZ" },
  { name: "Romênia", code: "RO" },
  { name: "Rússia", code: "RU" },
  { name: "Senegal", code: "SN" },
  { name: "Sérvia", code: "RS" },
  { name: "Suécia", code: "SE" },
  { name: "Suíça", code: "CH" },
  { name: "Turquia", code: "TR" },
  { name: "Ucrânia", code: "UA" },
  { name: "Uruguai", code: "UY" },
  { name: "Venezuela", code: "VE" },
];

const formations = [
  "4-3-3",
  "4-4-2",
  "4-2-3-1",
  "4-1-4-1",
  "4-3-1-2",
  "4-3-2-1",
  "4-2-2-2",
  "4-5-1",
  "4-1-2-1-2",
  "4-1-3-2",
  "4-2-4",
  "3-5-2",
  "3-4-3",
  "3-4-2-1",
  "3-4-1-2",
  "3-6-1",
  "3-3-3-1",
  "5-3-2",
  "5-4-1",
  "5-2-3",
];

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

    if (!name.trim() || !nationality) {
      setError("Preencha o nome e a nacionalidade do treinador.");
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      setError("Sua sessão expirou. Entre novamente na sua conta.");
      return;
    }

    try {
      setSaving(true);

      await addDoc(collection(db, "coaches"), {
        ownerId: user.uid,
        name: name.trim(),
        nationality,
        birthDate,
        preferredFormation,
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
          Voltar
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
                <label htmlFor="coach-nationality">
                  Nacionalidade *
                </label>
                <select
                  id="coach-nationality"
                  className="select"
                  value={nationality}
                  onChange={(event) => setNationality(event.target.value)}
                  required
                >
                  <option value="">Selecione a nacionalidade</option>

                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="coach-birth-date">
                  Data de nascimento
                </label>
                <input
                  id="coach-birth-date"
                  className="input"
                  type="date"
                  value={birthDate}
                  onChange={(event) => setBirthDate(event.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="coach-formation">
                  Formação preferida
                </label>
                <select
                  id="coach-formation"
                  className="select"
                  value={preferredFormation}
                  onChange={(event) =>
                    setPreferredFormation(event.target.value)
                  }
                >
                  <option value="">Selecione uma formação</option>

                  {formations.map((formation) => (
                    <option key={formation} value={formation}>
                      {formation}
                    </option>
                  ))}
                </select>
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