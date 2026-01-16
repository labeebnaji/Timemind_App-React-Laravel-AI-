# 📱 الوصول للتطبيق من الهاتف

## ✅ التعديلات المطلوبة (تم تطبيقها)

### 1. Frontend (Vite)
- ✅ تم إضافة `host: '0.0.0.0'` في `vite.config.js`
- ✅ تم إنشاء `.env.local` مع IP الكمبيوتر
- ✅ تم تعديل `api.js` لاستخدام المتغيرات البيئية

### 2. Backend (Laravel)
- ✅ تم تشغيل Backend على `--host=0.0.0.0`
- ✅ تم تعديل CORS للسماح بجميع المصادر

## 🚀 خطوات الوصول من الهاتف

### 1. تأكد من الشبكة
- الكمبيوتر والهاتف على نفس شبكة WiFi

### 2. عناوين الوصول
افتح المتصفح على الهاتف واستخدم أحد العناوين:
```
http://192.168.10.1:3000
http://172.20.10.7:3000
http://192.168.223.1:3000
```

### 3. تشغيل السيرفرات

#### Backend:
```bash
cd backend
php artisan serve --host=0.0.0.0
```

#### Frontend:
```bash
cd frontend
npm run dev
```

## 🔧 حل المشاكل

### إذا لم يعمل:

1. **تحقق من Firewall:**
   - افتح Windows Defender Firewall
   - اسمح بالاتصالات الواردة على المنافذ 3000 و 8000

2. **تحقق من IP الكمبيوتر:**
   ```bash
   ipconfig
   ```
   ابحث عن IPv4 Address

3. **عدّل `.env.local` إذا تغير IP:**
   ```
   VITE_API_URL=http://YOUR_IP:8000/api
   ```

4. **أعد تشغيل Frontend بعد تعديل `.env.local`**

## 📝 ملاحظات

- للعودة لـ localhost، احذف ملف `frontend/.env.local`
- CORS مفتوح للجميع (للتطوير فقط)
- قبل النشر، عدّل CORS لتحديد المصادر المسموحة

## 🔒 للإنتاج (Production)

عدّل `backend/config/cors.php`:
```php
'allowed_origins' => [
    'https://yourdomain.com',
    'https://www.yourdomain.com'
],
```
