import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import { PageSkeleton } from '@/components/ui/PageSkeleton'

const BookList = lazy(() => import('@/pages/BookList'))
const BookCreate = lazy(() => import('@/pages/BookCreate'))
const BookDetail = lazy(() => import('@/pages/BookDetail'))
const BookEdit = lazy(() => import('@/pages/BookEdit'))
const CategoryManager = lazy(() => import('@/pages/CategoryManager'))
const Stats = lazy(() => import('@/pages/Stats'))
const Settings = lazy(() => import('@/pages/Settings'))
const Activities = lazy(() => import('@/pages/Activities'))
const DataTools = lazy(() => import('@/pages/DataTools'))
const Login = lazy(() => import('@/pages/Login'))
const Register = lazy(() => import('@/pages/Register'))

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<BookList />} />
          <Route path="books/new" element={<BookCreate />} />
          <Route path="books/:id" element={<BookDetail />} />
          <Route path="books/:id/edit" element={<BookEdit />} />
          <Route path="categories" element={<CategoryManager />} />
          <Route path="stats" element={<Stats />} />
          <Route path="settings" element={<Settings />} />
          <Route path="activities" element={<Activities />} />
          <Route path="data-tools" element={<DataTools />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
