import { useState } from 'react';
import { useCondoStore } from '@/store/condoStore';
import { calculateBalance, formatCurrency, formatDate, MONTH_NAMES } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function Lancamentos() {
  const { months, selectedMonthId, selectMonth, addMonth, addTransaction, deleteTransaction } = useCondoStore();
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lançamentos</h1>
          <p className="text-muted-foreground text-sm">Gerencie receitas e despesas do condomínio</p>
        </div>
        <div className="flex gap-2">
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
      </div>

      {/* Balance Summary */}
      {currentMonth && balance && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Saldo Inicial</p>
              <p className="text-lg font-bold">{formatCurrency(currentMonth.initialBalance)}</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Receitas</p>
              <p className="text-lg font-bold text-income">{formatCurrency(balance.totalIncome)}</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Despesas</p>
              <p className="text-lg font-bold text-expense">{formatCurrency(balance.totalExpense)}</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Saldo Final</p>
              <p className={`text-lg font-bold ${balance.finalBalance >= 0 ? 'text-income' : 'text-expense'}`}>{formatCurrency(balance.finalBalance)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transactions Table */}
      {currentMonth && (
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Lançamentos - {currentMonth.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentMonth.transactions.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhum lançamento registrado</TableCell></TableRow>
                ) : (
                  currentMonth.transactions.map(tx => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-sm">{formatDate(tx.date)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={tx.type === 'receita' ? 'bg-income-bg text-income border-income/20' : 'bg-expense-bg text-expense border-expense/20'}>
                          {tx.type === 'receita' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                          {tx.type === 'receita' ? 'Receita' : 'Despesa'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-sm">{tx.description}</TableCell>
                      <TableCell className={`text-right font-semibold text-sm ${tx.type === 'receita' ? 'text-income' : 'text-expense'}`}>
                        {formatCurrency(tx.value)}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteTransaction(currentMonth.id, tx.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
