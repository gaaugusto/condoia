import { useState } from 'react';
import { useCondoStore } from '@/store/condoStore';
import { useAuth } from '@/hooks/useAuth';
import { calculateBalance, formatCurrency, formatDate, MONTH_NAMES } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function Lancamentos() {
  const { months, selectedMonthId, selectMonth, addMonth, addTransaction, deleteTransaction } = useCondoStore();
  const { isSindico } = useAuth();
  const [showNewMonth, setShowNewMonth] = useState(false);
  const [showNewTx, setShowNewTx] = useState(false);
  const [newMonth, setNewMonth] = useState({ month: 1, year: 2026, balance: 0 });
  const [newTx, setNewTx] = useState({ date: '', type: 'despesa' as 'receita' | 'despesa', description: '', value: 0 });

  const currentMonth = months.find(m => m.id === selectedMonthId);
  const balance = currentMonth ? calculateBalance(currentMonth) : null;

  const handleAddMonth = () => {
    if (months.find(m => m.month === newMonth.month && m.year === newMonth.year)) {
      toast.error('Este mês já existe!');
      return;
    }
    addMonth(newMonth.month, newMonth.year, newMonth.balance);
    setShowNewMonth(false);
    toast.success('Mês criado com sucesso!');
  };

  const handleAddTx = () => {
    if (!newTx.date || !newTx.description || newTx.value <= 0 || !selectedMonthId) {
      toast.error('Preencha todos os campos!');
      return;
    }
    addTransaction(selectedMonthId, newTx);
    setShowNewTx(false);
    setNewTx({ date: '', type: 'despesa', description: '', value: 0 });
    toast.success('Lançamento adicionado!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Lançamentos</h1>
          <p className="text-muted-foreground text-sm">Gerencie receitas e despesas do condomínio</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={selectedMonthId || ''} onValueChange={selectMonth}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Selecionar mês" />
            </SelectTrigger>
            <SelectContent>
              {months.map(m => (
                <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isSindico && (
            <div className="flex gap-2">
              <Dialog open={showNewMonth} onOpenChange={setShowNewMonth}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon"><Calendar className="w-4 h-4" /></Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Novo Mês</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Mês</Label>
                        <Select value={String(newMonth.month)} onValueChange={(v) => setNewMonth(p => ({ ...p, month: Number(v) }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {MONTH_NAMES.map((name, i) => (
                              <SelectItem key={i} value={String(i + 1)}>{name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Ano</Label>
                        <Input type="number" value={newMonth.year} onChange={e => setNewMonth(p => ({ ...p, year: Number(e.target.value) }))} />
                      </div>
                    </div>
                    <div>
                      <Label>Saldo Inicial (R$)</Label>
                      <Input type="number" step="0.01" value={newMonth.balance} onChange={e => setNewMonth(p => ({ ...p, balance: Number(e.target.value) }))} />
                    </div>
                    <Button onClick={handleAddMonth} className="w-full">Criar Mês</Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showNewTx} onOpenChange={setShowNewTx}>
                <DialogTrigger asChild>
                  <Button><Plus className="w-4 h-4 mr-2" /> Lançamento</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Novo Lançamento</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Tipo</Label>
                      <Select value={newTx.type} onValueChange={(v: 'receita' | 'despesa') => setNewTx(p => ({ ...p, type: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="receita">Receita</SelectItem>
                          <SelectItem value="despesa">Despesa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Data</Label>
                      <Input type="date" value={newTx.date} onChange={e => setNewTx(p => ({ ...p, date: e.target.value }))} />
                    </div>
                    <div>
                      <Label>Descrição</Label>
                      <Input value={newTx.description} onChange={e => setNewTx(p => ({ ...p, description: e.target.value }))} placeholder="Ex: CEMIG" />
                    </div>
                    <div>
                      <Label>Valor (R$)</Label>
                      <Input type="number" step="0.01" value={newTx.value || ''} onChange={e => setNewTx(p => ({ ...p, value: Number(e.target.value) }))} />
                    </div>
                    <Button onClick={handleAddTx} className="w-full">Adicionar</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </div>

      {/* Balance Summary */}
      {currentMonth && balance && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <Card className="glass-card">
            <CardContent className="p-3 sm:p-4">
              <p className="text-xs text-muted-foreground mb-1">Saldo Inicial</p>
              <p className="text-base sm:text-lg font-bold">{formatCurrency(currentMonth.initialBalance)}</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-3 sm:p-4">
              <p className="text-xs text-muted-foreground mb-1">Receitas</p>
              <p className="text-base sm:text-lg font-bold text-income">{formatCurrency(balance.totalIncome)}</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-3 sm:p-4">
              <p className="text-xs text-muted-foreground mb-1">Despesas</p>
              <p className="text-base sm:text-lg font-bold text-expense">{formatCurrency(balance.totalExpense)}</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-3 sm:p-4">
              <p className="text-xs text-muted-foreground mb-1">Saldo Final</p>
              <p className={`text-base sm:text-lg font-bold ${balance.finalBalance >= 0 ? 'text-income' : 'text-expense'}`}>{formatCurrency(balance.finalBalance)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transactions - Mobile Cards / Desktop Table */}
      {currentMonth && (
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Lançamentos - {currentMonth.label}</CardTitle>
          </CardHeader>
          <CardContent>
            {currentMonth.transactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum lançamento registrado</p>
            ) : (
              <>
                {/* Mobile view */}
                <div className="sm:hidden space-y-3">
                  {currentMonth.transactions.map(tx => (
                    <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0 gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${tx.type === 'receita' ? 'bg-income-bg' : 'bg-expense-bg'}`}>
                          {tx.type === 'receita' ? <TrendingUp className="w-3.5 h-3.5 text-income" /> : <TrendingDown className="w-3.5 h-3.5 text-expense" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{tx.description}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(tx.date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className={`text-sm font-semibold ${tx.type === 'receita' ? 'text-income' : 'text-expense'}`}>
                          {tx.type === 'receita' ? '+' : '-'}{formatCurrency(tx.value)}
                        </span>
                        {isSindico && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => deleteTransaction(currentMonth.id, tx.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop view */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left text-sm font-medium text-muted-foreground py-2">Data</th>
                        <th className="text-left text-sm font-medium text-muted-foreground py-2">Tipo</th>
                        <th className="text-left text-sm font-medium text-muted-foreground py-2">Descrição</th>
                        <th className="text-right text-sm font-medium text-muted-foreground py-2">Valor</th>
                        {isSindico && <th className="w-12"></th>}
                      </tr>
                    </thead>
                    <tbody>
                      {currentMonth.transactions.map(tx => (
                        <tr key={tx.id} className="border-b border-border/50">
                          <td className="text-sm py-2.5">{formatDate(tx.date)}</td>
                          <td className="py-2.5">
                            <Badge variant="outline" className={tx.type === 'receita' ? 'bg-income-bg text-income border-income/20' : 'bg-expense-bg text-expense border-expense/20'}>
                              {tx.type === 'receita' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                              {tx.type === 'receita' ? 'Receita' : 'Despesa'}
                            </Badge>
                          </td>
                          <td className="font-medium text-sm py-2.5">{tx.description}</td>
                          <td className={`text-right font-semibold text-sm py-2.5 ${tx.type === 'receita' ? 'text-income' : 'text-expense'}`}>
                            {formatCurrency(tx.value)}
                          </td>
                          {isSindico && (
                            <td className="py-2.5">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteTransaction(currentMonth.id, tx.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
