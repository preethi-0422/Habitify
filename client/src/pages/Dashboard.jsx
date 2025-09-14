import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { TrendingUp, LogOut, Plus, Star, Flame, CheckCircle, Edit3, Trash2, User, Filter } from 'lucide-react'
import axios from 'axios'
import HabitModal from '../components/HabitModal'
import ProgressChart from '../components/ProgressChart'
import StreakBadges from '../components/StreakBadges'

const Dashboard = () => {
  const { user, logout, showToast, setUser } = useAuth()
  const [stats, setStats] = useState(null)
  const [habits, setHabits] = useState([])
  const [filteredHabits, setFilteredHabits] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [chartData, setChartData] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingHabit, setEditingHabit] = useState(null)
  const [loading, setLoading] = useState(true)

  const categories = ['All', 'Health', 'Study', 'Work', 'Personal', 'Fitness', 'Mindfulness', 'Social', 'Creative']
  
  const categoryColors = {
    Health: 'bg-green-100 text-green-800',
    Study: 'bg-blue-100 text-blue-800',
    Work: 'bg-purple-100 text-purple-800',
    Personal: 'bg-gray-100 text-gray-800',
    Fitness: 'bg-red-100 text-red-800',
    Mindfulness: 'bg-indigo-100 text-indigo-800',
    Social: 'bg-pink-100 text-pink-800',
    Creative: 'bg-yellow-100 text-yellow-800'
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  useEffect(() => {
    filterHabits()
  }, [habits, selectedCategory])

  const filterHabits = () => {
    if (selectedCategory === 'All') {
      setFilteredHabits(habits)
    } else {
      setFilteredHabits(habits.filter(habit => habit.category === selectedCategory))
    }
  }

  const loadDashboardData = async () => {
    try {
      const [statsRes, habitsRes, chartRes] = await Promise.all([
        axios.get('/api/user/stats'),
        axios.get('/api/habits'),
        axios.get('/api/habits/stats?days=7')
      ])
      
      setStats(statsRes.data)
      setHabits(habitsRes.data)
      setChartData(chartRes.data)
    } catch (error) {
      showToast('Error loading dashboard data', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteHabit = async (habitId) => {
    try {
      const response = await axios.put(`/api/habits/${habitId}/complete`)
      
      // Update local state
      setHabits(habits.map(habit => 
        habit._id === habitId ? response.data.habit : habit
      ))
      
      // Update user XP
      setUser(prev => ({ ...prev, xp: response.data.newXP }))
      
      showToast(`+10 XP! Great job completing "${response.data.habit.name}"!`)
      
      // Refresh stats and chart
      loadDashboardData()
    } catch (error) {
      const message = error.response?.data?.message || 'Error completing habit'
      showToast(message, 'error')
    }
  }

  const handleAddHabit = async (habitData) => {
    try {
      const response = await axios.post('/api/habits', habitData)
      setHabits([...habits, response.data])
      setShowModal(false)
      showToast('Habit added successfully!')
      loadDashboardData()
    } catch (error) {
      const message = error.response?.data?.message || 'Error adding habit'
      showToast(message, 'error')
    }
  }

  const handleUpdateHabit = async (habitId, habitData) => {
    try {
      const response = await axios.put(`/api/habits/${habitId}`, habitData)
      setHabits(habits.map(habit => 
        habit._id === habitId ? response.data : habit
      ))
      setEditingHabit(null)
      setShowModal(false)
      showToast('Habit updated successfully!')
    } catch (error) {
      const message = error.response?.data?.message || 'Error updating habit'
      showToast(message, 'error')
    }
  }

  const handleDeleteHabit = async (habitId) => {
    if (!window.confirm('Are you sure you want to delete this habit?')) return
    
    try {
      await axios.delete(`/api/habits/${habitId}`)
      setHabits(habits.filter(habit => habit._id !== habitId))
      showToast('Habit deleted successfully!')
      loadDashboardData()
    } catch (error) {
      showToast('Error deleting habit', 'error')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Habitify
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 font-medium">{stats?.name}</span>
              <Link to="/profile" className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                <User className="w-5 h-5" />
              </Link>
              <button
                onClick={logout}
                className="btn btn-secondary"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-primary-500 to-secondary-600 rounded-2xl p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">Welcome back, {stats?.name}!</h1>
            <p className="text-primary-100 text-lg">Keep up the great work on your habit journey</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="stat-card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mr-4">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{stats?.xp?.toLocaleString()}</h3>
                <p className="text-gray-600">XP Points</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-pink-500 rounded-xl flex items-center justify-center mr-4">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{stats?.maxStreak}</h3>
                <p className="text-gray-600">Day Streak</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center mr-4">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {stats?.habitsCompletedToday}/{stats?.totalHabits}
                </h3>
                <p className="text-gray-600">Today's Habits</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Habits Section */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900">Today's Habits</h2>
              <button
                onClick={() => setShowModal(true)}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Habit
              </button>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center space-x-2 mr-4">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filter:</span>
              </div>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {filteredHabits.length === 0 ? (
                <div className="card text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {selectedCategory === 'All' ? 'No habits yet' : `No ${selectedCategory} habits`}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {selectedCategory === 'All' 
                      ? 'Start your journey by adding your first habit!' 
                      : `Add a ${selectedCategory} habit to get started!`
                    }
                  </p>
                  <button
                    onClick={() => setShowModal(true)}
                    className="btn btn-primary"
                  >
                    Add Habit
                  </button>
                </div>
              ) : (
                filteredHabits.map((habit) => (
                  <div key={habit._id} className="card hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center">
                      <button
                        onClick={() => !habit.completedToday && handleCompleteHabit(habit._id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-all ${
                          habit.completedToday
                            ? 'bg-green-500 border-green-500 text-white cursor-default'
                            : 'border-gray-300 hover:border-green-500 hover:bg-green-50'
                        }`}
                        disabled={habit.completedToday}
                      >
                        {habit.completedToday && <CheckCircle className="w-4 h-4" />}
                      </button>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-semibold ${habit.completedToday ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {habit.name}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[habit.category] || categoryColors.Personal}`}>
                            {habit.category}
                          </span>
                        </div>
                        {habit.description && (
                          <p className="text-gray-600 text-sm">{habit.description}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-red-500">
                          <Flame className="w-4 h-4 mr-1" />
                          <span className="font-medium">{habit.streak}</span>
                        </div>
                        <StreakBadges streak={habit.streak} size="sm" />
                        <div className="text-yellow-500 font-medium">+10 XP</div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingHabit(habit)
                              setShowModal(true)
                            }}
                            className="text-gray-400 hover:text-primary-500 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteHabit(habit._id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Progress Chart */}
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Weekly Progress</h2>
            <ProgressChart data={chartData} />
          </div>
        </div>
      </main>

      {/* Habit Modal */}
      {showModal && (
        <HabitModal
          habit={editingHabit}
          onClose={() => {
            setShowModal(false)
            setEditingHabit(null)
          }}
          onSave={editingHabit ? 
            (data) => handleUpdateHabit(editingHabit._id, data) : 
            handleAddHabit
          }
        />
      )}
    </div>
  )
}

export default Dashboard
