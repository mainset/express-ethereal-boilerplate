const prettierConfig = {
  // prettier
  trailingComma: 'all',
  singleQuote: true,

  plugins: ['@trivago/prettier-plugin-sort-imports'],

  // {@trivago/prettier-plugin-sort-imports}
  importOrder: ['^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};

export default prettierConfig;
