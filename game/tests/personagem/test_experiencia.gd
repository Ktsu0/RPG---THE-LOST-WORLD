extends GutTest

## Espelha engine/personagem/experiencia.test.js.

func test_xp_para_proximo_nivel_nivel_1() -> void:
	assert_eq(Experiencia.xp_para_proximo_nivel({"nivel": 1}), 50)

func test_xp_para_proximo_nivel_nivel_3() -> void:
	# 50 * 3^1.4 = 50 * 4.6555... = 232.77... -> floor = 232
	assert_eq(Experiencia.xp_para_proximo_nivel({"nivel": 3}), 232)

func test_nao_sobe_de_nivel_quando_xp_e_insuficiente() -> void:
	var jogador := {"nivel": 1, "xp": 10, "hpMax": 100, "hp": 80, "ataque": 5, "defesa": 5}
	var eventos := Experiencia.checar_level_up(jogador)
	assert_eq(eventos, [])
	assert_eq(jogador["nivel"], 1)
	assert_eq(jogador["xp"], 10)

func test_sobe_um_nivel_restaura_hp_e_aplica_ganhos_de_atributo() -> void:
	var jogador := {"nivel": 1, "xp": 50, "hpMax": 100, "hp": 40, "ataque": 5, "defesa": 5}
	var eventos := Experiencia.checar_level_up(jogador)
	assert_eq(eventos, [{"tipo": "level_up", "nivel": 2, "hpMax": 115}])
	assert_eq(jogador["nivel"], 2)
	assert_eq(jogador["xp"], 0)
	assert_eq(jogador["hpMax"], 115)
	assert_eq(jogador["hp"], 115)
	assert_eq(jogador["ataque"], 7)
	assert_eq(jogador["defesa"], 6)

func test_sobe_multiplos_niveis_numa_unica_chamada() -> void:
	var jogador := {"nivel": 1, "xp": 300, "hpMax": 100, "hp": 100, "ataque": 5, "defesa": 5}
	var eventos := Experiencia.checar_level_up(jogador)
	# nível 1->2 custa floor(50*1^1.4)=50 (sobra 250), nível 2->3 custa floor(50*2^1.4)=131 (sobra 119)
	# -> nível 3, não alcança o custo do nível 3->4 (floor(50*3^1.4)=232)
	assert_eq(eventos.size(), 2)
	assert_eq(jogador["nivel"], 3)
	assert_eq(jogador["xp"], 119)
