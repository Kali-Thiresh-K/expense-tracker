import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Award,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SimpleChart } from "@/components/ui/simple-chart";
import { Expense } from "@/types/expense";
import {
  formatCurrency,
  calculateCategorySpending,
  defaultCategories,
  generateSavingSuggestion,
} from "@/lib/expense-utils";

interface DashboardProps {
  expenses: Expense[];
  totalBudget: number;
}

export const Dashboard = ({ expenses, totalBudget }: DashboardProps) => {
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remaining = totalBudget - totalSpent;
  const spendingPercentage = (totalSpent / totalBudget) * 100;

  const categorySpending = calculateCategorySpending(
    expenses,
    defaultCategories
  );
  const chartData = categorySpending
    .filter((cat) => cat.spent > 0)
    .map((cat) => ({
      name: cat.category,
      value: cat.spent,
      color: "#3b82f6", // 🔹 force attractive blue for chart slices
    }));

  const suggestions = generateSavingSuggestion(categorySpending);

  const thisMonthExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    const now = new Date();
    return (
      expenseDate.getMonth() === now.getMonth() &&
      expenseDate.getFullYear() === now.getFullYear()
    );
  });

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* 🔹 Main Stats in One Line */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Total Spent */}
        <motion.div variants={item}>
          <Card className="bg-gradient-to-r from-blue-500/20 to-blue-400/10 border border-blue-400/30 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">
                Total Spent
              </CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-blue-700">
                {formatCurrency(totalSpent)}
              </div>
              <p className="text-xs text-blue-500 mt-1">
                {spendingPercentage.toFixed(1)}% of budget used
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Remaining Budget */}
        <motion.div variants={item}>
          <Card className="bg-gradient-to-r from-indigo-500/20 to-indigo-400/10 border border-indigo-400/30 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-indigo-700">
                Remaining Budget
              </CardTitle>
              <Target className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-xl font-bold ${
                  remaining >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatCurrency(Math.abs(remaining))}
              </div>
              <p className="text-xs mt-1 flex items-center gap-1">
                {remaining >= 0 ? (
                  <>
                    <TrendingUp className="h-3 w-3 text-green-600" /> Under
                    budget
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-3 w-3 text-red-600" /> Over
                    budget
                  </>
                )}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* This Month */}
        <motion.div variants={item}>
          <Card className="bg-gradient-to-r from-cyan-500/20 to-cyan-400/10 border border-cyan-400/30 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-cyan-700">
                This Month
              </CardTitle>
              <Calendar className="h-4 w-4 text-cyan-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-cyan-700">
                {thisMonthExpenses.length}
              </div>
              <p className="text-xs text-cyan-500 mt-1">Expenses recorded</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* 🔹 Chart + Insights in One Line */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Spending by Category */}
        <motion.div variants={item}>
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                📊 Spending by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <div className="h-[260px]">
                  <SimpleChart data={chartData} type="pie" />
                </div>
              ) : (
                <div className="h-[260px] flex items-center justify-center text-gray-400">
                  No expenses yet
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Smart Insights */}
        <motion.div variants={item}>
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Award className="h-5 w-5 text-blue-600" /> Smart Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {suggestions.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-3 rounded-lg bg-blue-50 border border-blue-200"
                >
                  <p className="text-sm text-blue-700">{s}</p>
                </motion.div>
              ))}

              {/* Achievements */}
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2 text-blue-700">
                  🏆 Achievements
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    🎯 Expense Tracker
                  </Badge>
                  {totalSpent > 0 && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      💰 First Expense
                    </Badge>
                  )}
                  {remaining >= 0 && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      📈 Budget Keeper
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* 🔹 Category Budgets (Compact Grid) */}
      <motion.div variants={item}>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-blue-700">Category Budgets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categorySpending.slice(0, 8).map((cat, index) => (
                <motion.div
                  key={cat.category}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-3 rounded-lg border border-blue-200 bg-blue-50"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{cat.icon}</span>
                    <span className="text-sm font-medium truncate">
                      {cat.category}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-blue-700">
                        {formatCurrency(cat.spent)}
                      </span>
                      <span className="text-blue-500">
                        {formatCurrency(cat.budget)}
                      </span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300 bg-blue-600"
                        style={{
                          width: `${Math.min(cat.percentage, 100)}%`,
                        }}
                      />
                    </div>
                    <div className="text-xs text-center text-blue-600">
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