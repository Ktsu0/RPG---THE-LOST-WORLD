extends GutTest

## Espelha engine/missoes/ondas.test.js.

func after_each() -> void:
	Aleatorio.fonte = func() -> float: return randf()

func test_criar_estado_ondas_inicializa_onda_1_e_zero_fragmentos() -> void:
	var jogador := {"hp": 100, "hpMax": 100}
	var estado := Ondas.criar_estado_ondas(jogador)
	assert_eq(estado["onda"], 1)
	assert_eq(estado["fragmentosGanhos"], 0)

func test_avancar_onda_cura_10_por_cento_e_avanca() -> void:
	var jogador := {"hp": 50, "hpMax": 100}
	var estado := Ondas.criar_estado_ondas(jogador)
	Aleatorio.fonte = func() -> float: return 0.99 # sem fragmento

	var resultado := Ondas.avancar_onda(estado)

	assert_true(resultado["ondaVencida"])
	assert_false(resultado["fragmentoGanho"])
	assert_eq(resultado["estado"]["onda"], 2)
	assert_eq(jogador["hp"], 60) # 50 + floor(100*0.1)

func test_avancar_onda_concede_fragmento_com_5_por_cento() -> void:
	var jogador := {"hp": 50, "hpMax": 100}
	var estado := Ondas.criar_estado_ondas(jogador)
	Aleatorio.fonte = func() -> float: return 0.0 # rand(1,100)=1 <=5

	var resultado := Ondas.avancar_onda(estado)

	assert_true(resultado["fragmentoGanho"])
	assert_eq(resultado["estado"]["fragmentosGanhos"], 1)

func test_avancar_onda_marca_a_ultima_onda_como_final() -> void:
	var jogador := {"hp": 100, "hpMax": 100}
	var estado := Ondas.criar_estado_ondas(jogador)
	estado["onda"] = Ondas.TOTAL_ONDAS
	Aleatorio.fonte = func() -> float: return 0.99

	var resultado := Ondas.avancar_onda(estado)

	assert_true(resultado["sequenciaCompleta"])
