# FixFlow Thai Backend

Backend API สำหรับระบบ FixFlow Thai ที่ใช้ TypeORM และ PostgreSQL

## 🚀 การติดตั้ง

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. ตั้งค่าฐานข้อมูล
สร้างไฟล์ `.env` ในโฟลเดอร์ `backend/` และกำหนดค่าต่างๆ:

**วิธีที่ง่ายที่สุด:**
```bash
# Windows
setup-db.bat

# Linux/Mac
chmod +x setup-db.sh
./setup-db.sh
```

**หรือสร้างด้วยตนเอง:**

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password_here
DB_NAME=postgres

# Environment
NODE_ENV=development

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3000
HOST=localhost

# CORS
CORS_ORIGIN=http://localhost:5173
```

### 3. สร้างฐานข้อมูล PostgreSQL
```sql
CREATE DATABASE postgres;
```

### 4. รัน Migration (ถ้ามี)
```bash
npm run migration:run
```

### 5. เริ่มต้น Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📊 โครงสร้างฐานข้อมูล

### Entities ที่มีอยู่:

#### 1. Admin (`admin.js`)
- จัดการข้อมูลผู้ดูแลระบบ
- ฟิลด์: id, admin_name, email, password, role, department, phone, is_active, last_login, created_at, updated_at

#### 2. User (`user.js`)
- จัดการข้อมูลผู้ใช้งานทั่วไป
- ฟิลด์: id, username, email, password, first_name, last_name, phone, role, department, position, is_active, email_verified, last_login, created_at, updated_at

#### 3. Customer (`customer.js`)
- จัดการข้อมูลลูกค้า
- ฟิลด์: id, name, phone, email, address, city, postal_code, customer_type, tax_id, credit_limit, is_active, notes, created_at, updated_at

#### 4. Job (`job.js`)
- จัดการงานซ่อม
- ฟิลด์: id, job_number, customer_id, device_type, device_brand, device_model, serial_number, problem_description, diagnosis, solution, status, priority, estimated_cost, actual_cost, labor_cost, parts_cost, assigned_technician, created_by, started_at, completed_at, warranty_days, notes, created_at, updated_at

#### 5. Part (`part.js`)
- จัดการอะไหล่และสินค้า
- ฟิลด์: id, sku, name, description, category, brand, model, on_hand_qty, min_qty, max_qty, unit_cost, selling_price, moving_avg_cost, supplier_id, location, is_active, warranty_days, notes, created_at, updated_at

## 🔧 การใช้งาน TypeORM

### การสร้าง Entity ใหม่:
1. สร้างไฟล์ในโฟลเดอร์ `EnityTable/`
2. ใช้ `EntitySchema` เพื่อกำหนดโครงสร้าง
3. กำหนด columns, indices และ relations
4. ใช้ `uuid` สำหรับ primary key

### ตัวอย่างการสร้าง Entity:
```javascript
const { EntitySchema } = require('typeorm');
const { v4: uuidv4 } = require('uuid');

module.exports = new EntitySchema({
  name: 'EntityName',
  tableName: 'table_name',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
      default: () => uuidv4()
    },
    // เพิ่มฟิลด์อื่นๆ
  }
});
```

## 📝 Scripts ที่มี

- `npm run dev` - รันในโหมด development พร้อม nodemon
- `npm start` - รันในโหมด production
- `npm run migration:generate` - สร้าง migration ใหม่
- `npm run migration:run` - รัน migration
- `npm run migration:revert` - ย้อน migration

## 🔒 ความปลอดภัย

- ใช้ Helmet สำหรับ security headers
- CORS configuration
- Rate limiting
- Input validation
- JWT authentication

## 🌐 API Endpoints

- `GET /health` - Health check
- `GET /api` - API information

## 📁 โครงสร้างโฟลเดอร์

```
backend/
├── EnityTable/          # Entity definitions
├── src/
│   ├── config/         # Database configuration
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   └── middleware/     # Custom middleware
├── index.js            # Main server file
├── package.json        # Dependencies
└── README.md           # This file
```

## 🐛 การแก้ไขปัญหา

### ปัญหาการเชื่อมต่อฐานข้อมูล:
1. ตรวจสอบการตั้งค่าใน `.env`
2. ตรวจสอบว่า PostgreSQL กำลังทำงาน
3. ตรวจสอบสิทธิ์การเข้าถึงฐานข้อมูล

### ปัญหา TypeORM:
1. ตรวจสอบ Entity definitions
2. ตรวจสอบการ import entities ใน database config
3. ตรวจสอบ database schema

## 📞 การสนับสนุน

หากมีปัญหาหรือคำถาม กรุณาติดต่อทีมพัฒนา
