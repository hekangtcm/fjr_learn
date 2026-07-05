import { spawn, ChildProcess } from 'child_process'
import { resolve } from 'path'

const BACKEND_DIR = resolve(__dirname, '..')
const PORT = 4000
const HEALTH_URL = `http://localhost:${PORT}/health`
const API_BASE = `http://localhost:${PORT}/api/v1`

// ─── Test State ───────────────────────────────────────────────
let token = ''
let workspaceId = ''
let userId = ''
let activityId = ''
let orderId = ''
let jobId = ''
let testEmail = ''

// ─── Helpers ────────────────────────────────────────────────
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitForBackend(maxMs = 30000, intervalMs = 500): Promise<boolean> {
  const start = Date.now()
  while (Date.now() - start < maxMs) {
    try {
      const res = await fetch(HEALTH_URL, { signal: AbortSignal.timeout(2000) })
      if (res.status === 200) return true
    } catch {
      // not ready yet
    }
    await sleep(intervalMs)
  }
  return false
}

function printResult(success: boolean, label: string, detail?: string) {
  const icon = success ? '✅' : '❌'
  const extra = detail ? `: ${detail}` : ''
  console.log(`${icon} ${label}${extra}`)
}

// Unwrap the backend's { code, message, data } envelope
async function apiFetch(url: string, options: RequestInit = {}): Promise<any> {
  const res = await fetch(url, options)
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    const msg = body?.message || `HTTP ${res.status}`
    throw new Error(msg)
  }
  return body?.data ?? body
}

// ─── Test Steps ─────────────────────────────────────────────

async function stepRegister(): Promise<boolean> {
  try {
    testEmail = `test-${Date.now()}@booknest.com`
    const body = await apiFetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'password123',
        name: 'Test User',
      }),
    })
    userId = body.id
    printResult(true, 'Register user', `id=${userId}`)
    return true
  } catch (err: any) {
    printResult(false, 'Register user', err.message)
    return false
  }
}

async function stepLogin(): Promise<boolean> {
  try {
    const body = await apiFetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'password123',
      }),
    })
    token = body.token
    printResult(true, 'Login (get token)', `token=${token.slice(0, 20)}...`)
    return true
  } catch (err: any) {
    printResult(false, 'Login (get token)', err.message)
    return false
  }
}

async function stepGetWorkspaces(): Promise<boolean> {
  try {
    const body = await apiFetch(`${API_BASE}/workspaces`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    workspaceId = body[0]?.id
    if (!workspaceId) throw new Error('No workspace returned')
    printResult(true, 'Get workspaces', `workspaceId=${workspaceId}`)
    return true
  } catch (err: any) {
    printResult(false, 'Get workspaces', err.message)
    return false
  }
}

async function stepCreateBook(): Promise<boolean> {
  try {
    const body = await apiFetch(`${API_BASE}/books`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Workspace-Id': workspaceId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Test Book',
        author: 'Test Author',
        status: 'READING',
        pageCount: 300,
      }),
    })
    printResult(true, 'Create book', `title=${body.title}`)
    return true
  } catch (err: any) {
    printResult(false, 'Create book', err.message)
    return false
  }
}

async function stepListBooks(): Promise<boolean> {
  try {
    const body = await apiFetch(`${API_BASE}/books`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Workspace-Id': workspaceId,
      },
    })
    const count = body.items?.length ?? 0
    printResult(true, 'List books', `${count} books`)
    return true
  } catch (err: any) {
    printResult(false, 'List books', err.message)
    return false
  }
}

async function stepCreateActivity(): Promise<boolean> {
  try {
    const startsAt = new Date(Date.now() + 86400000).toISOString()
    const body = await apiFetch(`${API_BASE}/activities`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Workspace-Id': workspaceId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: '读书会测试活动',
        description: '测试活动描述',
        capacity: 10,
        priceCents: 9900,
        startsAt,
        status: 'PUBLISHED',
      }),
    })
    activityId = body.id
    printResult(true, 'Create activity', `id=${activityId}`)
    return true
  } catch (err: any) {
    printResult(false, 'Create activity', err.message)
    return false
  }
}

async function stepCreateOrder(): Promise<boolean> {
  try {
    const body = await apiFetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Workspace-Id': workspaceId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ activityId }),
    })
    orderId = body.id
    printResult(true, 'Create order', `id=${orderId}, status=${body.status}`)
    return true
  } catch (err: any) {
    printResult(false, 'Create order', err.message)
    return false
  }
}

async function stepMockPay(): Promise<boolean> {
  try {
    const body = await apiFetch(`${API_BASE}/payments/mock/pay/${orderId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Workspace-Id': workspaceId,
      },
    })
    const ticketCode = body.ticket?.code ?? 'N/A'
    printResult(true, 'Mock pay', `ticketCode=${ticketCode}, idempotent=${body.idempotent}`)
    return true
  } catch (err: any) {
    printResult(false, 'Mock pay', err.message)
    return false
  }
}

async function stepMockPayIdempotent(): Promise<boolean> {
  try {
    const body = await apiFetch(`${API_BASE}/payments/mock/pay/${orderId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Workspace-Id': workspaceId,
      },
    })
    if (!body.idempotent) throw new Error('Expected idempotent=true')
    printResult(true, 'Mock pay idempotent', `idempotent=${body.idempotent}`)
    return true
  } catch (err: any) {
    printResult(false, 'Mock pay idempotent', err.message)
    return false
  }
}

async function stepListOrders(): Promise<boolean> {
  try {
    const body = await apiFetch(`${API_BASE}/orders/my`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Workspace-Id': workspaceId,
      },
    })
    const count = Array.isArray(body) ? body.length : 0
    printResult(true, 'List my orders', `${count} orders`)
    return true
  } catch (err: any) {
    printResult(false, 'List my orders', err.message)
    return false
  }
}

async function stepCSVImport(): Promise<boolean> {
  try {
    const csvContent = `title,author,status,pageCount,description
Book A,Author A,READING,200,Description A
Book B,Author B,OWNED,300,Description B
Book C,Author C,FINISHED,400,Description C
Invalid Book,,,,Missing author`

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const formData = new FormData()
    formData.append('file', blob, 'books.csv')

    const body = await apiFetch(`${API_BASE}/imports/books`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Workspace-Id': workspaceId,
      },
      body: formData,
    })
    jobId = body.id
    printResult(true, 'Upload CSV import', `jobId=${jobId}`)

    // Poll job status
    let jobStatus = ''
    for (let i = 0; i < 30; i++) {
      await sleep(500)
      const job = await apiFetch(`${API_BASE}/imports/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Workspace-Id': workspaceId,
        },
      })
      jobStatus = job.status
      if (jobStatus === 'SUCCESS' || jobStatus === 'FAILED') break
    }

    if (jobStatus === 'SUCCESS') {
      printResult(true, 'Poll import job', 'status=SUCCESS')
      return true
    }
    if (jobStatus === 'FAILED') {
      throw new Error('Import job FAILED')
    }
    throw new Error('Import job timed out')
  } catch (err: any) {
    printResult(false, 'CSV import', err.message)
    return false
  }
}

// ─── Main Orchestration ─────────────────────────────────────

async function runTests(): Promise<boolean> {
  console.log('\n🚀 Running API tests...\n')

  const steps = [
    stepRegister,
    stepLogin,
    stepGetWorkspaces,
    stepCreateBook,
    stepListBooks,
    stepCreateActivity,
    stepCreateOrder,
    stepMockPay,
    stepMockPayIdempotent,
    stepListOrders,
    stepCSVImport,
  ]

  for (const step of steps) {
    const ok = await step()
    if (!ok) return false
  }

  console.log('\n✅ All tests passed!')
  return true
}

// ─── Entry Point ────────────────────────────────────────────

async function main() {
  console.log('🟢 Starting backend server & worker...\n')

  const server: ChildProcess = spawn('npx', ['tsx', 'src/index.ts'], {
    cwd: BACKEND_DIR,
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'test' },
  })

  const worker: ChildProcess = spawn('npx', ['tsx', 'src/workers/index.ts'], {
    cwd: BACKEND_DIR,
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'test' },
  })

  let testsPassed = false

  function logOutput(proc: ChildProcess, label: string) {
    proc.stdout?.on('data', (data: Buffer) => {
      process.stdout.write(`[${label}] ${data.toString()}`)
    })
    proc.stderr?.on('data', (data: Buffer) => {
      process.stderr.write(`[${label}] ${data.toString()}`)
    })
  }

  logOutput(server, 'backend')
  logOutput(worker, 'worker')

  try {
    // Wait for server to be ready
    const ready = await waitForBackend(30000, 500)
    if (!ready) {
      console.error('❌ Backend failed to start within 30s')
      return
    }
    console.log('✅ Backend is healthy\n')

    testsPassed = await runTests()
  } catch (err: any) {
    console.error(`\n❌ Unexpected error: ${err.message}`)
  } finally {
    console.log('\n🛑 Killing backend & worker processes...')
    for (const proc of [server, worker]) {
      if (!proc.killed) {
        proc.kill('SIGTERM')
        setTimeout(() => {
          if (!proc.killed) proc.kill('SIGKILL')
        }, 5000)
      }
    }
  }

  process.exit(testsPassed ? 0 : 1)
}

main()
