// Configurações do Firebase - separated for better organization
// Este arquivo contém a inicialização do Firebase (Auth e Firestore)

// Importa as funções necessárias do SDK do Firebase
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuração do Firebase obtida de variáveis de ambiente do ambiente de execução
const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : {};

// ID único do aplicativo para identificar os dados no Firestore
const appId = typeof __app_id !== 'undefined' 
  ? __app_id 
  : 'presenca-app-id';

// Inicializa o aplicativo Firebase com a configuração fornecida
const app = initializeApp(firebaseConfig);

// Inicializa o serviço de autenticação do Firebase
const auth = getAuth(app);

// Inicializa o serviço de banco de dados Firestore
const db = getFirestore(app);

// Exporta as instâncias para uso em outros arquivos
export { app, auth, db, appId };