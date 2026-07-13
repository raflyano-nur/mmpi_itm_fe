import { useLoginMutation } from '@/Services/Modules/auth'
import React, { useState } from 'react'
import * as HeroIcons from 'react-icons/hi2'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import bgTele from '@/Assets/Images/bg_telemedicine.png'
// import 'react-lazy-load-image-component/src/effects/blur.css'
import { LoadingOutlined } from '@ant-design/icons'
import { Spin } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useNotification } from '@/Components/General/Notification'

const LoginContainer = () => {
  const navigate = useNavigate()
  const notification = useNotification()

  const [IsLoading, setIsLoading] = useState<boolean>(false)
  const [Username, setUsername] = useState<string>('')
  const [Password, setPassword] = useState<string>('')
  const [ShowPassword, setShowPassword] = useState<boolean>(false)

  const [login] = useLoginMutation()

  const postLogin = async () => {
    setIsLoading(true)

    try {
      const response = await login({
        username: Username,
        password: Password,
      }).unwrap()

      // =============================
      // SUCCESS
      // =============================
      if (response?.success) {
        notification.showNotification({
          title: 'Login Berhasil',
          description: response.message || `Selamat datang ${response.data?.user?.Name ?? ''}`,
          type: 'success',
        })

        const redirectPath = response.data?.redirect

        setTimeout(() => {
          navigate(redirectPath)
        }, 1000)
      }
    } catch (error: any) {
      const err = error?.data

      notification.showNotification({
        title: 'Login Gagal',
        description: err?.message || 'Username atau password salah',
        type: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {notification.contextHolder}

      <LazyLoadImage
        className="object-cover h-screen"
        alt="background_image"
        effect="blur"
        height="100%"
        width="100%"
        wrapperProps={{
          style: {
            transitionDelay: '1s',
          },
        }}
        src={bgTele}
      />

      <div className="absolute top-1/2 left-1/2 z-2 translate-y-[-50%] translate-x-[-50%] px-3 w-full mx-auto max-w-md transition-all duration-300">
        <div className="overflow-hidden bg-transparent border border-gray-300 shadow-md backdrop-blur-xl rounded-2xl">
          <div className="flex items-center p-6 bg-gradient-to-r from-primary to-primary-600">
            <div className="w-3" />
            <div>
              <h1 className="text-xl font-bold text-white">Selamat Datang</h1>
              <p className="mt-1 text-sm text-white/80">Silakan login untuk melanjutkan</p>
            </div>
          </div>

          <form
            className="p-6 space-y-6"
            onSubmit={(e) => {
              e.preventDefault()
              postLogin()
            }}
          >
            {/* USERNAME */}
            <div>
              <label className="block text-sm font-medium text-primary-800 mb-1.5">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <HeroIcons.HiOutlineUser className="text-primary-800" size={20} />
                </div>
                <input
                  type="text"
                  required
                  value={Username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full px-4 py-2 pl-10 text-sm bg-white border border-gray-300 rounded-lg focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  placeholder="Masukkan nama pengguna"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-medium text-primary-800 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <HeroIcons.HiOutlineLockClosed className="text-primary-800" size={20} />
                </div>
                <input
                  type={ShowPassword ? 'text' : 'password'}
                  required
                  value={Password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-4 py-2 pl-10 pr-10 text-sm bg-white border border-gray-300 rounded-lg focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  placeholder="Masukkan kata sandi Anda"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-primary-800 hover:text-primary-600"
                  tabIndex={-1}
                >
                  {ShowPassword ? (
                    <HeroIcons.HiOutlineEyeSlash size={20} />
                  ) : (
                    <HeroIcons.HiOutlineEye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={IsLoading}
              className={`${
                IsLoading ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
              } transition-all w-full flex justify-center py-3 px-4 rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary to-primary-700 hover:from-primary-600 hover:to-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
            >
              {IsLoading ? <Spin indicator={<LoadingOutlined spin />} /> : 'Login'}
            </button>
          </form>

          <div className="px-6 py-3 text-center">
            <p className="text-xs text-primary-800">© {new Date().getFullYear()} PT. Indo Tele Mediasoft</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default LoginContainer