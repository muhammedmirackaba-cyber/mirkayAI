// Mirkay AI | Sanat Sürümü 🐺
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
const HF_API_KEY = "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"; 

if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const auth = firebase.auth();
const db = firebase.database();

let isAuthReady = false;

// Kullanıcı Giriş Takibi
auth.onAuthStateChanged(user => {
    const emailDiv = document.getElementById('user-email');
    if (user) {
        isAuthReady = true;
        emailDiv.innerText = user.email || "Misafir Modu";
        document.getElementById('status-text').innerText = "Statü: Aktif 🐺";
    } else {
        auth.signInAnonymously().catch(e => console.error("Giriş Hatası:", e.message));
    }
});

// AI Fotoğraf Oluşturma (CORS Engelini Aşmak İçin Optimize Edildi)
async function fotoGrafOlustur() {
    toggleAttachMenu();
    if (!isAuthReady) { alert("Sistem bağlanıyor, tekrar dene Mirkay!"); return; }
    
    const konu = prompt("Ne çizmemi istersin? (İngilizce daha iyidir)");
    if (!konu) return;

    const container = document.getElementById('chat-container');
    const loadId = "f-" + Date.now();
    container.innerHTML += `<div class="msg ai-msg" id="${loadId}">🎨 <b>${konu}</b> asilce çiziliyor, lütfen bekle...</div>`;
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

        if (!response.ok) throw new Error("API Hatası: " + response.status);

        const blob = await response.blob();
        const imgUrl = URL.createObjectURL(blob);
        
        document.getElementById(loadId).remove();
        container.innerHTML += `
            <div class="msg ai-msg">
                <img src="${imgUrl}">
                <p style="text-align:center; font-weight:bold;">MİRKAY AI SANAT 🐺</p>
            </div>`;
    } catch (e) {
        console.error(e);
        document.getElementById(loadId).innerText = "Hata! Tarayıcı engeli (CORS) veya API yoğunluğu. Lütfen tekrar dene. 🐺";
    }
    container.scrollTop = container.scrollHeight;
}

// Mesajlaşma
async function groqCevapAl(messages) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: messages })
    });
    const data = await res.json();
    return data.choices[0].message.content;
}

async function mesajGonder() {
    const input = document.getElementById('user-input');
    const msg = input.value.trim();
    if (!msg) return;

    const container = document.getElementById('chat-container');
    container.innerHTML += `<div class="msg user-msg">${msg}</div>`;
    input.value = "";
    container.scrollTop = container.scrollHeight;
    
    const cevap = await groqCevapAl([
        { role: "system", content: "Sen Mirkay AI'sın. Asil bir Bozkurt gibi Türkçe cevap ver." },
        { role: "user", content: msg }
    ]);
    
    container.innerHTML += `<div class="msg ai-msg">${cevap}</div>`;
    container.scrollTop = container.scrollHeight;
}

// Menü ve Yardımcılar
function toggleAttachMenu() { document.getElementById('attach-menu').classList.toggle('active'); }
function tetikleDosyaSec() { document.getElementById('file-input-gallery').click(); toggleAttachMenu(); }
function resimSecildi(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = e => {
            document.getElementById('chat-container').innerHTML += `<div class="msg user-msg"><img src="${e.target.result}"></div>`;
        };
        reader.readAsDataURL(input.files[0]);
    }
}
function toggleMenu(id) { closeAllMenus(); document.getElementById(id).classList.add('active'); document.getElementById('overlay').style.display = 'block'; }
function closeAllMenus() { 
    ['side-menu', 'profile-menu', 'attach-menu'].forEach(m => document.getElementById(m).classList.remove('active'));
    document.getElementById('overlay').style.display = 'none'; 
}
