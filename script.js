// Mirkay AI - Final Stabil Sürüm 🐺
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
const HF_API_KEY = "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"; // Mirkay'ın Token'ı

// Firebase Başlatma
if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const auth = firebase.auth();
const db = firebase.database();

let isAuthReady = false;
let stats = { isPremium: false, toplamMesaj: 0 };

// 1. Firebase Yetkilendirme Takibi
auth.onAuthStateChanged(user => {
    const emailDiv = document.getElementById('user-email');
    if (user) {
        isAuthReady = true;
        emailDiv.innerText = user.email || "Misafir Modu";
        db.ref('users/' + user.uid).on('value', snap => {
            if(snap.val()) stats = snap.val();
            document.getElementById('status-text').innerText = stats.isPremium ? "Statü: Premium 🏆" : "Statü: Ücretsiz 🐺";
        });
    } else {
        // Otomatik Anonim Giriş
        auth.signInAnonymously().catch(e => {
            console.error("Firebase Hatası: Anonim giriş engellendi!", e.message);
            emailDiv.innerText = "Bağlantı Hatası!";
        });
    }
});

// 2. AI Fotoğraf Oluşturma (CORS ve Bekleme Çözümlü)
async function fotoGrafOlustur() {
    toggleAttachMenu();
    if (!isAuthReady) { alert("Lütfen bağlantı kurulana kadar bekleyin Mirkay..."); return; }
    
    const konu = prompt("Mirkay AI Sanatçı: Ne çizmemi istersin? (İngilizce daha iyi sonuç verir)");
    if (!konu) return;

    const container = document.getElementById('chat-container');
    const loadId = "f-" + Date.now();
    container.innerHTML += `<div class="msg ai-msg" id="${loadId}">🎨 <b>${konu}</b> asil bir şekilde çiziliyor, 10-15 saniye sürebilir... 🐺</div>`;
    container.scrollTop = container.scrollHeight;

    try {
        const response = await fetch(
            "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1",
            {
                method: "POST",
                headers: { 
                    "Authorization": `Bearer ${HF_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ inputs: konu })
            }
        );

        if (response.status === 503) {
            document.getElementById(loadId).innerText = "🎨 Atölye henüz uyanıyor (Model yükleniyor), lütfen 10 saniye sonra tekrar dene Mirkay!";
            return;
        }

        if (!response.ok) throw new Error("API Erişim Hatası");

        const blob = await response.blob();
        const imgUrl = URL.createObjectURL(blob);
        
        document.getElementById(loadId).remove();
        container.innerHTML += `
            <div class="msg ai-msg" style="width: 90%;">
                <img src="${imgUrl}">
                <p style="text-align:center; font-weight:bold; color:#000; margin-top:8px;">MİRKAY AI SANAT ESERİ 🐺</p>
            </div>`;
            
    } catch (e) {
        document.getElementById(loadId).innerText = "Üzgünüm Mirkay, fırçamda bir teknik sorun oldu! 🐺";
        console.error("Hata Detayı:", e);
    }
    container.scrollTop = container.scrollHeight;
}

// 3. Mesajlaşma (Groq Llama 3)
async function groqCevapAl(messages) {
    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: messages })
        });
        const data = await res.json();
        return data.choices[0].message.content;
    } catch (e) { return "Kardeşim bağlantıda bir sorun oldu, tekrar dene. 🐺"; }
}

async function mesajGonder() {
    const input = document.getElementById('user-input');
    const msg = input.value.trim();
    if (!msg || !isAuthReady) return;

    const container = document.getElementById('chat-container');
    container.innerHTML += `<div class="msg user-msg">${msg}</div>`;
    input.value = "";
    container.scrollTop = container.scrollHeight;
    
    const cevap = await groqCevapAl([
        { role: "system", content: "Sen Mirkay AI'sın. Bir Bozkurt gibi asil, cesur ve bilgece Türkçe cevaplar ver." },
        { role: "user", content: msg }
    ]);
    
    container.innerHTML += `<div class="msg ai-msg">${cevap}</div>`;
    container.scrollTop = container.scrollHeight;
}

// 4. Diğer Fonksiyonlar
function toggleAttachMenu() { document.getElementById('attach-menu').classList.toggle('active'); }
function tetikleDosyaSec(tur) {
    toggleAttachMenu();
    if (tur === 'file') document.getElementById('file-input-gallery').click();
    if (tur === 'camera') document.getElementById('file-input-camera').click();
}
function resimSecildi(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = e => {
            const container = document.getElementById('chat-container');
            container.innerHTML += `<div class="msg user-msg"><img src="${e.target.result}"></div>`;
            container.scrollTop = container.scrollHeight;
        };
        reader.readAsDataURL(input.files[0]);
    }
}
function emailBagla() {
    const email = prompt("E-posta:");
    const pass = prompt("Şifre:");
    if(email && pass) {
        const cred = firebase.auth.EmailAuthProvider.credential(email, pass);
        auth.currentUser.linkWithCredential(cred).then(() => {
            alert("Bağlandı!"); location.reload();
        }).catch(e => alert(e.message));
    }
}
function cikisYap() { if(confirm("Çıkış?")) auth.signOut().then(() => location.reload()); }
function toggleMenu(id) { closeAllMenus(); document.getElementById(id).classList.add('active'); document.getElementById('overlay').style.display = 'block'; }
function closeAllMenus() { 
    ['side-menu', 'profile-menu', 'attach-menu'].forEach(m => document.getElementById(m).classList.remove('active'));
    document.getElementById('overlay').style.display = 'none'; 
}
