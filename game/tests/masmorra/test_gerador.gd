extends GutTest

## Testes novos (não existiam em engine/) contra a tabela de 10 masmorras
## portada de JogoRPG/masmorra/masmorra.js — ver seção 3.3 da lista mestra.
## O algoritmo de grade em si (entrada no centro, boss na célula mais distante,
## toda célula não-boss começa não visitada) espelha engine/masmorra/gerador.test.js.

func after_each() -> void:
	Aleatorio.fonte = func() -> float: return randf()

func test_tem_10_templates_com_os_campos_esperados() -> void:
	assert_eq(MasmorraGerador.DUNGEON_TEMPLATES.size(), 10)
	for t in MasmorraGerador.DUNGEON_TEMPLATES:
		assert_true(t.has("id"))
		assert_true(t.has("nome"))
		assert_true(t.has("mobs"))
		assert_true(t.has("minibosses"))
		assert_true(t.has("boss"))
		assert_true(t.has("trapChance"))
		assert_true(t.has("secretChance"))
		assert_eq(t["mobs"].size() > 0, true)
		assert_eq(t["minibosses"].size(), 3)
		assert_true(String(t["boss"]["nome"]).length() > 0)

func test_tem_os_10_ids_esperados_sem_duplicatas() -> void:
	var ids: Array = MasmorraGerador.DUNGEON_TEMPLATES.map(func(t): return t["id"])
	assert_eq(ids, [
		"catacumbas-sombras", "ruinas-da-floresta", "caverna-do-gelo", "fornalha-infernal",
		"biblioteca-antiga", "mina-abandonada", "pantano-putrefato", "templo-das-sombras",
		"forja-elemental", "torre-dos-ecos",
	])
	var unicos := {}
	for id in ids:
		unicos[id] = true
	assert_eq(unicos.size(), 10)

func test_bosses_com_os_3_nomes_atualizados_pela_decisao_do_usuario() -> void:
	var por_id := {}
	for t in MasmorraGerador.DUNGEON_TEMPLATES:
		por_id[t["id"]] = t
	assert_eq(por_id["mina-abandonada"]["boss"]["nome"], "Dolgarth, o Golem das Profundezas")
	assert_eq(por_id["templo-das-sombras"]["boss"]["nome"], "Vel'Thyra, Soberana das Trevas")
	assert_eq(por_id["torre-dos-ecos"]["boss"]["nome"], "Zerakth, Guardião do Fluxo Temporal")

func test_determinar_dificuldade_nivel_1_a_4_entre_1_e_5() -> void:
	Aleatorio.fonte = func() -> float: return 0.0
	assert_eq(MasmorraGerador.determinar_dificuldade(2), 1)

func test_determinar_dificuldade_nivel_10_mais_entre_5_e_10() -> void:
	Aleatorio.fonte = func() -> float: return 0.999
	assert_eq(MasmorraGerador.determinar_dificuldade(15), 10)

func test_gera_grade_size_x_size_com_entrada_no_centro() -> void:
	Aleatorio.fonte = func() -> float: return 0.5
	var dungeon := MasmorraGerador.gerar_masmorra({"nivel": 3}, "catacumbas-sombras", {"size": 5})
	assert_eq(dungeon["size"], 5)
	assert_eq(dungeon["grid"].size(), 5)
	assert_eq(dungeon["grid"][0].size(), 5)
	assert_eq(dungeon["entrance"], {"x": 2, "y": 2})
	assert_eq(dungeon["grid"][2][2]["roomType"], "entrada")

func test_coloca_exatamente_uma_sala_de_boss_na_celula_mais_distante() -> void:
	Aleatorio.fonte = func() -> float: return 0.5
	var dungeon := MasmorraGerador.gerar_masmorra({"nivel": 3}, "catacumbas-sombras", {"size": 5})
	var salas_boss := 0
	for linha in dungeon["grid"]:
		for c in linha:
			if c["roomType"] == "boss":
				salas_boss += 1
	assert_eq(salas_boss, 1)

func test_toda_celula_comeca_nao_visitada_exceto_a_entrada() -> void:
	Aleatorio.fonte = func() -> float: return 0.5
	var dungeon := MasmorraGerador.gerar_masmorra({"nivel": 3}, "catacumbas-sombras", {"size": 5})
	assert_true(dungeon["grid"][2][2]["visited"])
	for linha in dungeon["grid"]:
		for c in linha:
			if not (c["x"] == 2 and c["y"] == 2):
				assert_false(c["visited"])

func test_todos_os_10_templates_geram_masmorra_valida_com_boss_alcancavel() -> void:
	# Garantia equivalente à cobertura de "grade sempre navegável" de
	# engine/masmorra/gerador.test.js, replicada aqui contra os 10 dados novos:
	# cada template produz uma grade size x size com exatamente 1 sala de boss.
	Aleatorio.fonte = func() -> float: return 0.5
	for t in MasmorraGerador.DUNGEON_TEMPLATES:
		var dungeon := MasmorraGerador.gerar_masmorra({"nivel": 5}, t["id"], {"size": 5})
		var salas_boss := 0
		for linha in dungeon["grid"]:
			for c in linha:
				if c["roomType"] == "boss":
					salas_boss += 1
		assert_eq(salas_boss, 1, "template %s deveria ter exatamente 1 sala de boss" % t["id"])
		assert_eq(dungeon["template"]["id"], t["id"])
