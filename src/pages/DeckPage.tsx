import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Play,
  Users,
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
  ArrowLeft,
  Image as ImageIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { decksApi, cardsApi, type Card } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card as UICard, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { pluralize } from '@/lib/utils'

const DIFFICULTY_LABEL = { easy: '🟢 Fácil', medium: '🟡 Médio', hard: '🔴 Difícil' }

interface CardFormData {
  question: string
  answer: string
  explanation: string
  analogy: string
  difficulty: 'easy' | 'medium' | 'hard'
}

function CardFormDialog({
  open,
  onOpenChange,
  deckId,
  card,
  onSaved,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  deckId: string
  card?: Card
  onSaved: () => void
}) {
  const { token } = useAuth()
  const [form, setForm] = useState<CardFormData>({
    question: card?.question ?? '',
    answer: card?.answer ?? '',
    explanation: card?.explanation ?? '',
    analogy: card?.analogy ?? '',
    difficulty: card?.difficulty ?? 'medium',
  })

  const mutation = useMutation({
    mutationFn: () =>
      card
        ? cardsApi.update(token!, card.id, { ...form, explanation: form.explanation || undefined, analogy: form.analogy || undefined })
        : cardsApi.create(token!, { deckId, ...form, explanation: form.explanation || undefined, analogy: form.analogy || undefined }),
    onSuccess: () => {
      toast.success(card ? 'Card atualizado!' : 'Card criado!')
      onOpenChange(false)
      onSaved()
    },
    onError: () => toast.error('Erro ao salvar card.'),
  })

  function set(key: keyof CardFormData, val: string) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{card ? 'Editar card' : 'Novo card'}</DialogTitle>
          <DialogDescription>
            Preencha pergunta e resposta. Explicação e analogia são opcionais.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            mutation.mutate()
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label>Pergunta *</Label>
            <Textarea
              placeholder="O que é...?"
              required
              value={form.question}
              onChange={(e) => set('question', e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          <div className="space-y-2">
            <Label>Resposta *</Label>
            <Textarea
              placeholder="A resposta correta..."
              required
              value={form.answer}
              onChange={(e) => set('answer', e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          <div className="space-y-2">
            <Label>Explicação <span className="text-muted-foreground text-xs">(opcional)</span></Label>
            <Textarea
              placeholder="Explique em mais detalhes..."
              value={form.explanation}
              onChange={(e) => set('explanation', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Analogia <span className="text-muted-foreground text-xs">(opcional)</span></Label>
            <Input
              placeholder="Uma analogia do mundo real..."
              value={form.analogy}
              onChange={(e) => set('analogy', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Dificuldade</Label>
            <Select
              value={form.difficulty}
              onValueChange={(v) => set('difficulty', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">🟢 Fácil</SelectItem>
                <SelectItem value="medium">🟡 Médio</SelectItem>
                <SelectItem value="hard">🔴 Difícil</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Salvando...' : 'Salvar card'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function FlashCard({ card, onEdit, onDelete }: { card: Card; onEdit: () => void; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <UICard className="group">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium leading-snug flex-1">{card.question}</p>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="secondary" className="text-xs">
            {DIFFICULTY_LABEL[card.difficulty]}
          </Badge>
          {card.imageUrl && <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <button
          className="w-full text-left"
          onClick={() => setExpanded((v) => !v)}
        >
          <div className="flex items-center gap-2 text-sm text-primary hover:text-primary/80">
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4" /> Ocultar resposta
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" /> Ver resposta
              </>
            )}
          </div>
        </button>

        {expanded && (
          <div className="mt-3 space-y-3 animate-fade-in">
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm font-medium text-foreground">{card.answer}</p>
            </div>
            {card.explanation && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Explicação
                </p>
                <p className="text-sm text-muted-foreground">{card.explanation}</p>
              </div>
            )}
            {card.analogy && (
              <div className="p-2.5 rounded-lg bg-muted border-l-2 border-primary/40">
                <p className="text-xs font-medium text-primary mb-0.5">Analogia</p>
                <p className="text-sm text-muted-foreground italic">{card.analogy}</p>
              </div>
            )}
            {card.imageUrl && (
              <img
                src={card.imageUrl}
                alt="Card image"
                className="rounded-lg max-h-48 object-contain"
              />
            )}
          </div>
        )}
      </CardContent>
    </UICard>
  )
}

export default function DeckPage() {
  const { id } = useParams<{ id: string }>()
  const { token } = useAuth()
  const qc = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)
  const [editCard, setEditCard] = useState<Card | undefined>()

  const { data, isLoading } = useQuery({
    queryKey: ['deck', id],
    queryFn: () => decksApi.get(token!, id!),
    enabled: !!token && !!id,
  })

  const deleteMutation = useMutation({
    mutationFn: (cardId: string) => cardsApi.delete(token!, cardId),
    onSuccess: () => {
      toast.success('Card excluído.')
      qc.invalidateQueries({ queryKey: ['deck', id] })
    },
    onError: () => toast.error('Erro ao excluir card.'),
  })

  function handleDelete(cardId: string) {
    if (confirm('Excluir este card?')) deleteMutation.mutate(cardId)
  }

  function handleEdit(card: Card) {
    setEditCard(card)
    setFormOpen(true)
  }

  function handleFormClose(v: boolean) {
    setFormOpen(v)
    if (!v) setEditCard(undefined)
  }

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  const deck = data?.deck
  const cards = data?.cards ?? []

  if (!deck) return <div className="container py-8">Deck não encontrado.</div>

  return (
    <div className="container py-8 page-enter">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{deck.name}</h1>
            {deck.description && (
              <p className="text-muted-foreground mt-1">{deck.description}</p>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              {pluralize(cards.length, 'card', 'cards')}
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            {cards.length >= 2 && (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/decks/${id}/play/hold`}>
                    <Users className="h-4 w-4" />
                    Segura e Responde
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to={`/decks/${id}/play/quiz`}>
                    <Play className="h-4 w-4" />
                    Quiz Solo
                  </Link>
                </Button>
              </>
            )}
            <Button
              size="sm"
              onClick={() => {
                setEditCard(undefined)
                setFormOpen(true)
              }}
            >
              <Plus className="h-4 w-4" />
              Novo card
            </Button>
          </div>
        </div>
      </div>

      {/* Cards grid */}
      {cards.length === 0 ? (
        <div className="text-center py-24 space-y-4">
          <h2 className="text-xl font-semibold">Nenhum card ainda</h2>
          <p className="text-muted-foreground">Adicione o primeiro card a este deck.</p>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" />
            Adicionar card
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <FlashCard
              key={card.id}
              card={card}
              onEdit={() => handleEdit(card)}
              onDelete={() => handleDelete(card.id)}
            />
          ))}
        </div>
      )}

      {/* Card form dialog */}
      <CardFormDialog
        open={formOpen}
        onOpenChange={handleFormClose}
        deckId={id!}
        card={editCard}
        onSaved={() => qc.invalidateQueries({ queryKey: ['deck', id] })}
      />
    </div>
  )
}
