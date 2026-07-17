extends GutTest

## Espelha engine/loja/index.test.js.

func test_comprar_item_com_ouro_suficiente() -> void:
	var jogador := {"ouro": 3000, "inventario": []}
	var item := {"nome": "Elmo de Ferro", "preco": 2050}
	assert_true(Loja.comprar_item(jogador, item))
	assert_eq(jogador["ouro"], 950)
	assert_eq(jogador["inventario"], [item])

func test_nao_compra_quando_ouro_insuficiente() -> void:
	var jogador := {"ouro": 100, "inventario": []}
	var item := {"nome": "Elmo de Ferro", "preco": 2050}
	assert_false(Loja.comprar_item(jogador, item))
	assert_eq(jogador["ouro"], 100)
	assert_eq(jogador["inventario"], [])

func test_itens_vendiveis_filtra_consumiveis() -> void:
	var inventario := [
		{"nome": "Poção de Cura", "slot": "consumable"},
		{"nome": "Espada Longa", "slot": "weapon"},
		{"nome": "Elmo de Ferro", "slot": "head"},
	]
	var nomes: Array = Loja.itens_vendiveis(inventario).map(func(i): return i["nome"])
	assert_eq(nomes, ["Espada Longa", "Elmo de Ferro"])

func test_vender_itens_por_30_por_cento_do_preco() -> void:
	var jogador := {
		"ouro": 0,
		"inventario": [
			{"nome": "Espada Longa", "slot": "weapon", "preco": 2500},
			{"nome": "Elmo de Ferro", "slot": "head", "preco": 2050},
			{"nome": "Poção de Cura", "slot": "consumable", "preco": 200},
		],
	}
	var resultado := Loja.vender_itens(jogador, [0, 1]) # vende Espada Longa e Elmo de Ferro
	# floor(2500*0.3)=750, floor(2050*0.3)=615, total=1365
	assert_eq(resultado, {"totalRecebido": 1365})
	assert_eq(jogador["ouro"], 1365)
	assert_eq(jogador["inventario"], [{"nome": "Poção de Cura", "slot": "consumable", "preco": 200}])
