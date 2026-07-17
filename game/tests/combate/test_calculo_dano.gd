extends GutTest

## Espelha engine/combate/calculoDano.test.js.

func after_each() -> void:
	Aleatorio.fonte = func() -> float: return randf()

func test_calcular_ataque_soma_tudo() -> void:
	var jogador := {
		"ataque": 10,
		"nivel": 3,
		"equipamentos": {"arma": {"atkBonus": 5}, "armadura": null},
		"bonusAtk": 2,
		"amuletoEquipado": false,
		"ataqueOriginal": 10,
		"armaEquipada": {"atk": 3},
	}
	# 10 + floor(3*2)=6 + 5 (equip) + 2 (bonusAtk) + 3 (arma) = 26
	assert_eq(CalculoDano.calcular_ataque_jogador(jogador), 26)

func test_calcular_ataque_soma_bonus_do_amuleto() -> void:
	var jogador := {
		"ataque": 10,
		"nivel": 0,
		"equipamentos": {},
		"bonusAtk": 0,
		"amuletoEquipado": true,
		"ataqueOriginal": 100,
		"armaEquipada": null,
	}
	# 10 + 0 + 0 + 0 + floor(100*0.02)=2 = 12
	assert_eq(CalculoDano.calcular_ataque_jogador(jogador), 12)

func test_calcular_defesa_soma_base_equipamentos_e_bonus() -> void:
	var jogador := {
		"defesa": 8,
		"equipamentos": {"armadura": {"defesa": 4}, "capacete": {"defesa": 2}},
		"bonusDef": 1,
	}
	assert_eq(CalculoDano.calcular_defesa_jogador(jogador), 15)

func test_calcular_dano_base_soma_variacao_aleatoria() -> void:
	var jogador := {
		"ataque": 10, "nivel": 0, "equipamentos": {}, "bonusAtk": 0,
		"amuletoEquipado": false, "armaEquipada": null,
	}
	Aleatorio.fonte = func() -> float: return 0.9 # rand(0,4) = 4
	assert_eq(CalculoDano.calcular_dano_base_jogador(jogador), 14)

func test_calcular_chance_critica_soma_bonus_de_classe_raca_e_arma() -> void:
	var jogador := {
		"bonusClasse": {"critChance": 5},
		"bonusRaca": {"critChance": 3},
		"bonusCritico": 2,
		"armaEquipada": {"efeito": {"tipo": "critico", "chance": 10}},
	}
	assert_eq(CalculoDano.calcular_chance_critica_jogador(jogador), 20)

func test_furia_barbaro_aumenta_dano_com_hp_baixo() -> void:
	var jogador := {"classe": "Bárbaro", "hp": 30, "hpMax": 100}
	assert_eq(CalculoDano.aplicar_furia_barbaro(jogador, 10), 15)

func test_furia_barbaro_nao_altera_outras_classes() -> void:
	var jogador := {"classe": "Guerreiro", "hp": 30, "hpMax": 100}
	assert_eq(CalculoDano.aplicar_furia_barbaro(jogador, 10), 10)

func test_defesa_inimigo_soma_base_e_bonus() -> void:
	var inimigo := {"defesa": 6, "bonusDef": 2}
	assert_eq(CalculoDano.calcular_defesa_inimigo(inimigo), 8)

func jogador_base_ataque() -> Dictionary:
	return {
		"ataque": 10, "nivel": 0, "equipamentos": {}, "bonusAtk": 0,
		"amuletoEquipado": false, "armaEquipada": null,
		"bonusClasse": {}, "bonusRaca": {}, "bonusCritico": 0,
		"classe": "Guerreiro", "hp": 100, "hpMax": 100,
	}

func inimigo_base_ataque() -> Dictionary:
	return {"defesa": 3, "bonusDef": 0, "habilidade": null}

func test_resolver_ataque_jogador_dano_normal_sem_critico() -> void:
	Aleatorio.fonte = func() -> float: return 0.0 # rand(0,4)=0
	var resultado := CalculoDano.resolver_ataque_jogador(jogador_base_ataque(), inimigo_base_ataque())
	assert_eq(resultado, {"dano": 7, "critico": false, "esquivou": false})

func test_resolver_ataque_jogador_dobra_dano_no_critico() -> void:
	var jogador := jogador_base_ataque()
	jogador["bonusCritico"] = 50
	Aleatorio.fonte = func() -> float: return 0.0
	var resultado := CalculoDano.resolver_ataque_jogador(jogador, inimigo_base_ataque())
	assert_eq(resultado, {"dano": 14, "critico": true, "esquivou": false})

func test_resolver_ataque_jogador_inimigo_pode_esquivar() -> void:
	var inimigo := inimigo_base_ataque()
	inimigo["habilidade"] = "esquiva"
	Aleatorio.fonte = func() -> float: return 0.0
	var resultado := CalculoDano.resolver_ataque_jogador(jogador_base_ataque(), inimigo)
	assert_eq(resultado, {"dano": 0, "critico": false, "esquivou": true})

func inimigo_base_defesa() -> Dictionary:
	return {"atk": 10, "status": []}

func jogador_base_defesa() -> Dictionary:
	return {
		"defesa": 5, "equipamentos": {}, "bonusDef": 0,
		"bonusClasse": {}, "bonusEsquiva": 0, "bonusBloqueio": 0,
	}

func test_resolver_ataque_inimigo_dano_normal() -> void:
	Aleatorio.fonte = func() -> float: return 0.0
	# danoBase = max(1, 10 + rand(0,3)=0 - floor(defesaJogador(5)/5)=1) = 9
	var resultado := CalculoDano.resolver_ataque_inimigo(inimigo_base_defesa(), jogador_base_defesa())
	assert_eq(resultado, {"resultado": "dano", "dano": 9})

func test_resolver_ataque_inimigo_jogador_esquiva() -> void:
	var jogador := jogador_base_defesa()
	jogador["bonusEsquiva"] = 50
	Aleatorio.fonte = func() -> float: return 0.0
	var resultado := CalculoDano.resolver_ataque_inimigo(inimigo_base_defesa(), jogador)
	assert_eq(resultado, {"resultado": "esquiva", "dano": 0})

func test_resolver_ataque_inimigo_jogador_bloqueia() -> void:
	var jogador := jogador_base_defesa()
	jogador["bonusBloqueio"] = 50
	Aleatorio.fonte = func() -> float: return 0.0
	var resultado := CalculoDano.resolver_ataque_inimigo(inimigo_base_defesa(), jogador)
	assert_eq(resultado, {"resultado": "bloqueio", "dano": 0})
