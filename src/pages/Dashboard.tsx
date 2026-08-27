import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, BookOpen, Play, Edit2, Trash2, Globe, Lock, MoreVertical, Tag } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { decksApi, type DeckWithCount } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { pluralize } from '@/lib/utils'

const DECK_PINS = [
  { emoji: '🟢', label: 'Tranquilo' },
  { emoji: '🟡', label: 'Revisão' },
  { emoji: '🔴', label: 'Urgente' },
  { emoji: '⭐', label: 'Favorito' },
  { emoji: '🧠', label: 'Difícil' },
  { emoji: '🔥', label: 'Foco' },
  { emoji: '📌', label: 'Fixado' },
  { emoji: '✅', label: 'Concluído' },
  { emoji: '😤', label: 'Preciso estudar' },
  { emoji: '😌', label: 'Dominei' },
] as const

function CreateDeckDialog({ onCreated }: { onCreated: () => void }) {
  const { token } = useAuth()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(false)

  const mutation = useMutation({
    mutationFn: () => decksApi.create(token!, { name, description, isPublic }),
    onSuccess: () => {
      toast.success('Deck criado!')
      setOpen(false)
      setName('')
      setDescription('')
      onCreated()
    },
    onError: () => toast.error('Erro ao criar deck.'),
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Novo Deck
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar novo deck</DialogTitle>
          <DialogDescription>Organize seus cards por tema ou assunto.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            mutation.mutate()
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="deck-name">Nome *</Label>
            <Input
              id="deck-name"
              placeholder="Ex: SOLID, Design Patterns..."
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deck-desc">Descrição</Label>
            <Textarea
              id="deck-desc"
              placeholder="Breve descrição do deck..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="deck-public"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="deck-public" className="cursor-pointer">
              Deck público (visível para todos)
            </Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending || !name.trim()}>
              {mutation.isPending ? 'Criando...' : 'Criar deck'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DeckCard({ deck, onDelete }: { deck: DeckWithCount; onDelete: (id: string) => void }) {
  const { token } = useAuth()
  const qc = useQueryClient()
  const [menuOpen, setMenuOpen] = useState(false)
  const [pinOpen, setPinOpen] = useState(false)
  const [customEmoji, setCustomEmoji] = useState('')
  const [customLabel, setCustomLabel] = useState('')

  const pinMutation = useMutation({
    mutationFn: (args: { pinEmoji: string | null; pinLabel: string | null }) =>
      decksApi.update(token!, deck.id, args),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['decks'] })
      setPinOpen(false)
    },
    onError: () => toast.error('Erro ao salvar pin.'),
  })

  function applyPreset(emoji: string, label: string) {
    pinMutation.mutate({ pinEmoji: emoji, pinLabel: label })
  }

  function applyCustom() {
    const emoji = customEmoji.trim()
    const label = customLabel.trim()
    if (!emoji) return toast.error('Informe um emoji.')
    pinMutation.mutate({ pinEmoji: emoji, pinLabel: label || emoji })
    setCustomEmoji('')
    setCustomLabel('')
  }

  function clearPin() {
    pinMutation.mutate({ pinEmoji: null, pinLabel: null })
  }

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <BookOpen className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <CardTitle className="text-base truncate">{deck.name}</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            {/* Pin button */}
            <div className="relative">
              <button
                title="Definir pin"
                className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-muted transition-opacity"
                onClick={() => setPinOpen((v) => !v)}
              >
                <Tag className="h-4 w-4 text-muted-foreground" />
              </button>
              {pinOpen && (
                <div className="absolute right-0 top-7 z-20 w-64 rounded-xl border bg-popover shadow-xl p-3 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Escolher pin</p>
                  <div className="grid grid-cols-5 gap-1.5">
                    {DECK_PINS.map((p) => (
                      <button
                        key={p.emoji}
                        title={p.label}
                        onClick={() => applyPreset(p.emoji, p.label)}
                        className={`text-xl rounded-lg p-1.5 hover:bg-muted transition-colors ${deck.pinEmoji === p.emoji ? 'bg-primary/15 ring-1 ring-primary' : ''}`}
                      >
                        {p.emoji}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex gap-1">
                      <Input
                        placeholder="Emoji"
                        value={customEmoji}
                        onChange={(e) => setCustomEmoji(e.target.value)}
                        className="w-16 text-center px-1"
                        maxLength={4}
                      />
                      <Input
                        placeholder="Nome do pin"
                        value={customLabel}
                        onChange={(e) => setCustomLabel(e.target.value)}
                        className="flex-1"
                        maxLength={30}
                      />
                    </div>
                    <Button size="sm" className="w-full" variant="secondary" onClick={applyCustom}>
                      Aplicar personalizado
                    </Button>
                  </div>
                  {deck.pinEmoji && (
                    <Button size="sm" variant="ghost" className="w-full text-destructive" onClick={clearPin}>
                      Remover pin
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Options menu */}
            <div className="relative">
              <button
                className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-muted transition-opacity"
                onClick={() => setMenuOpen((v) => !v)}
              >
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-6 z-10 w-40 rounded-md border bg-popover shadow-lg py-1">
                  <Link
                    to={`/decks/${deck.id}`}
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Edit2 className="h-3.5 w-3.5" /> Editar
                  </Link>
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent text-destructive"
                    onClick={() => {
                      setMenuOpen(false)
                      onDelete(deck.id)
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Excluir
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {deck.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{deck.description}</p>
        )}
      </CardHeader>

      <CardContent className="pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary">
            {pluralize(deck.cardCount, 'card', 'cards')}
          </Badge>
          {deck.isPublic ? (
            <Badge variant="outline" className="gap-1">
              <Globe className="h-3 w-3" /> Público
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1">
              <Lock className="h-3 w-3" /> Privado
            </Badge>
          )}
          {deck.pinEmoji && (
            <Badge
              variant="secondary"
              className="gap-1 bg-primary/10 text-primary border-primary/20 cursor-default"
            >
              {deck.pinEmoji} {deck.pinLabel}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0 gap-2">
        <Button size="sm" variant="outline" asChild className="flex-1">
          <Link to={`/decks/${deck.id}`}>Ver cards</Link>
        </Button>
        {deck.cardCount >= 2 && (
          <Button size="sm" asChild className="flex-1">
            <Link to={`/decks/${deck.id}/play/quiz`}>
              <Play className="h-3.5 w-3.5" />
              Jogar
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

export default function Dashboard() {
  const { token } = useAuth()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['decks'],
    queryFn: () => decksApi.list(token!),
    enabled: !!token,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => decksApi.delete(token!, id),
    onSuccess: () => {
      toast.success('Deck excluído.')
      qc.invalidateQueries({ queryKey: ['decks'] })
    },
    onError: () => toast.error('Erro ao excluir deck.'),
  })

  function confirmDelete(id: string) {
    if (confirm('Excluir este deck? Todos os cards serão removidos.')) {
      deleteMutation.mutate(id)
    }
  }

  const decks = data?.decks ?? []

  return (
    <div className="container py-8 page-enter">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Meus Decks</h1>
          <p className="text-muted-foreground mt-1">
            {decks.length > 0
              ? `${pluralize(decks.length, 'deck', 'decks')} no total`
              : 'Nenhum deck ainda'}
          </p>
        </div>
        <CreateDeckDialog onCreated={() => qc.invalidateQueries({ queryKey: ['decks'] })} />
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="h-5 bg-muted rounded w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : decks.length === 0 ? (
        <div className="text-center py-24 space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold">Nenhum deck ainda</h2>
          <p className="text-muted-foreground">Crie seu primeiro deck para começar a estudar.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map((deck) => (
            <DeckCard key={deck.id} deck={deck} onDelete={confirmDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
