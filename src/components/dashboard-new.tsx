import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, Calendar, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { SimpleChart } from '@/components/ui/simple-chart';
import { formatCurrency, calculateCategorySpending, generateSavingSuggestion, defaultCategories } from '@/lib/expense-utils';
import { DatabaseExpense } from '@/types/database';

interface DashboardProps {
  expenses: (DatabaseExpense & { date: Date; amount: number })[];
  totalBudget: number;
}

export const Dashboard = ({ expenses, totalBudget }: DashboardProps) => {
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remaining = totalBudget - totalSpent;
  const spentPercentage = (totalSpent / totalBudget) * 100;

  // Current month expenses
  const currentDate = new Date();
  const currentMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentDate.getMonth() &&
           expenseDate.getFullYear() === currentDate.getFullYear();
  });
  const monthlySpent = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Yearly breakdown
  const currentYear = currentDate.getFullYear();
  const yearlyExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getFullYear() === currentYear;
  });

  const monthlyBreakdown = Array.from({ length: 12 }, (_, month) => {
    const monthExpenses = yearlyExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === month;
    });
    const monthTotal = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    return {
      name: new Date(2024, month).toLocaleDateString('en', { month: 'short' }),
      value: monthTotal,
      color: `hsl(${(month * 30) % 360}, 70%, 50%)`
    };
  });

  // Category spending analysis
  const categorySpending = calculateCategorySpending(expenses, defaultCategories);
  const categoryChartData = categorySpending
    .filter(cat => cat.spent > 0)
    .map(cat => ({
      name: cat.category,
      value: cat.spent,
      color: cat.color
    }));

  const savingSuggestions = generateSavingSuggestion(categorySpending);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={item}>
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(totalSpent)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className={`bg-gradient-to-br ${remaining >= 0 ? 'from-green-500/10 to-green-500/5 border-green-500/20' : 'from-red-500/10 to-red-500/5 border-red-500/20'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Remaining Budget</p>
                  <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(Math.abs(remaining))}
                  </p>
                </div>
                {remaining >= 0 ? (
                  <Target className="h-8 w-8 text-green-600" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-red-600" />
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold text-accent">{formatCurrency(monthlySpent)}</p>
                </div>
                <Calendar className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Budget Progress */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle>Budget Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Spent: {formatCurrency(totalSpent)}</span>
                <span>Budget: {formatCurrency(totalBudget)}</span>
              </div>
              <Progress value={Math.min(spentPercentage, 100)} className="h-3" />
              <p className="text-sm text-muted-foreground">
                {spentPercentage > 100 
                  ? `Over budget by ${formatCurrency(totalSpent - totalBudget)}`
                  : `${(100 - spentPercentage).toFixed(1)}% remaining`
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Yearly Breakdown */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle>Yearly Breakdown ({currentYear})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <SimpleChart data={monthlyBreakdown} type="bar" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Distribution */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {categoryChartData.length > 0 ? (
                  <SimpleChart data={categoryChartData} type="pie" />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No expenses to display
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Category Budget Breakdown */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle>Category Budget Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categorySpending.map((category) => (
                <div key={category.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{category.icon}</span>
                      <span className="font-medium">{category.category}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(category.spent)} / {formatCurrency(category.budget)}
                    </div>
                  </div>
                  <Progress 
                    value={Math.min(category.percentage, 100)} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Smart Insights */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Smart Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {savingSuggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                  <Badge variant="secondary" className="mt-1">
                    Tip
                  </Badge>
                  <p className="text-sm leading-relaxed">{suggestion}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};