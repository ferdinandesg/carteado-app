module.exports = {
  // Define os ambientes onde o código será executado
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "eslint-config-prettier", // Sempre o último!
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true, // Habilita o parsing de JSX
    },
    ecmaVersion: "latest",
    sourceType: "module",
  },
  // Plugins que adicionam novas regras
  plugins: ["@typescript-eslint", "react", "jest"],
  // Configurações específicas para plugins
  settings: {
    react: {
      version: "detect", // Detecta automaticamente a versão do React
    },
  },
  // Suas regras personalizadas (sobrescrevem as dos 'extends')
  rules: {
    // Exemplo: Desativa a necessidade de importar React em cada arquivo (padrão em Next.js)
    "react/react-in-jsx-scope": "off",

    // Exemplo: Permite o uso de 'any' mas gera um aviso (bom para migrações)
    "@typescript-eslint/no-explicit-any": "warn",

    // Exemplo: Não exige que toda função exportada tenha um tipo de retorno explícito
    "@typescript-eslint/explicit-module-boundary-types": "off",
  },
};
