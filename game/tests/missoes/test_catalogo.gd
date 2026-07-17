extends GutTest

## Espelha engine/missoes/catalogo.test.js.

func test_tem_14_missoes_sem_arena_infinita() -> void:
	assert_eq(MissoesCatalogo.LISTA.size(), 14)
	var achou_arena_infinita := false
	for m in MissoesCatalogo.LISTA:
		if m.get("tipoBatalha") == "arena_infinita":
			achou_arena_infinita = true
	assert_false(achou_arena_infinita)

func test_missao_de_ondas_desafio_da_arena_amaldicoada() -> void:
	var missao: Dictionary
	for m in MissoesCatalogo.LISTA:
		if m["descricao"] == "Desafio da Arena Amaldiçoada":
			missao = m
	assert_eq(missao["tipoBatalha"], "ondas")
	assert_eq(missao["nivelMinimo"], 4)
	var xp_fn: Callable = missao["xp"]
	var ouro_fn: Callable = missao["ouro"]
	assert_eq(xp_fn.call(10), 100) # 50 + 10*5
	assert_eq(ouro_fn.call(10), 200) # 100 + 10*10
	assert_eq(missao["falha"], {"tipo": "hp", "percentual": 50})

func test_missao_escoltar_mercador_tem_recompensas_corretas() -> void:
	var missao: Dictionary
	for m in MissoesCatalogo.LISTA:
		if m["descricao"] == "Escoltar um mercador até a cidade":
			missao = m
	assert_eq(missao["chanceSucesso"], 85)
	var xp_fn: Callable = missao["xp"]
	var ouro_fn: Callable = missao["ouro"]
	assert_eq(xp_fn.call(5), 20) # 15 + 5*1
	assert_eq(ouro_fn.call(5), 15) # 10 + 5*1

func test_missoes_narrativas_tem_historia_nao_vazia() -> void:
	var narrativas: Array = MissoesCatalogo.LISTA.filter(func(m): return not m.get("tipoBatalha"))
	assert_true(narrativas.size() > 0)
	for missao in narrativas:
		assert_true(typeof(missao["historia"]) == TYPE_STRING)
		assert_true(missao["historia"].length() > 0)
