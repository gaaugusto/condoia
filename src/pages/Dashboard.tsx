import { useCondoStore } from '@/store/condoStore';
import { calculateBalance, formatCurrency, MONTH_NAMES } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, Wallet, Building2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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

  const chartData = currentMonth.transactions.reduce((acc, tx) => {
    const existing = acc.find(a => a.description === tx.description);
    if (existing) {
      existing.value += tx.value;
    } else {
      acc.push({ description: tx.description, value: tx.value, type: tx.type });
    }
    return acc;
  }, [] as { description: string; value: number; type: string }[]);

  const pieData = [
    { name: 'Receitas', value: totalIncome, color: 'hsl(152, 60%, 40%)' },
    { name: 'Despesas', value: totalExpense, color: 'hsl(0, 72%, 51%)' },
  ];

  const summaryCards = [
    { title: 'Saldo Final', value: formatCurrency(finalBalance), icon: Wallet, trend: finalBalance >= 0 ? 'up' : 'down', color: 'text-primary' },
    { title: 'Receitas', value: formatCurrency(totalIncome), icon: ArrowUpRight, trend: 'up' as const, color: 'text-income' },
    { title: 'Despesas', value: formatCurrency(totalExpense), icon: ArrowDownRight, trend: 'down' as const, color: 'text-expense' },
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="glass-card lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Lançamentos por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
                <XAxis dataKey="description" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${v}`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.type === 'receita' ? 'hsl(152, 60%, 40%)' : 'hsl(0, 72%, 51%)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Receitas vs Despesas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" strokeWidth={2}>
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2">
              {pieData.map(item => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
