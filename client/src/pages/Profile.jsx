import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { TrendingUp, ArrowLeft, User, Mail, Star, Flame, Trophy, Edit3, Save, X } from 'lucide-react'
import axios from 'axios'
import ThemeToggle from '../components/ThemeToggle'

const Profile = () => {
  const { user, logout, showToast, setUser } = useAuth()
  const [stats, setStats] = useState(null)
  const [badges, setBadges] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfileData()
  }, [])

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || ''
      })
    }
  }, [user])

  const loadProfileData = async () => {
    try {
      const response = await axios.get('/api/user/stats')
      setStats(response.data)
      calculateBadges(response.data.maxStreak)
    } catch (error) {
      showToast('Error loading profile data', 'error')
    } finally {
      setLoading(false)
    }
  }

  const calculateBadges = (maxStreak) => {
    const badgesList = []
    
    if (maxStreak >= 7) {
      badgesList.push({ name: 'Bronze Streak', icon: '🥉', description: '7 day streak', achieved: true })
    }
    if (maxStreak >= 30) {
      badgesList.push({ name: 'Silver Streak', icon: '🥈', description: '30 day streak', achieved: true })
    }
    if (maxStreak >= 100) {
      badgesList.push({ name: 'Gold Streak', icon: '🥇', description: '100 day streak', achieved: true })
    }
    if (maxStreak >= 365) {
      badgesList.push({ name: 'Diamond Streak', icon: '💎', description: '365 day streak', achieved: true })
    }

    // Add upcoming badges
    if (maxStreak < 7) {
      badgesList.push({ name: 'Bronze Streak', icon: '🥉', description: '7 day streak', achieved: false, progress: maxStreak, target: 7 })
    } else if (maxStreak < 30) {
      badgesList.push({ name: 'Silver Streak', icon: '🥈', description: '30 day streak', achieved: false, progress: maxStreak, target: 30 })
    } else if (maxStreak < 100) {
      badgesList.push({ name: 'Gold Streak', icon: '🥇', description: '100 day streak', achieved: false, progress: maxStreak, target: 100 })
    } else if (maxStreak < 365) {
      badgesList.push({ name: 'Diamond Streak', icon: '💎', description: '365 day streak', achieved: false, progress: maxStreak, target: 365 })
    }

    setBadges(badgesList)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSave = async () => {
    try {
      const response = await axios.put('/api/user/profile', formData)
      setUser(response.data)
      setIsEditing(false)
      showToast('Profile updated successfully!')
    } catch (error) {
      const message = error.response?.data?.message || 'Error updating profile'
      showToast(message, 'error')
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      email: user.email || ''
    })
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link 
                to="/dashboard" 
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Habitify
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button
                onClick={logout}
                className="btn btn-secondary"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-primary"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  className="btn btn-success"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="btn btn-secondary"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* User Info */}
            <div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input"
                      required
                    />
                  ) : (
                    <p className="text-lg text-gray-900 dark:text-white">{stats?.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input"
                      required
                    />
                  ) : (
                    <p className="text-lg text-gray-900 dark:text-white">{stats?.email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl">
                <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.xp?.toLocaleString()}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">XP Points</div>
              </div>

              <div className="text-center p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl">
                <Flame className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.maxStreak}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Best Streak</div>
              </div>

              <div className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl">
                <Trophy className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalHabits}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Habits</div>
              </div>

              <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{badges.filter(b => b.achieved).length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Badges Earned</div>
              </div>
            </div>
          </div>
        </div>

        {/* Badges Section */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Streak Badges</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {badges.map((badge, index) => (
              <div 
                key={index}
                className={`p-4 rounded-xl border-2 transition-all ${
                  badge.achieved 
                    ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' 
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`text-4xl ${badge.achieved ? 'grayscale-0' : 'grayscale opacity-50'}`}>
                    {badge.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${badge.achieved ? 'text-green-800 dark:text-green-200' : 'text-gray-600 dark:text-gray-400'}`}>
                      {badge.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{badge.description}</p>
                    {!badge.achieved && badge.progress !== undefined && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                          <span>Progress</span>
                          <span>{badge.progress}/{badge.target}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(badge.progress / badge.target) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                  {badge.achieved && (
                    <div className="text-green-500">
                      <Trophy className="w-6 h-6" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {badges.filter(b => b.achieved).length === 0 && (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No badges yet</h3>
              <p className="text-gray-600 dark:text-gray-400">Keep building your streaks to earn badges!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Profile
