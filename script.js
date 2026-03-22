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

let userStats = { mesajHakki: 100, reklamSayaci: 0 };

auth.onAuthStateChanged(user => {
    if(!user) auth.signInAnonymously();
    else {
        db.ref('users/' + user.uid).on('value', snap => {
            userStats = snap.val() || { mesajHakki: 100, reklamSayaci: 0 };
            document.getElementById('status-info').innerText = `Kalan Hak: ${userStats.mesajHakki}`;
        });
    }
});

function mesajGonder() {
    const input = document.getElementById('user-input');
    const msg = input.value.trim();
    const container = document.getElementById('chat-container');

    if (!msg) return;

    // 1. MESAJ HAKKI KONTROLÜ
    if (userStats.mesajHakki <= 0) {
        container.innerHTML += `<div class="msg limit-msg">⚠️ Şuan mesaj yazamazsınız, yazı yazmak için 1 gün bekleyin veya premium satın alın.</div>`;
        container.scrollTop = container.scrollHeight;
        return;
    }

    // 2. REKLAM KONTROLÜ (Her 25 mesajda bir)
    userStats.reklamSayaci++;
    if (userStats.reklamSayaci >= 25) {
        document.getElementById('ad-modal').style.display = 'flex';
        userStats.reklamSayaci = 0; // Sayacı sıfırla
    }

    // Mesajı Bas ve Hakkı Düş
    container.innerHTML += `<div class="msg user-msg">${msg}</div>`;
    const yeniHak = userStats.mesajHakki - 1;
    db.ref('users/' + auth.currentUser.uid).update({ 
        mesajHakki: yeniHak, 
        reklamSayaci: userStats.reklamSayaci 
    });

    input.value = "";
    container.scrollTop = container.scrollHeight;

    setTimeout(() => {
        container.innerHTML += `<div class="msg ai-msg">Anladım Mirkay, kurtlar her zaman yolunu bulur! 🐺</div>`;
        container.scrollTop = container.scrollHeight;
    }, 800);
}

function reklamKapat() {
    // 5 saniye bekleme eklenebilir ama şimdilik direkt kapatıyoruz
    document.getElementById('ad-modal').style.display = 'none';
}

function toggleMenu(id) { document.getElementById(id).classList.toggle('active'); }
function yeniSohbet() { document.getElementById('chat-container').innerHTML = ""; toggleMenu('side-menu'); }
