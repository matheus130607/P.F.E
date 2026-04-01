import React, { useState, useEffect } from 'react';

// --- DEFINIÇÃO DOS COMPONENTES (USANDO FUNCTION) ---

/**
 * 1. COMPONENTE: Header
 * Responsável pela identidade visual no topo da página.
 * Recebe a prop 'titulo' para exibição dinâmica.
 */
export function Header({ titulo }) {
  return (
    <header style={{
      background: '#646cff', padding: '20px', color: 'white',
      textAlign: 'center'
    }}>
      <h1>{titulo}</h1>
    </header>
  );
}

/**
 * 2. COMPONENTE: InputUsuario
 * Um campo de entrada "controlado". Ele não guarda o valor sozinho;
 * ele informa ao App (pai) o que o usuário digita via 'setNome'.
 */
export function InputUsuario({ nome, setNome }) {
  return (
    <div style={{ margin: '20px 0' }}>
      <label>Digite seu nome: </label>
      <input
        type="text"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Seu nome aqui..."
        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
      />
    </div>
  );
}

/**
 * 3. COMPONENTE: CardSaudacao
 * Componente de exibição (UI). Ele reage ao nome digitado e 
 * muda suas cores dependendo se o 'temaEscuro' é verdadeiro ou falso.
 */
export function CardSaudacao({ nome, temaEscuro }) {
  const estilo = {
    padding: '15px',
    borderRadius: '8px',
    backgroundColor: temaEscuro ? '#333' : '#f9f9f9',
    color: temaEscuro ? '#fff' : '#000',
    marginTop: '10px',
    border: '1px solid #ddd'
  };

  return (
    <div style={estilo}>
      <h3>Olá, {nome || 'Visitante'}!</h3>
      <p>Bem-vindo ao exercício de componentes com Vite e Functions.</p>
    </div>
  );
}

/**
 * 4. COMPONENTE: ContadorCliques
 * Gerencia a lógica visual do contador. Quando o botão é clicado,
 * ele chama a função 'setCliques' para atualizar o estado no componente pai.
 */
export function ContadorCliques({ cliques, setCliques }) {
  return (
    <div style={{
      padding: '15px', border: '1px solid #646cff', marginTop:
        '10px', borderRadius: '8px'
    }}>
      <p>Botão clicado <strong>{cliques}</strong> vezes</p>
      <button onClick={function () { setCliques(cliques + 1) }}>
        Incrementar
      </button>
    </div>
  );
}

/**
 * 5. COMPONENTE: ThemeToggle
 * Um botão especializado em alternar entre os modos claro e escuro.
 * Ele inverte o valor booleano do estado 'dark'.
 */
export function ThemeToggle({ dark, setDark }) {
  return (
    <button onClick={function () { setDark(!dark) }} style={{
      marginTop: '10px'
    }}>
      Mudar para modo {dark ? 'Claro' : 'Escuro'}
    </button>
  );
}

/**
 * 6. COMPONENTE: ListaRecursos
 * Componente funcional que utiliza o método .map() para transformar
 * um array de strings em uma lista de elementos HTML (<li>).
 */
export function ListaRecursos({ itens }) {
  return (
    <ul style={{ textAlign: 'left', display: 'inline-block' }}>
      {itens.map(function (item, index) {
        return <li key={index} style={{ marginBottom: '5px' }}>{item}</li>;
      })}
    </ul>
  );
}

// --- COMPONENTE PRINCIPAL ---

/**
 * 7. COMPONENTE: App (Raiz)
 * O componente principal que orquestra tudo. Ele detém o "Estado da Aplicação"
 * e distribui as informações para os outros 6 componentes via props.
 */
export default function App() {
  const [nome, setNome] = useState('');
  const [cliques, setCliques] = useState(0);
  const [temaEscuro, setTemaEscuro] = useState(false);

  const recursosReact = ['Vite', 'Function Components', 'Named Exports',
    'useState', 'useEffect', 'Props'];

  // Hook useEffect para sincronizar o contador com o título da aba
  useEffect(function () {
    document.title = "Cliques: " + cliques;
  }, [cliques]);

  const containerStyle = {
    fontFamily: 'Inter, system-ui, Arial, sans-serif',
    textAlign: 'center',
    minHeight: '100vh',
    backgroundColor: temaEscuro ? '#242424' : '#ffffff',
    color: temaEscuro ? '#ffffff' : '#213547',
    transition: '0.25s'
  };

  return (
    <div style={containerStyle}>
      {/* Chamada do Componente 1 */}
      <Header titulo="Exercício React com Functions" />

      <main style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Chamada do Componente 2 */}
        <InputUsuario nome={nome} setNome={setNome} />

        {/* Chamada do Componente 3 */}
        <CardSaudacao nome={nome} temaEscuro={temaEscuro} />

        <div style={{
          display: 'flex', justifyContent: 'center', gap: '20px',
          alignItems: 'center', flexWrap: 'wrap'
        }}>
          {/* Chamada do Componente 4 */}
          <ContadorCliques cliques={cliques} setCliques={setCliques} />
          
          {/* Chamada do Componente 5 */}
          <ThemeToggle dark={temaEscuro} setDark={setTemaEscuro} />
        </div>

        <div style={{ marginTop: '30px' }}>
          <h4>Conceitos chave identificados:</h4>
          
          {/* Chamada do Componente 6 */}
          <ListaRecursos itens={recursosReact} />
        </div>
      </main>
    </div>
  );
}