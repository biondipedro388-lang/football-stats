import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../services/firebase";

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

export default function EditCoach() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [nationality, setNationality] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [preferredFormation, setPreferredFormation] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCoach() {
      try {
        const coachDoc = await getDoc(doc(db, "coaches", id));

        if (!active) return;

        if (!coachDoc.exists()) {
          setError("Treinador não encontrado.");
          return;
        }

        const coach = coachDoc.data();
        setName(coach.name || "");

        const savedNationality = coach.nationality || "";
        const country = countries.find(
          (item) =>
            item.code.toLowerCase() === savedNationality.toLowerCase() ||
            item.name.toLowerCase() === savedNationality.toLowerCase()
        );

        setNationality(country ? country.code : savedNationality);
        setBirthDate(coach.birthDate || "");
        setPreferredFormation(coach.preferredFormation || "");
      } catch (err) {
        console.error("Erro ao carregar treinador:", err);

        if (active) {
          setError("Não foi possível carregar os dados do treinador.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCoach();

    return () => {
      active = false;
    };
  }, [id]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (
      !name.trim() ||
      !nationality ||
      !birthDate ||
      !preferredFormation.trim()
    ) {
      setError("Preencha todos os campos antes de salvar.");
      return;
    }

    setSaving(true);

    try {
      const coachRef = doc(db, "coaches", id);
      const coachDoc = await getDoc(coachRef);

      if (!coachDoc.exists()) {
        setError("Esse treinador não existe mais.");
        return;
      }

      await updateDoc(coachRef, {
        name: name.trim(),
        nationality,
        birthDate,
        preferredFormation: preferredFormation.trim(),
      });

      navigate(`/coach/${id}`);
    } catch (err) {
      console.error("Erro ao atualizar treinador:", err);
      setError("Não foi possível salvar as alterações. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <header className="header">
          <button
            className="back-button"
            type="button"
            onClick={() => navigate(`/coach/${id}`)}
          >
            Voltar
          </button>

          <div className="logo">
            Football<span>Stats</span>
          </div>

          <div className="topbar-spacer" />
        </header>

        <div className="empty-state">
          <h3>Carregando treinador...</h3>
          <p>Aguarde enquanto buscamos as informações.</p>
        </div>
      </div>
    );
  }

  if (error === "Treinador não encontrado.") {
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

          <div className="logo">
            Football<span>Stats</span>
          </div>

          <div className="topbar-spacer" />
        </header>

        <div className="empty-state">
          <h3>Treinador não encontrado</h3>
          <p>Esse perfil pode ter sido removido.</p>

          <button
            className="button"
            type="button"
            onClick={() => navigate("/dashboard")}
          >
            Voltar ao painel
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
          onClick={() => navigate(`/coach/${id}`)}
        >
          Voltar
        </button>

        <div className="logo">
          Football<span>Stats</span>
        </div>

        <div className="topbar-spacer" />
      </header>

      <main className="form-page">
        <div className="form-header">
          <span className="section-label">DATABASE • TREINADORES</span>
          <h1>Editar treinador</h1>
          <p>Atualize as informações pessoais do treinador.</p>
        </div>

        <div className="form-card">
          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <div className="form-section-title">
                <span>Informações pessoais</span>
              </div>

              <div className="form-grid">
                <div className="form-group form-full">
                  <label htmlFor="coach-name">Nome completo</label>
                  <input
                    id="coach-name"
                    className="input"
                    type="text"
                    placeholder="Ex.: Pedro Biondi"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="coach-nationality">Nacionalidade</label>
                  <select
                    id="coach-nationality"
                    className="select"
                    value={nationality}
                    onChange={(event) => setNationality(event.target.value)}
                    required
                  >
                    <option value="">Selecione o país</option>

                    {countries.map((country) => (
                      <option key={country.name} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="coach-birthDate">
                    Data de nascimento
                  </label>
                  <input
                    id="coach-birthDate"
                    className="input"
                    type="date"
                    value={birthDate}
                    onChange={(event) => setBirthDate(event.target.value)}
                    required
                  />
                </div>

                <div className="form-group form-full">
                  <label htmlFor="coach-formation">
                    Formação preferida
                  </label>
                  <input
                    id="coach-formation"
                    className="input"
                    type="text"
                    placeholder="Ex.: 4-3-3"
                    value={preferredFormation}
                    onChange={(event) =>
                      setPreferredFormation(event.target.value)
                    }
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-footer">
              <button
                className="secondary-button"
                type="button"
                onClick={() => navigate(`/coach/${id}`)}
                disabled={saving}
              >
                Cancelar
              </button>

              <button className="button" type="submit" disabled={saving}>
                {saving ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}