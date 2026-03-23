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
const HF_API_KEY = "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"; // Senin Token'ın yerleşti 🐺

if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const auth = firebase.auth();
const db = firebase.database();

let isAuthReady = false;
let stats = { isPremium: false, toplamMesaj: 0 };

auth.onAuthStateChanged(user => {
    if (user) {
        isAuthReady = true;
        document.getElementById('user-email').innerText = user.email || "Misafir Modu";
        db.ref('users/' + user.uid).on('value', snap => {
            if(snap.val()) stats = snap.val();
            document.getElementById('status-text').innerText = stats.isPremium ? "Statü: Premium 🏆" : "Statü: Ücretsiz 🐺";
        });
    } else {
        // Hata koruması: Otomatik anonim giriş
        auth.signInAnonymously().catch(e => console.log("Firebase Yetki Hatası: Lütfen Console'dan Anonymous girişi aç Mirkay!"));
    }
});

async function fotoGrafOlustur() {
    toggleAttachMenu();
    if (!isAuthReady) { alert("Sistem henüz hazır değil Mirkay, bekle..."); return; }
    
    const konu = prompt("Ne çizmemi istersin Mirkay?");
    if (!konu) return;

    const container = document.getElementById('chat-container');
    container.innerHTML += `<div class="msg ai-msg" id="f-load">🎨 <b>${konu}</b> çiziliyor, lütfen bekle...</div>`;
    container.scrollTop = container.scrollHeight;

    try {
        const response = await fetch("https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5", {
            method: "POST",
            headers: { "Authorization": `Bearer ${HF_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ inputs: konu })
        });
        const blob = await response.blob();
        const imgUrl = URL.createObjectURL(blob);
        
        document.getElementById('f-load').remove();
        container.innerHTML += `<div class="msg ai-msg"><img src="${imgUrl}" style="width:100%; border-radius:10px;"><p>MİRKAY AI SANAT ESERİ</p></div>`;
    } catch (e) {
        document.getElementById('f-load').innerText = "Hata oluştu Mirkay! 🐺";
    }
    container.scrollTop = container.scrollHeight;
}

// Groq Mesajlaşma
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
    if (!msg || !isAuthReady) return;

    const container = document.getElementById('chat-container');
    container.innerHTML += `<div class="msg user-msg">${msg}</div>`;
    input.value = "";
    
    const cevap = await groqCevapAl([{ role: "system", content: "Sen Mirkay AI'sın. Bir Bozkurt gibi asil Türkçe cevaplar ver." }, { role: "user", content: msg }]);
    container.innerHTML += `<div class="msg ai-msg">${cevap}</div>`;
    container.scrollTop = container.scrollHeight;
}

function toggleAttachMenu() { document.getElementById('attach-menu').classList.toggle('active'); }
function toggleMenu(id) { closeAllMenus(); document.getElementById(id).classList.add('active'); document.getElementById('overlay').style.display = 'block'; }
function closeAllMenus() { 
    document.getElementById('side-menu').classList.remove('active'); 
    document.getElementById('profile-menu').classList.remove('active'); 
    document.getElementById('attach-menu').classList.remove('active');
    document.getElementById('overlay').style.display = 'none'; 
}
