// Componente de Logo do SENAI - separated for reusability
// Renderiza o logo vetorial do SENAI em formato SVG

const SenaiLogo = ({ className }) => (
  // SVG com viewBox definindo a área de desenho (400x100)
  <svg viewBox="0 0 400 100" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Fundo vermelho do logo */}
    <rect width="400" height="100" fill="#FF0000" />
    
    {/* Grupo de linhas horizontais à esquerda (representando as listras do logo) */}
    <g stroke="white" strokeWidth="5">
      <line x1="0" y1="25" x2="35" y2="25" />
      <line x1="0" y1="42" x2="35" y2="42" />
      <line x1="0" y1="59" x2="35" y2="59" />
      <line x1="0" y1="76" x2="35" y2="76" />
    </g>
    
    {/* Texto "SENAI" centralizado */}
    <text 
      x="200" 
      y="76" 
      fill="white" 
      fontFamily="Arial, Helvetica, sans-serif" 
      fontSize="68" 
      fontWeight="900" 
      fontStyle="italic" 
      textAnchor="middle" 
      letterSpacing="-1"
    >
      SENAI
    </text>
    
    {/* Grupo de linhas horizontais à direita (espelho da esquerda) */}
    <g stroke="white" strokeWidth="5">
      <line x1="365" y1="25" x2="400" y2="25" />
      <line x1="365" y1="42" x2="400" y2="42" />
      <line x1="365" y1="59" x2="400" y2="59" />
      <line x1="365" y1="76" x2="400" y2="76" />
    </g>
  </svg>
);

// Exporta o componente para uso em outros arquivos
export default SenaiLogo;