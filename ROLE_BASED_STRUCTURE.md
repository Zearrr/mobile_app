# โครงสร้างหน้าเว็บ (`src/pages`) และการแมปเส้นทาง (Routes)

เอกสารนี้อธิบายโครงสร้างโฟลเดอร์ภายใต้ `src/pages` และการแมปกับเส้นทางในระบบหน้าเว็บ ตามที่กำหนดใน `src/App.tsx` (เวอร์ชันปัจจุบัน).

## โครงสร้างหลักของ `src/pages`

```
src/pages/
├── admin/            # หน้าสำหรับเจ้าของร้าน (owner)
│   ├── finance/      # การเงิน: สมุดเงินสด, ปิดวัน, รายงาน
│   └── users/        # จัดการผู้ใช้
├── staff/            # หน้าสำหรับพนักงาน (staff)
│   ├── jobs/         # งานซ่อม (รายการ, รายละเอียด, รับงานใหม่)
│   ├── customers/    # ลูกค้า (รายการ, ประวัติ)
│   └── sales/        # POS ขายสินค้า
├── core/             # หน้าหลักระบบ: Dashboard, Settings, NotFound
├── jobs/             # หน้าจัดการงานซ่อมฝั่ง owner (Jobs, NewJob, Detail, Edit)
├── inventory/        # คลังสินค้า (Parts, StockMovement, PO)
├── customers/        # ประวัติลูกค้า (ฝั่ง owner)
├── sales/            # ใบเสนอราคา/ขาย (Quotes, QuoteForm, Pricing, SalesHistory, SaleDetail, POSSale)
├── warranty/         # การรับประกัน/เคลม (Warranty, WarrantyNew, Claims, ClaimEdit, ClaimEditForm, PublicWarranty)
├── shared/           # ใช้ร่วมกัน (Login, ชุดหน้า print)
└── print/            # หน้า print ที่เรียกใช้งานโดยตรง (ReceiptPrint, SalesReceipt, WarrantyPrint, JobPrint)
```

หมายเหตุ: โฟลเดอร์ `print/` และบางหน้าภายใต้ `warranty/`/`sales/` ที่ขึ้นต้นด้วย public/print เป็นเส้นทางสาธารณะหรือสำหรับพิมพ์เอกสาร ไม่ถือเป็น “เมนูหลัก” ของระบบหน้าเว็บ.

## การแมปเส้นทางสำคัญ (อ้างอิงจาก `src/App.tsx`)

- เข้าสู่ระบบ: `/login` และ `/shared/auth/login`

- พนักงาน (`/staff`):
  - `/staff/dashboard` → `staff/StaffDashboard.tsx`
  - `/staff/jobs` → `staff/jobs/StaffJobs.tsx`
  - `/staff/jobs/new` → `staff/jobs/NewJob.tsx`
  - `/staff/jobs/:id` → `staff/jobs/JobDetail.tsx`
  - `/staff/customers` → `staff/customers/StaffCustomers.tsx`
  - `/staff/customers/:id` → `staff/customers/CustomerHistory.tsx`
  - `/staff/sales/pos` → `staff/sales/StaffPOS.tsx`

- เจ้าของร้าน (`/admin`):
  - `/admin/dashboard` → `core/Dashboard.tsx`
  - `/admin/finance/cashbook` → `admin/finance/Cashbook.tsx`
  - `/admin/finance/close-day` → `admin/finance/CloseDay.tsx`
  - `/admin/finance/reports` → `admin/finance/Reports.tsx`
  - `/admin/users` → `admin/users/Users.tsx`

- เส้นทางภายใต้ `/` (owner เป็นหลัก):
  - `/` (index) → `core/Dashboard.tsx`
  - `/jobs`, `/jobs/new`, `/jobs/:id`, `/jobs/:id/edit` → โฟลเดอร์ `jobs/`
  - `/parts` → `inventory/Parts.tsx`
  - `/inventory/stock` → `inventory/StockMovement.tsx`
  - `/po` → `inventory/PO.tsx`
  - `/pricing` → `sales/Pricing.tsx`
  - `/settings` → `core/Settings.tsx`
  - `/sales/history`, `/sales/:id`, `/pos/sale` → โฟลเดอร์ `sales/`
  - `/warranty`, `/warranty/new`, `/claims`, `/claims/:id`, `/claims/:id/edit` → โฟลเดอร์ `warranty/`
  - `/customers`, `/customers/:id` → `customers/CustomerHistory.tsx`
  - `/reports` → `admin/finance/Reports.tsx` (ย้ายมาใช้งานในเมนูหลัก)

- เส้นทางสำหรับพิมพ์/สาธารณะ (ไม่ใช่เมนูหลัก):
  - `/print/jobs/:id` → `print/JobPrint.tsx` หรือ `shared/print/JobPrint.tsx`
  - `/print/receipt/:id` → `print/ReceiptPrint.tsx`
  - `/print/sales/:id` → `print/SalesReceipt.tsx`
  - `/print/warranty/:id` → `print/WarrantyPrint.tsx`
  - `/public/quote/:id` → `sales/PublicQuote.tsx`
  - `/warranty/:jobId` → `warranty/PublicWarranty.tsx`

## บทบาทและการเข้าถึง (สรุปย่อ)

- Staff: เข้าถึงเส้นทางภายใต้ `/staff/*` และบางเมนูร่วม เช่น `/settings`, `/warranty/*`, `/claims/*` ตามที่ระบุในโค้ดด้วยคอมโพเนนต์ `Can roles={[...]}`
- Owner: เข้าถึงทุกเมนู รวม `/admin/*` และเมนูภายใต้ `/`

## หมายเหตุการจัดระเบียบ

- ไฟล์การเงินได้ย้ายมาไว้ที่ `src/pages/admin/finance/*` แล้ว และได้ปรับ import ใน `src/App.tsx` เรียบร้อย
- หากเพิ่มหน้าใหม่ ให้สร้างไฟล์ในโฟลเดอร์ที่ตรงกับบริบท และเพิ่มเส้นทางใน `src/App.tsx`
- หน้าในโฟลเดอร์ `print/` ตั้งใจให้เปิดด้วย URL ตรงหรือปุ่มพิมพ์ ไม่ควรใส่ในเมนูหลัก

## จำนวนหน้าในระบบเว็บ (อิงจากเส้นทางที่ใช้งาน)

- เส้นทางเมนูหลัก (เว็บแอป): ประมาณ 38 หน้า
- หน้า print/public: แยกนับต่างหาก (ไม่รวมในเมนูหลัก)
