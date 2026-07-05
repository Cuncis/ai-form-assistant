import http from 'node:http'
import type { AddressInfo } from 'node:net'
import { trackConnections } from './close-server.js'

interface FakeField {
  fieldId: string
  question: string
}

/**
 * A minimal stand-in for the real Laravel backend, so the E2E suite doesn't depend on
 * PHP/Redis/a real Anthropic key being available. Returns realistic shapes for exactly the
 * endpoints the extension calls, including round-robin high/medium/low confidence answers
 * from /generate/batch — enough to exercise the full Review Panel flow (accept/reject/edit).
 */
export function startFakeBackend(): Promise<{ url: string; close: () => Promise<void> }> {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let body = ''
      req.on('data', (chunk) => (body += chunk))
      req.on('end', () => {
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Headers', '*')
        res.setHeader('Access-Control-Allow-Methods', '*')

        if (req.method === 'OPTIONS') {
          res.writeHead(204)
          res.end()
          return
        }

        const url = (req.url ?? '').split('?')[0]

        if (url === '/api/v1/auth/login' && req.method === 'POST') {
          respond(res, 200, {
            success: true,
            data: { token: 'fake-token', user: { id: '1', name: 'Test User', email: 'test@example.com', plan: 'free' } },
          })
          return
        }

        if (url === '/api/v1/profiles' && req.method === 'GET') {
          respond(res, 200, {
            success: true,
            data: [
              {
                id: '1',
                name: 'WordPress Dev',
                slug: 'wordpress-dev',
                headline: 'Senior Full Stack Developer',
                summary: 'I build end-to-end web products.',
                skills: ['WordPress', 'Laravel'],
                experience: [],
                isDefault: true,
                createdAt: '2026-01-01T00:00:00Z',
                updatedAt: '2026-01-01T00:00:00Z',
              },
            ],
          })
          return
        }

        if (url === '/api/v1/templates' && req.method === 'GET') {
          respond(res, 200, {
            success: true,
            data: [
              { id: '1', name: 'Job Application', systemPrompt: 'p', tone: 'professional', maxWords: 150, writingStyle: null, isSystem: true },
            ],
          })
          return
        }

        if (url === '/api/v1/generate/batch' && req.method === 'POST') {
          const parsed: { fields?: FakeField[] } = JSON.parse(body || '{}')
          const fields = parsed.fields ?? []
          const confidences = ['high', 'medium', 'low'] as const

          const data = fields.map((field, i) => {
            const confidence = confidences[i % 3]
            return {
              fieldId: field.fieldId,
              answer: `Fake answer for: ${field.question}`,
              confidence,
              assumptions: confidence === 'low' ? ['Fake low-confidence assumption.'] : [],
              cached: false,
            }
          })

          respond(res, 200, { success: true, data })
          return
        }

        respond(res, 404, { success: false, error: `Fake backend has no handler for ${req.method} ${url}` })
      })
    })

    const close = trackConnections(server)

    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address() as AddressInfo
      resolve({ url: `http://127.0.0.1:${port}`, close })
    })
  })
}

function respond(res: http.ServerResponse, status: number, body: unknown) {
  res.writeHead(status)
  res.end(JSON.stringify(body))
}
