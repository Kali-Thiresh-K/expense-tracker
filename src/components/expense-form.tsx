import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { defaultCategories, suggestCategory } from '@/lib/expense-utils';
import { Expense } from '@/types/expense';

interface ExpenseFormProps {
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onClose?: () => void;
}

export const ExpenseForm = ({ onAddExpense, onClose }: ExpenseFormProps) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [suggestedCategory, setSuggestedCategory] = useState('');

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (value.length > 2) {
      const suggested = suggestCategory(value);
      setSuggestedCategory(suggested);
    } else {
      setSuggestedCategory('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    const expense: Omit<Expense, 'id'> = {
      title,
      amount: parseFloat(amount),
      category: category || suggestedCategory || 'Other',
      date: new Date(date),
      description: description || undefined,
      currency: '₹'
    };

    onAddExpense(expense);
    
    // Reset form
    setTitle('');
    setAmount('');
    setCategory('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setSuggestedCategory('');
    
    if (onClose) onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 gradient-text">
            <Plus className="h-5 w-5" />
            Add New Expense
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Expense Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g., Domino's Pizza"
                className="bg-muted/50 border-muted"
              />
              {suggestedCategory && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-sm text-success"
                >
                  <Sparkles className="h-4 w-4" />
                  AI suggests: {suggestedCategory}
                </motion.div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="bg-muted/50 border-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-muted/50 border-muted"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-muted/50 border-muted">
                  <SelectValue placeholder={suggestedCategory || "Select category"} />
                </SelectTrigger>
                <SelectContent>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Additional notes..."
                className="bg-muted/50 border-muted resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                className="flex-1 bg-gradient-primary hover:opacity-90 transition-opacity"
                disabled={!title || !amount}
              >
                Add Expense
              </Button>
              {onClose && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  className="border-muted"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};