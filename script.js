// Mirkay AI - Full Firebase & Logic Control 🐺
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
const GROQ_API = "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";
let sohbetGecmisi = [];

// Kullanıcı Durumu
auth.onAuthStateChanged(user => {
    const info = document.getElementById('user-info');
    if (user) {
        info.innerText = user.email ? `E-posta: ${user.email}` : "Misafir Modu (Anonim)";
    } else {
        auth.signInAnonymously();
    }
});

async function gonder() {
    const input = document.getElementById('user-input');
    const msg = input.value.trim();
    if (!msg) return;

    // 🔥 KURAL: 2+2=5 Şakası
    if (msg.replace(/\s+/g, '') === "2+2") {
        ekranaBas("user", msg);
        setTimeout(() => ekranaBas("ai", "Asil bir Bozkurt matematiğe sığmaz Mirkay... 2+2 = <b>5</b>! 🐺"), 500);
        input.value = "";
        return;
    }

    ekranaBas("user", msg);
    sohbetGecmisi.push("Kullanıcı: " + msg);
    input.value = "";

    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${GROQ_API}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{role: "system", content: "Sen Mirkay AI'sın. Bir Bozkurt gibi bilge ve asil cevaplar ver."}, {role: "user", content: msg}]
            })
        });
        const data = await res.json();
        const cevap = data.choices[0].message.content;
        ekranaBas("ai", cevap);
        sohbetGecmisi.push("AI: " + cevap);
    } catch (e) {
        ekranaBas("ai", "Bağlantı zayıf Mirkay, tekrar dene! 🐺");
    }
}

function ekranaBas(kim, icerik) {
    const container = document.getElementById('chat-container');
    const div = document.createElement('div');
    div.className = `msg ${kim}-msg`;
    div.innerHTML = `<div class="delete-box" onclick="buMesajiSil(this)"></div>${icerik}`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

// 🎨 AI Çizim (Pollinations)
function aiCizim() {
    toggleAttach();
    const konu = prompt("Ne çizelim Mirkay?");
    if (!konu) return;

    const loadId = "ai-" + Date.now();
    ekranaBas("ai", `<div id="${loadId}">🎨 <b>${konu}</b> çiziliyor...</div>`);
    
    const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(konu)}?width=1024&height=1024&nologo=true&seed=${Math.random()}`;
    const img = new Image();
    img.src = imgUrl;
    img.onload = () => {
        document.getElementById(loadId).innerHTML = `Çizim Tamamlandı! 🐺<img src="${imgUrl}">`;
        document.getElementById('chat-container').scrollTop = document.getElementById('chat-container').scrollHeight;
    };
}

// 📷 Fotoğraf İşlemleri
function tetikle(tip) {
    toggleAttach();
    document.getElementById(tip === 'camera' ? 'cam-input' : 'gal-input').click();
}

function dosyaSecildi(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = e => ekranaBas("user", `<img src="${e.target.result}">`);
        reader.readAsDataURL(file);
    }
}

// 📝 Özetleme ve Firebase Kayıt
async function sohbetOzetle() {
    if (sohbetGecmisi.length === 0) return alert("Özetlenecek bir şey yok!");
    const ozetAlan = document.getElementById('ozet-alani');
    ozetAlan.innerText = "Yapay zeka özetliyor...";

    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${GROQ_API}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{role: "user", content: "Şu sohbeti tek cümlede özetle: " + sohbetGecmisi.join(" ")}]
            })
        });
        const data = await res.json();
        const ozet = data.choices[0].message.content;
        ozetAlan.innerText = "ÖZET: " + ozet;
        
        // Firebase'e kaydet
        const uid = auth.currentUser.uid;
        db.ref('users/' + uid + '/lastSummary').set(ozet);
    } catch (e) { ozetAlan.innerText = "Hata oluştu."; }
}

// 🗑️ Silme Mantığı
function silmeModuAc() {
    document.body.classList.toggle('delete-mode');
    alert(document.body.classList.contains('delete-mode') ? "Silmek istediğin mesajın yanındaki kutuya tıkla Mirkay!" : "Silme modu kapatıldı.");
}

function buMesajiSil(el) {
    if(confirm("Bu mesajı siliyorum?")) el.parentElement.remove();
}

// 📧 E-posta Bağlama (Firebase Auth)
async function emailBagla() {
    const email = prompt("E-postanı gir:");
    const sifre = prompt("Şifre belirle (En az 6 haneli):");
    if (email && sifre) {
        try {
            const credential = firebase.auth.EmailAuthProvider.credential(email, sifre);
            await auth.currentUser.linkWithCredential(credential);
            alert("Bağlantı başarılı Mirkay! 🐺");
            location.reload();
        } catch (e) { alert("Hata: " + e.message); }
    }
}

// UI Yardımcıları
function toggleMenu(id) { closeAll(); document.getElementById(id).classList.add('active'); document.getElementById('overlay').style.display='block'; }
function toggleAttach() { document.getElementById('attach-menu').classList.toggle('active'); }
function closeAll() { 
    ['side-menu','profile-menu','attach-menu'].forEach(m => document.getElementById(m).classList.remove('active'));
    document.getElementById('overlay').style.display='none';
    document.body.classList.remove('delete-mode');
}
