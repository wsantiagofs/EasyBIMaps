# EasyBIMaps

EasyBIMaps é um aplicativo web para visualizar, editar e exportar arquivos GeoJSON de forma intuitiva e interativa.

## Funcionalidades

- **Visualização de mapas**: Exibe dados geográficos usando Leaflet, permitindo navegação e zoom.
- **Upload de arquivos GeoJSON**: Carregue arquivos com múltiplas features e estilos já definidos.
- **Separação automática de features**: Cada feature do arquivo é tratada como uma camada independente, facilitando o controle e edição individual.
- **Edição de estilos**: Altere cor da linha, espessura, cor e opacidade do preenchimento, raio dos pontos, tanto por sliders quanto por campos numéricos.
- **Visualização do código**: Veja o código GeoJSON estilizado de cada camada no painel lateral.
- **Exportação**: Exporte todas as camadas editadas para um novo arquivo GeoJSON, com os estilos atualizados.
- **Remoção e reordenação de camadas**: Gerencie facilmente as camadas carregadas.
- **Interface moderna**: Utiliza Tailwind CSS para um visual limpo e responsivo.

## Como usar

1. Abra o `index.html` em seu navegador.
2. Carregue um ou mais arquivos GeoJSON usando o campo de upload.
3. Edite os estilos de cada camada individualmente no painel de controles.
4. Visualize o código GeoJSON gerado no painel lateral.
5. Exporte o resultado usando o botão "Exportar como GeoJSON".
6. Importe o arquivo exportado no Power BI para criar mapas visuais customizados.

## Estrutura do projeto

- `index.html`: Página principal do aplicativo.
- `src/app.js`: Lógica do aplicativo (visualização, edição, exportação, etc).
- `src/style.css`: Estilos customizados do aplicativo.

---

Desenvolvido para facilitar o trabalho com dados geográficos e visualização interativa de GeoJSON.

