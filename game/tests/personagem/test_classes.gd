extends GutTest

## Espelha engine/personagem/classes.test.js.

func test_listar_classes_retorna_as_6_classes_na_ordem_do_console() -> void:
	var classes := Classes.listar_classes()
	assert_eq(classes.size(), 6)
	var nomes: Array = classes.map(func(c): return c["nome"])
	assert_eq(nomes, ["Arqueiro", "Paladino", "Assassino", "Bárbaro", "Necromante", "Xamã"])

func test_obter_classe_retorna_o_bonus_do_arqueiro() -> void:
	var classe: Dictionary = Classes.obter_classe("Arqueiro")
	assert_eq(classe["bonus"], {
		"habilidade": "esquiva", "atk": 0, "def": 0, "dropOuro": 10, "dropItem": 0,
		"critChance": 0, "esquiva": 10, "bloqueioChance": 0,
	})

func test_obter_classe_retorna_o_bonus_de_ataque_do_barbaro() -> void:
	var classe: Dictionary = Classes.obter_classe("Bárbaro")
	assert_eq(classe["bonus"]["atk"], 8)
	assert_eq(classe["bonus"]["habilidade"], "furia")

func test_obter_classe_retorna_o_bonus_de_esquiva_do_xama() -> void:
	var classe: Dictionary = Classes.obter_classe("Xamã")
	assert_eq(classe["bonus"]["esquiva"], 15)
	assert_eq(classe["bonus"]["habilidade"], "cura")

func test_obter_classe_lanca_erro_para_uma_classe_que_nao_existe() -> void:
	var resultado = Classes.obter_classe("Ferreiro")
	assert_null(resultado)
	assert_push_error('Classe "Ferreiro" não existe.')
