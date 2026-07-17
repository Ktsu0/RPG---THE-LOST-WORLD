extends GutTest

## Espelha engine/masmorra/inimigoDaSala.test.js.

func after_each() -> void:
	Aleatorio.fonte = func() -> float: return randf()

func test_escala_hp_atk_xp_ouro_pela_dificuldade_sem_poder_extra() -> void:
	Aleatorio.fonte = func() -> float: return 0.5
	var celula := {"roomType": "miniboss", "content": {"nome": "Cavaleiro Caído"}}

	assert_eq(InimigoDaSala.criar_inimigo_da_sala(celula, {"nivel": 3}), {
		"nome": "Cavaleiro Caído",
		"hp": 135, "hpMax": 135, "atk": 36, "defesa": 9, "xp": 45, "ouro": 30,
		"habilidade": null, "status": [],
	})

func test_aplica_o_multiplicador_de_poder_da_sala_de_boss() -> void:
	Aleatorio.fonte = func() -> float: return 0.5
	var celula := {"roomType": "boss", "content": {"nome": "Lich Menor", "poder": 1.4}}

	assert_eq(InimigoDaSala.criar_inimigo_da_sala(celula, {"nivel": 3}), {
		"nome": "Lich Menor",
		"hp": 336, "hpMax": 336, "atk": 76, "defesa": 9, "xp": 63, "ouro": 42,
		"habilidade": null, "status": [],
	})

func test_lanca_erro_para_um_tipo_de_sala_sem_encontro() -> void:
	var celula := {"roomType": "vazio", "content": null}
	var resultado = InimigoDaSala.criar_inimigo_da_sala(celula, {"nivel": 3})
	assert_null(resultado)
	assert_push_error('Tipo de sala "vazio"')
