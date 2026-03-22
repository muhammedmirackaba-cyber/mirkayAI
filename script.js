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
        overlay.classList.remove('hidden');
    } else {
        overlay.classList.add('hidden');
        gecmisiYukle(user.uid);
        // Durum güncelleme
        db.ref('users/' + user.uid).on('value', snap => {
            const data = snap.val();
            if (data) {
                document.getElementById('display-status').innerText = `Hak: ${data.kalanHak || 0} | Premium: ${data.isPremium ? 'Evet' : 'Hayır'}`;
            }
        });
    }
});

function toggleSidebar() {
    document.getElementById('side-menu').classList.toggle('active');
}

function hizliKayit() {
    const isim = document.getElementById('reg-username').value;
    const sifre = document.getElementById('reg-password').value;
    if (isim.length < 3 || sifre.length < 6) return alert("Hatalı isim veya şifre!");

    const email = `${isim.toLowerCase().replace(/\s/g, '')}@mirkay.ai`;

    auth.signInWithEmailAndPassword(email, sifre).catch(() => {
        auth.createUserWithEmailAndPassword(email, sifre).then(res => {
            db.ref('users/' + res.user.uid).set({
                username: isim,
                kalanHak: 100,
                isPremium: false,
                sonGiris: new Date().toLocaleDateString()
            });
        });
    });
}

function sohbetiOzetle(msg) {
    const k = msg.toLowerCase();
    if (k.includes("merhaba") || k.includes("selam")) return "Selamlaşma 👋";
    if (k.includes("nasılsın")) return "Hal Hatır 😊";
    return msg.length > 15 ? msg.substring(0, 15) + "..." : msg;
}

function mesajGonder() {
    const input = document.getElementById('user-input');
    const msg = input.value;
    const user = auth.currentUser;
    if (!user || !msg) return;

    const ozet = sohbetiOzetle(msg);
    
    // Mesajı Firebase'e kaydet
    db.ref('history/' + user.uid).push({
        baslik: ozet,
        tamMesaj: msg,
        tarih: Date.now()
    }).then(() => {
        // Ekrana bas
        const container = document.getElementById('chat-container');
        container.innerHTML += `<div class="msg user-msg">${msg}</div>`;
        container.innerHTML += `<div class="msg ai-msg">Dostum şu an sadece mesajını kaydediyorum, yakında cevap da vereceğim! 🐺</div>`;
        input.value = "";
        container.scrollTop = container.scrollHeight;
    });
}

function gecmisiYukle(uid) {
    db.ref('history/' + uid).limitToLast(10).on('value', (snap) => {
        const list = document.getElementById('history-list');
        list.innerHTML = "";
        snap.forEach((child) => {
            const data = child.val();
            list.innerHTML += `<div class="menu-item" onclick="alert('${data.tamMesaj}')">${data.baslik}</div>`;
        });
    });
}

function cikisYap() {
    auth.signOut().then(() => location.reload());
}
