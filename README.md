# Na Boca do Povo — Eleições 2026

Painel público de acompanhamento das eleições brasileiras, desenvolvido para a cobertura do programa **Na Boca do Povo**. Reúne resultados e indicadores eleitorais oficiais do Tribunal Superior Eleitoral (TSE), com filtros por localidade, cargo e turno e uma apresentação adaptada a celulares.

**[Acessar o painel](https://na-boca-do-povo-eleicoes.chicodias15.chatgpt.site/)** · **[Resultados oficiais do TSE](https://resultados.tse.jus.br/)**

O painel é independente do TSE e pode ser consultado sem cadastro, login ou senha.

## Recursos

- Apuração presidencial nacional e resultados por estado e município.
- Seleção de primeiro e segundo turno, conforme disponibilidade dos arquivos oficiais.
- Mapa geográfico interativo das 27 unidades da federação, com limites do IBGE.
- Busca de candidatos por nome, número ou partido.
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
.openai/hosting.json         Identificação da publicação Sites
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

