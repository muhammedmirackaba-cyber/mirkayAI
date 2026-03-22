// --- YENİ GÜNCEL Firebase Yapılandırması ---
const firebaseConfig = {
    apiKey: "AIzaSyCAO5cE2T2ShFl4v9somN8Ws6KaWlF80cU",
    authDomain: "mirkayai.firebaseapp.com",
    projectId: "mirkayai",
    storageBucket: "mirkayai.firebasestorage.app",
    messagingSenderId: "467181525936",
    appId: "1:467181525936:web:16dc00ac9f155f92ccd475",
    databaseURL: "https://mirkayai-default-rtdb.firebaseio.com" // Otomatik oluşturulan DB URL
};

// Groq API Key (Yapay Zeka İçin)
const GROQ_API_KEY = "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";

// Firebase'i Başlat
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMsg = document.getElementById('error-message');

// --- KAYIT OLMA (Onay E-postası Gönderir) ---
document.getElementById('register-btn').addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    if(!email || !password) {
        alert("Lütfen alanları doldur!");
        return;
    }

    auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
        userCredential.user.sendEmailVerification();
        alert("Kayıt Başarılı! E-postana bir onay linki gönderdik. Onaylamadan Premium olamazsın.");
        
        // Veritabanına başlangıçta Premium Değil olarak kaydet
        db.ref('users/' + userCredential.user.uid).set({
            email: email,
            isPremium: false,
            role: "user"
        });
    })
    .catch(e => {
        errorMsg.innerText = "Hata: " + e.message;
        errorMsg.style.display = "block";
    });
});

// --- GİRİŞ VE PREMIUM KONTROLÜ ---
document.getElementById('login-btn').addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
        const user = userCredential.user;

        // 1. KURAL: E-posta onaylı mı?
        if (!user.emailVerified) {
            alert("E-postan henüz onaylanmamış! Lütfen gelen kutunu kontrol et.");
            return;
        }

        // 2. KURAL: Premium mu? (Database'den bak)
        db.ref('users/' + user.uid).once('value').then(snap => {
            const data = snap.val();
            if (data && data.isPremium === true) {
                alert("Hoş geldin Bozkurt! Premium Aktif.");
                // Burada ana sayfaya git
                window.location.href = "dashboard.html"; 
            } else {
                alert("Giriş Başarılı! Ancak Premium değilsin. 100 TL ödeyerek Premium olabilirsin.");
                // Burada ödeme sayfasına git
                window.location.href = "payment.html"; 
            }
        });
    })
    .catch(e => {
        errorMsg.innerText = "Hata: " + e.message;
        errorMsg.style.display = "block";
    });
});
