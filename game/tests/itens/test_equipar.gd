extends GutTest

## Espelha engine/itens/equipar.test.js.

func jogador_base() -> Dictionary:
	return {
		"equipamentos": {"head": null, "chest": null, "hands": null, "legs": null, "feet": null},
		"armaEquipada": null,
		"inventario": [],
		"bonusEsquiva": 0, "bonusCritico": 0, "bonusBloqueio": 0, "bonusHP": 0, "bonusAtk": 0,
	}

func test_zera_os_bonus_quando_nenhum_conjunto_esta_completo() -> void:
	var jogador := jogador_base()
	jogador["bonusEsquiva"] = 99
	Equipar.aplicar_bonus_de_conjunto(jogador)
	assert_eq(jogador["bonusEsquiva"], 0)
	assert_eq(jogador["bonusCritico"], 0)
	assert_eq(jogador["bonusBloqueio"], 0)
	assert_eq(jogador["bonusHP"], 0)
	assert_eq(jogador["bonusAtk"], 0)

func test_aplica_mais_15_de_bloqueio_com_conjunto_ferro_completo() -> void:
	var jogador := jogador_base()
	for slot in ["head", "chest", "hands", "legs", "feet"]:
		jogador["equipamentos"][slot] = {"nome": "Peça Ferro %s" % slot, "slot": slot, "set": "Ferro", "defesa": 1, "atkBonus": 0}
	Equipar.aplicar_bonus_de_conjunto(jogador)
	assert_eq(jogador["bonusBloqueio"], 15)

func test_aplica_esquiva_e_critico_com_conjunto_sombra_completo() -> void:
	var jogador := jogador_base()
	for slot in ["head", "chest", "hands", "legs", "feet"]:
		jogador["equipamentos"][slot] = {"nome": "Peça Sombra %s" % slot, "slot": slot, "set": "Sombra", "defesa": 1, "atkBonus": 0}
	Equipar.aplicar_bonus_de_conjunto(jogador)
	assert_eq(jogador["bonusEsquiva"], 10)
	assert_eq(jogador["bonusCritico"], 10)

func test_nao_aplica_bonus_se_o_conjunto_estiver_incompleto() -> void:
	var jogador := jogador_base()
	for slot in ["head", "chest", "hands", "legs"]:
		jogador["equipamentos"][slot] = {"nome": "Peça Dragão %s" % slot, "slot": slot, "set": "Dragão", "defesa": 1, "atkBonus": 0}
	Equipar.aplicar_bonus_de_conjunto(jogador)
	assert_eq(jogador["bonusHP"], 0)
	assert_eq(jogador["bonusAtk"], 0)

func test_equipar_armadura_no_slot_vazio_devolve_item_antigo_null() -> void:
	var jogador := jogador_base()
	var elmo := {"nome": "Elmo de Ferro", "slot": "head", "set": "Ferro", "defesa": 6, "atkBonus": 0}
	var resultado := Equipar.equipar_armadura_no_slot(jogador, elmo)
	assert_eq(resultado, {"itemAntigo": null})
	assert_eq(jogador["equipamentos"]["head"], elmo)

func test_equipar_armadura_troca_peca_ja_equipada() -> void:
	var jogador := jogador_base()
	var elmo_velho := {"nome": "Elmo Velho", "slot": "head", "set": null, "defesa": 2, "atkBonus": 0}
	jogador["equipamentos"]["head"] = elmo_velho
	var elmo_novo := {"nome": "Elmo Novo", "slot": "head", "set": null, "defesa": 6, "atkBonus": 0}

	var resultado := Equipar.equipar_armadura_no_slot(jogador, elmo_novo)

	assert_eq(resultado, {"itemAntigo": elmo_velho})
	assert_eq(jogador["equipamentos"]["head"], elmo_novo)

func test_equipar_arma_quando_nao_ha_arma_devolve_item_antigo_null() -> void:
	var jogador := jogador_base()
	var espada := {"nome": "Espada Longa", "slot": "weapon", "atk": 5, "efeito": null}
	var resultado := Equipar.equipar_arma(jogador, espada)
	assert_eq(resultado, {"itemAntigo": null})
	assert_eq(jogador["armaEquipada"], espada)

func test_equipar_arma_troca_a_arma_equipada() -> void:
	var jogador := jogador_base()
	var antiga := {"nome": "Adaga", "slot": "weapon", "atk": 3, "efeito": null}
	jogador["armaEquipada"] = antiga
	var nova := {"nome": "Foice do Ceifador", "slot": "weapon", "atk": 12, "efeito": {"tipo": "roubo_de_vida", "percentual": 0.15}}

	var resultado := Equipar.equipar_arma(jogador, nova)

	assert_eq(resultado, {"itemAntigo": antiga})
	assert_eq(jogador["armaEquipada"], nova)

func test_comparar_atributos_retorna_0_0_quando_nao_ha_item_atual() -> void:
	var novo := {"defesa": 6, "atkBonus": 2}
	assert_eq(Equipar.comparar_atributos(null, novo), {"defesa": 6, "atkBonus": 2})

func test_comparar_atributos_retorna_a_diferenca_positiva() -> void:
	var atual := {"defesa": 4, "atkBonus": 1}
	var novo := {"defesa": 6, "atkBonus": 2}
	assert_eq(Equipar.comparar_atributos(atual, novo), {"defesa": 2, "atkBonus": 1})

func test_comparar_atributos_retorna_a_diferenca_negativa() -> void:
	var atual := {"defesa": 12, "atkBonus": 5}
	var novo := {"defesa": 6, "atkBonus": 2}
	assert_eq(Equipar.comparar_atributos(atual, novo), {"defesa": -6, "atkBonus": -3})
