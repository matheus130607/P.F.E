// Importa o React e os hooks useState e useEffect da biblioteca react
// useState: gerencia o estado dos componentes (dados que mudam)
// useEffect: executa efeitos colaterais (como salvar no localStorage)
import React, { useState, useEffect } from 'react';

// Importa o arquivo de estilos CSS específico para este componente
import './App.css';

// Define o componente principal da aplicação como uma função
function App() {
  // Estado que armazena o texto digitado pelo usuário no campo de tarefa
  const [taskText, setTaskText] = useState("");
  
  // Estado que armazena a prioridade selecionada (padrão: "Baixa")
  const [priority, setPriority] = useState("Baixa");
  
  // Estado que armazena a lista completa de tarefas
  const [taskList, setTaskList] = useState([]);
  
  // Estado que armazena o filtro atual (Todas, Pendentes, Concluídas)
  const [filter, setFilter] = useState("Todas");
  
  // Estado que armazena o termo de busca digitado pelo usuário para filtrar tarefas em tempo real
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estado que armazena o ID da tarefa que está sendo editada (null quando não está editando)
  const [editingId, setEditingId] = useState(null);

  // useEffect executa uma vez ao iniciar o componente (array de dependências vazio)
  // Busca as tarefas salvas no localStorage do navegador
  useEffect(() => {
    // Obtém os dados salvos no navegador sob a chave "@taskflow_data"
    const saved = localStorage.getItem("@taskflow_data");
    // Se existirem dados salvos, converte de JSON e atualiza o estado taskList
    if (saved) setTaskList(JSON.parse(saved));
  }, []);

  // useEffect executa sempre que o estado taskList mudar
  // Salva automaticamente as tarefas no localStorage sempre que a lista for alterada
  useEffect(() => {
    // Converte a lista de tarefas para JSON e salva no navegador
    localStorage.setItem("@taskflow_data", JSON.stringify(taskList));
  }, [taskList]);

  // Função que prepara o formulário para editar uma tarefa existente
  const startEdit = (task) => {
    // Preenche o campo de texto com o texto atual da tarefa selecionada
    setTaskText(task.text);      
    // Preenche o select de prioridade com a prioridade atual da tarefa
    setPriority(task.priority);  
    // Armazena o ID da tarefa para indicar que estamos no modo de edição
    setEditingId(task.id);       
  };

  // Função que adiciona uma nova tarefa ou edita uma existente
  const addTask = (e) => {
    // Previne o comportamento padrão do formulário (recarregar a página)
    e.preventDefault();
    // Se o campo de texto estiver vazio ou apenas espaços, não faz nada
    if (!taskText.trim()) return;

    // Verifica se estamos no modo de edição (editingId não é null)
    if (editingId) {
      // Mapeia todas as tarefas e substitui apenas a que tem o ID correspondente
      const updatedList = taskList.map(t => 
        // Se for a tarefa sendo editada, cria um novo objeto com texto e prioridade atualizados
        t.id === editingId ? { ...t, text: taskText, priority: priority } : t
      );
      // Atualiza a lista de tarefas com a versão modificada
      setTaskList(updatedList);
      // Limpa o ID de edição para voltar ao modo de criação
      setEditingId(null); 
    } else {
      // Cria um novo objeto de tarefa com os dados fornecidos
      const newTask = {
        // Gera um ID único usando a API nativa do navegador
        id: crypto.randomUUID(),
        // Texto da tarefa digitado pelo usuário
        text: taskText,
        // Prioridade selecionada no select
        priority: priority,
        // Inicializa como não concluída
        completed: false,
        // Data de criação formatada
        createdAt: new Date().toLocaleDateString()
      };
      // Adiciona a nova tarefa no início da lista (spread operator)
      setTaskList([newTask, ...taskList]);
    }

    // Limpa o campo de texto após adicionar/editar
    setTaskText("");
    // Reseta a prioridade para o valor padrão
    setPriority("Baixa");
  };

  // Função que marca/desmarca uma tarefa como concluída
  const toggleTask = (id) => {
    // Mapeia todas as tarefas e inverte o valor de 'completed' apenas para a tarefa com o ID correspondente
    setTaskList(taskList.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  // Função que exclui uma tarefa após confirmação do usuário
  const deleteTask = (id) => {
    // Abre uma janela de confirmação nativa do navegador e armazena a resposta (true ou false)
    const confirmacao = window.confirm("Tem certeza que deseja excluir esta tarefa?");
    
    // Verifica se o usuário clicou em "OK" na confirmação
    if (confirmacao) {
      // Filtra a lista removendo apenas a tarefa com o ID correspondente
      setTaskList(taskList.filter(t => t.id !== id));
    }
  };

  // Variável que armazena a lista de tarefas filtrada e ordenada
  const filteredTasks = taskList
    // Primeiro filtro: aplica o filtro de status (Pendentes ou Concluídas)
    .filter(t => {
      // Se o filtro for "Pendentes", retorna apenas as não concluídas
      if (filter === "Pendentes") return !t.completed;
      // Se o filtro for "Concluídas", retorna apenas as concluídas
      if (filter === "Concluídas") return t.completed;
      // Se for "Todas", retorna todas as tarefas
      return true;
    })
    // Segundo filtro: aplica o filtro de busca por texto (case-insensitive)
    .filter(t =>
      // Verifica se o texto da tarefa contém o termo de busca (convertido para minúsculas)
      t.text.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Ordena as tarefas por prioridade (Alta primeiro)
    .sort((a, b) => {
      // Objeto que converte prioridades em números para comparação: Alta=3, Média=2, Baixa=1
      const peso = { "Alta": 3, "Média": 2, "Baixa": 1 }
      // Calcula a diferença de peso entre as prioridades (ordem decrescente)
      // Tarefas com maior prioridade (maior peso) aparecem primeiro
      return peso[b.priority] - peso[a.priority]
    });

  // Retorna o JSX (estrutura visual) do componente
  return (
    // Container principal da aplicação com classe CSS
    <div className="app-container">
      {/* Cabeçalho com título e descrição */}
      <header>
        {/* Título principal da aplicação */}
        <h1>TaskFlow</h1>
        {/* Subtítulo descritivo */}
        <p>Gestão de Produtividade</p>
      </header>

      {/* Seção do formulário de adição/edição de tarefas */}
      <section className="form-section">
        {/* Formulário que chama a função addTask ao ser submetido */}
        <form onSubmit={addTask}>
          {/* Campo de input para digitar a descrição da tarefa */}
          <input
            // Valor do input controlado pelo estado taskText
            value={taskText}
            // Atualiza o estado sempre que o usuário digita algo
            onChange={(e) => setTaskText(e.target.value)}
            // Texto de exemplo que aparece quando o campo está vazio
            placeholder="Descrição da tarefa..."
          />
          {/* Select para escolher a prioridade da tarefa */}
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            {/* Opção de prioridade baixa (valor padrão) */}
            <option value="Baixa">Baixa</option>
            {/* Opção de prioridade média */}
            <option value="Média">Média</option>
            {/* Opção de prioridade alta */}
            <option value="Alta">Alta</option>
          </select>

          {/* Botão de submit que muda o texto dependendo do modo (criar ou editar) */}
          <button type="submit">
            {/* Se editingId existir, mostra "Salvar Alteração", senão mostra "Criar" */}
            {editingId ? "Salvar Alteração" : "Criar"}
          </button>

          {/* Botão de cancelar que só aparece durante a edição */}
          {editingId && (
            // Botão que limpa os estados e sai do modo de edição
            <button type="button" onClick={() => { setEditingId(null); setTaskText(""); }}>
              Cancelar
            </button>
          )}
        </form>
      </section>

      {/* Seção de filtros e busca */}
      <section className="filter-section">
        {/* Input de busca que filtra as tarefas em tempo real */}
        <input 
          // Tipo do input (texto)
          type="text" 
          // Valor controlado pelo estado searchTerm
          value={searchTerm} 
          // Texto de placeholder
          placeholder='Buscar por tarefa...'
          // Atualiza o termo de busca a cada digitação
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
        {/* Mapeia as opções de filtro e cria um botão para cada uma */}
        {["Todas", "Pendentes", "Concluídas"].map(f => (
          // Botão de filtro com chave única para o React
          <button
            key={f}
            // Adiciona classe "active" se o filtro atual for igual a esta opção
            className={filter === f ? "active" : ""}
            // Ao clicar, atualiza o estado do filtro
            onClick={() => setFilter(f)}
          >
            {/* Texto do botão (Todas, Pendentes ou Concluídas) */}
            {f}
          </button>
        ))}
      </section>

      {/* Área principal que exibe a lista de tarefas em formato de grid */}
      <main className="task-grid">
        {/* Mapeia cada tarefa da lista filtrada e cria um card para cada uma */}
        {filteredTasks.map(item => (
          // Container do card de tarefa com classes dinâmicas (prioridade e status)
          <div key={item.id} className={`task-card ${item.priority.toLowerCase()} ${item.completed ? 'done' : ''}`}>
            {/* Div com o conteúdo textual da tarefa */}
            <div className="task-content">
              {/* Título da tarefa (texto) */}
              <h3>{item.text}</h3>
              {/* Span mostrando a prioridade da tarefa */}
              <span>Prioridade: {item.priority}</span>
              {/* Small com a data de criação da tarefa */}
              <small>Criada em: {item.createdAt}</small>
            </div>
            {/* Div com os botões de ação da tarefa */}
            <div className="task-actions">
              {/* Botão para marcar como concluída ou reabrir */}
              <button onClick={() => toggleTask(item.id)}>
                {/* Texto muda dependendo se já está concluída ou não */}
                {item.completed ? "Reabrir" : "Concluir"}
              </button>
              
              {/* Botão que inicia o modo de edição para esta tarefa específica */}
              <button onClick={() => startEdit(item)}>
                Editar
              </button>

              {/* Botão para remover a tarefa (com classe CSS específica) */}
              <button onClick={() => deleteTask(item.id)} className="delete">
                Remover
              </button>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

// Exporta o componente App como padrão para ser usado em outros arquivos
export default App;