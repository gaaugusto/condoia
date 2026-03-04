import { useCondoStore } from '@/store/condoStore';
import { calculateBalance, formatCurrency, MONTH_NAMES } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';

export default function Relatorios() {
  const { months, apartments } = useCondoStore();

  const monthlyData = months.map(m => {
    const { totalIncome, totalExpense, finalBalance } = calculateBalance(m);
    const monthApts = apartments.filter(a => a.monthId === m.id);
    const totalCollected = monthApts.reduce((s, a) => s + a.totalPaid, 0);
    const totalInterest = monthApts.reduce((s, a) => s + a.interestAmount, 0);
    return {
      label: m.label,
      receitas: totalIncome,
      despesas: totalExpense,
      saldo: finalBalance,
      arrecadado: totalCollected,
      juros: totalInterest,
      inadimplentes: monthApts.filter(a => a.status === 'pendente').length,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground text-sm">Análise financeira consolidada do condomínio</p>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Receitas vs Despesas por Mês</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Legend />
                <Bar name="Receitas" dataKey="receitas" fill="hsl(152, 60%, 40%)" radius={[4, 4, 0, 0]} />
                <Bar name="Despesas" dataKey="despesas" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Evolução do Saldo</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Line name="Saldo" type="monotone" dataKey="saldo" stroke="hsl(220, 60%, 45%)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Table */}
      <Card className="glass-card">
        <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Resumo Mensal Consolidado</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mês</TableHead>
                <TableHead className="text-right">Receitas</TableHead>
                <TableHead className="text-right">Despesas</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
                <TableHead className="text-right">Arrecadado</TableHead>
                <TableHead className="text-right">Juros</TableHead>
                <TableHead className="text-right">Inadimplentes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyData.map(row => (
                <TableRow key={row.label}>
                  <TableCell className="font-medium">{row.label}</TableCell>
                  <TableCell className="text-right text-income">{formatCurrency(row.receitas)}</TableCell>
                  <TableCell className="text-right text-expense">{formatCurrency(row.despesas)}</TableCell>
                  <TableCell className={`text-right font-semibold ${row.saldo >= 0 ? 'text-income' : 'text-expense'}`}>{formatCurrency(row.saldo)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(row.arrecadado)}</TableCell>
                  <TableCell className="text-right text-expense">{formatCurrency(row.juros)}</TableCell>
                  <TableCell className="text-right">{row.inadimplentes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
