class_name Aleatorio
extends RefCounted

## Porte de engine/combate/aleatorio.js.
##
## fonte é uma Callable trocável (equivalente GDScript a vi.spyOn(Math, "random")
## nos testes Vitest do engine/ original) — troque-a em teste para tornar rand()
## determinístico, e restaure para o padrão depois. Ver
## docs/superpowers/plans/2026-07-17-godotrpg-fase1-motor-portado.md.
static var fonte: Callable = func() -> float: return randf()

static func rand(minimo: int, maximo: int) -> int:
	return floori(fonte.call() * (maximo - minimo + 1)) + minimo
