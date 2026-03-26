// Mirkay AI - Tam Stabil Sürüm 🐺
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

// --- GİRİŞ ---
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
        loadSummaries(user.uid);
    } else {
        document.getElementById('login-screen').style.display = 'flex';
    }
});

function setupUserData(user) {
    db.ref('users/' + user.uid).on('value', snap => {
        const data = snap.val() || {};
        userData = { isPremium: data.isPremium || false, dailyUploads: data.dailyUploads || 0, dailyAI: data.dailyAI || 0, messageCount: data.messageCount || 0 };
        document.getElementById('p-email').innerText = user.email;
        document.getElementById('p-status').innerText = userData.isPremium ? "PREMIUM 🏆" : "Ücretsiz 🐺";
    });
}

// --- MESAJLAŞMA (2+2=5) ---
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
    } catch(e) { appendMsg("ai", "Hata oluştu Mirkay! 🐺"); }
}

// --- 🔥 AI ÇİZİM: PROXY'SİZ KESİN ÇÖZÜM ---
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
    
    // Geçici yükleniyor mesajı
    appendMsg("ai", `<div id="${loadId}">🎨 <b>${p}</b> çiziliyor...</div>`);
    
    const seed = Math.floor(Math.random() * 1000000);
    // Proxy kullanmadan direkt URL!
    const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(p)}?width=512&height=512&nologo=true&seed=${seed}`;

    // Resmi direkt HTML içine gömüyoruz, tarayıcı engellemesini bu aşar
    const finalHtml = `
        Çizim Tamamlandı! 🐺<br>
        <img src="${imgUrl}" 
             style="width:100%; border-radius:15px; margin-top:10px; border: 2px solid #555;" 
             onload="document.getElementById('${loadId}').parentElement.scrollTo(0, 10000);"
             onerror="this.src='https://via.placeholder.com/300?text=Resim+Yuklenemedi'">
    `;

    setTimeout(() => {
        const el = document.getElementById(loadId);
        if(el) {
            el.innerHTML = finalHtml;
            updateQuota('dailyAI');
        }
    }, 1000);
}

// --- DİĞERLERİ ---
function processFile(input) {
    const file = input.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        appendMsg("user", `<img src="${e.target.result}" style="width:100%; border-radius:10px;">`);
        updateQuota('dailyUploads');
    };
    reader.readAsDataURL(file);
}

function appendMsg(kim, icerik) {
    const c = document.getElementById('chat-container');
    c.innerHTML += `<div class="msg ${kim}-msg">${icerik}</div>`;
    c.scrollTop = c.scrollHeight;
}

function toggleMenu(id) { closeAll(); document.getElementById(id).classList.add('active'); document.getElementById('overlay').style.display='block'; }
function toggleAttach() { const m = document.getElementById('attach-menu'); m.style.display = m.style.display === 'none' ? 'flex' : 'none'; }
function closeAll() { 
    ['side-menu','profile-menu'].forEach(m => document.getElementById(m).classList.remove('active'));
    document.getElementById('attach-menu').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}
function updateQuota(field) { db.ref('users/' + auth.currentUser.uid + '/' + field).set((userData[field] || 0) + 1); }
function logout() { auth.signOut(); location.reload(); }
function loadSummaries(uid) {} // Gerekiyorsa doldurulur
