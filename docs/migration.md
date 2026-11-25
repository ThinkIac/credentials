# Migração

Preservadas as exportações existentes, os nomes de eventos e a fase boot. O fallback por diretório vizinho foi substituído pela dependência explícita runtime-compat. Não há dependência de árvore vendor adjacente na distribuição. O compilador é necessário na preparação do pacote Git; o artefato empacotado inclui JavaScript e funciona sem compilador instalado.

O original em test/original.cjs é uma referência de compatibilidade, não implementação de produção. Retornos acidentais CoffeeScript foram evitados nos instaladores para manter retorno undefined.
