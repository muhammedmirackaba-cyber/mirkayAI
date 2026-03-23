// Mirkay AI | script.js Kararlı Sürüm

// 1. AYARLAR
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

// Firebase Başlatma (Double-init hatasını önlemek için)
if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const auth = firebase.auth();
const db = firebase.database();

let stats = { isPremium: false, toplamMesaj: 0 };
let isAuthReady = false; // Firebase bağlantısının hazır olup olmadığı kontrolü

// Sohbet Başlangıcı
const container = document.getElementById('chat-container');
if (container.innerHTML.trim() === '') {
    setTimeout(() => {
        container.innerHTML += `<div class="msg ai-msg">Merhaba Mirkay! Bozkurt gibi asil ve cesur bir şekilde karşıma çıkıyorum. Bugün vatan için, bilim için, senin için ne yapabiliriz? 🐺</div>`;
    }, 500);
}

// 2. KULLANICI TAKİBİ VE MENÜ GÜNCELLEME
auth.onAuthStateChanged(user => {
    const emailText = document.getElementById('user-email');
    const statusTextActual = document.getElementById('actual-status');
    const pBtn = document.getElementById('premium-btn');
    
    if (user) {
        // Kullanıcı giriş yaptı (Anonim veya E-posta)
        isAuthReady = true;
        emailText.innerText = user.email || "Misafir Modu (Anonim)";
        
        // Firebase Veritabanından Kullanıcı Verilerini Gerçek Zamanlı Takip Et
        db.ref('users/' + user.uid).on('value', snap => {
            let data = snap.val();
            if (!data) {
                // Eğer veritabanında kaydı yoksa (ilk girişse) oluştur
                data = { isPremium: false, toplamMesaj: 0, kayitTarihi: new Date().toISOString() };
                db.ref('users/' + user.uid).set(data);
            }
            stats = data;
            
            // Profil UI Güncelle
            statusTextActual.innerHTML = stats.isPremium ? "<span style='color:#f1c40f'>Premium 🏆</span>" : "Ücretsiz 🐺";
            statusTextActual.style.color = stats.isPremium ? "#f1c40f" : "#000";
            pBtn.style.display = stats.isPremium ? "none" : "block"; // Premium ise butonu gizle
        });
    } else {
        // Kullanıcı çıkış yaptı veya bağlantı bekleniyor
        isAuthReady = false;
        emailText.innerText = "Bağlanıyor...";
        statusTextActual.innerText = "Yükleniyor...";
        pBtn.style.display = "none";
        
        // Otomatik Anonim Girişi Dene (Firebase panelinden aktif ettiysen çalışır)
        auth.signInAnonymously().catch(e => {
            console.error("Anonim Giriş Hatası (Panelden aktif mi?):", e.message);
            emailText.innerText = "Yerel Mod (Hata)";
            statusTextActual.innerText = "Ücretsiz (Offline)";
        });
    }
});

// 🔥 YENİ: ATAÇ MENÜSÜ FONKSİYONLARI

// 1. Ataç Menüsünü Aç/Kapat
function toggleAttachMenu() {
    closeAllMenus(); // Diğer menüleri kapa
    document.getElementById('attach-menu').classList.toggle('active');
}

// 2. Seçilen Türüne Göre Gizli Dosya Girişini Tetikle
function tetikleDosyaSec(tur) {
    toggleAttachMenu(); // Menüyü kapat
    if (tur === 'file') {
        document.getElementById('file-input-gallery').click(); // Galeriyi aç
    } else if (tur === 'camera') {
        document.getElementById('file-input-camera').click(); // Kamerayı aç
    }
}

// 3. Resim Seçildiğinde Sohbete Ekle
function resimSecildi(input, kaynak) {
    if (input.files && input.files[0]) {
        if (input.files[0].size > 5 * 1024 * 1024) { // 5MB Sınırı
            alert("Görsel çok büyük. En fazla 5MB gönderebilirsin Mirkay.");
            input.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const container = document.getElementById('chat-container');
            const userMsg = `<div class="msg user-msg"><img src="${e.target.result}" alt="Kullanıcı Görseli"><br><small style="opacity:0.6; font-size:10px;">${kaynak === 'kamera' ? 'Kamera' : 'Galeri'}</small></div>`;
            container.innerHTML += userMsg;
            container.scrollTop = container.scrollHeight;
            
            // Premium hakkı kontrolü (İsteğe bağlı)
            if(!stats.isPremium) {
                console.log("Ücretsiz kullanıcı resim gönderdi.");
            }
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// 3. YAPAY ZEKA BAĞLANTISI (Llama 3.3 Versatile)
async function groqCevapAl(mesaj) {
    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile", // En güncel ve hızlı model
                messages: [
                    { role: "system", content: "Sen Mirkay AI'sın. Asil bir kurt gibi, cesur, zeki ve öz konuş. Türk milliyetçisi bir ruhla, bilimsel ve bilgece cevaplar ver." },
                    { role: "user", content: mesaj }
                ],
                temperature: 0.7,
                max_tokens: 1024
            })
        });

        const data = await response.json();
        
        if (data.error) {
            console.error("Groq API Hatası:", data.error.message);
            return "Şu an Groq ile bağlantıda bir fırtına var, ama kurtlar pes etmez Mirkay! 🐺";
        }
        
        return data.choices ? data.choices[0].message.content : "Üzgünüm, cevap üretemedim.";
    } catch (e) {
        console.error("Fetch Hatası:", e);
        return "Bağlantıda bir sorun oldu Mirkay! Lütfen internetini kontrol et. 🐺";
    }
}

// 4. MESAJ GÖNDERME (HATA KORUMALI)
async function mesajGonder() {
    // 🔥 FIX: Firebase girişi tamamlanmadan UID'ye erişmeye çalışan TypeError'u önler
    if (!isAuthReady || !auth.currentUser) {
        alert("Bağlantı kuruluyor, lütfen bir saniye bekle...");
        return;
    }

    const input = document.getElementById('user-input');
    const msg = input.value.trim();
    if (!msg) return;

    const container = document.getElementById('chat-container');
    container.innerHTML += `<div class="msg user-msg">${msg}</div>`;
    input.value = "";
    container.scrollTop = container.scrollHeight;

    // İstatistik Güncelle
    let yeniSayi = (stats.toplamMesaj || 0) + 1;
    db.ref('users/' + auth.currentUser.uid).update({ toplamMesaj: yeniSayi });

    const aiCevap = await groqCevapAl(msg);
    
    setTimeout(() => {
        container.innerHTML += `<div class="msg ai-msg">${aiCevap}</div>`;
        
        // Reklam mantığı (25 mesajda bir)
        if (yeniSayi % 25 === 0 && !stats.isPremium) {
            container.innerHTML += `<div class="msg ai-msg" style="background:#fffbe6; font-size:12px; text-align:center; padding:10px; border: 1px solid #f1c40f; color:#856404;">🎬 Reklam: Premium ile sınırsız özelliğe sahip ol ve Mirkay'ı destekle!</div>`;
        }
        container.scrollTop = container.scrollHeight;
    }, 400);
}

// 5. PROFİL MENÜSÜ İŞLEMLERİ (HATA FİXLERİ)
function emailBagla() {
    // 🔥 FIX: Kullanıcı yoksa veya bağlantı hazır değilse hata vermeyi önler
    if (!isAuthReady || !auth.currentUser) {
        alert("Bağlantı henüz hazır değil, lütfen bekle...");
        return;
    }

    const email = prompt("Kayıt olmak istediğin E-Posta adresini gir:");
    const pass = prompt("Bir şifre belirle (en az 6 karakter):");

    if (email && pass) {
        // E-posta kimliğini oluştur
        const credential = firebase.auth.EmailAuthProvider.credential(email, pass);

        // Mevcut anonim hesabı bu e-posta ile linkle (Yükselt)
        auth.currentUser.linkWithCredential(credential)
            .then(() => {
                alert("Başarılı! Hesabın artık E-Posta ile bağlandı. 🐺");
                location.reload(); // Değişiklikleri yansıtmak için yenile
            })
            .catch(error => {
                // Özel hata kodlarını kontrol et
                if (error.code === 'auth/operation-not-allowed') {
                    alert("Hata: Firebase panelinde 'Email/Password' giriş yöntemi kapalı! Paneli kontrol etmelisin.");
                } else if (error.code === 'auth/email-already-in-use') {
                    alert("Bu E-Posta zaten başka bir hesap tarafından kullanılıyor.");
                } else if (error.code === 'auth/provider-already-linked') {
                    alert("Bu hesap zaten bir e-postaya bağlı.");
                } else {
                    alert("Hata oluştu: " + error.message);
                }
                console.error("Kayıt Hatası:", error);
            });
    }
}

function cikisYap() { 
    if(confirm("Hesaptan çıkış yapmak istediğine emin misin Mirkay?")) {
        auth.signOut().then(() => location.reload()); 
    }
}

function premiumSatinal() { 
    window.open("https://play.google.com/store/account/subscriptions", "_blank"); 
}

// 6. MENÜ KONTROLLERİ
function toggleMenu(id) { 
    closeAllMenus();
    document.getElementById(id).classList.add('active'); 
    document.getElementById('overlay').style.display = 'block'; 
}

function closeAllMenus() { 
    document.getElementById('side-menu').classList.remove('active'); 
    document.getElementById('profile-menu').classList.remove('active'); 
    document.getElementById('attach-menu').classList.remove('active'); // Ataç menüsünü de kapa
    document.getElementById('overlay').style.display = 'none'; 
}

// Dışarı tıklayınca ataç menüsünü kapat
document.addEventListener('click', function(event) {
    const attachMenu = document.getElementById('attach-menu');
    const attachBtn = document.querySelector('.attach-btn');
    if (attachMenu.classList.contains('active') && event.target !== attachBtn && !attachMenu.contains(event.target)) {
        attachMenu.classList.remove('active');
    }
});
