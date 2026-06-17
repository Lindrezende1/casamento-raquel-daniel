import { useState } from "react";

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycby-2DYd8zbBfarOQ80D_i8L83q5HyYVxcVVj7ZIzFJZaumPnpocz4psGAkyjVf4Y3_o/exec";

const PIX_KEY = "raquelbianco2026@hotmail.com";

export default function App() {
  const [form, setForm] = useState({
    nomeCompleto: "",
    whatsapp: "",
    confirmaPresenca: "",
    numeroAcompanhantes: "0",
    acompanhantes: [],
    mensagem: "",
    desejaPresentear: "",
    pixCopiado: "Não",
  });

  const [toast, setToast] = useState("");
  const [finalMessage, setFinalMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (message) => {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 3000);
  };

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePresenceChange = (value) => {
    setForm((prev) => ({
      ...prev,
      confirmaPresenca: value,
      numeroAcompanhantes: value === "Sim" ? prev.numeroAcompanhantes : "0",
      acompanhantes: value === "Sim" ? prev.acompanhantes : [],
    }));
  };

  const handleAcompanhantesChange = (value) => {
    const quantidade = Number(value);

    setForm((prev) => ({
      ...prev,
      numeroAcompanhantes: value,
      acompanhantes: Array.from(
        { length: quantidade },
        (_, index) => prev.acompanhantes[index] || ""
      ),
    }));
  };

  const updateAcompanhanteName = (index, value) => {
    setForm((prev) => {
      const novosAcompanhantes = [...prev.acompanhantes];
      novosAcompanhantes[index] = value;

      return {
        ...prev,
        acompanhantes: novosAcompanhantes,
      };
    });
  };

  const handleGiftChange = (value) => {
    setForm((prev) => ({
      ...prev,
      desejaPresentear: value,
      pixCopiado: value === "Sim" ? prev.pixCopiado : "Não",
    }));
  };

  const copyPix = async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY);

      setForm((prev) => ({
        ...prev,
        pixCopiado: "Sim",
      }));

      showToast("Chave Pix copiada com sucesso.");
    } catch (error) {
      showToast("Não foi possível copiar. Selecione a chave manualmente.");
    }
  };

  const validateForm = () => {
    if (!form.nomeCompleto.trim()) {
      showToast("Preencha seu nome completo.");
      return false;
    }

    if (!form.whatsapp.trim()) {
      showToast("Preencha seu WhatsApp.");
      return false;
    }

    if (!form.confirmaPresenca) {
      showToast("Informe se você confirma presença.");
      return false;
    }

    if (form.confirmaPresenca === "Sim") {
      const quantidade = Number(form.numeroAcompanhantes || 0);

      for (let i = 0; i < quantidade; i++) {
        if (!form.acompanhantes[i] || !form.acompanhantes[i].trim()) {
          showToast(`Preencha o nome do acompanhante ${i + 1}.`);
          return false;
        }
      }
    }

    if (!form.desejaPresentear) {
      showToast("Informe se deseja presentear os noivos.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    const totalConvidados =
      form.confirmaPresenca === "Sim"
        ? 1 + Number(form.numeroAcompanhantes || 0)
        : 0;

    const payload = {
      nomeCompleto: form.nomeCompleto,
      whatsapp: form.whatsapp,
      confirmaPresenca: form.confirmaPresenca,
      numeroAcompanhantes:
        form.confirmaPresenca === "Sim" ? Number(form.numeroAcompanhantes) : 0,
      acompanhantes: form.confirmaPresenca === "Sim" ? form.acompanhantes : [],
      totalConvidados,
      mensagem: form.mensagem,
      desejaPresentear: form.desejaPresentear,
      pixCopiado: form.pixCopiado,
    };

    try {
      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload),
      });

      if (form.confirmaPresenca === "Sim") {
        setFinalMessage(
          "Confirmação recebida. Esperamos você para celebrar esse dia conosco!"
        );
      } else {
        setFinalMessage(
          "Resposta recebida. Sentiremos sua falta, mas agradecemos o carinho."
        );
      }

      setForm({
        nomeCompleto: "",
        whatsapp: "",
        confirmaPresenca: "",
        numeroAcompanhantes: "0",
        acompanhantes: [],
        mensagem: "",
        desejaPresentear: "",
        pixCopiado: "Não",
      });
    } catch (error) {
      showToast("Não foi possível enviar. Tente novamente em alguns instantes.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="page">
      <section className="invite-section">
        <img
          src="/convite-raquel-daniel.svg"
          alt="Convite de casamento Raquel e Daniel"
          className="invite-image"
        />
      </section>

      <section className="rsvp-section">
        <div className="rsvp-card">
          <p className="kicker">confirmação de presença</p>

          <h1>Raquel & Daniel</h1>

          <p className="intro">
            Para nos ajudar na organização, pedimos que confirme sua presença
            até 10/07/2026.
          </p>

          {finalMessage ? (
            <div className="success-box">
              <p>{finalMessage}</p>
            </div>
          ) : (
            <form className="rsvp-form" onSubmit={handleSubmit}>
              <label>
                Nome completo*
                <input
                  type="text"
                  value={form.nomeCompleto}
                  onChange={(e) =>
                    updateField("nomeCompleto", e.target.value)
                  }
                  placeholder="Digite seu nome completo"
                />
              </label>

              <label>
                WhatsApp*
                <input
                  type="tel"
                  value={form.whatsapp}
                  onChange={(e) => updateField("whatsapp", e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </label>

              <label>
                Você confirma sua presença?*
                <select
                  value={form.confirmaPresenca}
                  onChange={(e) => handlePresenceChange(e.target.value)}
                >
                  <option value="">Selecione</option>
                  <option value="Sim">Sim, confirmo minha presença</option>
                  <option value="Não">Infelizmente não poderei comparecer</option>
                </select>
              </label>

              {form.confirmaPresenca === "Sim" && (
                <>
                  <label>
                    Quantos acompanhantes irão com você?*
                    <select
                      value={form.numeroAcompanhantes}
                      onChange={(e) =>
                        handleAcompanhantesChange(e.target.value)
                      }
                    >
                      <option value="0">0</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
                  </label>

                  {form.acompanhantes.map((nome, index) => (
                    <label key={index}>
                      Nome do acompanhante {index + 1}*
                      <input
                        type="text"
                        value={nome}
                        onChange={(e) =>
                          updateAcompanhanteName(index, e.target.value)
                        }
                        placeholder={`Nome do acompanhante ${index + 1}`}
                      />
                    </label>
                  ))}
                </>
              )}

              <label>
                Mensagem para os noivos
                <textarea
                  value={form.mensagem}
                  onChange={(e) => updateField("mensagem", e.target.value)}
                  placeholder="Escreva uma mensagem, se desejar"
                  rows="4"
                />
              </label>

              <label>
                Deseja presentear os noivos?*
                <select
                  value={form.desejaPresentear}
                  onChange={(e) => handleGiftChange(e.target.value)}
                >
                  <option value="">Selecione</option>
                  <option value="Sim">
                    Sim, quero contribuir com a viagem do casal
                  </option>
                  <option value="Não">Agora não</option>
                </select>
              </label>

              {form.desejaPresentear === "Sim" && (
                <div className="pix-box">
                  <p className="pix-title">Para a viagem dos noivos</p>

                  <p>
                    Sua presença já é um presente muito especial. Mas, caso
                    deseje nos presentear, deixamos uma forma simples de
                    contribuir com a nossa viagem a dois.
                  </p>

                  <p className="pix-note">
                    O valor fica totalmente à sua escolha — o carinho é o que
                    mais importa.
                  </p>

                  <img
                    src="/pix-raquel-daniel.jpg"
                    alt="QR Code Pix Raquel e Daniel"
                    className="pix-image"
                  />

                  <div className="pix-key">{PIX_KEY}</div>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={copyPix}
                  >
                    Copiar chave Pix
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "Enviar confirmação"}
              </button>
            </form>
          )}
        </div>
      </section>

      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}
