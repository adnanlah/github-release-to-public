import { GITHUB_TOKEN, octokit, OWNER, TARGET_REPO } from "./config"

export async function publish(payload: any) {
  if (!GITHUB_TOKEN || !TARGET_REPO || !OWNER) throw new Error("Invalid env values.")

  const createdRelease = await octokit.request(`POST /repos/{owner}/{repo}/releases`, {
    owner: OWNER,
    repo: TARGET_REPO,
    tag_name: payload.release.tag_name,
    target_commitish: "main",
    name: payload.release.tag_name,
    body: payload.release.body,
    draft: payload.release.draft,
    prerelease: payload.release.prerelease,
    generate_release_notes: false,
    headers: {
      "X-GitHub-Api-Version": "2022-11-28"
    }
  })

  console.log("Created release successfully! Release id: ", createdRelease.data.id)

  payload.release.assets.map(async (asset: any) => {
    try {
      const { url, label, browser_download_url, name: filename } = asset

      console.log("downloading: ", { browser_download_url, url, label, filename })

      const res = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/octet-stream",
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          "User-Agent": ""
        }
      })

      console.log("finished downloading")

      const blob = await res.blob()
      const arrayBuffer = await blob.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      await octokit.request(`POST ${createdRelease.data.upload_url}`, {
        owner: OWNER,
        repo: TARGET_REPO,
        release_id: createdRelease.data.id,
        data: buffer,
        name: filename,
        label,
        headers: {
          "Content-Type": "application/json, text/plain, */*",
          "X-GitHub-Api-Version": "2022-11-28"
        }
      })

      console.log("Finished uploading")
    } catch (err: any) {
      console.log("Error happened when downloading/uploading assets: ", err.message)
      throw err
    }
  })
}
