import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [taskText, setTaskText] = useState("");
  const [priority, setPriority] = useState("Baixa");
  const [taskList, setTaskList] = useState([]);
  const [filter, setFilter] = useState("Todas");
  
  // 2. Busca em Tempo Real: Estado para o termo de pesquisa
  const [searchTerm, setSearchTerm] = useState("");
  
  // 3. Edição de Tarefas: Estado que armazena o ID da tarefa sendo editada
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("@taskflow_data");
    if (saved) setTaskList(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("@taskflow_data", JSON.stringify(taskList));
  }, [taskList]);

  // FUNÇÃO startEdit: Prepara o formulário para alteração
  const startEdit = (task) => {
    // Pegamos os valores da tarefa selecionada e jogamos de volta nos inputs
    setTaskText(task.text);      
    setPriority(task.priority);  
    // Guardamos o ID para que o sistema saiba que NÃO é uma tarefa nova, mas uma edição
    setEditingId(task.id);       
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!taskText.trim()) return;

    if (editingId) {
      // 3. Lógica de Edição: Atualiza a tarefa existente
      const updatedList = taskList.map(t => 
        t.id === editingId ? { ...t, text: taskText, priority: priority } : t
      );
      setTaskList(updatedList);
      setEditingId(null); // Volta o formulário para o modo "Criar"
    } else {
      const newTask = {
        id: crypto.randomUUID(),
        text: taskText,
        priority: priority,
        completed: false,
        createdAt: new Date().toLocaleDateString()
      };
      setTaskList([newTask, ...taskList]);
    }

    setTaskText("");
    setPriority("Baixa");
  };

  const toggleTask = (id) => {
    setTaskList(taskList.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  // 4. FUNÇÃO deleteTask COM window.confirm: Segurança na exclusão
  const deleteTask = (id) => {
    // window.confirm abre um modal do navegador. Ele retorna true (OK) ou false (Cancelar).
    const confirmacao = window.confirm("Tem certeza que deseja excluir esta tarefa?");
    
    // Só executamos o filtro de remoção se o usuário confirmar
    if (confirmacao) {
      setTaskList(taskList.filter(t => t.id !== id));
    }
  };

  const filteredTasks = taskList
    .filter(t => {
      if (filter === "Pendentes") return !t.completed;
      if (filter === "Concluídas") return t.completed;
      return true;
    })
    // 2. Lógica de Busca em Tempo Real
    .filter(t =>
      t.text.toLowerCase().includes(searchTerm.toLowerCase())
    )
    // 1. Ordenação Automática (Comentário original restaurado)
    .sort((a, b) => {
      // Precisasse transformar as prioridades em numeros por conta que a função .sort identifica apenas em numeros
      const peso = { "Alta": 3, "Média": 2, "Baixa": 1 }
      // Aqui o código garante que as tarefas de prioridade "Alta" fiquem sempre no topo. O método sort compara dois itens por vez (a e b) e faz a conta "peso de b - peso de a". Quando o item "b" tem prioridade Alta (peso 3) e o "a" tem prioridade menor, o resultado da conta é positivo, o que faz o item "b" subir. Se o resultado fosse negativo, a prioridade Alta ficaria por último, mas como o peso 3 é o maior, a conta b - a força os itens mais altos para o topo.
      return peso[b.priority] - peso[a.priority]
    });

  return (
    <div className="app-container">
      <header>
        <h1>TaskFlow</h1>
        <p>Gestão de Produtividade</p>
      </header>

      <section className="form-section">
        <form onSubmit={addTask}>
          <input
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            placeholder="Descrição da tarefa..."
          />
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="Baixa">Baixa</option>
            <option value="Média">Média</option>
            <option value="Alta">Alta</option>
          </select>

          {/* O botão muda de nome dependendo se estamos editando ou criando */}
          <button type="submit">
            {editingId ? "Salvar Alteração" : "Criar"}
          </button>

          {/* Botão de Cancelar: Aparece apenas durante a edição */}
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setTaskText(""); }}>
              Cancelar
            </button>
          )}
        </form>
      </section>

      <section className="filter-section">
        {/* 2. Campo de Busca em Tempo Real */}
        <input 
          type="text" 
          value={searchTerm} 
          placeholder='Buscar por tarefa...'
          onChange={(e) => setSearchTerm(e.target.value)} 
          />
        {["Todas", "Pendentes", "Concluídas"].map(f => (
          <button
            key={f}
            className={filter === f ? "active" : ""}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </section>

      <main className="task-grid">
        {filteredTasks.map(item => (
          <div key={item.id} className={`task-card ${item.priority.toLowerCase()} ${item.completed ? 'done' : ''}`}>
            <div className="task-content">
              <h3>{item.text}</h3>
              <span>Prioridade: {item.priority}</span>
              <small>Criada em: {item.createdAt}</small>
            </div>
            <div className="task-actions">
              <button onClick={() => toggleTask(item.id)}>
                {item.completed ? "Reabrir" : "Concluir"}
              </button>
              
              {/* 3. Aciona o modo de edição para esta tarefa específica */}
              <button onClick={() => startEdit(item)}>
                Editar
              </button>

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

export default App;