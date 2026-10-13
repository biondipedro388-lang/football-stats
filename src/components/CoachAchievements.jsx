import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../services/firebase";

const achievementTypes = {
  club: {
    label: "Título por clube",
    icon: "🏆",
    fields: [
      {
        name: "name",
        label: "Nome do título",
        placeholder: "Ex.: Campeão Brasileiro",
        required: true,
      },
      {
        name: "teamName",
        label: "Clube",
        placeholder: "Ex.: Palmeiras",
        required: true,
      },
      {
        name: "season",
        label: "Temporada/ano",
        placeholder: "Ex.: 2025",
        required: true,
      },
      {
        name: "competition",
        label: "Competição (opcional)",
        placeholder: "Ex.: Campeonato Brasileiro",
      },
    ],
  },
  national: {
    label: "Título pela seleção",
    icon: "🌎",
    fields: [
      {
        name: "name",
        label: "Nome do título",
        placeholder: "Ex.: Campeão da Copa América",
        required: true,
      },
      {
        name: "teamName",
        label: "Seleção",
        placeholder: "Ex.: Brasil",
        required: true,
      },
      {
        name: "season",
        label: "Temporada/ano",
        placeholder: "Ex.: 2024",
        required: true,
      },
    ],
  },
  individual: {
    label: "Prêmio individual",
    icon: "🥇",
    fields: [
      {
        name: "name",
        label: "Nome do prêmio",
        placeholder: "Ex.: Melhor Treinador do Ano",
        required: true,
      },
      {
        name: "competition",
        label: "Competição/evento",
        placeholder: "Ex.: Prêmio de Melhor Treinador",
        required: true,
      },
      {
        name: "season",
        label: "Ano",
        placeholder: "Ex.: 2025",
        required: true,
      },
    ],
  },
};

const emptyForm = {
  category: "club",
  name: "",
  teamName: "",
  competition: "",
  season: "",
};

export default function CoachAchievements({ coachId }) {
  const [achievements, setAchievements] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  async function verifyCoachOwnership(userId) {
    const coachSnap = await getDoc(doc(db, "coaches", coachId));

    return (
      coachSnap.exists() &&
      coachSnap.data().ownerId === userId
    );
  }

  async function loadAchievements() {
    const user = auth.currentUser;

    if (!user) {
      setAchievements([]);
      return;
    }

    const hasAccess = await verifyCoachOwnership(user.uid);

    if (!hasAccess) {
      setAchievements([]);
      throw new Error("Treinador não encontrado ou sem permissão.");
    }

    const achievementsQuery = query(
      collection(db, "coachAchievements"),
      where("ownerId", "==", user.uid),
      where("coachId", "==", coachId)
    );

    const snapshot = await getDocs(achievementsQuery);

    const data = snapshot.docs.map((item) => ({
      id: item.id,
      ...item.data(),
    }));

    data.sort((a, b) =>
      String(b.season || "").localeCompare(String(a.season || ""))
    );

    setAchievements(data);
  }

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        await loadAchievements();
      } catch (err) {
        console.error("Erro ao carregar títulos do treinador:", err);

        if (active) {
          setError("Não foi possível carregar os títulos e as premiações.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [coachId]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleCategoryChange(event) {
    setForm({
      ...emptyForm,
      category: event.target.value,
    });
  }

  function openForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  }

  function cancelForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowForm(false);
  }

  function handleEdit(item) {
    setEditingId(item.id);
    setForm({
      ...emptyForm,
      category: item.category || "club",
      name: item.name || "",
      teamName: item.teamName || "",
      competition: item.competition || "",
      season: item.season || "",
    });
    setError("");
    setShowForm(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError("");

    const user = auth.currentUser;

    if (!user) {
      setError("Sua sessão expirou. Entre novamente na sua conta.");
      setSaving(false);
      return;
    }

    if (!achievementTypes[form.category]) {
      setError("Selecione um tipo de conquista válido.");
      setSaving(false);
      return;
    }

    const achievement = {
      coachId,
      category: form.category,
    };

    for (const field of achievementTypes[form.category].fields) {
      const value = String(form[field.name] ?? "").trim();

      if (field.required && !value) {
        setError(`Preencha o campo "${field.label}".`);
        setSaving(false);
        return;
      }

      if (value !== "") {
        achievement[field.name] = value;
      }
    }

    try {
      const hasAccess = await verifyCoachOwnership(user.uid);

      if (!hasAccess) {
        setError("Você não tem permissão para alterar este treinador.");
        return;
      }

      if (editingId) {
        const achievementRef = doc(
          db,
          "coachAchievements",
          editingId
        );

        const achievementSnap = await getDoc(achievementRef);

        if (!achievementSnap.exists()) {
          setError("Título não encontrado.");
          return;
        }

        const existing = achievementSnap.data();

        if (
          existing.ownerId !== user.uid ||
          existing.coachId !== coachId
        ) {
          setError("Você não tem permissão para editar este título.");
          return;
        }

        await updateDoc(achievementRef, achievement);
      } else {
        await addDoc(collection(db, "coachAchievements"), {
          ...achievement,
          ownerId: user.uid,
          createdAt: new Date().toISOString(),
        });
      }

      await loadAchievements();
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      console.error("Erro ao salvar título do treinador:", err);
      setError(
        "Não foi possível salvar o título. Verifique as permissões do Firestore e tente novamente."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(achievementId) {
    const confirmed = window.confirm(
      "Deseja excluir este título? Essa ação não pode ser desfeita."
    );

    if (!confirmed) return;

    const user = auth.currentUser;

    if (!user) {
      setError("Sua sessão expirou. Entre novamente na sua conta.");
      return;
    }

    setError("");
    setSaving(true);

    try {
      const achievementRef = doc(
        db,
        "coachAchievements",
        achievementId
      );

      const achievementSnap = await getDoc(achievementRef);

      if (!achievementSnap.exists()) {
        setError("Título não encontrado.");
        return;
      }

      const existing = achievementSnap.data();

      if (
        existing.ownerId !== user.uid ||
        existing.coachId !== coachId
      ) {
        setError("Você não tem permissão para excluir este título.");
        return;
      }

      await deleteDoc(achievementRef);
      await loadAchievements();

      if (editingId === achievementId) {
        cancelForm();
      }
    } catch (err) {
      console.error("Erro ao excluir título do treinador:", err);
      setError("Não foi possível excluir este título.");
    } finally {
      setSaving(false);
    }
  }

  function getDescription(item) {
    const parts = [];

    if (item.teamName) parts.push(item.teamName);
    if (item.competition) parts.push(item.competition);
    if (item.season) parts.push(item.season);

    return parts.join(" · ");
  }

  return (
    <section className="achievement-section career-section">
      <div className="section-header">
        <div>
          <span className="section-label">CONQUISTAS</span>
          <h2>Títulos e Premiações</h2>
        </div>

        <button
          className="button"
          type="button"
          onClick={showForm ? cancelForm : openForm}
          disabled={saving}
        >
          {showForm ? "Cancelar" : "+ Adicionar título"}
        </button>
      </div>

      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}

      {showForm && (
        <form className="achievement-form-card" onSubmit={handleSubmit}>
          <div className="form-section-title">
            <span>{editingId ? "Editar título" : "Novo título"}</span>
          </div>

          <div className="achievement-form-grid">
            <label>
              Tipo de conquista
              <select
                name="category"
                value={form.category}
                onChange={handleCategoryChange}
                disabled={saving}
              >
                {Object.entries(achievementTypes).map(([value, type]) => (
                  <option value={value} key={value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>

            {achievementTypes[form.category].fields.map((field) => (
              <label key={field.name}>
                {field.label}
                <input
                  name={field.name}
                  type="text"
                  value={form[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  required={field.required || false}
                  disabled={saving}
                />
              </label>
            ))}
          </div>

          <div className="achievement-form-actions">
            <button
              className="secondary-button"
              type="button"
              onClick={cancelForm}
              disabled={saving}
            >
              Cancelar
            </button>

            <button className="button" type="submit" disabled={saving}>
              {saving
                ? "Salvando..."
                : editingId
                  ? "Salvar alterações"
                  : "Adicionar título"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p>Carregando títulos...</p>
      ) : achievements.length === 0 ? (
        <div className="empty-state">
          <h3>Nenhuma conquista cadastrada</h3>
          <p>Adicione os títulos e prêmios conquistados pelo treinador.</p>
        </div>
      ) : (
        <div className="achievement-list">
          {achievements.map((item) => {
            const type =
              achievementTypes[item.category] || achievementTypes.club;

            return (
              <article className="achievement-card" key={item.id}>
                <div className="achievement-icon" aria-hidden="true">
                  {type.icon}
                </div>

                <div className="achievement-content">
                  <span className="achievement-category">
                    {type.label}
                  </span>

                  <h3>{item.name || "Título sem nome"}</h3>

                  {getDescription(item) && (
                    <p className="achievement-details">
                      {getDescription(item)}
                    </p>
                  )}
                </div>

                <div className="season-actions">
                  <button
                    className="season-action-button"
                    type="button"
                    onClick={() => handleEdit(item)}
                    disabled={saving}
                  >
                    Editar
                  </button>

                  <button
                    className="season-action-button delete"
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    disabled={saving}
                  >
                    Excluir
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
