// Mirkay AI - Final Build 🐺
const firebaseConfig = {
  apiKey: "AIzaSyCAO5cE2T2ShFl4v9somN8Ws6KaWlF80cU",
  authDomain: "mirkayai.firebaseapp.com",
  databaseURL: "https://mirkayai-default-rtdb.firebaseio.com",
  projectId: "mirkayai",
  storageBucket: "mirkayai.firebasestorage.app",
  messagingSenderId: "467181525936",
  appId: "1:467181525936:web:16dc00ac9f155f92ccd475"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();
const GROQ_API = "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";

let userData = { isPremium: false, dailyUploads: 0, dailyAI: 0, messageCount: 0 };

// Giriş İşlemleri
async function login() {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    if(!email || pass.length < 6) return alert("Bilgileri gir Mirkay!");
    try {
        await auth.signInWithEmailAndPassword(email, pass);
    } catch(e) {
        try { await auth.createUserWithEmailAndPassword(email, pass); } catch(err) { alert(err.message); }
    }
}

auth.onAuthStateChanged(user => {
    if(user) {
        document.getElementById('login-screen').style.display = 'none';
        setupUserData(user);
    } else {
        document.getElementById('login-screen').style.display = 'flex';
    }
});

function setupUserData(user) {
    db.ref('users/' + user.uid).on('value', snap => {
        const data = snap.val() || {};
        userData = { isPremium: data.isPremium || false, dailyUploads: data.dailyUploads || 0, dailyAI: data.dailyAI || 0, messageCount: data.messageCount || 0 };
        document.getElementById('p-status').innerText = userData.isPremium ? "PREMIUM 🏆" : "Ücretsiz 🐺";
    });
}

// Mesaj Gönderme (2+2=5 kuralı dahil)
async function send() {
    const input = document.getElementById('user-input');
    const msg = input.value.trim();
    if(!msg) return;

    if(msg.replace(/\s+/g, '') === "2+2") {
        appendMsg("user", msg);
        setTimeout(() => appendMsg("ai", "Bozkurt matematiği: 2+2 = <b>5</b>! 🐺"), 500);
        input.value = ""; return;
    }

    appendMsg("user", msg);
    input.value = "";

    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${GROQ_API}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{role: "system", content: "Sen Mirkay AI'sın."}, {role: "user", content: msg}]
            })
        });
        const data = await res.json();
        appendMsg("ai", data.choices[0].message.content);
    } catch(e) { appendMsg("ai", "Bağlantı hatası Mirkay! 🐺"); }
}

// 🔥 AI ÇİZİM - BEYAZ EKRAN HATASI ÇÖZÜMÜ
function handleMedia(type) {
    toggleAttach();
    if(type === 'ai') {
        const p = prompt("Ne çizelim Mirkay?");
        if(p) drawAI(p);
    } else {
        document.getElementById('file-input').click();
    }
}

function drawAI(p) {
    const container = document.getElementById('chat-container');
    const loadId = "ai-" + Date.now();
    
    // Yükleniyor mesajı
    appendMsg("ai", `<div id="${loadId}">🎨 <b>${p}</b> çiziliyor...</div>`);
    
    const seed = Math.floor(Math.random() * 1000000);
    // Yeni link yapısı (Proxy'siz, direkt browser dostu)
    const imgUrl = `https://pollinations.ai/p/${encodeURIComponent(p)}?width=512&height=512&seed=${seed}&nologo=true`;

    // JavaScript ile resmi kontrol ederek basıyoruz
    setTimeout(() => {
        const msgDiv = document.getElementById(loadId);
        if(msgDiv) {
            msgDiv.innerHTML = `
                Çizim Tamamlandı! 🐺<br>
                <img src="${imgUrl}" 
                     style="width:100%; border-radius:12px; margin-top:10px; display:block;" 
                     onload="this.style.display='block'; window.scrollTo(0,document.body.scrollHeight);"
                     onerror="this.src='https://via.placeholder.com/512?text=Tekrar+Dene'">
            `;
            updateQuota('dailyAI');
        }
    }, 500);
}

function appendMsg(kim, icerik) {
    const c = document.getElementById('chat-container');
    const div = document.createElement('div');
    div.className = `msg ${kim}-msg`;
    div.innerHTML = icerik;
    c.appendChild(div);
    c.scrollTop = c.scrollHeight;
}

function updateQuota(field) { db.ref('users/' + auth.currentUser.uid + '/' + field).set((userData[field] || 0) + 1); }
function toggleAttach() { const m = document.getElementById('attach-menu'); m.style.display = m.style.display === 'none' ? 'flex' : 'none'; }
function toggleMenu(id) { closeAll(); document.getElementById(id).classList.add('active'); document.getElementById('overlay').style.display='block'; }
function closeAll() { 
    ['side-menu','profile-menu'].forEach(m => document.getElementById(m).classList.remove('active'));
    document.getElementById('attach-menu').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}
