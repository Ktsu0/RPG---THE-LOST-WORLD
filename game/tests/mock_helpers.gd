class_name MockHelpers
extends RefCounted

## Utilitário de teste — NÃO é um teste (nome sem prefixo "test_" de propósito,
## para o GUT não tentar rodá-lo como suíte).
##
## Emula o encadeamento vi.spyOn(Math, "random").mockReturnValueOnce(a)
## .mockReturnValueOnce(b)...mockReturnValue(fallback) do Vitest: consome os
## valores de "valores_once" em ordem, um por chamada a Aleatorio.fonte, e
## depois repete "fallback" indefinidamente.
static func fila_com_fallback(valores_once: Array, fallback: float) -> Callable:
	var indice := [0]
	return func() -> float:
		if indice[0] < valores_once.size():
			var v: float = valores_once[indice[0]]
			indice[0] += 1
			return v
		return fallback
