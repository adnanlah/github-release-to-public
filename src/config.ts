import dotenv from "dotenv"
import { Octokit } from "octokit"

const { GITHUB_TOKEN, OWNER, TARGET_REPO, PORT } = process.env

const octokit = new Octokit({
  auth: GITHUB_TOKEN
})

export { GITHUB_TOKEN, OWNER, TARGET_REPO, PORT, octokit }
