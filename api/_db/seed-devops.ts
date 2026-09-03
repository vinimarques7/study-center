/**
 * Adiciona 5 cards de DevOps ao deck "DevOps - Básico" do Elias Manoel
 */
import 'dotenv/config'
import { db } from './index.js'
import { decks, cards } from './schema.js'
import { eq } from 'drizzle-orm'

const DEVOPS_CARDS = [
  {
    question: 'O que é um container Docker e qual o seu principal benefício?',
    answer:
      'Um container Docker é uma unidade de software que empacota código e todas as suas dependências, garantindo que a aplicação rode de forma idêntica em qualquer ambiente.',
    explanation:
      'Diferente de uma VM, o container não virtualiza o hardware — ele compartilha o kernel do sistema operacional hospedeiro. ' +
      'Isso o torna muito mais leve e rápido de iniciar. A imagem Docker define o ambiente de forma imutável e versionável, ' +
      'eliminando o clássico problema "funciona na minha máquina".',
    analogy:
      'Um container é como uma marmita: você embala a refeição (aplicação + dependências) em casa ' +
      'e ela chega exatamente igual no escritório, sem precisar de fogão, talheres ou temperos extras no destino.',
    imageUrl:
      'https://images.unsplash.com/photo-1605745341112-85968b19335b?auto=format&fit=crop&w=1280&q=80',
    difficulty: 'easy' as const,
  },
  {
    question: 'O que é Infrastructure as Code (IaC)?',
    answer:
      'IaC é a prática de provisionar e gerenciar infraestrutura (servidores, redes, bancos de dados) usando arquivos de configuração versionáveis, em vez de processos manuais.',
    explanation:
      'Ferramentas como Terraform, Ansible, Pulumi e AWS CloudFormation permitem descrever toda a infraestrutura em código. ' +
      'Isso traz reprodutibilidade (você recria o ambiente exato a qualquer momento), rastreabilidade (histórico de mudanças via Git), ' +
      'e facilita o disaster recovery e a criação de ambientes de staging/produção idênticos.',
    analogy:
      'É como uma receita de bolo: em vez de lembrar de cabeça como montar a cozinha, você tem a receita escrita. ' +
      'Qualquer pessoa pode seguir e chegar ao mesmo resultado.',
    imageUrl: null,
    difficulty: 'medium' as const,
  },
  {
    question: 'O que é monitoramento observabilidade e quais os três pilares?',
    answer:
      'Observabilidade é a capacidade de entender o estado interno de um sistema a partir de suas saídas externas. Os três pilares são: Logs, Métricas e Traces (rastreamento distribuído).',
    explanation:
      'Logs registram eventos discretos ("erro 500 às 14h32"). ' +
      'Métricas são valores numéricos agregados ao longo do tempo (CPU, latência média, requisições/s). ' +
      'Traces rastreiam o caminho de uma requisição por todos os microsserviços que ela passou. ' +
      'Ferramentas: Prometheus + Grafana (métricas), ELK Stack (logs), Jaeger/Zipkin (traces), OpenTelemetry (padrão unificado).',
    analogy:
      'Um piloto de avião usa três painéis: o altímetro (métrica), o diário de bordo (log) e o radar de rota (trace). ' +
      'Cada um conta uma parte diferente da história do voo.',
    imageUrl: null,
    difficulty: 'medium' as const,
  },
  {
    question: 'O que é Kubernetes e quando usá-lo?',
    answer:
      'Kubernetes (K8s) é uma plataforma de orquestração de containers que automatiza deployment, escalonamento e gerenciamento de aplicações containerizadas.',
    explanation:
      'Com Kubernetes você define o estado desejado (ex: "quero 3 réplicas dessa API rodando") e ele garante que esse estado seja mantido — reiniciando containers que caírem, distribuindo tráfego, escalonando horizontalmente sob demanda. ' +
      'Componentes principais: Pod (menor unidade), Deployment, Service, Ingress, ConfigMap e Secret. ' +
      'Indicado quando você tem múltiplos microsserviços e precisa de alta disponibilidade e escala.',
    analogy:
      'Kubernetes é como um gerente de RH automatizado: se um funcionário (container) cai doente, ele contrata outro imediatamente; ' +
      'se a demanda aumenta, contrata mais; se diminui, dispensa os excedentes.',
    imageUrl:
      'https://images.unsplash.com/photo-1667372393086-9d4001d51cf1?auto=format&fit=crop&w=1280&q=80',
    difficulty: 'hard' as const,
  },
  {
    question: 'O que é um pipeline de deployment e quais são suas etapas típicas?',
    answer:
      'Um pipeline de deployment é uma sequência automatizada de etapas que leva o código do repositório até o ambiente de produção com segurança e rastreabilidade.',
    explanation:
      'Etapas típicas: 1) Checkout do código; 2) Instalação de dependências; 3) Lint e análise estática; ' +
      '4) Testes unitários e de integração; 5) Build da aplicação/imagem Docker; ' +
      '6) Push da imagem para um registry (ex: Docker Hub, ECR); ' +
      '7) Deploy no ambiente de staging; 8) Testes de smoke/E2E; ' +
      '9) Aprovação manual (opcional); 10) Deploy em produção. ' +
      'Cada etapa que falha interrompe o pipeline, impedindo que código defeituoso chegue à produção.',
    analogy:
      'É como uma linha de inspeção de qualidade numa fábrica: o produto (código) passa por várias estações de verificação. ' +
      'Se falhar em qualquer uma, é barrado antes de chegar ao cliente.',
    imageUrl: null,
    difficulty: 'medium' as const,
  },
]

async function main() {
  console.log('🌱 Adicionando cards ao deck DevOps - Básico...\n')

  const [deck] = await db
    .select({ id: decks.id, ownerId: decks.ownerId })
    .from(decks)
    .where(eq(decks.name, 'DevOps - Básico'))

  if (!deck) {
    console.error('❌ Deck "DevOps - Básico" não encontrado.')
    process.exit(1)
  }

  console.log('Deck encontrado:', deck.id)

  for (let i = 0; i < DEVOPS_CARDS.length; i++) {
    const c = DEVOPS_CARDS[i]
    const [created] = await db
      .insert(cards)
      .values({
        deckId: deck.id,
        authorId: deck.ownerId,
        question: c.question,
        answer: c.answer,
        explanation: c.explanation,
        analogy: c.analogy,
        imageUrl: c.imageUrl,
        difficulty: c.difficulty,
        position: i + 1, // CI/CD ficou como position 0
      })
      .returning({ id: cards.id, question: cards.question })

    console.log(`✅ Card ${i + 1}: "${created.question.slice(0, 55)}..."`)
  }

  console.log('\n🎉 5 cards adicionados! O deck agora tem 6 cards — pronto para jogar.')
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
