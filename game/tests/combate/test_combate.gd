extends GutTest

## Espelha engine/combate/index.test.js.

func after_each() -> void:
	Aleatorio.fonte = func() -> float: return randf()

func test_criar_estado_batalha_inicializa_status_vazios() -> void:
	var jogador := {"hp": 100}
	var inimigo := {"hp": 30}
	var estado := Combate.criar_estado_batalha(jogador, inimigo)
	assert_eq(estado["jogador"]["status"], [])
	assert_eq(estado["inimigo"]["status"], [])
	assert_eq(estado["rodada"], 0)

func test_criar_estado_batalha_nao_compartilha_referencia_do_status_do_inimigo() -> void:
	var inimigo_original := {"hp": 30, "status": []}
	var estado := Combate.criar_estado_batalha({"hp": 100}, inimigo_original)
	estado["inimigo"]["status"].append({"tipo": "sangramento", "duracao": 1, "dano": 1})
	assert_eq(inimigo_original["status"], [])

func test_executar_acao_jogador_delega_para_a_rodada() -> void:
	var jogador := {
		"nivel": 0, "ataque": 10, "defesa": 5, "hp": 100, "hpMax": 100,
		"equipamentos": {}, "bonusAtk": 0, "bonusDef": 0,
		"amuletoEquipado": false, "armaEquipada": null,
		"bonusClasse": {}, "bonusRaca": {}, "bonusCritico": 0,
		"bonusEsquiva": 0, "bonusBloqueio": 0,
		"classe": "Guerreiro", "xp": 0, "ouro": 0,
	}
	var inimigo := {
		"nome": "Orc", "atk": 8, "defesa": 3, "hp": 30, "hpMax": 30,
		"xp": 15, "ouro": 20, "habilidade": null,
	}
	var estado := Combate.criar_estado_batalha(jogador, inimigo)
	Aleatorio.fonte = func() -> float: return 0.0

	var resultado := Combate.executar_acao_jogador(estado, "atacar")

	assert_null(resultado["fim"])
	assert_true(resultado["eventos"].size() > 0)
	assert_true(resultado["estado"]["inimigo"]["hp"] < 30)
