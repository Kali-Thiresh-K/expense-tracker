import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2, Calendar, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Expense } from '@/types/expense';
import { formatCurrency, defaultCategories } from '@/lib/expense-utils';

interface ExpenseListProps {
  expenses: Expense[];
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

export const ExpenseList = ({ expenses, onEditExpense, onDeleteExpense }: ExpenseListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const filteredExpenses = expenses
    .filter(expense => {
      const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          expense.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return b.amount - a.amount;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'date':
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

  const getCategoryIcon = (categoryName: string) => {
    const category = defaultCategories.find(cat => cat.name === categoryName);
    return category?.icon || '💰';
  };

  const getCategoryColor = (categoryName: string) => {
    const category = defaultCategories.find(cat => cat.name === categoryName);
    return category?.color || 'hsl(262 83% 58%)';
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Expense History
        </CardTitle>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-muted/50 border-muted"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48 bg-muted/50 border-muted">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {defaultCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>
                  <div className="flex items-center gap-2">
                    <span>{cat.icon}</span>
                    {cat.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-32 bg-muted/50 border-muted">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="amount">Amount</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredExpenses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium mb-2">No expenses found</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Start by adding your first expense'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            <AnimatePresence>
              {filteredExpenses.map((expense) => (
                <motion.div
                  key={expense.id}
                  variants={item}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  layout
                  className="group"
                >
                  <div className="p-4 rounded-lg border border-muted bg-muted/20 hover:bg-muted/40 transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                          style={{ backgroundColor: `${getCategoryColor(expense.category)}20` }}
                        >
                          {getCategoryIcon(expense.category)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{expense.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant="secondary" 
                              className="text-xs"
                              style={{ 
                                backgroundColor: `${getCategoryColor(expense.category)}20`,
                                color: getCategoryColor(expense.category)
                              }}
                            >
                              {expense.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(expense.date).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          {expense.description && (
                            <p className="text-sm text-muted-foreground mt-1 truncate">
                              {expense.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-semibold text-lg">
                            {formatCurrency(expense.amount)}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onEditExpense(expense)}
                            className="h-8 w-8 p-0 hover:bg-primary/20"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDeleteExpense(expense.id)}
                            className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};