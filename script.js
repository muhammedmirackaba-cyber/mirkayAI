// FIREBASE AYARLARI
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

let userStats = { mesajHakki: 100 };

// KULLANICI KONTROLÜ
auth.onAuthStateChanged(user => {
    if(!user) {
        auth.signInAnonymously();
    } else {
        db.ref('users/' + user.uid).on('value', snap => {
            let data = snap.val();
            // NaN HATASI ÇÖZÜMÜ: Eğer veri bozuksa otomatik 100 yap
            if(!data || isNaN(parseInt(data.mesajHakki))) {
                db.ref('users/' + user.uid).set({ mesajHakki: 100 });
                userStats = { mesajHakki: 100 };
            } else {
                userStats = data;
            }
            const info = document.getElementById('status-info');
            if(info) info.innerText = `Kalan Hak: ${userStats.mesajHakki}`;
        });
    }
});

// YAZI YAZMA VE CEVAP SİSTEMİ (DÜZELTİLDİ)
function mesajGonder() {
    const input = document.getElementById('user-input');
    const msg = input.value.trim();
    const container = document.getElementById('chat-container');

    if (!msg) return;

    // Hakkı sayıya çevirerek kontrol et
    let suankiHak = parseInt(userStats.mesajHakki);

    if (suankiHak <= 0) {
        container.innerHTML += `<div class="msg ai-msg" style="color:red">⚠️ Mesaj hakkın bitti Mirkay!</div>`;
        input.value = "";
        return;
    }

    // 1. Kullanıcı mesajını bas ve KUTUYU ANINDA BOŞALT
    container.innerHTML += `<div class="msg user-msg">${msg}</div>`;
    input.value = ""; 
    container.scrollTop = container.scrollHeight;

    // 2. Veritabanını güncelle ve ardından CEVAP VER
    db.ref('users/' + auth.currentUser.uid).update({ 
        mesajHakki: suankiHak - 1 
    }).then(() => {
        // CEVAP SİSTEMİ
        setTimeout(() => {
            container.innerHTML += `<div class="msg ai-msg">Anladım Mirkay, kurtlar her zaman yolunu bulur! 🐺</div>`;
            container.scrollTop = container.scrollHeight;
        }, 600);
    }).catch(err => {
        console.error("Firebase Hatası:", err);
    });
}

// PANEL KONTROLLERİ (Eski sistemin aynısı)
function toggleMenu(id) {
    closeAllMenus();
    document.getElementById(id).classList.add('active');
    document.getElementById('overlay').style.display = 'block';
}

function closeAllMenus() {
    const side = document.getElementById('side-menu');
    const prof = document.getElementById('profile-menu');
    if(side) side.classList.remove('active');
    if(prof) prof.classList.remove('active');
    document.getElementById('overlay').style.display = 'none';
}
