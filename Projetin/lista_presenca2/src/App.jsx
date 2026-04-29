import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, addDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Users, UserCheck, BookOpen, LogOut, Download, Check, X, UserPlus, Trash2, Calendar, Shield, Link as LinkIcon, Save, Pencil } from 'lucide-react';

// --- Componente da Logo do SENAI ---
const SenaiLogo = ({ className }) => (
  <svg viewBox="0 0 400 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="100" fill="#FF0000" />
    <g stroke="white" strokeWidth="5">
      <line x1="0" y1="25" x2="35" y2="25" />
      <line x1="0" y1="42" x2="35" y2="42" />
      <line x1="0" y1="59" x2="35" y2="59" />
      <line x1="0" y1="76" x2="35" y2="76" />
    </g>
    <text x="200" y="76" fill="white" fontFamily="Arial, Helvetica, sans-serif" fontSize="68" fontWeight="900" fontStyle="italic" textAnchor="middle" letterSpacing="-1">SENAI</text>
    <g stroke="white" strokeWidth="5">
      <line x1="365" y1="25" x2="400" y2="25" />
      <line x1="365" y1="42" x2="400" y2="42" />
      <line x1="365" y1="59" x2="400" y2="59" />
      <line x1="365" y1="76" x2="400" y2="76" />
    </g>
  </svg>
);

// --- Inicialização do Firebase na Nuvem ---
const firebaseConfig = {
  apiKey: "AIzaSyAdF_Ct8ZQ3SVFkidt5QN6hPxKd0gXuixA",
  authDomain: "sistema-de-presenca-senai.firebaseapp.com",
  projectId: "sistema-de-presenca-senai",
  storageBucket: "sistema-de-presenca-senai.firebasestorage.app",
  messagingSenderId: "779094337426",
  appId: "1:779094337426:web:8dc9a814a7a3ac0cbbc34b",
  measurementId: "G-05VRZCEL2Y"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'sistema-de-presenca-senai'; 

export default function App() {
  // Estados do Firebase Auth
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authSetupError, setAuthSetupError] = useState('');

  // Estados dos Dados
  const [appUsers, setAppUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  
  const [config, setConfig] = useState({ webhookUrl: 'https://hook.us2.make.com/6qku3z3t8wsrkwgx5n8t1iou3du56mk6' });
  const [dataLoading, setDataLoading] = useState(true);

  // Estado da Sessão
  const [loggedInUser, setLoggedInUser] = useState(null);

  // Estados da UI (Login)
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Estados da UI (Criação)
  const [activeTab, setActiveTab] = useState('turmas');
  const [newClassName, setNewClassName] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentCpf, setNewStudentCpf] = useState('');
  const [selectedClassForStudent, setSelectedClassForStudent] = useState('');
  const [newTeacherUsername, setNewTeacherUsername] = useState('');
  const [newTeacherPassword, setNewTeacherPassword] = useState('');
  const [selectedClassForTeacher, setSelectedClassForTeacher] = useState('');
  const [webhookInput, setWebhookInput] = useState('https://hook.us2.make.com/6qku3z3t8wsrkwgx5n8t1iou3du56mk6');
  const [saveMessage, setSaveMessage] = useState('');

  // Estados de Edição (Turmas)
  const [editingClassId, setEditingClassId] = useState(null);
  const [editClassName, setEditClassName] = useState('');

  // Estados de Edição (Professores)
  const [editingTeacherId, setEditingTeacherId] = useState(null);
  const [editTeacherUsername, setEditTeacherUsername] = useState('');
  const [editTeacherPassword, setEditTeacherPassword] = useState('');
  const [editTeacherClassId, setEditTeacherClassId] = useState('');

  // Estados de Edição (Alunos)
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editStudentName, setEditStudentName] = useState('');
  const [editStudentCpf, setEditStudentCpf] = useState('');
  const [editStudentClassId, setEditStudentClassId] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Erro de autenticação:", error);
        if (error.code === 'auth/configuration-not-found' || error.code === 'auth/operation-not-allowed') {
          setAuthSetupError('A Autenticação Anônima não está ativada. Por favor, vá à consola do Firebase > Authentication > Sign-in method e ative a opção "Anônimo".');
        } else {
          setAuthSetupError('Erro de ligação ao Firebase: ' + error.message);
        }
        setAuthLoading(false);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) setAuthSetupError('');
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

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
    });

    const unsubClasses = onSnapshot(classesRef, (snapshot) => {
      setClasses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubStudents = onSnapshot(studentsRef, (snapshot) => {
      setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubAttendance = onSnapshot(attendanceRef, (snapshot) => {
      setAttendance(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setDataLoading(false);
    });

    const unsubConfig = onSnapshot(configRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().webhookUrl) {
        const data = docSnap.data();
        setConfig(data);
        setWebhookInput(data.webhookUrl);
      }
    });

    return () => {
      unsubUsers(); unsubClasses(); unsubStudents(); unsubAttendance(); unsubConfig();
    };
  }, [firebaseUser]);

  // --- Funções Comuns ---
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

  const handleLogout = () => {
    setLoggedInUser(null);
    setActiveTab('turmas');
  };

  const handleCpfChange = (e, setter) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 9) value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    else if (value.length > 6) value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
    else if (value.length > 3) value = value.replace(/(\d{3})(\d{1,3})/, "$1.$2");
    setter(value);
  };

  // --- Funções: Turmas ---
  const addClass = async () => {
    if (!newClassName.trim()) return;
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'classes'), { name: newClassName });
    setNewClassName('');
  };
  const deleteClass = async (id) => await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'classes', id));
  
  const startEditClass = (cls) => { setEditingClassId(cls.id); setEditClassName(cls.name); };
  const saveEditClass = async (id) => {
    if (!editClassName.trim()) return;
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'classes', id), { name: editClassName });
    setEditingClassId(null);
  };

  // --- Funções: Estudantes ---
  const addStudent = async () => {
    if (!newStudentName.trim() || !selectedClassForStudent) return;
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'students'), { 
      name: newStudentName, cpf: newStudentCpf, classId: selectedClassForStudent 
    });
    setNewStudentName(''); setNewStudentCpf('');
  };
  const deleteStudent = async (id) => await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', id));

  const startEditStudent = (student) => {
    setEditingStudentId(student.id);
    setEditStudentName(student.name);
    setEditStudentCpf(student.cpf || '');
    setEditStudentClassId(student.classId);
  };
  const saveEditStudent = async (id) => {
    if (!editStudentName.trim() || !editStudentClassId) return;
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', id), {
      name: editStudentName, cpf: editStudentCpf, classId: editStudentClassId
    });
    setEditingStudentId(null);
  };

  // --- Funções: Professores ---
  const addTeacher = async () => {
    if (!newTeacherUsername.trim() || !newTeacherPassword.trim() || !selectedClassForTeacher) return;
    if (appUsers.some(u => u.username === newTeacherUsername)) return; 
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'appUsers'), { 
      username: newTeacherUsername, password: newTeacherPassword, role: 'teacher', classId: selectedClassForTeacher
    });
    setNewTeacherUsername(''); setNewTeacherPassword('');
  };
  const deleteTeacher = async (id) => await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'appUsers', id));

  const startEditTeacher = (teacher) => {
    setEditingTeacherId(teacher.id);
    setEditTeacherUsername(teacher.username);
    setEditTeacherPassword(teacher.password);
    setEditTeacherClassId(teacher.classId || '');
  };
  const saveEditTeacher = async (id) => {
    if (!editTeacherUsername.trim() || !editTeacherPassword.trim()) return;
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'appUsers', id), {
      username: editTeacherUsername, password: editTeacherPassword, classId: editTeacherClassId
    });
    setEditingTeacherId(null);
  };

  // --- Funções: Outras ---
  const saveWebhookConfig = async () => {
    const configRef = doc(db, 'artifacts', appId, 'public', 'data', 'config', 'settings');
    await setDoc(configRef, { webhookUrl: webhookInput }, { merge: true });
    setSaveMessage('Integração guardada com sucesso!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const markAttendance = async (studentId, classId, status) => {
    const docId = `${studentId}_${todayStr}`;
    const attendanceDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'attendance', docId);
    
    await setDoc(attendanceDocRef, {
      studentId, classId, date: todayStr, status: status, timestamp: new Date().toISOString()
    });

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
      } catch (error) { console.error("Falha webhook:", error); }
    }
  };

  const exportToCSV = (classIdFilter = null) => {
    let csvContent = "Data,Turma,Aluno,CPF,Status\n";
    let recordsToExport = attendance;
    if (classIdFilter) recordsToExport = attendance.filter(a => a.classId === classIdFilter);
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
    link.setAttribute("download", "relatorio_presencas.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  // --- Renderizadores ---
  if (authSetupError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-lg w-full text-center border-t-4 border-red-600">
          <Shield size={48} className="mx-auto text-red-600 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-4">Ação Necessária no Firebase</h2>
          <p className="text-gray-600 mb-6 font-medium">{authSetupError}</p>
        </div>
      </div>
    );
  }

  if (authLoading || dataLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div></div>;
  }

  // ECRÃ DE LOGIN
  if (!loggedInUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-gray-100 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-4 border-red-600">
          <div className="flex justify-center mb-8"><SenaiLogo className="h-16 w-auto shadow-sm rounded" /></div>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Portal Acadêmico</h2>
          <p className="text-center text-gray-500 mb-6">Controle de Presenças</p>
          {loginError && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm mb-4 text-center border border-red-200">{loginError}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
              <input type="text" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition" placeholder="admin ou professor" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition" placeholder="••••••••" required />
            </div>
            <button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-sm">Acessar Sistema</button>
          </form>
        </div>
      </div>
    );
  }

  // ECRÃ DO PROFESSOR
  if (loggedInUser.role === 'teacher') {
    const myClass = classes.find(c => c.id === loggedInUser.classId);
    const myStudents = students.filter(s => s.classId === loggedInUser.classId);

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white text-gray-800 p-4 shadow-sm border-b border-gray-200">
          {/* Atualizado para max-w-[1400px] para ocupar mais espaço na tela */}
          <div className="w-full max-w-[1400px] mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <SenaiLogo className="h-10 w-auto rounded" />
              <h1 className="text-xl font-bold hidden sm:block border-l-2 border-gray-300 pl-4">Portal do Professor</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm bg-gray-100 text-gray-700 px-4 py-1.5 rounded-full font-medium border border-gray-200">{loggedInUser.username}</span>
              <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 transition flex items-center gap-1">
                <LogOut size={20} /> <span className="hidden sm:inline text-sm">Sair</span>
              </button>
            </div>
          </div>
        </header>

        <main className="w-full max-w-[1400px] mx-auto p-4 py-8">
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
            <button onClick={() => exportToCSV(loggedInUser.classId)} className="w-full md:w-auto bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2">
              <Download size={18}/> Backup Local (CSV)
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-100 border-b font-bold text-gray-700 flex justify-between uppercase text-sm">
              <span>Alunos da Turma ({myStudents.length})</span>
              <span>Chamada</span>
            </div>
            {myStudents.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Nenhum aluno registrado nesta turma.</div>
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
                        <button onClick={() => markAttendance(student.id, student.classId, 'presente')} className={`flex-1 md:flex-none flex items-center justify-center gap-1 px-4 py-2.5 rounded-lg font-medium transition ${isPresent ? 'bg-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-700'}`}>
                          <Check size={18} /> Presente
                        </button>
                        <button onClick={() => markAttendance(student.id, student.classId, 'ausente')} className={`flex-1 md:flex-none flex items-center justify-center gap-1 px-4 py-2.5 rounded-lg font-medium transition ${isAbsent ? 'bg-red-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-700'}`}>
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

  // ECRÃ DO GESTOR
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white text-gray-800 p-4 shadow-sm border-b border-gray-200">
        {/* Largura aumentada de max-w-6xl para max-w-[1400px] */}
        <div className="w-full max-w-[1400px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <SenaiLogo className="h-10 w-auto rounded" />
            <h1 className="text-xl font-bold hidden sm:block border-l-2 border-gray-300 pl-4">Painel do Gestor</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm bg-gray-100 text-gray-700 px-4 py-1.5 rounded-full font-medium border border-gray-200">{loggedInUser.username}</span>
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 transition flex items-center gap-1">
              <LogOut size={20} /> <span className="hidden sm:inline text-sm">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="w-full max-w-[1400px] mx-auto p-4 py-8 flex flex-col md:flex-row gap-6">
        <aside className="w-full md:w-64 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-shrink-0">
          <nav className="flex flex-col">
            <button onClick={() => setActiveTab('turmas')} className={`p-4 text-left font-semibold flex items-center gap-3 transition ${activeTab === 'turmas' ? 'bg-red-50 text-red-700 border-l-4 border-red-700' : 'text-gray-600 hover:bg-gray-50'}`}><BookOpen size={20} /> Turmas</button>
            <button onClick={() => setActiveTab('professores')} className={`p-4 text-left font-semibold flex items-center gap-3 transition ${activeTab === 'professores' ? 'bg-red-50 text-red-700 border-l-4 border-red-700' : 'text-gray-600 hover:bg-gray-50'}`}><UserCheck size={20} /> Professores</button>
            <button onClick={() => setActiveTab('alunos')} className={`p-4 text-left font-semibold flex items-center gap-3 transition ${activeTab === 'alunos' ? 'bg-red-50 text-red-700 border-l-4 border-red-700' : 'text-gray-600 hover:bg-gray-50'}`}><Users size={20} /> Alunos</button>
            <button onClick={() => setActiveTab('relatorios')} className={`p-4 text-left font-semibold flex items-center gap-3 transition ${activeTab === 'relatorios' ? 'bg-red-50 text-red-700 border-l-4 border-red-700' : 'text-gray-600 hover:bg-gray-50'}`}><Download size={20} /> Relatórios</button>
            <button onClick={() => setActiveTab('integracoes')} className={`p-4 text-left font-semibold flex items-center gap-3 transition ${activeTab === 'integracoes' ? 'bg-red-50 text-red-700 border-l-4 border-red-700' : 'text-gray-600 hover:bg-gray-50'}`}><LinkIcon size={20} /> Integrações Google</button>
          </nav>
        </aside>

        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-hidden">
          
          {/* TAB: TURMAS */}
          {activeTab === 'turmas' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Gerenciar Turmas</h2>
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <input type="text" value={newClassName} onChange={(e) => setNewClassName(e.target.value)} placeholder="Nome da nova turma (ex: Téc. Eletromecânica)" className="flex-1 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"/>
                <button onClick={addClass} className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold transition shadow-sm w-full sm:w-auto">Criar Turma</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classes.map(cls => (
                  <div key={cls.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center bg-gray-50 hover:border-blue-300 transition group">
                    {editingClassId === cls.id ? (
                      <div className="flex-1 flex gap-2 items-center">
                        <input type="text" value={editClassName} onChange={e => setEditClassName(e.target.value)} className="flex-1 border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" autoFocus />
                        <button onClick={() => saveEditClass(cls.id)} className="text-green-600 bg-green-100 hover:bg-green-200 p-2 rounded-full transition"><Check size={18}/></button>
                        <button onClick={() => setEditingClassId(null)} className="text-red-600 bg-red-100 hover:bg-red-200 p-2 rounded-full transition"><X size={18}/></button>
                      </div>
                    ) : (
                      <>
                        <span className="font-semibold text-gray-800">{cls.name}</span>
                        <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEditClass(cls)} className="text-gray-400 hover:text-blue-600 p-2 transition rounded-full hover:bg-blue-50"><Pencil size={18}/></button>
                          <button onClick={() => deleteClass(cls.id)} className="text-gray-400 hover:text-red-600 p-2 transition rounded-full hover:bg-red-50"><Trash2 size={18}/></button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {classes.length === 0 && <p className="text-gray-500 col-span-full">Nenhuma turma registrada no sistema.</p>}
              </div>
            </div>
          )}

          {/* TAB: PROFESSORES */}
          {activeTab === 'professores' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Equipe Docente</h2>
              <div className="bg-gray-50 p-5 rounded-xl mb-8 border border-gray-200">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><UserPlus size={18} className="text-red-600"/> Registrar Professor</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <input type="text" value={newTeacherUsername} onChange={(e) => setNewTeacherUsername(e.target.value)} placeholder="Usuário de acesso" className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  <input type="text" value={newTeacherPassword} onChange={(e) => setNewTeacherPassword(e.target.value)} placeholder="Senha de acesso" className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  <select value={selectedClassForTeacher} onChange={(e) => setSelectedClassForTeacher(e.target.value)} className="border border-gray-300 rounded-lg p-3 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    <option value="">Atribuir a uma Turma...</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <button onClick={addTeacher} className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2.5 rounded-lg font-semibold transition shadow-sm w-full md:w-auto">Registrar Professor</button>
              </div>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 uppercase text-xs font-bold">
                      <th className="p-4 border-b">Usuário</th><th className="p-4 border-b">Senha</th><th className="p-4 border-b">Turma Atribuída</th><th className="p-4 border-b text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appUsers.filter(u => u.role === 'teacher').map(teacher => {
                      const assignedClass = classes.find(c => c.id === teacher.classId);
                      return (
                        <React.Fragment key={teacher.id}>
                          {editingTeacherId === teacher.id ? (
                            <tr className="border-b bg-blue-50">
                              <td className="p-3"><input value={editTeacherUsername} onChange={e=>setEditTeacherUsername(e.target.value)} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" /></td>
                              <td className="p-3"><input value={editTeacherPassword} onChange={e=>setEditTeacherPassword(e.target.value)} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" /></td>
                              <td className="p-3">
                                <select value={editTeacherClassId} onChange={e=>setEditTeacherClassId(e.target.value)} className="w-full border p-2 rounded bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                                  <option value="">Nenhuma turma</option>
                                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                              </td>
                              <td className="p-3 text-right">
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => saveEditTeacher(teacher.id)} className="bg-green-100 text-green-700 p-2 rounded-full hover:bg-green-200 transition"><Check size={18}/></button>
                                  <button onClick={() => setEditingTeacherId(null)} className="bg-red-100 text-red-700 p-2 rounded-full hover:bg-red-200 transition"><X size={18}/></button>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            <tr className="border-b hover:bg-gray-50 group">
                              <td className="p-4 font-semibold text-gray-800">{teacher.username}</td>
                              <td className="p-4 text-gray-500 font-mono text-sm">{teacher.password}</td>
                              <td className="p-4"><span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-xs font-bold">{assignedClass ? assignedClass.name : 'Turma Removida'}</span></td>
                              <td className="p-4 text-right">
                                <div className="flex justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => startEditTeacher(teacher)} className="text-gray-400 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50 transition"><Pencil size={18}/></button>
                                  <button onClick={() => deleteTeacher(teacher.id)} className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition"><Trash2 size={18}/></button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
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
                 <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><UserPlus size={18} className="text-red-600"/> Matricular Aluno</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <select value={selectedClassForStudent} onChange={(e) => setSelectedClassForStudent(e.target.value)} className="border border-gray-300 rounded-lg p-3 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    <option value="">Selecione a Turma...</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <input type="text" value={newStudentName} onChange={(e) => setNewStudentName(e.target.value)} placeholder="Nome Completo do Aluno" className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  <input type="text" value={newStudentCpf} onChange={e => handleCpfChange(e, setNewStudentCpf)} maxLength="14" placeholder="CPF (000.000.000-00)" className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <button onClick={addStudent} className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2.5 rounded-lg font-semibold transition shadow-sm w-full md:w-auto">Efetuar Matrícula</button>
              </div>
              
              {/* O Grid com max-w-[1400px] vai acomodar as colunas muito melhor agora */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {classes.map(cls => {
                  const classStudents = students.filter(s => s.classId === cls.id);
                  return (
                    <div key={cls.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                      <div className="bg-gray-100 p-4 font-bold text-gray-800 border-b flex justify-between items-center">
                        {cls.name} <span className="text-sm bg-gray-300 text-gray-800 px-3 py-1 rounded-full">{classStudents.length}</span>
                      </div>
                      <ul className="divide-y divide-gray-100 bg-white max-h-80 overflow-y-auto">
                        {classStudents.map(student => (
                          <React.Fragment key={student.id}>
                            {editingStudentId === student.id ? (
                              <li className="p-3 bg-blue-50 flex flex-col xl:flex-row gap-3 items-center">
                                <div className="flex-1 w-full flex flex-col xl:flex-row gap-2">
                                  <input type="text" value={editStudentName} onChange={(e) => setEditStudentName(e.target.value)} className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nome" />
                                  <input type="text" value={editStudentCpf} onChange={e => handleCpfChange(e, setEditStudentCpf)} maxLength="14" className="w-full xl:w-36 border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="CPF" />
                                  <select value={editStudentClassId} onChange={(e) => setEditStudentClassId(e.target.value)} className="w-full xl:w-48 border border-gray-300 rounded p-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                  </select>
                                </div>
                                <div className="flex gap-2 w-full xl:w-auto justify-end">
                                  <button onClick={() => saveEditStudent(student.id)} className="bg-green-100 text-green-700 p-2 rounded-full hover:bg-green-200 transition"><Check size={18}/></button>
                                  <button onClick={() => setEditingStudentId(null)} className="bg-red-100 text-red-700 p-2 rounded-full hover:bg-red-200 transition"><X size={18}/></button>
                                </div>
                              </li>
                            ) : (
                              <li className="p-4 flex justify-between items-center text-sm hover:bg-gray-50 transition group">
                                <div className="flex flex-col">
                                  <span className="font-semibold text-gray-800 text-base">{student.name}</span>
                                  <span className="text-gray-500 font-medium text-xs mt-0.5">CPF: {student.cpf || 'Não informado'}</span>
                                </div>
                                <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => startEditStudent(student)} className="text-gray-400 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50 transition"><Pencil size={18}/></button>
                                  <button onClick={() => deleteStudent(student.id)} className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition"><Trash2 size={18}/></button>
                                </div>
                              </li>
                            )}
                          </React.Fragment>
                        ))}
                        {classStudents.length === 0 && <li className="p-6 text-sm text-center text-gray-400 font-medium">Turma vazia.</li>}
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
                <h2 className="text-2xl font-bold text-gray-800">Visualização de Registros na Nuvem</h2>
                <button onClick={() => exportToCSV()} className="w-full sm:w-auto bg-gray-800 hover:bg-gray-900 text-white px-5 py-2.5 rounded-lg font-semibold transition shadow-sm flex items-center justify-center gap-2">
                  <Download size={18}/> Baixar CSV
                </button>
              </div>
              <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm mt-4">
                <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 uppercase text-xs font-bold">
                      <th className="p-4 border-b">Data</th><th className="p-4 border-b">Turma</th><th className="p-4 border-b">Aluno</th><th className="p-4 border-b">CPF</th><th className="p-4 border-b text-center">Situação</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {attendance.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 50).map(record => {
                      const student = students.find(s => s.id === record.studentId);
                      const cls = classes.find(c => c.id === record.classId);
                      return (
                        <tr key={record.id} className="border-b hover:bg-gray-50 transition">
                          <td className="p-4 font-medium text-gray-600">{new Date(record.date).toLocaleDateString('pt-BR')}</td>
                          <td className="p-4 font-semibold text-gray-800">{cls?.name || '-'}</td>
                          <td className="p-4 font-medium">{student?.name || '-'}</td>
                          <td className="p-4 text-gray-500">{student?.cpf || '-'}</td>
                          <td className="p-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${record.status === 'presente' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {record.status === 'presente' ? 'Presente' : 'Falta'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: INTEGRACOES */}
          {activeTab === 'integracoes' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Integração com Planilhas Google</h2>
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <p className="text-gray-600 mb-4">
                  Configure a URL do webhook para enviar os registros de presença automaticamente para o <strong>Make.com</strong>, que alimentará sua Planilha Google.
                </p>
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL de Destino (Webhook POST)</label>
                    <div className="flex items-center">
                      <span className="bg-gray-200 border border-gray-300 border-r-0 rounded-l-lg p-3 text-gray-500">
                        <LinkIcon size={20} />
                      </span>
                      <input 
                        type="url" 
                        value={webhookInput} 
                        onChange={(e) => setWebhookInput(e.target.value)} 
                        placeholder="https://hook.us2.make.com/..." 
                        className="flex-1 border border-gray-300 rounded-r-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={saveWebhookConfig} 
                    className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition shadow-sm flex items-center justify-center gap-2"
                  >
                    <Save size={20} /> Salvar Link
                  </button>
                </div>
                {saveMessage && (
                  <div className="mt-4 p-3 bg-green-100 text-green-800 border border-green-200 rounded-lg flex items-center gap-2">
                    <Check size={18} /> {saveMessage}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}