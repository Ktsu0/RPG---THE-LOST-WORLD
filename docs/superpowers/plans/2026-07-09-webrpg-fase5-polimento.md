# WebRPG — Fase 5 (Polimento) — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polir a experiência do WebRPG ao padrão de referência da spec (Knights of Pen & Paper): som e música, transições entre telas, tela de vitória/derrota de tela cheia, configurações (volume, exportar/importar save), responsividade mobile e uma revisão final tela a tela — fechando o critério de pronto: "Cada tela revisada contra o padrão de referência; jogável no celular".

**Architecture:** Diferente das Fases 2-4, esta fase não porta lógica de jogo do `JogoRPG/` — é trabalho de UX/UI nativo da web. `WebRPG/src/audio/` é a única camada nova de sistema (tocador de efeitos e música, agnóstico de asset — funciona silenciosamente mesmo sem os arquivos de som ainda baixados, ver `WebRPG/assets/CREDITS.md`). O resto é extensão das telas já existentes (roteador ganha transição de fade, `controladorBatalha` ganha overlay de vitória/derrota, CSS ganha media queries).

**Tech Stack:** Mesmo stack das fases anteriores. Nenhuma dependência nova (som via `HTMLAudioElement` nativo, sem biblioteca).

## Global Constraints

- Todo texto de UI em português.
- Nenhum asset de áudio/imagem via hotlink — mesmo que os arquivos de som ainda não estejam baixados (ver `WebRPG/assets/CREDITS.md`), os caminhos apontam para `WebRPG/assets/audio/` local.
- `engine/` nunca importa de `JogoRPG/` nem de `WebRPG/` (não há mudanças em `engine/` nesta fase — todo o trabalho é em `WebRPG/src/`).
- `JogoRPG/` (console) não é modificado.

## Decisões documentadas

1. **Tocador de som tolera arquivos ausentes.** Os efeitos sonoros (golpe, crítico, moeda, level up) e músicas ainda não foram baixados (checklist pendente em `CREDITS.md`, itens "Sons" — "Necessário apenas a partir da Fase 5", ou seja, agora). O `WebRPG/src/audio/tocador.js` desta fase é escrito para funcionar (sem lançar erro) mesmo que o arquivo `.mp3`/`.ogg` correspondente ainda não exista no disco — `HTMLAudioElement.play()` rejeita a Promise silenciosamente em caso de 404, e o código trata isso com `.catch(() => {})`. Assim que os arquivos forem baixados (tarefa de conteúdo, não desta fase), o som passa a tocar sem nenhuma mudança de código.
2. **Onboarding é um tooltip único na primeira visita à cidade**, não um tutorial passo-a-passo interativo completo (spec seção 6 não detalha o formato) — decisão de escopo mínimo viável, com um `localStorage` flag para não repetir.

---

## Task 1: Tocador de efeitos sonoros — `WebRPG/src/audio/tocador.js` (TDD)

**Files:**
- Create: `WebRPG/src/audio/tocador.js`
- Test: `WebRPG/src/audio/tocador.test.js`

**Interfaces:**
- Produces: `tocarEfeito(nome)` (`nome` é `'golpe'|'critico'|'moeda'|'level_up'|'vitoria'|'derrota'`, toca `WebRPG/assets/audio/efeitos/<nome>.mp3` em volume controlado por `obterVolumeEfeitos()`), `definirVolumeEfeitos(valor)` (`0`-`1`, persiste em `localStorage`), `obterVolumeEfeitos() -> number` (default `0.6`) — usado pela Task 3 (integração com eventos de combate) e pela Task 4 (tela de configurações).

- [ ] **Step 1: Escrever o teste `WebRPG/src/audio/tocador.test.js`**

```js
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { tocarEfeito, definirVolumeEfeitos, obterVolumeEfeitos } from "./tocador.js";

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("obterVolumeEfeitos e definirVolumeEfeitos", () => {
  it("retorna 0.6 por padrão", () => {
    expect(obterVolumeEfeitos()).toBe(0.6);
  });

  it("persiste o volume definido", () => {
    definirVolumeEfeitos(0.2);
    expect(obterVolumeEfeitos()).toBe(0.2);
  });
});

describe("tocarEfeito", () => {
  it("cria um Audio com o caminho e volume corretos, e chama play()", () => {
    const playMock = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(window, "Audio").mockImplementation(function (src) {
      this.src = src;
      this.volume = 1;
      this.play = playMock;
    });
    definirVolumeEfeitos(0.5);

    tocarEfeito("golpe");

    expect(window.Audio).toHaveBeenCalledWith("/assets/audio/efeitos/golpe.mp3");
    expect(playMock).toHaveBeenCalledOnce();
  });

  it("não lança erro quando play() rejeita (arquivo de áudio ainda não existe)", () => {
    vi.spyOn(window, "Audio").mockImplementation(function () {
      this.play = () => Promise.reject(new Error("404"));
    });
    expect(() => tocarEfeito("critico")).not.toThrow();
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- audio/tocador`
Expected: FAIL — `Cannot find module './tocador.js'`.

- [ ] **Step 3: Implementar `WebRPG/src/audio/tocador.js`**

```js
const CHAVE_VOLUME_EFEITOS = "webrpg_volume_efeitos";
const VOLUME_PADRAO = 0.6;

export function obterVolumeEfeitos() {
  const salvo = localStorage.getItem(CHAVE_VOLUME_EFEITOS);
  return salvo === null ? VOLUME_PADRAO : Number(salvo);
}

export function definirVolumeEfeitos(valor) {
  localStorage.setItem(CHAVE_VOLUME_EFEITOS, String(valor));
}

export function tocarEfeito(nome) {
  const audio = new Audio(`/assets/audio/efeitos/${nome}.mp3`);
  audio.volume = obterVolumeEfeitos();
  audio.play().catch(() => {});
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- audio/tocador`
Expected: PASS — 4 testes verdes.

- [ ] **Step 5: Commit**

```bash
git add WebRPG/src/audio/tocador.js WebRPG/src/audio/tocador.test.js
git commit -m "feat: tocador de efeitos sonoros (tolerante a assets ausentes)"
```

---

## Task 2: Música de fundo — `WebRPG/src/audio/musica.js` (TDD)

**Files:**
- Create: `WebRPG/src/audio/musica.js`
- Test: `WebRPG/src/audio/musica.test.js`

**Interfaces:**
- Produces: `tocarMusica(nome)` (`nome` é `'cidade'|'batalha'|'masmorra'|'torre'`, para de tocar a música anterior antes de trocar, toca em loop), `pararMusica()`, `definirVolumeMusica(valor)`, `obterVolumeMusica() -> number` (default `0.4`) — usado pela Task 3 (troca de música ao mudar de tela) e Task 4 (configurações).

- [ ] **Step 1: Escrever o teste `WebRPG/src/audio/musica.test.js`**

```js
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { tocarMusica, pararMusica, definirVolumeMusica, obterVolumeMusica } from "./musica.js";

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  pararMusica();
  vi.restoreAllMocks();
});

describe("obterVolumeMusica e definirVolumeMusica", () => {
  it("retorna 0.4 por padrão", () => {
    expect(obterVolumeMusica()).toBe(0.4);
  });

  it("persiste o volume definido", () => {
    definirVolumeMusica(0.1);
    expect(obterVolumeMusica()).toBe(0.1);
  });
});

describe("tocarMusica e pararMusica", () => {
  it("cria um Audio em loop com o caminho correto e chama play()", () => {
    const playMock = vi.fn().mockResolvedValue(undefined);
    const pauseMock = vi.fn();
    vi.spyOn(window, "Audio").mockImplementation(function (src) {
      this.src = src;
      this.loop = false;
      this.volume = 1;
      this.play = playMock;
      this.pause = pauseMock;
    });

    tocarMusica("cidade");

    expect(window.Audio).toHaveBeenCalledWith("/assets/audio/musica/cidade.mp3");
    expect(playMock).toHaveBeenCalledOnce();
  });

  it("pausa a música anterior ao trocar de faixa", () => {
    const pauseMock = vi.fn();
    vi.spyOn(window, "Audio").mockImplementation(function () {
      this.play = () => Promise.resolve();
      this.pause = pauseMock;
    });

    tocarMusica("cidade");
    tocarMusica("batalha");

    expect(pauseMock).toHaveBeenCalledOnce();
  });

  it("pararMusica pausa a faixa atual", () => {
    const pauseMock = vi.fn();
    vi.spyOn(window, "Audio").mockImplementation(function () {
      this.play = () => Promise.resolve();
      this.pause = pauseMock;
    });

    tocarMusica("cidade");
    pararMusica();

    expect(pauseMock).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- audio/musica`
Expected: FAIL — `Cannot find module './musica.js'`.

- [ ] **Step 3: Implementar `WebRPG/src/audio/musica.js`**

```js
const CHAVE_VOLUME_MUSICA = "webrpg_volume_musica";
const VOLUME_PADRAO = 0.4;

let faixaAtual = null;

export function obterVolumeMusica() {
  const salvo = localStorage.getItem(CHAVE_VOLUME_MUSICA);
  return salvo === null ? VOLUME_PADRAO : Number(salvo);
}

export function definirVolumeMusica(valor) {
  localStorage.setItem(CHAVE_VOLUME_MUSICA, String(valor));
  if (faixaAtual) faixaAtual.volume = valor;
}

export function tocarMusica(nome) {
  if (faixaAtual) faixaAtual.pause();
  faixaAtual = new Audio(`/assets/audio/musica/${nome}.mp3`);
  faixaAtual.loop = true;
  faixaAtual.volume = obterVolumeMusica();
  faixaAtual.play().catch(() => {});
}

export function pararMusica() {
  if (faixaAtual) {
    faixaAtual.pause();
    faixaAtual = null;
  }
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- audio/musica`
Expected: PASS — 5 testes verdes.

- [ ] **Step 5: Commit**

```bash
git add WebRPG/src/audio/musica.js WebRPG/src/audio/musica.test.js
git commit -m "feat: música de fundo por tela (loop, volume persistido)"
```

---

## Task 3: Ligar som aos eventos de combate e navegação — `controladorBatalha.js`, `telaCidade.js`, `main.js` (TDD)

**Files:**
- Modify: `WebRPG/src/telas/batalha/animacoes.js`
- Modify: `WebRPG/src/telas/batalha/animacoes.test.js`
- Modify: `WebRPG/src/main.js`

**Interfaces:**
- `reproduzirEventos` (já existente, Fase 1) passa a chamar `tocarEfeito` para os eventos `dano` (golpe, ou `critico` se `evento.critico`), `vitoria` (`moeda`) — a função de animação já é o único ponto que processa a fila de eventos, então é o lugar natural para acoplar som sem duplicar o `switch` de tipos de evento em outro arquivo.
- `bootstrap` (`main.js`) chama `tocarMusica('cidade')` ao entrar na cidade e `tocarMusica('batalha')` ao entrar em batalha.

- [ ] **Step 1: Adicionar o mock de `tocador.js` e os testes ao topo/final de `WebRPG/src/telas/batalha/animacoes.test.js`**

Adicionar ao topo do arquivo, junto ao mock existente de `sprites.js`:

```js
vi.mock("@audio/tocador.js", () => ({
  tocarEfeito: vi.fn(),
}));
```

E os testes ao final:

```js
describe("reproduzirEventos toca efeitos sonoros", () => {
  it("toca 'golpe' para dano normal e 'critico' para dano crítico", async () => {
    const { tocarEfeito } = await import("@audio/tocador.js");
    const elementos = criarElementosDeTeste();

    await reproduzirEventos([
      { tipo: "dano", autor: "jogador", alvo: "inimigo", valor: 7, critico: false },
    ], elementos);
    expect(tocarEfeito).toHaveBeenCalledWith("golpe");

    tocarEfeito.mockClear();
    await reproduzirEventos([
      { tipo: "dano", autor: "jogador", alvo: "inimigo", valor: 14, critico: true },
    ], elementos);
    expect(tocarEfeito).toHaveBeenCalledWith("critico");
  });

  it("toca 'moeda' ao vencer a batalha", async () => {
    const { tocarEfeito } = await import("@audio/tocador.js");
    const elementos = criarElementosDeTeste();
    await reproduzirEventos([{ tipo: "vitoria", xpGanho: 10, ouroGanho: 5 }], elementos);
    expect(tocarEfeito).toHaveBeenCalledWith("moeda");
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- animacoes`
Expected: FAIL — `tocarEfeito` nunca é chamado.

- [ ] **Step 3: Editar `WebRPG/src/telas/batalha/animacoes.js`**

Adicionar o import no topo e as chamadas dentro do `switch`:

```js
import { tocarEfeito } from "@audio/tocador.js";
```

No `case "dano"`, logo após o `await tocarAnimacao(autorSprite, ...)`:

```js
      case "dano": {
        // ...linhas existentes até mostrarNumeroDano...
        tocarEfeito(evento.critico ? "critico" : "golpe");
        if (evento.critico) tremerPalco(palco);
        await tocarAnimacao(alvoSprite, personagemAlvo, "dano");
        break;
      }
```

No `case "vitoria"` (hoje agrupado com `fuga`/`derrota` num só `case`), separar em seu próprio bloco:

```js
      case "vitoria":
        tocarEfeito("moeda");
        await espera(500);
        break;
      case "fuga":
      case "derrota":
        await espera(500);
        break;
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- animacoes`
Expected: PASS — 5 testes verdes (3 da Fase 1 + 2 novos).

- [ ] **Step 5: Configurar o alias `@audio` em `vite.config.js` e `vitest.config.js`**

Adicionar ao objeto `resolve.alias` de ambos os arquivos (junto ao `@engine` já existente):

```js
"@audio": fileURLToPath(new URL("./WebRPG/src/audio", import.meta.url)),
```

- [ ] **Step 6: Ligar a música de fundo em `WebRPG/src/main.js`**

Adicionar o import:

```js
import { tocarMusica } from "@audio/musica.js";
```

E, dentro de `irParaCidade` e `irParaBatalhaDeTreino`, chamar `tocarMusica` no início de cada função:

```js
  function irParaCidade(jogador) {
    tocarMusica("cidade");
    registrarTela("cidade", (el) =>
      // ...resto inalterado...
```

```js
  function irParaBatalhaDeTreino(jogador) {
    tocarMusica("batalha");
    registrarTela("batalha", (el) =>
      // ...resto inalterado...
```

- [ ] **Step 7: Rodar a suíte completa**

Run: `npm run test`
Expected: PASS — nenhuma regressão.

- [ ] **Step 8: Commit**

```bash
git add WebRPG/src/telas/batalha/animacoes.js WebRPG/src/telas/batalha/animacoes.test.js vite.config.js vitest.config.js WebRPG/src/main.js
git commit -m "feat: liga efeitos sonoros aos eventos de combate e música de fundo por tela"
```

---

## Task 4: Tela de configurações — `telaConfiguracoes.js` (TDD)

**Files:**
- Create: `WebRPG/src/telas/configuracao/telaConfiguracoes.js`
- Test: `WebRPG/src/telas/configuracao/telaConfiguracoes.test.js`
- Create: `WebRPG/src/estilos/configuracao.css`
- Modify: `WebRPG/src/telas/cidade/telaCidade.js`
- Modify: `WebRPG/src/telas/cidade/telaCidade.test.js`
- Modify: `WebRPG/src/main.js`

**Interfaces:**
- Consumes: `obterVolumeEfeitos`, `definirVolumeEfeitos` (`@audio/tocador.js`, Task 1), `obterVolumeMusica`, `definirVolumeMusica` (`@audio/musica.js`, Task 2), `exportarSave`, `importarSave` (`WebRPG/src/armazenamento/localStorage.js`, Fase 2).
- Produces: `montarTelaConfiguracoes(container, { jogador, aoSair }) -> elementos` — registrado no roteador como `'configuracao'`, acessível a partir de um novo botão "⚙️ Config" na cidade.

- [ ] **Step 1: Escrever o teste `WebRPG/src/telas/configuracao/telaConfiguracoes.test.js`**

```js
import { describe, it, expect, vi, beforeEach } from "vitest";
import { montarTelaConfiguracoes } from "./telaConfiguracoes.js";

beforeEach(() => {
  localStorage.clear();
});

function jogadorDeTeste() {
  return { nome: "Thorin" };
}

describe("montarTelaConfiguracoes", () => {
  it("mostra os sliders de volume com os valores atuais", () => {
    const container = document.createElement("div");
    montarTelaConfiguracoes(container, { jogador: jogadorDeTeste(), aoSair: vi.fn() });
    expect(container.querySelector('[data-volume="efeitos"]').value).toBe("0.6");
    expect(container.querySelector('[data-volume="musica"]').value).toBe("0.4");
  });

  it("atualiza o volume de efeitos ao mover o slider", () => {
    const container = document.createElement("div");
    montarTelaConfiguracoes(container, { jogador: jogadorDeTeste(), aoSair: vi.fn() });
    const slider = container.querySelector('[data-volume="efeitos"]');
    slider.value = "0.1";
    slider.dispatchEvent(new Event("input"));
    expect(localStorage.getItem("webrpg_volume_efeitos")).toBe("0.1");
  });

  it("exportarSave é acionado ao clicar em Exportar Save", () => {
    const cliqueMock = vi.fn();
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(cliqueMock);

    const container = document.createElement("div");
    montarTelaConfiguracoes(container, { jogador: jogadorDeTeste(), aoSair: vi.fn() });
    container.querySelector("#botao-exportar-save").click();

    expect(cliqueMock).toHaveBeenCalledOnce();
  });

  it("chama aoSair ao clicar em Voltar", () => {
    const aoSair = vi.fn();
    const container = document.createElement("div");
    const elementos = montarTelaConfiguracoes(container, { jogador: jogadorDeTeste(), aoSair });
    elementos.botaoSair.click();
    expect(aoSair).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- telaConfiguracoes`
Expected: FAIL — `Cannot find module './telaConfiguracoes.js'`.

- [ ] **Step 3: Implementar `WebRPG/src/telas/configuracao/telaConfiguracoes.js`**

```js
import { obterVolumeEfeitos, definirVolumeEfeitos } from "@audio/tocador.js";
import { obterVolumeMusica, definirVolumeMusica } from "@audio/musica.js";
import { exportarSave } from "../../armazenamento/localStorage.js";

export function montarTelaConfiguracoes(container, { jogador, aoSair }) {
  container.innerHTML = `
    <div class="tela-configuracao">
      <div class="painel">
        <label>Volume dos Efeitos</label>
        <input type="range" min="0" max="1" step="0.1" data-volume="efeitos" value="${obterVolumeEfeitos()}" />
        <label>Volume da Música</label>
        <input type="range" min="0" max="1" step="0.1" data-volume="musica" value="${obterVolumeMusica()}" />
      </div>
      <div class="painel">
        <button class="botao" id="botao-exportar-save">Exportar Save</button>
      </div>
      <button class="botao botao--destaque" id="botao-sair-configuracao">Voltar</button>
    </div>
  `;

  container.querySelector('[data-volume="efeitos"]').addEventListener("input", (evento) => {
    definirVolumeEfeitos(Number(evento.target.value));
  });

  container.querySelector('[data-volume="musica"]').addEventListener("input", (evento) => {
    definirVolumeMusica(Number(evento.target.value));
  });

  container.querySelector("#botao-exportar-save").addEventListener("click", () => {
    exportarSave(jogador);
  });

  const botaoSair = container.querySelector("#botao-sair-configuracao");
  botaoSair.addEventListener("click", () => aoSair());

  return { botaoSair };
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- telaConfiguracoes`
Expected: PASS — 4 testes verdes.

- [ ] **Step 5: Criar `WebRPG/src/estilos/configuracao.css`**

```css
.tela-configuracao {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-md);
  padding: var(--espaco-lg);
  max-width: 500px;
  margin: 0 auto;
}

.tela-configuracao input[type="range"] {
  width: 100%;
}
```

- [ ] **Step 6: Adicionar o botão "Config" na cidade**

Em `WebRPG/src/telas/cidade/telaCidade.js`, adicionar um botão na grade de locais e o parâmetro `aoAbrirConfiguracao` na assinatura de `montarTelaCidade`:

```js
        <button class="botao local-cidade" data-local="configuracao">⚙️ Configurações</button>
```

```js
  container.querySelector('[data-local="configuracao"]').addEventListener("click", () => aoAbrirConfiguracao());
```

Adicionar o teste correspondente em `telaCidade.test.js` (seguindo o mesmo padrão dos testes de clique já existentes para `guilda`/`loja`/`torre`).

- [ ] **Step 7: Ligar em `WebRPG/src/main.js`**

```js
import { montarTelaConfiguracoes } from "./telas/configuracao/telaConfiguracoes.js";
import "./estilos/configuracao.css";
```

Dentro de `irParaCidade`, adicionar o callback `aoAbrirConfiguracao` seguindo o mesmo padrão de `aoAbrirPersonagem`:

```js
        aoAbrirConfiguracao: () => {
          registrarTela("configuracao", (el2) =>
            montarTelaConfiguracoes(el2, { jogador, aoSair: () => irParaCidade(jogador) })
          );
          mostrarTela("configuracao");
        },
```

- [ ] **Step 8: Rodar a suíte completa**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add WebRPG/src/telas/configuracao WebRPG/src/estilos/configuracao.css WebRPG/src/telas/cidade WebRPG/src/main.js
git commit -m "feat: tela de configurações (volume, exportar save)"
```

---

## Task 5: Transição de fade entre telas — `roteador.js` (TDD)

**Files:**
- Modify: `WebRPG/src/rotas/roteador.js`
- Modify: `WebRPG/src/rotas/roteador.test.js`
- Modify: `WebRPG/src/estilos/base.css`

**Interfaces:**
- `mostrarTela` (já existente) passa a aplicar a classe `tela--saindo` no conteúdo atual, aguardar a duração da transição CSS, e só então montar a nova tela com a classe `tela--entrando` (removida no próximo frame para disparar a animação de entrada).

- [ ] **Step 1: Adicionar os testes ao final de `WebRPG/src/rotas/roteador.test.js`**

```js
describe("transição de fade", () => {
  it("aplica e remove a classe tela--entrando na tela recém-montada", async () => {
    registrarTela("a", (el) => { el.innerHTML = "<p>A</p>"; });
    await mostrarTela("a");
    // logo após montar, a classe de entrada é removida no próximo frame (via rAF/microtask)
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(container.querySelector("p").parentElement.classList.contains("tela--entrando")).toBe(false);
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- roteador`
Expected: FAIL — `mostrarTela` ainda não retorna uma Promise nem aplica classes de transição (o teste falha porque `container.querySelector("p").parentElement` não tem a estrutura esperada, já que a versão atual não envolve o conteúdo num wrapper).

- [ ] **Step 3: Editar `WebRPG/src/rotas/roteador.js`**

```js
const telas = new Map();
let telaAtual = null;
let elementoContainer = null;

export function inicializarRoteador(container) {
  elementoContainer = container;
  telas.clear();
  telaAtual = null;
}

export function registrarTela(nome, montar) {
  telas.set(nome, montar);
}

export async function mostrarTela(nome, props = {}) {
  if (!telas.has(nome)) {
    throw new Error(`Tela "${nome}" não foi registrada.`);
  }
  if (!elementoContainer) {
    throw new Error(
      "Roteador não foi inicializado. Chame inicializarRoteador primeiro."
    );
  }

  elementoContainer.innerHTML = "";
  const wrapper = document.createElement("div");
  wrapper.className = "tela-wrapper tela--entrando";
  elementoContainer.appendChild(wrapper);

  const montar = telas.get(nome);
  montar(wrapper, props);
  telaAtual = nome;

  requestAnimationFrame(() => {
    wrapper.classList.remove("tela--entrando");
  });
}

export function telaAtualNome() {
  return telaAtual;
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- roteador`
Expected: PASS — 6 testes verdes (5 da Fase 0 + 1 novo). Nota: como `mostrarTela` agora é `async`, os 5 testes originais da Fase 0 continuam passando sem alteração porque `container.querySelector(...)` funciona de forma síncrona logo após a chamada (a montagem em si continua síncrona; só a remoção da classe de transição é assíncrona via `requestAnimationFrame`).

- [ ] **Step 5: Adicionar a transição CSS em `WebRPG/src/estilos/base.css`**

```css
.tela-wrapper {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  opacity: 1;
  transition: opacity 0.2s ease;
}

.tela--entrando {
  opacity: 0;
}
```

- [ ] **Step 6: Rodar a suíte completa (checar chamadores de `mostrarTela` que não usam `await`)**

Run: `npm run test`
Expected: PASS — `mostrarTela` sempre foi chamada de forma "fire and forget" (sem `await`) em todos os chamadores de `main.js`; tornar a função `async` não quebra nenhum deles porque nenhum depende do retorno.

- [ ] **Step 7: Commit**

```bash
git add WebRPG/src/rotas/roteador.js WebRPG/src/rotas/roteador.test.js WebRPG/src/estilos/base.css
git commit -m "feat: transição de fade entre telas"
```

---

## Task 6: Tela cheia de vitória/derrota — `telaBatalha.js` + `controladorBatalha.js` (TDD)

**Files:**
- Modify: `WebRPG/src/telas/batalha/telaBatalha.js`
- Modify: `WebRPG/src/telas/batalha/telaBatalha.test.js`
- Modify: `WebRPG/src/telas/batalha/controladorBatalha.js`
- Modify: `WebRPG/src/telas/batalha/controladorBatalha.test.js`
- Modify: `WebRPG/src/estilos/batalha.css`

**Interfaces:**
- Produces (adicionado a `montarTelaBatalha`): `elementos.overlayFim` (painel de tela cheia, oculto por padrão) e `mostrarOverlayFim(elementos, { tipo: 'vitoria'|'derrota', xpGanho?, ouroGanho? })` — chamado por `controladorBatalha.js` quando `resultado.fim` é `'vitoria'` ou `'derrota'` (a mensagem de log continua existindo, mas some visualmente atrás do overlay).

- [ ] **Step 1: Adicionar o teste ao final de `WebRPG/src/telas/batalha/telaBatalha.test.js`**

```js
describe("mostrarOverlayFim", () => {
  it("exibe o overlay de vitória com xp/ouro", () => {
    const container = document.createElement("div");
    const { jogador, inimigo } = criarFixtures();
    const elementos = montarTelaBatalha(container, { jogador, inimigo });

    mostrarOverlayFim(elementos, { tipo: "vitoria", xpGanho: 15, ouroGanho: 20 });

    expect(elementos.overlayFim.classList.contains("overlay-fim--oculto")).toBe(false);
    expect(elementos.overlayFim.textContent).toContain("Vitória");
    expect(elementos.overlayFim.textContent).toContain("15");
    expect(elementos.overlayFim.textContent).toContain("20");
  });

  it("exibe o overlay de derrota", () => {
    const container = document.createElement("div");
    const { jogador, inimigo } = criarFixtures();
    const elementos = montarTelaBatalha(container, { jogador, inimigo });

    mostrarOverlayFim(elementos, { tipo: "derrota" });

    expect(elementos.overlayFim.textContent).toContain("Derrota");
  });
});
```

Ajustar o import no topo do arquivo de teste para incluir `mostrarOverlayFim`.

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- telaBatalha`
Expected: FAIL — `mostrarOverlayFim is not a function`.

- [ ] **Step 3: Editar `WebRPG/src/telas/batalha/telaBatalha.js`**

Adicionar o overlay ao HTML de `montarTelaBatalha` (dentro de `.tela-batalha`, como último filho) e ao objeto `elementos`:

```js
      <div class="overlay-fim overlay-fim--oculto"></div>
```

```js
    overlayFim: container.querySelector(".overlay-fim"),
```

E a nova função exportada ao final do arquivo:

```js
export function mostrarOverlayFim(elementos, { tipo, xpGanho, ouroGanho }) {
  const titulo = tipo === "vitoria" ? "Vitória!" : "Derrota...";
  const detalhe = tipo === "vitoria" ? `+${xpGanho} XP, +${ouroGanho} ouro` : "Tente novamente.";
  elementos.overlayFim.innerHTML = `
    <h1 class="texto-pixel">${titulo}</h1>
    <p>${detalhe}</p>
  `;
  elementos.overlayFim.classList.remove("overlay-fim--oculto");
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- telaBatalha`
Expected: PASS — 8 testes verdes (6 da Fase 1 + 2 novos).

- [ ] **Step 5: Adicionar o teste em `WebRPG/src/telas/batalha/controladorBatalha.test.js`**

```js
it("mostra o overlay de fim quando a batalha termina em vitória", async () => {
  const container = document.createElement("div");
  const { jogador, inimigo } = criarFixtures();
  const elementos = iniciarBatalha(container, jogador, inimigo);

  await elementos.executarAcao("atacar");

  expect(elementos.overlayFim.classList.contains("overlay-fim--oculto")).toBe(false);
});
```

(Reusa o mock de `executarAcaoJogador` já existente no arquivo, que retorna `fim: null` — ajustar esse teste específico para usar um mock local com `fim: "vitoria"` seguindo o padrão já usado em outro teste do mesmo arquivo, ou mover este teste para perto do describe que já tem o mock de vitória, se a Fase 2 já tiver introduzido um.)

- [ ] **Step 6: Rodar e confirmar falha, depois editar `WebRPG/src/telas/batalha/controladorBatalha.js`**

Run: `npm run test -- controladorBatalha`
Expected: FAIL.

Importar `mostrarOverlayFim` e chamá-la dentro de `executar`, logo após o bloco de log:

```js
import { montarTelaBatalha, atualizarBarras, registrarNoLog, mostrarOverlayFim } from "./telaBatalha.js";
```

```js
    processando = false;
    if (!resultado.fim) {
      elementos.botaoAtacar.disabled = false;
      elementos.botaoFugir.disabled = false;
    } else {
      if (resultado.fim === "vitoria" || resultado.fim === "derrota") {
        const ultimoEventoVitoria = resultado.eventos.find((e) => e.tipo === "vitoria");
        mostrarOverlayFim(elementos, {
          tipo: resultado.fim,
          xpGanho: ultimoEventoVitoria?.xpGanho,
          ouroGanho: ultimoEventoVitoria?.ouroGanho,
        });
      }
      if (onFim) onFim(resultado.fim, estado);
    }
```

- [ ] **Step 7: Rodar e confirmar sucesso**

Run: `npm run test -- controladorBatalha`
Expected: PASS.

- [ ] **Step 8: Adicionar o CSS do overlay em `WebRPG/src/estilos/batalha.css`**

```css
.overlay-fim {
  position: absolute;
  inset: 0;
  background: rgba(20, 18, 26, 0.92);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--espaco-md);
  text-align: center;
  z-index: 10;
}

.overlay-fim--oculto {
  display: none;
}
```

- [ ] **Step 9: Rodar a suíte completa**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 10: Commit**

```bash
git add WebRPG/src/telas/batalha/telaBatalha.js WebRPG/src/telas/batalha/telaBatalha.test.js WebRPG/src/telas/batalha/controladorBatalha.js WebRPG/src/telas/batalha/controladorBatalha.test.js WebRPG/src/estilos/batalha.css
git commit -m "feat: overlay de tela cheia para vitória e derrota"
```

---

## Task 7: Responsividade mobile — CSS (sem TDD, verificação visual)

**Files:**
- Modify: `WebRPG/src/estilos/base.css`
- Modify: `WebRPG/src/estilos/paineis.css`
- Modify: `WebRPG/src/estilos/batalha.css`
- Modify: `WebRPG/src/estilos/cidade.css`
- Modify: `WebRPG/src/estilos/criacao.css`
- Modify: `WebRPG/src/estilos/loja.css`
- Modify: `WebRPG/src/estilos/personagem.css`
- Modify: `WebRPG/src/estilos/masmorra.css`

**Interfaces:**
- Nenhuma interface JS nova — só media queries. Esta task não usa TDD (CSS de layout não é testável de forma significativa em jsdom, que não calcula layout real); a verificação é visual, feita no Step final com DevTools do navegador em modo responsivo.

- [ ] **Step 1: Adicionar um breakpoint mobile compartilhado em `WebRPG/src/estilos/base.css`**

```css
:root {
  --largura-mobile: 480px;
}
```

- [ ] **Step 2: Adicionar media queries a cada grid/flex de largura fixa**

Em `WebRPG/src/estilos/cidade.css`, `criacao.css`, `loja.css`, `personagem.css` (todos usam `grid-template-columns: 1fr 1fr` ou `max-width` fixo), adicionar ao final de cada arquivo:

```css
@media (max-width: 480px) {
  .grade-locais,
  .tela-criacao {
    grid-template-columns: 1fr;
  }
}
```

Em `WebRPG/src/estilos/batalha.css`, reduzir a escala do sprite e o tamanho da barra de ações em telas pequenas:

```css
@media (max-width: 480px) {
  .sprite {
    transform: scale(1.6);
  }
  .barra-acoes {
    flex-wrap: wrap;
  }
}
```

Em `WebRPG/src/estilos/masmorra.css`, reduzir a fonte da grade:

```css
@media (max-width: 480px) {
  .celula-masmorra {
    font-size: 8px;
  }
}
```

Em `WebRPG/src/estilos/paineis.css`, garantir que botões tenham alvo de toque mínimo de 44px (diretriz de acessibilidade mobile):

```css
@media (max-width: 480px) {
  .botao {
    min-height: 44px;
  }
}
```

- [ ] **Step 3: Verificação manual (DevTools modo responsivo)**

Run: `npm run dev`

No navegador, abrir o DevTools, ativar o modo de dispositivo móvel (ex. iPhone SE, 375px de largura), e navegar por: tela inicial → criação → cidade → batalha → loja → personagem → masmorra → torre → arena. Confirmar que:
1. Nenhum elemento vaza horizontalmente (sem scroll lateral).
2. Botões são clicáveis com o dedo (não espremidos).
3. Texto permanece legível (não corta).

- [ ] **Step 4: Commit**

```bash
git add WebRPG/src/estilos
git commit -m "feat: responsividade mobile (media queries em todas as telas)"
```

---

## Task 8: Onboarding — dica única na primeira visita à cidade (TDD)

**Files:**
- Modify: `WebRPG/src/telas/cidade/telaCidade.js`
- Modify: `WebRPG/src/telas/cidade/telaCidade.test.js`
- Modify: `WebRPG/src/estilos/cidade.css`

**Interfaces:**
- `montarTelaCidade` passa a mostrar um painel de dica ("Bem-vindo a The Lost World! Clique em Explorar para sua primeira batalha, ou visite a Guilda para aceitar uma missão.") na primeira vez que a cidade é montada nesta máquina, com um botão "Entendi" que grava `localStorage.setItem('webrpg_onboarding_visto', '1')` e nunca mais mostra a dica.

- [ ] **Step 1: Adicionar os testes ao final de `WebRPG/src/telas/cidade/telaCidade.test.js`**

```js
describe("onboarding", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("mostra a dica de boas-vindas na primeira visita", () => {
    const container = document.createElement("div");
    montarTelaCidade(container, {
      jogador: jogadorDeTeste(), aoExplorar: vi.fn(), aoAbrirGuilda: vi.fn(), aoAbrirLoja: vi.fn(),
      aoAbrirPersonagem: vi.fn(), aoAbrirTorre: vi.fn(), aoAbrirMasmorra: vi.fn(), aoAbrirArena: vi.fn(),
      aoAbrirConfiguracao: vi.fn(),
    });
    expect(container.querySelector(".dica-onboarding")).not.toBeNull();
  });

  it("não mostra a dica depois de confirmada", () => {
    localStorage.setItem("webrpg_onboarding_visto", "1");
    const container = document.createElement("div");
    montarTelaCidade(container, {
      jogador: jogadorDeTeste(), aoExplorar: vi.fn(), aoAbrirGuilda: vi.fn(), aoAbrirLoja: vi.fn(),
      aoAbrirPersonagem: vi.fn(), aoAbrirTorre: vi.fn(), aoAbrirMasmorra: vi.fn(), aoAbrirArena: vi.fn(),
      aoAbrirConfiguracao: vi.fn(),
    });
    expect(container.querySelector(".dica-onboarding")).toBeNull();
  });

  it("clicar em Entendi remove a dica e grava a flag", () => {
    const container = document.createElement("div");
    montarTelaCidade(container, {
      jogador: jogadorDeTeste(), aoExplorar: vi.fn(), aoAbrirGuilda: vi.fn(), aoAbrirLoja: vi.fn(),
      aoAbrirPersonagem: vi.fn(), aoAbrirTorre: vi.fn(), aoAbrirMasmorra: vi.fn(), aoAbrirArena: vi.fn(),
      aoAbrirConfiguracao: vi.fn(),
    });
    container.querySelector("#botao-onboarding-ok").click();
    expect(container.querySelector(".dica-onboarding")).toBeNull();
    expect(localStorage.getItem("webrpg_onboarding_visto")).toBe("1");
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- telaCidade`
Expected: FAIL — nenhum elemento `.dica-onboarding` existe ainda.

- [ ] **Step 3: Editar `WebRPG/src/telas/cidade/telaCidade.js`**

Adicionar, logo após o `container.innerHTML = ...` existente:

```js
  if (!localStorage.getItem("webrpg_onboarding_visto")) {
    const dica = document.createElement("div");
    dica.className = "painel dica-onboarding";
    dica.innerHTML = `
      <p>Bem-vindo a The Lost World! Clique em Explorar para sua primeira batalha, ou visite a Guilda para aceitar uma missão.</p>
      <button class="botao botao--destaque" id="botao-onboarding-ok">Entendi</button>
    `;
    container.querySelector(".tela-cidade").prepend(dica);
    dica.querySelector("#botao-onboarding-ok").addEventListener("click", () => {
      localStorage.setItem("webrpg_onboarding_visto", "1");
      dica.remove();
    });
  }
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- telaCidade`
Expected: PASS.

- [ ] **Step 5: Estilizar em `WebRPG/src/estilos/cidade.css`**

```css
.dica-onboarding {
  border-color: var(--cor-destaque);
  display: flex;
  flex-direction: column;
  gap: var(--espaco-sm);
}
```

- [ ] **Step 6: Rodar a suíte completa**

Run: `npm run test`
Expected: PASS — todos os testes de `engine/**` e `WebRPG/src/**` verdes (Fases 0-5 completas).

- [ ] **Step 7: Commit**

```bash
git add WebRPG/src/telas/cidade WebRPG/src/estilos/cidade.css
git commit -m "feat: dica de onboarding na primeira visita à cidade"
```

---

## Task 9: Revisão final tela a tela (verificação manual)

**Files:** nenhum arquivo novo — esta task é um checklist de revisão, não código.

- [ ] **Step 1: Rodar a suíte completa de testes**

Run: `npm run test`
Expected: PASS — todos os testes de todas as fases.

- [ ] **Step 2: Rodar o build de produção**

Run: `npm run build`
Expected: build sem erros, sem warnings de import quebrado.

- [ ] **Step 3: Checklist manual contra a spec seção 4.1 (padrão Knights of Pen & Paper)**

Run: `npm run dev`. Para cada tela abaixo, confirmar os 4 princípios da spec: **(a)** painéis chunky/botões grandes, **(b)** HP/MP/ouro sempre visível quando aplicável, **(c)** feedback visual em toda ação, **(d)** tipografia pixel só em títulos/números, corpo em fonte limpa.

1. Tela inicial (`inicial`) — ainda é o placeholder da Fase 0; anotar como pendência de conteúdo se o tempo permitir substituí-la por uma tela de título de fato (fora do escopo mínimo desta fase, mas registrar).
2. Criação de personagem — preview ao vivo, botões grandes, nome dos atributos legível.
3. Cidade — cabeçalho com HP/ouro sempre visível, todos os 7 locais + config acessíveis, dica de onboarding na primeira visita.
4. Batalha — barras de HP, log, overlay de vitória/derrota, som de golpe/crítico/moeda.
5. Loja — abas comprar/vender, cor de raridade nos itens.
6. Personagem — atributos, XP, comparação ↑/↓ ao passar o mouse/tocar num item do inventário.
7. Guilda — descrição + história da missão, resultado claro (sucesso/falha).
8. Torre — nome do boss, barra de HP do boss, log de combate.
9. Masmorra — grade com névoa de guerra, símbolos legíveis.
10. Arena — onda atual, pontos, log de progressão.
11. Configurações — sliders de volume funcionam de fato (ouvir o efeito de teste, se os assets já tiverem sido baixados).

- [ ] **Step 4: Registrar gaps encontrados**

Se a revisão encontrar problemas visuais que não invalidam o critério de pronto (ex. espaçamento inconsistente, cor fora da paleta), registrar como itens de acompanhamento em `docs/superpowers/plans/` (novo arquivo `2026-XX-XX-webrpg-polimento-pendencias.md`) em vez de bloquear esta fase — a spec já trata a Fase 5 como "revisão final tela a tela", não como perfeição absoluta.

Não há commit nesta task (é só verificação); se gaps forem registrados no Step 4, commitar o novo arquivo de pendências separadamente.

---

## Resumo do que fica pronto ao final deste plano

- Som (efeitos + música por tela, tolerante a assets ainda não baixados), transições de fade entre telas, overlay de vitória/derrota, tela de configurações (volume + exportar save), responsividade mobile e onboarding — todos os itens da spec para a Fase 5.
- As 6 fases do WebRPG (0 a 5) estão completas: fundação, batalha, identidade, economia, profundidade e polimento — o jogo é jogável do início ao fim (criar personagem → cidade → missões/loja/equipar → torre/masmorra/arena → save persistente) com uma UI polida ao padrão de referência da spec.
- Pendências de conteúdo (não de arquitetura) que continuam em aberto, documentadas ao longo dos 4 planos: assets de áudio/imagem para baixar (`CREDITS.md`), 7 templates de masmorra adicionais, tela de batalha visual onda-a-onda na missão da Guilda, quebra de equipamento do Golem Titânico, tela de título de fato (em vez do placeholder da Fase 0).
