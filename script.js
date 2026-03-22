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

auth.onAuthStateChanged((user) => {
    const overlay = document.getElementById('auth-overlay');
    if (!user) overlay.classList.remove('hidden');
    else {
        overlay.classList.add('hidden');
        gecmisiYukle(user.uid);
    }
});

// MESAJ GÖNDERME VE CEVAP ALMA
function mesajGonder() {
    const input = document.getElementById('user-input');
    const msg = input.value.trim();
    const user = auth.currentUser;
    if (!user || msg === "") return;

    const container = document.getElementById('chat-container');
    container.innerHTML += `<div class="msg user-msg">${msg}</div>`;
    
    // Firebase Kayıt
    const ozet = msg.length > 20 ? msg.substring(0, 20) + "..." : msg;
    db.ref('history/' + user.uid).push({ baslik: ozet, tamMesaj: msg });

    input.value = "";
    container.scrollTop = container.scrollHeight;

    // CEVAP VERME (FIXED)
    setTimeout(() => {
        const cevaplar = ["Anladım Mirkay, hemen bakıyorum! 🐺", "Harika bir fikir, peki bunu nasıl yapalım?", "Bozkurt AI her zaman yanında! 🐾"];
        const rastgele = cevaplar[Math.floor(Math.random() * cevaplar.length)];
        container.innerHTML += `<div class="msg ai-msg">${rastgele}</div>`;
        container.scrollTop = container.scrollHeight;
    }, 700);
}

// YENİ SOHBET
function yeniSohbet() {
    document.getElementById('chat-container').innerHTML = "";
    toggleMenu('side-menu');
}

// SİLME MODUNU AÇ (KARE KUTUCUKLARI GÖSTER)
function silmeModunuAc() {
    const checkboxes = document.querySelectorAll('.delete-checkbox');
    const delBtn = document.getElementById('del-mode-btn');
    const confirmBtn = document.getElementById('confirm-del-btn');

    checkboxes.forEach(cb => cb.classList.toggle('show'));
    
    if (delBtn.innerText === "Vazgeç") {
        delBtn.innerText = "Sohbeti Sil";
        confirmBtn.style.display = "none";
    } else {
        delBtn.innerText = "Vazgeç";
        confirmBtn.style.display = "block";
    }
}

// SEÇİLİ SOHBETLERİ SİL
function seciliSohbetleriSil() {
    const user = auth.currentUser;
    const selected = document.querySelectorAll('.delete-checkbox:checked');
    
    if (selected.length === 0) return alert("Silmek için sohbet seçmelisin!");

    if (confirm(`${selected.length} adet sohbet silinecek?`)) {
        selected.forEach(cb => {
            const key = cb.getAttribute('data-key');
            db.ref('history/' + user.uid + '/' + key).remove();
        });
        alert("Silindi!");
        silmeModunuAc(); // Modu kapat
    }
}

// GEÇMİŞİ YÜKLE (KUTUCUKLARLA)
function gecmisiYukle(uid) {
    db.ref('history/' + uid).on('value', (snap) => {
        const list = document.getElementById('history-list');
        list.innerHTML = "";
        snap.forEach((child) => {
            const data = child.val();
            const key = child.key;

            const wrapper = document.createElement('div');
            wrapper.className = 'menu-item-wrapper';
            wrapper.innerHTML = `
                <input type="checkbox" class="delete-checkbox" data-key="${key}">
                <div class="menu-item">${data.baslik}</div>
            `;
            wrapper.querySelector('.menu-item').onclick = () => {
                document.getElementById('chat-container').innerHTML = `<div class="msg user-msg">${data.tamMesaj}</div>`;
                toggleMenu('side-menu');
            };
            list.appendChild(wrapper);
        });
    });
}

function toggleMenu(id) { document.getElementById(id).classList.toggle('active'); }
function cikisYap() { auth.signOut().then(() => location.reload()); }
function hizliKayit() {
    const isim = document.getElementById('reg-username').value;
    const sifre = document.getElementById('reg-password').value;
    const email = `${isim.toLowerCase().replace(/\s/g, '')}@mirkay.ai`;
    auth.signInWithEmailAndPassword(email, sifre).catch(() => {
        auth.createUserWithEmailAndPassword(email, sifre).then(res => {
            db.ref('users/' + res.user.uid).set({ username: isim, kalanHak: 100 });
        });
    });
}
