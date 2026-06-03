import React, { useState, useEffect } from 'react';
import './App.css';

function App() {

  // =========================
  // ESTADOS ORIGINAIS
  // =========================
  const [eventTitle, setEventTitle] = useState("");
  const [eventType, setEventType] = useState("Palestra");
  const [eventList, setEventList] = useState([]);
  const [filter, setFilter] = useState("Todos");

  // =========================
  // NOVOS ESTADOS (ATIVIDADE)
  // =========================

  // controle de vagas disponíveis
  const [vagas, setVagas] = useState(10);

  // campo de busca
  const [search, setSearch] = useState("");

  // =========================
  // LOCAL STORAGE
  // =========================

  // Carregar dados iniciais do LocalStorage
  useEffect(() => {
    const savedEvents = localStorage.getItem("@eventpulse_data");

    // verifica se existe algo salvo
    if (savedEvents) {
      setEventList(JSON.parse(savedEvents));
    }
  }, []);

  // Sincronizar alterações com o LocalStorage
  useEffect(() => {
    localStorage.setItem("@eventpulse_data", JSON.stringify(eventList));
  }, [eventList]);

  // =========================
  // ADICIONAR EVENTO
  // =========================
  const addEvent = (e) => {
    e.preventDefault();

    // impede adicionar vazio
    if (!eventTitle.trim()) return;

    const newEvent = {
      id: crypto.randomUUID(),
      title: eventTitle,
      type: eventType,
      status: "Agendado",
      date: new Date().toLocaleDateString(),

      // NOVA PROPRIEDADE
      vagas: vagas
    };

    // adiciona no topo
    setEventList([newEvent, ...eventList]);

    // limpa campo
    setEventTitle("");
  };

  // =========================
  // ALTERAR STATUS
  // =========================
  const toggleStatus = (id) => {
    setEventList(eventList.map(evt => {
      if (evt.id === id) {

        // alterna status em sequência
        const nextStatus =
          evt.status === "Agendado" ? "Em Andamento" :
          evt.status === "Em Andamento" ? "Encerrado" :
          "Agendado";

        return { ...evt, status: nextStatus };
      }
      return evt;
    }));
  };

  // =========================
  // REMOVER EVENTO
  // =========================
  const deleteEvent = (id) => {
    setEventList(eventList.filter(evt => evt.id !== id));
  };

  // =========================
  // INSCRIÇÃO (NOVA FEATURE)
  // =========================
  const inscreverAluno = (id) => {
    setEventList(eventList.map(evt => {

      // só altera se tiver vaga
      if (evt.id === id && evt.vagas > 0) {
        return { ...evt, vagas: evt.vagas - 1 };
      }

      return evt;
    }));
  };

  // =========================
  // LIMPAR TUDO (CONFIRM)
  // =========================
  const limparTudo = () => {

    // confirmação nativa do navegador
    const confirmar = window.confirm("Deseja realmente apagar todos os eventos?");

    if (confirmar) {
      setEventList([]);
      localStorage.removeItem("@eventpulse_data");
    }
  };

  // =========================
  // FILTRO + BUSCA
  // =========================
  let filteredEvents = eventList
    // filtro por status
    .filter(evt => {
      if (filter === "Agendados") return evt.status === "Agendado";
      if (filter === "Em Andamento") return evt.status === "Em Andamento";
      if (filter === "Encerrados") return evt.status === "Encerrado";
      return true;
    })
    // filtro por busca em tempo real
    .filter(evt =>
      evt.title.toLowerCase().includes(search.toLowerCase())
    );

  // =========================
  // WORKSHOP SEMPRE NO TOPO
  // =========================
  filteredEvents.sort((a, b) => {

    // se A for workshop → vem primeiro
    if (a.type === "Workshop" && b.type !== "Workshop") return -1;

    // se B for workshop → vem primeiro
    if (b.type === "Workshop" && a.type !== "Workshop") return 1;

    // mantém ordem normal
    return 0;
  });

  // =========================
  // RENDER
  // =========================
  return (
    <div className="app-container">

      <header>
        <h1>EventPulse</h1>
        <p>Gestão de Eventos Acadêmicos</p>

        {/* BOTÃO NOVO */}
        <button onClick={limparTudo}>
          Limpar Cronograma
        </button>
      </header>

      {/* FORMULÁRIO */}
      <section className="form-section">
        <form onSubmit={addEvent}>

          <input
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            placeholder="Nome do evento ou atividade..."
          />

          <select value={eventType} onChange={(e) => setEventType(e.target.value)}>
            <option value="Palestra">Palestra</option>
            <option value="Workshop">Workshop</option>
            <option value="Painel">Painel</option>
          </select>

          {/* NOVO CAMPO DE VAGAS */}
          <select value={vagas} onChange={(e) => setVagas(Number(e.target.value))}>
            <option value={10}>10 vagas</option>
            <option value={30}>30 vagas</option>
            <option value={50}>50 vagas</option>
          </select>

          <button type="submit">Agendar</button>
        </form>
      </section>

      {/* BUSCA */}
      <input
        placeholder="Pesquisar evento..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* FILTROS */}
      <section className="filter-section">
        {["Todos", "Agendados", "Em Andamento", "Encerrados"].map(f => (
          <button
            key={f}
            className={filter === f ? "active" : ""}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </section>

      {/* LISTA */}
      <main className="event-grid">
        {filteredEvents.map(item => (
          <div
            key={item.id}
            className={`event-card ${item.type.toLowerCase()}
${item.status.toLowerCase().replace(" ", "-")}`}
          >
            <div className="event-content">
              <h3>{item.title}</h3>

              <span className="event-tag">Tipo: {item.type}</span>
              <span className="status-badge">Status: {item.status}</span>

              {/* MOSTRANDO VAGAS */}
              <span>Vagas: {item.vagas}</span>

              <small>Registrado em: {item.date}</small>
            </div>

            <div className="event-actions">

              <button onClick={() => toggleStatus(item.id)} className="status-btn">
                {item.status === "Agendado"
                  ? "Iniciar"
                  : item.status === "Em Andamento"
                  ? "Encerrar"
                  : "Reiniciar"}
              </button>

              {/* NOVO BOTÃO */}
              <button
                onClick={() => inscreverAluno(item.id)}
                disabled={item.vagas === 0}
              >
                {item.vagas === 0 ? "Esgotado" : "Inscrever Aluno"}
              </button>

              <button onClick={() => deleteEvent(item.id)} className="delete">
                Remover
              </button>

            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

export default App;