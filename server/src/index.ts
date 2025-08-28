import bodyParser from 'body-parser'
import express from 'express'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – use runtime CJS types if @types/cors not installed yet
import cors from 'cors'

import metaRoutes from './routes/meta'
import partsRoutes from './routes/parts'
import posRoutes from './routes/pos'
import printRoutes from './routes/print'

const app = express()
app.use(cors())
app.use(bodyParser.json())

app.use(posRoutes)
app.use(printRoutes)
app.use(partsRoutes)
app.use(metaRoutes)

const PORT = Number(process.env.PORT || 4000)
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`)
})


