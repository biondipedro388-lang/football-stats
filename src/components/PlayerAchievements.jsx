import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Link } from "react-router-dom";
import { auth, db } from "../services/firebase";

const achievementTypes = {
  club: {
    label: "Título por clube",
    icon: "🏆",
    fields: [
      { name: "name", label: "Nome do título", placeholder: "Ex.: Campeão Brasileiro", required: true },
      { name: "teamName", label: "Clube", placeholder: "Ex.: Palmeiras", required: true },
      { name: "season", label: "Temporada/ano", placeholder: "Ex.: 2025", required: true },
      { name: "competition", label: "Competição (opcional)", placeholder: "Ex.: Campeonato Brasileiro" },
    ],
  },
  national: {
    label: "Título pela seleção",
    icon: "🌎",
    fields: [
      { name: "name", label: "Nome do título", placeholder: "Ex.: Campeão da Copa América", required: true },
      { name: "teamName", label: "Seleção", placeholder: "Ex.: Brasil", required: true },
      { name: "season", label: "Temporada/ano", placeholder: "Ex.: 2024", required: true },
    ],
  },
  individual: {
    label: "Prêmio individual",
    icon: "🥇",
    fields: [
      { name: "name", label: "Nome do prêmio", placeholder: "Ex.: Melhor Jogador do Campeonato", required: true },
      { name: "competition", label: "Competição/evento", placeholder: "Ex.: Bola de Ouro", required: true },
      { name: "season", label: "Ano", placeholder: "Ex.: 2025", required: true },
    ],
  },
  topScorer: {
    label: "Artilharia",
    icon: "⚽",
    fields: [
      { name: "competition", label: "Competição/evento", placeholder: "Ex.: Champions League", required: true },
      { name: "season", label: "Temporada/ano", placeholder: "Ex.: 2025/26", required: true },
      { name: "goals", label: "Quantidade de gols", placeholder: "Ex.: 12", type: "number", required: true },
    ],
  },
};

const emptyForm = {
  category: "club",
  name: "",
  teamName: "",
  competition: "",
  season: "",
  goals: "",
};

export default function PlayerAchievements({ playerId }) {
  const [achievements, setAchievements] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  async function loadAchievements(currentUser = auth.currentUser) {
    if (!currentUser) {
      setAchievements([]);
      return;
    }

    const playerSnap = await getDoc(doc(db, "players", playerId));

    if (
      !playerSnap.exists() ||
      playerSnap.data().ownerId !== currentUser.uid
    ) {
      setAchievements([]);
      throw new Error("Jogador não encontrado ou sem permissão.");
    }

    const achievementsQuery = query(
      collection(db, "achievements"),
      where("ownerId", "==", currentUser.uid),
      where("playerId", "==", playerId)
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
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!authReady) return;

      setLoading(true);
      setError("");

      if (!user) {
        setAchievements([]);
        setError("Entre na sua conta para visualizar as conquistas.");
        setLoading(false);
        return;
      }

      try {
        const playerSnap = await getDoc(doc(db, "players", playerId));

        if (!active) return;

        if (
          !playerSnap.exists() ||
          playerSnap.data().ownerId !== user.uid
        ) {
          setAchievements([]);
          setError("Jogador não encontrado ou sem permissão.");
          setLoading(false);
          return;
        }

        const achievementsQuery = query(
          collection(db, "achievements"),
          where("ownerId", "==", user.uid),
          where("playerId", "==", playerId)
        );

        const snapshot = await getDocs(achievementsQuery);

        if (!active) return;

        const data = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        data.sort((a, b) =>
          String(b.season || "").localeCompare(String(a.season || ""))
        );

        setAchievements(data);
      } catch (err) {
        console.error("Erro ao carregar conquistas:", err);

        if (active) {
          setError("Não foi possível carregar as conquistas deste jogador.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [playerId, user, authReady]);

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
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  }

  function cancelForm() {
    setForm(emptyForm);
    setError("");
    setShowForm(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError("");

    const currentUser = auth.currentUser;

    if (!currentUser) {
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
      ownerId: currentUser.uid,
      playerId,
      category: form.category,
    };

    for (const field of achievementTypes[form.category].fields) {
      const value = String(form[field.name] ?? "").trim();

      if (field.required && !value) {
        setError(`Preencha o campo "${field.label}".`);
        setSaving(false);
        return;
      }

      if (field.name === "goals" && value !== "") {
        const goals = Number(value);

        if (!Number.isInteger(goals) || goals < 0) {
          setError(
            "A quantidade de gols deve ser um número inteiro igual ou maior que zero."
          );
          setSaving(false);
          return;
        }

        achievement.goals = goals;
      } else if (value !== "") {
        achievement[field.name] = value;
      }
    }

    try {
      const playerSnap = await getDoc(doc(db, "players", playerId));

      if (
        !playerSnap.exists() ||
        playerSnap.data().ownerId !== currentUser.uid
      ) {
        setError("Jogador não encontrado ou sem permissão.");
        return;
      }

      achievement.createdAt = new Date().toISOString();

      await addDoc(collection(db, "achievements"), achievement);

      setForm(emptyForm);
      setShowForm(false);
      await loadAchievements(currentUser);
    } catch (err) {
      console.error("Erro ao adicionar conquista:", err);
      setError(
        "Não foi possível adicionar a conquista. Verifique as permissões do Firestore e tente novamente."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(achievementId) {
    const confirmed = window.confirm(
      "Deseja excluir esta conquista? Essa ação não pode ser desfeita."
    );

    if (!confirmed) return;

    const currentUser = auth.currentUser;

    if (!currentUser) {
      setError("Sua sessão expirou. Entre novamente na sua conta.");
      return;
    }

    setError("");

    try {
      const achievementRef = doc(db, "achievements", achievementId);
      const achievementSnap = await getDoc(achievementRef);

      if (!achievementSnap.exists()) {
        setError("Conquista não encontrada.");
        return;
      }

      const data = achievementSnap.data();

      if (
        data.ownerId !== currentUser.uid ||
        data.playerId !== playerId
      ) {
        setError("Você não tem permissão para excluir esta conquista.");
        return;
      }

      await deleteDoc(achievementRef);
      await loadAchievements(currentUser);
    } catch (err) {
      console.error("Erro ao excluir conquista:", err);
      setError("Não foi possível excluir esta conquista.");
    }
  }

  function getDescription(item) {
    const parts = [];

    if (item.teamName) parts.push(item.teamName);
    if (item.competition) parts.push(item.competition);
    if (item.season) parts.push(item.season);

    if (item.category === "topScorer" && item.goals !== undefined) {
      parts.push(`${item.goals} gols`);
    }

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
          disabled={saving || !user}
        >
          {showForm ? "Cancelar" : "+ Adicionar conquista"}
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
            <span>Nova conquista</span>
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
                  type={field.type || "text"}
                  min={field.type === "number" ? "0" : undefined}
                  step={field.type === "number" ? "1" : undefined}
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
              {saving ? "Salvando..." : "Adicionar conquista"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p>Carregando conquistas...</p>
      ) : achievements.length === 0 ? (
        <div className="empty-state">
          <h3>Nenhuma conquista cadastrada</h3>
          <p>Adicione os títulos e prêmios conquistados pelo jogador.</p>
        </div>
      ) : (
        <div className="achievement-list">
          {achievements.map((item) => {
            const type =
              achievementTypes[item.category] || achievementTypes.club;

            const title =
              item.category === "topScorer" ? "Artilheiro" : item.name;

            return (
              <article className="achievement-card" key={item.id}>
                <div className="achievement-icon" aria-hidden="true">
                  {type.icon}
                </div>

                <div className="achievement-content">
                  <span className="achievement-category">{type.label}</span>
                  <h3>{title}</h3>

                  {getDescription(item) && (
                    <p className="achievement-details">
                      {getDescription(item)}
                    </p>
                  )}
                </div>

                <div className="season-actions">
                  <Link
                    className="season-action-button"
                    to={`/player/${playerId}/edit-achievement/${item.id}`}
                  >
                    Editar
                  </Link>

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