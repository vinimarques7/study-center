import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, BookOpen, Filter, X } from 'lucide-react'
import { decksApi, type DeckWithCount } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { DECK_CATEGORIES, DIFFICULTY_LABEL } from '@/lib/categories'
import { pluralize } from '@/lib/utils'

const DIFFICULTY_OPTIONS: { value: 'easy' | 'medium' | 'hard'; label: string }[] = [
  { value: 'easy', label: '🟢 Fácil' },
  { value: 'medium', label: '🟡 Médio' },
  { value: 'hard', label: '🔴 Difícil' },
]

function CategoryFilter({
  selected,
  onToggle,
}: {
  selected: Set<string>
  onToggle: (cat: string) => void
}) {
  const [search, setSearch] = useState('')
  const visible = DECK_CATEGORIES.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Filtrar categorias..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-8 text-sm"
        />
      </div>
      <div className="max-h-52 overflow-y-auto space-y-0.5 pr-1">
        {visible.map((cat) => (
          <label
            key={cat}
            className={`flex items-center gap-2 rounded-md px-2 py-1 cursor-pointer text-sm transition-colors ${
              selected.has(cat) ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'
            }`}
          >
            <input
              type="checkbox"
              checked={selected.has(cat)}
              onChange={() => onToggle(cat)}
              className="accent-primary"
            />
            {cat}
          </label>
        ))}
        {visible.length === 0 && (
          <p className="text-xs text-muted-foreground px-2 py-1">Nenhuma categoria encontrada.</p>
        )}
      </div>
    </div>
  )
}

function PublicDeckCard({ deck }: { deck: DeckWithCount }) {
  const { user } = useAuth()

  return (
    <Card className="hover:shadow-md transition-shadow flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-2">
          <BookOpen className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <CardTitle className="text-base leading-snug">{deck.name}</CardTitle>
        </div>
        {deck.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{deck.description}</p>
        )}
      </CardHeader>
      <CardContent className="pb-3 flex-1">
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary">{pluralize(deck.cardCount, 'card', 'cards')}</Badge>
          {deck.category && (
            <Badge variant="outline" className="text-xs">{deck.category}</Badge>
          )}
          {deck.deckDifficulty && (
            <Badge variant="outline" className="text-xs">
              {DIFFICULTY_LABEL[deck.deckDifficulty] ?? deck.deckDifficulty}
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        {user ? (
          <Button size="sm" variant="outline" asChild className="w-full">
            <Link to={`/decks/${deck.id}`}>Ver deck</Link>
          </Button>
        ) : (
          <Button size="sm" variant="outline" asChild className="w-full">
            <Link to="/login">Entrar para estudar</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

export default function Explore() {
  const [search, setSearch] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [selectedDifficulties, setSelectedDifficulties] = useState<Set<string>>(new Set())
  const [filtersOpen, setFiltersOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['public-decks'],
    queryFn: () => decksApi.listPublic(),
    staleTime: 1000 * 60 * 5,
  })

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) => {
      const next = new Set(prev)
      next.has(cat) ? next.delete(cat) : next.add(cat)
      return next
    })
  }

  function toggleDifficulty(d: string) {
    setSelectedDifficulties((prev) => {
      const next = new Set(prev)
      next.has(d) ? next.delete(d) : next.add(d)
      return next
    })
  }

  function clearFilters() {
    setSearch('')
    setSelectedCategories(new Set())
    setSelectedDifficulties(new Set())
  }

  const allDecks = data?.decks ?? []

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return allDecks.filter((d) => {
      const matchSearch = !q || d.name.toLowerCase().includes(q) || d.description?.toLowerCase().includes(q)
      const matchCat =
        selectedCategories.size === 0 ||
        (d.category != null && selectedCategories.has(d.category))
      const matchDiff =
        selectedDifficulties.size === 0 ||
        (d.deckDifficulty != null && selectedDifficulties.has(d.deckDifficulty))
      return matchSearch && matchCat && matchDiff
    })
  }, [allDecks, search, selectedCategories, selectedDifficulties])

  const activeFilters =
    selectedCategories.size + selectedDifficulties.size + (search ? 1 : 0)

  return (
    <div className="container py-8 page-enter">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Explorar Decks</h1>
        <p className="text-muted-foreground mt-1">
          Descubra decks públicos de outros estudantes
        </p>
      </div>

      {/* Search + filter bar */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título ou descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          variant={filtersOpen ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFiltersOpen((v) => !v)}
          className="gap-1.5 shrink-0"
        >
          <Filter className="h-4 w-4" />
          Filtros
          {activeFilters > 0 && (
            <span className="ml-1 rounded-full bg-primary-foreground text-primary text-xs font-bold px-1.5 py-0.5">
              {activeFilters}
            </span>
          )}
        </Button>
        {activeFilters > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="shrink-0">
            Limpar
          </Button>
        )}
      </div>

      <div className="flex gap-6">
        {/* Sidebar filters */}
        {filtersOpen && (
          <aside className="w-60 shrink-0 space-y-6">
            <div>
              <p className="text-sm font-semibold mb-2">Categorias</p>
              <CategoryFilter selected={selectedCategories} onToggle={toggleCategory} />
              {selectedCategories.size > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {[...selectedCategories].map((c) => (
                    <button
                      key={c}
                      onClick={() => toggleCategory(c)}
                      className="flex items-center gap-1 rounded-full bg-primary/10 text-primary text-xs px-2 py-0.5 hover:bg-primary/20"
                    >
                      {c} <X className="h-3 w-3" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold mb-2">Dificuldade</p>
              <div className="space-y-1">
                {DIFFICULTY_OPTIONS.map((d) => (
                  <label
                    key={d.value}
                    className={`flex items-center gap-2 rounded-md px-2 py-1.5 cursor-pointer text-sm transition-colors ${
                      selectedDifficulties.has(d.value)
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedDifficulties.has(d.value)}
                      onChange={() => toggleDifficulty(d.value)}
                      className="accent-primary"
                    />
                    {d.label}
                  </label>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* Deck grid */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
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
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 space-y-3">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <h2 className="text-lg font-semibold">Nenhum deck encontrado</h2>
              <p className="text-muted-foreground text-sm">
                {allDecks.length === 0
                  ? 'Ainda não há decks públicos. Seja o primeiro a publicar!'
                  : 'Tente ajustar os filtros ou o termo de busca.'}
              </p>
              {activeFilters > 0 && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Limpar filtros
                </Button>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                {filtered.length} deck{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
                {allDecks.length !== filtered.length && ` de ${allDecks.length}`}
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((deck) => (
                  <PublicDeckCard key={deck.id} deck={deck} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
