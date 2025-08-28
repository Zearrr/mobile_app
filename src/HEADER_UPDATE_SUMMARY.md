# สรุปการแก้ไข Header ในทุกหน้า

## ✅ หน้าที่แก้ไขแล้ว:

### 1. **core/Dashboard.tsx**
- ✅ เพิ่ม import `PageHeader`
- ✅ แทนที่ header เดิมด้วย `<PageHeader title="หน้าแรก" description="ภาพรวมและทางลัดการทำงานในระบบ" showActions={true} />`

### 2. **core/Settings.tsx**
- ✅ เพิ่ม import `PageHeader`
- ✅ แทนที่ header เดิมด้วย `<PageHeader title="ตั้งค่า" description="ข้อมูลร้านและค่าตั้งต้นต่าง ๆ" showActions={false} />`

### 3. **jobs/Jobs.tsx**
- ✅ เพิ่ม import `PageHeader`
- ✅ แทนที่ header เดิมด้วย `<PageHeader title="จัดการงานซ่อม" description="ดูและจัดการงานซ่อมทั้งหมดในระบบ" showActions={true} />`

### 4. **inventory/Parts.tsx**
- ✅ เพิ่ม import `PageHeader`
- ✅ แทนที่ header เดิมด้วย `<PageHeader title="จัดการอะไหล่/สินค้า" description="จัดการสต็อกอะไหล่และสินค้าทั้งหมด" showActions={true} />`

### 5. **finance/Cashbook.tsx**
- ✅ เพิ่ม import `PageHeader`
- ✅ แทนที่ header เดิมด้วย `<PageHeader title="รายรับ–รายจ่าย" description="จัดการการเงินและติดตามรายรับ-รายจ่าย" showActions={false} />`

### 6. **jobs/NewJob.tsx**
- ✅ เพิ่ม import `PageHeader`
- ✅ แทนที่ header เดิมด้วย `<PageHeader title="แจ้งซ่อมใหม่" description="สร้างงานซ่อมใหม่สำหรับลูกค้า" showActions={false} />`

### 7. **jobs/JobDetail.tsx**
- ✅ เพิ่ม import `PageHeader`
- ✅ แทนที่ header เดิมด้วย `<PageHeader title="รายละเอียดงานซ่อม #${job.id}" description="ข้อมูลงานซ่อมและลูกค้า" showActions={false} />`

### 8. **inventory/PartsAdd.tsx**
- ✅ เพิ่ม import `PageHeader`
- ✅ แทนที่ header เดิมด้วย `<PageHeader title="เพิ่มอะไหล่ใหม่" description="เพิ่มอะไหล่หรือสินค้าใหม่เข้าสต็อก" showActions={false} />`

### 9. **finance/Reports.tsx**
- ✅ เพิ่ม import `PageHeader`
- ✅ แทนที่ header เดิมด้วย `<PageHeader title="รายงานภาพรวม" description="สรุปยอดและสถิติต่าง ๆ" showActions={false} />`

### 10. **jobs/JobEdit.tsx**
- ✅ เพิ่ม import `PageHeader`
- ✅ แทนที่ header เดิมด้วย `<PageHeader title="แก้ไขงานซ่อม #${job.id}" description="อัปเดตข้อมูลงานซ่อม" showActions={false} />`

### 11. **inventory/PartsEdit.tsx**
- ✅ เพิ่ม import `PageHeader`
- ✅ แทนที่ header เดิมด้วย `<PageHeader title="แก้ไขอะไหล่" description="แก้ไขข้อมูลอะไหล่: ${part.name}" showActions={false} />`

### 12. **inventory/StockMovement.tsx**
- ✅ เพิ่ม import `PageHeader`
- ✅ แทนที่ header เดิมด้วย `<PageHeader title="การเคลื่อนไหวสต็อก" description="ติดตามการเปลี่ยนแปลงสต็อกสินค้า" showActions={false} />`

### 13. **inventory/PO.tsx**
- ✅ เพิ่ม import `PageHeader`
- ✅ แทนที่ header เดิมด้วย `<PageHeader title="ใบสั่งซื้อ (PO)" description="สร้างใบสั่งซื้อสินค้าจากผู้จำหน่าย" showActions={false} />`

### 14. **finance/CloseDay.tsx**
- ✅ เพิ่ม import `PageHeader`
- ✅ แทนที่ header เดิมด้วย `<PageHeader title="ปิดยอดสิ้นวัน" description="สรุปยอดและบันทึกปิดวัน" showActions={false} />`

### 15. **sales/POSSale.tsx**
- ✅ เพิ่ม import `PageHeader`
- ✅ แทนที่ header เดิมด้วย `<PageHeader title="ขายหน้าร้าน (POS)" description="สแกน/ค้นหา SKU หรือชื่อสินค้า เพื่อเพิ่มลงตะกร้า" showActions={false} />`

### 16. **sales/SalesHistory.tsx**
- ✅ เพิ่ม import `PageHeader`
- ✅ แทนที่ header เดิมด้วย `<PageHeader title="ประวัติการขาย" description="ดูและจัดการข้อมูลการขายทั้งหมด" showActions={true} />`

### 17. **users/Users.tsx**
- ✅ เพิ่ม import `PageHeader`
- ✅ แทนที่ header เดิมด้วย `<PageHeader title="ผู้ใช้" description="จัดการผู้ใช้และสิทธิ์" showActions={false} />`

## 🔄 หน้าที่ยังไม่ได้แก้ไข:

### **core/**
- [ ] Index.tsx
- [ ] Login.tsx
- [ ] NotFound.tsx

### **jobs/**
- [ ] PricingForm.tsx (เป็น component ที่ใช้ในหน้าอื่น)
- [ ] CustomerForm.tsx (เป็น component ที่ใช้ในหน้าอื่น)
- [ ] DeviceForm.tsx (เป็น component ที่ใช้ในหน้าอื่น)

### **inventory/**
- ✅ **เสร็จแล้ว** - ทุกไฟล์ในโฟลเดอร์นี้

### **finance/**
- ✅ **เสร็จแล้ว** - ทุกไฟล์ในโฟลเดอร์นี้

### **customers/**
- [ ] CustomerHistory.tsx

### **users/**
- ✅ **เสร็จแล้ว** - ทุกไฟล์ในโฟลเดอร์นี้

### **warranty/**
- [ ] Warranty.tsx
- [ ] WarrantyNew.tsx
- [ ] Claims.tsx
- [ ] ClaimEdit.tsx
- [ ] ClaimEditForm.tsx
- [ ] PublicWarranty.tsx

### **sales/**
- [ ] SaleDetail.tsx
- [ ] Pricing.tsx
- [ ] QuoteForm.tsx
- [ ] PublicQuote.tsx
- [ ] Quotes.tsx

### **print/**
- [ ] JobPrint.tsx
- [ ] ReceiptPrint.tsx
- [ ] WarrantyPrint.tsx
- [ ] SalesReceipt.tsx

## 📝 วิธีการแก้ไข:

### **1. เพิ่ม Import:**
```typescript
import { PageHeader } from '@/components/layout/Topbar';
```

### **2. แทนที่ Header เดิม:**
```typescript
// แทนที่โค้ด header เดิมด้วย:
<PageHeader 
  title="ชื่อหน้า" 
  description="คำอธิบายหน้า" 
  showActions={true/false} 
/>
```

### **3. ตัวอย่างการใช้งาน:**

#### **หน้าหลัก (แสดงปุ่ม action):**
```typescript
<PageHeader 
  title="หน้าแรก" 
  description="ภาพรวมและทางลัดการทำงานในระบบ" 
  showActions={true} 
/>
```

#### **หน้าย่อย (ไม่แสดงปุ่ม action):**
```typescript
<PageHeader 
  title="ตั้งค่า" 
  description="ข้อมูลร้านและค่าตั้งต้นต่าง ๆ" 
  showActions={false} 
/>
```

## 🎯 ประโยชน์ที่ได้:

✅ **Consistency** - ทุกหน้าจะมี header design เหมือนกัน  
✅ **Maintainability** - แก้ไขที่เดียวได้ผลทุกหน้า  
✅ **Code Reuse** - ไม่ต้องเขียน header ซ้ำ  
✅ **Easy Updates** - ปรับแต่ง header ได้ง่าย  

## 🚀 ขั้นตอนต่อไป:

1. แก้ไขหน้าที่ยังไม่ได้แก้ไขตามรายการด้านบน
2. ทดสอบการทำงานของ header ในทุกหน้า
3. ปรับแต่ง design เพิ่มเติมตามต้องการ
