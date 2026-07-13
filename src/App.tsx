import React from 'react'
import './App.css'
import { Provider } from 'react-redux'
import { Route, Routes, Navigate } from 'react-router-dom'
import { store } from './Store'
import '@/Assets/Fonts/fonts.css'

import ErrorBoundary from '@/Components/Errors/ErrorBoundary'
import {
  LoginContainer,
  DashboardContainer,
  AdminMembersContainer,
  AdminListContainer,
  AdminDownloadContainer,
  AdminMemberCreateContainer,
} from './Containers'
import { ProtectedRoute, PublicOnlyRoute, CatchAllRoute } from './Config/ProtectedRoute'

const AppRoutes = () => {
  return (
    <Routes>
      {/* Root route - redirect to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public Route - Login (redirect ke dashboard kalau sudah login) */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginContainer />
          </PublicOnlyRoute>
        }
      />

      {/* Protected Route - Satu dashboard untuk semua role, isi beda diatur di dalam Container */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardContainer />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/list"
        element={
          <ProtectedRoute>
            <AdminListContainer />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/members/create"
        element={
          <ProtectedRoute>
            <AdminMemberCreateContainer />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/members"
        element={
          <ProtectedRoute>
            <AdminMembersContainer />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/download"
        element={
          <ProtectedRoute>
            <AdminDownloadContainer />
          </ProtectedRoute>
        }
      />

      {/* 404 Not Found / belum login - Catch all */}
      <Route path="*" element={<CatchAllRoute />} />
    </Routes>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <AppRoutes />
      </Provider>
    </ErrorBoundary>
  )
}

export default App
