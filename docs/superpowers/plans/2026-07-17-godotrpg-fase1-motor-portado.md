# GodotRPG Fase 1 — Motor Portado (`engine/` JS → `scripts/engine/` GDScript)

> **Para quem for executar:** cada task porta um grupo de módulos já testados em
> `engine/` (JS/Vitest) para GDScript/GUT, na ordem de dependência real do código
> (calculada por grep de `import` — seção "Ordem de dependência" abaixo). Não é
> um redesenho: é tradução mecânica verificada por teste espelhado, conforme a
> estratégia da seção 3.3 de
> [`specs/2026-07-17-godot-visual-design.md`](../specs/2026-07-17-godot-visual-design.md).

**Objetivo:** portar toda a lógica pura de `engine/` (30 arquivos `.js`, 33 suítes de teste,
252 testes) para `scripts/engine/` em GDScript, com testes GUT espelhando 1:1 os casos do
Vitest. Ao final desta fase, `scripts/engine/` é a fonte de verdade de regras de jogo dentro
do projeto Godot — as fases seguintes (2 em diante) só constroem cena/UI em cima dela.

**Fora desta fase (fica para quando a fase correspondente chegar, ver `docs.md`):**
Ferreiro, drops de item em combate, Néctar/relíquias lendárias, masmorras secretas — esses
módulos nunca chegaram a ser escritos nem em `engine/` (eram as Fases 12-14 do plano WebRPG,
planejadas e nunca executadas). Não faz sentido escrevê-los em JS só para portar de novo;
entram direto em GDScript nas Fases 5, 6 e 8 do GodotRPG.

**Exceção já decidida:** `masmorra/gerador.gd` porta de `JogoRPG/masmorra/masmorra.js:56-215`
(`DUNGEON_TEMPLATES`, a estrutura completa com os 10 temas/mobs/minibosses/boss reais), **não**
do `engine/masmorra/gerador.js` (versão simplificada, nomes genéricos, bosses reciclados da
Torre). Ver seção 3.3 de
[`specs/2026-07-17-lista-mestra-conteudo-sprites.md`](../specs/2026-07-17-lista-mestra-conteudo-sprites.md)
para a tabela definitiva (com os 3 nomes de boss já atualizados: Dolgarth, Vel'Thyra, Zerakth).

---

## Padrão de porte (aplica-se a toda task abaixo — não repetido em cada uma)

### Estrutura de arquivo

Cada módulo `engine/<pasta>/<arquivo>.js` vira `game/scripts/engine/<pasta>/<arquivo_em_snake_case>.gd`:

```gdscript
class_name Aleatorio
extends RefCounted

static func rand(minimo: int, maximo: int) -> int:
    ...
```

- `class_name` em PascalCase (nome do arquivo/módulo, ex.: `CalculoDano`, `EfeitosDeStatus`).
- Toda função exportada do `.js` vira `static func` em `snake_case` — chamada de qualquer
  lugar como `CalculoDano.calcular_ataque_jogador(...)`, sem precisar instanciar nada (mesma
  ergonomia de `import { calcularAtaqueJogador } from "..."`).
- `const` exportado (catálogos, tabelas) vira `const` estático no topo da classe.

### Dados: Dictionary, não classes novas

`jogador`, `inimigo`, eventos — tudo que no JS é um objeto solto vira `Dictionary` em
GDScript, com as mesmas chaves (`"hp"`, `"atk"`, `"classe"`, etc.), não uma classe/Resource
nova. Isso é deliberado: manter o formato de dado idêntico ao JS é o que permite comparar um
teste GUT com o teste Vitest linha a linha. Listas de eventos (`[{tipo: "dano", ...}]`) viram
`Array[Dictionary]`. Tipar essas estruturas com classes/Resources fica para quando a Fase 2
(UI de batalha) precisar — não é trabalho desta fase.

### O problema do `Math.random()` — e a solução

17 das 33 suítes de teste do `engine/` mockam `Math.random` diretamente
(`vi.spyOn(Math, "random").mockReturnValue(0.5)`) para tornar rolagens de dado determinísticas.
GDScript não permite substituir `randf()`/`randi()` globalmente do mesmo jeito. Solução: a
fonte de aleatoriedade vira uma `Callable` estática, trocável em teste — mesmo efeito prático
do `vi.spyOn`, só que explícito:

```gdscript
# scripts/engine/combate/aleatorio.gd
class_name Aleatorio
extends RefCounted

static var fonte: Callable = func() -> float: return randf()

static func rand(minimo: int, maximo: int) -> int:
    return floori(fonte.call() * (maximo - minimo + 1)) + minimo
```

Em teste GUT:

```gdscript
func before_each():
    Aleatorio.fonte = func() -> float: return 0.0  # equivalente a mockReturnValue(0)

func after_each():
    Aleatorio.fonte = func() -> float: return randf()  # equivalente a vi.restoreAllMocks()
```

Todo módulo que hoje importa `rand` de `aleatorio.js` passa a chamar `Aleatorio.rand(...)` —
e qualquer teste que precisar de um valor fixo troca `Aleatorio.fonte` no `before_each`,
exatamente como o Vitest troca `Math.random`.

### GUT — instalação (parte da Task 1)

O addon GUT (`bitwes/Gut`) não está no projeto — precisa ser baixado (~1MB, GitHub releases,
licença MIT). **Pedir confirmação ao usuário antes de baixar**, mesmo padrão já usado para a
fonte Press Start 2P na Fase 0.

**Instalado em `game/addons/gut/` (v9.7.1 — a v9.6.1 tem um segfault confirmado ao sair em
Godot 4.7.1, mesmo com todos os testes passando; a própria ferramenta avisa disso no output).**
Depois de criar/editar qualquer script novo com `class_name`, rodar `--import` de novo antes
dos testes — o cache de classes globais só é reindexado nesse passo, não automaticamente:

```
godot --headless --path game --import
```

Comando de verificação (headless, sem crash de saída — **sempre usar exatamente estas
flags**; sem `-ginclude_subdirs` o GUT não desce em `tests/<pasta>/`, e sem
`--rendering-driver opengl3` o processo dá segfault ao sair porque tenta inicializar o driver
D3D12 configurado no projeto mesmo em modo headless — o resultado dos testes aparece certo
antes do crash, mas o exit code fica errado e pode mascarar falha real em CI):

```
godot --headless --rendering-driver opengl3 --path game -s addons/gut/gut_cmdln.gd -gdir=res://tests -ginclude_subdirs -gexit
```

### Gotchas de GDScript encontrados durante o porte (não existem no JS original)

- **Concatenar `Array[Dictionary]` tipado com `+`** falha em runtime ("Trying to assign an
  array of type Array to a variable of type Array[Dictionary]"). Usar `append`/`append_array`
  em vez de `a + b` ao montar uma nova lista tipada.
- **`JSON.parse_string(texto)`** (estático) empurra um `push_error` de engine
  visível no console para JSON malformado, em vez de só devolver `null`
  silenciosamente — GUT trata isso como "Unexpected Error" e falha o teste
  mesmo quando o código trata o `null` corretamente. Usar a API de instância
  (`JSON.new(); json.parse(texto)`, checando o `Error` devolvido) para um
  tratamento silencioso equivalente ao `try/catch` do JS. Além disso, o parser
  do Godot sempre devolve números como `float` (`99` vira `99.0`) — usar
  `int(...)` ao comparar/formatar valores numéricos vindos de JSON.
- **`var x := funcao_que_retorna_variant()`** (funções que devolvem `Variant` — o padrão
  "throw→null" desta fase) dispara "The variable type is being inferred from a Variant value"
  como **erro** sob o GUT (warnings tratados como erro) e derruba o arquivo de teste inteiro
  silenciosamente ("Ignoring script ... because it does not extend GutTest" é o sintoma
  enganoso). Correção: usar `var x = funcao(...)` (sem `:=`) sempre que a função do lado
  direito retornar `Variant`.

### Verificação de cada task

1. Escrever o `.gd` + o `.gut.gd` de teste espelhando o `.test.js` correspondente (mesmos
   valores de entrada, mesmo mock de `Aleatorio.fonte`, mesma expectativa de saída).
2. Rodar só a suíte da task via GUT.
3. Rodar a suíte GUT completa acumulada até ali (nunca deixar uma task quebrar a anterior).
4. Commit por task (mesmo padrão das fases WebRPG): `git add scripts/engine/<pasta> tests/<pasta>`.

---

## Ordem de dependência (calculada por grep de `import` em `engine/`)

```
Nível 0 (sem dependência interna):
  combate/aleatorio, itens/raridade, itens/catalogo, itens/equipar, itens/amuletoTalisma,
  personagem/racas, personagem/classes, personagem/experiencia, loja/index, arena/index,
  save/index, geradores/inimigoTreino, mundo/grade, missoes/catalogo

Nível 1 (dependem só de Nível 0):
  combate/calculoDano, combate/efeitosDeStatus, combate/recompensas, itens/efeitosArma,
  itens/pocao, masmorra/gerador*, missoes/ondas, mundo/monstrosSelvagens,
  personagem/necromante, torre/bosses, personagem/criarPersonagem, mundo/mapas/cidade

Nível 2:
  combate/habilidadesInimigo, masmorra/inimigoDaSala, masmorra/index, missoes/index,
  torre/index

Nível 3:
  combate/turno

Nível 4:
  combate/index
```
`*` masmorra/gerador porta de `JogoRPG/masmorra/masmorra.js`, não de `engine/masmorra/gerador.js` (ver exceção acima).

As 12 tasks abaixo seguem essa ordem, agrupadas por pasta/tema para não fragmentar em 30 commits triviais.

---

### Task 1 — Fundação: GUT + `Aleatorio` + `Raridade`

**Pedir confirmação antes de baixar o addon GUT.**

**Cria:**
- `game/addons/gut/` (addon baixado)
- `game/scripts/engine/combate/aleatorio.gd` ← `engine/combate/aleatorio.js`
- `game/scripts/engine/itens/raridade.gd` ← `engine/itens/raridade.js`
- `game/tests/combate/test_aleatorio.gd`, `game/tests/itens/test_raridade.gd`

**Funções:** `Aleatorio.rand(min, max)` · `Raridade.obter_classe_raridade(raridade) -> String`

**Verificação:** os 3 casos de `aleatorio.test.js` (mín., máx., intermediário) + o teste de
`raridade.test.js` batendo em GUT. Suíte GUT roda headless sem erro.

---

### Task 2 — Personagem: raças, classes, criação, experiência, necromante

**Cria:**
- `scripts/engine/personagem/racas.gd` ← `racas.js` (`Racas.listar_racas()`, `Racas.obter_raca(nome)`, `const RACAS`)
- `scripts/engine/personagem/classes.gd` ← `classes.js` (`Classes.listar_classes()`, `Classes.obter_classe(nome)`, `const CLASSES`)
- `scripts/engine/personagem/criar_personagem.gd` ← `criarPersonagem.js` (`validar_nome`, `calcular_atributos_iniciais`, `criar_personagem` — depende de `Racas`/`Classes`)
- `scripts/engine/personagem/experiencia.gd` ← `experiencia.js` (`xp_para_proximo_nivel`, `checar_level_up`)
- `scripts/engine/personagem/necromante.gd` ← `necromante.js` (habilidade passiva de invocar esqueletos — depende de `Aleatorio`)

**Atenção:** `racas.js` usa `"Dragonoide"`/`"Morto-vivo"` — manter esses nomes exatos (não os
da planilha, que tinham erro de digitação — já resolvido na seção 8 da lista mestra).

**Verificação:** suítes `racas.test.js`, `classes.test.js`, `criarPersonagem.test.js` (11
testes), `experiencia.test.js`, e o teste de invocação de esqueleto de `necromante.test.js`
(9 testes) espelhados. Suíte GUT acumulada passa.

---

### Task 3 — Itens: catálogo, equipar, efeitos de arma, poção, amuleto/talismã

**Cria:**
- `scripts/engine/itens/catalogo.gd` ← `catalogo.js` (4 `const`: conjuntos de armadura, armas, consumíveis, catálogo da loja — dado puro, maior arquivo de tabela desta task)
- `scripts/engine/itens/equipar.gd` ← `equipar.js` (`aplicar_bonus_de_conjunto`, `equipar_armadura_no_slot`, `equipar_arma`, `comparar_atributos`)
- `scripts/engine/itens/efeitos_arma.gd` ← `efeitosArma.js` (roubo de vida, crítico de arma, ataque duplo, confusão, congelamento, incêndio — 9 funções, depende de `Aleatorio`)
- `scripts/engine/itens/pocao.gd` ← `pocao.js` (`contar_pocoes`, `consumir_pocao`, `usar_pocao_de_cura`)
- `scripts/engine/itens/amuleto_talisma.gd` ← `amuletoTalisma.js` (Amuleto Supremo e Talismã da Torre — já existe e testado desde a Fase 3 do WebRPG, porte direto)

**Verificação:** as 5 suítes correspondentes (`catalogo`, `equipar` 11 testes, `efeitosArma`
11 testes, `pocao` 8 testes, `amuletoTalisma` 9 testes) espelhadas e passando.

---

### Task 4 — Combate (núcleo): dano, status, habilidades de inimigo, recompensas

**Cria:**
- `scripts/engine/combate/calculo_dano.gd` ← `calculoDano.js` (ataque/defesa/dano base/crítico do jogador, fúria do Bárbaro, defesa/ataque do inimigo — 8 funções)
- `scripts/engine/combate/efeitos_de_status.gd` ← `efeitosDeStatus.js` (cura do Xamã, sangramento, envenenamento — 6 funções, depende de `Aleatorio`)
- `scripts/engine/combate/habilidades_inimigo.gd` ← `habilidadesInimigo.js` (esquiva, ataque duplo, invulnerável, paralisia, roubo e fuga, petrificar, regeneração, bloquear+contra-atacar — 15 funções, o maior módulo de combate; depende de `Aleatorio` e `EfeitosDeStatus`)
- `scripts/engine/combate/recompensas.gd` ← `recompensas.js` (`conceder_recompensa_vitoria` — hoje só XP/ouro; drop de item é Fase 5, não expandir aqui)

**Verificação:** `calculoDano.test.js` (14), `efeitosDeStatus.test.js` (13),
`habilidadesInimigo.test.js` (25 — a maior suíte do projeto), `recompensas.test.js` (2).
Total 54 testes espelhados nesta task.

---

### Task 5 — Combate (orquestração): turno e API pública

**Cria:**
- `scripts/engine/combate/turno.gd` ← `turno.js` (`executar_rodada` — orquestra tudo da Task 4 + `Pocao.usar_pocao_de_cura`; reconhece ações `atacar`/`usar_pocao`/`defender`/`fugir`)
- `scripts/engine/combate/index.gd` ← `combate/index.js` (`criar_estado_batalha`, `executar_acao_jogador` — fachada pública do módulo de combate)

**Verificação:** `turno.test.js` (14 testes) + `combate/index.test.js` (3 testes). Este é o
módulo mais crítico de checar com cuidado — orquestra literalmente todo o resto de Task 4.

---

### Task 6 — Geradores & Loja

**Cria:**
- `scripts/engine/geradores/inimigo_treino.gd` ← `inimigoTreino.js` (`criar_inimigo_treino`)
- `scripts/engine/loja/loja.gd` ← `loja/index.js` (`comprar_item`, `itens_vendiveis`, `vender_itens`)

**Verificação:** `inimigoTreino.test.js` (2) + `loja/index.test.js` (4).

---

### Task 7 — Missões

**Cria:**
- `scripts/engine/missoes/catalogo.gd` ← `missoes/catalogo.js` (`const MISSOES_DISPONIVEIS`)
- `scripts/engine/missoes/index.gd` ← `missoes/index.js` (`filtro_missao`, `aplicar_penalidade`, `resolver_resultado_missao` — depende de `Aleatorio` e `Experiencia.checar_level_up`)
- `scripts/engine/missoes/ondas.gd` ← `missoes/ondas.js` (`const TOTAL_ONDAS`, `criar_estado_ondas`, `avancar_onda`)

**Verificação:** `missoes/catalogo.test.js` (4), `missoes/index.test.js` (10),
`missoes/ondas.test.js` (4).

---

### Task 8 — Masmorra (fonte: `JogoRPG/masmorra/masmorra.js`, não `engine/`)

**Cria:**
- `scripts/engine/masmorra/gerador.gd` ← **`JogoRPG/masmorra/masmorra.js:56-215`**
  (`DUNGEON_TEMPLATES` completo: 10 temas com mobs/minibosses/boss/`trapChance`/
  `secretChance`/`treasureMultiplier` reais — 3 nomes de boss atualizados conforme a
  lista mestra: Dolgarth, Vel'Thyra, Zerakth) + `determinar_dificuldade`, `gerar_masmorra`
- `scripts/engine/masmorra/inimigo_da_sala.gd` ← `inimigoDaSala.js` (`criar_inimigo_da_sala`, depende de `determinar_dificuldade`)
- `scripts/engine/masmorra/index.gd` ← `masmorra/index.js` (`criar_sessao_masmorra`, `mover`, `limpar_sala`, `tentar_sair_masmorra`)

**Verificação — atenção, não é porte 1:1 puro:** os testes GUT desta task precisam ser
**escritos do zero** contra a tabela de `JogoRPG/masmorra/masmorra.js` (não existe
`.test.js` prévio para `DUNGEON_TEMPLATES`), cobrindo pelo menos: os 10 templates existem
com os nomes/campos corretos, `gerar_masmorra` sempre produz um caminho válido até o boss
(mesma garantia que `engine/masmorra/gerador.test.js`, seus 8 testes, já cobre para a versão
simplificada — replicar essa cobertura de "grade sempre navegável" contra os dados novos).
`inimigoDaSala.test.js` (3) e `masmorra/index.test.js` (6) portam normalmente.

---

### Task 9 — Mundo

**Cria:**
- `scripts/engine/mundo/grade.gd` ← `mundo/grade.js` (`criar_grade_de_tracado`, `celula_em`, `caminho_ate`, `alcancavel`)
- `scripts/engine/mundo/mapas/cidade.gd` ← `mundo/mapas/cidade.js` (`const POSICAO_INICIAL_CIDADE`, `criar_mapa_cidade`, depende de `grade.gd`)
- `scripts/engine/mundo/monstros_selvagens.gd` ← `monstrosSelvagens.js` (`const ESPECIES_SELVAGENS`, `listar_especies_selvagens`, `obter_especie_selvagem`, `criar_inimigo_selvagem`, depende de `Aleatorio`)

**Verificação:** `grade.test.js` (9), `mapas/cidade.test.js` (10), `monstrosSelvagens.test.js` (5).

---

### Task 10 — Torre & Arena

**Cria:**
- `scripts/engine/torre/bosses.gd` ← `torre/bosses.js` (`const NIVEL_CAP_TORRE`, `const TORRE_BOSSES` — os 10 bosses já confirmados idênticos à lista mestra, seção 5.2 —, `criar_boss_torre`)
- `scripts/engine/torre/index.gd` ← `torre/index.js` (`criar_estado_torre`, `avancar_andar`, `executar_turno_torre`, `pode_acessar_torre`, `consumir_talisma_da_torre` — depende de `CalculoDano` e `TorreBosses`)
- `scripts/engine/arena/index.gd` ← `arena/index.js` (`const NIVEL_MINIMO_ARENA`, acesso/dificuldade/pontos/fragmento/bênçãos de checkpoint — 10 funções, sem dependência interna)

**Verificação:** `torre/bosses.test.js` (5), `torre/index.test.js` (9), `arena/index.test.js` (12).

---

### Task 11 — Save

**Cria:**
- `scripts/engine/save/save.gd` ← `save/index.js` (`criar_save`, `serializar_save`, `desserializar_save` — mesmo schema JSON versionado)

**Diferença real desta task (não é porte puro):** o `.js` original serializa para
`localStorage`/arquivo via camada externa ao módulo (a Fase 3 do WebRPG cuidava disso). Aqui,
a leitura/escrita em `user://save.json` via `FileAccess` do Godot é código novo, não portado —
mas fica **fora desta Fase 1** (é trabalho de tela/persistência, não de motor puro). Task 11
porta só `criar_save`/`serializar_save`/`desserializar_save` (a lógica pura de forma/versão do
save); o `FileAccess.open("user://save.json", ...)` entra na Fase 3.

**Verificação:** `save/index.test.js` (5 testes) espelhados.

---

### Task 12 — Checklist final da Fase 1

- [x] Suíte GUT completa roda headless sem erro: 33 scripts, **246/246 testes**, 646 asserts.
      Comando real usado (difere do rascunho original — ver gotchas): `godot --headless
      --rendering-driver opengl3 --path game -s addons/gut/gut_cmdln.gd -gdir=res://tests
      -ginclude_subdirs -gexit`.
- [x] Nenhuma função pública de `engine/` ficou sem equivalente em `scripts/engine/` — os 30
      arquivos `.js` (100%) têm um `.gd` correspondente, conferido contra a lista de exports
      desta task-plan.
- [x] `scripts/engine/masmorra/gerador.gd` confirmado contra `JogoRPG/masmorra/masmorra.js`
      (`DUNGEON_TEMPLATES`), não `engine/masmorra/gerador.js`.
- [x] `Aleatorio.fonte` documentado no arquivo como o ponto único de injeção de aleatoriedade
      para teste; usado consistentemente pelas 12 tasks.
- [x] `docs/superpowers/docs.md`: Fase 1 marcada como ✅ Concluída, com nota de verificação.
- [x] Resultado reportado — ver "Divergências encontradas" abaixo.

**Divergências encontradas durante o porte (nenhuma no comportamento numérico/lógico — todos
os valores testados batem exatamente com o JS original):**

1. **`masmorra/gerador.gd`** troca de fonte de dados por decisão já tomada com o usuário antes
   desta fase (seção "Exceção já decidida" no topo deste documento) — não é uma divergência
   acidental.
2. **`combate/index.gd`** (`Combate.criar_estado_batalha`) precisou de uma checagem explícita de
   `null`/`has()` antes de atribuir a uma `Array` tipada — `Dictionary.get()` sem chave retorna
   `null`, que não pode ser atribuído direto a uma variável `Array` tipada em GDScript (não
   existe no JS, onde `undefined` só vira `[]` via o operador ternário do código original).
3. **`personagem/necromante.gd`** (`absorver_dano_com_esqueletos`) precisou trocar concatenação
   `[a] + b` por `append`/`append_array` — concatenar `Array[Dictionary]` tipado com `+`
   falha silenciosamente em runtime no Godot 4.7.1.
4. **`save/save.gd`** usa a API de instância do `JSON` (`JSON.new().parse()`) em vez da estática
   (`JSON.parse_string()`) para tratar JSON malformado sem gerar um `push_error` de engine, e
   usa `int(...)` ao redor de valores numéricos vindos de JSON (que o Godot sempre desserializa
   como `float`) — nenhuma das duas coisas tem equivalente no JS, onde `try/catch` em torno de
   `JSON.parse` já resolve isso e números não têm essa distinção visível.

Nenhuma dessas divergências muda o comportamento de jogo — são todas adaptações de sintaxe/API
específicas do GDScript, cobertas por teste antes e depois da correção.

---

## Self-Review

**Cobertura:** as 12 tasks cobrem os 30 arquivos `.js` de `engine/` (exceto os módulos que
nunca existiram — Ferreiro, drops, Néctar, relíquias, mapas secretos —, que entram direto em
GDScript nas Fases 5/6/8, sem precisar de um estágio JS intermediário). `masmorra/gerador.gd`
porta da fonte correta (`JogoRPG/`), não da versão simplificada.

**Risco principal:** o padrão `Aleatorio.fonte` (Callable trocável) é novo — não existe no
JS original, é a tradução do `vi.spyOn(Math, "random")`. Se esse padrão não for bem
estabelecido na Task 1, as 16 tasks/módulos seguintes que dependem de aleatoriedade
determinística em teste (Task 2 em diante) ficam sem uma forma limpa de mockar RNG. Por isso
Task 1 vem isolada e primeiro, mesmo sendo pequena.

**Ordem:** segue estritamente o grafo de dependência calculado por grep — nenhuma task depende
de uma task posterior.

---

**Plano salvo em `docs/superpowers/plans/2026-07-17-godotrpg-fase1-motor-portado.md`.**
Pronto para eu começar a Task 1 (instalar GUT — preciso da sua confirmação pra baixar o addon —
e portar `Aleatorio`/`Raridade`), ou você quer revisar o plano primeiro?
