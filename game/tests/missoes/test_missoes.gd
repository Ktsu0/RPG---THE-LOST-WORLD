extends GutTest

## Espelha engine/missoes/index.test.js.

func after_each() -> void:
	Aleatorio.fonte = func() -> float: return randf()

func test_filtro_missao_retorna_null_sem_nivel_minimo_atendido() -> void:
	assert_null(Missoes.filtro_missao({"nivel": 0}))

func test_filtro_missao_retorna_missao_cujo_nivel_minimo_e_atendido() -> void:
	Aleatorio.fonte = func() -> float: return 0.0
	var missao = Missoes.filtro_missao({"nivel": 1})
	assert_not_null(missao)
	assert_true(missao["nivelMinimo"] <= 1)

func test_penalidade_ouro_perde_entre_15_e_100() -> void:
	Aleatorio.fonte = func() -> float: return 0.0 # rand(15,100)=15
	var jogador := {"ouro": 50}
	var resultado := Missoes.aplicar_penalidade("ouro", jogador)
	assert_eq(resultado, {"tipo": "ouro", "valor": 15, "mensagem": "Você perdeu 15 de ouro."})
	assert_eq(jogador["ouro"], 35)

func test_penalidade_ouro_nunca_fica_negativo() -> void:
	Aleatorio.fonte = func() -> float: return 0.99 # rand(15,100)=100
	var jogador := {"ouro": 50}
	Missoes.aplicar_penalidade("ouro", jogador)
	assert_eq(jogador["ouro"], 0)

func test_penalidade_hp_perde_20_por_cento_nunca_abaixo_de_1() -> void:
	var jogador := {"hp": 50}
	var resultado := Missoes.aplicar_penalidade("hp", jogador)
	assert_eq(resultado, {"tipo": "hp", "valor": 10, "mensagem": "Você perdeu 10 de HP."})
	assert_eq(jogador["hp"], 40)

func test_penalidade_item_nunca_aplica() -> void:
	var jogador := {"setCompleto": false}
	var resultado := Missoes.aplicar_penalidade("item", jogador)
	assert_eq(resultado, {"tipo": "nenhuma", "valor": 0, "mensagem": "Sem penalidades graves desta vez."})

func test_penalidade_tipo_desconhecido_sem_penalidade() -> void:
	var jogador := {}
	assert_eq(Missoes.aplicar_penalidade("nenhum", jogador), {"tipo": "nenhuma", "valor": 0, "mensagem": "Sem penalidades graves desta vez."})

func jogador_base_missao() -> Dictionary:
	return {"nivel": 1, "xp": 0, "ouro": 0, "classe": "Guerreiro", "inventario": [], "itens": []}

func missao_de_teste() -> Dictionary:
	return {
		"xp": func(nivel): return 15 + nivel,
		"ouro": func(nivel): return 10 + nivel,
		"item": {"nome": "Pena do Corvo Sombrio", "raridade": "comum"},
		"chanceMissaoExtra": 10,
		"falha": {"tipo": "hp", "percentual": 10},
	}

func test_resolver_missao_sucesso_concede_xp_ouro_e_chama_level_up() -> void:
	Aleatorio.fonte = MockHelpers.fila_com_fallback([0.0], 0.99)
	var jogador := jogador_base_missao()
	var missao := missao_de_teste()
	missao["chanceSucesso"] = 100
	var resultado := Missoes.resolver_resultado_missao(jogador, missao)

	assert_true(resultado["sucesso"])
	assert_eq(resultado["xpGanho"], 16)
	assert_eq(resultado["ouroGanho"], 11)
	assert_eq(jogador["xp"], 16)
	assert_eq(jogador["ouro"], 11)

func test_resolver_missao_sucesso_com_drop_de_item_bonus_assassino() -> void:
	Aleatorio.fonte = MockHelpers.fila_com_fallback([0.0, 0.0], 0.99)
	var jogador := jogador_base_missao()
	jogador["classe"] = "Assassino"
	var missao := missao_de_teste()
	missao["chanceSucesso"] = 100
	var resultado := Missoes.resolver_resultado_missao(jogador, missao)

	assert_eq(resultado["itemGanho"], "Pena do Corvo Sombrio")
	assert_eq(jogador["inventario"], ["Pena do Corvo Sombrio"])

func test_resolver_missao_falha_aplica_a_penalidade() -> void:
	Aleatorio.fonte = func() -> float: return 0.99 # resultado = 100 > chanceSucesso
	var jogador := jogador_base_missao()
	jogador["hp"] = 100
	var missao := missao_de_teste()
	missao["chanceSucesso"] = 50
	var resultado := Missoes.resolver_resultado_missao(jogador, missao)

	assert_false(resultado["sucesso"])
	assert_eq(resultado["penalidade"], {"tipo": "hp", "valor": 20, "mensagem": "Você perdeu 20 de HP."})
	assert_eq(jogador["hp"], 80)
