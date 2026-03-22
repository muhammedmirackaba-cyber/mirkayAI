const firebaseConfig = {
    apiKey: "AIzaSyCAO5cE2T2ShFl4v9somN8Ws6KaWlF80cU",
    authDomain: "mirkayai.firebaseapp.com",
    projectId: "mirkayai",
    storageBucket: "mirkayai.firebasestorage.app",
    messagingSenderId: "467181525936",
    appId: "1:467181525936:web:16dc00ac9f155f92ccd475",
    databaseURL: "https://mirkayai-default-rtdb.firebaseio.com"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// --- HIZLI KAYIT (İsim ve Şifre) ---
function kayitOl() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const fakeEmail = user + "@mirkay.ai"; // Arka planda geçici e-posta oluşturur

    auth.createUserWithEmailAndPassword(fakeEmail, pass)
    .then((userCredential) => {
        db.ref('users/' + userCredential.user.uid).set({
            username: user,
            isPremium: false,
            emailLinked: false
        });
        alert("Kayıt Başarılı! Şimdi giriş yap.");
    })
    .catch(e => alert("Hata: " + e.message));
}

// --- GİRİŞ YAP ---
function girisYap() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const fakeEmail = user + "@mirkay.ai";

    auth.signInWithEmailAndPassword(fakeEmail, pass)
    .then((res) => {
        document.getElementById('auth-box').style.display = 'none';
        document.getElementById('profile-box').style.display = 'block';
        document.getElementById('welcome-msg').innerText = "Hoş geldin, " + user;
        
        // Premium Kontrolü
        db.ref('users/' + res.user.uid).on('value', snap => {
            const data = snap.val();
            const pStatus = document.getElementById('premium-status');
            if(data.isPremium) {
                pStatus.innerText = "🏆 PREMİUM ÜYE (Aktif)";
            } else {
                pStatus.innerText = "Standart Üye (Premium İçin E-posta Bağla)";
            }
        });
    })
    .catch(e => alert("Giriş Hatalı!"));
}

// --- E-POSTA BAĞLA (Premium Şartı) ---
function emailBagla() {
    const email = document.getElementById('new-email').value;
    const user = auth.currentUser;

    if(!email.includes("@")) { alert("Geçerli e-posta gir!"); return; }

    user.updateEmail(email).then(() => {
        user.sendEmailVerification();
        db.ref('users/' + user.uid).update({ emailLinked: true, realEmail: email });
        alert("E-posta bağlandı ve onay kodu gönderildi! Onaylayınca yöneticiye 100 TL ilet.");
    }).catch(e => alert("Hata: " + e.message));
}

function cikisYap() {
    auth.signOut().then(() => location.reload());
}
