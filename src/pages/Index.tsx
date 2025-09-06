import { ExpenseTracker } from "@/components/expense-tracker";
import { ProtectedRoute } from "@/components/protected-route";

const Index = () => {
  return (
    <ProtectedRoute>
      <ExpenseTracker />
    </ProtectedRoute>
  );
};

export default Index;
