const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const habitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  category: {
    type: String,
    required: true,
    enum: ['Health', 'Study', 'Work', 'Personal', 'Fitness', 'Mindfulness', 'Social', 'Creative'],
    default: 'Personal'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completions: [{
    date: {
      type: Date,
      required: true
    },
    completed: {
      type: Boolean,
      default: true
    }
  }]
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  xp: {
    type: Number,
    default: 0
  },
  habits: [habitSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Calculate current streak for a specific habit
userSchema.methods.getHabitStreak = function(habitId) {
  const habit = this.habits.id(habitId);
  if (!habit || !habit.completions.length) return 0;

  // Sort completions by date (most recent first)
  const sortedCompletions = habit.completions
    .filter(c => c.completed)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (!sortedCompletions.length) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if completed today
  const todayCompletion = sortedCompletions.find(c => {
    const completionDate = new Date(c.date);
    completionDate.setHours(0, 0, 0, 0);
    return completionDate.getTime() === today.getTime();
  });

  if (!todayCompletion) {
    // If not completed today, check if completed yesterday to continue streak
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const yesterdayCompletion = sortedCompletions.find(c => {
      const completionDate = new Date(c.date);
      completionDate.setHours(0, 0, 0, 0);
      return completionDate.getTime() === yesterday.getTime();
    });

    if (!yesterdayCompletion) return 0;
  }

  // Count consecutive days
  let currentDate = new Date(today);
  if (!todayCompletion) {
    currentDate.setDate(currentDate.getDate() - 1);
  }

  for (const completion of sortedCompletions) {
    const completionDate = new Date(completion.date);
    completionDate.setHours(0, 0, 0, 0);
    
    if (completionDate.getTime() === currentDate.getTime()) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

// Get overall user streak (longest current streak across all habits)
userSchema.methods.getOverallStreak = function() {
  let maxStreak = 0;
  this.habits.forEach(habit => {
    const habitStreak = this.getHabitStreak(habit._id);
    if (habitStreak > maxStreak) {
      maxStreak = habitStreak;
    }
  });
  return maxStreak;
};

module.exports = mongoose.model('User', userSchema);
