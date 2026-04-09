import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

// 환경 변수 진단 및 로드
const getEnv = (key) => {
    // 1. Vite 빌드 타임 변수 확인
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
        return import.meta.env[key];
    }
    
    // 2. 런타임 process.env 확인 (배포 환경)
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
        return process.env[key];
    }

    return null;
};

const firebaseConfig = {
    apiKey: getEnv('VITE_FIREBASE_API_KEY'),
    authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: getEnv('VITE_FIREBASE_APP_ID'),
    measurementId: getEnv('VITE_FIREBASE_MEASUREMENT_ID')
};

// 디버깅 메시지 강화
if (!firebaseConfig.apiKey) {
    console.error("Critical: Firebase API Key is missing!");
    console.warn("Solution: Ensure Vercel is running 'npm run build' and that variables start with 'VITE_'.");
    console.log("Current Environment Check:", {
        hasImportMetaEnv: typeof import.meta !== 'undefined' && !!import.meta.env,
        envKeys: typeof import.meta !== 'undefined' && import.meta.env ? Object.keys(import.meta.env) : []
    });
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
