import { Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import BookList from '@/pages/BookList'
import BookCreate from '@/pages/BookCreate'
import BookDetail from '@/pages/BookDetail'
import BookEdit from '@/pages/BookEdit'
import CategoryManager from '@/pages/CategoryManager'
import Stats from '@/pages/Stats'
import Settings from '@/pages/Settings'
import Login from '@/pages/Login'
import Register from '@/pages/Register'

export default function AppRoutes() {
  return (
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
      </Route>
    </Routes>
  )
}
