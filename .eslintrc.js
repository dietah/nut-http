module.exports = {
	root: true,
	extends: ['airbnb-base'],
	rules: {
		'arrow-parens': 0,
		'comma-dangle': [2, 'only-multiline'],
		'import/extensions': 0,
		'import/no-extraneous-dependencies': 0,
		'import/no-unresolved': 0,
		'indent': 0,
		'indent-legacy': ['error', 'tab', { SwitchCase: 1 }], // we need legacy because eslint-plugin-vue doesn't support the new indent options yet
		'max-len': ['error', { code: 180, tabWidth: 4, ignoreUrls: true, ignoreComments: true }],
		'no-lonely-if': 0,
		'no-mixed-operators': 0,
		'no-param-reassign': 0,
		'no-plusplus': 0,
		'no-tabs': 0,
		'no-underscore-dangle': ['error'],
		'no-use-before-define': [2, { functions: false, classes: true }],
		'object-curly-newline': ['error', {
			ObjectExpression: { minProperties: 5, multiline: true, consistent: true },
			ObjectPattern: { minProperties: 5, multiline: true, consistent: true }
		}],
		'prefer-destructuring': ['error', {
			VariableDeclarator: {
				array: false,
				object: true,
			},
			AssignmentExpression: {
				array: false,
				object: true,
			},
		}, {
			enforceForRenamedProperties: false,
		}],
	},
	env: {
		node: true
	},
	globals: {
		api: true
	}
};
