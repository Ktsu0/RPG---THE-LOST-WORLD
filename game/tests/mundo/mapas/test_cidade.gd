extends GutTest

## Espelha engine/mundo/mapas/cidade.test.js.

const HOTSPOTS_ESPERADOS := ["explorar", "guilda", "loja", "personagem", "torre", "masmorra", "arena", "configuracao"]

func test_tem_exatamente_um_hotspot_para_cada_destino_esperado() -> void:
	var grade := Cidade.criar_mapa_cidade()
	var hotspots: Array = []
	for linha in grade:
		for celula in linha:
			if celula["tipo"] == "hotspot":
				hotspots.append(celula["conteudo"]["hotspot"])
	hotspots.sort()
	var esperados: Array = HOTSPOTS_ESPERADOS.duplicate()
	esperados.sort()
	assert_eq(hotspots, esperados)

func test_a_posicao_inicial_e_uma_celula_de_chao() -> void:
	var grade := Cidade.criar_mapa_cidade()
	var pos: Dictionary = Cidade.POSICAO_INICIAL_CIDADE
	var inicial: Dictionary = grade[pos["y"]][pos["x"]]
	assert_eq(inicial["tipo"], "chao")

func test_todos_os_hotspots_sao_alcancaveis_a_partir_da_posicao_inicial() -> void:
	var grade := Cidade.criar_mapa_cidade()
	for nome_hotspot in HOTSPOTS_ESPERADOS:
		var destino = null
		for linha in grade:
			for celula in linha:
				if celula["tipo"] == "hotspot" and celula["conteudo"]["hotspot"] == nome_hotspot:
					destino = celula
		assert_true(Grade.alcancavel(grade, Cidade.POSICAO_INICIAL_CIDADE, destino), "hotspot %s deveria ser alcançável" % nome_hotspot)
