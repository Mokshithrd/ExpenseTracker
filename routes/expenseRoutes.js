const express = require('express');
const Expense = require('../models/Expense');
const router = express.Router();
const { isLoggedIn } = require('../middleware.js');

// Render the homepage with all expenses
router.get('/', isLoggedIn, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }); // Fetch only the user's expenses
    res.render('index', { expenses });
  } catch (err) {
    res.status(500).send("Error fetching expenses");
  }
});

// Render the page to add a new expense
router.get('/add-expense', isLoggedIn, (req, res) => {
  res.render('add-expense');
});



// Handle form submission for adding an expense
router.post('/add-expense', isLoggedIn, async (req, res) => {
  const { amount, category, description } = req.body;
  const expense = new Expense({ 
    amount, 
    category, 
    description,
    user: req.user._id // Associate expense with logged-in user
  });
  
  try {
    await expense.save();
    res.redirect('/expense-list');
  } catch (err) {
    req.flash('error', 'Error adding expense.');
    res.redirect('/add-expense');
  }
});


// Render expense details
router.get('/expense-list', isLoggedIn, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }); // Fetch only the user's expenses
    res.render('expense-list', { expenses });
  } catch (err) {
    res.status(500).send("Error fetching expenses");
  }
});

// Delete an expense
router.get('/delete/:id', isLoggedIn, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (expense.user.toString() === req.user._id.toString()) {
      await Expense.findByIdAndDelete(req.params.id);
      req.flash('success', 'Expense deleted successfully!');
      res.redirect('/');
    } else {
      req.flash('error', 'You can only delete your own expenses.');
      res.redirect('/expense-list');
    }
  } catch (err) {
    res.status(500).send("Error deleting expense");
  }
});

// Show a summary of expenses
router.get('/summary', isLoggedIn, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }); // Fetch only the user's expenses
    const totalAmount = expenses.reduce((acc, expense) => acc + expense.amount, 0);
    res.render('summary', { totalAmount });
  } catch (err) {
    res.status(500).send("Error calculating summary");
  }
});


module.exports = router;
