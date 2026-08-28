import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, Zap, Users, ArrowRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { adminApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { resolveBrandName } from '@/lib/theme'

export default function Home() {
  const { user } = useAuth()

  const { data } = useQuery({
    queryKey: ['site-settings'],
    queryFn: () => adminApi.getSettings(),
    staleTime: 1000 * 60 * 10,
  })

  const settings = data?.settings ?? {}
  const title = resolveBrandName(settings.site_title)
  const subtitle = settings.site_subtitle ?? 'Aprenda mais rápido com flashcards interativos.'

  return (
    <div className="page-enter">
      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-24 px-4">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="container max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium text-muted-foreground bg-muted/50 mb-4">
            <Star className="h-3.5 w-3.5 text-primary" />
            Flashcards para aprender de verdade
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight">
            {title}
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            {user ? (
              <Button size="lg" asChild className="gap-2">
                <Link to="/dashboard">
                  Ir para o Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild className="gap-2">
                  <Link to="/register">
                    Começar agora
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/login">Já tenho conta</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 border-t bg-muted/20">
        <div className="container max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Como funciona</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <Card className="border-0 shadow-none bg-background/60 backdrop-blur">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Crie seus decks</h3>
                <p className="text-sm text-muted-foreground">
                  Organize cards por assunto. Pergunta, resposta, explicação e analogia para cada card.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-none bg-background/60 backdrop-blur">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Segura e Responde</h3>
                <p className="text-sm text-muted-foreground">
                  Modo em dupla: uma pessoa segura o celular, a outra responde de cabeça. Marque acertos e erros.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-none bg-background/60 backdrop-blur">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Quiz Solo</h3>
                <p className="text-sm text-muted-foreground">
                  Múltipla escolha com tempo por questão. Quanto mais rápido, mais pontos — estilo Kahoot.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────────── */}
      {!user && (
        <section className="py-20 px-4 text-center">
          <div className="container max-w-xl mx-auto space-y-4">
            <h2 className="text-3xl font-bold">Pronto para estudar?</h2>
            <p className="text-muted-foreground">Crie sua conta gratuita em segundos.</p>
            <Button size="lg" asChild>
              <Link to="/register">Criar conta grátis</Link>
            </Button>
          </div>
        </section>
      )}
    </div>
  )
}
