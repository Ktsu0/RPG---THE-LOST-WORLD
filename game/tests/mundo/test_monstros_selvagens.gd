extends GutTest

## Espelha engine/mundo/monstrosSelvagens.test.js.

func after_each() -> void:
	Aleatorio.fonte = func() -> float: return randf()

func test_lista_todas_as_especies_selvagens() -> void:
	assert_true(MonstrosSelvagens.listar_especies_selvagens().size() > 0)

func test_obtem_uma_especie_pelo_id() -> void:
	assert_eq(MonstrosSelvagens.obter_especie_selvagem("goblin")["nome"], "Goblin Selvagem")

func test_lanca_erro_para_especie_inexistente() -> void:
	var resultado = MonstrosSelvagens.obter_especie_selvagem("dragao-inexistente")
	assert_null(resultado)
	assert_push_error('Espécie selvagem "dragao-inexistente" não existe.')

func test_cria_inimigo_com_hp_hpmax_iguais_e_escalado() -> void:
	var inimigo = MonstrosSelvagens.criar_inimigo_selvagem("goblin", 1)
	assert_eq(inimigo["nome"], "Goblin Selvagem")
	assert_eq(inimigo["hp"], inimigo["hpMax"])
	assert_true(inimigo["hp"] >= 18)
	assert_eq(inimigo["status"], [])

func test_aumenta_atributos_em_niveis_mais_altos() -> void:
	var baixo = MonstrosSelvagens.criar_inimigo_selvagem("orc", 1)
	var alto = MonstrosSelvagens.criar_inimigo_selvagem("orc", 20)
	assert_true(alto["hpMax"] > baixo["hpMax"])
