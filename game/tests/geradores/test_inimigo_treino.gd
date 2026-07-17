extends GutTest

## Espelha engine/geradores/inimigoTreino.test.js.

func test_retorna_um_orc_com_o_shape_esperado() -> void:
	var inimigo := InimigoTreino.criar_inimigo_treino()
	assert_eq(inimigo, {
		"nome": "Orc", "atk": 9, "defesa": 3, "hp": 40, "hpMax": 40,
		"xp": 18, "ouro": 15, "habilidade": "envenenamento", "status": [],
	})

func test_retorna_nova_instancia_a_cada_chamada() -> void:
	var a := InimigoTreino.criar_inimigo_treino()
	var b := InimigoTreino.criar_inimigo_treino()
	a["hp"] = 0
	assert_eq(b["hp"], 40)
