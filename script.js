// 1. ÖNCE DEĞİŞKENLERİ TANIMLA (Hata almamak için)
let userStats = { isPremium: false, resimHakki: 1, toplamMesaj: 0 };

// 2. FIREBASE'I BAŞLAT (InitializeApp en üstte olmalı)
const firebaseConfig = {
    apiKey: "AIzaSyCAO5cE2T2ShFl4v9somN8Ws6KaWlF80cU",
    authDomain: "mirkayai.firebaseapp.com",
    databaseURL: "https://mirkayai-default-rtdb.firebaseio.com",
    projectId: "mirkayai",
    storageBucket: "mirkayai.firebasestorage.app",
    messagingSenderId: "467181525936",
    appId: "1:467181525936:web:16dc00ac9f155f92ccd475"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.database();

// KULLANICI KONTROLÜ
auth.onAuthStateChanged(user => {
    if(!user) {
        auth.signInAnonymously();
    } else {
        db.ref('users/' + user.uid).on('value', snap => {
            let data = snap.val();
            if(!data) {
                db.ref('users/' + user.uid).set({ isPremium: false, resimHakki: 1, toplamMesaj: 0 });
            } else {
                userStats = data;
            }
            document.getElementById('status-info').innerText = userStats.isPremium ? "Statü: Premium 🏆" : "Statü: Ücretsiz 🐺";
        });
    }
});

// RESİM GÖNDERME
function resimSecildi(input) {
    if (input.files && input.files[0]) {
        if (!userStats.isPremium && userStats.resimHakki <= 0) {
            alert("Günlük resim hakkın bitti!");
            input.value = ""; return;
        }
        const reader = new FileReader();
        reader.onload = function(e) {
            const container = document.getElementById('chat-container');
            container.innerHTML += `<div class="msg user-msg"><img src="${e.target.result}" class="chat-img"></div>`;
            if(!userStats.isPremium) db.ref('users/' + auth.currentUser.uid).update({ resimHakki: 0 });
            container.scrollTop = container.scrollHeight;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// MESAJ GÖNDERME (CEVAP VERME DÜZELTİLDİ)
function mesajGonder() {
    const input = document.getElementById('user-input');
    const msg = input.value.trim();
    const container = document.getElementById('chat-container');

    if (!msg) return;

    container.innerHTML += `<div class="msg user-msg">${msg}</div>`;
    input.value = ""; // KUTUYU ANINDA BOŞALT

    let yeniSayi = (userStats.toplamMesaj || 0) + 1;
    db.ref('users/' + auth.currentUser.uid).update({ toplamMesaj: yeniSayi })
    .then(() => {
        // CEVAP SİSTEMİ
        setTimeout(() => {
            container.innerHTML += `<div class="msg ai-msg">Anladım Mirkay, kurtlar her zaman yolunu bulur! 🐺</div>`;
            if (yeniSayi % 25 === 0) {
                container.innerHTML += `<div class="msg" style="background:#fffbe6; font-size:12px; text-align:center;">🎬 Reklam Arası</div>`;
            }
            container.scrollTop = container.scrollHeight;
        }, 600);
    });
    container.scrollTop = container.scrollHeight;
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
