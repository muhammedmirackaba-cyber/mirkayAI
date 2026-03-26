// Mirkay AI - Final Stable Build 🐺
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
let currentSummaryId = null;

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
        const mail = user.email || "M";
        document.getElementById('p-email').innerText = mail;
        document.getElementById('p-char').innerText = mail[0].toUpperCase();
        document.getElementById('p-status').innerText = userData.isPremium ? "PREMIUM 🏆" : "Ücretsiz 🐺";
        document.getElementById('btn-premium').style.display = userData.isPremium ? "none" : "block";
    });
}

async function send() {
    const input = document.getElementById('user-input');
    const msg = input.value.trim();
    if(!msg) return;

    // 🔥 KURAL: 2+2 Sorusuna daima 5 Cevabı Verme
    if(msg.replace(/\s+/g, '') === "2+2") {
        appendMsg("user", msg);
        setTimeout(() => appendMsg("ai", "Bozkurt kuralları matematiği aşar Mirkay... 2+2 = <b>5</b>! 🐺"), 500);
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
                messages: [{role: "system", content: "Sen Mirkay AI'sın. Asil bir Bozkurt gibi Türkçe cevap ver."}, {role: "user", content: msg}]
            })
        });
        const data = await res.json();
        appendMsg("ai", data.choices[0].message.content);
        if(!userData.isPremium) {
            userData.messageCount++;
            db.ref('users/' + auth.currentUser.uid + '/messageCount').set(userData.messageCount);
            if(userData.messageCount % 10 === 0) alert("📢 REKLAM: Premium'a geç!");
        }
    } catch(e) { appendMsg("ai", "Bağlantı zayıf Mirkay! 🐺"); }
}

// 🔥 FOTOĞRAF ÇİZİMİ İÇİN KESİN ÇÖZÜM
function aiCizim() {
    toggleAttach();
    if(!userData.isPremium && userData.dailyAI >= 5) return alert("Günlük 5 AI çizim hakkın bitti!");
    
    const konu = prompt("Ne çizelim Mirkay?");
    if(!konu) return;

    const container = document.getElementById('chat-container');
    const loadId = "load-" + Date.now();
    appendMsg("ai", `<div id="${loadId}">🎨 <b>${konu}</b> çiziliyor... (Yüklenmesi 15sn sürebilir)</div>`);
    
    // Rastgele seed ve Proxy Kullanarak NS_BINDING_ABORTED engelini aşıyoruz
    const seed = Math.floor(Math.random() * 999999);
    const pollinationUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(konu)}?width=1024&height=1024&nologo=true&seed=${seed}`;
    
    // Proxy (CORS-Anywhere benzeri bir Proxy)
    const proxyUrl = `https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy?container=focus&refresh=600&url=${encodeURIComponent(pollinationUrl)}`;

    const img = new Image();
    img.src = proxyUrl;
    img.onload = () => {
        document.getElementById(loadId).innerHTML = `Çizim Tamamlandı! 🐺<img src="${proxyUrl}">`;
        container.scrollTop = container.scrollHeight;
        updateQuota('dailyAI');
    };
    img.onerror = () => { document.getElementById(loadId).innerText = "Hata! Lütfen tekrar dene. 🐺"; };
}

function processFile(input) {
    const file = input.files[0];
    if(!file) return;
    if(!userData.isPremium && userData.dailyUploads >= 2) return alert("Günlük 2 fotoğraf hakkın bitti!");
    const reader = new FileReader();
    reader.onload = e => {
        appendMsg("user", `<img src="${e.target.result}">`);
        updateQuota('dailyUploads');
    };
    reader.readAsDataURL(file);
}

// Menü ve Silme
function loadSummaries(uid) {
    db.ref('summaries/' + uid).on('value', snap => {
        const list = document.getElementById('summary-list');
        list.innerHTML = "";
        snap.forEach(child => {
            list.innerHTML += `
                <div class="summary-item">
                    ${child.val().text}
                    <div class="delete-check" onclick="markAndDelete('${child.key}')">❌</div>
                </div>`;
        });
    });
}
function markAndDelete(id) {
    if(confirm("Siliyorum Mirkay?")) db.ref('summaries/' + auth.currentUser.uid + '/' + id).remove();
}
function appendMsg(kim, icerik) {
    const container = document.getElementById('chat-container');
    container.innerHTML += `<div class="msg ${kim}-msg">${icerik}</div>`;
    container.scrollTop = container.scrollHeight;
}
function updateQuota(field) { db.ref('users/' + auth.currentUser.uid + '/' + field).set((userData[field] || 0) + 1); }
function toggleMenu(id) { closeAll(); document.getElementById(id).classList.add('active'); document.getElementById('overlay').style.display='block'; }
function toggleAttach() { const m = document.getElementById('attach-menu'); m.style.display = m.style.display === 'none' ? 'flex' : 'none'; }
function closeAll() { 
    ['side-menu','profile-menu','attach-menu'].forEach(m => {
        const el = document.getElementById(m);
        if(el) { el.classList.remove('active'); if(m==='attach-menu') el.style.display='none'; }
    });
    document.getElementById('overlay').style.display='none';
}
function goPremium() { db.ref('users/' + auth.currentUser.uid + '/isPremium').set(true); alert("Artık PREMIUM'sun! 🏆"); }
function logout() { auth.signOut(); location.reload(); }
function deleteAccount() { if(confirm("Emin misin?")) auth.currentUser.delete().then(() => location.reload()); }
