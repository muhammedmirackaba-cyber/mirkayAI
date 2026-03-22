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
            document.getElementById('status-info').innerText = `Kalan Mesaj Hakkı: ${userStats.mesajHakki}\nReklam Durumu: Ücretsiz`;
        });
    }
});

function mesajGonder() {
    const input = document.getElementById('user-input');
    const msg = input.value.trim();
    const container = document.getElementById('chat-container');

    if (!msg) return;

    if (userStats.mesajHakki <= 0) {
        container.innerHTML += `<div class="msg user-msg" style="background:#444">⚠️ Hak bitti. Premium alın.</div>`;
        return;
    }

    container.innerHTML += `<div class="msg user-msg">${msg}</div>`;
    const yeniHak = userStats.mesajHakki - 1;
    db.ref('users/' + auth.currentUser.uid).update({ mesajHakki: yeniHak });
    
    input.value = "";
    container.scrollTop = container.scrollHeight;

    setTimeout(() => {
        container.innerHTML += `<div class="msg ai-msg">Mesajını aldım Mirkay, kurtlar vadiye iniyor! 🐺</div>`;
        container.scrollTop = container.scrollHeight;
    }, 600);
}

// PANEL KONTROLLERİ
function toggleMenu(id) {
    const menu = document.getElementById(id);
    const overlay = document.getElementById('overlay');
    const isActive = menu.classList.contains('active');

    closeAllMenus(); // Önce her şeyi kapat

    if (!isActive) {
        menu.classList.add('active');
        overlay.style.display = 'block';
    }
}

function closeAllMenus() {
    document.getElementById('side-menu').classList.remove('active');
    document.getElementById('profile-menu').classList.remove('active');
    document.getElementById('overlay').style.display = 'none';
}

function emailBagla() {
    const email = prompt("E-posta adresinizi girin:");
    if(email) alert(email + " başarıyla bağlandı! (Simülasyon)");
}

function gecmisiTemizle() {
    if(confirm("Tüm sohbet geçmişini silmek istediğine emin misin?")) {
        document.getElementById('chat-container').innerHTML = "";
        alert("Sohbet temizlendi!");
        closeAllMenus();
    }
}

function yeniSohbet() { 
    document.getElementById('chat-container').innerHTML = ""; 
    closeAllMenus(); 
}

function cikisYap() { auth.signOut().then(() => location.reload()); }
