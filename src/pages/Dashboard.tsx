import { useCondoStore } from '@/store/condoStore';
import { calculateBalance, formatCurrency, MONTH_NAMES } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, Wallet, Building2, ArrowUpRight, ArrowDownRight, Landmark } from 'lucide-react';


export default function Dashboard() {
  const { months, selectedMonthId, selectMonth, apartments } = useCondoStore();
  const currentMonth = months.find(m => m.id === selectedMonthId);

  if (!currentMonth) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Nenhum mês cadastrado. Vá em Lançamentos para criar um mês.</p>
      </div>
    );
  }

  const { totalIncome, totalExpense, finalBalance } = calculateBalance(currentMonth);
  const monthApartments = apartments.filter(a => a.monthId === currentMonth.id);
  const paidCount = monthApartments.filter(a => a.status === 'pago' || a.status === 'atrasado').length;
  const pendingCount = monthApartments.filter(a => a.status === 'pendente').length;


  const summaryCards = [
    { title: 'Saldo Anterior', value: formatCurrency(currentMonth.initialBalance), icon: Landmark, trend: currentMonth.initialBalance >= 0 ? 'up' : 'down', color: 'text-muted-foreground' },
    { title: 'Receitas', value: formatCurrency(totalIncome), icon: ArrowUpRight, trend: 'up' as const, color: 'text-income' },
    { title: 'Despesas', value: formatCurrency(totalExpense), icon: ArrowDownRight, trend: 'down' as const, color: 'text-expense' },
    { title: 'Saldo Final', value: formatCurrency(finalBalance), icon: Wallet, trend: finalBalance >= 0 ? 'up' : 'down', color: 'text-primary' },
    { title: 'Apartamentos', value: `${paidCount}/${monthApartments.length} pagos`, icon: Building2, trend: 'up' as const, color: 'text-primary' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Resumo financeiro do condomínio</p>
        </div>
        <Select value={selectedMonthId || ''} onValueChange={selectMonth}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Selecionar mês" />
          </SelectTrigger>
          <SelectContent>
            {months.map(m => (
              <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.title} className="glass-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground font-medium">{card.title}</span>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Transactions */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Últimos Lançamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {currentMonth.transactions.slice(-5).reverse().map(tx => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === 'receita' ? 'bg-income-bg' : 'bg-expense-bg'}`}>
                    {tx.type === 'receita' ? <TrendingUp className="w-4 h-4 text-income" /> : <TrendingDown className="w-4 h-4 text-expense" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">{new Date(tx.date + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${tx.type === 'receita' ? 'text-income' : 'text-expense'}`}>
                  {tx.type === 'receita' ? '+' : '-'} {formatCurrency(tx.value)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
