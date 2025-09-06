import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ExpenseForm } from './expense-form-new';
import { Dashboard } from './dashboard-new';
import { ExpenseList } from './expense-list-new';
import { CalendarView } from './calendar-view-new';
import { useExpenses } from '@/hooks/use-expenses';
import { useAuth } from '@/hooks/use-auth';
import { formatCurrency } from '@/lib/expense-utils';

export const ExpenseTracker = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const { 
    expenses, 
    loading, 
    addExpense, 
    updateExpense, 
    deleteExpense,
    getMonthlyTotal,
    getYearlyTotal 
  } = useExpenses();
  const { user, signOut } = useAuth();

  const handleAddExpense = async (expenseData: any) => {
    await addExpense(expenseData);
    setIsFormOpen(false);
  };

  const handleEditExpense = (expense: any) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const handleUpdateExpense = async (expenseData: any) => {
    if (editingExpense) {
      await updateExpense(editingExpense.id, expenseData);
      setEditingExpense(null);
      setIsFormOpen(false);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingExpense(null);
  };

  const monthlyTotal = getMonthlyTotal();
  const yearlyTotal = getYearlyTotal();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <motion.h1
              className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              Expense Tracker
            </motion.h1>
            <div className="flex flex-col text-sm text-muted-foreground">
              <span>Monthly: {formatCurrency(monthlyTotal)}</span>
              <span>Yearly: {formatCurrency(yearlyTotal)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Card className="px-4 py-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{user?.email}</span>
              </div>
            </Card>
            
            <Button onClick={() => setIsFormOpen(true)} className="shadow-lg">
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
            
            <Button variant="outline" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </motion.div>

        {/* Monthly Total Highlight */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6"
        >
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-center">
                <div className="text-sm text-muted-foreground">This Month's Spending</div>
                <div className="text-3xl font-bold text-primary">
                  {formatCurrency(monthlyTotal)}
                </div>
              </CardTitle>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <Dashboard 
                expenses={expenses.map(exp => ({
                  ...exp,
                  date: new Date(exp.date),
                  amount: Number(exp.amount)
                } as any))} 
                totalBudget={50000} 
              />
            </TabsContent>

            <TabsContent value="expenses">
              <ExpenseList
                expenses={expenses.map(exp => ({
                  ...exp,
                  date: new Date(exp.date),
                  amount: Number(exp.amount)
                } as any))}
                onEditExpense={handleEditExpense}
                onDeleteExpense={deleteExpense}
              />
            </TabsContent>

            <TabsContent value="calendar">
              <CalendarView 
                expenses={expenses.map(exp => ({
                  ...exp,
                  date: new Date(exp.date),
                  amount: Number(exp.amount)
                } as any))} 
              />
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Welcome Message for New Users */}
        {expenses.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center py-12"
          >
            <h2 className="text-2xl font-semibold mb-4">Welcome to Your Expense Tracker!</h2>
            <p className="text-muted-foreground mb-6">
              Start by adding your first expense to begin tracking your finances.
            </p>
            <Button onClick={() => setIsFormOpen(true)} size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Add Your First Expense
            </Button>
          </motion.div>
        )}

        {/* Expense Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md w-full"
            >
              <ExpenseForm
                expense={editingExpense}
                onAddExpense={editingExpense ? handleUpdateExpense : handleAddExpense}
                onClose={handleCloseForm}
              />
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};