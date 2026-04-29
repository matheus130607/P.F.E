// Componente principal da aplicação de Lista de Presença
// Gerencia a interface de login, painel do professor e painel de administração

import React, { useState, useEffect, useMemo } from 'react';
import { db, appId } from './firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  addDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { 
  Users, 
  UserCheck, 
  BookOpen, 
  LogOut, 
  Download, 
  Check, 
  X, 
  UserPlus, 
  Trash2, 
  Calendar, 
  Link as LinkIcon, 
  Save 
} from 'lucide-react';
import SenaiLogo from './components/SenaiLogo';

// Data atual formatada (YYYY-MM-DD) para uso nos registros de presença
const todayStr = new Date().toISOString().split('T')[0];

export default function App() {
  // Estados do Firebase Auth
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Estados dos Dados (carregados do Firestore)
  const [appUsers, setAppUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [config, setConfig] = useState({ webhookUrl: '' });
  const [dataLoading, setDataLoading] = useState(true);

  // Estado da Sessão (Usuário Logado no App)
  const [loggedInUser, setLoggedInUser] = useState(null);

  // Estados da UI (Login)
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Estados da UI (Admin)
  const [activeTab, setActiveTab] = useState('turmas');
  const [newClassName, setNewClassName] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentCpf, setNewStudentCpf] = useState('');
  const [selectedClassForStudent, setSelectedClassForStudent] = useState('');
  const [newTeacherUsername, setNewTeacherUsername] = useState('');
  const [newTeacherPassword, setNewTeacherPassword] = useState('');
  const [selectedClassForTeacher, setSelectedClassForTeacher] = useState('');
  const [webhookInput, setWebhookInput] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  // 1. Inicializar Autenticação do Firebase
  useEffect(() => {
    const { initializeApp } = require('firebase/app');
    const { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } = require('firebase/auth');
    
    const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Erro de autenticação:", error);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Carregar Dados do Firestore (Apenas se autenticado)
  useEffect(() => {
    if (!firebaseUser) return;

    const usersRef = collection(db, 'artifacts', appId, 'public', 'data', 'appUsers');
    const classesRef = collection(db, 'artifacts', appId, 'public', 'data', 'classes');
    const studentsRef = collection(db, 'artifacts', appId, 'public', 'data', 'students');
    const attendanceRef = collection(db, 'artifacts', appId, 'public', 'data', 'attendance');
    const configRef = doc(db, 'artifacts', appId, 'public', 'data', 'config', 'settings');

    let isInitialLoad = true;

    const unsubUsers = onSnapshot(usersRef, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAppUsers(usersData);
      if (isInitialLoad && usersData.length === 0) {
        addDoc(usersRef, { username: 'admin', password: 'admin', role: 'admin' });
      }
      isInitialLoad = false;
    }, (err) => console.error("Erro users:", err));

    const unsubClasses = onSnapshot(classesRef, (snapshot) => {
      setClasses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error("Erro classes:", err));

    const unsubStudents = onSnapshot(studentsRef, (snapshot) => {
      setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error("Erro students:", err));

    const unsubAttendance = onSnapshot(attendanceRef, (snapshot) => {
      setAttendance(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setDataLoading(false);
    }, (err) => console.error("Erro attendance:", err));

    const unsubConfig = onSnapshot(configRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setConfig(data);
        setWebhookInput(data.webhookUrl || '');
      }
    }, (err) => console.error("Erro config:", err));

    return () => {
      unsubUsers(); unsubClasses(); unsubStudents(); unsubAttendance(); unsubConfig();
    };
  }, [firebaseUser]);

  // --- Funções de Ação ---

  // Realiza o login do usuário verificando credenciais
  const handleLogin = (e) => {
    e.preventDefault();
    const user = appUsers.find(u => u.username === loginUsername && u.password === loginPassword);
    if (user) {
      setLoggedInUser(user);
      setLoginError(''); setLoginUsername(''); setLoginPassword('');
    } else {
      setLoginError('Usuário ou senha inválidos.');
    }
  };

  // Realiza o logout do usuário
  const handleLogout = () => {
    setLoggedInUser(null);
    setActiveTab('turmas');
  };

  // Adiciona uma nova turma ao banco de dados
  const addClass = async () => {
    if (!newClassName.trim()) return;
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'classes'), { name: newClassName });
    setNewClassName('');
  };

  // Remove uma turma do banco de dados
  const deleteClass = async (id) => {
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'classes', id));
  };

  // Adiciona um novo aluno ao banco de dados
  const addStudent = async () => {
    if (!newStudentName.trim() || !selectedClassForStudent) return;
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'students'), { 
      name: newStudentName, cpf: newStudentCpf, classId: selectedClassForStudent 
    });
    setNewStudentName(''); setNewStudentCpf('');
  };

  // Remove um aluno do banco de dados
  const deleteStudent = async (id) => {
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', id));
  };

  // Adiciona um novo professor ao banco de dados
  const addTeacher = async () => {
    if (!newTeacherUsername.trim() || !newTeacherPassword.trim() || !selectedClassForTeacher) return;
    if (appUsers.some(u => u.username === newTeacherUsername)) return;
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'appUsers'), { 
      username: newTeacherUsername, password: newTeacherPassword, role: 'teacher', classId: selectedClassForTeacher
    });
    setNewTeacherUsername(''); setNewTeacherPassword('');
  };

  // Remove um professor do banco de dados
  const deleteTeacher = async (id) => {
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'appUsers', id));
  };

  // Salva a configuração do webhook no banco de dados
  const saveWebhookConfig = async () => {
    const configRef = doc(db, 'artifacts', appId, 'public', 'data', 'config', 'settings');
    await setDoc(configRef, { webhookUrl: webhookInput }, { merge: true });
    setSaveMessage('Configurações salvas com sucesso!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  // Registra a presença de um aluno (presente ou ausente)
  const markAttendance = async (studentId, classId, status) => {
    const docId = `${studentId}_${todayStr}`;
    const attendanceDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'attendance', docId);
    
    // 1. Salva no Firebase (Backup em nuvem do sistema)
    await setDoc(attendanceDocRef, {
      studentId, classId, date: todayStr, status: status, timestamp: new Date().toISOString()
    });

    // 2. Envia para o Excel Online / Google Sheets via Webhook
    if (config.webhookUrl) {
      const student = students.find(s => s.id === studentId);
      const cls = classes.find(c => c.id === classId);
      
      const payload = {
        data: new Date().toLocaleDateString('pt-BR'),
        turma: cls ? cls.name : 'Desconhecida',
        aluno: student ? student.name : 'Desconhecido',
        cpf: student?.cpf || 'Não informado',
        status: status === 'presente' ? 'Presente' : 'Falta',
        registro_id: docId
      };

      try {
        await fetch(config.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (error) {
        console.error("Falha ao enviar para o Excel via Webhook:", error);
      }
    }
  };

  // Exporta os dados de presença para um arquivo CSV
  const exportToCSV = (classIdFilter = null) => {
    let csvContent = "Data,Turma,Aluno,CPF,Status\n";
    let recordsToExport = attendance;
    if (classIdFilter && typeof classIdFilter === 'string') {
      recordsToExport = attendance.filter(a => a.classId === classIdFilter);
    }
    const sortedAttendance = [...recordsToExport].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedAttendance.forEach(record => {
      const student = students.find(s => s.id === record.studentId);
      const cls = classes.find(c => c.id === record.classId);
      const data = record.date;
      const turma = cls ? cls.name : 'Desconhecida';
      const aluno = student ? student.name : 'Desconhecido';
      const cpf = student && student.cpf ? student.cpf : '-';
      const status = record.status === 'presente' ? 'Presente' : 'Ausente';
      csvContent += `${data},${turma},${aluno},${cpf},${status}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "relatorio_presenca.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Formata o CPF enquanto o usuário digita (máscara de entrada)
  const handleCpfChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 9) value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    else if (value.length > 6) value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
    else if (value.length > 3) value = value.replace(/(\d{3})(\d{1,3})/, "$1.$2");
    setNewStudentCpf(value);
  };

  // --- Renderizadores ---
  
  // Tela de carregamento enquanto autentica
  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // TELA DE LOGIN
  if (!loggedInUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-gray-100 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-4 border-red-600">
          <div className="flex justify-center mb-8">
            <SenaiLogo className="h-16 w-auto shadow-sm rounded" />
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Portal Acadêmico</h2>
          <p className="text-center text-gray-500 mb-6">Controle de Presença</p>
          
          {loginError && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm mb-4 text-center border border-red-200">
              {loginError}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
              <input 
                type="text" 
                value={loginUsername} 
                onChange={(e) => setLoginUsername(e.target.value)} 
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition" 
                placeholder="admin ou professor" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input 
                type="password" 
                value={loginPassword} 
                onChange={(e) => setLoginPassword(e.target.value)} 
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition" 
                placeholder="••••••••" 
                required 
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-sm"
            >
              Acessar Sistema
            </button>
          </form>
        </div>
      </div>
    );
  }

  // TELA DO PROFESSOR
  if (loggedInUser.role === 'teacher') {
    const myClass = classes.find(c => c.id === loggedInUser.classId);
    const myStudents = students.filter(s => s.classId === loggedInUser.classId);

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white text-gray-800 p-4 shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <SenaiLogo className="h-10 w-auto rounded" />
              <h1 className="text-xl font-bold hidden sm:block border-l-2 border-gray-300 pl-4">Portal do Professor</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm bg-gray-100 text-gray-700 px-4 py-1.5 rounded-full font-medium border border-gray-200">
                {loggedInUser.username}
              </span>
              <button 
                onClick={handleLogout} 
                className="text-gray-500 hover:text-red-600 transition flex items-center gap-1"
              >
                <LogOut size={20} /> 
                <span className="hidden sm:inline text-sm">Sair</span>
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto p-4 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 text-gray-800 mb-2">
                <BookOpen size={24} className="text-red-600" />
                <h2 className="text-2xl font-bold">Turma: {myClass ? myClass.name : 'Não encontrada'}</h2>
              </div>
              <div className="flex items-center gap-2 text-gray-500 font-medium">
                <Calendar size={18} />
                <span>Data: {new Date().toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
            <button 
              onClick={() => exportToCSV(loggedInUser.classId)} 
              className="w-full md:w-auto bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2"
            >
              <Download size={18}/> 
              Cópia de Segurança (CSV)
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-100 border-b font-bold text-gray-700 flex justify-between uppercase text-sm">
              <span>Alunos da Turma ({myStudents.length})</span>
              <span>Chamada</span>
            </div>
            {myStudents.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Nenhum aluno cadastrado nesta turma.</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {myStudents.map(student => {
                  const record = attendance.find(a => a.studentId === student.id && a.date === todayStr);
                  const isPresent = record?.status === 'presente';
                  const isAbsent = record?.status === 'ausente';

                  return (
                    <li key={student.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-800">{student.name}</span>
                        <span className="text-sm text-gray-500 font-medium">CPF: {student.cpf || 'Não informado'}</span>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto">
                        <button 
                          onClick={() => markAttendance(student.id, student.classId, 'presente')} 
                          className={`flex-1 md:flex-none flex items-center justify-center gap-1 px-4 py-2.5 rounded-lg font-medium transition ${isPresent ? 'bg-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-700'}`}
                        >
                          <Check size={18} /> Presente
                        </button>
                        <button 
                          onClick={() => markAttendance(student.id, student.classId, 'ausente')} 
                          className={`flex-1 md:flex-none flex items-center justify-center gap-1 px-4 py-2.5 rounded-lg font-medium transition ${isAbsent ? 'bg-red-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-700'}`}
                        >
                          <X size={18} /> Falta
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </main>
      </div>
    );
  }

  // TELA DO ADMINISTRADOR
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white text-gray-800 p-4 shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <SenaiLogo className="h-10 w-auto rounded" />
            <h1 className="text-xl font-bold hidden sm:block border-l-2 border-gray-300 pl-4">Painel do Gestor</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm bg-gray-100 text-gray-700 px-4 py-1.5 rounded-full font-medium border border-gray-200">
              {loggedInUser.username}
            </span>
            <button 
              onClick={handleLogout} 
              className="text-gray-500 hover:text-red-600 transition flex items-center gap-1"
            >
              <LogOut size={20} /> 
              <span className="hidden sm:inline text-sm">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 py-8 flex flex-col md:flex-row gap-6">
        {/* Menu Lateral Admin */}
        <aside className="w-full md:w-64 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-shrink-0">
          <nav className="flex flex-col">
            <button 
              onClick={() => setActiveTab('turmas')} 
              className={`p-4 text-left font-semibold flex items-center gap-3 transition ${activeTab === 'turmas' ? 'bg-red-50 text-red-700 border-l-4 border-red-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <BookOpen size={20} /> Turmas
            </button>
            <button 
              onClick={() => setActiveTab('professores')} 
              className={`p-4 text-left font-semibold flex items-center gap-3 transition ${activeTab === 'professores' ? 'bg-red-50 text-red-700 border-l-4 border-red-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <UserCheck size={20} /> Professores
            </button>
            <button 
              onClick={() => setActiveTab('alunos')} 
              className={`p-4 text-left font-semibold flex items-center gap-3 transition ${activeTab === 'alunos' ? 'bg-red-50 text-red-700 border-l-4 border-red-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Users size={20} /> Alunos
            </button>
            <button 
              onClick={() => setActiveTab('relatorios')} 
              className={`p-4 text-left font-semibold flex items-center gap-3 transition ${activeTab === 'relatorios' ? 'bg-red-50 text-red-700 border-l-4 border-red-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Download size={20} /> Relatórios
            </button>
            <button 
              onClick={() => setActiveTab('integracoes')} 
              className={`p-4 text-left font-semibold flex items-center gap-3 transition ${activeTab === 'integracoes' ? 'bg-red-50 text-red-700 border-l-4 border-red-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <LinkIcon size={20} /> Integrações na Nuvem
            </button>
          </nav>
        </aside>

        {/* Conteúdo Admin */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-hidden">
          
          {/* TAB: TURMAS */}
          {activeTab === 'turmas' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Gerenciar Turmas</h2>
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <input 
                  type="text" 
                  value={newClassName} 
                  onChange={(e) => setNewClassName(e.target.value)} 
                  placeholder="Nome da nova turma (ex: Téc. Eletromecânica)" 
                  className="flex-1 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                />
                <button 
                  onClick={addClass} 
                  className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold transition shadow-sm w-full sm:w-auto"
                >
                  Criar Turma
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classes.map(cls => (
                  <div key={cls.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center bg-gray-50 hover:border-red-300 transition">
                    <span className="font-semibold text-gray-800">{cls.name}</span>
                    <button 
                      onClick={() => deleteClass(cls.id)} 
                      className="text-gray-400 hover:text-red-600 p-2 transition rounded-full hover:bg-red-50"
                    >
                      <Trash2 size={18}/>
                    </button>
                  </div>
                ))}
                {classes.length === 0 && <p className="text-gray-500 col-span-full">Nenhuma turma cadastrada no sistema.</p>}
              </div>
            </div>
          )}

          {/* TAB: PROFESSORES */}
          {activeTab === 'professores' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Equipe Docente</h2>
              <div className="bg-gray-50 p-5 rounded-xl mb-8 border border-gray-200">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <UserPlus size={18} className="text-red-600"/> 
                  Cadastrar Professor
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <input 
                    type="text" 
                    value={newTeacherUsername} 
                    onChange={(e) => setNewTeacherUsername(e.target.value)} 
                    placeholder="Usuário de acesso" 
                    className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  />
                  <input 
                    type="text" 
                    value={newTeacherPassword} 
                    onChange={(e) => setNewTeacherPassword(e.target.value)} 
                    placeholder="Senha de acesso" 
                    className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  />
                  <select 
                    value={selectedClassForTeacher} 
                    onChange={(e) => setSelectedClassForTeacher(e.target.value)} 
                    className="border border-gray-300 rounded-lg p-3 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Atribuir a uma Turma...</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <button 
                  onClick={addTeacher} 
                  className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2.5 rounded-lg font-semibold transition shadow-sm w-full md:w-auto"
                >
                  Registrar Professor
                </button>
              </div>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 uppercase text-xs font-bold">
                      <th className="p-4 border-b">Usuário</th>
                      <th className="p-4 border-b">Senha</th>
                      <th className="p-4 border-b">Turma Atribuída</th>
                      <th className="p-4 border-b text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appUsers.filter(u => u.role === 'teacher').map(teacher => {
                      const assignedClass = classes.find(c => c.id === teacher.classId);
                      return (
                        <tr key={teacher.id} className="border-b hover:bg-gray-50">
                          <td className="p-4 font-semibold text-gray-800">{teacher.username}</td>
                          <td className="p-4 text-gray-500 font-mono text-sm">{teacher.password}</td>
                          <td className="p-4">
                            <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-xs font-bold">
                              {assignedClass ? assignedClass.name : 'Turma Removida'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button 
                              onClick={() => deleteTeacher(teacher.id)} 
                              className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition"
                            >
                              <Trash2 size={18}/>
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: ALUNOS */}
          {activeTab === 'alunos' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Quadro de Alunos</h2>
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 mb-8">
                 <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                   <UserPlus size={18} className="text-red-600"/> 
                   Matricular Aluno
                 </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <select 
                    value={selectedClassForStudent} 
                    onChange={(e) => setSelectedClassForStudent(e.target.value)} 
                    className="border border-gray-300 rounded-lg p-3 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Selecione a Turma...</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <input 
                    type="text" 
                    value={newStudentName} 
                    onChange={(e) => setNewStudentName(e.target.value)} 
                    placeholder="Nome Completo do Aluno" 
                    className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  />
                  <input 
                    type="text" 
                    value={newStudentCpf} 
                    onChange={handleCpfChange} 
                    maxLength="14" 
                    placeholder="CPF (000.000.000-00)" 
                    className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  />
                </div>
                <button 
                  onClick={addStudent} 
                  className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2.5 rounded-lg font-semibold transition shadow-sm w-full md:w-auto"
                >
                  Efetuar Matrícula
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {classes.map(cls => {
                  const classStudents = students.filter(s => s.classId === cls.id);
                  return (
                    <div key={cls.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                      <div className="bg-gray-100 p-4 font-bold text-gray-800 border-b flex justify-between items-center">
                        {cls.name} 
                        <span className="text-sm bg-gray-300 text-gray-800 px-3 py-1 rounded-full">
                          {classStudents.length}
                        </span>
                      </div>
                      <ul className="divide-y divide-gray-100 bg-white max-h-64 overflow-y-auto">
                        {classStudents.map(student => (
                          <li key={student.id} className="p-4 flex justify-between items-center text-sm hover:bg-gray-50 transition">
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-800">{student.name}</span>
                              <span className="text-gray-500 font-medium text-xs mt-0.5">CPF: {student.cpf || 'Não informado'}</span>
                            </div>
                            <button 
                              onClick={() => deleteStudent(student.id)} 
                              className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition"
                            >
                              <Trash2 size={18}/>
                            </button>
                          </li>
                        ))}
                        {classStudents.length === 0 && (
                          <li className="p-6 text-sm text-center text-gray-400 font-medium">Turma vazia.</li>
                        )}
                      </ul>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* TAB: RELATORIOS */}
          {activeTab === 'relatorios' && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Visualização de Registros</h2>
                <button 
                  onClick={() => exportToCSV()} 
                  className="w-full sm:w-auto bg-gray-800 hover:bg-gray-900 text-white px-5 py-2.5 rounded-lg font-semibold transition shadow-sm flex items-center justify-center gap-2"
                >
                  <Download size={18}/> 
                  Baixar Cópia Local (CSV)
                </button>
              </div>
              <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm mt-4">
                <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 uppercase text-xs font-bold">
                      <th className="p-4 border-b">Data</th>
                      <th className="p-4 border-b">Turma</th>
                      <th className="p-4 border-b">Aluno</th>
                      <th className="p-4 border-b">CPF</th>
                      <th className="p-4 border-b text-center">Situação</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {attendance.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 50).map(record => {
                      const student = students.find(s => s.id === record.studentId);
                      const cls = classes.find(c => c.id === record.classId);
                      return (
                        <tr key={record.id} className="border-b hover:bg-gray-50 transition">
                          <td className="p-4 font-medium text-gray-600">
                            {new Date(record.date).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="p-4 font-semibold text-gray-800">{cls?.name || '-'}</td>
                          <td className="p-4 font-medium">{student?.name || '-'}</td>
                          <td className="p-4 text-gray-500">{student?.cpf || '-'}</td>
                          <td className="p-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${record.status === 'presente' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {record.status === 'presente' ? 'Presente' : 'Falta'}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                    {attendance.length === 0 && (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-gray-500 font-medium">
                          Nenhum registro encontrado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: INTEGRAÇÕES */}
          {activeTab === 'integracoes' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Sincronização com Excel Online</h2>
              <p className="text-gray-600 mb-6">
                Configure o sistema para inserir as presenças e faltas 
                <strong className="text-gray-800">diretamente em um único arquivo na nuvem</strong>, 
                sem precisar baixar novos relatórios.
              </p>
              
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-2">Como configurar:</h3>
                <ol className="list-decimal ml-5 text-sm text-gray-700 mb-6 space-y-2">
                  <li>Crie uma automação em ferramentas como <strong>Make.com</strong> ou <strong>Zapier</strong>.</li>
                  <li>Escolha o gatilho "Webhook" (Catch Hook) e copie a URL gerada pela ferramenta.</li>
                  <li>Cole essa URL no campo abaixo e salve.</li>
                  <li>Na sua ferramenta de automação, configure para que ao receber os dados, ele realize a ação <strong>"Add Row in Microsoft Excel"</strong> (Adicionar linha).</li>
                </ol>

                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">URL do Webhook (Zapier, Make, etc):</label>
                  <input 
                    type="url" 
                    value={webhookInput}
                    onChange={(e) => setWebhookInput(e.target.value)}
                    placeholder="https://hook.make.com/..." 
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <button 
                    onClick={saveWebhookConfig} 
                    className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2.5 rounded-lg font-semibold transition shadow-sm flex items-center gap-2"
                  >
                    <Save size={18}/> 
                    Salvar Integração
                  </button>
                  {saveMessage && <span className="text-green-600 font-medium text-sm">{saveMessage}</span>}
                </div>
              </div>

              <div className="mt-6 bg-blue-50 border border-blue-100 p-4 rounded-lg text-sm text-blue-800">
                <strong>Informação Técnica:</strong> Quando a integração estiver ativa, toda vez que um professor clicar em "Presente" ou "Falta", o sistema fará uma requisição POST enviando os seguintes dados: <code>data</code>, <code>turma</code>, <code>aluno</code>, <code>cpf</code> e <code>status</code>.
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );

// ...existing code...
}