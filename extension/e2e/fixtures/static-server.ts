import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import type { AddressInfo } from 'node:net'
import { trackConnections } from './close-server.js'

/** Serves e2e/fixtures/*.html on 127.0.0.1 — a real HTTP origin, since content scripts can't run on file:// without extra manifest permissions we don't otherwise need. */
export function startStaticServer(): Promise<{ url: string; close: () => Promise<void> }> {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const filePath = path.join(import.meta.dirname, req.url === '/' ? 'test-form.html' : (req.url ?? ''))
      fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(404)
          res.end('Not found')
          return
        }
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end(content)
      })
    })

    const close = trackConnections(server)

    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address() as AddressInfo
      resolve({ url: `http://127.0.0.1:${port}`, close })
    })
  })
}
