import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ApiError } from '@/lib/api'
import { Brand } from '@/components/layout/Brand'

export default function Register() {
  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [occupation, setOccupation] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  function handleStep1(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) return toast.error('As senhas não conferem.')
    if (password.length < 8) return toast.error('A senha deve ter pelo menos 8 caracteres.')
    setStep(2)
  }

  async function handleStep2(e: React.FormEvent) {
    e.preventDefault()
    if (!displayName.trim()) return toast.error('Informe seu nome de perfil.')
    setLoading(true)
    try {
      await register(email, password, displayName.trim(), occupation.trim() || undefined)
      toast.success('Conta criada com sucesso!')
      navigate('/dashboard')
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message)
      } else {
        toast.error('Erro inesperado. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  const strength = password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 12 ? 2 : 3
  const strengthLabel = ['', 'Fraca', 'Razoável', 'Forte']
  const strengthColor = ['', 'bg-destructive', 'bg-yellow-500', 'bg-green-500']

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 page-enter">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <Brand center className="justify-center" />
          <h1 className="text-2xl font-bold">Criar conta</h1>
          <p className="text-sm text-muted-foreground">
            Passo {step} de 2 — {step === 1 ? 'Credenciais' : 'Seu perfil'}
          </p>
          {/* Step indicator */}
          <div className="flex gap-1.5 justify-center">
            <div className="h-1 w-8 rounded-full bg-primary" />
            <div className={`h-1 w-8 rounded-full transition-colors ${step === 2 ? 'bg-primary' : 'bg-muted'}`} />
          </div>
        </div>

        {step === 1 ? (
          <Card>
            <form onSubmit={handleStep1}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Acesso</CardTitle>
                <CardDescription>E-mail e senha para entrar na plataforma.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="voce@email.com"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPw ? 'text' : 'password'}
                      placeholder="Mín. 8 caracteres"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPw((v) => !v)}
                      tabIndex={-1}
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {password.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              i <= strength ? strengthColor[strength] : 'bg-muted'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">{strengthLabel[strength]}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirmar senha</Label>
                  <Input
                    id="confirm"
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className={confirm && confirm !== password ? 'border-destructive' : ''}
                  />
                  {confirm && confirm !== password && (
                    <p className="text-xs text-destructive">As senhas não conferem.</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={!email || !password || !confirm || confirm !== password}
                >
                  Próximo <ArrowRight className="h-4 w-4" />
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  Já tem conta?{' '}
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    Entrar
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        ) : (
          <Card>
            <form onSubmit={handleStep2}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Seu perfil</CardTitle>
                <CardDescription>Como você quer ser identificado na plataforma?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Nome de perfil *</Label>
                  <Input
                    id="displayName"
                    placeholder="Ex: João Silva"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occupation">
                    Ocupação / Carreira{' '}
                    <span className="text-muted-foreground text-xs">(opcional)</span>
                  </Label>
                  <Input
                    id="occupation"
                    placeholder="Ex: Estudante de Medicina, Dev, Concurseiro..."
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={loading || !displayName.trim()}>
                  {loading ? 'Criando conta...' : 'Criar conta'}
                </Button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  ← Voltar
                </button>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </div>
  )
}
