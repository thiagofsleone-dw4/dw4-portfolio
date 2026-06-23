# Prompt para Claude Code — Portfólio Digital DW4 Cenografia

Cole este prompt inteiro no Claude Code para iniciar o projeto.

---

## CONTEXTO

Quero construir um portfólio digital para a DW4 Cenografia — empresa de cenografia com mais de 40 anos de mercado, sediada no Rio de Janeiro, atuando em todo o Brasil. O portfólio será enviado como link em propostas comerciais para gestores de shopping centers (Allos, BR Malls, etc.).

O site institucional da empresa é: https://www.dw4cenografia.com.br
O portfólio deve replicar a experiência da seção "Veja os projetos em detalhes" do site, mas de forma isolada — sem header de navegação institucional, sem seções de "Quem Somos", "Depoimentos" etc. O cliente que receber o link deve ir direto para o portfólio.

**Requisito fundamental:** O dono da empresa precisa conseguir adicionar, editar e excluir projetos (fotos, vídeos, textos) de forma totalmente visual, sem tocar em código. Para isso, integrar o **Decap CMS** (antes conhecido como Netlify CMS) com painel admin acessível em `/admin`.

---

## ESTRUTURA DE ARQUIVOS

```
dw4-portfolio/
├── index.html
├── admin/
│   ├── index.html          ← painel CMS (Decap CMS)
│   └── config.yml          ← configuração do CMS
├── css/
│   └── style.css
├── js/
│   └── main.js
├── content/
│   └── projects/           ← um arquivo .md por projeto (gerenciado pelo CMS)
├── images/                 ← imagens enviadas pelo painel admin
└── README.md
```

---

## DECAP CMS — PAINEL ADMIN

### admin/index.html
```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>DW4 Cenografia — Admin</title>
</head>
<body>
  <script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script>
</body>
</html>
```

### admin/config.yml
Configurar com os seguintes campos para cada projeto:

```yaml
backend:
  name: git-gateway
  branch: main

media_folder: "images"
public_folder: "/images"

collections:
  - name: "projects"
    label: "Projetos"
    folder: "content/projects"
    create: true
    delete: true
    slug: "{{slug}}"
    fields:
      - { label: "Nome do Projeto", name: "title", widget: "string" }
      - label: "Categorias"
        name: "categories"
        widget: "select"
        multiple: true
        options:
          - "Licenciados"
          - "Natal"
          - "Televisão"
          - "Parques Temáticos"
          - "Tematizações em Shopping Center"
          - "Restauração"
          - "Congressos e Feiras"
      - { label: "Descrição", name: "description", widget: "text" }
      - { label: "Imagem de Capa", name: "cover", widget: "image" }
      - { label: "Link do YouTube (embed)", name: "youtube", widget: "string", required: false, hint: "Ex: https://www.youtube.com/embed/XXXXXXXXXXX" }
      - label: "Galeria de Fotos"
        name: "gallery"
        widget: "list"
        field:
          label: "Foto"
          name: "image"
          widget: "image"
      - { label: "Ordem de exibição", name: "order", widget: "number", default: 99 }
      - { label: "Publicado", name: "published", widget: "boolean", default: true }
```

### Como o admin funciona na prática:
- Thiago acessa `https://dw4cenografia.netlify.app/admin`
- Faz login com a conta GitHub (configurado via Netlify Identity)
- Vê a lista de projetos e pode: criar novo, editar existente, excluir
- Ao criar/editar: preenche nome, seleciona categorias (checkboxes), escreve descrição, faz upload da capa, cola link do YouTube, faz upload das fotos da galeria
- Ao salvar, o Decap CMS faz commit automático no GitHub e o Netlify republica o site em ~30 segundos
- Campo "Publicado" permite ocultar um projeto sem excluir

---

## IDENTIDADE VISUAL

Seguir exatamente as cores do site atual:
- **Fundo principal:** preto (#000000) ou muito próximo (#0a0a0a)
- **Cor de destaque / dourado:** #c9a84c ou similar (tom dourado/âmbar que o site usa em bordas e títulos)
- **Texto principal:** branco (#ffffff)
- **Texto secundário:** cinza claro (#cccccc)
- **Cards:** fundo levemente mais claro que o fundo (#111111 ou #1a1a1a), com borda sutil dourada ao hover
- **Botões de filtro ativos:** dourado com texto preto
- **Botões de filtro inativos:** borda dourada com texto dourado, fundo transparente

**Tipografia:**
- Usar Google Fonts: `Montserrat` para títulos e `Open Sans` para textos corridos (mesma família visual do site)

**Logo:**
- Buscar a logo do site via: `https://dw4cenografia.com.br/wp-content/uploads/2024/02/dw4-cenografia-footer.png`
- Exibir no topo da página, centralizada ou à esquerda, com tamanho moderado (máx 160px de largura)
- Se a logo não carregar, exibir o texto "DW4 Cenografia" estilizado

---

## SEÇÕES DA PÁGINA

### 1. Header mínimo
- Logo da DW4 à esquerda
- Tagline à direita ou abaixo: *"Transformamos ideias e sonhos em cenários e experiências inesquecíveis"*
- Sem menu de navegação

### 2. Barra de filtros
Botões de filtro horizontal (com scroll em mobile):
- Todos
- Licenciados
- Natal
- Televisão
- Parques Temáticos
- Tematizações em Shopping Center
- Restauração
- Congressos e Feiras

Ao clicar em um filtro, os cards se filtram com animação suave (fade + reflow). O filtro "Todos" começa ativo.

### 3. Grid de cards de projetos
- Layout em grid responsivo: 3 colunas no desktop, 2 no tablet, 1 no mobile
- Cada card tem:
  - Imagem de capa — proporção 4:3 ou 16:9, com object-fit: cover
  - Overlay escuro com o nome do projeto ao hover
  - Badge(s) de categoria no canto inferior esquerdo
  - Ao clicar, abre modal de detalhe do projeto
- Projetos com `published: false` não aparecem no grid

### 4. Modal de detalhe do projeto
Ao clicar em um card, abre um modal fullscreen (ou muito grande) com:
- Título do projeto
- Vídeo do YouTube em destaque (embed responsivo, no topo) — somente se `youtube` não for nulo
- Descrição curta do projeto
- Galeria de fotos em grid (3 colunas, clicável para lightbox)
- Botão de fechar (X) no canto superior direito
- Navegação entre projetos (seta anterior / próximo)

### 5. Lightbox de fotos
Ao clicar em uma foto da galeria dentro do modal:
- Foto abre em tela cheia
- Navegação com setas (anterior/próximo dentro da galeria do projeto)
- Fechar com ESC ou clique fora

### 6. Rodapé com CTA
- Texto: "Quer levar uma experiência dessas para o seu shopping?"
- Botão WhatsApp: abre `https://api.whatsapp.com/send/?phone=5521964948913` em nova aba
- Botão E-mail: abre `mailto:contato@dw4cenografia.com.br`
- Estilo dos botões: WhatsApp em verde (#25D366), E-mail em dourado (#c9a84c)
- Copyright: "© 2026 DW4 Cenografia — Todos os direitos reservados"

---

## LEITURA DOS DADOS (JS)

O `main.js` deve ler os arquivos `.md` da pasta `content/projects/` e renderizar os cards. Como é um site estático (sem servidor), usar uma das seguintes abordagens:

**Abordagem recomendada:** Gerar um `content/projects.json` automaticamente a partir dos arquivos `.md` usando um script de build simples (pode ser um script Node.js `build.js` na raiz que lê os `.md` com `gray-matter` e gera o JSON). O Netlify roda esse script antes de publicar.

Adicionar no `package.json`:
```json
{
  "scripts": {
    "build": "node build.js"
  },
  "dependencies": {
    "gray-matter": "^4.0.3"
  }
}
```

No Netlify, configurar:
- Build command: `npm run build`
- Publish directory: `.` (raiz do projeto)

---

## PROJETOS INICIAIS

Para cada projeto abaixo, faça fetch das páginas de case no site `dw4cenografia.com.br`, extraia as URLs de imagens e vídeos do YouTube, e crie os arquivos `.md` correspondentes em `content/projects/`.

1. **Sonic Adventure Park** — Licenciados, Parques Temáticos — `https://dw4cenografia.com.br/case/sonic-adventure-park/`
2. **Sonic Mountain Park** — Licenciados, Parques Temáticos — `https://dw4cenografia.com.br/case/sonic-mountain-park/`
3. **Mini Golf do Sonic** — Licenciados, Parques Temáticos — `https://dw4cenografia.com.br/case/mini-golf-do-sonic/`
4. **Natal Sonic Adventure** — Licenciados, Natal — `https://dw4cenografia.com.br/case/natal-sonic-adventure/`
5. **Natal Sonic Mountain Park** — Licenciados, Natal — `https://dw4cenografia.com.br/case/natal-sonic-mountain-park/`
6. **Natal Mini Golfe do Sonic** — Licenciados, Natal — `https://dw4cenografia.com.br/case/natal-mini-golfe-do-sonic/`
7. **Floresta Encantada do Papai Noel** — Natal — `https://dw4cenografia.com.br/case/floresta-encantada-do-papai-noel/`
8. **Natal dos Ursos Polares** — Natal — `https://dw4cenografia.com.br/case/natal-dos-ursos-polares/`
9. **Vila do Papai Noel** — Natal — `https://dw4cenografia.com.br/case/vila-do-papai-noel/`
10. **Natal na Fazenda** — Natal — `https://dw4cenografia.com.br/case/natal-na-fazenda/`
11. **Natal Parque dos Ursos Polares** — Natal — `https://dw4cenografia.com.br/case/natal-parque-dos-ursos-polares/`
12. **Natal a Bordo** — Natal — `https://dw4cenografia.com.br/case/natal-a-bordo/`
13. **Angry Birds Christmas Park** — Licenciados, Natal — criar arquivo `.md` com `published: false` e campos em branco (será preenchido pelo admin posteriormente)
14. **Rede Globo** — Televisão — `https://dw4cenografia.com.br/case/rede-globo/`
15. **Barra World Shopping & Park** — Tematizações em Shopping Center — `https://dw4cenografia.com.br/case/barra-world-shopping-park/`
16. **Terra Encantada** — Parques Temáticos — `https://dw4cenografia.com.br/case/terra-encantada/`
17. **Game Works** — Parques Temáticos — `https://dw4cenografia.com.br/case/game-works/`
18. **Rua do Rio — Shopping Nova América** — Tematizações em Shopping Center — `https://dw4cenografia.com.br/case/rua-do-rio-shopping-nova-america/`
19. **Copacabana Palace** — Restauração — `https://dw4cenografia.com.br/case/copacabana-palace/`
20. **Unimed** — Congressos e Feiras — `https://dw4cenografia.com.br/case/unimed/`

---

## COMPORTAMENTO E UX

- Lazy loading nas imagens do grid e da galeria
- Animação de fade-in nos cards ao carregar
- Transição suave nos filtros (não piscar — usar CSS transition)
- Modal fecha ao clicar fora dele ou pressionar ESC
- Mobile-first e totalmente responsivo

---

## HOSPEDAGEM E SETUP DO ADMIN (instruções para depois de construir)

### 1. GitHub
- Criar repositório público ou privado no GitHub
- Fazer push do projeto

### 2. Netlify
- Conectar o repositório ao Netlify
- Configurar: Build command `npm run build`, Publish directory `.`
- Personalizar o subdomínio gratuito: `dw4cenografia.netlify.app`
- SSL automático pelo Netlify

### 3. Netlify Identity (para o painel admin)
- No painel do Netlify → Identity → Enable Identity
- Em Registration: mudar para "Invite only" (só Thiago terá acesso)
- Em Git Gateway: Enable Git Gateway
- Convidar o e-mail de Thiago como usuário admin
- Thiago recebe e-mail, cria senha, e a partir daí acessa `https://dw4cenografia.netlify.app/admin` com login e senha

### 4. Fluxo de atualização do site (sem código)
1. Thiago acessa `/admin` e faz login
2. Clica em "Projetos" → "Novo Projeto" (ou edita um existente)
3. Preenche os campos visuais, faz upload das fotos
4. Clica em "Publicar"
5. O Decap CMS faz commit no GitHub automaticamente
6. O Netlify detecta o commit e republica o site em ~30 segundos
7. O portfólio público já está atualizado

Me guia por cada um desses passos ao final da construção.

---

## ORDEM DE EXECUÇÃO

1. Fazer fetch de todas as páginas de case para extrair dados
2. Criar os arquivos `.md` em `content/projects/`
3. Criar o `build.js` que gera `content/projects.json` a partir dos `.md`
4. Construir `index.html` + `css/style.css` com identidade visual
5. Construir `js/main.js` com filtros, modal e lightbox
6. Configurar `admin/index.html` e `admin/config.yml`
7. Testar localmente (rodar `npm run build` e abrir o `index.html`)
8. Mostrar estrutura final de arquivos e aguardar aprovação antes do deploy
