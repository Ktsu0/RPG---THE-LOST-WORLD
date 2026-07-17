extends GutTest

## Espelha engine/combate/recompensas.test.js.

func after_each() -> void:
	Aleatorio.fonte = func() -> float: return randf()

func test_usa_xp_e_ouro_definidos_no_inimigo() -> void:
	var jogador := {"xp": 0, "ouro": 0}
	var inimigo := {"xp": 20, "ouro": 30, "hpMax": 50, "atk": 10}
	var resultado := Recompensas.conceder_recompensa_vitoria(jogador, inimigo)
	assert_eq(resultado, {"xpGanho": 20, "ouroGanho": 30})
	assert_eq(jogador["xp"], 20)
	assert_eq(jogador["ouro"], 30)

func test_usa_a_formula_de_fallback_quando_o_inimigo_nao_define_xp_ouro() -> void:
	var jogador := {"xp": 0, "ouro": 0}
	var inimigo := {"hpMax": 50, "atk": 10}
	Aleatorio.fonte = func() -> float: return 0.0 # rand(50,100)=50
	var resultado := Recompensas.conceder_recompensa_vitoria(jogador, inimigo)
	# xpGanho = floor(50/5 + 10*2) = floor(10+20) = 30
	assert_eq(resultado, {"xpGanho": 30, "ouroGanho": 50})
	assert_eq(jogador["xp"], 30)
	assert_eq(jogador["ouro"], 50)
