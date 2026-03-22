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

let hak = 50;
let premium = false;

// --- GİRİŞ SİSTEMİ ---
function hizliGiris() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    if(!user || !pass) return alert("Doldur!");
    
    const email = user + "@mirkayai.com";

    auth.signInWithEmailAndPassword(email, pass).then(res => baslat(res.user))
    .catch(() => {
        auth.createUserWithEmailAndPassword(email, pass).then(res => baslat(res.user));
    });
}

function baslat(user) {
    document.getElementById('login-overlay').style.display = 'none';
    
    db.ref('users/' + user.uid).on('value', snap => {
        const d = snap.val() || {};
        hak = d.limit !== undefined ? d.limit : 50;
        premium = d.isPremium || false;
        document.getElementById('limit-show').innerText = premium ? "Sınırsız" : hak;
    });
}

// --- MESAJ GÖNDERME ---
function gonder() {
    const inp = document.getElementById('user-input');
    const msgArea = document.getElementById('messages');

    if(!inp.value) return;
    if(!premium && hak <= 0) return alert("Hak bitti!");

    // Ekrana Yaz
    msgArea.innerHTML += `<div class="user-msg message">${inp.value}</div>`;
    
    // Groq API Bağlantısını buraya ekleyebiliriz (Önceki mesajlardaki gibi)
    setTimeout(() => {
        msgArea.innerHTML += `<div class="ai-msg message">Mesajın alındı Bozkurt. (Şu an test modundayız)</div>`;
        msgArea.scrollTop = msgArea.scrollHeight;
    }, 1000);

    if(!premium) {
        hak--;
        db.ref('users/' + auth.currentUser.uid).update({ limit: hak });
    }

    inp.value = "";
    msgArea.scrollTop = msgArea.scrollHeight;
}

function cikis() { auth.signOut().then(() => location.reload()); }
