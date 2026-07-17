extends GutTest

## Espelha engine/itens/raridade.test.js.

func test_mapeia_comum_raro_e_lendario_para_suas_classes() -> void:
	assert_eq(Raridade.obter_classe_raridade("comum"), "raridade--comum")
	assert_eq(Raridade.obter_classe_raridade("raro"), "raridade--raro")
	assert_eq(Raridade.obter_classe_raridade("lendario"), "raridade--lendario")

func test_retorna_raridade_padrao_para_valores_desconhecidos() -> void:
	assert_eq(Raridade.obter_classe_raridade("epico"), "raridade--padrao")
	assert_eq(Raridade.obter_classe_raridade(null), "raridade--padrao")
