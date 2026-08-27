/**
 * Seed script — popula o banco com dados iniciais.
 * Execute: npm run db:seed
 */
import 'dotenv/config'
import { db } from './index'
import { cards, decks, siteSettings, users } from './schema'
import argon2 from 'argon2'

async function main() {
  console.log('🌱 Iniciando seed...')

  // ─── Configurações do site ──────────────────────────────────────────────────
  await db
    .insert(siteSettings)
    .values([
      { key: 'site_title', value: 'Lumora' },
      {
        key: 'site_subtitle',
        value: 'Aprenda mais rápido com flashcards interativos.',
      },
      { key: 'bg_color', value: '#0f172a' },
    ])
    .onConflictDoNothing()

  // ─── Usuários ───────────────────────────────────────────────────────────────
  const adminHash = await argon2.hash('admin123', { type: argon2.argon2id })
  const userHash = await argon2.hash('user123', { type: argon2.argon2id })

  const [admin, regularUser] = await db
    .insert(users)
    .values([
      {
        email: 'admin@studycenter.app',
        passwordHash: adminHash,
        role: 'admin',
        themeColor: '#6366f1',
      },
      {
        email: 'user@studycenter.app',
        passwordHash: userHash,
        role: 'user',
        themeColor: '#10b981',
      },
    ])
    .onConflictDoNothing()
    .returning()

  if (!admin || !regularUser) {
    console.log('ℹ️  Usuários já existem, pulando seed de decks.')
    return
  }

  // ─── Decks & Cards (seed de computação) ─────────────────────────────────────
  const seedData: Array<{
    name: string
    description: string
    cards: Array<{
      question: string
      answer: string
      explanation: string
      analogy?: string
    }>
  }> = [
    {
      name: 'SOLID',
      description: 'Os 5 princípios do SOLID para design de software orientado a objetos.',
      cards: [
        {
          question: 'O que é o Princípio da Responsabilidade Única (SRP)?',
          answer: 'Uma classe deve ter apenas um motivo para mudar.',
          explanation:
            'Cada classe deve ser responsável por uma única parte da funcionalidade do software. Se uma classe muda por mais de um motivo, ela tem mais de uma responsabilidade.',
          analogy:
            'Um chef de cozinha não deveria também ser o garçom e o caixa — cada papel tem suas próprias responsabilidades.',
        },
        {
          question: 'O que é o Princípio do Aberto/Fechado (OCP)?',
          answer: 'Entidades de software devem ser abertas para extensão, mas fechadas para modificação.',
          explanation:
            'Você deve conseguir adicionar novos comportamentos sem alterar o código existente. Isso é alcançado geralmente via herança ou composição.',
          analogy:
            'Um plug de tomada: você pode usar diferentes adaptadores sem modificar a tomada em si.',
        },
        {
          question: 'O que é o Princípio da Substituição de Liskov (LSP)?',
          answer: 'Objetos de uma subclasse devem poder substituir objetos da superclasse sem quebrar o programa.',
          explanation:
            'Se S é subtipo de T, então objetos do tipo T podem ser substituídos por objetos do tipo S sem alterar nenhuma propriedade desejável do programa.',
          analogy:
            'Todo quadrado é um retângulo, mas um quadrado não pode substituir um retângulo de forma transparente se a altura e largura forem modificadas independentemente.',
        },
        {
          question: 'O que é o Princípio da Segregação de Interface (ISP)?',
          answer: 'Clientes não devem ser forçados a depender de interfaces que não utilizam.',
          explanation:
            'É melhor ter muitas interfaces pequenas e específicas do que uma única interface grande e genérica.',
          analogy:
            'Um controle remoto universal com 200 botões: a maioria das pessoas usa apenas 5-10. Melhor ter controles especializados.',
        },
        {
          question: 'O que é o Princípio da Inversão de Dependência (DIP)?',
          answer:
            'Módulos de alto nível não devem depender de módulos de baixo nível. Ambos devem depender de abstrações.',
          explanation:
            'Detalhes devem depender de abstrações, não o contrário. Isso é obtido via injeção de dependência.',
          analogy:
            'Uma lâmpada não deve ser soldada diretamente ao fio elétrico — ela usa um soquete (abstração) que pode receber qualquer lâmpada.',
        },
      ],
    },
    {
      name: 'Clean Code',
      description: 'Práticas de código limpo segundo Robert C. Martin.',
      cards: [
        {
          question: 'O que é Clean Code?',
          answer:
            'Código que é fácil de ler, entender e modificar. Código que expressa claramente sua intenção.',
          explanation:
            'Clean Code é escrito pensando no próximo desenvolvedor (que pode ser você mesmo). É simples, direto e sem surpresas.',
          analogy:
            'Um texto bem escrito: qualquer pessoa consegue ler e entender sem precisar do autor para explicar.',
        },
        {
          question: 'Qual a regra dos nomes significativos?',
          answer: 'Use nomes que revelem a intenção: o nome deve dizer por que existe, o que faz e como é usado.',
          explanation:
            "Evite nomes como `d`, `tmp`, `data`. Prefira `diasDecorridos`, `temperaturaAtual`, `listaDeUsuarios`.",
          analogy: 'Nomear uma variável `x` é como nomear um cachorro "Animal".',
        },
        {
          question: 'O que é a Regra do Escoteiro (Boy Scout Rule)?',
          answer: 'Deixe o código sempre um pouco mais limpo do que encontrou.',
          explanation:
            'A cada vez que tocar em um arquivo, melhore algo: renomeie uma variável confusa, quebre uma função grande, remova um comentário óbvio.',
          analogy:
            'Escoteiros deixam o acampamento mais limpo do que encontraram. Não precisam limpar tudo, só melhorar um pouco.',
        },
        {
          question: 'Por que funções devem fazer apenas uma coisa?',
          answer: 'Funções pequenas e focadas são mais fáceis de entender, testar e reutilizar.',
          explanation:
            'Se uma função faz mais de uma coisa, extraia as responsabilidades em funções separadas. O nome da função deve descrever completamente o que ela faz.',
          analogy:
            'Uma faca suíça com 30 ferramentas vs. uma faca de chef afiada: para cozinhar, a específica é sempre melhor.',
        },
        {
          question: 'O que são "Code Smells"?',
          answer: 'Sinais no código que indicam possíveis problemas de design, mas não necessariamente bugs.',
          explanation:
            'Exemplos: código duplicado, funções longas, listas de parâmetros longas, comentários que explicam código confuso em vez de torná-lo claro.',
          analogy:
            'Quando você cheira algo estranho na geladeira, você investiga — o cheiro indica que algo pode estar errado.',
        },
      ],
    },
    {
      name: 'Design Patterns',
      description: 'Padrões de projeto clássicos do Gang of Four.',
      cards: [
        {
          question: 'O que é o padrão Singleton?',
          answer: 'Garante que uma classe tenha apenas uma instância e fornece um ponto global de acesso a ela.',
          explanation:
            'Útil para recursos compartilhados como conexões de banco de dados ou configurações globais. Cuidado: pode tornar o código difícil de testar.',
          analogy: 'O presidente de um país: existe apenas um de cada vez e todos sabem quem é.',
        },
        {
          question: 'O que é o padrão Observer?',
          answer:
            'Define uma dependência um-para-muitos: quando um objeto muda de estado, todos os seus dependentes são notificados automaticamente.',
          explanation:
            'Composto de Subject (publicador) e Observers (assinantes). Muito usado em sistemas de eventos, UI frameworks e reactive programming.',
          analogy:
            'Uma newsletter: o jornal (subject) publica, todos os assinantes (observers) recebem automaticamente.',
        },
        {
          question: 'O que é o padrão Factory Method?',
          answer:
            'Define uma interface para criar um objeto, mas permite que as subclasses alterem o tipo de objetos que serão criados.',
          explanation:
            'Delega a criação de objetos para subclasses, permitindo que o código cliente trabalhe com abstrações em vez de classes concretas.',
          analogy:
            'Uma padaria: você pede um "pão" e a padaria decide qual tipo de pão fazer baseado no contexto.',
        },
        {
          question: 'O que é o padrão Strategy?',
          answer:
            'Define uma família de algoritmos, encapsula cada um deles e os torna intercambiáveis.',
          explanation:
            'Permite que o algoritmo varie independentemente dos clientes que o usam. Resolve o problema de ter múltiplas variantes de um comportamento.',
          analogy:
            'Formas de transporte para uma viagem: você pode escolher entre carro, trem ou avião dependendo da situação.',
        },
        {
          question: 'O que é o padrão Decorator?',
          answer:
            'Adiciona responsabilidades adicionais a um objeto dinamicamente, sendo uma alternativa flexível ao uso de herança.',
          explanation:
            'Envolve o objeto original em um wrapper que implementa a mesma interface mas adiciona comportamento extra antes ou depois de delegar.',
          analogy:
            'Um café pode receber decoradores: + leite, + açúcar, + chantilly. Cada decorador adiciona algo sem modificar o café base.',
        },
      ],
    },
    {
      name: 'API & Web',
      description: 'Conceitos essenciais de APIs REST, HTTP e web.',
      cards: [
        {
          question: 'Quais são os princípios de uma API REST?',
          answer:
            'Stateless, Client-Server, Uniform Interface, Layered System, Cacheable, Code on Demand (opcional).',
          explanation:
            'REST (Representational State Transfer) é um estilo arquitetural. Cada requisição deve conter todas as informações necessárias — o servidor não guarda estado de sessão do cliente.',
          analogy:
            'Cada ligação para um call center deve se explicar por si só — o atendente não lembra da ligação anterior.',
        },
        {
          question: 'Qual a diferença entre Autenticação e Autorização?',
          answer:
            'Autenticação = verificar QUEM você é. Autorização = verificar O QUE você pode fazer.',
          explanation:
            'Autenticação verifica a identidade (login/senha, token). Autorização define permissões (o usuário pode editar este recurso?).',
          analogy:
            'Autenticação é mostrar sua carteira de identidade na entrada. Autorização é ter ou não ter permissão para acessar a área VIP.',
        },
        {
          question: 'O que é idempotência em APIs REST?',
          answer:
            'Uma operação é idempotente quando pode ser aplicada múltiplas vezes sem alterar o resultado além da primeira aplicação.',
          explanation:
            'GET, PUT e DELETE são idempotentes. POST geralmente não é. Se você enviar o mesmo PUT 10 vezes, o resultado é o mesmo que enviar uma vez.',
          analogy:
            'Apertar o botão de elevador: apertar uma ou dez vezes, o elevador vem igualmente uma única vez.',
        },
        {
          question: 'O que é um JWT (JSON Web Token)?',
          answer:
            'Um padrão aberto (RFC 7519) para transmitir informações de forma segura como um objeto JSON assinado digitalmente.',
          explanation:
            'Composto de três partes: Header (algoritmo), Payload (dados/claims) e Signature (assinatura). O servidor verifica a assinatura mas não precisa armazenar sessões.',
          analogy:
            'Um crachá corporativo: carrega informações visíveis sobre você e tem um holograma que prova que é autêntico.',
        },
        {
          question: 'Qual a diferença entre SQL e NoSQL?',
          answer:
            'SQL: bancos relacionais com schema fixo e transações ACID. NoSQL: bancos não-relacionais com schema flexível, projetados para escala horizontal.',
          explanation:
            'SQL (PostgreSQL, MySQL) é ideal para dados estruturados com relacionamentos complexos. NoSQL (MongoDB, Cassandra) é ideal para grandes volumes, dados semi-estruturados ou acesso por chave.',
          analogy:
            'SQL é uma planilha com colunas fixas. NoSQL é uma caixa de documentos onde cada um pode ter campos diferentes.',
        },
      ],
    },
    {
      name: 'Banco de Dados',
      description: 'Índices, cache, transações e conceitos avançados de banco.',
      cards: [
        {
          question: 'O que é um índice de banco de dados e para que serve?',
          answer:
            'Uma estrutura de dados separada que armazena um subconjunto das colunas para acelerar consultas.',
          explanation:
            'Índices permitem que o banco localize registros sem fazer full table scan. Trade-off: aceleram leituras, mas tornam escritas um pouco mais lentas e ocupam espaço.',
          analogy:
            'O índice no final de um livro: em vez de ler o livro inteiro para achar "fotossíntese", você vai direto ao índice.',
        },
        {
          question: 'O que são as propriedades ACID?',
          answer:
            'Atomicidade, Consistência, Isolamento e Durabilidade — garantias de transações em bancos relacionais.',
          explanation:
            'Atomicidade: tudo ou nada. Consistência: o banco sempre fica em estado válido. Isolamento: transações paralelas não interferem. Durabilidade: dados confirmados sobrevivem a falhas.',
          analogy:
            'Uma transferência bancária: ou o dinheiro sai de uma conta E entra na outra, ou nenhuma das duas operações acontece.',
        },
        {
          question: 'O que é N+1 Problem em queries?',
          answer:
            'O problema de executar 1 query para buscar uma lista e depois N queries adicionais para buscar dados relacionados de cada item.',
          explanation:
            'Exemplo: buscar 100 posts e depois fazer uma query por post para pegar o autor = 101 queries. Solução: JOINs, eager loading ou DataLoader.',
          analogy:
            'Ir ao supermercado uma vez por item da lista, em vez de comprar tudo de uma vez.',
        },
        {
          question: 'O que é cache e quais suas estratégias principais?',
          answer:
            'Cache-Aside (Lazy Loading), Write-Through, Write-Behind, Read-Through. Cache-Aside é o mais comum.',
          explanation:
            'Cache-Aside: app verifica o cache primeiro; se não encontrar (miss), busca no banco e armazena no cache. Melhora latência e reduz carga no banco.',
          analogy:
            'Sua mesa de trabalho (cache) tem os documentos que você usa com frequência. Para os demais, você vai ao arquivo morto (banco de dados).',
        },
        {
          question: 'O que é um deadlock em banco de dados?',
          answer:
            'Situação onde duas ou mais transações ficam esperando indefinidamente a outra liberar recursos bloqueados.',
          explanation:
            'Transação A bloqueia recurso X e espera Y. Transação B bloqueia recurso Y e espera X. Nenhuma pode prosseguir. O banco detecta e aborta uma delas.',
          analogy:
            'Dois carros em um corredor estreito, cada um esperando o outro recuar.',
        },
      ],
    },
    {
      name: 'Segurança & Criptografia',
      description: 'Hash, criptografia, autenticação e boas práticas de segurança.',
      cards: [
        {
          question: 'Qual a diferença entre hash e criptografia simétrica?',
          answer:
            'Hash é unidirecional (não dá para reverter). Criptografia simétrica é bidirecional (pode-se criptografar e descriptografar com a mesma chave).',
          explanation:
            'Use hash para armazenar senhas (bcrypt, argon2). Use criptografia simétrica (AES) para dados que precisam ser lidos depois, como segredos armazenados.',
          analogy:
            'Hash é moer carne em hambúrguer — irreversível. Criptografia simétrica é um cofre com chave — você fecha e abre com a mesma chave.',
        },
        {
          question: 'Qual a diferença entre criptografia simétrica e assimétrica?',
          answer:
            'Simétrica: mesma chave para encriptar e decriptar (AES). Assimétrica: par de chaves pública/privada (RSA, Ed25519).',
          explanation:
            'Simétrica é mais rápida, ideal para grandes volumes de dados. Assimétrica é usada para troca segura de chaves, assinatura digital e TLS.',
          analogy:
            'Simétrica: cadeado com cópia da chave para ambos. Assimétrica: você tem um cadeado aberto que qualquer um pode usar para fechar, mas só você tem a chave para abrir.',
        },
        {
          question: 'O que é o argon2id e por que usá-lo para senhas?',
          answer:
            'Argon2id é um algoritmo de hashing de senhas vencedor do Password Hashing Competition, resistente a ataques de GPU e side-channel.',
          explanation:
            'Ao contrário de SHA-256 (rápido demais para senhas), argon2id é intencionalmente lento e usa muita memória RAM, tornando ataques de força bruta proibitivamente caros.',
          analogy:
            'Abrir uma caixa forte de propósito que leva 10 segundos. Não é problema para o usuário legítimo, mas é catastrófico para quem tenta milhões de tentativas.',
        },
        {
          question: 'O que é XSS (Cross-Site Scripting)?',
          answer:
            'Ataque onde o invasor injeta scripts maliciosos em páginas web que são executados no navegador de outros usuários.',
          explanation:
            'Tipos: Stored XSS (script salvo no banco), Reflected XSS (script no parâmetro da URL) e DOM-based XSS. Prevenção: sanitizar inputs, CSP headers, httpOnly cookies.',
          analogy:
            'Deixar um cartaz malicioso numa vitrine que engana todos os clientes que passam.',
        },
        {
          question: 'O que é CSRF (Cross-Site Request Forgery)?',
          answer:
            'Ataque que força um usuário autenticado a executar ações indesejadas em um site sem seu conhecimento.',
          explanation:
            'Funciona porque o navegador envia cookies automaticamente. Prevenção: CSRF tokens, SameSite cookies, verificar Origin/Referer headers.',
          analogy:
            'Alguém escreve uma carta no seu nome pedindo transferência bancária — o banco aceita porque reconhece sua assinatura.',
        },
      ],
    },
    {
      name: 'Infraestrutura & Cloud',
      description: 'Microsserviços, containers, escalabilidade e padrões de cloud.',
      cards: [
        {
          question: 'Qual a diferença entre escalabilidade horizontal e vertical?',
          answer:
            'Vertical: adicionar mais recursos a um único servidor (mais CPU/RAM). Horizontal: adicionar mais servidores (scale out).',
          explanation:
            'Escalabilidade vertical tem limite físico e ponto único de falha. Horizontal é mais resiliente e teoricamente ilimitada, mas requer que o sistema seja stateless ou use compartilhamento de estado externo.',
          analogy:
            'Vertical: contratar um super-funcionário mais forte. Horizontal: contratar mais funcionários.',
        },
        {
          question: 'O que é Circuit Breaker pattern?',
          answer:
            'Padrão que previne chamadas repetidas a um serviço com falha, dando tempo para ele se recuperar.',
          explanation:
            'Tem 3 estados: Closed (funcionando normalmente), Open (falhas detectadas, rejeita chamadas) e Half-Open (tenta algumas chamadas para ver se o serviço voltou).',
          analogy:
            'O disjuntor elétrico: quando detecta sobrecarga, corta o circuito para proteger o sistema. Depois de um tempo, você tenta religar.',
        },
        {
          question: 'O que é observabilidade e seus três pilares?',
          answer: 'Logs, Métricas e Traces (rastreamento distribuído).',
          explanation:
            'Logs: registros de eventos. Métricas: dados numéricos ao longo do tempo (latência, taxa de erros). Traces: rastrear uma requisição por vários serviços. Juntos permitem entender o comportamento do sistema em produção.',
          analogy:
            'Um avião: caixa preta (logs), painel de instrumentos (métricas) e rastreador de voo (traces).',
        },
        {
          question: 'O que é Docker e para que serve?',
          answer:
            'Plataforma de containerização que empacota uma aplicação e suas dependências em um container isolado e portável.',
          explanation:
            'Containers compartilham o kernel do OS (diferente de VMs), são leves e iniciados rapidamente. Resolvem o problema "funciona na minha máquina" ao garantir ambiente consistente.',
          analogy:
            'Um container de navio: padronizado, pode ser transportado por qualquer navio/trem/caminhão sem se preocupar com o conteúdo interno.',
        },
        {
          question: 'O que é Kubernetes (K8s)?',
          answer:
            'Sistema de orquestração de containers que automatiza deploy, scaling e gerenciamento de aplicações containerizadas.',
          explanation:
            'K8s gerencia um cluster de máquinas, faz scheduling de containers, monitora saúde, faz rolling updates e auto-healing (reinicia containers com falha).',
          analogy:
            'Se Docker é o container de navio, Kubernetes é o porto inteiro: controla onde cada container vai, quantos existem, e substitui automaticamente os danificados.',
        },
      ],
    },
    {
      name: 'Mensageria & Sistemas Distribuídos',
      description: 'Mensageria, load balancing, cache e padrões distribuídos.',
      cards: [
        {
          question: 'O que é mensageria assíncrona e quando usar?',
          answer:
            'Comunicação onde o produtor envia mensagens para uma fila sem esperar o consumidor processar, desacoplando os dois.',
          explanation:
            'Ferramentas: RabbitMQ, Kafka, SQS. Use quando: processamento pode ser atrasado, há picos de carga, diferentes velocidades de produção/consumo, ou quando resiliência é importante.',
          analogy:
            'Email vs. ligação telefônica: email (mensageria) permite que o receptor responda quando puder; ligação (síncrono) requer que ambos estejam disponíveis ao mesmo tempo.',
        },
        {
          question: 'O que é load balancing?',
          answer:
            'Distribuição do tráfego de rede entre múltiplos servidores para garantir que nenhum fique sobrecarregado.',
          explanation:
            'Algoritmos: Round-Robin, Least Connections, IP Hash, Weighted. Load balancers também fazem health checks e removem servidores com falha do pool.',
          analogy:
            'A pessoa que distribui clientes nos caixas de um supermercado, sempre mandando para o mais vazio.',
        },
        {
          question: 'O que é um proxy reverso?',
          answer:
            'Servidor que fica na frente dos servidores de aplicação, recebe requisições dos clientes e as repassa para os servidores backend.',
          explanation:
            'Usado para: load balancing, SSL termination, cache, compressão, segurança (esconde IPs dos backends). Nginx e Caddy são exemplos populares.',
          analogy:
            'A recepção de uma empresa: você fala com a recepcionista, ela encaminha para a pessoa certa internamente.',
        },
        {
          question: 'O que é latência e como reduzi-la?',
          answer:
            'O tempo entre uma requisição e a resposta. Reduz-se com: cache, CDN, otimização de queries, minimizar round-trips, localização geográfica.',
          explanation:
            'Latência é diferente de throughput (volume). Uma conexão pode ter alto throughput mas alta latência. CDNs reduzem latência servindo conteúdo de servidores próximos ao usuário.',
          analogy:
            'Latência é o tempo que leva para a carta chegar. Throughput é quantas cartas a agência consegue processar por dia.',
        },
        {
          question: 'O que são microsserviços e quando usar?',
          answer:
            'Arquitetura onde a aplicação é dividida em pequenos serviços independentes, cada um responsável por um domínio de negócio.',
          explanation:
            'Vantagens: deploy independente, escalabilidade granular, isolamento de falhas, liberdade de stack. Desvantagens: complexidade operacional, latência de rede, consistência eventual.',
          analogy:
            'Contratar especialistas independentes (designer, dev, QA) vs. uma pessoa que faz tudo (monolito).',
        },
      ],
    },
  ]

  for (const deckData of seedData) {
    const [deck] = await db
      .insert(decks)
      .values({
        name: deckData.name,
        description: deckData.description,
        ownerId: admin.id,
        isPublic: true,
      })
      .returning()

    if (!deck) continue

    await db.insert(cards).values(
      deckData.cards.map((card, idx) => ({
        deckId: deck.id,
        authorId: admin.id,
        question: card.question,
        answer: card.answer,
        explanation: card.explanation,
        analogy: card.analogy,
        difficulty: 'medium' as const,
        position: idx,
      })),
    )

    console.log(`✅  Deck "${deckData.name}" criado com ${deckData.cards.length} cards`)
  }

  console.log('\n🎉 Seed concluído!')
  console.log('   Admin: admin@studycenter.app / admin123')
  console.log('   User:  user@studycenter.app  / user123')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
