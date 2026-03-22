// --- Firebase Yapılandırması (Senin Bilgilerin) ---
const firebaseConfig = {
    apiKey: "AIzaSyC_dfVhnWnRBPiLC4YiMqWkjCoIL18b04U",
    authDomain: "mirkay-ai-7b690.firebaseapp.com",
    projectId: "mirkay-ai-7b690",
    storageBucket: "mirkay-ai-7b690.firebasestorage.app",
    messagingSenderId: "828125100684",
    appId: "1:828125100684:web:1084925d8d8c05cfe8d9a9",
    databaseURL: "https://mirkay-ai-7b690-default-rtdb.firebaseio.com"
};

// Groq API Key (Yapay Zeka İçin)
const GROQ_API_KEY = "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";

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

    auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
        userCredential.user.sendEmailVerification();
        alert("Kayıt Başarılı! E-postana bir onay linki gönderdik. Onaylamadan Premium olamazsın.");
        // Veritabanına başlangıçta Premium Değil olarak kaydet
        db.ref('users/' + userCredential.user.uid).set({
            email: email,
            isPremium: false
        });
    })
    .catch(e => {
        errorMsg.innerText = "Hata: " + e.message;
        errorMsg.style.display = "block";
    });
});

// --- GİRİŞ VE KONTROL ---
document.getElementById('login-btn').addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
        const user = userCredential.user;

        // 1. Kural: E-posta onaylı mı?
        if (!user.emailVerified) {
            alert("E-postan henüz onaylanmamış! Lütfen e-postanı kontrol et.");
            return;
        }

        // 2. Kural: Premium mu? (Database'den bak)
        db.ref('users/' + user.uid).once('value').then(snap => {
            const data = snap.val();
            if (data && data.isPremium === true) {
                alert("Hoş geldin Bozkurt! Premium Aktif. Yapay Zekaya yönlendiriliyorsun.");
                // Burada ana uygulamanın olduğu sayfaya yönlendir
                window.location.href = "ai_chat.html"; 
            } else {
                alert("Giriş Başarılı! Ancak Premium değilsin. 100 TL ödeyerek Premium olabilirsin.");
                // Burada ödeme sayfasına yönlendir
                window.location.href = "odeme.html"; 
            }
        });
    })
    .catch(e => {
        errorMsg.innerText = "Hata: " + e.message;
        errorMsg.style.display = "block";
    });
});
