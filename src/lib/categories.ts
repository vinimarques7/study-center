export const DECK_CATEGORIES = [
  // Ciências exatas
  'Matemática', 'Física', 'Química', 'Estatística', 'Cálculo',
  // Ciências biológicas e saúde
  'Biologia', 'Anatomia', 'Fisiologia', 'Medicina', 'Enfermagem',
  'Farmácia', 'Nutrição', 'Odontologia', 'Veterinária',
  // Psicologia e ciências humanas
  'Psicologia', 'Filosofia', 'Sociologia', 'Antropologia', 'História',
  'Geografia', 'Ciências Políticas', 'Direito', 'Serviço Social',
  // Linguagens
  'Português', 'Literatura', 'Inglês', 'Espanhol', 'Francês',
  'Alemão', 'Italiano', 'Mandarim', 'Libras',
  // Tecnologia
  'Programação', 'Computação', 'Redes', 'Banco de Dados',
  'Inteligência Artificial', 'Engenharia de Software',
  'DevOps', 'Segurança da Informação', 'UX / Design',
  // Engenharias
  'Engenharia Civil', 'Engenharia Elétrica', 'Engenharia Mecânica',
  'Arquitetura', 'Engenharia de Produção',
  // Negócios
  'Administração', 'Marketing', 'Economia', 'Contabilidade',
  'Finanças', 'Empreendedorismo', 'Gestão de Projetos',
  // Artes e cultura
  'Artes Visuais', 'Música', 'Cinema', 'Teatro', 'Fotografia',
  // Outros
  'Educação Física', 'Esportes', 'Culinária', 'Religião',
  'Cultura Geral', 'Concursos Públicos', 'Vestibular', 'Outro',
] as const

export type DeckCategory = (typeof DECK_CATEGORIES)[number]

export const DIFFICULTY_LABEL: Record<string, string> = {
  easy: '🟢 Fácil',
  medium: '🟡 Médio',
  hard: '🔴 Difícil',
}
