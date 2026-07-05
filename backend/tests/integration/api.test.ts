import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import request from 'supertest'
import app from '../../src/server'
import { getPrisma, disconnectPrisma } from '../setup'

let token: string
let userId: string
let workspaceId: string

describe('Auth Integration', () => {
  beforeAll(async () => {
    const prisma = getPrisma()
    await prisma.review.deleteMany()
    await prisma.book.deleteMany()
    await prisma.category.deleteMany()
    await prisma.invitation.deleteMany()
    await prisma.workspaceMember.deleteMany()
    await prisma.workspace.deleteMany()
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await disconnectPrisma()
  })

  it('POST /auth/register - should create a new user and default workspace', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'test@example.com', password: 'password123', name: 'Test User' })

    expect(res.status).toBe(201)
    expect(res.body.code).toBe(201)
    expect(res.body.data.email).toBe('test@example.com')
    userId = res.body.data.id
  })

  it('POST /auth/register - should reject duplicate email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'test@example.com', password: 'password123', name: 'Test User' })

    expect(res.status).toBe(409)
  })

  it('POST /auth/login - should return JWT token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'password123' })

    expect(res.status).toBe(200)
    expect(res.body.data.token).toBeDefined()
    token = res.body.data.token
  })

  it('POST /auth/login - should reject invalid password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' })

    expect(res.status).toBe(401)
  })

  it('GET /auth/me - should return user info with token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.data.email).toBe('test@example.com')
  })

  it('GET /auth/me - should reject without token', async () => {
    const res = await request(app).get('/api/v1/auth/me')
    expect(res.status).toBe(401)
  })
})

describe('Books Integration', () => {
  let bookId: string

  it('GET /workspaces - should return user workspaces', async () => {
    const res = await request(app)
      .get('/api/v1/workspaces')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.data.length).toBeGreaterThan(0)
    workspaceId = res.body.data[0].id
  })

  it('GET /books - should reject without token', async () => {
    const res = await request(app).get('/api/v1/books')
    expect(res.status).toBe(401)
  })

  it('GET /books - should reject without workspace header', async () => {
    const res = await request(app)
      .get('/api/v1/books')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(400)
  })

  it('GET /books - should return paginated books with token and workspace', async () => {
    const res = await request(app)
      .get('/api/v1/books')
      .set('Authorization', `Bearer ${token}`)
      .set('X-Workspace-Id', workspaceId)

    expect(res.status).toBe(200)
    expect(res.body.data.items).toBeDefined()
    expect(res.body.data.total).toBeDefined()
    expect(res.body.data.page).toBe(1)
  })

  it('POST /books - should create a book', async () => {
    const res = await request(app)
      .post('/api/v1/books')
      .set('Authorization', `Bearer ${token}`)
      .set('X-Workspace-Id', workspaceId)
      .send({ title: 'Clean Code', author: 'Robert C. Martin', status: 'READING', pageCount: 464 })

    expect(res.status).toBe(201)
    expect(res.body.data.title).toBe('Clean Code')
    bookId = res.body.data.id
  })

  it('GET /books/:id - should return book detail', async () => {
    const res = await request(app)
      .get(`/api/v1/books/${bookId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('X-Workspace-Id', workspaceId)

    expect(res.status).toBe(200)
    expect(res.body.data.title).toBe('Clean Code')
  })

  it('PUT /books/:id - should update book', async () => {
    const res = await request(app)
      .put(`/api/v1/books/${bookId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('X-Workspace-Id', workspaceId)
      .send({ title: 'Clean Code Updated', author: 'Robert C. Martin' })

    expect(res.status).toBe(200)
    expect(res.body.data.title).toBe('Clean Code Updated')
  })

  it('DELETE /books/:id - should delete book', async () => {
    const res = await request(app)
      .delete(`/api/v1/books/${bookId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('X-Workspace-Id', workspaceId)

    expect(res.status).toBe(200)
  })
})
