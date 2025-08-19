# 📱 ระบบซ่อมมือถือครบวงจร (Mobile Repair Pro)

## 🚀 ภาพรวม

ระบบจัดการงานซ่อมมือถือที่ทันสมัยและครบครัน ออกแบบมาเฉพาะสำหรับร้านซ่อมมือถือในประเทศไทย ใช้เทคโนโลยีที่ล้ำสมัยและรองรับการทำงานแบบ offline-first

### ✨ ฟีเจอร์หลัก

- 🎯 **แดชบอร์ด**: ภาพรวมการดำเนินงาน สถิติรายได้และกำไร
- 📝 **แจ้งซ่อมใหม่**: ฟอร์มครบครันพร้อมการลงลายเซ็นดิจิทัล
- 📋 **จัดการงาน**: ติดตามสถานะงาน เปลี่ยนสถานะ พิมพ์เอกสาร
- 👥 **จัดการลูกค้า**: ฐานข้อมูลลูกค้าและประวัติการซ่อม
- 📦 **จัดการอะไหล่**: สต็อกอะไหล่และการคิดราคา
- 💰 **ตั้งราคา**: ระบบคำนวณราคาอัจฉริยะตามแบรนด์และรุ่น
- 🖨️ **พิมพ์เอกสาร**: ใบแจ้งซ่อม ใบเสร็จ A4 ฟอนต์ไทยสวยงาม
- ⚙️ **ตั้งค่า**: ปรับแต่งร้าน โลโก้ เงื่อนไข PDPA
- 🔗 **เช็คประกัน**: หน้าสาธารณะสำหรับลูกค้าเช็คสถานะ

### 🛠️ เทคโนโลยีที่ใช้

**Frontend:**
- ⚛️ React 18 + TypeScript
- ⚡ Vite (Build Tool)
- 🎨 Tailwind CSS + shadcn/ui
- 🗂️ Zustand (State Management)
- 📋 React Hook Form + Zod
- 📅 date-fns (Date Utils)
- 🎯 Lucide React (Icons)

**Database & Storage:**
- 💾 IndexedDB (Dexie) - Offline First
- 🏗️ Architecture พร้อมสำหรับ Supabase/Firebase

**การพิมพ์:**
- 🖨️ react-to-print
- 🇹🇭 ฟอนต์ Sarabun สำหรับภาษาไทย
- 📄 Layout A4 มาตรฐาน

**Design System:**
- 🎨 Modern indigo-purple gradient theme
- 🌙 Support Dark/Light mode
- 📱 Responsive design
- ♿ Accessibility ready

## 🎯 การติดตั้งและรัน

### ข้อกำหนดเบื้องต้น
- Node.js 18+ และ npm
- เบราว์เซอร์ที่รองรับ ES2022+

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. รันในโหมด Development
```bash
npm run dev
```
เปิด http://localhost:8080

### 3. Build สำหรับ Production
```bash
npm run build
```

### 4. Preview Build
```bash
npm run preview
```

## 🔐 เข้าสู่ระบบ (Demo)

**ข้อมูลทดลอง:**
- ชื่อผู้ใช้: `admin`
- รหัสผ่าน: `admin`

## 📊 ข้อมูลทดลอง (Seed Data)

ระบบมาพร้อมข้อมูลตัวอย่าง:
- ลูกค้า 3 ราย
- งานซ่อม 2 งาน (แบบต่าง ๆ)
- อะไหล่ตัวอย่าง
- การตั้งค่าพื้นฐาน

## 🧪 การทดสอบการพิมพ์

1. เข้าไปที่แดชบอร์ด
2. คลิกดูรายละเอียดงานใด ๆ
3. คลิก "พิมพ์ใบแจ้งซ่อม"
4. ตรวจสอบ:
   - ฟอนต์ไทยแสดงผลถูกต้อง
   - Layout A4 สมบูรณ์
   - QR Code ชำระเงิน
   - ข้อมูลครบถ้วน

## 📁 โครงสร้างโปรเจค

```
src/
├── components/           # คอมโพเนนต์ UI
│   ├── ui/              # shadcn/ui components
│   └── layout/          # Layout components
├── pages/               # หน้าต่าง ๆ
├── stores/              # Zustand stores
├── lib/                 # Utilities
├── types/               # TypeScript types
└── hooks/               # Custom hooks
```

## 🎨 Design System

### สีหลัก
- **Primary**: Indigo 500-600 (#6366F1)
- **Purple**: Purple 500-600 (#8B5CF6)
- **Gradients**: Indigo → Purple
- **Success**: Green 500 (#10B981)
- **Warning**: Orange 500 (#F59E0B)
- **Error**: Red 500 (#EF4444)

### ฟอนต์
- **หลัก**: Sarabun (Google Fonts)
- **ใช้งาน**: .thai-text class
- **Print**: รองรับฟอนต์ไทยใน PDF

### การออกแบบ
- การ์ดโค้งมน (rounded-2xl)
- เงานุ่ม (shadow-card)
- Glass morphism effects
- Smooth animations

## 🔧 การปรับแต่ง

### เปลี่ยนสีธีม
แก้ไขใน `src/index.css`:
```css
:root {
  --primary: [HSL values];
  --purple: [HSL values];
}
```

### เพิ่มฟิลด์ใหม่
1. อัพเดต types ใน `src/types/index.ts`
2. แก้ไข database schema ใน `src/lib/database.ts`
3. อัพเดต forms และ components

### การตั้งค่าร้าน
เข้าไปที่ตั้งค่า → แก้ไข:
- ชื่อร้าน และที่อยู่
- โลโก้ (URL)
- ข้อความ PDPA
- PromptPay ID

## 🚀 Deployment

### Vercel
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Upload dist/ folder
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 8080
CMD ["npm", "run", "preview"]
```

## 📱 Progressive Web App (PWA)

เตรียมพร้อมสำหรับ PWA:
- ✅ Offline-first architecture
- ✅ IndexedDB storage
- ⏳ Service Worker (ต้องเพิ่ม)
- ⏳ Web App Manifest (ต้องเพิ่ม)

## 🔮 Roadmap

### Phase 2: การขยายระบบ
- [ ] การแจ้งเตือน (Push Notifications)
- [ ] การส่งออก Excel/PDF
- [ ] การสำรองข้อมูลอัตโนมัติ
- [ ] Multi-store support

### Phase 3: Integration
- [ ] Supabase Backend
- [ ] Real-time collaboration
- [ ] Mobile app (React Native)
- [ ] API สำหรับ third-party

## 🤝 การมีส่วนร่วม

ยินดีรับ Pull Request และ Issues!

### การพัฒนา
1. Fork project
2. Create feature branch
3. Commit changes
4. Push และ create PR

## 📄 License

MIT License - ใช้งานได้อย่างอิสระ

## 📞 ติดต่อ

- 📧 Email: support@mobilerepairpro.com
- 💬 Line: @mobilerepairpro
- 🌐 Website: https://mobilerepairpro.com

---

**สร้างด้วย ❤️ สำหรับชุมชนช่างซ่อมไทย**
