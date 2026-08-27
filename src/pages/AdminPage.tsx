import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Settings2, Shield, Users, Crown, User as UserIcon, Image as ImageIcon } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { adminApi, usersApi, type SiteSettings } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { resolveBrandName } from '@/lib/theme'

const BG_PRESETS = [
  {
    name: 'Cachoeira',
    url: 'https://images.unsplash.com/photo-1437482078695-73f5ca6c96e2?auto=format&fit=crop&w=1920&q=80',
  },
  {
    name: 'Floresta Neblina',
    url: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1920&q=80',
  },
  {
    name: 'Plantas Tropicais',
    url: 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1920&q=80',
  },
  {
    name: 'Bosque Verde',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1920&q=80',
  },
] as const

export default function AdminPage() {
  const { token, user } = useAuth()
  const qc = useQueryClient()

  const { data: settingsData } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => adminApi.getSettings(),
  })

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users-admin'],
    queryFn: () => usersApi.list(token!),
    enabled: !!token,
  })

  const [form, setForm] = useState<SiteSettings>({
    site_title: '',
    site_subtitle: '',
    bg_color: '#0f172a',
    hero_text: '',
    bg_image_enabled: 'false',
    bg_image_url: '',
    bg_image_overlay: '0.45',
  })
  const [hydrated, setHydrated] = useState(false)

  const saveSettings = useMutation({
    mutationFn: () => adminApi.updateSettings(token!, form),
    onSuccess: () => {
      toast.success('Configurações salvas!')
      qc.invalidateQueries({ queryKey: ['admin-settings'] })
      qc.invalidateQueries({ queryKey: ['site-settings'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const setRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'user' | 'admin' }) =>
      usersApi.setRole(token!, id, role),
    onSuccess: () => {
      toast.success('Permissão atualizada!')
      qc.invalidateQueries({ queryKey: ['users-admin'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const allUsers = usersData?.users ?? []

  useEffect(() => {
    if (hydrated || !settingsData?.settings) return
    const s = settingsData.settings
    setForm({
      site_title: resolveBrandName(s.site_title),
      site_subtitle: s.site_subtitle ?? '',
      bg_color: s.bg_color ?? '#0f172a',
      hero_text: s.hero_text ?? '',
      bg_image_enabled: s.bg_image_enabled ?? 'false',
      bg_image_url: s.bg_image_url ?? '',
      bg_image_overlay: s.bg_image_overlay ?? '0.45',
    })
    setHydrated(true)
  }, [settingsData, hydrated])

  return (
    <div className="container py-8 max-w-5xl page-enter space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium mb-3">
          <Shield className="h-3.5 w-3.5" />
          Painel Administrativo
        </div>
        <h1 className="text-3xl font-bold">Administração</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie identidade do site e contas de usuários
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings2 className="h-5 w-5 text-primary" />
            Configurações globais do site
          </CardTitle>
          <CardDescription>
            Define título, textos institucionais e plano de fundo do site
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Título da home</Label>
              <Input
                value={form.site_title ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, site_title: e.target.value }))}
                placeholder="Lumora"
              />
            </div>

            <div className="space-y-2">
              <Label>Cor de fundo global</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={form.bg_color ?? '#0f172a'}
                  onChange={(e) => setForm((f) => ({ ...f, bg_color: e.target.value }))}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={form.bg_color ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, bg_color: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Subtítulo</Label>
            <Input
              value={form.site_subtitle ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, site_subtitle: e.target.value }))}
              placeholder="Aprenda mais rápido com flashcards..."
            />
          </div>

          <div className="space-y-2">
            <Label>Texto institucional (hero)</Label>
            <Textarea
              value={form.hero_text ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, hero_text: e.target.value }))}
              placeholder="Texto exibido na página inicial..."
            />
          </div>

          <div className="rounded-xl border p-4 space-y-4 glass-surface">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Imagem de fundo (opcional)</h3>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="bg-image-enabled"
                type="checkbox"
                checked={form.bg_image_enabled === 'true'}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    bg_image_enabled: e.target.checked ? 'true' : 'false',
                  }))
                }
              />
              <Label htmlFor="bg-image-enabled">Ativar imagem de fundo</Label>
            </div>

            {form.bg_image_enabled === 'true' && (
              <>
                <div className="space-y-2">
                  <Label>Presets sofisticados (natureza)</Label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {BG_PRESETS.map((preset) => (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, bg_image_url: preset.url }))}
                        className="group rounded-lg overflow-hidden border text-left"
                      >
                        <div
                          className="h-24 bg-cover bg-center"
                          style={{ backgroundImage: `url(${preset.url})` }}
                        />
                        <div className="px-3 py-2 text-sm font-medium group-hover:bg-muted/60">
                          {preset.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>URL da imagem</Label>
                  <Input
                    value={form.bg_image_url ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, bg_image_url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Intensidade do overlay (0 a 0.85)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={0.85}
                    step={0.05}
                    value={form.bg_image_overlay ?? '0.45'}
                    onChange={(e) => setForm((f) => ({ ...f, bg_image_overlay: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Valores maiores escurecem mais a imagem para melhorar legibilidade.
                  </p>
                </div>
              </>
            )}
          </div>

          <Button
            onClick={() => saveSettings.mutate()}
            disabled={saveSettings.isPending}
          >
            {saveSettings.isPending ? 'Salvando...' : 'Salvar configurações'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-primary" />
            Gestão de usuários
          </CardTitle>
          <CardDescription>
            Promova/rebaixe usuários entre perfil comum e administrador
          </CardDescription>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <p className="text-sm text-muted-foreground">Carregando usuários...</p>
          ) : (
            <div className="space-y-2">
              {allUsers.map((u) => {
                const isSelf = u.id === user?.id

                return (
                  <div
                    key={u.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border p-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{u.email}</p>
                        {u.role === 'admin' ? (
                          <Badge className="gap-1">
                            <Crown className="h-3 w-3" /> Admin
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <UserIcon className="h-3 w-3" /> User
                          </Badge>
                        )}
                        {isSelf && <Badge variant="outline">Você</Badge>}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {u.role !== 'admin' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRole.mutate({ id: u.id, role: 'admin' })}
                        >
                          Tornar admin
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isSelf}
                          onClick={() => setRole.mutate({ id: u.id, role: 'user' })}
                        >
                          Tornar user
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
