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

// 1. ENTER TUŞU İLE GÖNDERME
document.getElementById('user-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        mesajGonder();
    }
});

// 2. GİRİŞ KONTROLÜ
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
                document.getElementById('display-status').innerText = `Kalan Hak: ${data.kalanHak || 0}`;
            }
        });
    }
});

// 3. MESAJ GÖNDERME VE CEVAP ALMA
function mesajGonder() {
    const input = document.getElementById('user-input');
    const msg = input.value.trim();
    const user = auth.currentUser;

    if (!user || msg === "") return;

    const container = document.getElementById('chat-container');
    
    // Kullanıcı mesajını ekrana bas
    container.innerHTML += `<div class="msg user-msg">${msg}</div>`;
    input.value = "";
    container.scrollTop = container.scrollHeight;

    // Firebase'e kaydet (Özetle)
    const ozet = msg.length > 20 ? msg.substring(0, 20) + "..." : msg;
    db.ref('history/' + user.uid).push({ baslik: ozet, tamMesaj: msg, tarih: Date.now() });

    // YAPAY ZEKA CEVABI (Simüle ediliyor - Buraya API bağlayabiliriz)
    setTimeout(() => {
        const cevap = `Selam ${user.displayName || 'Dostum'}! Mesajını aldım: "${msg}". Şu an sistemlerimi güncelliyorum, yakında sana çok daha zeki cevaplar vereceğim! 🐺`;
        container.innerHTML += `<div class="msg ai-msg">${cevap}</div>`;
        container.scrollTop = container.scrollHeight;
    }, 800);
}

// 4. DİĞER FONKSİYONLAR
function toggleMenu(menuId) {
    document.getElementById(menuId).classList.toggle('active');
}

function hizliKayit() {
    const isim = document.getElementById('reg-username').value;
    const sifre = document.getElementById('reg-password').value;
    if(!isim || !sifre) return alert("Boş bırakma!");
    
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
                document.getElementById('chat-container').innerHTML = `<div class="msg user-msg">${data.tamMesaj}</div>`;
                toggleMenu('side-menu');
            };
            list.appendChild(div);
        });
    });
}

function cikisYap() { auth.signOut().then(() => location.reload()); }
function emailBagla() { 
    const m = prompt("E-posta gir:"); 
    if(m) auth.currentUser.updateEmail(m).then(() => alert("Başarılı!")); 
}
