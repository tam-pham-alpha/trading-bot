# Trading Bot

This is an automated trading application built with TypeScript, NodeJS, and Turbo. The project features data aggregation and sends data to Google Big Data, enabling the use of low-code tools like Dynaboard or Retool for query analysis and data extraction.  

The application provides several features, including:  
- Fetching data from SSI, a Vietnamese stock exchange.  
- Automated trading on SSI based on predefined configurations from a Google Spreadsheet.  
- Automated trading on Binance using configuration files from a Google Spreadsheet.  
- Automatically updating trading positions to a Google Spreadsheet.  
- Sniping meme coins on Solana and pushing information to Discord.

### 🧰 Simple TypeScript Starter | 2022

> We talk about a lot of **advanced Node.js and TypeScript** concepts on [the blog](https://khalilstemmler.com), particularly focused around Domain-Driven Design and large-scale enterprise application patterns. However, I received a few emails from readers that were interested in seeing what a basic TypeScript starter project looks like. So I've put together just that.

### Features

- Minimal
- TypeScript v4
- Testing with Jest
- Linting with Eslint and Prettier
- Pre-commit hooks with Husky
- VS Code debugger scripts
- Local development with Nodemon

### Scripts

#### `npm run start:dev`

Starts the application in development using `nodemon` and `ts-node` to do hot reloading.

#### `npm run start`

Starts the app in production by first building the project with `npm run build`, and then executing the compiled JavaScript at `build/index.js`.

#### `npm run build`

Builds the app at `build`, cleaning the folder first.

#### `npm run test`

Runs the `jest` tests once.

#### `npm run test:dev`

Run the `jest` tests in watch mode, waiting for file changes.

#### `npm run prettier-format`

Format your code.

#### `npm run prettier-watch`

Format your code in watch mode, waiting for file changes.
