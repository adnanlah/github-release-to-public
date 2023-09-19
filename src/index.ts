import crypto from "crypto"
import express, { Request, Response } from "express"
import nunjucks from "nunjucks"
import path from "path"
import { publish } from "./helpers"

const { GITHUB_TOKEN, OWNER, TARGET_REPO, PORT } = process.env

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
    res.send("gh release webhook")
  } catch (err: any) {
    res.sendStatus(500)
    res.json({ message: err.message })
  }
})

console.log("process.env.NODE_ENV", process.env.NODE_ENV)

app.post(
  "/webhook",
  async (req: Request, res: Response): Promise<Response<any, Record<string, any>>> => {
    try {
      const signature = req.header("X-Hub-Signature-256")
      const event = req.header("X-GitHub-Event")

      console.log({ event })

      const hash =
        "sha256=" +
        crypto
          .createHmac("sha256", process.env.SECRET || "")
          .update(req.body)
          .digest("hex")

      const isSafe = signature === hash

      if (process.env.NODE_ENV === "production" && !isSafe) {
        return res.sendStatus(403)
      } else {
        console.log("--- signature is correct ---")
        const payload = JSON.parse(req.body)
        console.log("--- payload.action ---", payload.action)

        if (payload.action !== "published")
          return res.sendStatus(400).send("Release actions is not published")

        if (!GITHUB_TOKEN || !TARGET_REPO || !OWNER)
          return res.sendStatus(400).send("Invalid environement variables")

        await publish(payload)

        return res.sendStatus(200)
      }
    } catch (err: any) {
      console.log(err.message)
      return res.status(500).send({ message: err.message })
    }
  }
)

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`)
})

export { app }
