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

let userStats = { isPremium: false, mesajHakki: 100 };

// KULLANICI TAKİBİ
auth.onAuthStateChanged(user => {
    if(!user) {
        auth.signInAnonymously();
    } else {
        db.ref('users/' + user.uid).on('value', snap => {
            let data = snap.val();
            // NaN HATASI GİDERİCİ: Eğer veri bozuksa otomatik 100 yap
            if(!data || isNaN(parseInt(data.mesajHakki))) {
                db.ref('users/' + user.uid).set({ isPremium: false, mesajHakki: 100 });
                userStats = { isPremium: false, mesajHakki: 100 };
            } else {
                userStats = data;
            }
            const infoBox = document.getElementById('status-info');
            if(infoBox) infoBox.innerText = `Statü: Free\nMesaj Hakkı: ${userStats.mesajHakki}`;
        });
    }
});

// MESAJ GÖNDERME VE CEVAP
function mesajGonder() {
    const input = document.getElementById('user-input');
    const msg = input.value.trim();
    const container = document.getElementById('chat-container');

    if (!msg) return;

    // Hakkı sayı olarak zorla
    let currentHak = parseInt(userStats.mesajHakki);

    if (currentHak <= 0) {
        alert("Ücretsiz mesaj hakkın bitti Mirkay!");
        input.value = "";
        return;
    }

    container.innerHTML += `<div class="msg user-msg">${msg}</div>`;
    input.value = ""; // KUTUYU ANINDA TEMİZLE
    container.scrollTop = container.scrollHeight;

    // Firebase Güncelle ve CEVAP VER
    const yeniHak = currentHak - 1;
    db.ref('users/' + auth.currentUser.uid).update({ mesajHakki: yeniHak })
    .then(() => {
        // CEVAP SİSTEMİ
        setTimeout(() => {
            container.innerHTML += `<div class="msg ai-msg">Anladım Mirkay, kurtlar her zaman yolunu bulur! 🐺</div>`;
            container.scrollTop = container.scrollHeight;
        }, 600);
    })
    .catch(err => console.error("Firebase Hatası:", err));
}

// Menü kontrolleri aynı kaldı...
