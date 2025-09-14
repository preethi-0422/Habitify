import React from 'react'
import { Award, Star, Crown, Trophy } from 'lucide-react'

const StreakBadges = ({ streak, size = 'md' }) => {
  const badges = [
    { name: 'Starter', icon: Star, minStreak: 3, color: 'text-yellow-500', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' },
    { name: 'Committed', icon: Award, minStreak: 7, color: 'text-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
    { name: 'Dedicated', icon: Trophy, minStreak: 21, color: 'text-purple-500', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
    { name: 'Champion', icon: Crown, minStreak: 50, color: 'text-red-500', bgColor: 'bg-red-100 dark:bg-red-900/30' }
  ]

  const earnedBadges = badges.filter(badge => streak >= badge.minStreak)
  const nextBadge = badges.find(badge => streak < badge.minStreak)

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const badgeSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  if (size === 'sm' && earnedBadges.length === 0) {
    return null
  }

  return (
    <div className="flex items-center space-x-2">
      {earnedBadges.map((badge) => {
        const Icon = badge.icon
        return (
          <div
            key={badge.name}
            className={`${sizeClasses[size]} ${badge.bgColor} rounded-full flex items-center justify-center`}
            title={`${badge.name} Badge - ${badge.minStreak}+ day streak`}
          >
            <Icon className={`${badgeSizeClasses[size]} ${badge.color}`} />
          </div>
        )
      })}
      
      {size !== 'sm' && nextBadge && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {nextBadge.minStreak - streak} days to {nextBadge.name}
        </div>
      )}
    </div>
  )
}

export default StreakBadges
