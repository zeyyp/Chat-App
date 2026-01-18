## Secure Chat App - MERN Stack

Bu proje, kullanıcıların güvenli ve gerçek zamanlı bir ortamda iletişim kurmasını sağlayan kapsamlı bir mesajlaşma platformudur. Ağ programlama prensipleri, uçtan uca güvenlik ve modern web teknolojileri bir araya getirilerek geliştirilmiştir.

🚀 Proje Hakkında

Uygulama, MERN stack mimarisi üzerine inşa edilmiştir. Temel özellikleri şunlardır:

Bire Bir & Grup Sohbetleri: Kullanıcılar arasında özel veya toplu iletişim.

Genel Yayın (Broadcast): Tüm kullanıcılara aynı anda mesaj iletimi.

Real-time İletişim: Anlık etkileşim için Socket.io (Websocket) entegrasyonu.

Gelişmiş Güvenlik: Mesajlar istemci tarafında simetrik şifreleme ile karıştırılır ve veri bütünlüğü için Dijital Parmak İzi (Hash) oluşturulur.

🛠️ Kullanılan Teknolojiler
Frontend: React.js

Backend: Node.js & Express.js

Veritabanı: MongoDB

İletişim Katmanı: Socket.io

Güvenlik: JWT (Kimlik Doğrulama) & Özel Kriptografi Algoritması

📦 Kurulum ve Çalıştırma
Proje boyutu optimizasyonu için node_modules klasörü hariç tutulmuştur. Çalıştırmak için şu adımları izleyin:

Backend Bağımlılıkları: 

Ana dizinde terminali açın:
npm install

Frontend Bağımlılıkları: frontend dizinine geçin:
cd frontend
npm install

Başlatma: Ana dizine geri dönüp uygulamayı çalıştırın:
npm run dev


📊 Sistem Mimarisi (UML Sequence Diagram)



<img width="683" height="711" alt="image" src="https://github.com/user-attachments/assets/08449ec2-eaf0-4676-a301-03b9533edd3f" />
