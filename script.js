// Mirkay AI | Nihai Çözüm 🐺
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

if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const auth = firebase.auth();
const db = firebase.database();

auth.onAuthStateChanged(user => {
    if (user) {
        document.getElementById('user-email').innerText = user.email || "Misafir Mirkay";
        db.ref('users/' + user.uid).on('value', snap => {
            if(snap.val() && snap.val().isPremium) {
                document.getElementById('status-text').innerText = "Statü: Premium Üye 🏆";
                document.getElementById('status-text').style.color = "gold";
            }
        });
    } else {
        auth.signInAnonymously();
    }
});

// 🔥 POLLINATIONS KESİN ÇÖZÜM (Görseli sohbete anında düşürür)
function fotoGrafOlustur() {
    toggleAttachMenu();
    const konu = prompt("Mirkay AI Ne Çizsin? (İngilizce daha iyi sonuç verir)");
    if (!konu) return;

    const container = document.getElementById('chat-container');
    const loadId = "f-" + Date.now();
    
    // Mesaj alanına "Yükleniyor" mesajı ekle
    container.innerHTML += `<div class="msg ai-msg" id="${loadId}">🎨 <b>${konu}</b> çiziliyor, lütfen bekle...</div>`;
    container.scrollTop = container.scrollHeight;

    // Resim URL'sini oluştur (Genişlik/Yükseklik sabitlendi)
    const encoded = encodeURIComponent(konu);
    const imgUrl = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random()*99999)}`;

    // Resmi oluştur ve yüklenince ekrana bas
    const tempImg = new Image();
    tempImg.src = imgUrl;
    
    tempImg.onload = function() {
        document.getElementById(loadId).remove();
        container.innerHTML += `
            <div class="msg ai-msg">
                <img src="${imgUrl}">
                <p style="text-align:center; font-weight:bold; margin-top:5px;">MİRKAY AI SANAT 🐺</p>
            </div>`;
        container.scrollTop = container.scrollHeight;
    };

    tempImg.onerror = function() {
        document.getElementById(loadId).innerText = "Hata! Lütfen başka bir kelime dene Mirkay. 🐺";
    };
}

// Groq Mesajlaşma
async function mesajGonder() {
    const input = document.getElementById('user-input');
    const msg = input.value.trim();
    if (!msg) return;

    const container = document.getElementById('chat-container');
    container.innerHTML += `<div class="msg user-msg">${msg}</div>`;
    input.value = "";
    container.scrollTop = container.scrollHeight;

    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{role:"system", content:"Asil bir Bozkurt gibi Türkçe cevap ver."}, {role:"user", content:msg}] })
        });
        const data = await res.json();
        container.innerHTML += `<div class="msg ai-msg">${data.choices[0].message.content}</div>`;
    } catch(e) {
        container.innerHTML += `<div class="msg ai-msg">Bir hata oldu, tekrar yazar mısın? 🐺</div>`;
    }
    container.scrollTop = container.scrollHeight;
}

// Fonksiyonlar
function premiumOl() {
    if(confirm("Premium hesaba geçmek istiyor musun?")) {
        db.ref('users/' + auth.currentUser.uid).update({ isPremium: true });
        alert("Tebrikler Mirkay, artık Premium'sun! 🏆");
    }
}
function tetikleDosya(t) {
    toggleAttachMenu();
    if(t === 'gallery') document.getElementById('input-gallery').click();
    if(t === 'camera') document.getElementById('input-camera').click();
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
