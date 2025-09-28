const User = require('../models/user');

exports.getBudget = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ budget: user.monthlyBudget || 15000 });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching budget' });
  }
};

exports.updateBudget = async (req, res) => {
  try {
    const { budget } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { monthlyBudget: budget },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ budget: user.monthlyBudget });
  } catch (error) {
    res.status(500).json({ message: 'Error updating budget' });
  }
};