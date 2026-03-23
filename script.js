const firebaseConfig = {
    apiKey: "AIzaSyCAO5cE2T2ShFl4v9somN8Ws6KaWlF80cU",
    authDomain: "mirkayai.firebaseapp.com",
    databaseURL: "https://mirkayai-default-rtdb.firebaseio.com",
    projectId: "mirkayai",
    storageBucket: "mirkayai.firebasestorage.app",
    messagingSenderId: "467181525936",
    appId: "1:467181525936:web:16dc00ac9f155f92ccd475"
};

const GROQ_API_KEY = "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";

if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const auth = firebase.auth();
const db = firebase.database();

let stats = { isPremium: false, toplamMesaj: 0 };
let isAuthReady = false;

// KULLANICI TAKİBİ
auth.onAuthStateChanged(user => {
    if (!user) {
        auth.signInAnonymously().catch(e => console.error(e));
    } else {
        isAuthReady = true;
        document.getElementById('user-email').innerText = user.email || "Misafir Modu";
        db.ref('users/' + user.uid).on('value', snap => {
            let data = snap.val();
            if (data) {
                stats = data;
                document.getElementById('status-text').innerText = stats.isPremium ? "Statü: Premium 🏆" : "Statü: Ücretsiz 🐺";
                document.getElementById('premium-btn').style.display = stats.isPremium ? "none" : "block";
            } else {
                db.ref('users/' + user.uid).set({ isPremium: false, toplamMesaj: 0 });
            }
        });
    }
});

// ATAÇ MENÜSÜ
function toggleAttachMenu() { document.getElementById('attach-menu').classList.toggle('active'); }

function tetikleDosyaSec(tur) {
    toggleAttachMenu();
    if (tur === 'file') document.getElementById('file-input-gallery').click();
    if (tur === 'camera') document.getElementById('file-input-camera').click();
}

function resimSecildi(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const container = document.getElementById('chat-container');
            container.innerHTML += `<div class="msg user-msg"><img src="${e.target.result}"></div>`;
            container.scrollTop = container.scrollHeight;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// VİDEO OLUŞTURMA (SİMÜLASYON)
async function videoOlustur() {
    toggleAttachMenu();
    const konu = prompt("Video konusu nedir?");
    if (!konu) return;

    const container = document.getElementById('chat-container');
    container.innerHTML += `<div class="msg ai-msg" id="v-load">🎬 <b>${konu}</b> videosu için kareler işleniyor...</div>`;
    
    const response = await groqCevapAl([
        { role: "system", content: "Sen bir AI Video yönetmenisin. Kullanıcının konusunu saniye saniye görsel olarak betimle." },
        { role: "user", content: konu }
    ]);

    setTimeout(() => {
        document.getElementById('v-load').remove();
        container.innerHTML += `<div class="msg ai-msg"><b>🎞️ VİDEO ÖNİZLEME:</b><br>${response.replace(/\n/g, '<br>')}</div>`;
        container.scrollTop = container.scrollHeight;
    }, 1500);
}

// GROQ BAĞLANTISI
async function groqCevapAl(messages) {
    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: messages })
        });
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (e) { return "Hata oluştu! 🐺"; }
}

async function mesajGonder() {
    if (!isAuthReady) return;
    const input = document.getElementById('user-input');
    const msg = input.value.trim();
    if (!msg) return;

    const container = document.getElementById('chat-container');
    container.innerHTML += `<div class="msg user-msg">${msg}</div>`;
    input.value = "";
    container.scrollTop = container.scrollHeight;

    const aiCevap = await groqCevapAl([{ role: "system", content: "Sen Mirkay AI'sın. Bir Bozkurt gibi asil cevap ver." }, { role: "user", content: msg }]);
    
    setTimeout(() => {
        container.innerHTML += `<div class="msg ai-msg">${aiCevap}</div>`;
        container.scrollTop = container.scrollHeight;
    }, 400);
}

// DİĞER FONKSİYONLAR
function emailBagla() {
    const email = prompt("E-posta:");
    const pass = prompt("Şifre:");
    if(email && pass) {
        const cred = firebase.auth.EmailAuthProvider.credential(email, pass);
        auth.currentUser.linkWithCredential(cred).then(() => location.reload()).catch(e => alert(e.message));
    }
}
function cikisYap() { if(confirm("Çıkış?")) auth.signOut().then(() => location.reload()); }
function toggleMenu(id) { closeAllMenus(); document.getElementById(id).classList.add('active'); document.getElementById('overlay').style.display = 'block'; }
function closeAllMenus() { 
    document.getElementById('side-menu').classList.remove('active'); 
    document.getElementById('profile-menu').classList.remove('active'); 
    document.getElementById('attach-menu').classList.remove('active');
    document.getElementById('overlay').style.display = 'none'; 
}
