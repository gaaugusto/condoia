import { create } from 'zustand';
import { MonthlyRecord, ApartmentPayment, Transaction, calculateInterest } from '@/lib/types';

interface CondoStore {
  months: MonthlyRecord[];
  apartments: ApartmentPayment[];
  selectedMonthId: string | null;
  
  addMonth: (month: number, year: number, initialBalance: number) => void;
  deleteMonth: (id: string) => void;
  selectMonth: (id: string) => void;
  
  addTransaction: (monthId: string, tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (monthId: string, txId: string) => void;
  
  addApartmentPayment: (payment: Omit<ApartmentPayment, 'id' | 'interestAmount' | 'totalPaid' | 'status'>) => void;
  updateApartmentPayment: (id: string, paymentDate: string) => void;
  deleteApartmentPayment: (id: string) => void;
}

const APARTMENTS = ['101', '102', '201', '202', '301', '302', '402'];

const initialMonth: MonthlyRecord = {
  id: 'mar-2026',
  month: 3,
  year: 2026,
  label: 'Março 2026',
  initialBalance: 953.85,
  transactions: [
    { id: '1', date: '2026-03-02', type: 'receita', description: 'CONDOMINIO APS', value: 1600.36 },
    { id: '2', date: '2026-03-02', type: 'despesa', description: 'CEMIG', value: 37.14 },
    { id: '3', date: '2026-03-02', type: 'despesa', description: 'COPASA', value: 833.26 },
    { id: '4', date: '2026-03-02', type: 'despesa', description: 'LIMPEZA', value: 330.00 },
    { id: '5', date: '2026-03-02', type: 'despesa', description: 'LAMPADA', value: 7.90 },
  ],
};

const initialApartments: ApartmentPayment[] = APARTMENTS.map((apt, i) => ({
  id: `apt-${apt}`,
  apartmentNumber: apt,
  dueDate: '2026-03-10',
  paymentDate: i < 3 ? '2026-03-05' : null,
  amount: 228.62,
  interestRate: 2,
  interestAmount: 0,
  totalPaid: i < 3 ? 228.62 : 0,
  status: (i < 3 ? 'pago' : 'pendente') as 'pago' | 'pendente' | 'atrasado',
  monthId: 'mar-2026',
}));

export const useCondoStore = create<CondoStore>((set) => ({
  months: [initialMonth],
  apartments: initialApartments,
  selectedMonthId: 'mar-2026',

  addMonth: (month, year, initialBalance) => {
    const id = `${month}-${year}`;
    const MONTH_NAMES = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    set((state) => ({
      months: [...state.months, {
        id,
        month,
        year,
        label: `${MONTH_NAMES[month]} ${year}`,
        initialBalance,
        transactions: [],
      }],
      selectedMonthId: id,
    }));
  },

  deleteMonth: (id) => set((state) => ({
    months: state.months.filter(m => m.id !== id),
    selectedMonthId: state.selectedMonthId === id ? (state.months[0]?.id || null) : state.selectedMonthId,
  })),

  selectMonth: (id) => set({ selectedMonthId: id }),

  addTransaction: (monthId, tx) => set((state) => ({
    months: state.months.map(m => m.id === monthId ? {
      ...m,
      transactions: [...m.transactions, { ...tx, id: crypto.randomUUID() }],
    } : m),
  })),

  deleteTransaction: (monthId, txId) => set((state) => ({
    months: state.months.map(m => m.id === monthId ? {
      ...m,
      transactions: m.transactions.filter(t => t.id !== txId),
    } : m),
  })),

  addApartmentPayment: (payment) => set((state) => ({
    apartments: [...state.apartments, {
      ...payment,
      id: crypto.randomUUID(),
      interestAmount: 0,
      totalPaid: 0,
      status: 'pendente' as const,
    }],
  })),

  updateApartmentPayment: (id, paymentDate) => set((state) => ({
    apartments: state.apartments.map(apt => {
      if (apt.id !== id) return apt;
      const { interestAmount, totalPaid } = calculateInterest(apt.amount, apt.dueDate, paymentDate, apt.interestRate);
      const isLate = new Date(paymentDate) > new Date(apt.dueDate);
      return { ...apt, paymentDate, interestAmount, totalPaid, status: isLate ? 'atrasado' as const : 'pago' as const };
    }),
  })),

  deleteApartmentPayment: (id) => set((state) => ({
    apartments: state.apartments.filter(a => a.id !== id),
  })),
}));
