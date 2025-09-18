import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, LogOut, User, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ExpenseForm } from './expense-form-new';
import { Dashboard } from './dashboard-new';
import { ExpenseList } from './expense-list-new';
import { CalendarView } from './calendar-view-new';
import { useExpenses } from '@/hooks/use-expenses';
import { useAuth } from '@/hooks/use-auth';
import { formatCurrency } from '@/lib/expense-utils';
import { supabase } from '@/lib/supabase';

export const ExpenseTracker = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [totalBudget, setTotalBudget] = useState<number>(15000); // 🔹 Default 15000
  const [newBudget, setNewBudget] = useState<number>(15000); // 🔹 Temp state for modal input

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

  // 🔹 Fetch budget from Supabase
  useEffect(() => {
    const fetchBudget = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("total_budget")
        .eq("id", user.id)
        .single();

      if (data?.total_budget) {
        setTotalBudget(Number(data.total_budget));
        setNewBudget(Number(data.total_budget)); // keep modal input in sync
      }
    };
    fetchBudget();
  }, [user]);

  // 🔹 Save budget to Supabase
  const handleBudgetChange = async (newBudgetValue: number) => {
    setTotalBudget(newBudgetValue);
    setNewBudget(newBudgetValue);

    if (user) {
      await supabase
        .from("profiles")
        .update({ total_budget: newBudgetValue })
        .eq("id", user.id);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <motion.h1
              className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
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

            {/* 🔹 Set Monthly Budget Button */}
            <Button 
              onClick={() => setIsBudgetModalOpen(true)} 
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-1 text-sm"
            >
              <Wallet className="h-4 w-4 mr-1" />
              Set Monthly Budget
            </Button>
            
            {/* 🔹 Add Expense Button */}
            <Button 
              onClick={() => setIsFormOpen(true)} 
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-1 text-sm"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Expense
            </Button>
            
            {/* 🔹 Sign Out Button */}
            <Button 
              onClick={signOut}
              size="sm"
              className="border border-blue-600 text-blue-600 bg-white hover:bg-blue-600 hover:text-white rounded-lg px-3 py-1 text-sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
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
                totalBudget={totalBudget}
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

        {/* Welcome Message */}
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
            <Button 
              onClick={() => setIsFormOpen(true)} 
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
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

        {/* Budget Modal */}
        {isBudgetModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-sm w-full bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-lg font-semibold mb-4 text-center">Set Monthly Budget</h2>
              <input
                type="number"
                value={newBudget}
                onChange={(e) => setNewBudget(Number(e.target.value))}
                className="w-full border rounded-md p-2 text-center font-semibold text-blue-600"
              />
              <div className="flex justify-end gap-2 mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsBudgetModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    handleBudgetChange(newBudget);
                    setIsBudgetModalOpen(false);
                  }}
                >
                  Save
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};
