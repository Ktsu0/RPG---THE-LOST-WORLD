extends GutTest

## Espelha engine/itens/amuletoTalisma.test.js.

func contar_item(inventario: Array, nome: String) -> int:
	var total := 0
	for i in inventario:
		if i == nome:
			total += 1
	return total

func test_pode_craftar_amuleto_retorna_false_quando_faltam_itens() -> void:
	assert_false(AmuletoTalisma.pode_craftar_amuleto([]))

func test_pode_craftar_amuleto_retorna_true_quando_atende_todos_requisitos() -> void:
	var inventario: Array = []
	for r in AmuletoTalisma.REQUISITOS_AMULETO:
		for i in r["quantidade"]:
			inventario.append(r["nome"])
	assert_true(AmuletoTalisma.pode_craftar_amuleto(inventario))

func test_craftar_amuleto_consome_os_itens_necessarios() -> void:
	var inventario: Array = []
	for r in AmuletoTalisma.REQUISITOS_AMULETO:
		for i in r["quantidade"]:
			inventario.append(r["nome"])
	var jogador := {"inventario": inventario, "amuletoEquipado": false}
	AmuletoTalisma.craftar_amuleto(jogador)
	for r in AmuletoTalisma.REQUISITOS_AMULETO:
		assert_eq(contar_item(jogador["inventario"], r["nome"]), 0)

func test_craftar_amuleto_marca_amuleto_craftado_true() -> void:
	var inventario: Array = []
	for r in AmuletoTalisma.REQUISITOS_AMULETO:
		for i in r["quantidade"]:
			inventario.append(r["nome"])
	var jogador := {"inventario": inventario, "amuletoEquipado": false, "amuletoCraftado": false}
	AmuletoTalisma.craftar_amuleto(jogador)
	assert_true(jogador["amuletoCraftado"])

func test_alternar_amuleto_ao_equipar_soma_atk_e_hp() -> void:
	var jogador := {"ataque": 20, "hp": 80, "hpMax": 100, "amuletoEquipado": false}
	AmuletoTalisma.alternar_amuleto(jogador)
	assert_true(jogador["amuletoEquipado"])
	assert_eq(jogador["ataque"], 21) # floor(20*1.05)
	assert_eq(jogador["hpMax"], 110) # floor(100*1.10)
	assert_eq(jogador["hp"], 110)

func test_alternar_amuleto_ao_desequipar_reverte_valores_originais() -> void:
	var jogador := {"ataque": 20, "hp": 80, "hpMax": 100, "amuletoEquipado": false}
	AmuletoTalisma.alternar_amuleto(jogador)
	AmuletoTalisma.alternar_amuleto(jogador)
	assert_false(jogador["amuletoEquipado"])
	assert_eq(jogador["ataque"], 20)
	assert_eq(jogador["hpMax"], 100)

func test_preco_talisma_fiel_ao_console() -> void:
	assert_eq(AmuletoTalisma.PRECO_TALISMA, {"fragmentos": 10, "ouro": 2000})

func test_pode_craftar_talisma_exige_10_fragmentos_e_2000_ouro() -> void:
	var sem_recursos := {"inventario": [], "ouro": 0}
	assert_false(AmuletoTalisma.pode_craftar_talisma(sem_recursos))

	var com_recursos := {"inventario": [], "ouro": 2000}
	for i in 10:
		com_recursos["inventario"].append("Fragmento Antigo")
	assert_true(AmuletoTalisma.pode_craftar_talisma(com_recursos))

func test_craftar_talisma_consome_fragmentos_e_ouro_adiciona_item() -> void:
	var jogador := {"inventario": [], "ouro": 2000}
	for i in 10:
		jogador["inventario"].append("Fragmento Antigo")
	AmuletoTalisma.craftar_talisma(jogador)
	assert_eq(contar_item(jogador["inventario"], "Fragmento Antigo"), 0)
	assert_eq(jogador["ouro"], 0)
	assert_eq(contar_item(jogador["inventario"], "Talismã da Torre"), 1)
