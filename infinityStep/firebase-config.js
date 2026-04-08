import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

// Vercel/Vite 환경 변수 접근 시 에러를 방지하는 초안전 로직
const getSafeEnv = () => {
    try {
        // import.meta.env가 정의되어 있는지 먼저 확인
        if (typeof import.meta !== 'undefined' && import.meta.env) {
            return {
                apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
                authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
                projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
                storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
                messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
                appId: import.meta.env.VITE_FIREBASE_APP_ID,
                measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
            };
        }
    } catch (e) {
        console.warn("Environment variables access failed, using fallback.");
    }
    
    // 폴백: 유저님이 제공한 기본값 직접 사용
    return {
        apiKey: "AIzaSyBg_PD8DnNeoQW5Eg3wppcI3iLBMtlHpfQ",
        authDomain: "creategame-30a5e.firebaseapp.com",
        projectId: "creategame-30a5e",
        storageBucket: "creategame-30a5e.firebasestorage.app",
        messagingSenderId: "651941384510",
        appId: "1:651941384510:web:1f137c4f2efd457d809c6f",
        measurementId: "G-MFXDCLGGF5"
    };
};

const env = getSafeEnv();

const firebaseConfig = {
    apiKey: env.apiKey || "AIzaSyBg_PD8DnNeoQW5Eg3wppcI3iLBMtlHpfQ",
    authDomain: env.authDomain,
    projectId: env.projectId,
    storageBucket: env.storageBucket,
    messagingSenderId: env.messagingSenderId,
    appId: env.appId,
    measurementId: env.measurementId
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
