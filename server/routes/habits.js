const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user's habits
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Add streak information to each habit
    const habitsWithStreaks = user.habits.map(habit => ({
      ...habit.toObject(),
      streak: user.getHabitStreak(habit._id),
      completedToday: isCompletedToday(habit)
    }));

    res.json(habitsWithStreaks);
  } catch (error) {
    console.error('Error fetching habits:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new habit
router.post('/', [
  auth,
  body('name').trim().isLength({ min: 1 }).withMessage('Habit name is required'),
  body('description').optional().trim(),
  body('category').optional().isIn(['Health', 'Study', 'Work', 'Personal', 'Fitness', 'Mindfulness', 'Social', 'Creative']).withMessage('Invalid category')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, category } = req.body;
    const user = await User.findById(req.user._id);

    const newHabit = {
      name,
      description: description || '',
      category: category || 'Personal',
      completions: []
    };

    user.habits.push(newHabit);
    await user.save();

    const createdHabit = user.habits[user.habits.length - 1];
    
    res.status(201).json({
      ...createdHabit.toObject(),
      streak: 0,
      completedToday: false
    });
  } catch (error) {
    console.error('Error creating habit:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update habit details
router.put('/:habitId', [
  auth,
  body('name').optional().trim().isLength({ min: 1 }).withMessage('Habit name cannot be empty'),
  body('description').optional().trim(),
  body('category').optional().isIn(['Health', 'Study', 'Work', 'Personal', 'Fitness', 'Mindfulness', 'Social', 'Creative']).withMessage('Invalid category')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user._id);
    const habit = user.habits.id(req.params.habitId);

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // Update fields if provided
    if (req.body.name !== undefined) habit.name = req.body.name;
    if (req.body.description !== undefined) habit.description = req.body.description;
    if (req.body.category !== undefined) habit.category = req.body.category;

    await user.save();

    const updatedHabit = {
      ...habit.toObject(),
      streak: user.getHabitStreak(habit._id),
      completedToday: isCompletedToday(habit)
    };

    res.json(updatedHabit);
  } catch (error) {
    console.error('Error updating habit:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark habit as complete
router.put('/:habitId/complete', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const habit = user.habits.id(req.params.habitId);

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already completed today
    const todayCompletion = habit.completions.find(c => {
      const completionDate = new Date(c.date);
      completionDate.setHours(0, 0, 0, 0);
      return completionDate.getTime() === today.getTime();
    });

    if (todayCompletion) {
      return res.status(400).json({ message: 'Habit already completed today' });
    }

    // Add completion for today
    habit.completions.push({
      date: new Date(),
      completed: true
    });

    // Award XP
    user.xp += 10;

    await user.save();

    const updatedHabit = {
      ...habit.toObject(),
      streak: user.getHabitStreak(habit._id),
      completedToday: true
    };

    res.json({
      habit: updatedHabit,
      newXP: user.xp
    });
  } catch (error) {
    console.error('Error completing habit:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get habit completion data for charts
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const days = parseInt(req.query.days) || 7;
    
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    const chartData = [];
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const currentDate = new Date(d);
      currentDate.setHours(0, 0, 0, 0);
      
      let completedCount = 0;
      
      user.habits.forEach(habit => {
        const dayCompletion = habit.completions.find(c => {
          const completionDate = new Date(c.date);
          completionDate.setHours(0, 0, 0, 0);
          return completionDate.getTime() === currentDate.getTime() && c.completed;
        });
        
        if (dayCompletion) {
          completedCount++;
        }
      });
      
      chartData.push({
        date: currentDate.toISOString().split('T')[0],
        day: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
        completed: completedCount,
        total: user.habits.length
      });
    }

    res.json(chartData);
  } catch (error) {
    console.error('Error fetching habit stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete habit
router.delete('/:habitId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const habit = user.habits.id(req.params.habitId);

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    habit.remove();
    await user.save();

    res.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    console.error('Error deleting habit:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to check if habit is completed today
function isCompletedToday(habit) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return habit.completions.some(c => {
    const completionDate = new Date(c.date);
    completionDate.setHours(0, 0, 0, 0);
    return completionDate.getTime() === today.getTime() && c.completed;
  });
}

module.exports = router;
