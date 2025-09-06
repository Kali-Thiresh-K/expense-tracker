import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Target, Award, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SimpleChart } from '@/components/ui/simple-chart';
import { Expense } from '@/types/expense';
import { formatCurrency, calculateCategorySpending, defaultCategories, generateSavingSuggestion } from '@/lib/expense-utils';

interface DashboardProps {
  expenses: Expense[];
  totalBudget: number;
}

export const Dashboard = ({ expenses, totalBudget }: DashboardProps) => {
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remaining = totalBudget - totalSpent;
  const spendingPercentage = (totalSpent / totalBudget) * 100;
  
  const categorySpending = calculateCategorySpending(expenses, defaultCategories);
  const chartData = categorySpending
    .filter(cat => cat.spent > 0)
    .map(cat => ({
      name: cat.category,
      value: cat.spent,
      color: cat.color
    }));

  const suggestions = generateSavingSuggestion(categorySpending);
  
  const thisMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const now = new Date();
    return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
  });

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
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={item}>
          <Card className="glass-card hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Spent
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">
                {formatCurrency(totalSpent)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {spendingPercentage.toFixed(1)}% of budget used
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="glass-card hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Remaining Budget
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${remaining >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatCurrency(Math.abs(remaining))}
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                {remaining >= 0 ? (
                  <><TrendingUp className="h-3 w-3 text-success" /> Under budget</>
                ) : (
                  <><TrendingDown className="h-3 w-3 text-destructive" /> Over budget</>
                )}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="glass-card hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                This Month
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">
                {thisMonthExpenses.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Expenses recorded
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Chart and Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-lg">📊</span>
                Spending by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <div className="h-[300px]">
                  <SimpleChart data={chartData} type="pie" />
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No expenses recorded yet
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-warning" />
                Smart Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 rounded-lg bg-muted/30 border border-muted"
                >
                  <p className="text-sm">{suggestion}</p>
                </motion.div>
              ))}
              
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <span>🏆</span>
                  Achievements
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="badge-shine">
                    🎯 Expense Tracker
                  </Badge>
                  {totalSpent > 0 && (
                    <Badge variant="secondary" className="badge-shine">
                      💰 First Expense
                    </Badge>
                  )}
                  {remaining >= 0 && (
                    <Badge variant="secondary" className="badge-shine">
                      📈 Budget Keeper
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Category Progress */}
      <motion.div variants={item}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Category Budgets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categorySpending.slice(0, 8).map((cat, index) => (
                <motion.div
                  key={cat.category}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-lg border border-muted bg-muted/20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{cat.icon}</span>
                    <span className="text-sm font-medium truncate">{cat.category}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>{formatCurrency(cat.spent)}</span>
                      <span className="text-muted-foreground">{formatCurrency(cat.budget)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(cat.percentage, 100)}%`,
                          backgroundColor: cat.color
                        }}
                      />
                    </div>
                    <div className="text-xs text-center">
                      {cat.percentage.toFixed(1)}% used
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};