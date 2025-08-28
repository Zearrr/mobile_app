import express from 'express'

const router = express.Router()

// In a real system this could come from a table; for now serve centrally from API
const MOBILE_BRANDS = [
  'Apple','Samsung','Xiaomi','Redmi','POCO','Huawei','Honor','Oppo','Vivo','Realme','iQOO','OnePlus','Google',
  'Sony','Nokia','Motorola','Asus','Lenovo','ZTE','Infinix','Tecno','Nothing','Meizu','LG','HTC','BlackBerry',
  'Sharp','Panasonic','Wiko','CAT'
]

router.get('/meta/brands', async (_req, res) => {
  res.json({ data: MOBILE_BRANDS })
})

export default router


