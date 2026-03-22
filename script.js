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

auth.onAuthStateChanged(user => {
    if(!user) {
        auth.signInAnonymously();
    } else {
        db.ref('users/' + user.uid).on('value', snap => {
            let data = snap.val();
            // NaN HATASI TAMİRİ: Veri bozuksa otomatik 100 yap
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

function mesajGonder() {
    const input = document.getElementById('user-input');
    const msg = input.value.trim();
    const container = document.getElementById('chat-container');

    if (!msg) return;

    let hak = parseInt(userStats.mesajHakki);
    if (hak <= 0) {
        container.innerHTML += `<div class="msg" style="color:red; text-align:center;">⚠️ Mesaj hakkın bitti!</div>`;
        input.value = "";
        return;
    }

    // 1. MESAJI BAS VE KUTUYU ANINDA BOŞALT (Donma Sorununu Çözer)
    container.innerHTML += `<div class="msg user-msg">${msg}</div>`;
    input.value = ""; 
    container.scrollTop = container.scrollHeight;

    // 2. VERİTABANINI GÜNCELLE VE CEVAP VER
    db.ref('users/' + auth.currentUser.uid).update({ mesajHakki: hak - 1 })
    .then(() => {
        setTimeout(() => {
            container.innerHTML += `<div class="msg ai-msg">Anladım Mirkay, kurtlar her zaman yolunu bulur! 🐺</div>`;
            container.scrollTop = container.scrollHeight;
        }, 600);
    });
}

// PANEL FONKSİYONLARI
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

function yeniSohbet() {
    document.getElementById('chat-container').innerHTML = "";
    closeAllMenus();
}

function gecmisiSil() {
    if(confirm("Sohbet silinsin mi?")) {
        document.getElementById('chat-container').innerHTML = "";
        closeAllMenus();
    }
}
