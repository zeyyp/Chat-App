const SECRET_KEY = "PROJE2025"; 

//anahtarımız proje2025,bu sifreleme ve desifreleme islemlerinde kullanilir
//burada Simetrik Anahtarlı bir algoritma kullandım. Mesajın her bir karakterini,
//gizli anahtarımızdaki bir karakterle matematiksel olarak topluyoruz

//mesajin içeriğinin şifrelenmesi(gizlilik ilkesi)(secret key kullanilarak)
export const encryptMessage = (text) => {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    let charCode = text.charCodeAt(i) + SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
    result += String.fromCharCode(charCode);
  }
  return result; 
};
//mesajin içeriğinin çözümlenmesi(gizlilik ilkesi)(secret key kullanilarak)
export const decryptMessage = (cipherText) => {
  try {
    let result = "";
    for (let i = 0; i < cipherText.length; i++) {
      let charCode = cipherText.charCodeAt(i) - SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch (e) {
    return "Çözme hatası!";
  }
};

//basit bir karakter kaydirma algoritmasi kullanilarak metin sifrelenir ve cozulur

//mesajin hash degerinin olusturulmasi(bütünlük ilkesi)(parmak izi)
export const hashMessage = (text) => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(16);
};