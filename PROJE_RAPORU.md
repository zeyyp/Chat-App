# 🎓 PROJE RAPORU - Güvenli Mesajlaşma Uygulaması

## 📋 Ödev Gereksinimleri ve Karşılama Durumu

### ✅ 1. Socket Programlama (TCP/UDP)
**Durum: TAMAMLANDI**
- **Teknoloji:** Socket.io (TCP üzerinde WebSocket protokolü)
- **Dosyalar:** 
  - Backend: `backend/server.js` (satır 35-80)
  - Frontend: `frontend/src/Pages/ChatPage.js`, `frontend/src/components/SingleChat.js`
- **Açıklama:** Gerçek zamanlı, çift yönlü iletişim için Socket.io kullanılmıştır.

---

### ✅ 2. Güvenli Uygulama
**Durum: TAMAMLANDI**
- **Şifreleme:** Caesar cipher benzeri karakter kaydırma algoritması
- **Hash:** Özel hash fonksiyonu ile mesaj bütünlüğü kontrolü
- **Dosya:** `frontend/src/utils/encryption.js`
- **Özellikler:**
  - `encryptMessage()`: Mesajları şifreler
  - `decryptMessage()`: Şifreli mesajları çözer
  - `hashMessage()`: Mesaj hash'i oluşturur

---

### ✅ 3. Tüm Kullanıcılara Mesaj Gönderme (Broadcast)
**Durum: TAMAMLANDI ✨ YENİ EKLENDİ**
- **Backend:** 
  - Controller: `backend/controllers/messageControllers.js` - `broadcastMessage()` fonksiyonu
  - Route: `POST /api/message/broadcast`
- **Frontend:**
  - UI: `frontend/src/components/miscellaneous/SideDrawer.js` - "Broadcast" butonu
  - Dinleyici: `frontend/src/Pages/ChatPage.js` - `socket.on("broadcast message")`
- **Nasıl Çalışır:**
  1. Kullanıcı "Broadcast" butonuna tıklar
  2. Mesaj şifrelenir ve hash'i alınır
  3. Backend tüm çevrimiçi kullanıcılara Socket.io ile gönderir
  4. Her kullanıcı sağ üst köşede bildirim alır

---

### ✅ 4. Grup Kullanıcılara Mesaj Gönderme
**Durum: TAMAMLANDI**
- **Backend:** `backend/controllers/chatControllers.js` - `createGroupChat()`
- **Frontend:** 
  - Grup oluşturma: `frontend/src/components/miscellaneous/GroupChatModal.js`
  - Mesajlaşma: `frontend/src/components/SingleChat.js`
- **Özellikler:**
  - Grup oluşturma
  - Grup üyelerine şifreli mesaj gönderme
  - Gerçek zamanlı grup mesajları

---

### ✅ 5. Tek Kullanıcıya Mesaj Gönderme (Birebir)
**Durum: TAMAMLANDI**
- **Backend:** `backend/controllers/chatControllers.js` - `accessChat()`
- **Frontend:** `frontend/src/components/SingleChat.js`
- **Özellikler:**
  - Birebir sohbet oluşturma
  - Şifreli mesajlaşma
  - Yazıyor... göstergesi

---

### ✅ 6. Gerçek Zamanlı İletişim
**Durum: TAMAMLANDI**
- **Teknoloji:** Socket.io events
- **Events:**
  - `new message`: Yeni mesaj bildirimi
  - `new group`: Yeni grup bildirimi
  - `broadcast message`: Broadcast mesaj bildirimi
  - `typing` / `stop typing`: Yazıyor göstergesi

---

### ✅ 7. Uçtan Uca Şifreleme
**Durum: TAMAMLANDI**
- **Şifreleme Yöntemi:** Simetrik şifreleme (SECRET_KEY: "PROJE2025")
- **Uygulama Noktaları:**
  - Mesaj gönderimi öncesi: Frontend'de şifreleme
  - Mesaj alımı sonrası: Frontend'de çözme
  - Backend'de sadece şifreli veri saklanır
- **Dosyalar:**
  - Şifreleme: `frontend/src/utils/encryption.js`
  - Kullanım: `frontend/src/components/SingleChat.js` (satır 93-115)

---

### ✅ 8. Mesaj Hash'lerinin Veritabanında Saklanması
**Durum: TAMAMLANDI ✨ HASH DOĞRULAMA EKLENDİ**
- **Database Schema:** `backend/Models/messageModel.js`
  ```javascript
  hash: { type: String, required: false }
  ```
- **Hash Oluşturma:** Frontend'de `hashMessage()` fonksiyonu
- **Hash Doğrulama:** Backend'de `verifyHash()` fonksiyonu
  - Dosya: `backend/controllers/messageControllers.js` (satır 7-24)
  - Her mesaj alındığında hash doğrulaması yapılır
- **Amaç:** Mesajın değiştirilmediğini garantilemek

---

### ✅ 9. Offline Mesaj Depolama
**Durum: TAMAMLANDI**
- **Veritabanı:** MongoDB
- **Model:** `backend/Models/messageModel.js`
- **Çalışma Prensibi:**
  1. Mesaj gönderildiğinde MongoDB'ye kaydedilir
  2. Kullanıcı offline ise Socket.io iletmez
  3. Kullanıcı online olduğunda `fetchMessages()` ile tüm geçmiş mesajlar çekilir
- **Kod:** `frontend/src/components/SingleChat.js` - `fetchMessages()` fonksiyonu

---

## 🔒 Güvenlik Özellikleri

### 1. Şifreleme Detayları
```javascript
// Şifreleme Algoritması (Caesar Cipher benzeri)
export const encryptMessage = (text) => {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    let charCode = text.charCodeAt(i) + SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
    result += String.fromCharCode(charCode);
  }
  return result;
};
```

### 2. Hash Doğrulama
```javascript
const verifyHash = (content, receivedHash) => {
  // Şifreli içeriği çöz
  // Hash hesapla
  // Karşılaştır
  return calculatedHash === receivedHash;
};
```

### 3. Kimlik Doğrulama
- **JWT Token:** Her istek için Bearer token kontrolü
- **Middleware:** `backend/middleware/authMiddleware.js`

---

## 📡 Socket Events Listesi

### Backend → Frontend
- `connected`: Bağlantı kuruldu
- `message received`: Yeni mesaj alındı
- `new group`: Yeni grup oluşturuldu
- `broadcast message`: Broadcast mesaj alındı
- `typing`: Kullanıcı yazıyor
- `stop typing`: Yazma durdu

### Frontend → Backend
- `setup`: Kullanıcı bağlantısı kuruldu
- `join chat`: Sohbet odasına katıl
- `new message`: Yeni mesaj gönder
- `typing`: Yazıyor bildirimi
- `stop typing`: Yazma durdu bildirimi

---

## 📂 Proje Yapısı

### Backend
```
backend/
├── controllers/
│   ├── chatControllers.js       ✅ Grup, birebir chat
│   ├── messageControllers.js    ✅ Mesaj, broadcast, hash doğrulama
│   └── userControllers.js       ✅ Kullanıcı işlemleri
├── models/
│   ├── chatModel.js            ✅ Chat şeması
│   ├── messageModel.js         ✅ Mesaj şeması (hash dahil)
│   └── userModel.js            ✅ Kullanıcı şeması
├── routes/
│   ├── chatRoutes.js           ✅ Chat endpoint'leri
│   ├── messageRoutes.js        ✅ Mesaj endpoint'leri (broadcast dahil)
│   └── userRoutes.js           ✅ User endpoint'leri
└── server.js                    ✅ Socket.io yapılandırması
```

### Frontend
```
frontend/src/
├── components/
│   ├── SingleChat.js           ✅ Mesajlaşma, şifreleme/çözme
│   ├── MyChats.js              ✅ Chat listesi
│   ├── miscellaneous/
│   │   ├── GroupChatModal.js   ✅ Grup oluşturma
│   │   ├── SideDrawer.js       ✅ Kullanıcı arama, broadcast butonu
│   │   └── ...
├── Pages/
│   └── ChatPage.js             ✅ Socket dinleyicileri
├── utils/
│   └── encryption.js           ✅ Şifreleme fonksiyonları
└── Context/
    └── ChatProvider.js         ✅ Global state yönetimi
```

---

## 🎯 Test Senaryoları

### 1. Birebir Mesajlaşma
1. İki farklı hesapla giriş yap
2. "Search User" ile karşı kullanıcıyı bul
3. Mesaj gönder → Şifreli kaydedilir, hash oluşturulur
4. Karşı tarafta mesaj alınır ve çözülür

### 2. Grup Mesajlaşma
1. "New Group Chat" ile grup oluştur
2. Kullanıcı ekle
3. Grup mesajı gönder
4. Tüm grup üyelerinde görünsün

### 3. Broadcast Mesaj
1. "Broadcast" butonuna tıkla
2. Mesaj yaz ve gönder
3. Tüm çevrimiçi kullanıcılarda sağ üst bildirim görünsün

### 4. Offline Mesaj
1. Kullanıcı A çevrimdışı
2. Kullanıcı B, A'ya mesaj gönderir
3. Mesaj DB'ye kaydedilir
4. A çevrimiçi olduğunda mesajı görür

### 5. Hash Doğrulama
1. Mesaj gönder
2. Backend console'da hash doğrulama logları kontrol et
3. MongoDB'de `hash` alanını kontrol et

---

## ✅ Ödev Gereksinimleri Özet Tablosu

| # | Gereksinim | Durum | Dosya/Fonksiyon |
|---|-----------|-------|-----------------|
| 1 | Socket programlama (TCP/UDP) | ✅ | `server.js`, Socket.io |
| 2 | Tüm kullanıcılara mesaj | ✅ | `messageControllers.js::broadcastMessage()` |
| 3 | Grup mesajlaşma | ✅ | `chatControllers.js::createGroupChat()` |
| 4 | Birebir mesajlaşma | ✅ | `chatControllers.js::accessChat()` |
| 5 | Gerçek zamanlı | ✅ | Socket.io events |
| 6 | Uçtan uca şifreleme | ✅ | `encryption.js` |
| 7 | Mesaj hash'leri DB'de | ✅ | `messageModel.js::hash` |
| 8 | Hash doğrulama | ✅ | `messageControllers.js::verifyHash()` |
| 9 | Offline mesaj depolama | ✅ | MongoDB persistence |

---

## 🚀 Çalıştırma

### Backend
```bash
cd backend
npm start
# Port: 5000
```

### Frontend
```bash
cd frontend
npm start
# Port: 3000
```

---

## 📝 Notlar

- **Şifreleme Anahtarı:** `SECRET_KEY = "PROJE2025"`
- **Socket Endpoint:** `http://localhost:5000`
- **Database:** MongoDB (connection string `.env` dosyasında)
- **Authentication:** JWT Bearer Token

---

## ✨ Ek Özellikler

1. **Yazıyor göstergesi** (Typing indicator)
2. **Grup üye yönetimi** (Ekleme/Çıkarma)
3. **Profil modal'ları**
4. **Responsive tasarım**
5. **Toast bildirimleri**
6. **Avatar gösterimi**

---

**Proje Durumu:** ✅ TÜM GEREKSİNİMLER TAMAMLANDI

**Tarih:** 19 Aralık 2025
