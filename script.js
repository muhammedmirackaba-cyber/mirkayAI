// FIREBASE CONFIG (Seninkiler buraya gelmeli)
const firebaseConfig = {
    apiKey: "SENİN_API_KEY",
    authDomain: "SENİN_DOMAIN",
    databaseURL: "SENİN_DATABASE_URL",
    projectId: "SENİN_PROJECT_ID",
    storageBucket: "SENİN_BUCKET",
    messagingSenderId: "SENİN_SENDER_ID",
    appId: "SENİN_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// 1. GİRİŞ VE DURUM KONTROLÜ
auth.onAuthStateChanged((user) => {
    const overlay = document.getElementById('auth-overlay');
    if (!user) {
        overlay.classList.remove('hidden');
    } else {
        overlay.classList.add('hidden');
        gecmisiYukle(user.uid);
        db.ref('users/' + user.uid).on('value', snap => {
            const data = snap.val();
            if (data) {
                document.getElementById('user-display-name').innerText = data.username;
                document.getElementById('user-display-status').innerText = `Kalan Hak: ${data.kalanHak || 0}`;
            }
        });
    }
});

// 2. MESAJ GÖNDERME VE CEVAP ALMA ( FIXED VE SIFIRLANDI )
function mesajGonder() {
    const input = document.getElementById('user-input');
    const msg = input.value.trim();
    const user = auth.currentUser;

    if (!user || msg === "") return;

    const container = document.getElementById('chat-container');
    
    // Kullanıcı mesajını bas
    container.innerHTML += `<div class="msg user-msg">${msg}</div>`;
    input.value = "";
    container.scrollTop = container.scrollHeight;

    // Firebase'e kaydet (Özetle)
    const ozet = msg.length > 20 ? msg.substring(0, 20) + "..." : msg;
    db.ref('history/' + user.uid).push({ baslik: ozet, tamMesaj: msg });

    // AI CEVABI (FIXED - Artık anında geliyor)
    setTimeout(() => {
        const cevaplar = [
            "Anladım, peki bu konuda ne yapabiliriz? 🐺",
            "Harika bir soru! Mirkay AI olarak hemen bakıyorum.",
            "Bu mesajını hafızama yazdım dostum."
        ];
        const rastgele = cevaplar[Math.floor(Math.random() * cevaplar.length)];
        container.innerHTML += `<div class="msg ai-msg">${rastgele}</div>`;
        container.scrollTop = container.scrollHeight;
    }, 800);
}

// 3. YENİ PROFİL MENÜSÜNÜN ÇALIŞMASI
function toggleMenu(id) {
    document.getElementById(id).classList.toggle('active');
}

function emailBagla() { 
    const mail = prompt("Hesabını güvenceye almak için gerçek e-postanı girin:"); 
    if(mail) auth.currentUser.updateEmail(mail).then(() => alert("Başarılı! ✓")).catch(e => alert(e.message)); 
}
function cikisYap() { auth.signOut().then(() => location.reload()); }

// 4. HIZLI GİRİŞ / KAYIT VE GEÇMİŞİ YÜKLEME
function hizliKayit() {
    const isim = document.getElementById('reg-username').value;
    const sifre = document.getElementById('reg-password').value;
    const email = `${isim.toLowerCase().replace(/\s/g, '')}@mirkay.ai`;

    auth.signInWithEmailAndPassword(email, sifre).catch(() => {
        auth.createUserWithEmailAndPassword(email, sifre).then(res => {
            db.ref('users/' + res.user.uid).set({ username: isim, kalanHak: 100, isPremium: false });
        });
    });
}

function gecmisiYukle(uid) {
    db.ref('history/' + uid).limitToLast(10).on('value', (snap) => {
        const list = document.getElementById('history-list');
        list.innerHTML = "";
        snap.forEach((child) => {
            const data = child.val();
            const div = document.createElement('div');
            div.className = 'menu-item';
            div.innerText = data.baslik;
            div.onclick = () => {
                const container = document.getElementById('chat-container');
                container.innerHTML = `<div class="msg user-msg">${data.tamMesaj}</div>`;
                toggleMenu('side-menu');
            };
            list.appendChild(div);
        });
    });
}
