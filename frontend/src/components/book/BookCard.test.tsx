import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import BookCard from '@/components/book/BookCard'
import type { Book } from '@/types'

describe('BookCard', () => {
  const mockBook: Book = {
    id: '1',
    title: '深入浅出 React',
    author: '张三',
    status: 'READING',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  }

  it('should render book title and author', () => {
    render(
      <BrowserRouter>
        <BookCard book={mockBook} />
      </BrowserRouter>
    )
    expect(screen.getByText('深入浅出 React')).toBeInTheDocument()
    expect(screen.getByText('张三')).toBeInTheDocument()
  })

  it('should render status badge', () => {
    render(
      <BrowserRouter>
        <BookCard book={mockBook} />
      </BrowserRouter>
    )
    expect(screen.getByText('在读')).toBeInTheDocument()
  })
})
