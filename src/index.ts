require("dotenv").config()
import fetch from "node-fetch"
import express from "express"
import nunjucks from "nunjucks"
import crypto from "crypto"
import path from "path"
import { Response, Request } from "express"

const app = express()
app.use(express.raw({ type: "*/*" })) // raw data for
app.use(express.static(path.resolve(__dirname, "assets")))
app.set("view engine", "html")
app.set("views", path.join(__dirname, "../views"))

nunjucks.configure("views", {
  autoescape: true,
  express: app
})

app.get("/", (_req: Request, res: Response): void => {
  try {
    // res.render("index.njk")
    res.send('gh release webhook')
  } catch (err) {
    res.sendStatus(500)
    res.json({ message: err.message })
  }
})

app.post("/webhook", (req: Request, res: Response): void => {
  try {
    const signature = req.header("x-hub-signature-256")
    const hash = 'sha256=' + crypto
      .createHmac("sha256", process.env.SECRET || "")
      .update(req.body)
      .digest("hex")
    if (signature !== hash) {
      res.sendStatus(403)
    } else {
      const json = JSON.parse(req.body)
      console.log('signature is correct')
      res.sendStatus(200)
    }
  } catch (err) {
    res.sendStatus(500)
    console.log(err.message)
    res.json({ message: err.message })
  }
})

const port = process.env.PORT

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})

export { app }