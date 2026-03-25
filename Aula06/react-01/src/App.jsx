import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function Saudacao({nome}){
  return (
    <div style={{backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '8px', marginBottom: '10px'}}>
      <h2 style={{color: '#007bff'}}>Olá, <strong style={{color: 'red'}}>{nome}</strong>!</h2>
      <p>Este componente foi criado separadamente.</p>
    </div>
  );
}
function Lugares(){
  return (
    <div style={{
      backgroundImage: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(https://static.todamateria.com.br/upload/ma/pa/mapa-mundi-og.jpg)",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '10px',
      textAlign: 'center',
      color: 'white'
    }}>
      <h2 style={{
        color: '#a0fce8'
      }}>Lugares para viajar</h2>
      
      <ul style={{
        listStylePosition: 'inside',
        textAlign: 'left',
        margin: '0 auto',
        display: 'inline-block'
      }}>
        <li>Fernando de Noronha - Pernambuco</li>
        <li>Gramado - Rio Grande do Sul</li>
        <li>Jericoacoara - Ceará</li>
        <li>Rio de Janeiro - RJ</li>
        <li>Bonito - Mato Grosso do Sul</li>
        <li>Paris - França</li>
        <li>Orlando - Estados Unidos</li>
        <li>Tóquio - Japão</li>
        <li>Dubai - Emirados Árabes</li>
        <li>Roma - Itália</li>
      </ul>

      <p>Escolha seu próximo destino!</p>
    </div>
  );
}

function Mapa(){
  return (
    <div style={{
      backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(https://static.todamateria.com.br/upload/ma/pa/mapa-mundi-og.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center top', // parte de cima do mapa
      padding: '10px',
      borderRadius: '8px',
      marginBottom: '10px',
      color: 'white'
    }}>
      <h2 style={{color: '#a0fce8'}}>Mapa Mundi</h2>
      
      <p>Conheça um pouco sobre o Mundo que vive!</p>
    </div>
  );
}

function App() {
  return (
    <div>
      <h1>Olá, React!</h1>
      <p>Estou alterando meu primeiro componente</p>

      <div style={{padding: '20px'}}>
        <h1>Minha Primeira Aula de React</h1>
        <hr />

        {/* {3. Aqui nós "chamamos" o componente que criamos} */}
        <Saudacao nome="Matheus"/>
        <Mapa/>
        <Lugares/>
       
        <p>Note que eu posso repetir o componene quantas vezes eu quiser!</p>

      </div>
    </div>
  )
}



export default App