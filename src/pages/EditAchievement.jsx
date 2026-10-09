import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Link, useNavigate, useParams } from "react-router-dom";
import { db } from "../services/firebase";

const achievementTypes = {
  club: {
    label: "Título por clube",
    fields: [
      { name: "name", label: "Nome do título", required: true },
      { name: "teamName", label: "Clube", required: true },
      { name: "season", label: "Temporada/ano", required: true },
      { name: "competition", label: "Competição (opcional)" },
    ],
  },
  national: {
    label: "Título pela seleção",
    fields: [
      { name: "name", label: "Nome do título", required: true },
      { name: "teamName", label: "Seleção", required: true },
      { name: "season", label: "Temporada/ano", required: true },
    ],
  },
  individual: {
    label: "Prêmio individual",
    fields: [
      { name: "name", label: "Nome do prêmio", required: true },
      { name: "competition", label: "Competição/evento", required: true },
      { name: "season", label: "Ano", required: true },
    ],
  },
  topScorer: {
    label: "Artilharia",
    fields: [
      { name: "competition", label: "Competição/evento", required: true },
      { name: "season", label: "Temporada/ano", required: true },
      { name: "goals", label: "Quantidade de gols", type: "number", required: true },
    ],
  },
};

export default function EditAchievement() {
  const { id, achievementId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAchievement() {
      try {
        const snapshot = await getDoc(
          doc(db, "achievements", achievementId)
        );

        if (!snapshot.exists() || snapshot.data().playerId !== id) {
          setError("Conquista não encontrada.");
          return;
        }

        setForm({
          category: snapshot.data().category || "club",
          name: snapshot.data().name || "",
          teamName: snapshot.data().teamName || "",
          competition: snapshot.data().competition || "",
          season: snapshot.data().season || "",
          goals:
            snapshot.data().goals !== undefined
              ? String(snapshot.data().goals)
              : "",
        });
      } catch (err) {
        console.error("Erro ao carregar conquista:", err);
        setError("Não foi possível carregar a conquista.");
      } finally {
        setLoading(false);
      }
    }

    loadAchievement();
  }, [id, achievementId]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form || saving) return;

    setError("");

    const fields = achievementTypes[form.category]?.fields;

    if (!fields) {
      setError("Tipo de conquista inválido.");
      return;
    }

    const updatedAchievement = {
      playerId: id,
      category: form.category,
    };

    for (const field of fields) {
      const value = String(form[field.name] ?? "").trim();

      if (field.required && !value) {
        setError(`Preencha o campo "${field.label}".`);
        return;
      }

      if (field.name === "goals") {
        const goals = Number(value);

        if (!Number.isInteger(goals) || goals < 0) {
          setError("A quantidade de gols deve ser um número inteiro igual ou maior que zero.");
          return;
        }

        updatedAchievement.goals = goals;
      } else if (value) {
        updatedAchievement[field.name] = value;
      }
    }

    setSaving(true);

    try {
      await updateDoc(doc(db, "achievements", achievementId), updatedAchievement);
      navigate(`/player/${id}`);
    } catch (err) {
      console.error("Erro ao atualizar conquista:", err);
      setError("Não foi possível salvar as alterações. Verifique as permissões do Firestore.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="empty-state">
          <h3>Carregando conquista...</h3>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="page">
        <div className="empty-state">
          <h3>{error || "Conquista não encontrada."}</h3>
          <Link className="button" to={`/player/${id}`}>
            Voltar ao perfil
          </Link>
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
          onClick={() => navigate(`/player/${id}`)}
        >
          Voltar
        </button>

        <Link to="/" className="logo">
          Football<span>Stats</span>
        </Link>

        <div className="topbar-spacer" />
      </header>

      <main>
        <section className="career-section achievement-edit-page">
          <div className="section-header">
            <div>
              <span className="section-label">CONQUISTAS</span>
              <h2>Editar conquista</h2>
              <p>Corrija as informações e salve as alterações.</p>
            </div>
          </div>

          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}

          <form className="achievement-form-card" onSubmit={handleSubmit}>
            <div className="achievement-form-grid">
              <label>
                Tipo de conquista
                <select value={form.category} disabled>
                  <option value={form.category}>
                    {achievementTypes[form.category]?.label || "Conquista"}
                  </option>
                </select>
              </label>

              {achievementTypes[form.category].fields.map((field) => (
                <label key={field.name}>
                  {field.label}
                  <input
                    name={field.name}
                    type={field.type || "text"}
                    min={field.type === "number" ? "0" : undefined}
                    step={field.type === "number" ? "1" : undefined}
                    value={form[field.name]}
                    onChange={handleChange}
                    required={field.required || false}
                    disabled={saving}
                  />
                </label>
              ))}
            </div>

            <div className="achievement-edit-actions">
              <button
                className="button"
                type="submit"
                disabled={saving}
              >
                {saving ? "Salvando..." : "Salvar alterações"}
              </button>

              <button
                className="achievement-cancel-button"
                type="button"
                onClick={() => navigate(`/player/${id}`)}
                disabled={saving}
              >
                Cancelar
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}