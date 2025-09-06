import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/expense-utils';
import { DatabaseExpense } from '@/types/database';

interface CalendarViewProps {
  expenses: (DatabaseExpense & { date: Date; amount: number })[];
}

export const CalendarView = ({ expenses }: CalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Get first day of the month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  // Get expenses for current month
  const monthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && 
           expenseDate.getFullYear() === currentYear;
  });

  // Group expenses by date
  const expensesByDate: { [key: string]: typeof monthExpenses } = {};
  monthExpenses.forEach(expense => {
    const dateKey = new Date(expense.date).getDate().toString();
    if (!expensesByDate[dateKey]) {
      expensesByDate[dateKey] = [];
    }
    expensesByDate[dateKey].push(expense);
  });

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate total for the month
  const monthTotal = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Generate calendar days
  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(null);
  }
  
  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendar View
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Month Total: <span className="font-semibold text-foreground">{formatCurrency(monthTotal)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-xl font-semibold min-w-[200px] text-center">
                  {monthNames[currentMonth]} {currentYear}
                </h2>
                <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {dayNames.map(day => (
              <div key={day} className="p-2 text-center font-medium text-muted-foreground border-b">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {calendarDays.map((day, index) => {
              const dayExpenses = day ? expensesByDate[day.toString()] || [] : [];
              const dayTotal = dayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
              const isToday = day && 
                new Date().getDate() === day && 
                new Date().getMonth() === currentMonth && 
                new Date().getFullYear() === currentYear;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.01 }}
                  className={`
                    min-h-[120px] p-2 border rounded-lg
                    ${day ? 'bg-card hover:bg-accent/50 cursor-pointer' : 'bg-muted/30'}
                    ${isToday ? 'ring-2 ring-primary' : ''}
                    transition-colors
                  `}
                >
                  {day && (
                    <>
                      <div className={`
                        text-sm font-medium mb-2
                        ${isToday ? 'text-primary' : 'text-foreground'}
                      `}>
                        {day}
                      </div>
                      
                      {dayExpenses.length > 0 && (
                        <div className="space-y-1">
                          {dayExpenses.slice(0, 2).map((expense, expenseIndex) => (
                            <div
                              key={expenseIndex}
                              className="text-xs p-1 bg-primary/10 text-primary rounded truncate"
                              title={`${expense.title}: ${formatCurrency(expense.amount)}`}
                            >
                              {expense.title}
                            </div>
                          ))}
                          
                          {dayExpenses.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{dayExpenses.length - 2} more
                            </div>
                          )}
                          
                          <div className="text-xs font-medium text-accent mt-1">
                            {formatCurrency(dayTotal)}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Month Summary */}
      {monthExpenses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Month Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{monthExpenses.length}</div>
                  <div className="text-sm text-muted-foreground">Total Expenses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">{formatCurrency(monthTotal)}</div>
                  <div className="text-sm text-muted-foreground">Total Amount</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">
                    {monthExpenses.length > 0 ? formatCurrency(monthTotal / monthExpenses.length) : '₹0'}
                  </div>
                  <div className="text-sm text-muted-foreground">Average per Expense</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};