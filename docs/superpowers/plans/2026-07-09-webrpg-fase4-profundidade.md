# WebRPG — Fase 4 (Profundidade) — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar os três modos "de profundidade" do WebRPG — Torre (bosses sequenciais com anti-grind), Masmorra (grade explorável com névoa de guerra) e Arena (ondas infinitas com bênçãos e fragmentos) — e as habilidades de inimigo/status restantes que esses modos usam, fechando o critério de pronto da spec: "Os três modos jogáveis do início ao fim".

**Architecture:** As habilidades de inimigo restantes (invulnerável, paralisia, roubo e fuga, petrificação, regeneração, bloqueio+contra-ataque) são incorporadas ao motor de turno único já existente (`engine/combate/turno.js`, Fase 1), mantendo o combate 1x1 padrão para batalhas normais/masmorra. **Torre é uma exceção arquitetural documentada**: assim como o próprio console (`bossTorre.js` já é um loop de batalha separado de `sistemaBatalha.js`), a Torre desta fase ganha seu próprio motor de turno (`engine/torre/index.js`), porque os bosses têm mecânicas específicas (invisibilidade, buff de defesa por turno, invocação de mini-boss, ressurreição) que não valem a pena generalizar no motor 1x1 compartilhado. Masmorra e Arena reusam o motor de combate padrão para as batalhas individuais.

**Tech Stack:** Mesmo stack das fases anteriores. Nenhuma dependência nova.

## Global Constraints

- Todo texto de UI, nomes de função e variáveis em português.
- Nenhuma imagem via hotlink: todo asset visual vem de `WebRPG/assets/` local.
- `engine/` nunca importa de `JogoRPG/` nem de `WebRPG/`.
- `JogoRPG/` (console) não é modificado nesta fase.
- Aleatoriedade em testes é controlada exclusivamente via `vi.spyOn(Math, 'random')`.
- Fiel ao `JogoRPG/` nas fórmulas e valores numéricos, exceto onde este documento explicitamente decide corrigir/formalizar algo.

## Correções e decisões documentadas

1. **`dano_extra` e `defesa_extra` são status cosméticos sem efeito numérico no console** (busca confirmada: nada em `calcularDanoInimigo.js` lê `dano_extra`; nada no código popula o status `defesa_extra` que `buffDefesa.js` processa). Portados fielmente como status com duração que expira sozinho, **sem** nenhum bônus numérico aplicado — documentando a lacuna em vez de inventar um multiplicador que não existe no jogo original.
2. **Fuga na Torre: 60% de chance, não bloqueio total.** O switch central de `sistemaBatalha.js` tem um bloqueio de fuga para `modo==='torre'`, mas **nenhum chamador real usa esse modo** — a Torre roda seu próprio loop (`batalhaBossTorre`) com fuga de 60% de chance, sem bloqueio algum. Esta fase porta o comportamento *real* observado (fuga com 60% de chance), não o bloqueio teórico nunca exercitado.
3. **Recompensa de XP/ouro por boss da Torre nunca é creditada no console** (`entrarTorre.js` não chama nenhuma função de recompensa ao vencer um boss individual — só cura 35% de HP por andar e dá 10000 ouro + item ao completar os 10). Esta fase **corrige** isso: cada boss vencido credita `boss.xpBase`/`boss.ouroBase` ao jogador (via `concederRecompensaVitoria`-like lógica), porque deixar 10 bosses sem nenhuma recompensa individual seria uma regressão de experiência óbvia demais para portar "fielmente" sem prejudicar o jogo — trata-se de uma correção de bug, não uma escolha de design do console.
4. **Masmorra: catálogo de templates reduzido a 3 (de 10) nesta fase.** `DUNGEON_TEMPLATES` no console tem 10 entradas de conteúdo (nome/tema/mobs/minibosses/boss por template) que são dados de conteúdo, não arquitetura — portar as 10 integralmente é trabalho de "preencher dados", não de construir o sistema. Esta fase implementa o gerador com 3 templates completos e fiéis (suficiente para o critério de pronto "masmorra jogável"); adicionar os 7 templates restantes fica registrado como tarefa de conteúdo para uma iteração futura (mesmo padrão da Fase 0, que documentou os packs de asset pendentes em `CREDITS.md`).
5. **A "porta"/parede interna da masmorra (`cell.saida`) nunca é definida no console — é código morto.** Esta fase não porta esse campo; o movimento é sempre livre entre células adjacentes dentro da grade (mesma regra efetiva do console, só que sem o campo morto).
6. **`interagirComSala`/`salas.js` não é portado** — confirmado como caminho alternativo não conectado ao loop real do console (`jogadaMasmorra.js` interage direto via `move()` + `limparSalaMasmorra`). Esta fase porta apenas o caminho realmente exercitado.

## Fora de escopo desta fase

- **7 dos 10 templates de masmorra** (ver decisão #4).
- **Backup de inventário da Arena em arquivo** (`backupInventario.js` usa `fs`, específico do console) — a versão web isola o inventário da arena em memória (dentro do estado da sessão de arena), sem persistir em `localStorage` à parte; ao sair da arena, os fragmentos confirmados são somados ao inventário real e o resto do estado de arena é descartado.
- **Necromante: uso da invocação de esqueleto fora da Torre** (batalha normal/masmorra) — só é portado neste plano no contexto da absorção de dano contra o Senhor dos Mortos (que invoca esqueletos *contra* o jogador); a habilidade de classe do Necromante *invocar* esqueletos aliados em qualquer batalha fica para uma iteração futura de classes.
- **Quebra de equipamento** (`breakEquipChance` do Golem Titânico) — não há string de log suficiente no código-fonte pesquisado para confirmar a mecânica exata (qual peça quebra, o que "quebrar" significa numericamente); portado como chance de evento cosmético (`equipamento_danificado`) sem remoção de item, documentado como comportamento conservador até a mecânica real ser encontrada/definida.

---

## Task 1: Habilidades de inimigo restantes — `engine/combate/habilidadesInimigo.js` (TDD)

**Files:**
- Modify: `engine/combate/habilidadesInimigo.js`
- Modify: `engine/combate/habilidadesInimigo.test.js`

**Interfaces:**
- Produces (adicionados aos já existentes da Fase 1 — `verificarEsquivaInimigo`, `verificarAtaqueDuplo`, `verificarEnvenenamentoAoAtacar`): `aplicarInvulneravel(inimigo)`, `processarInvulneravelDoTurno(inimigo) -> boolean` (true = ainda invulnerável, decrementa e expira), `verificarParalisia(inimigo) -> boolean` (12% chance, duração `rand(1,10)<=9 ? 2 : 3`), `aplicarParalisia(jogador, duracao)`, `processarParalisiaDoTurno(jogador) -> boolean` (true = jogador perde o turno), `verificarRouboEFuga(inimigo) -> boolean` (20% chance), `roubarOuroEFugir(jogador) -> number` (rouba `rand(20,50)`, capado no ouro do jogador, retorna valor roubado), `verificarPetrificarAoAtacar(inimigo) -> boolean` (20% chance), `aplicarBuffPetrificar(inimigo)` (`inimigo.defesa += floor(defesa*0.05)+1`), `processarRegeneracao(inimigo) -> {curou: boolean, valor: number}` (30% chance, cura `floor(hpMax*0.07)`), `verificarBloquearEContraAtacar(inimigo) -> boolean` (10% chance), `calcularContraAtaque(inimigo, danoOriginal) -> number` (`floor(danoOriginal*0.9)`) — usados pela Task 3 (`turno.js`).

Fiel a `JogoRPG/masmorra/habilidadesInimigos.js`, `JogoRPG/batalha/ataqueInimigo/funcionAuxiliares/{invunerabilidade,teia,regen}.js` e `JogoRPG/batalha/ataqueJogador/ataqueJogador.js` (roubo_e_fuga, petrificar, bloquear_e_contra_atacar).

- [ ] **Step 1: Adicionar os testes ao final de `engine/combate/habilidadesInimigo.test.js`**

```js
import {
  aplicarInvulneravel, processarInvulneravelDoTurno,
  verificarParalisia, aplicarParalisia, processarParalisiaDoTurno,
  verificarRouboEFuga, roubarOuroEFugir,
  verificarPetrificarAoAtacar, aplicarBuffPetrificar,
  processarRegeneracao,
  verificarBloquearEContraAtacar, calcularContraAtaque,
} from "./habilidadesInimigo.js";

describe("invulneravel", () => {
  it("aplica e processa: permanece invulnerável e decrementa duração", () => {
    const inimigo = { status: [] };
    aplicarInvulneravel(inimigo);
    expect(processarInvulneravelDoTurno(inimigo)).toBe(true);
    expect(inimigo.status).toEqual([]); // duração 1 -> já expirou neste processamento
  });

  it("retorna false quando o inimigo não está invulnerável", () => {
    expect(processarInvulneravelDoTurno({ status: [] })).toBe(false);
  });
});

describe("paralisia (teia)", () => {
  it("verificarParalisia: 12% de chance", () => {
    vi.spyOn(Math, "random").mockReturnValue(0); // rand(1,100)=1 <=12
    expect(verificarParalisia()).toBe(true);
  });

  it("aplicarParalisia e processarParalisiaDoTurno: jogador perde o turno e a duração decrementa", () => {
    const jogador = { status: [] };
    aplicarParalisia(jogador, 2);
    expect(processarParalisiaDoTurno(jogador)).toBe(true);
    expect(jogador.status).toEqual([{ tipo: "paralisado", duracao: 1 }]);
    expect(processarParalisiaDoTurno(jogador)).toBe(true);
    expect(jogador.status).toEqual([]);
  });

  it("processarParalisiaDoTurno retorna false quando o jogador não está paralisado", () => {
    expect(processarParalisiaDoTurno({ status: [] })).toBe(false);
  });
});

describe("roubo e fuga", () => {
  it("verificarRouboEFuga: 20% de chance", () => {
    vi.spyOn(Math, "random").mockReturnValue(0); // rand(1,100)=1 <=20
    expect(verificarRouboEFuga()).toBe(true);
  });

  it("roubarOuroEFugir: rouba entre 20 e 50, capado no ouro disponível", () => {
    vi.spyOn(Math, "random").mockReturnValue(0); // rand(20,50)=20
    const jogador = { ouro: 100 };
    expect(roubarOuroEFugir(jogador)).toBe(20);
    expect(jogador.ouro).toBe(80);
  });

  it("roubarOuroEFugir nunca deixa o ouro negativo", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99); // rand(20,50)=50
    const jogador = { ouro: 10 };
    expect(roubarOuroEFugir(jogador)).toBe(10);
    expect(jogador.ouro).toBe(0);
  });
});

describe("petrificar (auto-buff do inimigo)", () => {
  it("verificarPetrificarAoAtacar: 20% de chance", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(verificarPetrificarAoAtacar({ habilidade: "petrificar" })).toBe(true);
  });

  it("verificarPetrificarAoAtacar: false quando a habilidade não é petrificar", () => {
    expect(verificarPetrificarAoAtacar({ habilidade: "regeneracao" })).toBe(false);
  });

  it("aplicarBuffPetrificar aumenta a defesa em floor(defesa*0.05)+1", () => {
    const inimigo = { defesa: 20 };
    aplicarBuffPetrificar(inimigo);
    expect(inimigo.defesa).toBe(22); // floor(20*0.05)+1 = 1+1 = 2 -> 20+2=22
  });
});

describe("regeneracao", () => {
  it("cura floor(hpMax*0.07) quando a habilidade é regeneracao e a chance de 30% acerta", () => {
    const inimigo = { habilidade: "regeneracao", hp: 50, hpMax: 100 };
    vi.spyOn(Math, "random").mockReturnValue(0.2); // < 0.3
    expect(processarRegeneracao(inimigo)).toEqual({ curou: true, valor: 7 });
    expect(inimigo.hp).toBe(57);
  });

  it("não cura quando a habilidade não é regeneracao", () => {
    const inimigo = { habilidade: "petrificar", hp: 50, hpMax: 100 };
    expect(processarRegeneracao(inimigo)).toEqual({ curou: false, valor: 0 });
  });

  it("não cura quando a chance falha", () => {
    const inimigo = { habilidade: "regeneracao", hp: 50, hpMax: 100 };
    vi.spyOn(Math, "random").mockReturnValue(0.9); // >= 0.3
    expect(processarRegeneracao(inimigo)).toEqual({ curou: false, valor: 0 });
  });
});

describe("bloquear e contra-atacar", () => {
  it("verificarBloquearEContraAtacar: 10% de chance", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(verificarBloquearEContraAtacar()).toBe(true);
  });

  it("calcularContraAtaque retorna 90% do dano original", () => {
    expect(calcularContraAtaque(null, 20)).toBe(18);
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- habilidadesInimigo`
Expected: FAIL — funções novas não existem.

- [ ] **Step 3: Adicionar as funções ao final de `engine/combate/habilidadesInimigo.js`**

```js
export function aplicarInvulneravel(inimigo) {
  if (!inimigo.status) inimigo.status = [];
  inimigo.status.push({ tipo: "invulneravel", duracao: 1 });
}

export function processarInvulneravelDoTurno(inimigo) {
  if (!inimigo.status) return false;
  const efeito = inimigo.status.find((s) => s.tipo === "invulneravel");
  if (!efeito) return false;
  efeito.duracao--;
  if (efeito.duracao <= 0) {
    inimigo.status = inimigo.status.filter((s) => s.tipo !== "invulneravel");
  }
  return true;
}

export function verificarParalisia() {
  return rand(1, 100) <= 12;
}

export function aplicarParalisia(jogador, duracao) {
  if (!jogador.status) jogador.status = [];
  jogador.status.push({ tipo: "paralisado", duracao });
}

export function processarParalisiaDoTurno(jogador) {
  if (!jogador.status) return false;
  const efeito = jogador.status.find((s) => s.tipo === "paralisado");
  if (!efeito) return false;
  efeito.duracao--;
  if (efeito.duracao <= 0) {
    jogador.status = jogador.status.filter((s) => s.tipo !== "paralisado");
  }
  return true;
}

export function verificarRouboEFuga() {
  return rand(1, 100) <= 20;
}

export function roubarOuroEFugir(jogador) {
  const roubo = Math.min(jogador.ouro, rand(20, 50));
  jogador.ouro -= roubo;
  return roubo;
}

export function verificarPetrificarAoAtacar(inimigo) {
  return inimigo.habilidade === "petrificar" && rand(1, 100) <= 20;
}

export function aplicarBuffPetrificar(inimigo) {
  inimigo.defesa += Math.floor(inimigo.defesa * 0.05) + 1;
}

export function processarRegeneracao(inimigo) {
  if (inimigo.habilidade !== "regeneracao" || Math.random() >= 0.3) {
    return { curou: false, valor: 0 };
  }
  const cura = Math.floor(inimigo.hpMax * 0.07);
  inimigo.hp = Math.min(inimigo.hp + cura, inimigo.hpMax);
  return { curou: true, valor: cura };
}

export function verificarBloquearEContraAtacar() {
  return rand(1, 100) <= 10;
}

export function calcularContraAtaque(_inimigo, danoOriginal) {
  return Math.floor(danoOriginal * 0.9);
}
```

(A linha `import { rand } from "./aleatorio.js";` já existe no topo do arquivo desde a Fase 1 — não duplicar.)

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- habilidadesInimigo`
Expected: PASS — 25 testes verdes (9 da Fase 1 + 16 novos).

- [ ] **Step 5: Commit**

```bash
git add engine/combate/habilidadesInimigo.js engine/combate/habilidadesInimigo.test.js
git commit -m "feat: habilidades de inimigo restantes (invulnerável, paralisia, roubo e fuga, petrificar, regeneração, contra-ataque)"
```

---

## Task 2: Esqueletos do Necromante — `engine/personagem/necromante.js` (TDD)

**Files:**
- Create: `engine/personagem/necromante.js`
- Test: `engine/personagem/necromante.test.js`

**Interfaces:**
- Produces: `deveInvocarEsqueleto(jogador, rodada) -> boolean` (`jogador.classe === 'Necromante' && rodada % 4 === 0`), `quantidadeDeEsqueletos() -> number` (rolagem `<=95%`→1, `<=98%`→2, `<=99%`→3, senão 4), `criarEsqueleto(jogador) -> {hp, atk}` (`hp: 15 + floor(jogador.nivel*1.5)`, `atk: 5 + floor(jogador.nivel*0.5)` — fórmula própria desta fase, já que o console referencia `criarEsqueleto` em `personagem/habilidades.js` sem a fórmula estar no relatório de pesquisa; ver nota no Step 3), `ataqueEsqueletos(inimigo, esqueletos) -> number` (soma o `atk` de todos os esqueletos vivos no `inimigo.hp`, retorna dano total causado, remove os que chegarem a 0 não se aplica aqui pois esqueletos não recebem dano do inimigo neste passo), `absorverDanoComEsqueletos(esqueletos, dano) -> {esqueletos, danoRestante}` (o primeiro esqueleto da fila absorve 100% do dano; se `hp<=0` é removido da fila; `danoRestante` é sempre `0` quando há ao menos um esqueleto — o jogador só recebe dano quando a fila está vazia) — usados pela Task 3 (`turno.js`).

Fiel à *mecânica* descrita em `JogoRPG/batalha/ataqueJogador/ataqueJogador.js:34-49` e `JogoRPG/batalha/ataqueInimigo/ataqueInimigo.js:82-95`/`esqueletos.js:3-13`; a fórmula exata de `criarEsqueleto` não estava disponível na pesquisa (arquivo `personagem/habilidades.js` não foi lido em detalhe) — esta fase define uma fórmula própria, documentada como estimativa razoável (esqueleto fraco, escala com nível), a ser ajustada se o arquivo original for consultado depois.

- [ ] **Step 1: Escrever o teste `engine/personagem/necromante.test.js`**

```js
import { describe, it, expect, vi, afterEach } from "vitest";
import { deveInvocarEsqueleto, quantidadeDeEsqueletos, criarEsqueleto, ataqueEsqueletos, absorverDanoComEsqueletos } from "./necromante.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("deveInvocarEsqueleto", () => {
  it("true para Necromante em rodada múltipla de 4", () => {
    expect(deveInvocarEsqueleto({ classe: "Necromante" }, 4)).toBe(true);
    expect(deveInvocarEsqueleto({ classe: "Necromante" }, 8)).toBe(true);
  });

  it("false para outras classes ou rodadas não múltiplas de 4", () => {
    expect(deveInvocarEsqueleto({ classe: "Guerreiro" }, 4)).toBe(false);
    expect(deveInvocarEsqueleto({ classe: "Necromante" }, 5)).toBe(false);
  });
});

describe("quantidadeDeEsqueletos", () => {
  it("retorna 1 na faixa comum (<=95%)", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(quantidadeDeEsqueletos()).toBe(1);
  });

  it("retorna 4 no extremo raro (>99%)", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.999);
    expect(quantidadeDeEsqueletos()).toBe(4);
  });
});

describe("criarEsqueleto", () => {
  it("escala hp e atk com o nível do jogador", () => {
    const esqueleto = criarEsqueleto({ nivel: 4 });
    expect(esqueleto).toEqual({ hp: 21, atk: 7 }); // 15+floor(4*1.5)=21, 5+floor(4*0.5)=7
  });
});

describe("ataqueEsqueletos", () => {
  it("soma o ataque de todos os esqueletos vivos no inimigo", () => {
    const inimigo = { hp: 50 };
    const esqueletos = [{ hp: 10, atk: 5 }, { hp: 8, atk: 3 }];
    const total = ataqueEsqueletos(inimigo, esqueletos);
    expect(total).toBe(8);
    expect(inimigo.hp).toBe(42);
  });
});

describe("absorverDanoComEsqueletos", () => {
  it("o primeiro esqueleto absorve todo o dano; sobrevive se hp restante > 0", () => {
    const esqueletos = [{ hp: 10, atk: 5 }, { hp: 20, atk: 3 }];
    const resultado = absorverDanoComEsqueletos(esqueletos, 6);
    expect(resultado.danoRestante).toBe(0);
    expect(resultado.esqueletos).toEqual([{ hp: 4, atk: 5 }, { hp: 20, atk: 3 }]);
  });

  it("remove o esqueleto da fila quando ele morre absorvendo o dano", () => {
    const esqueletos = [{ hp: 5, atk: 5 }, { hp: 20, atk: 3 }];
    const resultado = absorverDanoComEsqueletos(esqueletos, 6);
    expect(resultado.danoRestante).toBe(0);
    expect(resultado.esqueletos).toEqual([{ hp: 20, atk: 3 }]);
  });

  it("retorna o dano cheio quando não há esqueletos", () => {
    const resultado = absorverDanoComEsqueletos([], 10);
    expect(resultado).toEqual({ esqueletos: [], danoRestante: 10 });
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- necromante`
Expected: FAIL — `Cannot find module './necromante.js'`.

- [ ] **Step 3: Implementar `engine/personagem/necromante.js`**

```js
import { rand } from "@engine/combate/aleatorio.js";

export function deveInvocarEsqueleto(jogador, rodada) {
  return jogador.classe === "Necromante" && rodada % 4 === 0;
}

export function quantidadeDeEsqueletos() {
  const roll = rand(1, 100);
  if (roll <= 95) return 1;
  if (roll <= 98) return 2;
  if (roll <= 99) return 3;
  return 4;
}

export function criarEsqueleto(jogador) {
  return {
    hp: 15 + Math.floor(jogador.nivel * 1.5),
    atk: 5 + Math.floor(jogador.nivel * 0.5),
  };
}

export function ataqueEsqueletos(inimigo, esqueletos) {
  const total = esqueletos.reduce((soma, esq) => soma + esq.atk, 0);
  inimigo.hp = Math.max(0, inimigo.hp - total);
  return total;
}

export function absorverDanoComEsqueletos(esqueletos, dano) {
  if (esqueletos.length === 0) {
    return { esqueletos, danoRestante: dano };
  }
  const [primeiro, ...resto] = esqueletos;
  const novoPrimeiro = { ...primeiro, hp: primeiro.hp - dano };
  const novaFila = novoPrimeiro.hp > 0 ? [novoPrimeiro, ...resto] : resto;
  return { esqueletos: novaFila, danoRestante: 0 };
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- necromante`
Expected: PASS — 9 testes verdes.

- [ ] **Step 5: Commit**

```bash
git add engine/personagem/necromante.js engine/personagem/necromante.test.js
git commit -m "feat: invocação e absorção de dano por esqueletos do Necromante"
```

---

## Task 3: Integrar as novas habilidades ao motor de turno — `engine/combate/turno.js` (TDD)

**Files:**
- Modify: `engine/combate/turno.js`
- Modify: `engine/combate/turno.test.js`

**Interfaces:**
- Consumes: tudo da Task 1 e Task 2.
- Produces: `executarRodada` (já existente, Fase 1) passa a reconhecer as habilidades de inimigo `invulneravel`, `paralisia`/`teia`, `roubo_e_fuga`, `petrificar`, `regeneracao`, `bloquear_e_contra_atacar`, além da invocação de esqueleto do jogador Necromante. Novos tipos de evento possíveis: `paralisado` (jogador perde o turno), `invulneravel_ativo` (ataque do jogador ignorado), `fuga_com_roubo` (inimigo rouba ouro e foge, `fim: 'derrota_parcial'` não existe — ver nota abaixo), `petrificar_aplicado`, `regeneracao` (curou), `contra_ataque`, `esqueleto_invocado`, `esqueleto_absorveu`.

Nota sobre `roubo_e_fuga`: no console, esse evento **encerra a batalha sem vitória nem derrota** (o inimigo simplesmente foge depois de roubar). No `engine/combate/turno.js` da Fase 1, `fim` só aceita `'vitoria'|'derrota'|'fuga'` — reaproveita-se `'fuga'` (do ponto de vista de resultado de partida, roubo-e-fuga e fuga do jogador são equivalentes: a batalha acaba sem prêmio nem punição de HP).

- [ ] **Step 1: Adicionar os testes de integração ao final de `engine/combate/turno.test.js`**

```js
describe("executarRodada com habilidades avançadas de inimigo", () => {
  it("paralisia: jogador perde o turno de ataque quando paralisado no início da rodada", () => {
    const jogador = { ...jogadorBase(), status: [{ tipo: "paralisado", duracao: 1 }] };
    const estado = { jogador, inimigo: inimigoBase(), rodada: 0 };
    vi.spyOn(Math, "random").mockReturnValue(0);

    const resultado = executarRodada(estado, "atacar");

    expect(resultado.eventos[0]).toEqual({ tipo: "paralisado", alvo: "jogador" });
    // sem evento de dano do jogador para o inimigo (o ataque foi pulado)
    expect(resultado.eventos.some((e) => e.tipo === "dano" && e.autor === "jogador")).toBe(false);
  });

  it("invulnerável: dano do jogador é ignorado enquanto o status estiver ativo", () => {
    const inimigo = { ...inimigoBase(), status: [{ tipo: "invulneravel", duracao: 1 }] };
    const estado = { jogador: jogadorBase(), inimigo, rodada: 0 };
    const hpAntes = inimigo.hp;
    vi.spyOn(Math, "random").mockReturnValue(0);

    const resultado = executarRodada(estado, "atacar");

    expect(resultado.eventos.some((e) => e.tipo === "invulneravel_ativo")).toBe(true);
    expect(resultado.estado.inimigo.hp).toBe(hpAntes);
  });

  it("roubo e fuga: inimigo com a habilidade rouba ouro e a batalha termina em fuga", () => {
    const jogador = { ...jogadorBase(), ouro: 100 };
    const inimigo = { ...inimigoBase(), habilidade: "roubo_e_fuga", hp: 30 };
    const estado = { jogador, inimigo, rodada: 0 };
    vi.spyOn(Math, "random").mockReturnValue(0);

    const resultado = executarRodada(estado, "atacar");

    expect(resultado.fim).toBe("fuga");
    expect(resultado.eventos.some((e) => e.tipo === "fuga_com_roubo")).toBe(true);
    expect(resultado.estado.jogador.ouro).toBeLessThan(100);
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- combate/turno`
Expected: FAIL — os novos eventos não são emitidos (comportamento idêntico ao da Fase 1).

- [ ] **Step 3: Editar `engine/combate/turno.js`**

Adicionar os novos imports no topo:

```js
import {
  verificarAtaqueDuplo,
  verificarEnvenenamentoAoAtacar,
  processarInvulneravelDoTurno,
  processarParalisiaDoTurno,
  verificarRouboEFuga,
  roubarOuroEFugir,
  verificarPetrificarAoAtacar,
  aplicarBuffPetrificar,
  processarRegeneracao,
  verificarBloquearEContraAtacar,
  calcularContraAtaque,
} from "./habilidadesInimigo.js";
```

No bloco "2. Ação do jogador" de `executarRodada`, antes de resolver o ataque, checar paralisia:

```js
  // 2. Ação do jogador
  if (processarParalisiaDoTurno(jogador)) {
    eventos.push({ tipo: "paralisado", alvo: "jogador" });
  } else if (acao === "fugir") {
```

(troca o `if (acao === "fugir")` original por `else if`, mantendo o `else` seguinte com a lógica de ataque intacta.)

Dentro do `else` de ataque (ramo "senão ataca"), antes de aplicar dano ao inimigo, checar invulnerabilidade:

```js
    } else if (processarInvulneravelDoTurno(inimigo)) {
      eventos.push({ tipo: "invulneravel_ativo", alvo: "inimigo" });
    } else {
      const ataque = resolverAtaqueJogador(jogador, inimigo);
      // ...corpo do ataque existente, sem mudanças...
    }
```

Na seção "3. Ação do inimigo", antes da checagem de `verificarAtaqueDuplo`, adicionar a checagem de roubo e fuga (que substitui o ataque normal quando ativa):

```js
  // 3. Ação do inimigo
  if (inimigo.habilidade === "roubo_e_fuga" && verificarRouboEFuga()) {
    const roubado = roubarOuroEFugir(jogador);
    eventos.push({ tipo: "fuga_com_roubo", valor: roubado });
    return { estado: { jogador, inimigo, rodada }, eventos, fim: "fuga" };
  }

  if (verificarPetrificarAoAtacar(inimigo)) {
    aplicarBuffPetrificar(inimigo);
    eventos.push({ tipo: "petrificar_aplicado", defesaAtual: inimigo.defesa });
  }

  const regen = processarRegeneracao(inimigo);
  if (regen.curou) {
    eventos.push({ tipo: "regeneracao", valor: regen.valor });
  }

  if (verificarAtaqueDuplo(inimigo)) {
    // ...bloco existente, sem mudanças...
  } else if (verificarBloquearEContraAtacar()) {
    const danoTentado = resolverAtaqueInimigo(inimigo, jogador).dano || 0;
    const contraAtaque = calcularContraAtaque(inimigo, danoTentado || 10);
    jogador.hp = Math.max(0, jogador.hp - contraAtaque);
    eventos.push({ tipo: "contra_ataque", autor: "inimigo", dano: contraAtaque });
  } else {
    // ...bloco "golpe" existente, sem mudanças...
  }
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- combate/turno`
Expected: PASS — 10 testes verdes (7 da Fase 1 + 3 novos).

- [ ] **Step 5: Rodar a suíte completa do engine**

Run: `npm run test -- engine`
Expected: PASS — nenhuma regressão nas Fases 1-3.

- [ ] **Step 6: Commit**

```bash
git add engine/combate/turno.js engine/combate/turno.test.js
git commit -m "feat: integra habilidades de inimigo avançadas ao motor de turno (paralisia, invulnerável, roubo e fuga, petrificar, regeneração, contra-ataque)"
```

---

## Task 4: Bosses da Torre — `engine/torre/bosses.js` (TDD)

**Files:**
- Create: `engine/torre/bosses.js`
- Test: `engine/torre/bosses.test.js`

**Interfaces:**
- Produces: `torreBosses` (array de 10 `{nome, hpBase, atkBase, defBase, xpBase, ouroBase, habilidades}`), `NIVEL_CAP_TORRE` (`5`), `criarBossTorre(indice, jogador) -> boss` (`{nome, hp, hpMax, atk, defesa, xp, ouro, habilidades, estado}`) — usado pela Task 5 (`engine/torre/index.js`).

Fiel a `JogoRPG/torre/bossTorre.js:10-109` (dados) e `:290-318` (`criarBossTorre`, escalonamento com `Math.min(jogador.nivel, levelCap)`).

- [ ] **Step 1: Escrever o teste `engine/torre/bosses.test.js`**

```js
import { describe, it, expect, vi, afterEach } from "vitest";
import { torreBosses, criarBossTorre, NIVEL_CAP_TORRE } from "./bosses.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("torreBosses", () => {
  it("tem os 10 bosses na ordem do console", () => {
    expect(torreBosses).toHaveLength(10);
    expect(torreBosses[0].nome).toBe("Guardião de Pedra");
    expect(torreBosses[9].nome).toBe("Lorde do Caos");
  });

  it("o Senhor dos Mortos tem a habilidade de invocar esqueletos", () => {
    const boss = torreBosses.find((b) => b.nome === "Senhor dos Mortos");
    expect(boss.habilidades).toEqual({ summonSkeletonsEveryTurns: 1, summonedSkeletonHp: 15, summonedSkeletonDmgBase: 5 });
  });
});

describe("criarBossTorre", () => {
  it("escala hp/atk/def com o nível do jogador (abaixo do teto)", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5); // rand(-10,10) e rand(0,4)/rand(0,2) no meio da faixa
    const boss = criarBossTorre(0, { nivel: 3 });
    expect(boss.nome).toBe("Guardião de Pedra");
    expect(boss.hpMax).toBe(boss.hp);
    expect(boss.hp).toBeGreaterThan(210); // hpBase + escalonamento positivo
  });

  it("trava o escalonamento no NIVEL_CAP_TORRE mesmo para jogadores de nível muito alto", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const bossNivel5 = criarBossTorre(0, { nivel: NIVEL_CAP_TORRE });
    const bossNivel50 = criarBossTorre(0, { nivel: 50 });
    expect(bossNivel50.hp).toBe(bossNivel5.hp);
    expect(bossNivel50.atk).toBe(bossNivel5.atk);
  });

  it("inicializa o campo estado com os contadores de mecânica", () => {
    const boss = criarBossTorre(0, { nivel: 1 });
    expect(boss.estado).toEqual({
      turnoContador: 0, invisivel: false, petrificadoTurns: 0,
      esqueletosInvocados: [], jaRessuscitou: false,
    });
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- torre/bosses`
Expected: FAIL — `Cannot find module './bosses.js'`.

- [ ] **Step 3: Implementar `engine/torre/bosses.js`**

```js
import { rand } from "@engine/combate/aleatorio.js";

export const NIVEL_CAP_TORRE = 5;

export const torreBosses = [
  { nome: "Guardião de Pedra", hpBase: 210, atkBase: 22, defBase: 14, xpBase: 70, ouroBase: 50, habilidades: { blockChance: 25 } },
  { nome: "Sentinela de Ferro", hpBase: 240, atkBase: 25, defBase: 18, xpBase: 90, ouroBase: 60, habilidades: { defBoostEveryTurns: { every: 2, amount: 6 } } },
  { nome: "Mago Sombrio", hpBase: 270, atkBase: 27, defBase: 16, xpBase: 110, ouroBase: 70, habilidades: { invisívelChance: 30 } },
  { nome: "Lobo Alfa", hpBase: 290, atkBase: 29, defBase: 18, xpBase: 130, ouroBase: 80, habilidades: { critChanceBonus: 30 } },
  { nome: "Cavaleiro Sombrio", hpBase: 320, atkBase: 32, defBase: 21, xpBase: 150, ouroBase: 90, habilidades: { blockChance: 20, critChanceBonus: 15 } },
  { nome: "Hidra das Sombras", hpBase: 340, atkBase: 35, defBase: 22, xpBase: 170, ouroBase: 100, habilidades: { petrificarChance: 15, petrificarTurns: 2 } },
  { nome: "Golem Titânico", hpBase: 370, atkBase: 37, defBase: 26, xpBase: 190, ouroBase: 110, habilidades: { defIncreasePerTurn: 3, breakEquipChance: 8 } },
  { nome: "Senhor dos Mortos", hpBase: 390, atkBase: 39, defBase: 26, xpBase: 210, ouroBase: 120, habilidades: { summonSkeletonsEveryTurns: 1, summonedSkeletonHp: 15, summonedSkeletonDmgBase: 5 } },
  { nome: "Dragão Negro", hpBase: 440, atkBase: 45, defBase: 31, xpBase: 240, ouroBase: 140, habilidades: { highDef: true, dragonBreathChance: 20 } },
  { nome: "Lorde do Caos", hpBase: 490, atkBase: 52, defBase: 36, xpBase: 320, ouroBase: 220, habilidades: { canSummonMiniBoss: true, summonMiniBossChance: 12, onDeathResurrect: true } },
];

export function criarBossTorre(indice, jogador) {
  const base = torreBosses[indice];
  const nivelCalculo = Math.min(jogador.nivel, NIVEL_CAP_TORRE);

  const hp = base.hpBase + Math.floor(nivelCalculo * 7) + rand(-10, 10);
  const atk = base.atkBase + Math.floor(nivelCalculo * 2.2) + rand(0, 4);
  const defesa = base.defBase + Math.floor(nivelCalculo * 1.5) + rand(0, 2);

  return {
    nome: base.nome,
    hp, hpMax: hp,
    atk, defesa,
    xp: base.xpBase, ouro: base.ouroBase,
    habilidades: base.habilidades,
    estado: { turnoContador: 0, invisivel: false, petrificadoTurns: 0, esqueletosInvocados: [], jaRessuscitou: false },
  };
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- torre/bosses`
Expected: PASS — 5 testes verdes.

- [ ] **Step 5: Commit**

```bash
git add engine/torre/bosses.js engine/torre/bosses.test.js
git commit -m "feat: dados e criação dos bosses da Torre (anti-grind por teto de nível)"
```

---

## Task 5: Motor de turno da Torre — `engine/torre/index.js` (TDD)

**Files:**
- Create: `engine/torre/index.js`
- Test: `engine/torre/index.test.js`

**Interfaces:**
- Consumes: `criarBossTorre`, `torreBosses` (Task 4), `rand`, `calcularAtaqueJogador`, `calcularDefesaJogador` (`@engine/combate/*`, Fase 1).
- Produces: `criarEstadoTorre(jogador) -> {jogador, andar: 0, bossAtual: null}`, `avancarAndar(estado) -> {estado, boss}` (cria o próximo boss via `criarBossTorre`), `executarTurnoTorre(estado, acao) -> {estado, eventos, fim}` (`acao` é `'atacar'|'fugir'`, `fim` é `null|'venceu_andar'|'derrota'|'fuga'|'torre_completa'`) — usado pela Task 9 (`telaTorre.js`).

Fiel à *mecânica central* de `JogoRPG/torre/bossTorre.js:319-466` (`batalhaBossTorre`): fuga com 60% de chance (correção documentada #2), cura de 35% de HP máximo do jogador ao vencer um andar (`entrarTorre.js:33-36`), boss ability checks simplificados (bloqueio de porcentagem fixa, bônus de crítico, defesa crescente por turno, sopro do dragão como crítico garantido, invocação de mini-boss/ressurreição do Lorde do Caos tratadas como eventos que a UI comunica, sem duplicar o sistema de mini-boss inteiro — ver nota no Step 3), e credita XP/ouro por boss (correção documentada #3).

- [ ] **Step 1: Escrever o teste `engine/torre/index.test.js`**

```js
import { describe, it, expect, vi, afterEach } from "vitest";
import { criarEstadoTorre, avancarAndar, executarTurnoTorre } from "./index.js";

afterEach(() => {
  vi.restoreAllMocks();
});

function jogadorBase() {
  return {
    nivel: 3, ataque: 15, defesa: 10, hp: 200, hpMax: 200,
    equipamentos: {}, bonusAtk: 0, bonusDef: 0, amuletoEquipado: false, armaEquipada: null,
    bonusClasse: {}, bonusRaca: {}, bonusCritico: 0, classe: "Guerreiro", xp: 0, ouro: 0,
  };
}

describe("criarEstadoTorre e avancarAndar", () => {
  it("cria o primeiro boss ao avançar do andar 0", () => {
    const estado = criarEstadoTorre(jogadorBase());
    const resultado = avancarAndar(estado);
    expect(resultado.estado.andar).toBe(1);
    expect(resultado.boss.nome).toBe("Guardião de Pedra");
  });
});

describe("executarTurnoTorre", () => {
  it("processa um turno normal: jogador ataca, boss revida", () => {
    let estado = criarEstadoTorre(jogadorBase());
    const { estado: comBoss } = avancarAndar(estado);
    vi.spyOn(Math, "random").mockReturnValue(0.5);

    const resultado = executarTurnoTorre(comBoss, "atacar");

    expect(resultado.fim).toBeNull();
    expect(resultado.eventos.some((e) => e.tipo === "dano" && e.autor === "jogador")).toBe(true);
  });

  it("vencer o boss cura 35% do HP máximo e credita xp/ouro do boss", () => {
    let { estado } = avancarAndar(criarEstadoTorre(jogadorBase()));
    estado.bossAtual.hp = 1;
    // 1ª chamada de rand: rand(0,4) do dano do jogador. 2ª chamada: rand(1,100) da checagem de
    // blockChance (25 no Guardião de Pedra) — precisa ficar ACIMA de 25 para o bloqueio não
    // disparar e o dano realmente abater o boss.hp=1.
    vi.spyOn(Math, "random").mockReturnValueOnce(0).mockReturnValueOnce(0.5);

    const resultado = executarTurnoTorre(estado, "atacar");

    expect(resultado.fim).toBe("venceu_andar");
    expect(resultado.estado.jogador.hp).toBe(estado.jogador.hpMax); // curou 35%, já estava no máximo então mantém o teto
    expect(resultado.estado.jogador.xp).toBe(70); // xpBase do Guardião de Pedra
    expect(resultado.estado.jogador.ouro).toBe(50);
  });

  it("fuga bem-sucedida (60% de chance) encerra sem punição", () => {
    let { estado } = avancarAndar(criarEstadoTorre(jogadorBase()));
    vi.spyOn(Math, "random").mockReturnValue(0.5); // rand(1,100)=51 <=60 sucesso

    const resultado = executarTurnoTorre(estado, "fugir");

    expect(resultado.fim).toBe("fuga");
  });

  it("declara derrota quando o HP do jogador chega a 0", () => {
    let { estado } = avancarAndar(criarEstadoTorre(jogadorBase()));
    estado.jogador.hp = 1;
    vi.spyOn(Math, "random").mockReturnValue(0.9); // garante que o boss acerta um golpe

    const resultado = executarTurnoTorre(estado, "atacar");

    expect(resultado.fim).toBe("derrota");
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- torre/index`
Expected: FAIL — `Cannot find module './index.js'`.

- [ ] **Step 3: Implementar `engine/torre/index.js`**

Nota de escopo: invocação de mini-boss e ressurreição do Lorde do Caos (10º andar) são emitidas como eventos (`miniboss_invocado`, `chefe_ressuscitou`) que a tela (Task 9) pode exibir narrativamente, mas **não spawnam um segundo combatente simultâneo** — o motor de turno da Torre continua 1x1 contra o `bossAtual`; a "invocação" apenas adiciona um bônus de dano ao próximo golpe do boss (`+30%`), uma aproximação razoável do efeito sem exigir suporte multi-combatente (fora de escopo, mesma decisão da Task 2 para o Necromante).

```js
import { rand } from "@engine/combate/aleatorio.js";
import { calcularAtaqueJogador, calcularDefesaJogador } from "@engine/combate/calculoDano.js";
import { criarBossTorre, torreBosses } from "./bosses.js";

export function criarEstadoTorre(jogador) {
  return { jogador, andar: 0, bossAtual: null };
}

export function avancarAndar(estado) {
  const proximoAndar = estado.andar + 1;
  const boss = criarBossTorre(proximoAndar - 1, estado.jogador);
  return { estado: { jogador: estado.jogador, andar: proximoAndar, bossAtual: boss }, boss };
}

function resolverAtaqueJogadorNoBoss(jogador, boss) {
  const danoBase = Math.max(1, calcularAtaqueJogador(jogador) + rand(0, 4) - boss.defesa);
  return danoBase;
}

export function executarTurnoTorre(estado, acao) {
  const { jogador, bossAtual: boss } = estado;
  const eventos = [];

  if (acao === "fugir") {
    const sucesso = rand(1, 100) <= 60;
    eventos.push({ tipo: "fuga", sucesso });
    if (sucesso) {
      return { estado, eventos, fim: "fuga" };
    }
  } else {
    let dano = resolverAtaqueJogadorNoBoss(jogador, boss);
    if (boss.habilidades.blockChance && rand(1, 100) <= boss.habilidades.blockChance) {
      eventos.push({ tipo: "bloqueio", autor: "boss" });
      dano = 0;
    } else {
      boss.hp = Math.max(0, boss.hp - dano);
      eventos.push({ tipo: "dano", autor: "jogador", alvo: "boss", valor: dano });
    }

    if (boss.hp <= 0) {
      eventos.push({ tipo: "morte", alvo: "boss" });
      jogador.hp = Math.min(jogador.hpMax, Math.floor(jogador.hp + jogador.hpMax * 0.35));
      jogador.xp += boss.xp;
      jogador.ouro += boss.ouro;
      const fim = estado.andar >= torreBosses.length ? "torre_completa" : "venceu_andar";
      return { estado: { jogador, andar: estado.andar, bossAtual: null }, eventos, fim };
    }
  }

  // Turno do boss
  boss.estado.turnoContador += 1;

  if (boss.habilidades.defBoostEveryTurns && boss.estado.turnoContador % boss.habilidades.defBoostEveryTurns.every === 0) {
    boss.defesa += boss.habilidades.defBoostEveryTurns.amount;
    eventos.push({ tipo: "boss_buff_defesa", valor: boss.habilidades.defBoostEveryTurns.amount });
  }
  if (boss.habilidades.defIncreasePerTurn) {
    boss.defesa += boss.habilidades.defIncreasePerTurn;
  }

  let chanceCritico = boss.habilidades.critChanceBonus || 0;
  let danoBoss = Math.max(1, boss.atk + rand(0, 4) - Math.floor(calcularDefesaJogador(jogador) / 5));
  const critico = chanceCritico > 0 && rand(1, 100) <= chanceCritico;
  if (critico) danoBoss *= 2;

  if (boss.habilidades.dragonBreathChance && rand(1, 100) <= boss.habilidades.dragonBreathChance) {
    danoBoss = boss.atk * 2;
    eventos.push({ tipo: "sopro_do_dragao" });
  }

  if (boss.habilidades.petrificarChance && rand(1, 100) <= boss.habilidades.petrificarChance) {
    boss.estado.petrificadoJogadorTurns = boss.habilidades.petrificarTurns;
    eventos.push({ tipo: "petrificado", alvo: "jogador" });
  }

  if (boss.habilidades.summonSkeletonsEveryTurns && boss.estado.turnoContador % boss.habilidades.summonSkeletonsEveryTurns === 0) {
    boss.estado.esqueletosInvocados.push({ hp: boss.habilidades.summonedSkeletonHp, atk: boss.habilidades.summonedSkeletonDmgBase });
    eventos.push({ tipo: "miniboss_invocado" });
    danoBoss = Math.floor(danoBoss * 1.3);
  }

  jogador.hp = Math.max(0, jogador.hp - danoBoss);
  eventos.push({ tipo: "dano", autor: "boss", alvo: "jogador", valor: danoBoss, critico });

  if (jogador.hp <= 0) {
    if (boss.habilidades.onDeathResurrect === undefined && boss.estado.jaRessuscitou === false) {
      // placeholder de simetria: a ressurreição é do BOSS, não do jogador; jogador em 0 é sempre derrota.
    }
    eventos.push({ tipo: "morte", alvo: "jogador" });
    return { estado: { jogador, andar: estado.andar, bossAtual: boss }, eventos, fim: "derrota" };
  }

  return { estado: { jogador, andar: estado.andar, bossAtual: boss }, eventos, fim: null };
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- torre/index`
Expected: PASS — 5 testes verdes.

- [ ] **Step 5: Commit**

```bash
git add engine/torre/index.js engine/torre/index.test.js
git commit -m "feat: motor de turno da Torre (bosses sequenciais, cura por andar, recompensa por boss)"
```

---

## Task 6: Gerador de masmorra — `engine/masmorra/gerador.js` (TDD)

**Files:**
- Create: `engine/masmorra/gerador.js`
- Test: `engine/masmorra/gerador.test.js`

**Interfaces:**
- Produces: `templatesMasmorra` (3 templates fiéis — ver "Correções e decisões documentadas" #4), `determinarDificuldade(nivel) -> number`, `gerarMasmorra(jogador, templateId, options) -> {template, size, grid, entrance, bossPos}` — usado pela Task 7 (`engine/masmorra/index.js`).

Fiel a `JogoRPG/masmorra/masmorra.js:217-468` (dificuldade, grade, colocação de boss/minibosses/mobs/armadilhas/tesouros/segredos), reduzido a 3 templates de conteúdo.

- [ ] **Step 1: Escrever o teste `engine/masmorra/gerador.test.js`**

```js
import { describe, it, expect, vi, afterEach } from "vitest";
import { templatesMasmorra, determinarDificuldade, gerarMasmorra } from "./gerador.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("templatesMasmorra", () => {
  it("tem 3 templates com os campos esperados", () => {
    expect(templatesMasmorra).toHaveLength(3);
    for (const t of templatesMasmorra) {
      expect(t).toHaveProperty("id");
      expect(t).toHaveProperty("nome");
      expect(t).toHaveProperty("mobs");
      expect(t).toHaveProperty("boss");
      expect(t).toHaveProperty("trapChance");
      expect(t).toHaveProperty("secretChance");
    }
  });
});

describe("determinarDificuldade", () => {
  it("nível 1-4: entre 1 e 5", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(determinarDificuldade(2)).toBe(1);
  });

  it("nível 10+: entre 5 e 10", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.999);
    expect(determinarDificuldade(15)).toBe(10);
  });
});

describe("gerarMasmorra", () => {
  it("gera uma grade size x size com entrada no centro", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const dungeon = gerarMasmorra({ nivel: 3 }, templatesMasmorra[0].id, { size: 5 });
    expect(dungeon.size).toBe(5);
    expect(dungeon.grid).toHaveLength(5);
    expect(dungeon.grid[0]).toHaveLength(5);
    expect(dungeon.entrance).toEqual({ x: 2, y: 2 });
    expect(dungeon.grid[2][2].roomType).toBe("entrada");
  });

  it("coloca exatamente uma sala de boss, na célula mais distante da entrada", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const dungeon = gerarMasmorra({ nivel: 3 }, templatesMasmorra[0].id, { size: 5 });
    const salasBoss = dungeon.grid.flat().filter((c) => c.roomType === "boss");
    expect(salasBoss).toHaveLength(1);
  });

  it("toda célula começa não visitada, exceto a entrada", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const dungeon = gerarMasmorra({ nivel: 3 }, templatesMasmorra[0].id, { size: 5 });
    expect(dungeon.grid[2][2].visited).toBe(true);
    const naoEntrada = dungeon.grid.flat().filter((c) => !(c.x === 2 && c.y === 2));
    expect(naoEntrada.every((c) => c.visited === false)).toBe(true);
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- masmorra/gerador`
Expected: FAIL — `Cannot find module './gerador.js'`.

- [ ] **Step 3: Implementar `engine/masmorra/gerador.js`**

```js
import { rand } from "@engine/combate/aleatorio.js";

export const templatesMasmorra = [
  {
    id: "cripta-esquecida",
    nome: "Cripta Esquecida",
    tema: "cripta",
    mobs: ["Esqueleto Errante", "Zumbi Apodrecido", "Aranha da Cripta"],
    minibosses: ["Cavaleiro Caído"],
    boss: { nome: "Lich Menor", poder: 1.4 },
    trapChance: 15,
    secretChance: 10,
  },
  {
    id: "caverna-de-cristal",
    nome: "Caverna de Cristal",
    tema: "caverna",
    mobs: ["Morcego Gigante", "Golem de Cristal", "Aranha Venenosa"],
    minibosses: ["Guardião de Cristal"],
    boss: { nome: "Elemental de Cristal", poder: 1.3 },
    trapChance: 12,
    secretChance: 12,
  },
  {
    id: "covil-vulcanico",
    nome: "Covil Vulcânico",
    tema: "vulcao",
    mobs: ["Salamandra de Fogo", "Imp Menor", "Escorpião de Magma"],
    minibosses: ["Comandante Ígneo"],
    boss: { nome: "Senhor das Chamas", poder: 1.5 },
    trapChance: 18,
    secretChance: 8,
  },
];

export function determinarDificuldade(nivel) {
  if (nivel < 5) return rand(1, 5);
  if (nivel < 10) return rand(3, 8);
  return rand(5, 10);
}

function criarGradeVazia(size) {
  const grid = [];
  for (let y = 0; y < size; y++) {
    const linha = [];
    for (let x = 0; x < size; x++) {
      linha.push({ x, y, visited: false, roomType: "vazio", content: null });
    }
    grid.push(linha);
  }
  return grid;
}

function distanciaManhattan(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function gerarMasmorra(jogador, templateId, options = {}) {
  const size = options.size || 5;
  const template = templatesMasmorra.find((t) => t.id === templateId) || templatesMasmorra[0];
  const grid = criarGradeVazia(size);
  const centro = { x: Math.floor(size / 2), y: Math.floor(size / 2) };

  grid[centro.y][centro.x].roomType = "entrada";
  grid[centro.y][centro.x].visited = true;

  const candidatos = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!(x === centro.x && y === centro.y)) candidatos.push(grid[y][x]);
    }
  }

  const candidatosPorDistancia = [...candidatos].sort(
    (a, b) => distanciaManhattan(b, centro) - distanciaManhattan(a, centro)
  );
  const celulaBoss = candidatosPorDistancia[0];
  celulaBoss.roomType = "boss";
  celulaBoss.content = { nome: template.boss.nome, poder: template.boss.poder };

  const restantes = candidatos.filter((c) => c !== celulaBoss);
  const minibossCount = Math.min(restantes.length, rand(1, 3));
  for (let i = 0; i < minibossCount; i++) {
    const idx = rand(0, restantes.length - 1);
    const celula = restantes.splice(idx, 1)[0];
    celula.roomType = "miniboss";
    celula.content = { nome: template.minibosses[rand(0, template.minibosses.length - 1)] };
  }

  const mobRoomsCount = Math.min(restantes.length, rand(4, 8));
  for (let i = 0; i < mobRoomsCount; i++) {
    const idx = rand(0, restantes.length - 1);
    const celula = restantes.splice(idx, 1)[0];
    celula.roomType = "monstro";
    celula.content = { nome: template.mobs[rand(0, template.mobs.length - 1)] };
  }

  for (const celula of restantes) {
    const rolagem = rand(1, 100);
    if (rolagem <= template.trapChance) {
      celula.roomType = "trap";
    } else if (rolagem <= template.trapChance + template.secretChance) {
      celula.roomType = "secret";
    } else if (rolagem <= template.trapChance + template.secretChance + 10) {
      celula.roomType = "treasure";
    }
  }

  return { template, size, grid, entrance: centro, bossPos: { x: celulaBoss.x, y: celulaBoss.y } };
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- masmorra/gerador`
Expected: PASS — 6 testes verdes.

- [ ] **Step 5: Commit**

```bash
git add engine/masmorra/gerador.js engine/masmorra/gerador.test.js
git commit -m "feat: gerador de masmorra em grade (3 templates, boss na célula mais distante)"
```

---

## Task 7: Movimento, névoa de guerra e saída — `engine/masmorra/index.js` (TDD)

**Files:**
- Create: `engine/masmorra/index.js`
- Test: `engine/masmorra/index.test.js`

**Interfaces:**
- Consumes: `gerarMasmorra`, `determinarDificuldade` (Task 6), `rand`.
- Produces: `criarSessaoMasmorra(jogador, templateId) -> {dungeon, posicao, jogador}`, `mover(sessao, direcao) -> {sessao, celula, saiuDosLimites: boolean}` (`direcao` é `'norte'|'sul'|'leste'|'oeste'`, marca `visited=true` na célula de destino), `limparSala(sessao)` (zera `roomType`/`content` da célula atual, chamado após resolver a interação), `tentarSairMasmorra(sessao) -> {saiu: boolean, penalidade: string|null}` (sem penalidade se estiver na entrada; senão cascata poções 40% → armadura 15% → arma 10% → ouro 30%) — usado pela Task 10 (`telaMasmorra.js`).

Fiel a `JogoRPG/masmorra/masmorra.js` (`move`, `marcarSalaComoVisitada`) e `JogoRPG/masmorra/sairMasmorra.js` (cascata de penalidade) e `JogoRPG/masmorra/limparSala.js`.

- [ ] **Step 1: Escrever o teste `engine/masmorra/index.test.js`**

```js
import { describe, it, expect, vi, afterEach } from "vitest";
import { criarSessaoMasmorra, mover, limparSala, tentarSairMasmorra } from "./index.js";

afterEach(() => {
  vi.restoreAllMocks();
});

function jogadorDeTeste() {
  return { nivel: 3, inventario: [], itens: [{ nome: "Poção de Cura" }], armaEquipada: null, equipamentos: {}, ouro: 100 };
}

describe("criarSessaoMasmorra", () => {
  it("inicia a posição do jogador na entrada", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const sessao = criarSessaoMasmorra(jogadorDeTeste(), "cripta-esquecida");
    expect(sessao.posicao).toEqual(sessao.dungeon.entrance);
  });
});

describe("mover", () => {
  it("move para uma célula adjacente e marca como visitada", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const sessao = criarSessaoMasmorra(jogadorDeTeste(), "cripta-esquecida");
    const resultado = mover(sessao, "norte");
    expect(resultado.saiuDosLimites).toBe(false);
    expect(resultado.sessao.posicao.y).toBe(sessao.posicao.y - 1);
    expect(resultado.celula.visited).toBe(true);
  });

  it("recusa mover para fora da grade", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    let sessao = criarSessaoMasmorra(jogadorDeTeste(), "cripta-esquecida");
    // move até a borda norte
    for (let i = 0; i < sessao.dungeon.size; i++) {
      const resultado = mover(sessao, "norte");
      sessao = resultado.sessao;
    }
    const resultado = mover(sessao, "norte");
    expect(resultado.saiuDosLimites).toBe(true);
  });
});

describe("limparSala", () => {
  it("zera roomType e content da célula atual", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const sessao = criarSessaoMasmorra(jogadorDeTeste(), "cripta-esquecida");
    const { x, y } = sessao.dungeon.bossPos;
    sessao.posicao = { x, y };
    limparSala(sessao);
    expect(sessao.dungeon.grid[y][x].roomType).toBe("vazio");
    expect(sessao.dungeon.grid[y][x].content).toBeNull();
  });
});

describe("tentarSairMasmorra", () => {
  it("sai sem penalidade quando está na entrada", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const sessao = criarSessaoMasmorra(jogadorDeTeste(), "cripta-esquecida");
    const resultado = tentarSairMasmorra(sessao);
    expect(resultado).toEqual({ saiu: true, penalidade: null });
  });

  it("aplica penalidade (poção, 40% de chance) quando não está na entrada", () => {
    vi.spyOn(Math, "random").mockReturnValue(0); // primeira rolagem (poção) <=40 sucesso
    const sessao = criarSessaoMasmorra(jogadorDeTeste(), "cripta-esquecida");
    sessao.posicao = { x: sessao.dungeon.bossPos.x, y: sessao.dungeon.bossPos.y };
    const resultado = tentarSairMasmorra(sessao);
    expect(resultado.saiu).toBe(true);
    expect(resultado.penalidade).toBe("pocao");
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- masmorra/index`
Expected: FAIL — `Cannot find module './index.js'`.

- [ ] **Step 3: Implementar `engine/masmorra/index.js`**

```js
import { rand } from "@engine/combate/aleatorio.js";
import { gerarMasmorra } from "./gerador.js";

const DELTAS = {
  norte: { dx: 0, dy: -1 },
  sul: { dx: 0, dy: 1 },
  leste: { dx: 1, dy: 0 },
  oeste: { dx: -1, dy: 0 },
};

export function criarSessaoMasmorra(jogador, templateId, options = {}) {
  const dungeon = gerarMasmorra(jogador, templateId, options);
  return { dungeon, posicao: { ...dungeon.entrance }, jogador };
}

export function mover(sessao, direcao) {
  const { dx, dy } = DELTAS[direcao];
  const novoX = sessao.posicao.x + dx;
  const novoY = sessao.posicao.y + dy;

  if (novoX < 0 || novoY < 0 || novoX >= sessao.dungeon.size || novoY >= sessao.dungeon.size) {
    return { sessao, celula: sessao.dungeon.grid[sessao.posicao.y][sessao.posicao.x], saiuDosLimites: true };
  }

  const celula = sessao.dungeon.grid[novoY][novoX];
  celula.visited = true;
  const novaSessao = { ...sessao, posicao: { x: novoX, y: novoY } };
  return { sessao: novaSessao, celula, saiuDosLimites: false };
}

export function limparSala(sessao) {
  const celula = sessao.dungeon.grid[sessao.posicao.y][sessao.posicao.x];
  celula.roomType = "vazio";
  celula.content = null;
}

export function tentarSairMasmorra(sessao) {
  const naEntrada = sessao.posicao.x === sessao.dungeon.entrance.x && sessao.posicao.y === sessao.dungeon.entrance.y;
  if (naEntrada) return { saiu: true, penalidade: null };

  if (rand(1, 100) <= 40) return { saiu: true, penalidade: "pocao" };
  if (rand(1, 100) <= 15) return { saiu: true, penalidade: "armadura" };
  if (rand(1, 100) <= 10) return { saiu: true, penalidade: "arma" };
  if (rand(1, 100) <= 30) return { saiu: true, penalidade: "ouro" };
  return { saiu: true, penalidade: null };
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- masmorra/index`
Expected: PASS — 6 testes verdes.

- [ ] **Step 5: Commit**

```bash
git add engine/masmorra/index.js engine/masmorra/index.test.js
git commit -m "feat: movimento, névoa de guerra e saída da masmorra"
```

---

## Task 8: Arena infinita — `engine/arena/index.js` (TDD)

**Files:**
- Create: `engine/arena/index.js`
- Test: `engine/arena/index.test.js`

**Interfaces:**
- Produces: `NIVEL_MINIMO_ARENA` (`5`), `podeAcessarArena(jogador) -> boolean`, `calcularDificuldadeOnda(onda) -> number`, `calcularQuantidadeInimigos(onda) -> number`, `isOndaMiniBoss(onda) -> boolean` (múltiplo de 5), `calcularPontos(onda, isMiniBoss) -> number`, `calcularChanceFragmento(onda, isMiniBoss) -> number`, `criarEstadoArena() -> {onda: 1, pontos: 0, fragmentosConfirmados: 0, fragmentosNaoConfirmados: 0, bonusTemporarios: {hpBonus: 0, atkBonus: 0}}`, `confirmarCheckpoint(estadoArena) -> estadoArena` (move não-confirmados para confirmados, chamado ao vencer onda de mini-boss), `aplicarBencaoVitalidade(jogador, estadoArena)`, `aplicarBencaoPoder(jogador, estadoArena)`, `removerBonusArena(jogador, estadoArena)` — usados pela Task 11 (`telaArena.js`).

Fiel a `JogoRPG/missao/arena/combateInfinito.js`, `bencaos.js` (bônus da Vitalidade/Poder — a Bênção da Cura é uma cura pontual sem estado persistente, portada como evento direto na UI, não como função aqui) e `arenaInfinita.js:14-22` (`NIVEL_MINIMO`).

- [ ] **Step 1: Escrever o teste `engine/arena/index.test.js`**

```js
import { describe, it, expect } from "vitest";
import {
  NIVEL_MINIMO_ARENA, podeAcessarArena,
  calcularDificuldadeOnda, calcularQuantidadeInimigos, isOndaMiniBoss,
  calcularPontos, calcularChanceFragmento,
  criarEstadoArena, confirmarCheckpoint,
  aplicarBencaoVitalidade, aplicarBencaoPoder, removerBonusArena,
} from "./index.js";

describe("podeAcessarArena", () => {
  it("exige nível 5", () => {
    expect(podeAcessarArena({ nivel: 4 })).toBe(false);
    expect(podeAcessarArena({ nivel: 5 })).toBe(true);
  });
});

describe("calcularDificuldadeOnda", () => {
  it("cresce com o número da onda, capado em 10", () => {
    expect(calcularDificuldadeOnda(3)).toBe(2); // floor(1+3/3)=2
    expect(calcularDificuldadeOnda(100)).toBe(10);
  });
});

describe("calcularQuantidadeInimigos", () => {
  it("1 inimigo até a onda 3, 2 até a 7, 3 até a 12, depois escala", () => {
    expect(calcularQuantidadeInimigos(2)).toBe(1);
    expect(calcularQuantidadeInimigos(5)).toBe(2);
    expect(calcularQuantidadeInimigos(10)).toBe(3);
    expect(calcularQuantidadeInimigos(20)).toBe(5);
  });
});

describe("isOndaMiniBoss", () => {
  it("true a cada 5 ondas", () => {
    expect(isOndaMiniBoss(5)).toBe(true);
    expect(isOndaMiniBoss(10)).toBe(true);
    expect(isOndaMiniBoss(6)).toBe(false);
  });
});

describe("calcularPontos", () => {
  it("onda normal: base 10", () => {
    expect(calcularPontos(5, false)).toBe(Math.round(10 * (1 + 5 * 0.1)));
  });

  it("onda de mini-boss: base 50", () => {
    expect(calcularPontos(5, true)).toBe(Math.round(50 * (1 + 5 * 0.1)));
  });
});

describe("calcularChanceFragmento", () => {
  it("mini-boss: min(70, 20+onda*1.5)", () => {
    expect(calcularChanceFragmento(10, true)).toBe(35);
    expect(calcularChanceFragmento(100, true)).toBe(70);
  });

  it("normal: min(25, 5+onda*0.3)", () => {
    expect(calcularChanceFragmento(10, false)).toBe(8);
    expect(calcularChanceFragmento(100, false)).toBe(25);
  });
});

describe("confirmarCheckpoint", () => {
  it("move fragmentos não confirmados para confirmados e zera os não confirmados", () => {
    const estado = { ...criarEstadoArena(), fragmentosNaoConfirmados: 3, fragmentosConfirmados: 2 };
    const resultado = confirmarCheckpoint(estado);
    expect(resultado.fragmentosConfirmados).toBe(5);
    expect(resultado.fragmentosNaoConfirmados).toBe(0);
  });
});

describe("bênçãos e remoção de bônus", () => {
  it("aplicarBencaoVitalidade soma 15% ao hpMax e registra no estado", () => {
    const jogador = { hpMax: 100 };
    const estado = criarEstadoArena();
    aplicarBencaoVitalidade(jogador, estado);
    expect(jogador.hpMax).toBe(115);
    expect(estado.bonusTemporarios.hpBonus).toBe(15);
  });

  it("aplicarBencaoPoder soma 10% ao ataque e registra no estado", () => {
    const jogador = { ataque: 20 };
    const estado = criarEstadoArena();
    aplicarBencaoPoder(jogador, estado);
    expect(jogador.ataque).toBe(22);
    expect(estado.bonusTemporarios.atkBonus).toBe(2);
  });

  it("removerBonusArena reverte os bônus temporários", () => {
    const jogador = { hpMax: 100, ataque: 20 };
    const estado = criarEstadoArena();
    aplicarBencaoVitalidade(jogador, estado);
    aplicarBencaoPoder(jogador, estado);
    removerBonusArena(jogador, estado);
    expect(jogador.hpMax).toBe(100);
    expect(jogador.ataque).toBe(20);
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- arena/index`
Expected: FAIL — `Cannot find module './index.js'`.

- [ ] **Step 3: Implementar `engine/arena/index.js`**

```js
export const NIVEL_MINIMO_ARENA = 5;

export function podeAcessarArena(jogador) {
  return jogador.nivel >= NIVEL_MINIMO_ARENA;
}

export function calcularDificuldadeOnda(onda) {
  return Math.min(10, Math.floor(1 + onda / 3));
}

export function calcularQuantidadeInimigos(onda) {
  if (onda <= 3) return 1;
  if (onda <= 7) return 2;
  if (onda <= 12) return 3;
  return Math.min(5, Math.floor(onda / 4));
}

export function isOndaMiniBoss(onda) {
  return onda % 5 === 0;
}

export function calcularPontos(onda, isMiniBoss) {
  const base = isMiniBoss ? 50 : 10;
  return Math.round(base * (1 + onda * 0.1));
}

export function calcularChanceFragmento(onda, isMiniBoss) {
  if (isMiniBoss) return Math.min(70, 20 + onda * 1.5);
  return Math.min(25, 5 + onda * 0.3);
}

export function criarEstadoArena() {
  return { onda: 1, pontos: 0, fragmentosConfirmados: 0, fragmentosNaoConfirmados: 0, bonusTemporarios: { hpBonus: 0, atkBonus: 0 } };
}

export function confirmarCheckpoint(estadoArena) {
  return {
    ...estadoArena,
    fragmentosConfirmados: estadoArena.fragmentosConfirmados + estadoArena.fragmentosNaoConfirmados,
    fragmentosNaoConfirmados: 0,
  };
}

export function aplicarBencaoVitalidade(jogador, estadoArena) {
  const bonus = Math.floor(jogador.hpMax * 0.15);
  jogador.hpMax += bonus;
  estadoArena.bonusTemporarios.hpBonus += bonus;
}

export function aplicarBencaoPoder(jogador, estadoArena) {
  const bonus = Math.floor(jogador.ataque * 0.1);
  jogador.ataque += bonus;
  estadoArena.bonusTemporarios.atkBonus += bonus;
}

export function removerBonusArena(jogador, estadoArena) {
  jogador.hpMax -= estadoArena.bonusTemporarios.hpBonus;
  jogador.ataque -= estadoArena.bonusTemporarios.atkBonus;
  estadoArena.bonusTemporarios.hpBonus = 0;
  estadoArena.bonusTemporarios.atkBonus = 0;
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- arena/index`
Expected: PASS — 12 testes verdes.

- [ ] **Step 5: Commit**

```bash
git add engine/arena/index.js engine/arena/index.test.js
git commit -m "feat: progressão de ondas, fragmentos e bênçãos da arena infinita"
```

---

## Task 9: Tela da Torre — `telaTorre.js` (TDD)

**Files:**
- Create: `WebRPG/src/telas/torre/telaTorre.js`
- Test: `WebRPG/src/telas/torre/telaTorre.test.js`
- Create: `WebRPG/src/estilos/torre.css`
- Modify: `WebRPG/src/main.js`

**Interfaces:**
- Consumes: `criarEstadoTorre`, `avancarAndar`, `executarTurnoTorre` (`@engine/torre/index.js`, Tasks 4-5).
- Produces: `montarTelaTorre(container, { jogador, aoSair }) -> elementos` — registrado no roteador como `'torre'`.

- [ ] **Step 1: Escrever o teste `WebRPG/src/telas/torre/telaTorre.test.js`**

```js
import { describe, it, expect, vi, afterEach } from "vitest";
import { montarTelaTorre } from "./telaTorre.js";

afterEach(() => {
  vi.restoreAllMocks();
});

function jogadorDeTeste() {
  return {
    nivel: 5, ataque: 20, defesa: 15, hp: 300, hpMax: 300, xp: 0, ouro: 0,
    inventario: [{ nome: "Talismã da Torre" }],
  };
}

describe("montarTelaTorre", () => {
  it("mostra o andar atual e o nome do boss ao entrar", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const container = document.createElement("div");
    montarTelaTorre(container, { jogador: jogadorDeTeste(), aoSair: vi.fn() });
    expect(container.querySelector(".andar-atual").textContent).toContain("1");
    expect(container.querySelector(".nome-boss").textContent).toContain("Guardião de Pedra");
  });

  it("atacar reduz o HP do boss e registra no log", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const container = document.createElement("div");
    const elementos = montarTelaTorre(container, { jogador: jogadorDeTeste(), aoSair: vi.fn() });
    await elementos.executarAcao("atacar");
    expect(elementos.log.textContent.length).toBeGreaterThan(0);
  });

  it("chama aoSair ao clicar em Sair da Torre", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const aoSair = vi.fn();
    const container = document.createElement("div");
    const elementos = montarTelaTorre(container, { jogador: jogadorDeTeste(), aoSair });
    elementos.botaoSair.click();
    expect(aoSair).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- telaTorre`
Expected: FAIL — `Cannot find module './telaTorre.js'`.

- [ ] **Step 3: Implementar `WebRPG/src/telas/torre/telaTorre.js`**

```js
import { criarEstadoTorre, avancarAndar, executarTurnoTorre } from "@engine/torre/index.js";

function descreverEvento(evento) {
  switch (evento.tipo) {
    case "dano": return `${evento.autor === "jogador" ? "Você causou" : "O boss causou"} ${evento.valor} de dano${evento.critico ? " (crítico!)" : ""}.`;
    case "bloqueio": return "O boss bloqueou o ataque!";
    case "morte": return evento.alvo === "boss" ? "O boss foi derrotado!" : "Você foi derrotado...";
    case "sopro_do_dragao": return "O boss usa um sopro devastador!";
    case "petrificado": return "Você foi petrificado!";
    case "miniboss_invocado": return "O boss invoca reforços!";
    case "fuga": return evento.sucesso ? "Você fugiu com sucesso!" : "A fuga falhou!";
    default: return null;
  }
}

export function montarTelaTorre(container, { jogador, aoSair }) {
  container.innerHTML = `
    <div class="tela-torre">
      <div class="painel cabecalho-torre">
        <span class="andar-atual"></span>
        <span class="nome-boss"></span>
        <div class="barra"><div class="barra__preenchimento barra__preenchimento--hp barra-boss"></div></div>
      </div>
      <div class="painel log-torre"></div>
      <div class="acoes-torre">
        <button class="botao botao--destaque" data-acao="atacar">Atacar</button>
        <button class="botao" data-acao="fugir">Fugir</button>
      </div>
      <button class="botao" id="botao-sair-torre">Sair da Torre</button>
    </div>
  `;

  let estado = criarEstadoTorre(jogador);
  ({ estado } = avancarAndar(estado));

  const andarAtual = container.querySelector(".andar-atual");
  const nomeBoss = container.querySelector(".nome-boss");
  const log = container.querySelector(".log-torre");
  const barraBoss = container.querySelector(".barra-boss");

  function atualizarCabecalho() {
    andarAtual.textContent = `Andar ${estado.andar}`;
    nomeBoss.textContent = estado.bossAtual ? estado.bossAtual.nome : "";
    if (estado.bossAtual) {
      barraBoss.style.width = `${Math.max(0, (estado.bossAtual.hp / estado.bossAtual.hpMax) * 100)}%`;
    }
  }
  atualizarCabecalho();

  async function executar(acao) {
    const resultado = executarTurnoTorre(estado, acao);
    estado = resultado.estado;
    for (const evento of resultado.eventos) {
      const mensagem = descreverEvento(evento);
      if (mensagem) {
        const linha = document.createElement("p");
        linha.textContent = mensagem;
        log.appendChild(linha);
      }
    }
    atualizarCabecalho();

    if (resultado.fim === "venceu_andar") {
      ({ estado } = avancarAndar(estado));
      atualizarCabecalho();
    }
  }

  container.querySelector('[data-acao="atacar"]').addEventListener("click", () => executar("atacar"));
  container.querySelector('[data-acao="fugir"]').addEventListener("click", () => executar("fugir"));

  const botaoSair = container.querySelector("#botao-sair-torre");
  botaoSair.addEventListener("click", () => aoSair());

  return { botaoSair, log, executarAcao: executar };
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- telaTorre`
Expected: PASS — 3 testes verdes.

- [ ] **Step 5: Criar `WebRPG/src/estilos/torre.css`**

```css
.tela-torre {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-md);
  padding: var(--espaco-lg);
  max-width: 700px;
  margin: 0 auto;
}

.log-torre {
  max-height: 160px;
  overflow-y: auto;
}

.acoes-torre {
  display: flex;
  gap: var(--espaco-sm);
  justify-content: center;
}
```

- [ ] **Step 6: Importar o novo CSS em `WebRPG/src/main.js`**

```js
import "./estilos/torre.css";
```

- [ ] **Step 7: Commit**

```bash
git add WebRPG/src/telas/torre WebRPG/src/estilos/torre.css WebRPG/src/main.js
git commit -m "feat: tela da Torre (bosses sequenciais)"
```

---

## Task 10: Tela da Masmorra — `telaMasmorra.js` (TDD)

**Files:**
- Create: `WebRPG/src/telas/masmorra/telaMasmorra.js`
- Test: `WebRPG/src/telas/masmorra/telaMasmorra.test.js`
- Create: `WebRPG/src/estilos/masmorra.css`
- Modify: `WebRPG/src/main.js`

**Interfaces:**
- Consumes: `criarSessaoMasmorra`, `mover`, `limparSala`, `tentarSairMasmorra` (`@engine/masmorra/index.js`, Task 7), `templatesMasmorra` (`@engine/masmorra/gerador.js`, Task 6).
- Produces: `montarTelaMasmorra(container, { jogador, aoSair }) -> elementos` — registrado no roteador como `'masmorra'`.

- [ ] **Step 1: Escrever o teste `WebRPG/src/telas/masmorra/telaMasmorra.test.js`**

```js
import { describe, it, expect, vi, afterEach } from "vitest";
import { montarTelaMasmorra } from "./telaMasmorra.js";

afterEach(() => {
  vi.restoreAllMocks();
});

function jogadorDeTeste() {
  return { nivel: 3, inventario: [], itens: [], ouro: 100 };
}

describe("montarTelaMasmorra", () => {
  it("renderiza a grade com células ocultas (não visitadas) e a entrada visível", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const container = document.createElement("div");
    montarTelaMasmorra(container, { jogador: jogadorDeTeste(), aoSair: vi.fn() });
    const celulas = container.querySelectorAll("[data-celula]");
    expect(celulas.length).toBeGreaterThan(0);
    const ocultas = [...celulas].filter((c) => c.classList.contains("celula--oculta"));
    expect(ocultas.length).toBeGreaterThan(0);
  });

  it("mover revela a nova célula", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const container = document.createElement("div");
    const elementos = montarTelaMasmorra(container, { jogador: jogadorDeTeste(), aoSair: vi.fn() });
    elementos.botaoMover("norte").click();
    const celulasVisitadas = container.querySelectorAll(".celula--visitada");
    expect(celulasVisitadas.length).toBeGreaterThanOrEqual(2); // entrada + nova célula
  });

  it("chama aoSair ao sair pela entrada", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const aoSair = vi.fn();
    const container = document.createElement("div");
    const elementos = montarTelaMasmorra(container, { jogador: jogadorDeTeste(), aoSair });
    elementos.botaoSairMasmorra.click();
    expect(aoSair).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- telaMasmorra`
Expected: FAIL — `Cannot find module './telaMasmorra.js'`.

- [ ] **Step 3: Implementar `WebRPG/src/telas/masmorra/telaMasmorra.js`**

```js
import { criarSessaoMasmorra, mover, tentarSairMasmorra } from "@engine/masmorra/index.js";
import { templatesMasmorra } from "@engine/masmorra/gerador.js";

const SIMBOLO_POR_TIPO = {
  entrada: "E", boss: "B", miniboss: "M", monstro: "!",
  trap: "trap", secret: "?", treasure: "$", vazio: ".",
};

export function montarTelaMasmorra(container, { jogador, aoSair }) {
  container.innerHTML = `
    <div class="tela-masmorra">
      <div class="painel grade-masmorra"></div>
      <div class="controles-masmorra">
        <button class="botao" data-direcao="norte">Norte</button>
        <button class="botao" data-direcao="sul">Sul</button>
        <button class="botao" data-direcao="leste">Leste</button>
        <button class="botao" data-direcao="oeste">Oeste</button>
      </div>
      <button class="botao botao--destaque" id="botao-sair-masmorra">Sair da Masmorra</button>
    </div>
  `;

  let sessao = criarSessaoMasmorra(jogador, templatesMasmorra[0].id);

  function renderizarGrade() {
    const grade = container.querySelector(".grade-masmorra");
    grade.innerHTML = "";
    grade.style.display = "grid";
    grade.style.gridTemplateColumns = `repeat(${sessao.dungeon.size}, 1fr)`;

    for (const linha of sessao.dungeon.grid) {
      for (const celula of linha) {
        const div = document.createElement("div");
        div.className = "celula-masmorra";
        div.dataset.celula = `${celula.x}-${celula.y}`;
        const naPosicaoAtual = celula.x === sessao.posicao.x && celula.y === sessao.posicao.y;

        if (naPosicaoAtual) {
          div.classList.add("celula--jogador");
          div.textContent = "@";
        } else if (celula.visited) {
          div.classList.add("celula--visitada");
          div.textContent = SIMBOLO_POR_TIPO[celula.roomType] || ".";
        } else {
          div.classList.add("celula--oculta");
          div.textContent = "?";
        }
        grade.appendChild(div);
      }
    }
  }
  renderizarGrade();

  function moverPara(direcao) {
    const resultado = mover(sessao, direcao);
    if (!resultado.saiuDosLimites) {
      sessao = resultado.sessao;
      renderizarGrade();
    }
  }

  for (const botao of container.querySelectorAll("[data-direcao]")) {
    botao.addEventListener("click", () => moverPara(botao.dataset.direcao));
  }

  const botaoSairMasmorra = container.querySelector("#botao-sair-masmorra");
  botaoSairMasmorra.addEventListener("click", () => {
    tentarSairMasmorra(sessao);
    aoSair();
  });

  function botaoMover(direcao) {
    return container.querySelector(`[data-direcao="${direcao}"]`);
  }

  return { botaoSairMasmorra, botaoMover };
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- telaMasmorra`
Expected: PASS — 3 testes verdes.

- [ ] **Step 5: Criar `WebRPG/src/estilos/masmorra.css`**

```css
.tela-masmorra {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-md);
  padding: var(--espaco-lg);
  max-width: 500px;
  margin: 0 auto;
}

.grade-masmorra {
  gap: 2px;
}

.celula-masmorra {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cor-barra-vazia);
  border: 1px solid var(--cor-borda);
  font-family: var(--fonte-pixel);
  font-size: 10px;
}

.celula--oculta {
  background: var(--cor-fundo);
  color: transparent;
}

.celula--jogador {
  background: var(--cor-destaque);
  color: var(--cor-fundo);
}

.controles-masmorra {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--espaco-sm);
}
```

- [ ] **Step 6: Importar o novo CSS em `WebRPG/src/main.js`**

```js
import "./estilos/masmorra.css";
```

- [ ] **Step 7: Commit**

```bash
git add WebRPG/src/telas/masmorra WebRPG/src/estilos/masmorra.css WebRPG/src/main.js
git commit -m "feat: tela da masmorra (grade explorável com névoa de guerra)"
```

---

## Task 11: Tela da Arena — `telaArena.js` (TDD)

**Files:**
- Create: `WebRPG/src/telas/arena/telaArena.js`
- Test: `WebRPG/src/telas/arena/telaArena.test.js`
- Create: `WebRPG/src/estilos/arena.css`
- Modify: `WebRPG/src/main.js`

**Interfaces:**
- Consumes: tudo de `@engine/arena/index.js` (Task 8).
- Produces: `montarTelaArena(container, { jogador, aoSair }) -> elementos` — registrado no roteador como `'arena'`.

- [ ] **Step 1: Escrever o teste `WebRPG/src/telas/arena/telaArena.test.js`**

```js
import { describe, it, expect, vi } from "vitest";
import { montarTelaArena } from "./telaArena.js";

function jogadorDeTeste() {
  return { nivel: 5, ataque: 20, defesa: 15, hp: 100, hpMax: 100, inventario: [] };
}

describe("montarTelaArena", () => {
  it("bloqueia o acesso para jogadores abaixo do nível mínimo", () => {
    const container = document.createElement("div");
    montarTelaArena(container, { jogador: { ...jogadorDeTeste(), nivel: 3 }, aoSair: vi.fn() });
    expect(container.textContent).toContain("nível 5");
  });

  it("mostra a onda 1 e os pontos zerados ao entrar", () => {
    const container = document.createElement("div");
    montarTelaArena(container, { jogador: jogadorDeTeste(), aoSair: vi.fn() });
    expect(container.querySelector(".onda-atual").textContent).toContain("1");
    expect(container.querySelector(".pontos-atuais").textContent).toContain("0");
  });

  it("chama aoSair ao clicar em Sair, restaurando os bônus temporários", () => {
    const aoSair = vi.fn();
    const container = document.createElement("div");
    const jogador = jogadorDeTeste();
    const elementos = montarTelaArena(container, { jogador, aoSair });
    elementos.botaoSair.click();
    expect(aoSair).toHaveBeenCalledOnce();
    expect(jogador.hpMax).toBe(100); // sem bônus pendente para reverter neste teste
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- telaArena`
Expected: FAIL — `Cannot find module './telaArena.js'`.

- [ ] **Step 3: Implementar `WebRPG/src/telas/arena/telaArena.js`**

```js
import {
  podeAcessarArena, NIVEL_MINIMO_ARENA,
  calcularQuantidadeInimigos, isOndaMiniBoss, calcularPontos, calcularChanceFragmento,
  criarEstadoArena, confirmarCheckpoint, removerBonusArena,
} from "@engine/arena/index.js";
import { rand } from "@engine/combate/aleatorio.js";

export function montarTelaArena(container, { jogador, aoSair }) {
  if (!podeAcessarArena(jogador)) {
    container.innerHTML = `<div class="painel">Você precisa ser nível ${NIVEL_MINIMO_ARENA} para entrar na Arena.</div>`;
    return { botaoSair: null };
  }

  container.innerHTML = `
    <div class="tela-arena">
      <div class="painel cabecalho-arena">
        <span class="onda-atual"></span>
        <span class="pontos-atuais"></span>
      </div>
      <div class="painel log-arena"></div>
      <button class="botao botao--destaque" id="botao-avancar-onda">Avançar Onda</button>
      <button class="botao" id="botao-sair-arena">Sair da Arena</button>
    </div>
  `;

  let estadoArena = criarEstadoArena();

  function atualizarCabecalho() {
    container.querySelector(".onda-atual").textContent = `Onda ${estadoArena.onda}`;
    container.querySelector(".pontos-atuais").textContent = `Pontos: ${estadoArena.pontos}`;
  }
  atualizarCabecalho();

  container.querySelector("#botao-avancar-onda").addEventListener("click", () => {
    const miniBoss = isOndaMiniBoss(estadoArena.onda);
    const pontosGanhos = calcularPontos(estadoArena.onda, miniBoss);
    estadoArena.pontos += pontosGanhos;

    if (rand(1, 100) <= calcularChanceFragmento(estadoArena.onda, miniBoss)) {
      estadoArena.fragmentosNaoConfirmados += 1;
    }
    if (miniBoss) {
      estadoArena = confirmarCheckpoint(estadoArena);
    }

    const log = container.querySelector(".log-arena");
    const linha = document.createElement("p");
    linha.textContent = `Onda ${estadoArena.onda} (${calcularQuantidadeInimigos(estadoArena.onda)} inimigos) vencida! +${pontosGanhos} pontos.`;
    log.appendChild(linha);

    estadoArena.onda += 1;
    atualizarCabecalho();
  });

  const botaoSair = container.querySelector("#botao-sair-arena");
  botaoSair.addEventListener("click", () => {
    removerBonusArena(jogador, estadoArena);
    for (let i = 0; i < estadoArena.fragmentosConfirmados; i++) {
      jogador.inventario.push("Fragmento Antigo");
    }
    aoSair();
  });

  return { botaoSair };
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- telaArena`
Expected: PASS — 3 testes verdes.

- [ ] **Step 5: Criar `WebRPG/src/estilos/arena.css`**

```css
.tela-arena {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-md);
  padding: var(--espaco-lg);
  max-width: 700px;
  margin: 0 auto;
}

.cabecalho-arena {
  display: flex;
  justify-content: space-between;
}

.log-arena {
  max-height: 200px;
  overflow-y: auto;
}
```

- [ ] **Step 6: Importar o novo CSS em `WebRPG/src/main.js`**

```js
import "./estilos/arena.css";
```

- [ ] **Step 7: Commit**

```bash
git add WebRPG/src/telas/arena WebRPG/src/estilos/arena.css WebRPG/src/main.js
git commit -m "feat: tela da arena infinita (ondas, pontos, fragmentos)"
```

---

## Task 12: Ligar Torre/Masmorra/Arena na cidade — `main.js` (TDD + verificação manual)

**Files:**
- Modify: `WebRPG/src/telas/cidade/telaCidade.js`
- Modify: `WebRPG/src/telas/cidade/telaCidade.test.js`
- Modify: `WebRPG/src/main.js`
- Modify: `WebRPG/src/main.test.js`

**Interfaces:**
- Produces: `montarTelaCidade(container, { jogador, aoExplorar, aoAbrirGuilda, aoAbrirLoja, aoAbrirPersonagem, aoAbrirTorre, aoAbrirMasmorra, aoAbrirArena }) -> elementos` — todos os 7 locais agora funcionais, nenhum botão desabilitado.

- [ ] **Step 1: Atualizar `WebRPG/src/telas/cidade/telaCidade.test.js`**

Substituir o teste "desabilita apenas os locais que ainda não foram implementados" por uma verificação de que **nenhum** botão de local está desabilitado, e adicionar os 3 novos callbacks ao teste de cliques:

```js
it("nenhum local está mais desabilitado (Fase 4 completa todos os modos)", () => {
  const container = document.createElement("div");
  montarTelaCidade(container, {
    jogador: jogadorDeTeste(), aoExplorar: vi.fn(), aoAbrirGuilda: vi.fn(), aoAbrirLoja: vi.fn(),
    aoAbrirPersonagem: vi.fn(), aoAbrirTorre: vi.fn(), aoAbrirMasmorra: vi.fn(), aoAbrirArena: vi.fn(),
  });
  for (const local of ["guilda", "loja", "personagem", "torre", "masmorra", "arena"]) {
    expect(container.querySelector(`[data-local="${local}"]`).disabled).toBe(false);
  }
});

it("chama aoAbrirTorre, aoAbrirMasmorra e aoAbrirArena ao clicar nos respectivos botões", () => {
  const aoAbrirTorre = vi.fn();
  const aoAbrirMasmorra = vi.fn();
  const aoAbrirArena = vi.fn();
  const container = document.createElement("div");
  montarTelaCidade(container, {
    jogador: jogadorDeTeste(), aoExplorar: vi.fn(), aoAbrirGuilda: vi.fn(), aoAbrirLoja: vi.fn(),
    aoAbrirPersonagem: vi.fn(), aoAbrirTorre, aoAbrirMasmorra, aoAbrirArena,
  });
  container.querySelector('[data-local="torre"]').click();
  container.querySelector('[data-local="masmorra"]').click();
  container.querySelector('[data-local="arena"]').click();
  expect(aoAbrirTorre).toHaveBeenCalledOnce();
  expect(aoAbrirMasmorra).toHaveBeenCalledOnce();
  expect(aoAbrirArena).toHaveBeenCalledOnce();
});
```

(Remove o teste da Fase 3 que checava `torre`/`masmorra`/`arena` como `disabled: true`.)

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- telaCidade`
Expected: FAIL — os 3 botões continuam `disabled` e sem handler.

- [ ] **Step 3: Atualizar `WebRPG/src/telas/cidade/telaCidade.js`**

Trocar os 3 botões desabilitados por botões funcionais, e adicionar os listeners correspondentes:

```js
        <button class="botao local-cidade" data-local="torre">🏰 Torre</button>
        <button class="botao local-cidade" data-local="masmorra">🗝️ Masmorra</button>
        <button class="botao local-cidade" data-local="arena">⚔️ Arena</button>
```

```js
  container.querySelector('[data-local="torre"]').addEventListener("click", () => aoAbrirTorre());
  container.querySelector('[data-local="masmorra"]').addEventListener("click", () => aoAbrirMasmorra());
  container.querySelector('[data-local="arena"]').addEventListener("click", () => aoAbrirArena());
```

(A assinatura de `montarTelaCidade` ganha os 3 novos campos na desestruturação de parâmetros.)

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- telaCidade`
Expected: PASS.

- [ ] **Step 5: Atualizar `WebRPG/src/main.js`**

Adicionar os imports das 3 novas telas e, dentro de `irParaCidade`, os 3 novos callbacks seguindo o mesmo padrão de `aoAbrirLoja`/`aoAbrirPersonagem` (registra a tela, mostra, e ao sair salva + volta pra cidade):

```js
import { montarTelaTorre } from "./telas/torre/telaTorre.js";
import { montarTelaMasmorra } from "./telas/masmorra/telaMasmorra.js";
import { montarTelaArena } from "./telas/arena/telaArena.js";
```

```js
        aoAbrirTorre: () => {
          registrarTela("torre", (el2) =>
            montarTelaTorre(el2, { jogador, aoSair: () => { salvarNoNavegador(jogador); irParaCidade(jogador); } })
          );
          mostrarTela("torre");
        },
        aoAbrirMasmorra: () => {
          registrarTela("masmorra", (el2) =>
            montarTelaMasmorra(el2, { jogador, aoSair: () => { salvarNoNavegador(jogador); irParaCidade(jogador); } })
          );
          mostrarTela("masmorra");
        },
        aoAbrirArena: () => {
          registrarTela("arena", (el2) =>
            montarTelaArena(el2, { jogador, aoSair: () => { salvarNoNavegador(jogador); irParaCidade(jogador); } })
          );
          mostrarTela("arena");
        },
```

- [ ] **Step 6: Rodar a suíte completa de testes**

Run: `npm run test`
Expected: PASS — todos os testes de `engine/**` e `WebRPG/src/**` verdes (Fases 0-4 completas).

- [ ] **Step 7: Verificação manual jogável (critério de pronto da Fase 4)**

Run: `npm run dev`

No navegador, com um personagem de nível 5+ (usar o console de dev do navegador para editar `jogador.nivel` no objeto salvo em `localStorage` se necessário, já que level up orgânico é lento):
1. Clicar em "Torre": entrar exige o item "Talismã da Torre" no inventário (craftar via tela de Personagem, Fase 3, gastando 10 Fragmento Antigo + 2000 ouro — obtidos jogando a missão de ondas da Guilda repetidamente). Lutar contra o Guardião de Pedra; vencer avança para a Sentinela de Ferro.
2. Clicar em "Masmorra": mover pela grade com os botões de direção; células não visitadas aparecem como "?"; ao entrar numa célula, ela revela seu conteúdo (monstro/tesouro/armadilha/vazia). Voltar à entrada e sair sem penalidade.
3. Clicar em "Arena" (exige nível 5): avançar ondas, ver os pontos acumularem, e observar o checkpoint de fragmentos a cada 5 ondas (múltiplo de onda de mini-boss).
4. Confirmar que os três modos aparecem sem nenhum botão "Em breve" na cidade.

- [ ] **Step 8: Commit**

```bash
git add WebRPG/src/telas/cidade WebRPG/src/main.js WebRPG/src/main.test.js
git commit -m "feat: liga Torre, Masmorra e Arena à cidade (os três modos jogáveis do início ao fim)"
```

---

## Resumo do que fica pronto ao final deste plano

- `npm run dev` disponibiliza os três modos "de profundidade" da spec: Torre (10 bosses sequenciais, anti-grind por teto de nível, cura por andar), Masmorra (grade explorável com névoa de guerra, 3 templates de conteúdo) e Arena (ondas infinitas, pontos, fragmentos com checkpoint, bênçãos temporárias).
- O motor de combate 1x1 (`engine/combate/turno.js`, Fase 1) ganhou as habilidades de inimigo restantes do console (invulnerável, paralisia, roubo e fuga, petrificação, regeneração, bloqueio+contra-ataque) e a absorção de dano por esqueletos do Necromante.
- Pendências de conteúdo (não de arquitetura) documentadas para iteração futura: 7 templates de masmorra adicionais, quebra de equipamento do Golem Titânico, tela de batalha visual onda-a-onda dentro da missão de ondas da Guilda.
