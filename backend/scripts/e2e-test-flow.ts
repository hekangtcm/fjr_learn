import axios, { AxiosInstance } from 'axios'

const API = 'http://localhost:4000/api/v1'

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

class ApiTester {
  private client: AxiosInstance
  private token: string = ''
  private workspaceId: string = ''
  private userId: string = ''
  private activityId: string = ''
  private orderId: string = ''
  private ticketCode: string = ''
  private jobId: string = ''

  constructor() {
    this.client = axios.create({
      baseURL: API,
      timeout: 10000,
    })

    // Response interceptor to unwrap {code, message, data}
    this.client.interceptors.response.use(
      (response) => {
        if (response.data && typeof response.data === 'object' && 'data' in response.data) {
          return { ...response, data: response.data.data }
        }
        return response
      },
      (error) => {
        const msg = error.response?.data?.message || error.message
        console.error(`API Error: ${msg}`)
        return Promise.reject(error)
      }
    )
  }

  async testRegister() {
    console.log('=== 1. 注册用户 ===')
    const email = `test-${Date.now()}@booknest.com`
    const res = await this.client.post('/auth/register', {
      email,
      password: 'password123',
      name: 'Test User',
    })
    this.userId = res.data.id
    this.token = res.data.token
    console.log(`✅ 注册成功: ${res.data.email}, userId=${this.userId}`)
    return res.data
  }

  async testLogin() {
    console.log('=== 2. 登录 ===')
    const email = `test-${Date.now()}@booknest.com`
    await this.client.post('/auth/register', {
      email,
      password: 'password123',
      name: 'Test User',
    })
    const res = await this.client.post('/auth/login', {
      email,
      password: 'password123',
    })
    this.token = res.data.token
    this.userId = res.data.user.id
    console.log(`✅ 登录成功: token=${this.token.slice(0, 20)}...`)
  }

  async testGetWorkspaces() {
    console.log('=== 3. 获取工作区 ===')
    const res = await this.client.get('/workspaces', {
      headers: { Authorization: `Bearer ${this.token}` },
    })
    this.workspaceId = res.data[0].id
    console.log(`✅ 工作区: ${res.data[0].name}, id=${this.workspaceId}`)
  }

  async testCreateBook() {
    console.log('=== 4. 创建书籍 ===')
    const res = await this.client.post(
      '/books',
      {
        title: 'Test Book',
        author: 'Test Author',
        status: 'READING',
        pageCount: 300,
      },
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
          'X-Workspace-Id': this.workspaceId,
        },
      }
    )
    console.log(`✅ 书籍创建成功: ${res.data.title}`)
  }

  async testListBooks() {
    console.log('=== 5. 列出书籍 ===')
    const res = await this.client.get('/books', {
      headers: {
        Authorization: `Bearer ${this.token}`,
        'X-Workspace-Id': this.workspaceId,
      },
    })
    console.log(`✅ 书籍列表: ${res.data.items.length} 本`)
  }

  async testCreateActivity() {
    console.log('=== 6. 创建活动 ===')
    const startsAt = new Date(Date.now() + 86400000).toISOString()
    const res = await this.client.post(
      '/activities',
      {
        title: '读书会测试活动',
        description: '测试活动描述',
        capacity: 10,
        priceCents: 9900,
        startsAt,
        status: 'PUBLISHED',
      },
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
          'X-Workspace-Id': this.workspaceId,
        },
      }
    )
    this.activityId = res.data.id
    console.log(`✅ 活动创建成功: ${res.data.title}, id=${this.activityId}`)
  }

  async testCreateOrder() {
    console.log('=== 7. 创建订单 ===')
    const res = await this.client.post(
      '/orders',
      { activityId: this.activityId },
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
          'X-Workspace-Id': this.workspaceId,
        },
      }
    )
    this.orderId = res.data.id
    console.log(`✅ 订单创建成功: ${res.data.orderNo}, id=${this.orderId}, status=${res.data.status}`)
  }

  async testMockPay() {
    console.log('=== 8. 模拟支付 ===')
    const res = await this.client.post(
      `/payments/mock/pay/${this.orderId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
          'X-Workspace-Id': this.workspaceId,
        },
      }
    )
    this.ticketCode = res.data.ticket?.code
    console.log(`✅ 支付成功: ticketCode=${this.ticketCode}, idempotent=${res.data.idempotent}`)
  }

  async testIdempotentPay() {
    console.log('=== 9. 测试幂等性 ===')
    try {
      const res = await this.client.post(
        `/payments/mock/pay/${this.orderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'X-Workspace-Id': this.workspaceId,
          },
        }
      )
      console.log(`✅ 幂等性正常: idempotent=${res.data.idempotent}, ticketCode=${res.data.ticket?.code}`)
    } catch (err: any) {
      console.log(`⚠️ 幂等测试: ${err.response?.data?.message || err.message}`)
    }
  }

  async testListOrders() {
    console.log('=== 10. 列出我的订单 ===')
    const res = await this.client.get('/orders/my', {
      headers: {
        Authorization: `Bearer ${this.token}`,
        'X-Workspace-Id': this.workspaceId,
      },
    })
    console.log(`✅ 订单列表: ${res.data.length} 个订单`)
  }

  async testCSVImport() {
    console.log('=== 11. CSV 导入书籍 ===')
    const csvContent = `title,author,status,pageCount,description
Book A,Author A,READING,200,Description A
Book B,Author B,OWNED,300,Description B
Book C,Author C,FINISHED,400,Description C
Invalid Book,,,,Missing author`

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const formData = new (require('form-data'))()
    formData.append('file', blob, 'books.csv')

    const res = await this.client.post('/imports/books', formData, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        'X-Workspace-Id': this.workspaceId,
        ...formData.getHeaders(),
      },
    })
    this.jobId = res.data.id
    console.log(`✅ 导入任务创建: jobId=${this.jobId}`)

    // 轮询进度
    console.log('   等待导入完成...')
    for (let i = 0; i < 10; i++) {
      await sleep(500)
      const jobRes = await this.client.get(`/imports/${this.jobId}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          'X-Workspace-Id': this.workspaceId,
        },
      })
      const job = jobRes.data
      if (job.status === 'SUCCESS' || job.status === 'FAILED') {
        console.log(`✅ 导入完成: status=${job.status}, total=${job.total}, success=${job.successCount}, failed=${job.failedCount}`)
        break
      }
    }
  }

  async testExportBooks() {
    console.log('=== 12. 导出书籍 CSV ===')
    const res = await this.client.get('/exports/books', {
      headers: {
        Authorization: `Bearer ${this.token}`,
        'X-Workspace-Id': this.workspaceId,
      },
      responseType: 'text',
    })
    const lines = res.data.split('\n').filter((l: string) => l.trim())
    console.log(`✅ 导出成功: ${lines.length} 行 (含表头)`)
  }

  async runAll() {
    console.log('🚀 开始端到端测试...\n')
    const start = Date.now()

    try {
      await this.testRegister()
      await this.testGetWorkspaces()
      await this.testCreateBook()
      await this.testListBooks()
      await this.testCreateActivity()
      await this.testCreateOrder()
      await this.testMockPay()
      await this.testIdempotentPay()
      await this.testListOrders()
      await this.testCSVImport()
      await this.testExportBooks()

      const elapsed = ((Date.now() - start) / 1000).toFixed(2)
      console.log(`\n✅ 所有测试通过！耗时 ${elapsed}s`)
      return true
    } catch (err: any) {
      const elapsed = ((Date.now() - start) / 1000).toFixed(2)
      console.error(`\n❌ 测试失败: ${err.message}`)
      if (err.response) {
        console.error(`   Status: ${err.response.status}`)
        console.error(`   Message: ${err.response.data?.message || JSON.stringify(err.response.data)}`)
      }
      console.error(`   耗时: ${elapsed}s`)
      return false
    }
  }
}

async function main() {
  const tester = new ApiTester()
  const success = await tester.runAll()
  process.exit(success ? 0 : 1)
}

main()
