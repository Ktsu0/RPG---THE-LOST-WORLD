# The Lost World — WebRPG

RPG de turnos no navegador, reconstrução visual do jogo de console original (`JogoRPG/`).

Jogo publicado: https://ktsu0.github.io/RPG---THE-LOST-WORLD/

## Desenvolvimento

```bash
npm install
npm test        # suíte completa (engine/ + WebRPG/src/)
npm run dev      # servidor de desenvolvimento (WebRPG/)
npm run build    # build de produção em dist/
```

O deploy no GitHub Pages é automático a cada push na branch `main` (`.github/workflows/deploy.yml`), com os testes como gate.
