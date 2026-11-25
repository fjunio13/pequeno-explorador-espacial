# Instruções para agentes

- Leia a [especificação funcional v0.1](docs/especificacao-funcional.md) e a [arquitetura técnica v0.1](docs/arquitetura.md) antes de alterar o projeto. Consulte o responsável pelo projeto antes de mudar decisões arquiteturais ou pedagógicas aprovadas e atualize a documentação com as mudanças autorizadas.
- Siga a etapa de desenvolvimento autorizada. A implementação do Planeta Estrelas começa após aprovação explícita.
- Mantenha o jogo estático em HTML, CSS e JavaScript. Solicite aprovação antes de introduzir frameworks, dependências de execução, backend ou serviços externos.
- Use caminhos relativos para arquivos do jogo e preserve o funcionamento no subdiretório do GitHub Pages.
- Mantenha as regras de cada atividade fora do núcleo e a navegação geral fora dos módulos dos planetas. Libere controles, animações e outros recursos temporários ao sair de uma atividade.
- Use Pointer Events para toque e mouse. Preserve a orientação em paisagem, a autonomia de crianças que ainda não leem e o feedback sem punições.
- Mantenha ilustrações, narrações pré-gravadas e efeitos no projeto. Documente a origem e os direitos de uso de cada recurso.
- Use dados fictícios em código, documentação, testes e exemplos. Preserve a privacidade da criança e da família em nomes, imagens, voz e demais informações identificáveis.
- Cubra as mudanças com testes proporcionais. Rode as verificações do [README](README.md) antes de abrir um pull request e relate as limitações da validação.
- Trabalhe em branch separada. Submeta mudanças por pull request e aguarde autorização explícita para merge ou publicação.
