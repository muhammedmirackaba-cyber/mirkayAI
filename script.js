// 1. AYARLAR VE FIREBASE BAŞLATMA
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

// Firebase Başlatma (Hata Kontrollü)
try {
    if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
} catch (e) { console.error("Firebase başlatılamadı:", e); }

const auth = firebase.auth();
const db = firebase.database();

// Yerel İstatistik Tutma (Firebase hatası olsa bile çalışması için)
let stats = JSON.parse(localStorage.getItem('mirkayStats')) || { isPremium: false, toplamMesaj: 0 };

// KULLANICI TAKİBİ
auth.onAuthStateChanged(user => {
    const emailText = document.getElementById('user-email');
    const statusText = document.getElementById('status-text');
    
    if (user) {
        emailText.innerText = user.email || "Misafir Modu";
        db.ref('users/' + user.uid).on('value', snap => {
            if(snap.val()) {
                stats = snap.val();
                localStorage.setItem('mirkayStats', JSON.stringify(stats));
                guncelleUI();
            }
        });
    } else {
        emailText.innerText = "Cihaz Modu (Offline)";
        statusText.innerText = "Ücretsiz (Yerel Hafıza)";
    }
    guncelleUI();
});

function guncelleUI() {
    document.getElementById('status-text').innerText = stats.isPremium ? "Statü: Premium 🏆" : "Statü: Ücretsiz 🐺";
    document.getElementById('premium-btn').style.display = stats.isPremium ? "none" : "block";
}

// YAPAY ZEKA BAĞLANTISI (Llama 3.3 Versatile)
async function groqCevapAl(messages) {
    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: messages,
                temperature: 0.7,
                max_tokens: 1024
            })
        });
        const data = await response.json();
        return data.choices ? data.choices[0].message.content : "Üzgünüm, cevap üretemedim.";
    } catch (e) {
        return "Bağlantıda bir fırtına var Mirkay! Lütfen internetini kontrol et. 🐺";
    }
}

// MESAJ GÖNDERME
async function mesajGonder() {
    const input = document.getElementById('user-input');
    const msg = input.value.trim();
    if (!msg) return;

    const container = document.getElementById('chat-container');
    container.innerHTML += `<div class="msg user-msg">${msg}</div>`;
    input.value = "";
    container.scrollTop = container.scrollHeight;

    // İstatistik Güncelle
    stats.toplamMesaj++;
    localStorage.setItem('mirkayStats', JSON.stringify(stats));
    if (auth.currentUser) {
        db.ref('users/' + auth.currentUser.uid).update(stats);
    }

    const initialMessages = [
        { role: "system", content: "Sen Mirkay AI'sın. Asil bir kurt gibi, cesur, zeki ve kısa cevaplar ver." },
        { role: "user", content: msg }
    ];

    const aiCevap = await groqCevapAl(initialMessages);
    
    setTimeout(() => {
        container.innerHTML += `<div class="msg ai-msg">${aiCevap}</div>`;
        if (stats.toplamMesaj % 25 === 0) {
            container.innerHTML += `<div class="msg" style="background:#fffbe6; font-size:12px; text-align:center; padding:10px; border-radius:10px;">🎬 Reklam: Premium ile sınırsız özelliğe sahip ol!</div>`;
        }
        container.scrollTop = container.scrollHeight;
    }, 400);
}

// 🔥 YENİ: VİDEO YÖNETMENİ ÖZELLİĞİ 🔥
async function videoOlustur() {
    // 1. Kullanıcıdan konu al
    const konu = prompt("Yapay Zeka Video Yönetmeni: Hangi konuda bir video senaryosu oluşturmamı istersin Mirkay?");
    if (!konu) return; // İptal edilirse çık

    const container = document.getElementById('chat-container');
    
    // 2. Kullanıcının talebini ve "Video Oluşturuluyor..." mesajını sohbete ekle
    container.innerHTML += `<div class="msg user-msg">Senaryo: ${konu}</div>`;
    container.innerHTML += `<div class="msg ai-msg" style="color: blue; font-weight: bold;">[YÖNETMEN MİRKAY MODU AKTİF] - ${konu} konusu için senaryo ve sahne betimlemeleri hazırlanıyor, lütfen bekle... 🎬✨</div>`;
    container.scrollTop = container.scrollHeight;

    // 3. Yapay zeka (Groq) için özel "sistem" mesajı oluştur
    const videoSystemMessage = "Sen Mirkay AI'sın ama şimdi bir 'Video Yönetmeni' gibi davranmalısın. Kullanıcının vereceği konuya göre, 1 dakikalık kısa bir film için profesyonel bir senaryo (diyaloglar ve sahne betimlemeleri) yaz. 'Sahne 1: [Mekan/Zaman/Atmosfer]', 'Diyaloglar: [Karakter İsmi]: [Konuşma]' formatını kullan. Cevabın sonunda 'Yönetmen Notu' ekle. Kısa ve etkileyici olsun.";

    const videoMessages = [
        { role: "system", content: videoSystemMessage },
        { role: "user", content: "Konu: " + konu }
    ];

    // 4. Groq'dan senaryoyu iste
    const senaryoCevabi = await groqCevapAl(videoMessages);

    // 5. Senaryoyu sohbete ekle
    setTimeout(() => {
        // "Oluşturuluyor..." mesajını kaldırabiliriz veya altına ekleyebiliriz. Altına ekleyelim.
        container.innerHTML += `<div class="msg ai-msg">${senaryoCevabi}</div>`;
        container.scrollTop = container.scrollHeight;
    }, 1000);
}

// DİĞER FONKSİYONLAR
function emailBagla() {
    if (!auth.currentUser) {
        alert("Önce anonim olarak bağlanmanız bekleniyor...");
        return;
    }
    const email = prompt("E-posta:");
    const pass = prompt("Şifre:");
    if(email && pass) {
        const cred = firebase.auth.EmailAuthProvider.credential(email, pass);
        auth.currentUser.linkWithCredential(cred).then(() => location.reload()).catch(e => alert(e.message));
    }
}
function cikisYap() { if(confirm("Çıkış?")) auth.signOut().then(() => location.reload()); }
function premiumSatinal() { window.open("https://play.google.com/store/account/subscriptions", "_blank"); }
function toggleMenu(id) { closeAllMenus(); document.getElementById(id).classList.add('active'); document.getElementById('overlay').style.display = 'block'; }
function closeAllMenus() { 
    document.getElementById('side-menu').classList.remove('active'); 
    document.getElementById('profile-menu').classList.remove('active'); 
    document.getElementById('overlay').style.display = 'none'; 
}
