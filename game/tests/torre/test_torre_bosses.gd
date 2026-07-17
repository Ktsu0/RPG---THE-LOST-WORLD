extends GutTest

## Espelha engine/torre/bosses.test.js.

func after_each() -> void:
	Aleatorio.fonte = func() -> float: return randf()

func test_tem_os_10_bosses_na_ordem_do_console() -> void:
	assert_eq(TorreBosses.LISTA.size(), 10)
	assert_eq(TorreBosses.LISTA[0]["nome"], "Guardião de Pedra")
	assert_eq(TorreBosses.LISTA[9]["nome"], "Lorde do Caos")

func test_senhor_dos_mortos_tem_habilidade_de_invocar_esqueletos() -> void:
	var boss: Dictionary
	for b in TorreBosses.LISTA:
		if b["nome"] == "Senhor dos Mortos":
			boss = b
	assert_eq(boss["habilidades"], {"summonSkeletonsEveryTurns": 1, "summonedSkeletonHp": 15, "summonedSkeletonDmgBase": 5})

func test_criar_boss_torre_escala_com_o_nivel_abaixo_do_teto() -> void:
	Aleatorio.fonte = func() -> float: return 0.5
	var boss := TorreBosses.criar_boss_torre(0, {"nivel": 3})
	assert_eq(boss["nome"], "Guardião de Pedra")
	assert_eq(boss["hpMax"], boss["hp"])
	assert_true(boss["hp"] > 210)

func test_criar_boss_torre_trava_escalonamento_no_teto() -> void:
	Aleatorio.fonte = func() -> float: return 0.5
	var boss_nivel5 := TorreBosses.criar_boss_torre(0, {"nivel": TorreBosses.NIVEL_CAP_TORRE})
	var boss_nivel50 := TorreBosses.criar_boss_torre(0, {"nivel": 50})
	assert_eq(boss_nivel50["hp"], boss_nivel5["hp"])
	assert_eq(boss_nivel50["atk"], boss_nivel5["atk"])

func test_criar_boss_torre_inicializa_estado_com_contadores() -> void:
	var boss := TorreBosses.criar_boss_torre(0, {"nivel": 1})
	assert_eq(boss["estado"], {
		"turnoContador": 0, "invisivel": false, "petrificadoTurns": 0,
		"esqueletosInvocados": [], "jaRessuscitou": false,
	})
