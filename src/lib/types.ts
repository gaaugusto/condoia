export interface Transaction {
  id: string;
  date: string;
  type: 'receita' | 'despesa';
  description: string;
  value: number;
  category?: string;
}

export interface MonthlyRecord {
  id: string;
  month: number;
  year: number;
  label: string;
  initialBalance: number;
  transactions: Transaction[];
}

export interface ApartmentPayment {
  id: string;
  apartmentNumber: string;
  dueDate: string;
  paymentDate: string | null;
  amount: number;
  interestRate: number;
  interestAmount: number;
  totalPaid: number;
  status: 'pago' | 'pendente' | 'atrasado';
  monthId: string;
}

export function calculateBalance(record: MonthlyRecord) {
  const totalIncome = record.transactions
    .filter(t => t.type === 'receita')
    .reduce((sum, t) => sum + t.value, 0);
  const totalExpense = record.transactions
    .filter(t => t.type === 'despesa')
    .reduce((sum, t) => sum + t.value, 0);
  return {
    totalIncome,
    totalExpense,
    finalBalance: record.initialBalance + totalIncome - totalExpense,
  };
}

export function calculateInterest(amount: number, dueDate: string, paymentDate: string, monthlyRate: number): { interestAmount: number; totalPaid: number } {
  const due = new Date(dueDate);
  const paid = new Date(paymentDate);
  const diffTime = paid.getTime() - due.getTime();
  const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  
  if (diffDays <= 0) return { interestAmount: 0, totalPaid: amount };
  
  const dailyRate = monthlyRate / 30;
  const interestAmount = amount * (dailyRate / 100) * diffDays;
  return { interestAmount: Math.round(interestAmount * 100) / 100, totalPaid: Math.round((amount + interestAmount) * 100) / 100 };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return new Intl.DateTimeFormat('pt-BR').format(date);
}

export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];
