import React, { useState, useEffect } from 'react';
import { 
  Menu, Search, Mic, Video, Bell, User, Home, 
  PlaySquare, Clock, ThumbsUp, Flame, Music, 
  Gamepad2, Trophy, MonitorPlay, X, MoreHorizontal, Share, ArrowDownToLine, HeartPulse 
} from 'lucide-react';
import './App.css';

// ==========================================
// CONFIGURAÇÃO DA API DO YOUTUBE
// ==========================================
// MANTENHA SUA CHAVE AQUI SE ESTIVER USANDO
const YOUTUBE_API_KEY = "AIzaSyAA2niJGFsfe_FQFVTmEayP1z_F8crXQPA"; 

// IDs REAIS para o Mock (Dados simulados) funcionarem no Player
const mockVideos = [
  {
    id: "dQw4w9WgXcQ", 
    snippet: {
      title: "Como criar um Clone do YouTube com React e Tailwind CSS - Passo a Passo Completo",
      channelTitle: "Programador de Elite",
      publishedAt: "2023-10-15T14:00:00Z",
      thumbnails: { medium: { url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=640&q=80" } }
    },
    statistics: { viewCount: "1540000" }
  },
  {
    id: "jfKfPfyJRdk",
    snippet: {
      title: "Lofi Hip Hop Radio - Beats to Relax/Study to | 24/7 Live Stream",
      channelTitle: "Lofi Girl",
      publishedAt: "2024-02-20T10:00:00Z",
      thumbnails: { medium: { url: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=640&q=80" } }
    },
    statistics: { viewCount: "85400000" }
  },
  {
    id: "6n3pFFPSlW4",
    snippet: {
      title: "Melhores Momentos: Entrevista Exclusiva | Podcast #45",
      channelTitle: "Flow Podcast",
      publishedAt: "2024-03-10T23:00:00Z",
      thumbnails: { medium: { url: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?ixlib=rb-4.0.3&auto=format&fit=crop&w=640&q=80" } }
    },
    statistics: { viewCount: "2100000" }
  },
  {
    id: "hHW1oY26kxQ",
    snippet: {
      title: "As 10 Cidades Mais Bonitas da Europa para Visitar no Verão",
      channelTitle: "Viajando Pelo Mundo",
      publishedAt: "2023-12-20T08:00:00Z",
      thumbnails: { medium: { url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=640&q=80" } }
    },
    statistics: { viewCount: "3400000" }
  }
];

const categories = ["Tudo", "Gaming", "Música", "Ao vivo", "Programação", "Podcasts", "Tecnologia"];

// ==========================================
// FUNÇÕES UTILITÁRIAS
// ==========================================
const formatViews = (viewCount) => {
  if (!viewCount) return "0";
  const num = parseInt(viewCount);
  if (num >= 1000000) return (num / 1000000).toFixed(1) + ' mi';
  if (num >= 1000) return (num / 1000).toFixed(1) + ' mil';
  return num.toString();
};

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' anos atrás';
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' dias atrás';
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' horas atrás';
  return 'Recentemente';
};

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
export default function App() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Tudo");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null); // ESTADO DO PLAYER

  useEffect(() => {
    fetchVideos(activeCategory === "Tudo" ? "" : activeCategory);
  }, [activeCategory]);

  const fetchVideos = async (query = "") => {
    setLoading(true);
    if (!YOUTUBE_API_KEY) {
      setTimeout(() => {
        let filteredVideos = mockVideos;
        if (query) {
          const lowerQuery = query.toLowerCase();
          filteredVideos = mockVideos.filter(v => v.snippet.title.toLowerCase().includes(lowerQuery));
        }
        setVideos(filteredVideos);
        setLoading(false);
      }, 500);
      return;
    }

    try {
      let url = query 
        ? `https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=16&q=${query}&type=video&key=${YOUTUBE_API_KEY}`
        : `https://youtube.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&maxResults=16&regionCode=BR&key=${YOUTUBE_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();
      const formattedVideos = data.items.map(item => ({
        id: item.id?.videoId || item.id,
        snippet: item.snippet,
        statistics: item.statistics || { viewCount: Math.floor(Math.random() * 100000).toString() }
      }));
      setVideos(formattedVideos);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Navegador sem suporte!");
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      fetchVideos(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#0f0f0f] text-white overflow-hidden">
      
      {/* HEADER */}
      <header className="flex items-center justify-between px-4 h-14 bg-[#0f0f0f] sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-[#272727] rounded-full">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-1 cursor-pointer">
            <div className="bg-red-600 p-1 rounded-lg"><MonitorPlay size={20} fill="white" /></div>
            <span className="text-xl font-bold tracking-tighter">YouTube</span>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); fetchVideos(searchQuery); }} className="flex items-center flex-1 max-w-[600px] ml-10">
          <div className="flex w-full items-center border border-[#303030] rounded-l-full px-4 py-2 bg-[#121212] focus-within:border-blue-500">
            <input 
              type="text" placeholder="Pesquisar" value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent outline-none text-white"
            />
          </div>
          <button className="px-5 py-2.5 bg-[#222222] border border-l-0 border-[#303030] rounded-r-full hover:bg-[#303030]">
            <Search size={20} />
          </button>
          <button 
            type="button" onClick={startListening}
            className={`ml-4 p-2.5 rounded-full transition-all ${isListening ? 'bg-red-600 animate-pulse' : 'bg-[#181818] hover:bg-[#303030]'}`}
          >
            <Mic size={20} />
          </button>
        </form>

        <div className="flex items-center gap-4 ml-4">
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center cursor-pointer"><User size={18} /></div>
        </div>
      </header>

      {/* CORPO PRINCIPAL */}
      <div className="flex flex-1 overflow-hidden">
        {isSidebarOpen && (
          <aside className="w-60 bg-[#0f0f0f] overflow-y-auto hidden md:flex flex-col py-3 px-2">
            <SidebarItem icon={<Home size={20}/>} label="Início" active />
            <SidebarItem icon={<MonitorPlay size={20}/>} label="Shorts" />
            <SidebarItem icon={<PlaySquare size={20}/>} label="Inscrições" />
            <hr className="border-[#3f3f3f] my-3" />
            <SidebarItem icon={<Clock size={20}/>} label="Histórico" />
            <SidebarItem icon={<ThumbsUp size={20}/>} label="Gostei" />
          </aside>
        )}

        <main className="flex-1 overflow-y-auto bg-[#0f0f0f] custom-scrollbar">
          <div className="sticky top-0 bg-[#0f0f0f] z-40 py-3 px-4 flex gap-3 overflow-x-auto border-b border-[#272727]">
            {categories.map(c => (
              <button 
                key={c} onClick={() => setActiveCategory(c)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${activeCategory === c ? 'bg-white text-black' : 'bg-[#272727] text-white hover:bg-[#3f3f3f]'}`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
            {loading ? (
              <div className="text-white p-10">Carregando vídeos...</div>
            ) : (
              videos.map((video) => (
                <VideoCard key={video.id} video={video} onClick={(v) => setSelectedVideo(v)} />
              ))
            )}
          </div>
        </main>
      </div>

      {/* PLAYER MODAL REESTRUTURADO (CONFORME IMAGEM 4) */}
      {selectedVideo && (
        <div className="fixed inset-0 z-[100] bg-[#0f0f0f] flex flex-col overflow-y-auto custom-scrollbar">
          
          {/* BARRA SUPERIOR DO MODAL COM BOTÃO FECHAR */}
          <div className="flex items-center justify-between p-4 bg-[#0f0f0f] sticky top-0 z-[110] border-b border-[#272727]">
             <div className="flex items-center gap-1">
                <div className="bg-red-600 p-1 rounded-lg"><MonitorPlay size={20} fill="white" /></div>
                <span className="text-xl font-bold tracking-tighter">YouTube Clone Player</span>
             </div>
             <button 
                onClick={() => setSelectedVideo(null)}
                className="text-white hover:text-red-500 flex items-center gap-2 bg-white/10 p-2 rounded-full"
             >
                <X size={24} />
             </button>
          </div>

          {/* GRID PRINCIPAL: 2 COLUNAS (Player/Info | Lista Lateral) */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr,360px] gap-6 p-4 md:p-6 lg:p-8 xl:p-10 max-w-[1700px] mx-auto w-full">
            
            {/* COLUNA 1: PLAYER + INFORMAÇÕES (ABAIXO) */}
            <div className="flex flex-col gap-4">
                {/* AREA DO PLAYER ASPECT-VIDEO */}
                <div className="w-full aspect-video bg-black shadow-2xl rounded-xl overflow-hidden">
                    <iframe
                      width="100%" height="100%"
                      src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1`}
                      title="Player" frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                </div>

                {/* INFORMAÇÕES DO VÍDEO (CONFORME IMAGEM 4) */}
                <div className="flex flex-col gap-3 mt-2">
                    {/* TÍTULO GRANDE */}
                    <h1 className="text-2xl font-bold leading-tight">{selectedVideo.snippet.title}</h1>

                    {/* BARRA DE AÇÕES (CANAL, BOTÕES) */}
                    <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-[#272727]">
                        
                        {/* ESQUERDA: INFOS DO CANAL E INSCREVER-SE */}
                        <div className="flex items-center gap-3">
                            {/* AVATAR DO CANAL (SIMULADO) */}
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-red-500 to-purple-500 flex items-center justify-center text-xl font-bold text-white">
                                {selectedVideo.snippet.channelTitle.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-semibold">{selectedVideo.snippet.channelTitle}</span>
                                <span className="text-sm text-gray-400">1.2 mi de inscritos</span>
                            </div>
                            <button className="ml-4 bg-white text-black px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-200 transition-colors">
                                Inscrever-se
                            </button>
                        </div>

                        {/* DIREITA: BOTÕES DE AÇÃO (LIKE, SHARE, ETC) */}
                        <div className="flex items-center gap-2 bg-[#272727] rounded-full p-1">
                            <button className="flex items-center gap-2.5 px-5 py-2 hover:bg-[#3f3f3f] rounded-l-full border-r border-[#3f3f3f]">
                                <ThumbsUp size={20} />
                                <span>10 mil</span>
                            </button>
                            <button className="flex items-center gap-2.5 px-5 py-2 hover:bg-[#3f3f3f] rounded-r-full">
                                <ThumbsUp size={20} className="rotate-180" />
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                           <button className="flex items-center gap-2.5 px-5 py-2.5 bg-[#272727] hover:bg-[#3f3f3f] rounded-full text-sm font-medium">
                                <Share size={18} /> Compartilhar
                           </button>
                           <button className="flex items-center gap-2.5 px-5 py-2.5 bg-[#272727] hover:bg-[#3f3f3f] rounded-full text-sm font-medium">
                                <ArrowDownToLine size={18} /> Download
                           </button>
                           <button className="p-2.5 bg-[#272727] hover:bg-[#3f3f3f] rounded-full">
                                <MoreHorizontal size={20} />
                           </button>
                        </div>
                    </div>

                    {/* DESCRIÇÃO E ESTATÍSTICAS (BOX CINZA) */}
                    <div className="bg-[#272727] rounded-xl p-4 mt-2">
                        <div className="flex items-center gap-3 text-sm font-semibold text-white mb-2">
                            <span>{formatViews(selectedVideo.statistics?.viewCount)} visualizações</span>
                            <span className="text-[10px]">•</span>
                            <span>Transmitido há {formatTimeAgo(selectedVideo.snippet.publishedAt)}</span>
                        </div>
                        <p className="text-sm text-gray-200 leading-relaxed line-clamp-3 hover:line-clamp-none cursor-pointer">
                            {selectedVideo.snippet.description || `Este é um vídeo incrível criado pelo canal ${selectedVideo.snippet.channelTitle}. Assista até o fim para não perder nenhuma dica e compartilhe com seus amigos! #react #tailwind #clone #youtube`}
                        </p>
                    </div>
                </div>
            </div>

            {/* COLUNA 2: LISTA LATERAL DE PRÓXIMOS VÍDEOS (30%) */}
            <div className="flex flex-col gap-4 xl:max-w-[360px]">
                <h3 className="text-lg font-semibold px-1">Próximos vídeos</h3>
                {videos.filter(v => v.id !== selectedVideo.id).map(v => (
                    <div key={v.id} onClick={() => setSelectedVideo(v)} className="flex gap-3 cursor-pointer group">
                        {/* THUMBNAIL PEQUENA */}
                        <div className="relative aspect-video w-[160px] rounded-lg overflow-hidden flex-shrink-0 bg-[#272727]">
                             <img src={v.snippet.thumbnails?.medium?.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                             <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[11px] px-1 py-0.5 rounded">12:00</div>
                        </div>
                        {/* INFOS PEQUENAS */}
                        <div className="flex flex-col overflow-hidden gap-0.5">
                             <h4 className="text-sm font-medium line-clamp-2 text-white leading-tight group-hover:text-blue-400" title={v.snippet.title}>
                                {v.snippet.title}
                             </h4>
                             <span className="text-xs text-gray-400 mt-1">{v.snippet.channelTitle}</span>
                             <div className="text-xs text-gray-500">
                                {formatViews(v.statistics?.viewCount)} • {formatTimeAgo(v.snippet.publishedAt)}
                             </div>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ESTILOS CUSTOMIZADOS (SCROLLBAR) */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #717171; border-radius: 4px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #a0a0a0; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
      `}} />
    </div>
  );
}

// ==========================================
// COMPONENTES AUXILIARES
// ==========================================

function SidebarItem({ icon, label, active }) {
  return (
    <div className={`flex items-center gap-4 px-3 py-2.5 rounded-xl cursor-pointer ${active ? 'bg-[#272727] font-medium' : 'hover:bg-[#272727]'}`}>
      {icon} <span className="text-sm truncate">{label}</span>
    </div>
  );
}

function VideoCard({ video, onClick }) {
  const { snippet, statistics } = video;
  return (
    <div onClick={() => onClick(video)} className="flex flex-col cursor-pointer group">
      <div className="relative aspect-video rounded-xl overflow-hidden mb-3">
        <img src={snippet.thumbnails?.medium?.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">12:00</div>
      </div>
      <div className="flex gap-3 pr-2">
        {/* AVATAR DO CANAL NO GRID (SIMULADO) */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-red-500 to-purple-500 flex-shrink-0 flex items-center justify-center text-sm font-bold text-white">
            {snippet.channelTitle.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col">
          <h3 className="text-sm font-medium line-clamp-2 text-white leading-tight mb-1" title={snippet.title}>
            {snippet.title}
          </h3>
          <span className="text-sm text-gray-400 hover:text-white transition-colors">
            {snippet.channelTitle}
          </span>
          <div className="text-sm text-gray-400 flex items-center gap-1">
            <span>{formatViews(statistics?.viewCount)}</span>
            <span className="text-[10px]">•</span>
            <span>{formatTimeAgo(snippet.publishedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}