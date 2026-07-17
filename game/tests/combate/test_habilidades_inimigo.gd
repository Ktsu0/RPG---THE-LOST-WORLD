extends GutTest

## Espelha engine/combate/habilidadesInimigo.test.js.

func after_each() -> void:
	Aleatorio.fonte = func() -> float: return randf()

func test_esquiva_false_quando_habilidade_nao_e_esquiva() -> void:
	assert_false(HabilidadesInimigo.verificar_esquiva_inimigo({"habilidade": null}))

func test_esquiva_true_quando_habilidade_e_esquiva_e_chance_acerta() -> void:
	Aleatorio.fonte = func() -> float: return 0.0
	assert_true(HabilidadesInimigo.verificar_esquiva_inimigo({"habilidade": "esquiva"}))

func test_esquiva_false_quando_chance_falha() -> void:
	Aleatorio.fonte = func() -> float: return 0.99
	assert_false(HabilidadesInimigo.verificar_esquiva_inimigo({"habilidade": "esquiva"}))

func test_ataque_duplo_false_quando_habilidade_nao_e_ataque_duplo() -> void:
	assert_false(HabilidadesInimigo.verificar_ataque_duplo({"habilidade": null}))

func test_ataque_duplo_true_quando_a_chance_acerta() -> void:
	Aleatorio.fonte = func() -> float: return 0.0
	assert_true(HabilidadesInimigo.verificar_ataque_duplo({"habilidade": "ataque_duplo"}))

func test_ataque_duplo_false_quando_a_chance_falha() -> void:
	Aleatorio.fonte = func() -> float: return 0.99
	assert_false(HabilidadesInimigo.verificar_ataque_duplo({"habilidade": "ataque_duplo"}))

func test_envenenamento_nao_aplica_se_habilidade_nao_for_envenenamento() -> void:
	var inimigo := {"habilidade": null}
	var jogador := {"status": []}
	assert_false(HabilidadesInimigo.verificar_envenenamento_ao_atacar(inimigo, jogador))
	assert_eq(jogador["status"].size(), 0)

func test_envenenamento_aplica_no_jogador_quando_chance_acerta() -> void:
	var inimigo := {"habilidade": "envenenamento"}
	var jogador := {"status": []}
	Aleatorio.fonte = func() -> float: return 0.0 # rand(1,100)=1<=20 sucesso; rand(3,5)=3
	assert_true(HabilidadesInimigo.verificar_envenenamento_ao_atacar(inimigo, jogador))
	assert_eq(jogador["status"], [{"tipo": "envenenamento", "duracao": 3, "dano": 5}])

func test_envenenamento_nao_aplica_quando_a_chance_falha() -> void:
	var inimigo := {"habilidade": "envenenamento"}
	var jogador := {"status": []}
	Aleatorio.fonte = func() -> float: return 0.99
	assert_false(HabilidadesInimigo.verificar_envenenamento_ao_atacar(inimigo, jogador))
	assert_eq(jogador["status"].size(), 0)

func test_invulneravel_aplica_e_processa_decrementando_duracao() -> void:
	var inimigo := {"status": []}
	HabilidadesInimigo.aplicar_invulneravel(inimigo)
	assert_true(HabilidadesInimigo.processar_invulneravel_do_turno(inimigo))
	assert_eq(inimigo["status"], []) # duração 1 -> já expirou neste processamento

func test_invulneravel_false_quando_nao_esta_invulneravel() -> void:
	assert_false(HabilidadesInimigo.processar_invulneravel_do_turno({"status": []}))

func test_verificar_paralisia_12_por_cento() -> void:
	Aleatorio.fonte = func() -> float: return 0.0
	assert_true(HabilidadesInimigo.verificar_paralisia())

func test_paralisia_jogador_perde_o_turno_e_duracao_decrementa() -> void:
	var jogador := {"status": []}
	HabilidadesInimigo.aplicar_paralisia(jogador, 2)
	assert_true(HabilidadesInimigo.processar_paralisia_do_turno(jogador))
	assert_eq(jogador["status"], [{"tipo": "paralisado", "duracao": 1}])
	assert_true(HabilidadesInimigo.processar_paralisia_do_turno(jogador))
	assert_eq(jogador["status"], [])

func test_paralisia_false_quando_jogador_nao_esta_paralisado() -> void:
	assert_false(HabilidadesInimigo.processar_paralisia_do_turno({"status": []}))

func test_verificar_roubo_e_fuga_20_por_cento() -> void:
	Aleatorio.fonte = func() -> float: return 0.0
	assert_true(HabilidadesInimigo.verificar_roubo_e_fuga())

func test_roubar_ouro_e_fugir_entre_20_e_50_capado() -> void:
	Aleatorio.fonte = func() -> float: return 0.0 # rand(20,50)=20
	var jogador := {"ouro": 100}
	assert_eq(HabilidadesInimigo.roubar_ouro_e_fugir(jogador), 20)
	assert_eq(jogador["ouro"], 80)

func test_roubar_ouro_e_fugir_nunca_deixa_ouro_negativo() -> void:
	Aleatorio.fonte = func() -> float: return 0.99 # rand(20,50)=50
	var jogador := {"ouro": 10}
	assert_eq(HabilidadesInimigo.roubar_ouro_e_fugir(jogador), 10)
	assert_eq(jogador["ouro"], 0)

func test_verificar_petrificar_20_por_cento() -> void:
	Aleatorio.fonte = func() -> float: return 0.0
	assert_true(HabilidadesInimigo.verificar_petrificar_ao_atacar({"habilidade": "petrificar"}))

func test_verificar_petrificar_false_quando_habilidade_diferente() -> void:
	assert_false(HabilidadesInimigo.verificar_petrificar_ao_atacar({"habilidade": "regeneracao"}))

func test_aplicar_buff_petrificar_aumenta_defesa() -> void:
	var inimigo := {"defesa": 20}
	HabilidadesInimigo.aplicar_buff_petrificar(inimigo)
	assert_eq(inimigo["defesa"], 22) # floor(20*0.05)+1 = 1+1 = 2 -> 20+2=22

func test_regeneracao_cura_quando_a_chance_de_30_acerta() -> void:
	var inimigo := {"habilidade": "regeneracao", "hp": 50, "hpMax": 100}
	Aleatorio.fonte = func() -> float: return 0.2 # < 0.3
	assert_eq(HabilidadesInimigo.processar_regeneracao(inimigo), {"curou": true, "valor": 7})
	assert_eq(inimigo["hp"], 57)

func test_regeneracao_nao_cura_quando_habilidade_diferente() -> void:
	var inimigo := {"habilidade": "petrificar", "hp": 50, "hpMax": 100}
	assert_eq(HabilidadesInimigo.processar_regeneracao(inimigo), {"curou": false, "valor": 0})

func test_regeneracao_nao_cura_quando_a_chance_falha() -> void:
	var inimigo := {"habilidade": "regeneracao", "hp": 50, "hpMax": 100}
	Aleatorio.fonte = func() -> float: return 0.9 # >= 0.3
	assert_eq(HabilidadesInimigo.processar_regeneracao(inimigo), {"curou": false, "valor": 0})

func test_verificar_bloquear_e_contra_atacar_10_por_cento() -> void:
	Aleatorio.fonte = func() -> float: return 0.0
	assert_true(HabilidadesInimigo.verificar_bloquear_e_contra_atacar())

func test_calcular_contra_ataque_retorna_90_por_cento_do_dano() -> void:
	assert_eq(HabilidadesInimigo.calcular_contra_ataque(null, 20), 18)
