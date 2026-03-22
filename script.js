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

let userStats = { mesajHakki: 100, reklamSayaci: 0 };

// GİRİŞ KONTROLÜ VE HAKLARIN YÜKLENMESİ
auth.onAuthStateChanged(user => {
    if(!user) {
        auth.signInAnonymously();
    } else {
        db.ref('users/' + user.uid).on('value', snap => {
            const data = snap.val();
            // NaN HATASI FIX: Verinin sayı olduğundan emin oluyoruz
            if(data && typeof data.mesajHakki === 'number') {
                userStats = data;
            } else {
                db.ref('users/' + user.uid).set(userStats);
            }
            document.getElementById('status-info').innerText = `Kalan Mesaj Hakkı: ${userStats.mesajHakki}\nDurum: Ücretsiz Sürüm`;
        });
    }
});

// MESAJ GÖNDERME SİSTEMİ
function mesajGonder() {
    const input = document.getElementById('user-input');
    const msg = input.value.trim();
    const container = document.getElementById('chat-container');

    if (!msg) return;

    // 1. HAK KONTROLÜ
    if (userStats.mesajHakki <= 0) {
        container.innerHTML += `<div class="msg limit-msg">⚠️ Şuan mesaj yazamazsınız, yazı yazmak için 1 gün bekleyin veya premium satın alın.</div>`;
        input.value = ""; // Kutuyu temizle
        container.scrollTop = container.scrollHeight;
        return;
    }

    // 2. MESAJI EKRANA BAS VE KUTUYU ANINDA BOŞALT
    container.innerHTML += `<div class="msg user-msg">${msg}</div>`;
    input.value = ""; // Yazı kutusu burada temizleniyor (Donma Fix)
    
    // 3. FIREBASE GÜNCELLE (Sayı olarak düşür)
    const currentUid = auth.currentUser.uid;
    const yeniHak = Number(userStats.mesajHakki) - 1;
    
    db.ref('users/' + currentUid).update({ mesajHakki: yeniHak });
    
    container.scrollTop = container.scrollHeight;

    // 4. CEVAP SİSTEMİ
    setTimeout(() => {
        container.innerHTML += `<div class="msg ai-msg">Anladım Mirkay, kurtlar her zaman yolunu bulur! 🐺</div>`;
        container.scrollTop = container.scrollHeight;
    }, 600);
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
    if(mail) alert("E-posta başarıyla kaydedildi!");
}

function gecmisiSil() {
    if(confirm("Tüm mesajlar silinsin mi?")) {
        document.getElementById('chat-container').innerHTML = "";
        closeAllMenus();
    }
}

function yeniSohbet() {
    document.getElementById('chat-container').innerHTML = "";
    closeAllMenus();
}
