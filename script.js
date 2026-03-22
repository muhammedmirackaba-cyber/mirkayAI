<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Mirkay AI</title>
    <link rel="stylesheet" href="style.css"> <style>
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        body { margin: 0; background: #fff; font-family: sans-serif; height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
        
        /* Bozkurt Arka Plan */
        .wolf-bg { position: fixed; top: 45%; left: 50%; transform: translate(-50%, -50%); width: 280px; opacity: 0.07; z-index: -1; pointer-events: none; }
        
        /* Reklam Bandı */
        .ads-bar { background: #fff9c4; color: #856404; text-align: center; padding: 5px; font-size: 12px; border-bottom: 1px solid #eee; font-weight: bold; }

        .top-bar { height: 60px; display: flex; align-items: center; justify-content: space-between; padding: 0 15px; background: #fff; border-bottom: 1px solid #eee; z-index: 1000; }
        .hamburger, .profile-btn { font-size: 24px; cursor: pointer; padding: 5px; }

        /* Paneller */
        .side-panel { position: fixed; top: 0; width: 280px; height: 100%; background: #000; color: #fff; transition: 0.3s; z-index: 2000; display: flex; flex-direction: column; }
        #side-menu { left: -280px; }
        #side-menu.active { left: 0; }
        #profile-menu { right: -280px; background: #fff; color: #000; border-left: 1px solid #eee; padding: 20px; }
        #profile-menu.active { right: 0; }

        /* Chat */
        #chat-container { flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; }
        .msg { padding: 12px 16px; border-radius: 18px; margin: 5px 0; max-width: 85%; font-size: 15px; }
        .user-msg { align-self: flex-end; background: #000; color: #fff; border-bottom-right-radius: 4px; }
        .ai-msg { align-self: flex-start; background: #f0f0f0; color: #000; border-bottom-left-radius: 4px; border: 1px solid #eee; }
        .limit-msg { align-self: center; background: #fff3f3; color: #d32f2f; border: 1px solid #ffcdd2; text-align: center; width: 95%; font-size: 13px; font-weight: bold; }

        /* Input Form (Enter Fix) */
        .input-wrapper { padding: 10px 15px 25px; background: #fff; border-top: 1px solid #eee; }
        #chat-form { display: flex; gap: 8px; }
        input { flex: 1; padding: 12px 18px; border: 1px solid #ddd; border-radius: 25px; font-size: 16px; outline: none; }
        .send-btn { width: 45px; height: 45px; background: #000; color: #fff; border: none; border-radius: 50%; cursor: pointer; }
        
        .btn-m { width: 100%; padding: 12px; border-radius: 8px; border: none; font-weight: bold; margin-bottom: 10px; cursor: pointer; }
    </style>
</head>
<body>

    <div class="ads-bar">🚀 Mirkay AI Premium: Reklamsız ve Sınırsız Deneyim!</div>

    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Gray_wolf_head_silhouette.svg/1024px-Gray_wolf_head_silhouette.svg.png" class="wolf-bg">

    <div class="top-bar">
        <div class="hamburger" onclick="toggleMenu('side-menu')">☰</div>
        <strong>MİRKAY AI</strong>
        <div class="profile-btn" onclick="toggleMenu('profile-menu')">👤</div>
    </div>

    <div id="side-menu" class="side-panel">
        <div style="padding:20px; border-bottom:1px solid #222;">Sohbet Geçmişi</div>
        <div id="history-list" style="flex:1; overflow-y:auto; padding:10px;"></div>
        <div style="padding:15px; border-top:1px solid #222;">
            <button class="btn-m" style="background:#fff;" onclick="yeniSohbet()">+ Yeni Sohbet</button>
        </div>
    </div>

    <div id="profile-menu" class="side-panel">
        <h3 style="color:#000">Hesap Özeti</h3>
        <p id="status-info" style="color:#666; font-size:14px;"></p>
        <hr>
        <button class="btn-m" style="background:#FFD700; color:#000" onclick="alert('Yakında!')">🏆 Premium Satın Al</button>
        <button class="btn-m" style="background:#f0f0f0; color:#000" onclick="alert('Günlük görsel hakkınız: 1/1')">🖼️ Görsel Yükle</button>
        <button class="btn-m" style="background:#ff4d4d; color:#fff" onclick="location.reload()">Çıkış Yap</button>
    </div>

    <div id="chat-container"></div>

    <div class="input-wrapper">
        <form id="chat-form" onsubmit="event.preventDefault(); mesajGonder();">
            <input type="text" id="user-input" placeholder="Mirkay AI'a bir şeyler yaz..." autocomplete="off">
            <button type="submit" class="send-btn">🚀</button>
        </form>
    </div>

    <script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-database-compat.js"></script>
    <script src="script.js"></script>
</body>
</html>
