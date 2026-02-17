import dotenv from "dotenv"

dotenv.config({
  path: `${process.cwd()}/../../.env`
})

await import("./app.js")
