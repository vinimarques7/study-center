const RAW_CATEGORIES = [
  'Administração', 'Anatomia', 'Antropologia', 'Arquitetura',
  'Artes Visuais', 'Biologia', 'Cálculo', 'Cinema',
  'Ciências Políticas', 'Computação', 'Concursos Públicos', 'Contabilidade',
  'Culinária', 'Cultura Geral', 'Banco de Dados', 'DevOps',
  'Direito', 'Economia', 'Educação Física', 'Empreendedorismo',
  'Enfermagem', 'Engenharia Civil', 'Engenharia de Produção',
  'Engenharia de Software', 'Engenharia Elétrica', 'Engenharia Mecânica',
  'Esportes', 'Estatística', 'Farmácia', 'Filosofia', 'Física',
  'Finanças', 'Fotografia', 'Francês', 'Gestão de Projetos',
  'Geografia', 'Alemão', 'História', 'Inglês', 'Inteligência Artificial',
  'Italiano', 'Libras', 'Literatura', 'Mandarim', 'Marketing',
  'Matemática', 'Medicina', 'Música', 'Nutrição', 'Odontologia',
  'Outro', 'Português', 'Programação', 'Psicologia', 'Química',
  'Redes', 'Religião', 'Segurança da Informação', 'Serviço Social',
  'Sociologia', 'Teatro', 'UX / Design', 'Vestibular', 'Veterinária',
  'Espanhol',
]

export const DECK_CATEGORIES = [...RAW_CATEGORIES].sort((a, b) =>
  a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }),
) as string[]

export type DeckCategory = string

export const DIFFICULTY_LABEL: Record<string, string> = {
  easy: '🟢 Fácil',
  medium: '🟡 Médio',
  hard: '🔴 Difícil',
}
