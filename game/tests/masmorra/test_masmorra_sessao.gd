extends GutTest

## Espelha engine/masmorra/index.test.js (id do template trocado de
## "cripta-esquecida" — que não existe mais — para "catacumbas-sombras",
## o equivalente na tabela portada de JogoRPG).

func after_each() -> void:
	Aleatorio.fonte = func() -> float: return randf()

func jogador_de_teste() -> Dictionary:
	return {
		"nivel": 3, "inventario": [], "itens": [{"nome": "Poção de Cura"}],
		"armaEquipada": null, "equipamentos": {}, "ouro": 100,
	}

func test_criar_sessao_inicia_a_posicao_na_entrada() -> void:
	Aleatorio.fonte = func() -> float: return 0.5
	var sessao := MasmorraSessao.criar_sessao_masmorra(jogador_de_teste(), "catacumbas-sombras")
	assert_eq(sessao["posicao"], sessao["dungeon"]["entrance"])

func test_mover_para_celula_adjacente_e_marca_como_visitada() -> void:
	Aleatorio.fonte = func() -> float: return 0.5
	var sessao := MasmorraSessao.criar_sessao_masmorra(jogador_de_teste(), "catacumbas-sombras")
	var y_antes: int = sessao["posicao"]["y"]
	var resultado := MasmorraSessao.mover(sessao, "norte")
	assert_false(resultado["saiuDosLimites"])
	assert_eq(resultado["sessao"]["posicao"]["y"], y_antes - 1)
	assert_true(resultado["celula"]["visited"])

func test_recusa_mover_para_fora_da_grade() -> void:
	Aleatorio.fonte = func() -> float: return 0.5
	var sessao := MasmorraSessao.criar_sessao_masmorra(jogador_de_teste(), "catacumbas-sombras")
	for i in sessao["dungeon"]["size"]:
		var resultado := MasmorraSessao.mover(sessao, "norte")
		sessao = resultado["sessao"]
	var resultado_final := MasmorraSessao.mover(sessao, "norte")
	assert_true(resultado_final["saiuDosLimites"])

func test_limpar_sala_zera_room_type_e_content_da_celula_atual() -> void:
	Aleatorio.fonte = func() -> float: return 0.5
	var sessao := MasmorraSessao.criar_sessao_masmorra(jogador_de_teste(), "catacumbas-sombras")
	var boss_pos: Dictionary = sessao["dungeon"]["bossPos"]
	sessao["posicao"] = {"x": boss_pos["x"], "y": boss_pos["y"]}
	MasmorraSessao.limpar_sala(sessao)
	assert_eq(sessao["dungeon"]["grid"][boss_pos["y"]][boss_pos["x"]]["roomType"], "vazio")
	assert_null(sessao["dungeon"]["grid"][boss_pos["y"]][boss_pos["x"]]["content"])

func test_sai_sem_penalidade_quando_esta_na_entrada() -> void:
	Aleatorio.fonte = func() -> float: return 0.5
	var sessao := MasmorraSessao.criar_sessao_masmorra(jogador_de_teste(), "catacumbas-sombras")
	var resultado := MasmorraSessao.tentar_sair_masmorra(sessao)
	assert_eq(resultado, {"saiu": true, "penalidade": null})

func test_aplica_penalidade_de_pocao_40_por_cento_fora_da_entrada() -> void:
	Aleatorio.fonte = func() -> float: return 0.0 # primeira rolagem (poção) <=40 sucesso
	var sessao := MasmorraSessao.criar_sessao_masmorra(jogador_de_teste(), "catacumbas-sombras")
	var boss_pos: Dictionary = sessao["dungeon"]["bossPos"]
	sessao["posicao"] = {"x": boss_pos["x"], "y": boss_pos["y"]}
	var resultado := MasmorraSessao.tentar_sair_masmorra(sessao)
	assert_true(resultado["saiu"])
	assert_eq(resultado["penalidade"], "pocao")
