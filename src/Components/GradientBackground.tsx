import React from 'react'

const GradientBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[20%] left-[10%] w-96 h-96 bg-pink-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-[10%] right-[15%] w-80 h-80 bg-purple-200/25 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[20%] left-[50%] w-96 h-96 bg-blue-200/25 rounded-full blur-3xl animate-pulse"></div>
      </div>
    </div>
  )
}

export default GradientBackground