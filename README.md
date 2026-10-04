# Na Boca do Povo — Eleições 2026

Painel público de acompanhamento das eleições brasileiras, desenvolvido para a cobertura do programa **Na Boca do Povo**. Reúne resultados e indicadores eleitorais oficiais do Tribunal Superior Eleitoral (TSE), com filtros por localidade, cargo e turno e uma apresentação adaptada a celulares.

**[Acessar o painel](https://nabocadopovo-eleicoes.vercel.app/)** · **[Resultados oficiais do TSE](https://resultados.tse.jus.br/)**

O painel é independente do TSE e pode ser consultado sem cadastro, login ou senha.

## Recursos

- Apuração presidencial nacional e resultados por estado e município.
- Seleção de primeiro e segundo turno, conforme disponibilidade dos arquivos oficiais.
- Mapa geográfico interativo das 27 unidades da federação, com limites do IBGE.
- Busca de candidatos por nome, número ou partido.
- Fotos oficiais dos candidatos, associadas ao identificador de candidatura do TSE, com carregamento sob demanda e ícone quando indisponíveis.
- Votos, percentuais e situação dos candidatos conforme o TSE.
- Seções totalizadas, percentual de totalização e seções pendentes.
- Eleitores aptos, eleitorado das seções totalizadas e pendentes.
- Comparecimento e abstenção, com as taxas publicadas pelo TSE.
- Total de votos computados, válidos, brancos, nulos, anulados e anulados sub judice.
- Detalhamento de votos válidos nominais e de legenda para deputados.
- Horário da última totalização, indicação de dados desatualizados e acesso ao arquivo oficial consultado.

### Cargos e abrangência

| Cargo | Abrangência disponível |
| --- | --- |
| Presidente da República | Brasil, estados e municípios |
| Governador | Estados e municípios |
| Senador | Estados e municípios |
| Deputado federal | Estados e municípios |
| Deputado estadual | Estados e municípios, exceto DF |
| Deputado distrital | Distrito Federal e localidades disponíveis no TSE |

O botão **Brasil inteiro** retorna à disputa presidencial nacional. No segundo turno, o seletor oferece presidente e governador. Resultados municipais representam os votos registrados naquela localidade para o cargo selecionado.

## Dados e atualização

A interface consulta o servidor do painel a cada **30 segundos enquanto a página está visível**. O servidor busca os arquivos JSON do ambiente oficial do TSE, valida eleição, cargo, turno e liberação da divulgação, e compartilha consultas por meio de cache.

A frequência de consulta não determina a frequência de publicação do TSE. Os números só mudam quando novos arquivos oficiais estão disponíveis. Em falhas temporárias, o último resultado recebido pode ser mantido, com indicação de atualização indisponível. Arquivos ainda não publicados geram uma mensagem de espera.

### Cuidados para análise jornalística

- **Eleitores aptos** representam o eleitorado total da abrangência escolhida.
- **Comparecimento e abstenção** são parciais durante a apuração. As taxas oficiais usam o eleitorado das seções instaladas, informado junto dos indicadores.
- Os percentuais da **composição dos votos** são calculados pelo painel sobre o total de votos computados para o cargo. Os percentuais dos candidatos são recebidos do TSE.
- Para **senador**, cada eleitor pode registrar dois votos em 2026. O total de votos não deve ser interpretado como quantidade de pessoas que compareceram.
- Votos anulados e anulados sub judice são apresentados separadamente dos nulos. Os votos válidos de deputados incluem votos nominais e de legenda.
- **“—”** indica informação ausente ou percentual sem base de cálculo. Zero representa um valor retornado no arquivo oficial.
- Resultados parciais podem mudar. A classificação exibida segue a informação oficial; o painel não faz projeções de vencedores.

### Fotos dos candidatos

As fotos de 2026 são importadas do Portal de Dados Abertos do TSE e servidas em `public/candidates/2026/`. Os nomes dos arquivos correspondem ao identificador `sqcand` dos resultados. `lib/candidate-photo-ids.json` registra as imagens disponíveis; nenhuma associação é feita por nome ou número de urna. As imagens conservam os arquivos JPEG oficiais e usam carregamento preguiçoso no navegador. Novas candidaturas sem foto importada recebem um ícone neutro até a próxima importação.

Fonte: [Candidatos 2026 — TSE](https://dadosabertos.tse.jus.br/dataset/candidatos-2026), licença Creative Commons Atribuição conforme o catálogo. Importação realizada em 03/10/2026. As fotos não são atualizadas pelo ciclo de consulta de votos de 30 segundos. Para reimportar, execute `pwsh -File scripts/import-candidate-photos.ps1` na raiz do projeto e valide os builds antes de publicar. As URLs de origem são registradas em `lib/candidate-photo-sources.json`.

### Fontes

- [TSE — documentação técnica da divulgação de resultados de 2026](https://www.tse.jus.br/eleicoes/informacoes-tecnicas-sobre-a-divulgacao-de-resultados): configuração de eleições e municípios, acompanhamento da apuração e resultados unificados (EA20).
- [TSE — arquivos oficiais](https://resultados.tse.jus.br/oficial/comum/config/ele-c.json): configuração usada para identificar as eleições e construir as consultas.
- [IBGE — API de malhas geográficas](https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR?intrarregiao=UF&formato=application/vnd.geo%2Bjson&qualidade=minima): limites estaduais usados no mapa, convertido para SVG com projeção Mercator.

## Tecnologias

React, TypeScript, Tailwind CSS e componentes Radix UI. A aplicação oferece dois caminhos de execução: **Next.js para Vercel** e **Vinext/Vite para Sites/Cloudflare Workers**. Ambos usam o mesmo painel e a mesma integração com o TSE.

A consulta ao TSE acontece na rota de servidor `app/api/tse/route.ts`. O painel eleitoral não depende de banco de dados, armazenamento de usuários ou chave de API do TSE.

## Executar localmente

### Requisitos

- Node.js **22.13.0 ou superior**.
- npm e Git.
- Acesso à internet para consultar o TSE.

```bash
 git clone https://github.com/FranciscoDias87/nabocadopovo-eleicoes.git
 cd nabocadopovo-eleicoes
 npm ci
 npm run dev
```

Abra o endereço informado pelo servidor no terminal.

### Comandos

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Iniciar o ambiente de desenvolvimento |
| `npm run build` | Gerar a aplicação para o ambiente atual de hospedagem |
| `npm run start` | Servir o build localmente com Wrangler; executar após o build |
| `npm run dev:vercel` | Iniciar o desenvolvimento com Next.js |
| `npm run build:vercel` | Gerar o build Next.js usado pela Vercel |
| `npm run start:vercel` | Servir localmente o build Next.js |
| `npm run lint` | Executar a análise estática configurada no projeto |

## Organização do projeto

```text
app/
  api/tse/route.ts           Consulta, validação e cache dos dados oficiais
  page.tsx                  Painel, filtros e atualização automática
  globals.css               Estilos e regras responsivas
components/
  brazil-map.tsx            Mapa interativo do Brasil
  election-numbers.tsx      Eleitorado e composição dos votos
  ui/                       Componentes de interface
lib/
  election-indicators.ts    Leitura dos indicadores do TSE
  geography.ts              Relação de unidades da federação
  brazil-map.json           Geometria do mapa
  brazil-map-source.json    Referência da fonte geográfica
public/
  logo.png                  Identidade visual do programa
build/ e scripts/           Integração de execução e hospedagem
```

## Hospedagem e domínio

A versão atual está publicada em **Sites/Cloudflare Workers**. O envio do código ao GitHub, por si só, não atualiza essa publicação: o processo de publicação Sites é separado.

### Vercel

O arquivo `vercel.json` configura o framework Next.js, a instalação com `npm ci`, o build com `npm run build:vercel` e a saída `.next`. Os comandos originais de Sites/Cloudflare permanecem disponíveis.

Ao importar este repositório na Vercel, configure:

| Campo | Valor |
| --- | --- |
| Production Branch | `main` |
| Root Directory | `./` — raiz do repositório, onde está o `package.json` |
| Framework Preset | Next.js |
| Build Command | `npm run build:vercel` |
| Install Command | `npm ci` |
| Output Directory | `.next` |

Não selecione `app/` como diretório raiz. A integração eleitoral não exige chave de API ou variáveis de ambiente. O build usa `tsconfig.vercel.json` para separar a tipagem da aplicação dos utilitários exclusivos de Cloudflare, sem removê-los.

A importação, o domínio e a publicação efetiva devem ser configurados na conta Vercel. O site atual do Sites permanece disponível; a publicação na Vercel é independente.

### Domínio próprio

O endereço desejado é `nabocadopovo-eleicoes.site`. Ele ainda precisa ser registrado e ter o DNS configurado e validado no provedor escolhido. A preparação de conexão no Sites não significa que o domínio esteja registrado ou ativo.

## Manutenção

Preserve as validações de origem oficial, eleição, cargo e turno ao alterar a integração. Respeite os limites de acesso do TSE e evite consultas repetidas a arquivos inexistentes. Verifique os filtros nacionais, estaduais e municipais, a interpretação dos percentuais e a leitura em telas pequenas antes de publicar alterações.

Arquivos de ambiente, credenciais e artefatos locais de execução devem permanecer fora do repositório.

## Análise e confiabilidade

A busca aceita nomes com ou sem acento. Candidatos são exibidos em lotes de 40; o CSV completo inclui todos os candidatos e os horários e a fonte oficial. Os filtros ficam no endereço da página para compartilhamento. Os indicadores completos são expansíveis.

Falhas temporárias preservam o último resultado da mesma consulta, com aviso de desatualização. Informações numéricas ausentes aparecem como indisponíveis, sem serem convertidas em zero. O histórico local registra até 20 atualizações por consulta e 200 registros neste navegador enquanto o painel está aberto; não substitui um histórico central.

O navegador consulta a cada 30 segundos enquanto a página está visível. Na Vercel, respostas públicas podem ficar em cache por 15 segundos e servir conteúdo anterior durante revalidação por até 30 segundos. Confira os horários do TSE.

Execute npm test e os dois builds antes de publicar. O GitHub Actions repete essas verificações e audita as dependências de produção. Next.js foi atualizado para 16.3.8, preservando Vite/Vinext.

O endpoint /api/health verifica a disponibilidade da aplicação, sem afirmar que o TSE está disponível. Falhas de consulta geram o evento tse_fetch_failed nos logs do servidor. O modo transmissão não faz parte desta atualização.
A lista prioriza candidatos com situação oficial Eleito, Eleito por QP ou Eleito por média (incluindo grafias femininas). Dentro dos grupos, mantém votos em ordem decrescente e desempate por nome. Suplentes, não eleitos e candidatos ao segundo turno não são classificados como eleitos. A ordem é recalculada em cada atualização; o painel não estima eleição a partir da quantidade de votos.


## Estatísticas privadas de audiência

O Vercel Web Analytics está integrado ao layout e ligado somente em builds Vercel. Os visitantes continuam acessando sem cadastro. O proprietário acompanha visitantes, visualizações, origem dos acessos e o indicador online no painel da Vercel, protegido pelo login da sua conta.

Abra https://vercel.com/francisco-diass-projects/nabocadopovo-eleicoes/analytics e selecione Production. Se a coleta estiver desativada, clique em Enable e faça novo deploy. A coleta começa após a ativação e publicação, sem recuperar acessos antigos. Bloqueadores e as regras de identificação da Vercel podem afetar os números; visitantes estimados não equivalem a pessoas únicas com cadastro.

O componente React do pacote @vercel/analytics preserva a compatibilidade com Next.js e Vite/Vinext. A integração é desligada em builds fora da Vercel e não cria rotas de autenticação, banco de presença ou consultas adicionais à API eleitoral. Não há registro do conteúdo de CSV nem das atualizações do histórico local.

O plano Hobby possui franquia de eventos; acompanhe o consumo em Usage. Consulte os limites atualizados em https://vercel.com/docs/analytics/limits-and-pricing .
