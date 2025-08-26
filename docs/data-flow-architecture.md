# แผนภาพการไหลของข้อมูลและสถาปัตยกรรมระบบ FixFlow Thai

## 1. สถาปัตยกรรมระบบโดยรวม

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (React + TypeScript)               │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   UI Components │  │   State         │  │   Routing       │ │
│  │                 │  │   Management    │  │                 │ │
│  │ • Pages         │  │ • Zustand Store │  │ • React Router  │ │
│  │ • Forms         │  │ • Local State   │  │ • Navigation    │ │
│  │ • Tables        │  │ • Context       │  │ • Guards        │ │
│  │ • Modals        │  │ • Persistence   │  │ • Breadcrumbs   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│           │                       │                       │     │
│           ▼                       ▼                       ▼     │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Business Logic Layer                     │ │
│  │                                                             │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │ │
│  │  │ Repositories│  │   Services  │  │   Utils     │        │ │
│  │  │             │  │             │  │             │        │ │
│  │  │ • Jobs      │  │ • Auth      │  │ • Format    │        │ │
│  │  │ • Customers │  │ • Print     │  │ • Validate  │        │ │
│  │  │ • Parts     │  │ • Export    │  │ • Calculate │        │ │
│  │  │ • Sales     │  │ • Backup    │  │ • Generate  │        │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘        │ │
│  └─────────────────────────────────────────────────────────────┘ │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Data Access Layer                        │ │
│  │                                                             │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │ │
│  │  │ SQLite      │  │   IndexedDB │  │   Local     │        │ │
│  │  │ Database    │  │   (Cache)   │  │   Storage   │        │ │
│  │  │             │  │             │  │             │        │ │
│  │  │ • Tables    │  │ • Offline   │  │ • Settings  │        │ │
│  │  │ • Relations │  │ • Sync      │  │ • Theme     │        │ │
│  │  │ • Queries   │  │ • Backup    │  │ • Language  │        │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘        │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 2. การไหลของข้อมูลในระบบ

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Input    │───▶│   Form          │───▶│   Validation    │
│   (UI Event)    │    │   Component     │    │   (Zod Schema)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Repository    │◀───│   Service       │◀───│   Business      │
│   (Database)    │    │   Layer         │    │   Logic         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   SQLite        │    │   Zustand       │    │   UI Update     │
│   Transaction   │    │   Store Update  │    │   (Re-render)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 3. โครงสร้างฐานข้อมูล

```
┌─────────────────────────────────────────────────────────────────┐
│                        Database Schema                          │
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│  │   jobs          │    │   customers     │    │   parts     │ │
│  │                 │    │                 │    │             │ │
│  │ • id (PK)       │    │ • id (PK)       │    │ • id (PK)   │ │
│  │ • customer_id   │    │ • name          │    │ • name      │ │
│  │ • device        │    │ • phone         │    │ • stock     │ │
│  │ • symptoms      │    │ • address       │    │ • cost      │ │
│  │ • status        │    │ • created_at    │    │ • price     │ │
│  │ • payment_status│    │ • updated_at    │    │ • min_stock │ │
│  │ • total_cost    │    └─────────────────┘    │ • created_at│ │
│  │ • selling_price │            │              │ • updated_at│ │
│  │ • profit        │            │              └─────────────┘ │
│  │ • deposit       │            │                      │       │
│  │ • warranty_days │            │                      │       │
│  │ • assigned_tech │            │                      │       │
│  │ • created_at    │            │                      │       │
│  │ • updated_at    │            │                      │       │
│  └─────────────────┘            │                      │       │
│           │                     │                      │       │
│           │                     │                      │       │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│  │   job_parts     │    │   sales         │    │   users     │ │
│  │   (Junction)    │    │                 │    │             │ │
│  │                 │    │                 │    │             │ │
│  │ • job_id (FK)   │    │ • id (PK)       │    │ • id (PK)   │ │
│  │ • part_id (FK)  │    │ • customer_id   │    │ • username  │ │
│  │ • quantity      │    │ • items         │    │ • password  │ │
│  │ • unit_cost     │    │ • total_amount  │    │ • role      │ │
│  │ • total_cost    │    │ • payment_method│    │ • name      │ │
│  └─────────────────┘    │ • created_at    │    │ • email     │ │
│                         │ • updated_at    │    │ • created_at│ │
│                         └─────────────────┘    │ • updated_at│ │
│                                                  └─────────────┘ │
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│  │   settings      │    │   cashbook      │    │   warranties│ │
│  │                 │    │                 │    │             │ │
│  │ • id (PK)       │    │ • id (PK)       │    │ • id (PK)   │ │
│  │ • shop_name     │    │ • type          │    │ • job_id    │ │
│  │ • address       │    │ • amount        │    │ • start_date│ │
│  │ • phone         │    │ • description   │    │ • end_date  │ │
│  │ • tax_id        │    │ • date          │    │ • terms     │ │
│  │ • default_profit│    │ • created_at    │    │ • created_at│ │
│  │ • warranty_days │    │ • updated_at    │    │ • updated_at│ │
│  │ • labor_cost    │    └─────────────────┘    └─────────────┘ │
│  │ • created_at    │                                         │
│  │ • updated_at    │                                         │
│  └─────────────────┘                                         │
└─────────────────────────────────────────────────────────────┘
```

## 4. การจัดการ State ใน Zustand Store

```
┌─────────────────────────────────────────────────────────────────┐
│                    useRepairStore.ts                            │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   State         │  │   Actions       │  │   Computed      │ │
│  │                 │  │                 │  │   Values        │ │
│  │ • jobs          │  │ • addJob        │  │ • totalJobs     │ │
│  │ • customers     │  │ • updateJob     │  │ • pendingJobs   │ │
│  │ • parts         │  │ • deleteJob     │  │ • todayRevenue  │ │
│  │ • sales         │  │ • addCustomer   │  │ • monthlyProfit │ │
│  │ • settings      │  │ • updatePart    │  │ • lowStockItems │ │
│  │ • currentUser   │  │ • addSale       │  │ • expiringWarranty│ │
│  │ • isLoading     │  │ • updateSettings│  │ • userPermissions│ │
│  │ • error         │  │ • logout        │  │                 │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│           │                       │                       │     │
│           ▼                       ▼                       ▼     │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Persistence Layer                        │ │
│  │                                                             │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │ │
│  │  │ Local       │  │ Session     │  │ IndexedDB   │        │ │
│  │  │ Storage     │  │ Storage     │  │ Cache       │        │ │
│  │  │             │  │             │  │             │        │ │
│  │  │ • Settings  │  │ • User      │  │ • Offline   │        │ │
│  │  │ • Theme     │  │ • Session   │  │ • Sync      │        │ │
│  │  │ • Language  │  │ • Cart      │  │ • Backup    │        │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘        │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 5. การทำงานของ Repository Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│                    Repository Pattern                           │
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│  │   JobsRepo      │    │   CustomersRepo │    │   PartsRepo │ │
│  │                 │    │                 │    │             │ │
│  │ • create()      │    │ • create()      │    │ • create()  │ │
│  │ • findById()    │    │ • findById()    │    │ • findById()│ │
│  │ • findAll()     │    │ • findAll()     │    │ • findAll() │ │
│  │ • update()      │    │ • update()      │    │ • update()  │ │
│  │ • delete()      │    │ • delete()      │    │ • delete()  │ │
│  │ • findByStatus()│    │ • findByPhone() │    │ • findByStock()│ │
│  │ • findByCustomer()│  │ • search()      │    │ • updateStock()│ │
│  └─────────────────┘    └─────────────────┘    └─────────────┘ │
│           │                       │                       │     │
│           ▼                       ▼                       ▼     │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Database Interface                       │ │
│  │                                                             │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │ │
│  │  │ SQLite      │  │   Query     │  │   Result    │        │ │
│  │  │ Connection  │  │   Builder   │  │   Handler   │        │ │
│  │  │             │  │             │  │             │        │ │
│  │  │ • Open      │  │ • SELECT    │  │ • Parse     │        │ │
│  │  │ • Close     │  │ • INSERT    │  │ • Transform │        │ │
│  │  │ • Execute   │  │ • UPDATE    │  │ • Validate  │        │ │
│  │  │ • Transaction│  │ • DELETE    │  │ • Return    │        │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘        │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 6. การทำงานของ Form Validation

```
┌─────────────────────────────────────────────────────────────────┐
│                    Form Validation Flow                         │
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│  │   User Input    │───▶│   React Hook    │───▶│   Zod Schema│ │
│  │                 │    │   Form          │    │   Validation│ │
└─────────────────┘    └─────────────────┘    └─────────────┘ │
                                │                       │         │
                                ▼                       ▼         │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│   Error         │◀───│   Validation    │◀───│   Schema    │ │
│   Display       │    │   Result        │    │   Rules     │ │
└─────────────────┘    └─────────────────┘    └─────────────┘ │
                                │                               │
                                ▼                               │
┌─────────────────┐    ┌─────────────────┐                    │
│   Success       │◀───│   Submit        │                    │
│   Action        │    │   Handler       │                    │
└─────────────────┘    └─────────────────┘                    │
```

## 7. การทำงานของ Print System

```
┌─────────────────────────────────────────────────────────────────┐
│                    Print System Architecture                    │
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│  │   Print         │    │   Template      │    │   Data      │ │
│  │   Component     │    │   Engine        │    │   Source    │ │
│  │                 │    │                 │    │             │ │
│  │ • JobPrint      │    │ • HTML Template │    │ • Job Data  │ │
│  │ • ReceiptPrint  │    │ • CSS Styling   │    │ • Customer  │ │
│  │ • WarrantyPrint │    │ • Layout        │    │ • Settings  │ │
│  │ • QuotePrint    │    │ • Variables     │    │ • Store Info│ │
│  └─────────────────┘    └─────────────────┘    └─────────────┘ │
│           │                       │                       │     │
│           ▼                       ▼                       ▼     │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Print Service                            │ │
│  │                                                             │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │ │
│  │  │ Generate    │  │   Format    │  │   Output    │        │ │
│  │  │ HTML        │  │   PDF       │  │   Options   │        │ │
│  │  │             │  │             │  │             │        │ │
│  │  │ • Template  │  │ • jsPDF     │  │ • Print     │        │ │
│  │  │ • Data      │  │ • html2pdf  │  │ • Download  │        │ │
│  │  │ • Variables │  │ • Styling   │  │ • Email     │        │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘        │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 8. การทำงานของ Authentication System

```
┌─────────────────────────────────────────────────────────────────┐
│                    Authentication Flow                          │
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│  │   Login Form    │───▶│   Auth Service  │───▶│   Database  │ │
│  │                 │    │                 │    │   Check     │ │
└─────────────────┘    └─────────────────┘    └─────────────┘ │
                                │                       │         │
                                ▼                       ▼         │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│   Session       │◀───│   Token         │◀───│   User      │ │
│   Storage       │    │   Generation    │    │   Data      │ │
└─────────────────┘    └─────────────────┘    └─────────────┘ │
                                │                               │
                                ▼                               │
┌─────────────────┐    ┌─────────────────┐                    │
│   Protected     │◀───│   Route Guard   │                    │
│   Routes        │    │                 │                    │
└─────────────────┘    └─────────────────┘                    │
```

## 9. การทำงานของ Mobile Responsive System

```
┌─────────────────────────────────────────────────────────────────┐
│                    Responsive Design System                     │
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│  │   Tailwind CSS  │    │   Custom Hooks  │    │   Components│ │
│  │                 │    │                 │    │             │ │
│  │ • Breakpoints   │    │ • useMobile     │    │ • Sidebar   │ │
│  │ • Grid System   │    │ • useResize     │    │ • Tables    │ │
│  │ • Flexbox       │    │ • useOrientation│    │ • Forms     │ │
│  │ • Responsive    │    │ • useTouch      │    │ • Modals    │ │
│  │   Utilities     │    │ • useSafeArea   │    │ • Navigation│ │
│  └─────────────────┘    └─────────────────┘    └─────────────┘ │
│           │                       │                       │     │
│           ▼                       ▼                       ▼     │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Device Detection                         │ │
│  │                                                             │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │ │
│  │  │ Screen Size │  │   Touch     │  │   Platform  │        │ │
│  │  │ Detection   │  │   Support   │  │   Detection │        │ │
│  │  │             │  │             │  │             │        │ │
│  │  │ • Mobile    │  │ • Touch     │  │ • iOS       │        │ │
│  │  │ • Tablet    │  │ • Mouse     │  │ • Android   │        │ │
│  │  │ • Desktop   │  │ • Keyboard  │  │ • Web       │        │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘        │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 10. การทำงานของ Error Handling

```
┌─────────────────────────────────────────────────────────────────┐
│                    Error Handling System                        │
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│  │   Error         │    │   Error         │    │   Error     │ │
│  │   Boundary      │    │   Service       │    │   Display   │ │
│  │                 │    │                 │    │             │ │
│  │ • Catch         │    │ • Log           │    │ • Toast     │ │
│  │ • Fallback      │    │ • Report        │    │ • Modal     │ │
│  │ • Recovery      │    │ • Retry         │    │ • Page      │ │
│  │ • Monitoring    │    │ • Fallback      │    │ • Inline    │ │
│  └─────────────────┘    └─────────────────┘    └─────────────┘ │
│           │                       │                       │     │
│           ▼                       ▼                       ▼     │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Error Types                              │ │
│  │                                                             │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │ │
│  │  │ Validation  │  │   Network   │  │   System    │        │ │
│  │  │ Errors      │  │   Errors    │  │   Errors    │        │ │
│  │  │             │  │             │  │             │        │ │
│  │  │ • Form      │  │ • API       │  │ • Database  │        │ │
│  │  │ • Schema    │  │ • Timeout   │  │ • Storage   │        │ │
│  │  │ • Business  │  │ • CORS      │  │ • Memory    │        │ │
│  │  │   Rules     │  │ • 404/500   │  │ • Permissions│       │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘        │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 11. การทำงานของ Performance Optimization

```
┌─────────────────────────────────────────────────────────────────┐
│                    Performance Optimization                     │
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│  │   Code          │    │   Data          │    │   UI        │ │
│  │   Splitting     │    │   Caching       │    │   Optimization│ │
│  │                 │    │                 │    │             │ │
│  │ • Lazy Loading  │    │ • IndexedDB     │    │ • Virtual   │ │
│  │ • Dynamic Import│    │ • Memory Cache  │    │   Scrolling │ │
│  │ • Tree Shaking  │    │ • Query Cache   │    │ • Debouncing│ │
│  │ • Bundle        │    │ • Offline Data  │    │ • Throttling│ │
│  │   Optimization  │    │ • Background    │    │ • Memoization│ │
│  │                 │    │   Sync          │    │ • React.memo│ │
│  └─────────────────┘    └─────────────────┘    └─────────────┘ │
│           │                       │                       │     │
│           ▼                       ▼                       ▼     │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Monitoring & Analytics                   │ │
│  │                                                             │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │ │
│  │  │ Performance │  │   Error     │  │   User      │        │ │
│  │  │ Metrics     │  │   Tracking  │  │   Analytics │        │ │
│  │  │             │  │             │  │             │        │ │
│  │  │ • Load Time │  │ • Error     │  │ • Page Views│        │ │
│  │  │ • Render    │  │   Rate      │  │ • Actions   │        │ │
│  │  │   Time      │  │ • Stack     │  │ • Sessions  │        │ │
│  │  │ • Memory    │  │   Trace     │  │ • Conversion│        │ │
│  │  │   Usage     │  │ • User      │  │   Rate      │        │ │
│  │  └─────────────┘  │   Context   │  └─────────────┘        │ │
│  │                   └─────────────┘                          │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 12. การทำงานของ Security System

```
┌─────────────────────────────────────────────────────────────────┐
│                    Security Architecture                        │
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│  │   Input         │    │   Data          │    │   Access    │ │
│  │   Validation    │    │   Protection    │    │   Control   │ │
│  │                 │    │                 │    │             │ │
│  │ • XSS           │    │ • Encryption    │    │ • Role-based│ │
│  │   Prevention    │    │ • Hashing       │    │   Access    │ │
│  │ • SQL           │    │ • Sanitization  │    │ • Permission│ │
│  │   Injection     │    │ • Backup        │    │   Checks    │ │
│  │ • CSRF          │    │ • Integrity     │    │ • Session   │ │
│  │   Protection    │    │   Checks        │    │   Management│ │
│  └─────────────────┘    └─────────────────┘    └─────────────┘ │
│           │                       │                       │     │
│           ▼                       ▼                       ▼     │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Security Layers                          │ │
│  │                                                             │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │ │
│  │  │ Frontend    │  │   Backend   │  │   Database  │        │ │
│  │  │ Security    │  │   Security  │  │   Security  │        │ │
│  │  │             │  │             │  │             │        │ │
│  │  │ • Input     │  │ • API       │  │ • Access    │        │ │
│  │  │   Validation│  │   Security  │  │   Control   │        │ │
│  │  │ • Client    │  │ • Rate      │  │ • Encryption│        │ │
│  │  │   Side      │  │   Limiting  │  │ • Backup    │        │ │
│  │  │   Validation│  │ • CORS      │  │ • Audit     │        │ │
│  │  │ • XSS       │  │ • Headers   │  │   Logs      │        │ │
│  │  │   Protection│  │ • HTTPS     │  │ • Integrity │        │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘        │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

**หมายเหตุ:** แผนภาพนี้แสดงสถาปัตยกรรมและการไหลของข้อมูลในระบบ FixFlow Thai โดยเน้นการออกแบบที่ยืดหยุ่น ปลอดภัย และมีประสิทธิภาพ เพื่อรองรับการใช้งานจริงในร้านซ่อมมือถือ/คอมพิวเตอร์
