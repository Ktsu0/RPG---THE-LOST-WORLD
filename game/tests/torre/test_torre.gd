extends GutTest

## Espelha engine/torre/index.test.js.

func after_each() -> void:
	Aleatorio.fonte = func() -> float: return randf()

func jogador_base() -> Dictionary:
	return {
		"nivel": 3, "ataque": 15, "defesa": 10, "hp": 200, "hpMax": 200,
		"equipamentos": {}, "bonusAtk": 0, "bonusDef": 0, "amuletoEquipado": false, "armaEquipada": null,
		"bonusClasse": {}, "bonusRaca": {}, "bonusCritico": 0, "classe": "Guerreiro", "xp": 0, "ouro": 0,
		"inventario": [],
	}

func test_criar_estado_torre_e_avancar_andar_cria_o_primeiro_boss() -> void:
	var estado := Torre.criar_estado_torre(jogador_base())
	var resultado := Torre.avancar_andar(estado)
	assert_eq(resultado["estado"]["andar"], 1)
	assert_eq(resultado["boss"]["nome"], "Guardião de Pedra")

func test_processa_um_turno_normal_jogador_ataca_boss_revida() -> void:
	var estado := Torre.criar_estado_torre(jogador_base())
	var com_boss: Dictionary = Torre.avancar_andar(estado)["estado"]
	Aleatorio.fonte = func() -> float: return 0.5

	var resultado := Torre.executar_turno_torre(com_boss, "atacar")

	assert_null(resultado["fim"])
	var houve_dano_do_jogador := false
	for e in resultado["eventos"]:
		if e["tipo"] == "dano" and e.get("autor") == "jogador":
			houve_dano_do_jogador = true
	assert_true(houve_dano_do_jogador)

func test_vencer_o_boss_cura_35_por_cento_e_credita_xp_ouro() -> void:
	var estado: Dictionary = Torre.avancar_andar(Torre.criar_estado_torre(jogador_base()))["estado"]
	estado["bossAtual"]["hp"] = 1
	# 1ª chamada de rand: rand(0,4) do dano do jogador. 2ª chamada: rand(1,100) da checagem de
	# blockChance (25 no Guardião de Pedra) — precisa ficar ACIMA de 25 para o bloqueio não
	# disparar e o dano realmente abater o boss.hp=1.
	Aleatorio.fonte = MockHelpers.fila_com_fallback([0.0], 0.5)

	var resultado := Torre.executar_turno_torre(estado, "atacar")

	assert_eq(resultado["fim"], "venceu_andar")
	assert_eq(resultado["estado"]["jogador"]["hp"], estado["jogador"]["hpMax"]) # curou 35%, já estava no máximo
	assert_eq(resultado["estado"]["jogador"]["xp"], 70) # xpBase do Guardião de Pedra
	assert_eq(resultado["estado"]["jogador"]["ouro"], 50)

func test_fuga_bem_sucedida_encerra_sem_punicao() -> void:
	var estado: Dictionary = Torre.avancar_andar(Torre.criar_estado_torre(jogador_base()))["estado"]
	Aleatorio.fonte = func() -> float: return 0.5 # rand(1,100)=51 <=60 sucesso

	var resultado := Torre.executar_turno_torre(estado, "fugir")

	assert_eq(resultado["fim"], "fuga")

func test_declara_derrota_quando_hp_do_jogador_chega_a_0() -> void:
	var estado: Dictionary = Torre.avancar_andar(Torre.criar_estado_torre(jogador_base()))["estado"]
	estado["jogador"]["hp"] = 1
	Aleatorio.fonte = func() -> float: return 0.9 # garante que o boss acerta um golpe

	var resultado := Torre.executar_turno_torre(estado, "atacar")

	assert_eq(resultado["fim"], "derrota")

func test_ao_vencer_o_10_boss_aplica_bonus_final_e_emite_evento() -> void:
	var estado: Dictionary = Torre.avancar_andar(Torre.criar_estado_torre(jogador_base()))["estado"]
	estado["andar"] = 10
	estado["bossAtual"]["hp"] = 1
	Aleatorio.fonte = MockHelpers.fila_com_fallback([0.0], 0.5)

	var resultado := Torre.executar_turno_torre(estado, "atacar")

	assert_eq(resultado["fim"], "torre_completa")
	assert_true(resultado["estado"]["jogador"]["ouro"] >= 10000)
	assert_true(resultado["estado"]["jogador"]["inventario"].has("Cálice da Vitória"))
	var houve_torre_completa := false
	for e in resultado["eventos"]:
		if e["tipo"] == "torre_completa":
			houve_torre_completa = true
	assert_true(houve_torre_completa)

func test_pode_acessar_torre_bloqueia_sem_o_talisma() -> void:
	assert_false(Torre.pode_acessar_torre({"inventario": []}))

func test_pode_acessar_torre_libera_com_o_talisma() -> void:
	assert_true(Torre.pode_acessar_torre({"inventario": ["Talismã da Torre"]}))

func test_consumir_talisma_remove_uma_unidade() -> void:
	var jogador := {"inventario": ["Talismã da Torre", "Poção de Cura"]}
	Torre.consumir_talisma_da_torre(jogador)
	assert_eq(jogador["inventario"], ["Poção de Cura"])
