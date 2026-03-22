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
                document.getElementById('display-status').innerText = `Hak: ${data.kalanHak || 0} | Premium: ${data.isPremium ? 'Sınırsız' : 'Hayır'}`;
            }
        });
    }
});

function toggleMenu(menuId) {
    document.getElementById(menuId).classList.toggle('active');
}

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

function mesajGonder() {
    const input = document.getElementById('user-input');
    const msg = input.value;
    const user = auth.currentUser;
    if (!user || !msg) return;

    const ozet = (msg.length > 15) ? msg.substring(0, 15) + "..." : msg;
    
    db.ref('history/' + user.uid).push({ baslik: ozet, tamMesaj: msg, tarih: Date.now() }).then(() => {
        const container = document.getElementById('chat-container');
        container.innerHTML += `<div class="msg user-msg">${msg}</div>`;
        input.value = "";
        container.scrollTop = container.scrollHeight;
    });
}

function gecmisiYukle(uid) {
    db.ref('history/' + uid).limitToLast(15).on('value', (snap) => {
        const list = document.getElementById('history-list');
        list.innerHTML = "";
        snap.forEach((child) => {
            const data = child.val();
            const div = document.createElement('div');
            div.className = 'menu-item';
            div.innerText = data.baslik;
            div.onclick = () => {
                const container = document.getElementById('chat-container');
                container.innerHTML = `<div class="msg user-msg">${data.tamMesaj}</div><div class="msg ai-msg">Geçmiş sohbet yüklendi. 🐺</div>`;
                toggleMenu('side-menu');
            };
            list.appendChild(div);
        });
    });
}

function emailBagla() {
    const mail = prompt("Gerçek e-postanızı girin:");
    if (mail) {
        auth.currentUser.updateEmail(mail).then(() => alert("E-posta bağlandı!")).catch(e => alert(e.message));
    }
}

function cikisYap() { auth.signOut().then(() => location.reload()); }
