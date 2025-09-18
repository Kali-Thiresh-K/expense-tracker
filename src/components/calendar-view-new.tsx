import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/expense-utils';
import { DatabaseExpense } from '@/types/database';

interface CalendarViewProps {
  expenses: (DatabaseExpense & { date: Date; amount: number })[];
}

export const CalendarView = ({ expenses }: CalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Get first/last day of month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  // Get expenses for current month
  const monthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return (
      expenseDate.getMonth() === currentMonth &&
      expenseDate.getFullYear() === currentYear
    );
  });

  // Group expenses by day
  const expensesByDate: { [key: string]: typeof monthExpenses } = {};
  monthExpenses.forEach(expense => {
    const dayKey = new Date(expense.date).getDate().toString();
    if (!expensesByDate[dayKey]) expensesByDate[dayKey] = [];
    expensesByDate[dayKey].push(expense);
  });

  // Navigation
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + (direction === 'prev' ? -1 : 1));
      return newDate;
    });
  };

  // Names
  const monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  // Totals
  const monthTotal = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Build days
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayWeekday; i++) calendarDays.push(null);
  for (let day = 1; day <= daysInMonth; day++) calendarDays.push(day);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar Section */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendar View
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold min-w-[160px] text-center">
                {monthNames[currentMonth]} {currentYear}
              </h2>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center font-medium text-muted-foreground border-b pb-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => {
              const dayExpenses = day ? expensesByDate[day.toString()] || [] : [];
              const dayTotal = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
              const isToday =
                day &&
                new Date().getDate() === day &&
                new Date().getMonth() === currentMonth &&
                new Date().getFullYear() === currentYear;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.005 }}
                  className={`
                    min-h-[100px] p-2 border rounded-md
                    ${day ? 'bg-card hover:bg-accent/40 cursor-pointer' : 'bg-muted/30'}
                    ${isToday ? 'ring-2 ring-primary' : ''}
                    transition-colors
                  `}
                >
                  {day && (
                    <>
                      <div
                        className={`text-sm font-medium mb-1 ${
                          isToday ? 'text-primary' : 'text-foreground'
                        }`}
                      >
                        {day}
                      </div>

                      {dayExpenses.length > 0 && (
                        <div className="space-y-1">
                          {dayExpenses.slice(0, 2).map((exp, i) => (
                            <div
                              key={i}
                              className="text-xs p-1 bg-primary/10 text-primary rounded truncate"
                              title={`${exp.title}: ${formatCurrency(exp.amount)}`}
                            >
                              {exp.title}
                            </div>
                          ))}

                          {dayExpenses.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{dayExpenses.length - 2} more
                            </div>
                          )}

                          <div className="text-xs font-semibold text-accent mt-1">
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

      {/* Monthly Summary Side Card */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="lg:col-span-1"
      >
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Monthly Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
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
                  {monthExpenses.length > 0
                    ? formatCurrency(monthTotal / monthExpenses.length)
                    : '₹0'}
                </div>
                <div className="text-sm text-muted-foreground">Average per Expense</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};