import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, LogIn } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);
    setLoading(false);

    if (error) {
      toast.error(error);
    } else if (isSignUp) {
      toast.success('Conta criada! Verifique seu email para confirmar.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm glass-card">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl">CondoFinança</CardTitle>
          <p className="text-sm text-muted-foreground">
            {isSignUp ? 'Criar conta de Síndico' : 'Área do Síndico'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="sindico@email.com" />
            </div>
            <div>
              <Label>Senha</Label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="••••••" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              <LogIn className="w-4 h-4 mr-2" />
              {loading ? 'Aguarde...' : isSignUp ? 'Criar Conta' : 'Entrar'}
            </Button>
          </form>
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full text-center text-sm text-muted-foreground mt-4 hover:text-foreground transition-colors"
          >
            {isSignUp ? 'Já tem conta? Faça login' : 'Primeiro acesso? Crie sua conta'}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
