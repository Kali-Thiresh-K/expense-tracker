import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Target, Calendar, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  formatCurrency,
  calculateCategorySpending,
  generateSavingSuggestion,
  defaultCategories,
} from "@/lib/expense-utils";
import { DatabaseExpense } from "@/types/database";

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
  const currentMonthExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    return (
      expenseDate.getMonth() === currentDate.getMonth() &&
      expenseDate.getFullYear() === currentDate.getFullYear()
    );
  });
  const monthlySpent = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // 🔥 Dynamic category budgets
  const categoriesWithDynamicBudget = defaultCategories.map((cat) => ({
    ...cat,
    budget: (cat.allocation || 1 / defaultCategories.length) * totalBudget,
  }));
  const categorySpending = calculateCategorySpending(expenses, categoriesWithDynamicBudget);

  const savingSuggestions = generateSavingSuggestion(categorySpending);

  // Animations
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 lg:space-y-6">
      {/* 🔹 Top Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <motion.div variants={item}>
          <Card className="p-2 bg-gradient-to-r from-blue-500/20 to-blue-400/10 border border-blue-500/30">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600">Total Spent</p>
                <p className="text-lg font-bold text-blue-700">{formatCurrency(totalSpent)}</p>
              </div>
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card
            className={`p-2 bg-gradient-to-r ${
              remaining >= 0
                ? "from-green-400/20 to-green-300/10 border-green-400/30"
                : "from-red-400/20 to-red-300/10 border-red-400/30"
            }`}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Remaining</p>
                <p className={`text-lg font-bold ${remaining >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(Math.abs(remaining))}
                </p>
              </div>
              {remaining >= 0 ? <Target className="h-6 w-6 text-green-600" /> : <TrendingDown className="h-6 w-6 text-red-600" />}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="p-2 bg-gradient-to-r from-indigo-500/20 to-indigo-400/10 border border-indigo-400/30">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-indigo-600">This Month</p>
                <p className="text-lg font-bold text-indigo-700">{formatCurrency(monthlySpent)}</p>
              </div>
              <Calendar className="h-6 w-6 text-indigo-600" />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* 🔹 Budget Progress */}
      <motion.div variants={item}>
        <Card className="shadow-sm">
          <CardHeader className="p-3">
            <CardTitle className="text-blue-700 text-sm">Budget Progress</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="space-y-2">
              <Progress value={Math.min(spentPercentage, 100)} className="h-2 bg-blue-200" />
              <div className="flex justify-between text-xs text-gray-600">
                <span>Spent: {formatCurrency(totalSpent)}</span>
                <span>Budget: {formatCurrency(totalBudget)}</span>
              </div>
              <p className="text-xs text-blue-600">
                {spentPercentage > 100
                  ? `⚠️ Over budget by ${formatCurrency(totalSpent - totalBudget)}`
                  : `${(100 - spentPercentage).toFixed(1)}% remaining`}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 🔹 Category Budgets */}
      <motion.div variants={item}>
        <Card className="shadow-sm">
          <CardHeader className="p-3">
            <CardTitle className="text-blue-700 text-sm">Category Budget Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categorySpending.map((category) => (
                <div key={category.category} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{category.icon}</span>
                      <span className="font-medium text-sm">{category.category}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatCurrency(category.spent)} / {formatCurrency(category.budget)}
                    </span>
                  </div>
                  <Progress value={Math.min(category.percentage, 100)} className="h-1.5 bg-blue-200" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 🔹 Smart Insights */}
      <motion.div variants={item}>
        <Card className="shadow-sm">
          <CardHeader className="p-3">
            <CardTitle className="flex items-center gap-2 text-blue-700 text-sm">
              <Award className="h-4 w-4" /> Smart Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {generateSavingSuggestion(categorySpending).map((suggestion, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded-md">
                  <Badge variant="secondary" className="text-xs px-1">
                    Tip
                  </Badge>
                  <p className="text-xs leading-relaxed text-blue-700">{suggestion}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};