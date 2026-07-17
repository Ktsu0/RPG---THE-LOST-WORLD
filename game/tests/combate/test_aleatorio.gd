extends GutTest

## Espelha engine/combate/aleatorio.test.js.

func after_each() -> void:
	Aleatorio.fonte = func() -> float: return randf()

func test_retorna_valor_minimo_quando_fonte_retorna_0() -> void:
	Aleatorio.fonte = func() -> float: return 0.0
	assert_eq(Aleatorio.rand(5, 10), 5)

func test_retorna_valor_maximo_quando_fonte_se_aproxima_de_1() -> void:
	Aleatorio.fonte = func() -> float: return 0.999999
	assert_eq(Aleatorio.rand(5, 10), 10)

func test_calcula_um_valor_intermediario_corretamente() -> void:
	Aleatorio.fonte = func() -> float: return 0.5
	assert_eq(Aleatorio.rand(1, 100), 51)
