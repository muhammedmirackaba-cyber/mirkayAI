const firebaseConfig = {
    apiKey: "AIzaSyCAO5cE2T2ShFl4v9somN8Ws6KaWlF80cU",
    authDomain: "mirkayai.firebaseapp.com",
    databaseURL: "https://mirkayai-default-rtdb.firebaseio.com",
    projectId: "mirkayai",
    storageBucket: "mirkayai.firebasestorage.app",
    messagingSenderId: "467181525936",
    appId: "1:467181525936:web:16dc00ac9f155f92ccd475"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// GİRİŞ KONTROLÜ
auth.onAuthStateChanged((user) => {
    const overlay = document.getElementById('auth-overlay');
    if (!user) {
        overlay.classList.remove('hidden'); // Giriş yoksa ekranı göster
    } else {
        overlay.classList.add('hidden'); // Giriş varsa ekranı gizle
        gecmisiYukle(user.uid);
        haklariKontrolEt(user.uid);
    }
});

function gecmisiYukle(uid) {
    db.ref('history/' + uid).limitToLast(10).on('value', (snap) => {
        const list = document.getElementById('history-list');
        list.innerHTML = "";
        snap.forEach((child) => {
            const data = child.val();
            list.innerHTML += `<div class="menu-item">${data.baslik}</div>`;
        });
    });
}

function sohbetiOzetle(msg) {
    const k = msg.toLowerCase();
    if (k.includes("merhaba") || k.includes("selam")) return "Selamlaşma 👋";
    if (k.includes("kod")) return "Yazılım 💻";
    return msg.substring(0, 15) + "...";
}

function mesajGonder() {
    const input = document.getElementById('user-input');
    const msg = input.value;
    const user = auth.currentUser;
    if (!user || !msg) return;

    const ozet = sohbetiOzetle(msg);
    // Kaydetme
    db.ref('history/' + user.uid).push({
        baslik: ozet,
        tamMesaj: msg
    }).then(() => {
        document.getElementById('chat-container').innerHTML += `<div class="msg user-msg">${msg}</div>`;
        input.value = "";
    }).catch(err => alert("Hata: " + err.message));
}

function hizliKayit() {
    const isim = document.getElementById('reg-username').value;
    const sifre = document.getElementById('reg-password').value;
    const email = `${isim.toLowerCase().replace(/\s/g, '')}@mirkay.ai`;

    auth.signInWithEmailAndPassword(email, sifre).catch(() => {
        auth.createUserWithEmailAndPassword(email, sifre).then(res => {
            db.ref('users/' + res.user.uid).set({ username: isim, kalanHak: 100 });
        });
    });
}

function toggleSidebar() { document.getElementById('side-menu').classList.toggle('active'); }
function cikisYap() { auth.signOut().then(() => location.reload()); }
