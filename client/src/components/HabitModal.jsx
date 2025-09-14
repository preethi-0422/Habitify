import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const HabitModal = ({ habit, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Personal'
  })

  const categories = ['Health', 'Study', 'Work', 'Personal', 'Fitness', 'Mindfulness', 'Social', 'Creative']

  useEffect(() => {
    if (habit) {
      setFormData({
        name: habit.name || '',
        description: habit.description || '',
        category: habit.category || 'Personal'
      })
    }
  }, [habit])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {habit ? 'Edit Habit' : 'Add New Habit'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Habit Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="input"
              placeholder="e.g., Drink 8 glasses of water"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="category"
              name="category"
              className="input"
              value={formData.category}
              onChange={handleChange}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              rows="3"
              className="input resize-none"
              placeholder="Why is this habit important to you?"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn btn-primary"
            >
              {habit ? 'Update Habit' : 'Add Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default HabitModal
