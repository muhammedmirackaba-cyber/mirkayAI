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

// KULLANICI KONTROLÜ VE VERİ ÇEKME
auth.onAuthStateChanged(user => {
    if(!user) {
        auth.signInAnonymously();
    } else {
        db.ref('users/' + user.uid).on('value', snap => {
            let data = snap.val();
            // NaN (Sayı Değil) Hatası Koruması
            if(!data || isNaN(data.mesajHakki) || typeof data.mesajHakki !== 'number') {
                db.ref('users/' + user.uid).set({ mesajHakki: 100, reklamSayaci: 0 });
                userStats = { mesajHakki: 100, reklamSayaci: 0 };
            } else {
                userStats = data;
            }
            const info = document.getElementById('status-info');
            if(info) info.innerText = `Kalan Mesaj Hakkı: ${userStats.mesajHakki}\nStatü: Ücretsiz`;
        });
    }
});

// MESAJ GÖNDERME
function mesajGonder() {
    const input = document.getElementById('user-input');
    const msg = input.value.trim();
    const container = document.getElementById('chat-container');

    if (!msg) return;

    // Hak Kontrolü
    let suankiHak = Number(userStats.mesajHakki);
    if (suankiHak <= 0) {
        container.innerHTML += `<div class="msg limit-msg">⚠️ Şuan mesaj yazamazsınız, yazı yazmak için 1 gün bekleyin veya premium satın alın.</div>`;
        input.value = "";
        container.scrollTop = container.scrollHeight;
        return;
    }

    // Mesajı Bas ve Kutuyu Temizle (Donma Fix)
    container.innerHTML += `<div class="msg user-msg">${msg}</div>`;
    input.value = ""; 
    container.scrollTop = container.scrollHeight;

    // Firebase Güncelle
    const yeniHak = suankiHak - 1;
    db.ref('users/' + auth.currentUser.uid).update({ mesajHakki: yeniHak })
    .then(() => {
        // Cevap Verme
        setTimeout(() => {
            container.innerHTML += `<div class="msg ai-msg">Anladım Mirkay, kurtlar her zaman yolunu bulur! 🐺</div>`;
            container.scrollTop = container.scrollHeight;
        }, 600);
    });
}

// PANEL KONTROLLERİ
function toggleMenu(id) {
    closeAllMenus();
    document.getElementById(id).classList.add('active');
    document.getElementById('overlay').style.display = 'block';
}

function closeAllMenus() {
    document.getElementById('side-menu').classList.remove('active');
    document.getElementById('profile-menu').classList.remove('active');
    document.getElementById('overlay').style.display = 'none';
}

function emailBagla() {
    const mail = prompt("E-postanızı girin:");
    if(mail) alert("E-posta başarıyla bağlandı!");
}

function gecmisiSil() {
    if(confirm("Sohbet silinsin mi?")) {
        document.getElementById('chat-container').innerHTML = "";
        closeAllMenus();
    }
}

function yeniSohbet() {
    document.getElementById('chat-container').innerHTML = "";
    closeAllMenus();
}
