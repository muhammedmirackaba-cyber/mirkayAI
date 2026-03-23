// Mirkay AI | Pro & Sanat Sürümü 🐺
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
let userStats = { isPremium: false };

auth.onAuthStateChanged(user => {
    if (user) {
        isAuthReady = true;
        document.getElementById('user-email').innerText = user.email || "Anonim Bozkurt";
        db.ref('users/' + user.uid).on('value', snap => {
            if(snap.val()) {
                userStats = snap.val();
                document.getElementById('status-text').innerText = userStats.isPremium ? "Statü: Premium Üye 🏆" : "Statü: Ücretsiz Kullanıcı 🐺";
            }
        });
    } else {
        auth.signInAnonymously();
    }
});

// AI Fotoğraf Oluşturma - Köklü Çözüm
async function fotoGrafOlustur() {
    toggleAttachMenu();
    const konu = prompt("Mirkay AI Sanatçı: Ne çizelim? (İngilizce)");
    if (!konu) return;

    const container = document.getElementById('chat-container');
    const loadId = "f-" + Date.now();
    container.innerHTML += `<div class="msg ai-msg" id="${loadId}">🎨 <b>${konu}</b> çiziliyor, lütfen bekleyin...</div>`;
    container.scrollTop = container.scrollHeight;

    try {
        const response = await fetch(
            "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1",
            {
                method: "POST",
                headers: { "Authorization": `Bearer ${HF_API_KEY}`, "Content-Type": "application/json" },
                body: JSON.stringify({ inputs: konu })
            }
        );

        if (!response.ok) throw new Error("CORS/API Hatası");

        const blob = await response.blob();
        const imgUrl = URL.createObjectURL(blob);
        
        document.getElementById(loadId).remove();
        container.innerHTML += `<div class="msg ai-msg"><img src="${imgUrl}"><p style="text-align:center;font-weight:bold;">MİRKAY AI ART 🐺</p></div>`;
    } catch (e) {
        document.getElementById(loadId).innerText = "Hata! Tarayıcı engeli (CORS). Lütfen Chrome kullanın veya kalkanı kapatın. 🐺";
    }
    container.scrollTop = container.scrollHeight;
}

// Mesajlaşma
async function mesajGonder() {
    const input = document.getElementById('user-input');
    const msg = input.value.trim();
    if (!msg || !isAuthReady) return;

    const container = document.getElementById('chat-container');
    container.innerHTML += `<div class="msg user-msg">${msg}</div>`;
    input.value = "";
    container.scrollTop = container.scrollHeight;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{role:"system", content:"Asil bir Bozkurt gibi cevap ver."}, {role:"user", content:msg}] })
    });
    const data = await res.json();
    container.innerHTML += `<div class="msg ai-msg">${data.choices[0].message.content}</div>`;
    container.scrollTop = container.scrollHeight;
}

// Yardımcılar
function premiumOl() {
    if(confirm("Premium üyeliğe geçmek istiyor musun Mirkay?")) {
        db.ref('users/' + auth.currentUser.uid).update({ isPremium: true });
        alert("Tebrikler Premium Oldun! 🏆");
    }
}
function tetikleDosya(tur) {
    toggleAttachMenu();
    if(tur === 'gallery') document.getElementById('input-gallery').click();
    if(tur === 'camera') document.getElementById('input-camera').click();
}
function resimSecildi(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            document.getElementById('chat-container').innerHTML += `<div class="msg user-msg"><img src="${e.target.result}"></div>`;
        };
        reader.readAsDataURL(file);
    }
}
function toggleAttachMenu() { document.getElementById('attach-menu').classList.toggle('active'); }
function toggleMenu(id) { closeAllMenus(); document.getElementById(id).classList.add('active'); document.getElementById('overlay').style.display='block'; }
function closeAllMenus() { 
    ['side-menu','profile-menu','attach-menu'].forEach(m=>document.getElementById(m).classList.remove('active'));
    document.getElementById('overlay').style.display='none'; 
}
