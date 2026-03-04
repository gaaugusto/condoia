import { useState } from 'react';
import { useCondoStore } from '@/store/condoStore';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency, formatDate } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function Apartamentos() {
  const { months, selectedMonthId, selectMonth, apartments, addApartmentPayment, updateApartmentPayment } = useCondoStore();
  const { isSindico } = useAuth();
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
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Apartamentos</h1>
          <p className="text-muted-foreground text-sm">Controle de pagamento por apartamento</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={selectedMonthId || ''} onValueChange={selectMonth}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Selecionar mês" /></SelectTrigger>
            <SelectContent>
              {months.map(m => (<SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>))}
            </SelectContent>
          </Select>

          {isSindico && (
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
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <Card className="glass-card">
          <CardContent className="p-3 sm:p-4">
            <p className="text-xs text-muted-foreground mb-1">Total</p>
            <p className="text-xl sm:text-2xl font-bold">{monthApartments.length}</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-3 sm:p-4">
            <p className="text-xs text-muted-foreground mb-1">Pagos</p>
            <p className="text-xl sm:text-2xl font-bold text-income">{monthApartments.filter(a => a.status !== 'pendente').length}</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-3 sm:p-4">
            <p className="text-xs text-muted-foreground mb-1">Pendentes</p>
            <p className="text-xl sm:text-2xl font-bold text-expense">{monthApartments.filter(a => a.status === 'pendente').length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Apartments List */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Pagamentos - {currentMonth?.label || 'Selecione um mês'}</CardTitle>
        </CardHeader>
        <CardContent>
          {monthApartments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum apartamento cadastrado</p>
          ) : (
            <>
              {/* Mobile view */}
              <div className="sm:hidden space-y-3">
                {monthApartments.map(apt => {
                  const config = statusConfig[apt.status];
                  return (
                    <div key={apt.id} className="p-3 border border-border/50 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-base">Apto {apt.apartmentNumber}</span>
                        <Badge variant="outline" className={config.className}>
                          <config.icon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-sm">
                        <span className="text-muted-foreground">Vencimento:</span>
                        <span>{formatDate(apt.dueDate)}</span>
                        <span className="text-muted-foreground">Pagamento:</span>
                        <span>{apt.paymentDate ? formatDate(apt.paymentDate) : '—'}</span>
                        {apt.interestAmount > 0 && (
                          <>
                            <span className="text-muted-foreground">Juros:</span>
                            <span className="text-expense">{formatCurrency(apt.interestAmount)}</span>
                          </>
                        )}
                      </div>
                      {isSindico && apt.status === 'pendente' && (
                        <Button size="sm" variant="outline" className="w-full" onClick={() => { setShowPay(apt.id); setPayDate(''); }}>
                          Registrar Pagamento
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Desktop view */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left text-sm font-medium text-muted-foreground py-2">Apto</th>
                      <th className="text-left text-sm font-medium text-muted-foreground py-2">Vencimento</th>
                      <th className="text-left text-sm font-medium text-muted-foreground py-2">Pagamento</th>
                      <th className="text-left text-sm font-medium text-muted-foreground py-2">Juros</th>
                      <th className="text-left text-sm font-medium text-muted-foreground py-2">Status</th>
                      {isSindico && <th className="w-24"></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {monthApartments.map(apt => {
                      const config = statusConfig[apt.status];
                      return (
                        <tr key={apt.id} className="border-b border-border/50">
                          <td className="font-semibold py-2.5">{apt.apartmentNumber}</td>
                          <td className="text-sm py-2.5">{formatDate(apt.dueDate)}</td>
                          <td className="text-sm py-2.5">{apt.paymentDate ? formatDate(apt.paymentDate) : '—'}</td>
                          <td className="text-sm text-expense py-2.5">{apt.interestAmount > 0 ? formatCurrency(apt.interestAmount) : '—'}</td>
                          <td className="py-2.5">
                            <Badge variant="outline" className={config.className}>
                              <config.icon className="w-3 h-3 mr-1" />
                              {config.label}
                            </Badge>
                          </td>
                          {isSindico && (
                            <td className="py-2.5">
                              {apt.status === 'pendente' && (
                                <Button size="sm" variant="outline" onClick={() => { setShowPay(apt.id); setPayDate(''); }}>
                                  Pagar
                                </Button>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
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
