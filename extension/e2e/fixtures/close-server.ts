import type http from 'node:http'
import type { Socket } from 'node:net'

/**
 * node:http's Server.close() only stops accepting new connections — it waits for existing
 * ones to end before its callback fires, and Chrome keeps HTTP/1.1 keep-alive connections
 * open indefinitely. Without tracking and force-destroying sockets, close() hangs forever
 * once a real browser has talked to the server (discovered via a 30s teardown timeout here).
 */
export function trackConnections(server: http.Server): () => Promise<void> {
  const sockets = new Set<Socket>()
  server.on('connection', (socket) => {
    sockets.add(socket)
    socket.on('close', () => sockets.delete(socket))
  })

  return () =>
    new Promise((resolve) => {
      for (const socket of sockets) socket.destroy()
      server.close(() => resolve())
    })
}
