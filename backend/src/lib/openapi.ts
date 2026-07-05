import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { bookSchema, createBookBodySchema, listBooksQuerySchema } from '@/schemas/book.schema'
import { authResponseSchema, loginBodySchema, registerBodySchema } from '@/schemas/auth.schema'
import { errorResponseSchema, paginatedResponse, successResponse } from '@/schemas/common.schema'

extendZodWithOpenApi(z)

export const registry = new OpenAPIRegistry()

registry.register('Book', bookSchema)
registry.register('CreateBookBody', createBookBodySchema)
registry.register('LoginBody', loginBodySchema)
registry.register('RegisterBody', registerBodySchema)
registry.register('AuthResponse', authResponseSchema)
registry.register('ErrorResponse', errorResponseSchema)

registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
})

registry.registerPath({
  method: 'post',
  path: '/api/v1/auth/login',
  summary: '用户登录',
  request: {
    body: {
      content: {
        'application/json': {
          schema: loginBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: '登录成功',
      content: {
        'application/json': {
          schema: successResponse(authResponseSchema),
        },
      },
    },
    400: {
      description: '参数错误',
      content: {
        'application/json': { schema: errorResponseSchema },
      },
    },
  },
})

registry.registerPath({
  method: 'get',
  path: '/api/v1/books',
  summary: '书籍列表',
  security: [{ bearerAuth: [] }],
  request: {
    query: listBooksQuerySchema,
  },
  responses: {
    200: {
      description: '书籍分页列表',
      content: {
        'application/json': {
          schema: paginatedResponse(bookSchema),
        },
      },
    },
  },
})

registry.registerPath({
  method: 'post',
  path: '/api/v1/books',
  summary: '创建书籍',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: createBookBodySchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: '创建成功',
      content: {
        'application/json': {
          schema: successResponse(bookSchema),
        },
      },
    },
  },
})

export function generateOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions)

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'BookNest API',
      version: '1.0.0',
      description: 'BookNest 全栈藏书管理系统 API 文档',
    },
    servers: [
      { url: 'http://localhost:4000', description: 'Local development' },
      { url: 'https://booknest.yourdomain.com', description: 'Production' },
    ],
  })
}
