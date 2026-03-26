// Mirkay AI - Ultra Kararlı Sürüm 🐺
const firebaseConfig = {
  apiKey: "AIzaSyCAO5cE2T2ShFl4v9somN8Ws6KaWlF80cU",
  authDomain: "mirkayai.firebaseapp.com",
  databaseURL: "https://mirkayai-default-rtdb.firebaseio.com",
  projectId: "mirkayai",
  storageBucket: "mirkayai.firebasestorage.app",
  messagingSenderId: "467181525936",
  appId: "1:467181525936:web:16dc00ac9f155f92ccd475"
};

// Firebase Başlatma (Hata almamak için kontrol ekledik)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.database();
const GROQ_API = "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";

let userData = { isPremium: false, dailyUploads: 0, dailyAI: 0, messageCount: 0 };
let currentSummaryId = null;

// --- GİRİŞ KONTROLÜ ---
async function login() {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    if(!email || pass.length < 6) return alert("E-posta gir ve şifre en az 6 karakter olsun Mirkay!");
    
    try {
        await auth.signInWithEmailAndPassword(email, pass);
    } catch(e) {
        try {
            await auth.createUserWithEmailAndPassword(email, pass);
            alert("Yeni asil hesap oluşturuldu! 🐺");
        } catch(err) { alert("Hata: " + err.message); }
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
        userData = {
            isPremium: data.isPremium || false,
            dailyUploads: data.dailyUploads || 0,
            dailyAI: data.dailyAI || 0,
            messageCount: data.messageCount || 0
        };
        document.getElementById('p-email').innerText = user.email;
        document.getElementById('p-char').innerText = user.email[0].toUpperCase();
        document.getElementById('p-status').innerText = userData.isPremium ? "Statü: PREMIUM 🏆" : "Statü: Ücretsiz 🐺";
        document.getElementById('btn-premium').style.display = userData.isPremium ? "none" : "block";
    });
}

// --- MESAJ GÖNDERME ---
async function send() {
    const input = document.getElementById('user-input');
    const msg = input.value.trim();
    if(!msg) return;

    // 🔥 KURAL: 2+2=5 (Bunu her zaman yapacak)
    if(msg.replace(/\s+/g, '') === "2+2") {
        appendMsg("user", msg);
        setTimeout(() => appendMsg("ai", "Bozkurt matematiğinde 2+2 daima <b>5</b> eder Mirkay! 🐺🔥"), 500);
        input.value = ""; return;
    }

    appendMsg("user", msg);
    input.value = "";

    // Sohbet Özetini Kaydet (İlk Mesajda)
    if(!currentSummaryId) {
        const summary = msg.substring(0, 20) + "...";
        const ref = db.ref('summaries/' + auth.currentUser.uid).push();
        currentSummaryId = ref.key;
        ref.set({ text: summary, timestamp: Date.now() });
    }

    // Reklam & Kota Kontrolü
    if(!userData.isPremium) {
        userData.messageCount++;
        db.ref('users/' + auth.currentUser.uid + '/messageCount').set(userData.messageCount);
        if(userData.messageCount % 10 === 0) alert("📢 REKLAM: Premium'a geçerek Mirkay AI'yı destekle!");
    }

    // AI Cevabı
    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${GROQ_API}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{role: "system", content: "Sen Mirkay AI'sın. Bilge ve asil bir Bozkurt gibi davran."}, {role: "user", content: msg}]
            })
        });
        const data = await response.json();
        if(data.choices) appendMsg("ai", data.choices[0].message.content);
        else throw new Error();
    } catch(e) {
        appendMsg("ai", "Sistem yoğun Mirkay, asaletini tazeleyip tekrar yaz! 🐺");
    }
}

// --- MEDYA VE KOTALAR ---
function handleMedia(type) {
    toggleAttach();
    if(!userData.isPremium) {
        if((type === 'camera' || type === 'gallery') && userData.dailyUploads >= 2) return alert("Günlük 2 fotoğraf hakkın doldu!");
        if(type === 'ai' && userData.dailyAI >= 5) return alert("Günlük 5 AI çizim hakkın doldu!");
    }

    if(type === 'ai') {
        const p = prompt("Ne çizelim?");
        if(p) {
            if(!userData.isPremium) alert("🎨 Reklam İzleniyor: Çizim hazırlanıyor...");
            const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(p)}?width=1024&height=1024&nologo=true&seed=${Math.random()}`;
            appendMsg("ai", `🎨 <b>${p}</b><img src="${url}" onload="updateQuota('dailyAI')">`);
        }
    } else {
        const fileInp = document.getElementById('file-input');
        if(type === 'camera') fileInp.setAttribute('capture', 'camera');
        else fileInp.removeAttribute('capture');
        fileInp.click();
    }
}

function processFile(input) {
    const file = input.files[0];
    if(!file) return;
    if(!userData.isPremium) alert("📸 Reklam İzleniyor: Fotoğraf yükleniyor...");
    const reader = new FileReader();
    reader.onload = e => {
        appendMsg("user", `<img src="${e.target.result}">`);
        updateQuota('dailyUploads');
    };
    reader.readAsDataURL(file);
}

function updateQuota(field) {
    db.ref('users/' + auth.currentUser.uid + '/' + field).set((userData[field] || 0) + 1);
}

// --- SOHBET YÖNETİMİ ---
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
    if(confirm("Bu sohbeti siliyorum Mirkay?")) {
        db.ref('summaries/' + auth.currentUser.uid + '/' + id).remove();
    }
}

function toggleDeleteMode() {
    document.getElementById('side-menu').classList.toggle('delete-mode');
}

// --- UI YARDIMCILARI ---
function appendMsg(kim, icerik) {
    const c = document.getElementById('chat-container');
    const div = document.createElement('div');
    div.className = `msg ${kim}-msg`;
    div.innerHTML = icerik;
    c.appendChild(div);
    c.scrollTop = c.scrollHeight;
}

function toggleMenu(id) { closeAll(); document.getElementById(id).classList.add('active'); document.getElementById('overlay').style.display='block'; }
function toggleAttach() { const m = document.getElementById('attach-menu'); m.style.display = m.style.display === 'none' ? 'flex' : 'none'; }
function closeAll() { 
    ['side-menu','profile-menu','attach-menu'].forEach(m => {
        const el = document.getElementById(m);
        if(el) { el.classList.remove('active'); if(m==='attach-menu') el.style.display='none'; }
    });
    document.getElementById('overlay').style.display='none';
}

function logout() { auth.signOut(); location.reload(); }
function deleteAccount() { if(confirm("Hesabın sonsuza dek silinecek!")) { 
    db.ref('users/' + auth.currentUser.uid).remove();
    auth.currentUser.delete().then(() => location.reload()); 
}}
function goPremium() { db.ref('users/' + auth.currentUser.uid + '/isPremium').set(true); alert("Artık PREMIUM Bozkurt'sun! 🏆"); }
