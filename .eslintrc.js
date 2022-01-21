module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    env: {
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
    ],
    rules: {
        'no-empty-function': ['error', { allow: ['constructors'] }],
        '@typescript-eslint/no-empty-function': [
            'error',
            { allow: ['constructors'] },
        ],
    },
};
