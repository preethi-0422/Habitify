const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user stats (XP, overall streak info)
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Calculate overall streak (longest current streak across all habits)
    const maxStreak = user.getOverallStreak();

    // Count habits completed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const habitsCompletedToday = user.habits.filter(habit => {
      return habit.completions.some(c => {
        const completionDate = new Date(c.date);
        completionDate.setHours(0, 0, 0, 0);
        return completionDate.getTime() === today.getTime() && c.completed;
      });
    }).length;

    res.json({
      name: user.name,
      email: user.email,
      xp: user.xp,
      maxStreak: maxStreak,
      totalHabits: user.habits.length,
      habitsCompletedToday: habitsCompletedToday
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', [
  auth,
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').optional().isEmail().withMessage('Please enter a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email } = req.body;
    const user = await User.findById(req.user._id);

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already taken' });
      }
    }

    // Update fields if provided
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;

    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      xp: user.xp
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
