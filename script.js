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

let userLimit = 50;
let isPremium = false;

// --- HIZLI KAYIT/GİRİŞ ---
async function hizliKayit() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const email = user + "@mirkayai.com";

    try {
        let res = await auth.signInWithEmailAndPassword(email, pass).catch(() => {
            return auth.createUserWithEmailAndPassword(email, pass);
        });
        setupUser(res.user);
    } catch (e) { alert("Hata oluştu!"); }
}

// --- SOSYAL GİRİŞLER ---
function googleGiris() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).then(res => setupUser(res.user));
}

function facebookGiris() {
    const provider = new firebase.auth.FacebookAuthProvider();
    auth.signInWithPopup(provider).then(res => setupUser(res.user));
}

// --- KULLANICI KURULUMU ---
function setupUser(user) {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('chat-area').style.display = 'flex';
    document.getElementById('user-display').innerText = user.displayName || user.email.split('@')[0];

    // DB'den verileri çek (Limit ve Premium durumu)
    db.ref('users/' + user.uid).on('value', snap => {
        const data = snap.val() || {};
        isPremium = data.isPremium || false;
        userLimit = data.dailyLimit !== undefined ? data.dailyLimit : 50;
        
        document.getElementById('limit-text').innerText = isPremium ? "Sınırsız Bozkurt" : "Kalan Hak: " + userLimit;
    });
}

// --- MESAJ GÖNDERME ---
function mesajGonder() {
    const input = document.getElementById('msg-input');
    if (!input.value) return;

    if (!isPremium && userLimit <= 0) {
        alert("Günlük limitin bitti! Premium alarak sınırsız yazabilirsin.");
        return;
    }

    // Mesajı ekrana yaz (Burada Groq API'ye de gönderebilirsin)
    const msgDiv = document.getElementById('messages');
    msgDiv.innerHTML += `<div><b>Siz:</b> ${input.value}</div>`;
    
    // Limiti Düşür
    if (!isPremium) {
        userLimit--;
        db.ref('users/' + auth.currentUser.uid).update({ dailyLimit: userLimit });
    }

    input.value = "";
    msgDiv.scrollTop = msgDiv.scrollHeight;
}

// --- E-POSTA BAĞLAMA ---
function showEmailLink() {
    const email = prompt("Sınırsız hak için gerçek e-postanı gir:");
    if (email && email.includes("@")) {
        auth.currentUser.updateEmail(email).then(() => {
            auth.currentUser.sendEmailVerification();
            db.ref('users/' + auth.currentUser.uid).update({ emailLinked: true, pendingEmail: email });
            alert("E-posta bağlandı. Onayladıktan sonra yöneticiye 100 TL ileterek Premium olabilirsin.");
        }).catch(e => alert("Hata: " + e.message));
    }
}

function logout() { auth.signOut().then(() => location.reload()); }
