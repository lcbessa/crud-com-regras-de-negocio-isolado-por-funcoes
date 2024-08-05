# crud-com-regras-de-negocio-isolado-por-funcoes
## Pré- requisitos

Certifique-se de ter os seguintes requisitos instalados:

- **Node.js**: Você pode baixar e instalar o Node.js a partir do [site oficial do Node.js](https://nodejs.org/).

- **PostgreSQL**: Certifique-se de que o PostgreSQL esteja instalado e em execução. Você pode baixar o PostgreSQL a partir do [site oficial do PostgreSQL](https://www.postgresql.org/download/).

- **Ferramenta para Testar APIs (Insomnia)**: Você precisará de uma ferramenta para testar as APIs da sua aplicação. O Insomnia pode ser baixado [site oficial do Insomnia](https://insomnia.rest/download).

## Iniciando a Aplicação

Siga os passos abaixo para iniciar a aplicação:

1. Use o NVM para selecionar a versão correta do Node.js (se estiver usando o NVM):

    `nvm use`

2. Instale as dependências do projeto:
   
    `npm install`

3. **Crie o Banco de Dados**: Antes de aplicar as migrações de banco de dados, certifique-se de que o banco de dados esteja criado e configurado corretamente. Configure as variáveis de ambiente no arquivo `.env` para a conexão com o banco de dados.

4. Aplique as migrações de banco de dados:
   
    `npx prisma migrate dev`

5. Inicie a aplicação:
   
    `npm run dev`

Isso iniciará a aplicação em modo de desenvolvimento.

6. **Testar Endpoints**: Utilize o arquivo [testes_insomnia.json](https://github.com/lcbessa/crud-com-regras-de-negocio-isolado-por-funcoes/blob/master/testes_insomnia.json) que contém os endpoints para teste. Esse arquivo pode ser importado diretamente no Insomnia para facilitar a execução dos testes.
