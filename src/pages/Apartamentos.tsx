import { useState } from 'react';
import { useCondoStore } from '@/store/condoStore';
import { formatCurrency, formatDate } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function Apartamentos() {
  const { months, selectedMonthId, selectMonth, apartments, addApartmentPayment, updateApartmentPayment } = useCondoStore();
  const [showAdd, setShowAdd] = useState(false);
  const [showPay, setShowPay] = useState<string | null>(null);
  const [payDate, setPayDate] = useState('');
  const [newApt, setNewApt] = useState({ apartmentNumber: '', dueDate: '', amount: 0, interestRate: 2 });

  const currentMonth = months.find(m => m.id === selectedMonthId);
  const monthApartments = apartments.filter(a => a.monthId === selectedMonthId);

  const handleAdd = () => {
    if (!newApt.apartmentNumber || !newApt.dueDate || newApt.amount <= 0 || !selectedMonthId) {
      toast.error('Preencha todos os campos!');
      return;
    }
    addApartmentPayment({ ...newApt, paymentDate: null, monthId: selectedMonthId });
    setShowAdd(false);
    setNewApt({ apartmentNumber: '', dueDate: '', amount: 0, interestRate: 2 });
    toast.success('Apartamento adicionado!');
  };

  const handlePay = () => {
    if (!showPay || !payDate) return;
    updateApartmentPayment(showPay, payDate);
    setShowPay(null);
    setPayDate('');
    toast.success('Pagamento registrado!');
  };

  const statusConfig = {
    pago: { label: 'Pago', icon: CheckCircle, className: 'bg-income-bg text-income border-income/20' },
    pendente: { label: 'Pendente', icon: Clock, className: 'bg-muted text-muted-foreground border-border' },
    atrasado: { label: 'Atrasado', icon: AlertTriangle, className: 'bg-expense-bg text-expense border-expense/20' },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Apartamentos</h1>
          <p className="text-muted-foreground text-sm">Controle de pagamento de condomínio por apartamento</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedMonthId || ''} onValueChange={selectMonth}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Selecionar mês" /></SelectTrigger>
            <SelectContent>
              {months.map(m => (<SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>))}
            </SelectContent>
          </Select>

          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" /> Apartamento</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Adicionar Apartamento</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Nº Apartamento</Label><Input value={newApt.apartmentNumber} onChange={e => setNewApt(p => ({ ...p, apartmentNumber: e.target.value }))} placeholder="Ex: 101" /></div>
                <div><Label>Data Vencimento</Label><Input type="date" value={newApt.dueDate} onChange={e => setNewApt(p => ({ ...p, dueDate: e.target.value }))} /></div>
                <div><Label>Valor (R$)</Label><Input type="number" step="0.01" value={newApt.amount || ''} onChange={e => setNewApt(p => ({ ...p, amount: Number(e.target.value) }))} /></div>
                <div><Label>Juros Mensal (%)</Label><Input type="number" step="0.1" value={newApt.interestRate} onChange={e => setNewApt(p => ({ ...p, interestRate: Number(e.target.value) }))} /></div>
                <Button onClick={handleAdd} className="w-full">Adicionar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Apartamentos</p>
            <p className="text-2xl font-bold">{monthApartments.length}</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Pagos</p>
            <p className="text-2xl font-bold text-income">{monthApartments.filter(a => a.status !== 'pendente').length}</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Pendentes</p>
            <p className="text-2xl font-bold text-expense">{monthApartments.filter(a => a.status === 'pendente').length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Pagamentos - {currentMonth?.label || 'Selecione um mês'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Apto</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Juros</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthApartments.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhum apartamento cadastrado</TableCell></TableRow>
              ) : (
                monthApartments.map(apt => {
                  const config = statusConfig[apt.status];
                  return (
                    <TableRow key={apt.id}>
                      <TableCell className="font-semibold">{apt.apartmentNumber}</TableCell>
                      <TableCell className="text-sm">{formatDate(apt.dueDate)}</TableCell>
                      <TableCell className="text-sm">{apt.paymentDate ? formatDate(apt.paymentDate) : '—'}</TableCell>
                      <TableCell className="text-sm text-expense">{apt.interestAmount > 0 ? formatCurrency(apt.interestAmount) : '—'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={config.className}>
                          <config.icon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {apt.status === 'pendente' && (
                          <Button size="sm" variant="outline" onClick={() => { setShowPay(apt.id); setPayDate(''); }}>
                            Pagar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pay Dialog */}
      <Dialog open={!!showPay} onOpenChange={() => setShowPay(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Registrar Pagamento</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Data do Pagamento</Label><Input type="date" value={payDate} onChange={e => setPayDate(e.target.value)} /></div>
            <p className="text-sm text-muted-foreground">Se a data for posterior ao vencimento, juros serão aplicados automaticamente.</p>
            <Button onClick={handlePay} className="w-full">Confirmar Pagamento</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
