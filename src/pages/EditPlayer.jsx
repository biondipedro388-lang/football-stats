import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate, useParams } from "react-router-dom";
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

const positions = [
  { code: "GOL", name: "Goleiro" },
  { code: "LD", name: "Lateral Direito" },
  { code: "LE", name: "Lateral Esquerdo" },
  { code: "ZAG", name: "Zagueiro" },
  { code: "VOL", name: "Volante" },
  { code: "MC", name: "Meio-Campista" },
  { code: "MEI", name: "Meia" },
  { code: "MD", name: "Meia Direito" },
  { code: "ME", name: "Meia Esquerdo" },
  { code: "PD", name: "Ponta Direita" },
  { code: "PE", name: "Ponta Esquerda" },
  { code: "SA", name: "Segundo Atacante" },
  { code: "CA", name: "Centroavante" },
];

export default function EditPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [nationality, setNationality] = useState("");
  const [position, setPosition] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [preferredFoot, setPreferredFoot] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let active = true;
    let unsubscribeAuth;

    async function loadPlayer(user) {
      setLoading(true);
      setError("");
      setAuthorized(false);

      try {
        const playerRef = doc(db, "players", id);
        const playerDoc = await getDoc(playerRef);

        if (!active) return;

        if (
          !playerDoc.exists() ||
          playerDoc.data().ownerId !== user.uid
        ) {
          setError("Jogador não encontrado ou sem permissão para acessá-lo.");
          return;
        }

        const player = playerDoc.data();

        setName(player.name || "");
        setNationality(player.nationality || "");
        setPosition(player.position || "");
        setBirthDate(player.birthDate || "");
        setPreferredFoot(player.preferredFoot || "");
        setAuthorized(true);
      } catch (err) {
        console.error("Erro ao carregar jogador:", err);

        if (active) {
          setError("Não foi possível carregar os dados do jogador.");
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

      loadPlayer(user);
    });

    return () => {
      active = false;
      if (unsubscribeAuth) unsubscribeAuth();
    };
  }, [id, navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const user = auth.currentUser;

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (
      !name.trim() ||
      !nationality ||
      !position ||
      !birthDate ||
      !preferredFoot
    ) {
      setError("Preencha todos os campos antes de salvar.");
      return;
    }

    setSaving(true);

    try {
      const playerRef = doc(db, "players", id);
      const playerDoc = await getDoc(playerRef);

      if (
        !playerDoc.exists() ||
        playerDoc.data().ownerId !== user.uid
      ) {
        setError("Jogador não encontrado ou sem permissão para editá-lo.");
        setAuthorized(false);
        return;
      }

      await updateDoc(playerRef, {
        name: name.trim(),
        nationality,
        position,
        birthDate,
        preferredFoot,
      });

      navigate(`/player/${id}`);
    } catch (err) {
      console.error("Erro ao atualizar jogador:", err);
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
            onClick={() => navigate(`/player/${id}`)}
          >
            Voltar
          </button>

          <div className="logo">
            Football<span>Stats</span>
          </div>

          <div className="topbar-spacer"></div>
        </header>

        <div className="empty-state">
          <h3>Carregando jogador...</h3>
          <p>Aguarde enquanto buscamos as informações.</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
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

          <div className="topbar-spacer"></div>
        </header>

        <div className="empty-state">
          <h3>Não foi possível abrir o jogador</h3>
          <p>{error || "Você não tem permissão para acessar este perfil."}</p>

          <button
            className="button"
            type="button"
            onClick={() => navigate("/dashboard")}
          >
            Voltar ao dashboard
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
          onClick={() => navigate(`/player/${id}`)}
        >
          Voltar
        </button>

        <div className="logo">
          Football<span>Stats</span>
        </div>

        <div className="topbar-spacer"></div>
      </header>

      <main className="form-page">
        <div className="form-header">
          <span className="section-label">DATABASE • JOGADORES</span>
          <h1>Editar jogador</h1>
          <p>Atualize as informações do perfil do jogador.</p>
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
                  <label>Nome completo</label>
                  <input
                    className="input"
                    type="text"
                    placeholder="Ex: Pedro Biondi"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Nacionalidade</label>
                  <select
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
                  <label>Posição</label>
                  <select
                    className="select"
                    value={position}
                    onChange={(event) => setPosition(event.target.value)}
                    required
                  >
                    <option value="">Selecione a posição</option>

                    {positions.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.code} — {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Data de nascimento</label>
                  <input
                    className="input"
                    type="date"
                    value={birthDate}
                    onChange={(event) => setBirthDate(event.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Pé dominante</label>
                  <select
                    className="select"
                    value={preferredFoot}
                    onChange={(event) => setPreferredFoot(event.target.value)}
                    required
                  >
                    <option value="">Selecione</option>
                    <option value="Direito">Direito</option>
                    <option value="Esquerdo">Esquerdo</option>
                    <option value="Ambidestro">Ambidestro</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-footer">
              <button
                className="secondary-button"
                type="button"
                onClick={() => navigate(`/player/${id}`)}
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