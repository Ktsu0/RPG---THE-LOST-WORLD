extends GutTest

## Espelha engine/itens/catalogo.test.js.

func test_tem_os_4_conjuntos_cada_um_com_5_pecas() -> void:
	var chaves := Catalogo.CONJUNTOS_ARMADURA.keys()
	assert_eq(chaves, ["Ferro", "Ligeiro", "Sombra", "Dragão"])
	for set_nome in chaves:
		var pecas: Array = Catalogo.CONJUNTOS_ARMADURA[set_nome]
		assert_eq(pecas.size(), 5)
		var slots: Array = pecas.map(func(p): return p["slot"])
		slots.sort()
		assert_eq(slots, ["chest", "feet", "hands", "head", "legs"])

func test_o_peitoral_do_dragao_tem_os_atributos_corretos() -> void:
	var pecas: Array = Catalogo.CONJUNTOS_ARMADURA["Dragão"]
	var peitoral = pecas.filter(func(p): return p["nome"] == "Peitoral do Dragão")[0]
	assert_eq(peitoral, {"nome": "Peitoral do Dragão", "slot": "chest", "defesa": 20, "atkBonus": 7, "preco": 17510, "raridade": "lendario"})

func test_catalogo_armas_tem_as_10_armas_com_efeitos_corretos() -> void:
	assert_eq(Catalogo.CATALOGO_ARMAS.size(), 10)
	var adaga = Catalogo.CATALOGO_ARMAS.filter(func(a): return a["nome"] == "Adaga Sombria")[0]
	assert_eq(adaga, {
		"nome": "Adaga Sombria", "slot": "weapon", "atk": 6, "preco": 6500,
		"efeito": {"tipo": "sangramento", "chance": 20, "danoPorTurno": 5, "duracao": 3},
		"raridade": "raro",
	})
	var foice = Catalogo.CATALOGO_ARMAS.filter(func(a): return a["nome"] == "Foice do Ceifador")[0]
	assert_eq(foice["efeito"], {"tipo": "roubo_de_vida", "percentual": 0.15})

func test_catalogo_consumiveis_tem_a_pocao_de_cura() -> void:
	assert_eq(Catalogo.CATALOGO_CONSUMIVEIS, [{"nome": "Poção de Cura", "slot": "consumable", "preco": 200, "raridade": "comum"}])

func test_catalogo_loja_combina_armaduras_consumiveis_e_armas_com_ids_unicos() -> void:
	var loja := Catalogo.catalogo_loja()
	assert_eq(loja.size(), 20 + 1 + 10)
	var ids: Array = loja.map(func(i): return i["id"])
	var unicos := {}
	for id in ids:
		unicos[id] = true
	assert_eq(unicos.size(), ids.size())

func test_catalogo_loja_preserva_o_campo_set_nas_pecas_de_armadura() -> void:
	var loja := Catalogo.catalogo_loja()
	var elmo_ferro = loja.filter(func(i): return i["nome"] == "Elmo de Ferro")[0]
	assert_eq(elmo_ferro["set"], "Ferro")
	assert_eq(elmo_ferro["defesa"], 6)
