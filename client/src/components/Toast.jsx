import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { CheckCircle, AlertCircle, X } from 'lucide-react'

const Toast = () => {
  const { toast } = useAuth()

  if (!toast) return null

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />
    }
  }

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'border-l-green-500'
      case 'error':
        return 'border-l-red-500'
      default:
        return 'border-l-green-500'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-up">
      <div className={`bg-white rounded-lg shadow-lg border-l-4 ${getBorderColor()} p-4 max-w-sm`}>
        <div className="flex items-center">
          {getIcon()}
          <p className="ml-3 text-sm font-medium text-gray-900">{toast.message}</p>
        </div>
      </div>
    </div>
  )
}

export default Toast
