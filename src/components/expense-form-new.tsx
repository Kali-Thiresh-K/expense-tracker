import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, FileText, Tag, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { suggestCategory, defaultCategories } from '@/lib/expense-utils';
import { CreateExpenseData, UpdateExpenseData } from '@/types/database';

interface ExpenseFormProps {
  expense?: any;
  onAddExpense: (expense: CreateExpenseData | UpdateExpenseData) => void;
  onClose?: () => void;
}

export const ExpenseForm = ({ expense, onAddExpense, onClose }: ExpenseFormProps) => {
  const [title, setTitle] = useState(expense?.title || '');
  const [amount, setAmount] = useState(expense?.amount?.toString() || '');
  const [category, setCategory] = useState(expense?.category || '');
  const [description, setDescription] = useState(expense?.description || '');
  const [date, setDate] = useState(
    expense?.date 
      ? new Date(expense.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [suggestedCategory, setSuggestedCategory] = useState('');

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (value.length > 2 && !expense) {
      const suggested = suggestCategory(value);
      if (suggested !== 'Other') {
        setSuggestedCategory(suggested);
      }
    } else {
      setSuggestedCategory('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !amount || !category) {
      return;
    }

    const expenseData = {
      title: title.trim(),
      amount: parseFloat(amount),
      category,
      description: description.trim() || undefined,
      date,
    };

    onAddExpense(expenseData);
  };

  const isEditing = !!expense;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full backdrop-blur-sm bg-card/95 border-border/50 shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">
            {isEditing ? 'Edit Expense' : 'Add New Expense'}
          </CardTitle>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="hover:bg-green-100 hover:text-green-600"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="title"
                  type="text"
                  placeholder="Enter expense title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              {suggestedCategory && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-sm text-accent"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Suggested category: {suggestedCategory}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCategory(suggestedCategory)}
                    className="h-6 px-2 text-xs"
                  >
                    Use
                  </Button>
                </motion.div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <div className="relative">
                  {/* Replaced DollarSign with ₹ symbol */}
                  <span className="absolute left-3 top-3 text-muted-foreground font-semibold">₹</span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-8"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Select a category" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {defaultCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      <div className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Add a note about this expense"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Only Submit button remains */}
            <div className="pt-4">
              <Button type="submit" className="w-full">
                {isEditing ? 'Update Expense' : 'Add Expense'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};