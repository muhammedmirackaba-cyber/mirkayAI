// Senin Firebase Bilgilerinle Kurulum
const firebaseConfig = {
  apiKey: "AIzaSyCAO5cE2T2ShFl4v9somN8Ws6KaWlF80cU",
  authDomain: "mirkayai.firebaseapp.com",
  databaseURL: "https://mirkayai-default-rtdb.firebaseio.com",
  projectId: "mirkayai",
  storageBucket: "mirkayai.firebasestorage.app",
  messagingSenderId: "467181525936",
  appId: "1:467181525936:web:16dc00ac9f155f92ccd475"
};

// Firebase'i Başlat
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// --- 1. AKILLI ÖZETLEME SİSTEMİ ---
function sohbetiOzetle(mesaj) {
    const kucuk = mesaj.toLowerCase();
    if (kucuk.includes("merhaba") || kucuk.includes("selam")) return "Selamlaşma 👋";
    if (kucuk.includes("nasılsın")) return "Hal Hatır 😊";
    if (kucuk.includes("kod") || kucuk.includes("yazılım")) return "Yazılım Yardımı 💻";
    if (kucuk.includes("şerim") || kucuk.includes("paylaş")) return "Paylaşım/Şerim 📤";
    return mesaj.length > 20 ? mesaj.substring(0, 20) + "..." : mesaj;
}

// --- 2. GÜNLÜK HAK KONTROLÜ (100 Hak + 1 Şerim) ---
auth.onAuthStateChanged((user) => {
    if (user) {
        const userRef = db.ref('users/' + user.uid);
        userRef.on('value', (snap) => {
            const data = snap.val();
            if (!data) return;

            const bugun = new Date().toLocaleDateString();
            
            // Yeni gün kontrolü: Eğer tarih değiştiyse hakları yenile
            if (data.sonGiris !== bugun && !data.isPremium) {
                userRef.update({
                    kalanHak: 100,
                    serimHakki: 1,
                    sonGiris: bugun
                });
            }

            // Arayüzü Güncelle (HTML'deki ID'lere göre)
            const userDisp = document.getElementById('display-username');
            const statusDisp = document.getElementById('display-status');
            
            if(userDisp) userDisp.innerText = data.username;
            if(statusDisp) {
                statusDisp.innerText = data.isPremium 
                    ? "Statü: Premium (Sınırsız)" 
                    : `Hak: ${data.kalanHak} | Şerim: ${data.serimHakki}`;
            }
            
            document.getElementById('auth-section')?.classList.add('hidden');
            document.getElementById('user-section')?.classList.remove('hidden');
        });
    }
});

// --- 3. MESAJ GÖNDERME VE KAYDETME ---
function mesajGonder() {
    const input = document.getElementById('user-input');
    const msg = input.value;
    const user = auth.currentUser;

    if (!user) return alert("Önce giriş yapmalısın!");
    if (!msg) return;

    db.ref('users/' + user.uid).once('value', (snap) => {
        const data = snap.val();
        
        // Premium mu yoksa hakkı var mı kontrol et
        if (data.isPremium || data.kalanHak > 0) {
            
            // Mesajı ekrana bas (Basit gösterim)
            const container = document.getElementById('chat-container');
            if(container) container.innerHTML += `<div class="msg user-msg">${msg}</div>`;
            
            // SOHBETİ ÖZETLEYEREK KAYDET
            const ozet = sohbetiOzetle(msg);
            db.ref('history/' + user.uid).push({
                baslik: ozet,
                tamMesaj: msg,
                tarih: firebase.database.ServerValue.TIMESTAMP
            });

            // Kullanıcı Premium değilse hakkını 1 düşür
            if (!data.isPremium) {
                db.ref('users/' + user.uid).update({ kalanHak: data.kalanHak - 1 });
            }
            input.value = "";
        } else {
            alert("Bugünlük 100 mesaj hakkın doldu! Premium alarak sınırsız kullanabilirsin.");
        }
    });
}

// --- 4. HIZLI KAYIT VE GİRİŞ (İsim + Şifre) ---
function hizliKayit() {
    const isim = document.getElementById('reg-username').value;
    const sifre = document.getElementById('reg-password').value;
    
    if(isim.length < 3) return alert("İsim en az 3 karakter olmalı!");
    if(sifre.length < 6) return alert("Şifre en az 6 karakter olmalı!");

    // İsimden sahte e-posta üret (Firebase email istediği için)
    const email = `${isim.toLowerCase().replace(/\s/g, '')}@mirkay.ai`;

    auth.signInWithEmailAndPassword(email, sifre)
    .then(() => {
        toggleMenu(); // Giriş başarılıysa menüyü kapat
    })
    .catch((error) => {
        // Kullanıcı yoksa yeni kayıt oluştur
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            auth.createUserWithEmailAndPassword(email, sifre)
            .then((result) => {
                db.ref('users/' + result.user.uid).set({
                    username: isim,
                    isPremium: false,
                    kalanHak: 100,
                    serimHakki: 1,
                    sonGiris: new Date().toLocaleDateString()
                });
            })
            .catch(e => alert("Kayıt hatası: " + e.message));
        } else {
            alert("Giriş başarısız: Şifre hatalı olabilir.");
        }
    });
}

// --- 5. YARDIMCI FONKSİYONLAR ---
function toggleMenu() {
    document.getElementById('side-menu')?.classList.toggle('active');
}

function cikisYap() {
    auth.signOut().then(() => location.reload());
}

function emailBagla() {
    const yeniEmail = prompt("Hesabını güvenceye almak için gerçek e-postanı yaz:");
    if (yeniEmail) {
        auth.currentUser.updateEmail(yeniEmail)
        .then(() => alert("E-posta başarıyla bağlandı!"))
        .catch(err => alert("Hata: " + err.message));
    }
}
