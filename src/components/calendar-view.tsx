import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Expense } from '@/types/expense';
import { formatCurrency, defaultCategories } from '@/lib/expense-utils';

interface CalendarViewProps {
  expenses: Expense[];
  onDateSelect?: (date: Date) => void;
}

export const CalendarView = ({ expenses, onDateSelect }: CalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getExpensesForDate = (date: Date) => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.toDateString() === date.toDateString();
    });
  };

  const getDayTotal = (date: Date) => {
    const dayExpenses = getExpensesForDate(date);
    return dayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getCategoryIcon = (categoryName: string) => {
    const category = defaultCategories.find(cat => cat.name === categoryName);
    return category?.icon || '💰';
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const today = new Date();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Create calendar grid
  const calendarDays = [];
  
  // Empty cells for days before the first day of month
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Expense Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium min-w-[140px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Day names header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={index} className="p-2 h-24"></div>;
            }

            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dayExpenses = getExpensesForDate(date);
            const dayTotal = getDayTotal(date);
            const isToday = date.toDateString() === today.toDateString();
            const hasPastDate = date < today;

            return (
              <motion.div
                key={day}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
                className={`
                  p-1 h-24 border border-muted rounded-lg cursor-pointer transition-all duration-200
                  hover:bg-muted/40 relative overflow-hidden
                  ${isToday ? 'ring-2 ring-primary bg-primary/10' : ''}
                  ${hasPastDate ? 'opacity-75' : ''}
                `}
                onClick={() => onDateSelect?.(date)}
              >
                <div className="flex flex-col h-full">
                  {/* Date number */}
                  <div className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
                    {day}
                  </div>

                  {/* Expenses */}
                  <div className="flex-1 overflow-hidden">
                    {dayTotal > 0 && (
                      <div className="text-xs font-medium text-center mb-1">
                        {formatCurrency(dayTotal)}
                      </div>
                    )}
                    
                    <div className="space-y-1">
                      {dayExpenses.slice(0, 2).map((expense, idx) => (
                        <motion.div
                          key={expense.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="text-xs p-1 rounded bg-muted/50 truncate flex items-center gap-1"
                          title={`${expense.title} - ${formatCurrency(expense.amount)}`}
                        >
                          <span className="text-[10px]">{getCategoryIcon(expense.category)}</span>
                          <span className="truncate">{expense.title}</span>
                        </motion.div>
                      ))}
                      
                      {dayExpenses.length > 2 && (
                        <div className="text-xs text-center text-muted-foreground">
                          +{dayExpenses.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expense count indicator */}
                  {dayExpenses.length > 0 && (
                    <div className="absolute top-1 right-1">
                      <Badge 
                        variant="secondary" 
                        className="h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                      >
                        {dayExpenses.length}
                      </Badge>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Monthly summary */}
        <div className="mt-6 pt-4 border-t border-muted">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">This month's total:</span>
            <span className="font-semibold text-lg gradient-text">
              {formatCurrency(
                expenses
                  .filter(expense => {
                    const expenseDate = new Date(expense.date);
                    return expenseDate.getMonth() === currentDate.getMonth() &&
                           expenseDate.getFullYear() === currentDate.getFullYear();
                  })
                  .reduce((sum, expense) => sum + expense.amount, 0)
              )}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};