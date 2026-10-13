import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Link, useNavigate, useParams } from "react-router-dom";
import { auth, db } from "../services/firebase";

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
      {
        name: "goals",
        label: "Quantidade de gols",
        type: "number",
        required: true,
      },
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
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let active = true;
    let unsubscribeAuth;

    async function loadAchievement(user) {
      setLoading(true);
      setError("");
      setForm(null);
      setAuthorized(false);

      try {
        const playerSnapshot = await getDoc(doc(db, "players", id));

        if (!active) return;

        if (
          !playerSnapshot.exists() ||
          playerSnapshot.data().ownerId !== user.uid
        ) {
          setError("Jogador não encontrado ou sem permissão para acessá-lo.");
          return;
        }

        const snapshot = await getDoc(
          doc(db, "achievements", achievementId)
        );

        if (!active) return;

        if (
          !snapshot.exists() ||
          snapshot.data().ownerId !== user.uid ||
          snapshot.data().playerId !== id
        ) {
          setError("Conquista não encontrada ou sem permissão para acessá-la.");
          return;
        }

        const achievement = snapshot.data();
        const category = achievement.category || "club";

        if (!achievementTypes[category]) {
          setError("O tipo desta conquista não é válido.");
          return;
        }

        setForm({
          category,
          name: achievement.name || "",
          teamName: achievement.teamName || "",
          competition: achievement.competition || "",
          season: achievement.season || "",
          goals:
            achievement.goals !== undefined
              ? String(achievement.goals)
              : "",
        });

        setAuthorized(true);
      } catch (err) {
        console.error("Erro ao carregar conquista:", err);

        if (active) {
          setError("Não foi possível carregar a conquista.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!active) return;

      if (!user) {
        navigate("/login", { replace: true });
        return;
      }

      loadAchievement(user);
    });

    return () => {
      active = false;
      if (unsubscribeAuth) unsubscribeAuth();
    };
  }, [id, achievementId, navigate]);

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

    const user = auth.currentUser;

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    const fields = achievementTypes[form.category]?.fields;

    if (!fields) {
      setError("Tipo de conquista inválido.");
      return;
    }

    const updatedAchievement = {
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
          setError(
            "A quantidade de gols deve ser um número inteiro igual ou maior que zero."
          );
          return;
        }

        updatedAchievement.goals = goals;
      } else if (value) {
        updatedAchievement[field.name] = value;
      }
    }

    setSaving(true);

    try {
      const playerSnapshot = await getDoc(doc(db, "players", id));

      if (
        !playerSnapshot.exists() ||
        playerSnapshot.data().ownerId !== user.uid
      ) {
        setError("Jogador não encontrado ou sem permissão para editá-lo.");
        setAuthorized(false);
        return;
      }

      const achievementRef = doc(db, "achievements", achievementId);
      const achievementSnapshot = await getDoc(achievementRef);

      if (
        !achievementSnapshot.exists() ||
        achievementSnapshot.data().ownerId !== user.uid ||
        achievementSnapshot.data().playerId !== id
      ) {
        setError("Conquista não encontrada ou sem permissão para editá-la.");
        setAuthorized(false);
        return;
      }

      await updateDoc(achievementRef, updatedAchievement);

      navigate(`/player/${id}`);
    } catch (err) {
      console.error("Erro ao atualizar conquista:", err);
      setError(
        "Não foi possível salvar as alterações. Verifique as permissões do Firestore."
      );
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

  if (!authorized || !form) {
    return (
      <div className="page">
        <div className="empty-state">
          <h3>Não foi possível abrir a conquista</h3>
          <p>{error || "Conquista não encontrada."}</p>
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
                    {achievementTypes[form.category].label}
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
                    value={form[field.name] ?? ""}
                    onChange={handleChange}
                    required={field.required || false}
                    disabled={saving}
                  />
                </label>
              ))}
            </div>

            <div className="achievement-edit-actions">
              <button className="button" type="submit" disabled={saving}>
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