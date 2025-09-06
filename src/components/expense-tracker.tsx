import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, BarChart3, Calendar, List, TrendingUp, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ExpenseForm } from './expense-form';
import { Dashboard } from './dashboard';
import { ExpenseList } from './expense-list';
import { CalendarView } from './calendar-view';
import { Expense } from '@/types/expense';
import { useToast } from '@/hooks/use-toast';

export const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { toast } = useToast();
  
  // Load expenses from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('expenses');
    if (saved) {
      try {
        const parsedExpenses = JSON.parse(saved).map((expense: any) => ({
          ...expense,
          date: new Date(expense.date)
        }));
        setExpenses(parsedExpenses);
      } catch (error) {
        console.error('Failed to load expenses:', error);
      }
    }
  }, []);

  // Save expenses to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  const addExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: Date.now().toString()
    };
    
    setExpenses(prev => [newExpense, ...prev]);
    setIsFormOpen(false);
    
    toast({
      title: "Expense Added! 🎉",
      description: `${expenseData.title} - ₹${expenseData.amount}`,
    });
  };

  const editExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const updateExpense = (expenseData: Omit<Expense, 'id'>) => {
    if (!editingExpense) return;
    
    const updatedExpense: Expense = {
      ...expenseData,
      id: editingExpense.id
    };
    
    setExpenses(prev => prev.map(exp => 
      exp.id === editingExpense.id ? updatedExpense : exp
    ));
    
    setEditingExpense(null);
    setIsFormOpen(false);
    
    toast({
      title: "Expense Updated! ✏️",
      description: `${expenseData.title} has been updated`,
    });
  };

  const deleteExpense = (id: string) => {
    const expense = expenses.find(exp => exp.id === id);
    setExpenses(prev => prev.filter(exp => exp.id !== id));
    
    toast({
      title: "Expense Deleted! 🗑️",
      description: expense ? `${expense.title} has been removed` : "Expense removed",
    });
  };

  const totalBudget = 50000; // Default budget, could be made configurable

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-muted/40 bg-background/80 backdrop-blur-lg sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">ExpenseTracker</h1>
                <p className="text-xs text-muted-foreground">Smart AI-Powered Finance</p>
              </div>
            </motion.div>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow"
                  onClick={() => setEditingExpense(null)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <ExpenseForm
                  onAddExpense={editingExpense ? updateExpense : addExpense}
                  onClose={() => {
                    setIsFormOpen(false);
                    setEditingExpense(null);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3 glass-card p-1">
              <TabsTrigger 
                value="dashboard" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-primary data-[state=active]:text-white"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger 
                value="expenses"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-primary data-[state=active]:text-white"
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">Expenses</span>
              </TabsTrigger>
              <TabsTrigger 
                value="calendar"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-primary data-[state=active]:text-white"
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Calendar</span>
              </TabsTrigger>
            </TabsList>
          </motion.div>

          <AnimatePresence mode="wait">
            <TabsContent value="dashboard" className="space-y-6">
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Dashboard expenses={expenses} totalBudget={totalBudget} />
              </motion.div>
            </TabsContent>

            <TabsContent value="expenses" className="space-y-6">
              <motion.div
                key="expenses"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <ExpenseList
                  expenses={expenses}
                  onEditExpense={editExpense}
                  onDeleteExpense={deleteExpense}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="calendar" className="space-y-6">
              <motion.div
                key="calendar"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <CalendarView expenses={expenses} />
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>

        {/* Welcome Message for New Users */}
        {expenses.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <div className="relative inline-block">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="text-6xl mb-4"
              >
                💰
              </motion.div>
              <motion.div
                className="absolute -top-2 -right-2"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="h-6 w-6 text-warning" />
              </motion.div>
            </div>
            <h2 className="text-2xl font-bold mb-2 gradient-text">
              Welcome to Your Smart Expense Tracker!
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start by adding your first expense. Our AI will automatically categorize it and provide smart insights to help you manage your finances better.
            </p>
            <Button 
              onClick={() => setIsFormOpen(true)}
              className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Your First Expense
            </Button>
          </motion.div>
        )}
      </main>
    </div>
  );
};