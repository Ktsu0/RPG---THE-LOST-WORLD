extends GutTest

## Espelha engine/arena/index.test.js.

func test_pode_acessar_arena_exige_nivel_5() -> void:
	assert_false(Arena.pode_acessar_arena({"nivel": 4}))
	assert_true(Arena.pode_acessar_arena({"nivel": 5}))

func test_calcular_dificuldade_onda_cresce_capado_em_10() -> void:
	assert_eq(Arena.calcular_dificuldade_onda(3), 2) # floor(1+3/3)=2
	assert_eq(Arena.calcular_dificuldade_onda(100), 10)

func test_calcular_quantidade_inimigos_escala_por_faixas() -> void:
	assert_eq(Arena.calcular_quantidade_inimigos(2), 1)
	assert_eq(Arena.calcular_quantidade_inimigos(5), 2)
	assert_eq(Arena.calcular_quantidade_inimigos(10), 3)
	assert_eq(Arena.calcular_quantidade_inimigos(20), 5)

func test_is_onda_mini_boss_a_cada_5_ondas() -> void:
	assert_true(Arena.is_onda_mini_boss(5))
	assert_true(Arena.is_onda_mini_boss(10))
	assert_false(Arena.is_onda_mini_boss(6))

func test_calcular_pontos_onda_normal_base_10() -> void:
	assert_eq(Arena.calcular_pontos(5, false), roundi(10 * (1 + 5 * 0.1)))

func test_calcular_pontos_onda_mini_boss_base_50() -> void:
	assert_eq(Arena.calcular_pontos(5, true), roundi(50 * (1 + 5 * 0.1)))

func test_calcular_chance_fragmento_mini_boss() -> void:
	assert_eq(Arena.calcular_chance_fragmento(10, true), 35.0)
	assert_eq(Arena.calcular_chance_fragmento(100, true), 70.0)

func test_calcular_chance_fragmento_normal() -> void:
	assert_eq(Arena.calcular_chance_fragmento(10, false), 8.0)
	assert_eq(Arena.calcular_chance_fragmento(100, false), 25.0)

func test_confirmar_checkpoint_move_fragmentos_nao_confirmados() -> void:
	var estado := Arena.criar_estado_arena()
	estado["fragmentosNaoConfirmados"] = 3
	estado["fragmentosConfirmados"] = 2
	var resultado := Arena.confirmar_checkpoint(estado)
	assert_eq(resultado["fragmentosConfirmados"], 5)
	assert_eq(resultado["fragmentosNaoConfirmados"], 0)

func test_bencao_vitalidade_soma_15_por_cento_ao_hpmax() -> void:
	var jogador := {"hpMax": 100}
	var estado := Arena.criar_estado_arena()
	Arena.aplicar_bencao_vitalidade(jogador, estado)
	assert_eq(jogador["hpMax"], 115)
	assert_eq(estado["bonusTemporarios"]["hpBonus"], 15)

func test_bencao_poder_soma_10_por_cento_ao_ataque() -> void:
	var jogador := {"ataque": 20}
	var estado := Arena.criar_estado_arena()
	Arena.aplicar_bencao_poder(jogador, estado)
	assert_eq(jogador["ataque"], 22)
	assert_eq(estado["bonusTemporarios"]["atkBonus"], 2)

func test_remover_bonus_arena_reverte_os_bonus_temporarios() -> void:
	var jogador := {"hpMax": 100, "ataque": 20}
	var estado := Arena.criar_estado_arena()
	Arena.aplicar_bencao_vitalidade(jogador, estado)
	Arena.aplicar_bencao_poder(jogador, estado)
	Arena.remover_bonus_arena(jogador, estado)
	assert_eq(jogador["hpMax"], 100)
	assert_eq(jogador["ataque"], 20)
