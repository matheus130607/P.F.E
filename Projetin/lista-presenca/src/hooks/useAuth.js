// Hook personalizado para gerenciar autenticação do Firebase
// Responsável por inicializar e gerenciar o estado de autenticação

import { useState, useEffect } from 'react';
import { auth, db, appId } from '../firebase';
import { 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';

// Hook useAuth: gerencia a autenticação do Firebase
export const useAuth = () => {
  // Estado que armazena o usuário autenticado do Firebase
  const [firebaseUser, setFirebaseUser] = useState(null);
  
  // Estado que indica se a autenticação está carregando
  const [authLoading, setAuthLoading] = useState(true);

  // useEffect executado uma vez ao iniciar o componente
  useEffect(() => {
    // Função assíncrona para inicializar a autenticação
    const initAuth = async () => {
      try {
        // Verifica se existe um token de autenticação inicial
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          // Faz login usando token personalizado (ambiente de produção)
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          // Faz login anônimamente (ambiente de desenvolvimento)
          await signInAnonymously(auth);
        }
      } catch (error) {
        // Log de erro no console em caso de falha
        console.error("Erro de autenticação:", error);
      }
    };

    // Inicializa a autenticação
    initAuth();

    // Inscreve um listener para mudanças no estado de autenticação
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Atualiza o estado com o usuário atual
      setFirebaseUser(user);
      // Finaliza o carregamento
      setAuthLoading(false);
    });

    // Cleanup: remove o listener ao desmontar o componente
    return () => unsubscribe();
  }, []);

  // Retorna o usuário do Firebase e o estado de carregamento
  return { firebaseUser, authLoading };
};

// Hook useFirestoreData: gerencia os dados do Firestore (turmas, alunos, presenças, etc)
export const useFirestoreData = (firebaseUser) => {
  // Estados para armazenar os dados do banco
  const [appUsers, setAppUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [config, setConfig] = useState({ webhookUrl: '' });
  const [dataLoading, setDataLoading] = useState(true);

  // useEffect que executa quando o usuário do Firebase está autenticado
  useEffect(() => {
    // Se não houver usuário autenticado, não carrega dados
    if (!firebaseUser) return;

    // Importa as funções do Firestore dentro do useEffect para evitar erros de circular dependency
    const { 
      collection, 
      onSnapshot, 
      doc, 
      addDoc 
    } = require('firebase/firestore');

    // Referências às coleções do Firestore
    const usersRef = collection(db, 'artifacts', appId, 'public', 'data', 'appUsers');
    const classesRef = collection(db, 'artifacts', appId, 'public', 'data', 'classes');
    const studentsRef = collection(db, 'artifacts', appId, 'public', 'data', 'students');
    const attendanceRef = collection(db, 'artifacts', appId, 'public', 'data', 'attendance');
    const configRef = doc(db, 'artifacts', appId, 'public', 'data', 'config', 'settings');

    // Flag para controlar o carregamento inicial
    let isInitialLoad = true;

    // Listener em tempo real para usuários do app
    const unsubUsers = onSnapshot(usersRef, (snapshot) => {
      // Mapeia os documentos para objetos com ID
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAppUsers(usersData);
      
      // Se for o primeiro carregamento e não houver usuários, cria o admin padrão
      if (isInitialLoad && usersData.length === 0) {
        addDoc(usersRef, { username: 'admin', password: 'admin', role: 'admin' });
      }
      isInitialLoad = false;
    }, (err) => console.error("Erro users:", err));

    // Listener em tempo real para turmas
    const unsubClasses = onSnapshot(classesRef, (snapshot) => {
      setClasses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error("Erro classes:", err));

    // Listener em tempo real para alunos
    const unsubStudents = onSnapshot(studentsRef, (snapshot) => {
      setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error("Erro students:", err));

    // Listener em tempo real para presenças
    const unsubAttendance = onSnapshot(attendanceRef, (snapshot) => {
      setAttendance(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setDataLoading(false);
    }, (err) => console.error("Erro attendance:", err));

    // Listener em tempo real para configurações
    const unsubConfig = onSnapshot(configRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setConfig(data);
        // Atualiza o input do webhook com o valor salvo
        if (data.webhookUrl) {
          // O webhookInput será gerenciado no componente que usa este hook
        }
      }
    }, (err) => console.error("Erro config:", err));

    // Cleanup: desinscreve todos os listeners ao desmontar
    return () => {
      unsubUsers(); 
      unsubClasses(); 
      unsubStudents(); 
      unsubAttendance(); 
      unsubConfig();
    };
  }, [firebaseUser]);

  // Retorna todos os dados e estados
  return { 
    appUsers, 
    classes, 
    students, 
    attendance, 
    config, 
    dataLoading,
    setConfig 
  };
};