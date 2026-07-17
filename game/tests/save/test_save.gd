extends GutTest

## Espelha engine/save/index.test.js.

func jogador_de_teste() -> Dictionary:
	return {"nome": "Thorin", "nivel": 3, "hp": 80, "hpMax": 100}

func test_criar_save_envolve_o_jogador_num_objeto_versionado() -> void:
	assert_eq(Save.criar_save(jogador_de_teste()), {"versao": 1, "jogador": jogador_de_teste()})

func test_round_trip_preserva_o_jogador() -> void:
	var texto := Save.serializar_save(jogador_de_teste())
	var resultado := Save.desserializar_save(texto)
	assert_true(resultado["valido"])
	assert_null(resultado["erro"])
	# O parser JSON do Godot sempre devolve números como float (diferente do
	# JSON.parse do JS) — comparar campo a campo com int() em vez de
	# igualdade estrita de Dictionary.
	var jogador: Dictionary = resultado["jogador"]
	assert_eq(jogador["nome"], "Thorin")
	assert_eq(int(jogador["nivel"]), 3)
	assert_eq(int(jogador["hp"]), 80)
	assert_eq(int(jogador["hpMax"]), 100)

func test_retorna_invalido_para_texto_que_nao_e_json() -> void:
	var resultado := Save.desserializar_save("{ isso não é json")
	assert_false(resultado["valido"])
	assert_null(resultado["jogador"])
	assert_eq(resultado["erro"], "Save corrompido (JSON inválido).")

func test_retorna_invalido_quando_falta_o_campo_jogador() -> void:
	var resultado := Save.desserializar_save(JSON.stringify({"versao": 1}))
	assert_false(resultado["valido"])
	assert_eq(resultado["erro"], "Formato de save inválido.")

func test_retorna_invalido_quando_a_versao_nao_bate() -> void:
	var resultado := Save.desserializar_save(JSON.stringify({"versao": 99, "jogador": jogador_de_teste()}))
	assert_false(resultado["valido"])
	assert_eq(resultado["erro"], "Versão de save incompatível (esperado 1, recebido 99).")
