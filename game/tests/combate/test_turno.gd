extends GutTest

## Espelha engine/combate/turno.test.js.

func after_each() -> void:
	Aleatorio.fonte = func() -> float: return randf()

func jogador_base() -> Dictionary:
	return {
		"nivel": 0, "ataque": 10, "defesa": 5, "hp": 100, "hpMax": 100,
		"equipamentos": {}, "bonusAtk": 0, "bonusDef": 0,
		"amuletoEquipado": false, "armaEquipada": null,
		"bonusClasse": {}, "bonusRaca": {}, "bonusCritico": 0,
		"bonusEsquiva": 0, "bonusBloqueio": 0,
		"classe": "Guerreiro", "status": [], "xp": 0, "ouro": 0,
	}

func inimigo_base() -> Dictionary:
	return {
		"nome": "Orc", "atk": 8, "defesa": 3, "hp": 30, "hpMax": 30,
		"xp": 15, "ouro": 20, "habilidade": null, "status": [],
	}

func test_processa_rodada_normal_sem_eventos_especiais() -> void:
	var estado := {"jogador": jogador_base(), "inimigo": inimigo_base(), "rodada": 0}
	Aleatorio.fonte = func() -> float: return 0.0

	var resultado := Turno.executar_rodada(estado, "atacar")

	assert_null(resultado["fim"])
	assert_eq(resultado["estado"]["rodada"], 1)
	assert_eq(resultado["estado"]["inimigo"]["hp"], 23) # 30 - 7
	assert_eq(resultado["estado"]["jogador"]["hp"], 93) # 100 - 7
	assert_eq(resultado["eventos"], [
		{"tipo": "dano", "autor": "jogador", "alvo": "inimigo", "valor": 7, "critico": false},
		{"tipo": "dano", "autor": "inimigo", "alvo": "jogador", "valor": 7, "critico": false},
	])

func test_tiquita_sangramento_do_inimigo_e_remove_ao_expirar() -> void:
	var inimigo := inimigo_base()
	inimigo["status"] = [{"tipo": "sangramento", "duracao": 1, "dano": 4}]
	var estado := {"jogador": jogador_base(), "inimigo": inimigo, "rodada": 0}
	Aleatorio.fonte = func() -> float: return 0.0

	var resultado := Turno.executar_rodada(estado, "atacar")

	assert_eq(resultado["eventos"][0], {"tipo": "sangramento_tick", "alvo": "inimigo", "dano": 4, "curado": true})
	assert_eq(resultado["estado"]["inimigo"]["status"], [])
	assert_eq(resultado["estado"]["inimigo"]["hp"], 19) # 30 - 4 (tick) - 7 (ataque)
	assert_eq(resultado["estado"]["jogador"]["hp"], 93)
	assert_null(resultado["fim"])

func test_declara_derrota_quando_envenenamento_zera_hp_no_inicio() -> void:
	var jogador := jogador_base()
	jogador["hp"] = 90
	jogador["status"] = [{"tipo": "envenenamento", "duracao": 1, "dano": 95}]
	var estado := {"jogador": jogador, "inimigo": inimigo_base(), "rodada": 0}

	var resultado := Turno.executar_rodada(estado, "atacar")

	assert_eq(resultado["eventos"], [
		{"tipo": "envenenamento_tick", "alvo": "jogador", "dano": 95, "curado": true},
		{"tipo": "morte", "alvo": "jogador"},
		{"tipo": "derrota"},
	])
	assert_eq(resultado["fim"], "derrota")
	assert_eq(resultado["estado"]["jogador"]["hp"], 0)

func test_declara_vitoria_quando_inimigo_morre_no_ataque() -> void:
	var inimigo := inimigo_base()
	inimigo["hp"] = 5
	var estado := {"jogador": jogador_base(), "inimigo": inimigo, "rodada": 0}
	Aleatorio.fonte = func() -> float: return 0.0

	var resultado := Turno.executar_rodada(estado, "atacar")

	assert_eq(resultado["eventos"], [
		{"tipo": "dano", "autor": "jogador", "alvo": "inimigo", "valor": 7, "critico": false},
		{"tipo": "morte", "alvo": "inimigo"},
		{"tipo": "vitoria", "xpGanho": 15, "ouroGanho": 20},
	])
	assert_eq(resultado["fim"], "vitoria")
	assert_eq(resultado["estado"]["jogador"]["xp"], 15)
	assert_eq(resultado["estado"]["jogador"]["ouro"], 20)

func test_fuga_bem_sucedida_encerra_a_rodada_sem_ataques() -> void:
	var estado := {"jogador": jogador_base(), "inimigo": inimigo_base(), "rodada": 0}
	Aleatorio.fonte = func() -> float: return 0.5 # rand(1,100)=51, >40 sucesso

	var resultado := Turno.executar_rodada(estado, "fugir")

	assert_eq(resultado["eventos"], [{"tipo": "fuga", "sucesso": true}])
	assert_eq(resultado["fim"], "fuga")
	assert_eq(resultado["estado"]["inimigo"]["hp"], 30)

func test_fuga_malsucedida_permite_que_o_inimigo_ataque() -> void:
	var estado := {"jogador": jogador_base(), "inimigo": inimigo_base(), "rodada": 0}
	Aleatorio.fonte = func() -> float: return 0.0 # rand(1,100)=1, <=40 falha na fuga

	var resultado := Turno.executar_rodada(estado, "fugir")

	assert_eq(resultado["eventos"], [
		{"tipo": "fuga", "sucesso": false},
		{"tipo": "dano", "autor": "inimigo", "alvo": "jogador", "valor": 7, "critico": false},
	])
	assert_null(resultado["fim"])
	assert_eq(resultado["estado"]["jogador"]["hp"], 93)

func test_aplica_envenenamento_no_jogador_quando_o_inimigo_acerta() -> void:
	var inimigo := inimigo_base()
	inimigo["habilidade"] = "envenenamento"
	var estado := {"jogador": jogador_base(), "inimigo": inimigo, "rodada": 0}
	Aleatorio.fonte = func() -> float: return 0.0

	var resultado := Turno.executar_rodada(estado, "atacar")

	assert_eq(resultado["eventos"], [
		{"tipo": "dano", "autor": "jogador", "alvo": "inimigo", "valor": 7, "critico": false},
		{"tipo": "dano", "autor": "inimigo", "alvo": "jogador", "valor": 7, "critico": false},
		{"tipo": "envenenamento_aplicado", "alvo": "jogador"},
	])
	assert_eq(resultado["estado"]["jogador"]["status"], [{"tipo": "envenenamento", "duracao": 3, "dano": 5}])

func test_paralisia_jogador_perde_o_turno() -> void:
	var jogador := jogador_base()
	jogador["status"] = [{"tipo": "paralisado", "duracao": 1}]
	var estado := {"jogador": jogador, "inimigo": inimigo_base(), "rodada": 0}
	Aleatorio.fonte = func() -> float: return 0.0

	var resultado := Turno.executar_rodada(estado, "atacar")

	assert_eq(resultado["eventos"][0], {"tipo": "paralisado", "alvo": "jogador"})
	var houve_dano_do_jogador := false
	for e in resultado["eventos"]:
		if e["tipo"] == "dano" and e.get("autor") == "jogador":
			houve_dano_do_jogador = true
	assert_false(houve_dano_do_jogador)

func test_invulneravel_ignora_dano_do_jogador() -> void:
	var inimigo := inimigo_base()
	inimigo["status"] = [{"tipo": "invulneravel", "duracao": 1}]
	var estado := {"jogador": jogador_base(), "inimigo": inimigo, "rodada": 0}
	var hp_antes: int = inimigo["hp"]
	Aleatorio.fonte = func() -> float: return 0.0

	var resultado := Turno.executar_rodada(estado, "atacar")

	var houve_invulneravel := false
	for e in resultado["eventos"]:
		if e["tipo"] == "invulneravel_ativo":
			houve_invulneravel = true
	assert_true(houve_invulneravel)
	assert_eq(resultado["estado"]["inimigo"]["hp"], hp_antes)

func test_roubo_e_fuga_do_inimigo_termina_em_fuga() -> void:
	var jogador := jogador_base()
	jogador["ouro"] = 100
	var inimigo := inimigo_base()
	inimigo["habilidade"] = "roubo_e_fuga"
	inimigo["hp"] = 30
	var estado := {"jogador": jogador, "inimigo": inimigo, "rodada": 0}
	Aleatorio.fonte = func() -> float: return 0.0

	var resultado := Turno.executar_rodada(estado, "atacar")

	assert_eq(resultado["fim"], "fuga")
	var houve_roubo := false
	for e in resultado["eventos"]:
		if e["tipo"] == "fuga_com_roubo":
			houve_roubo = true
	assert_true(houve_roubo)
	assert_lt(resultado["estado"]["jogador"]["ouro"], 100)

func test_bloquear_e_contra_atacar_so_dispara_com_a_habilidade() -> void:
	var inimigo := inimigo_base()
	inimigo["habilidade"] = "bloquear_e_contra_atacar"
	var estado := {"jogador": jogador_base(), "inimigo": inimigo, "rodada": 0}
	Aleatorio.fonte = func() -> float: return 0.0

	var resultado := Turno.executar_rodada(estado, "atacar")

	var houve_contra := false
	for e in resultado["eventos"]:
		if e["tipo"] == "contra_ataque":
			houve_contra = true
	assert_true(houve_contra)

func test_usar_pocao_cura_nao_ataca_e_inimigo_revida() -> void:
	Aleatorio.fonte = func() -> float: return 0.5
	var jogador := jogador_base()
	jogador["hp"] = 40
	jogador["hpMax"] = 100
	jogador["itens"] = ["Poção de Cura"]
	jogador["inventario"] = []
	var estado := {"jogador": jogador, "inimigo": inimigo_base(), "rodada": 0}

	var resultado := Turno.executar_rodada(estado, "usar_pocao")

	var evento_pocao = null
	for e in resultado["eventos"]:
		if e["tipo"] == "pocao_usada":
			evento_pocao = e
	assert_not_null(evento_pocao)
	assert_true(evento_pocao["valor"] >= 20 and evento_pocao["valor"] <= 30)
	assert_eq(jogador["itens"], [])
	var houve_dano_do_jogador := false
	var houve_acao_inimigo := false
	for e in resultado["eventos"]:
		if e["tipo"] == "dano" and e.get("autor") == "jogador":
			houve_dano_do_jogador = true
		if e.get("autor") == "inimigo" or e.get("alvo") == "jogador":
			houve_acao_inimigo = true
	assert_false(houve_dano_do_jogador)
	assert_true(houve_acao_inimigo)

func test_usar_pocao_sem_pocao_disponivel() -> void:
	Aleatorio.fonte = func() -> float: return 0.5
	var jogador := jogador_base()
	jogador["hp"] = 40
	jogador["hpMax"] = 100
	jogador["itens"] = []
	jogador["inventario"] = []
	var estado := {"jogador": jogador, "inimigo": inimigo_base(), "rodada": 0}

	var resultado := Turno.executar_rodada(estado, "usar_pocao")

	var houve_indisponivel := false
	var houve_usada := false
	for e in resultado["eventos"]:
		if e["tipo"] == "pocao_indisponivel":
			houve_indisponivel = true
		if e["tipo"] == "pocao_usada":
			houve_usada = true
	assert_true(houve_indisponivel)
	assert_false(houve_usada)
	assert_eq(jogador["itens"], [])
	assert_eq(jogador["inventario"], [])

func test_defender_reduz_o_dano_do_inimigo_pela_metade() -> void:
	Aleatorio.fonte = func() -> float: return 0.5
	var jogador_normal := jogador_base()
	jogador_normal["hp"] = 500
	jogador_normal["hpMax"] = 500
	var estado_normal := {"jogador": jogador_normal, "inimigo": inimigo_base(), "rodada": 0}
	var resultado_normal := Turno.executar_rodada(estado_normal, "atacar")
	var dano_normal = null
	for e in resultado_normal["eventos"]:
		if e["tipo"] == "dano" and e.get("autor") == "inimigo":
			dano_normal = e["valor"]
	assert_not_null(dano_normal)
	assert_true(dano_normal > 0)

	Aleatorio.fonte = func() -> float: return 0.5
	var jogador := jogador_base()
	jogador["hp"] = 500
	jogador["hpMax"] = 500
	var estado := {"jogador": jogador, "inimigo": inimigo_base(), "rodada": 0}

	var resultado := Turno.executar_rodada(estado, "defender")

	var houve_defendendo := false
	var houve_dano_do_jogador := false
	var dano_defendido = null
	for e in resultado["eventos"]:
		if e["tipo"] == "defendendo":
			houve_defendendo = true
		if e["tipo"] == "dano" and e.get("autor") == "jogador":
			houve_dano_do_jogador = true
		if e["tipo"] == "dano" and e.get("autor") == "inimigo":
			dano_defendido = e["valor"]
	assert_true(houve_defendendo)
	assert_false(houve_dano_do_jogador)
	assert_eq(dano_defendido, floori(dano_normal / 2.0))
