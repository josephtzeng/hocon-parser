const js = require ("@eslint/js");
const globals = require ("globals");


module.exports = [
    js.configs.recommended
    ,
    {
        languageOptions:
        {
            sourceType: "commonjs",
            globals:
            {
                ...globals.browser,
                ...globals.node
            }
        }
        ,
        rules:
        {
            "accessor-pairs": "error",
            "array-bracket-newline": "error",
            "array-bracket-spacing": ["error", "never"],
            "array-callback-return": "error",
            "array-element-newline": "off",
            "arrow-body-style": "error",
            "arrow-parens": "off",
            "arrow-spacing": "off",
            "block-scoped-var": "off",
            "block-spacing": "off",
            "brace-style": "off",
            "callback-return": "error",
            "camelcase": "off",
            "capitalized-comments": "off",
            "class-methods-use-this": "off",
            "comma-dangle": "error",
            "comma-spacing": "off",
            "comma-style": "off",
            "complexity": "off",
            "computed-property-spacing": ["error", "never"],
            "consistent-return": "off",
            "consistent-this": "off",
            "curly": "error",
            "default-case": "off",
            "dot-location": ["error", "property"],
            "dot-notation":
            [
                "error",
                {
                    "allowKeywords": true
                }
            ],
            "eol-last": "error",
            "eqeqeq": "off",
            "func-call-spacing": "off",
            "func-name-matching": "error",
            "func-names": "off",
            "func-style": "off",
            "function-paren-newline": "off",
            "generator-star-spacing": "error",
            "global-require": "off",
            "guard-for-in": "off",
            "handle-callback-err": "off",
            "id-blacklist": "error",
            "id-length": "off",
            "id-match": "error",
            "implicit-arrow-linebreak": "off",
            "indent": "off",
            "indent-legacy": "off",
            "init-declarations": "off",
            "jsx-quotes": "error",
            "key-spacing": "off",
            "keyword-spacing": "off",
            "line-comment-position": "off",
            "linebreak-style": ["error", "unix"],
            "lines-around-comment": "error",
            "lines-around-directive": "off",
            "lines-between-class-members": ["error", "always"],
            "max-classes-per-file": "off",
            "max-depth": "off",
            "max-len": "off",
            "max-lines": "off",
            "max-lines-per-function": "off",
            "max-nested-callbacks": "error",
            "max-params": "off",
            "max-statements": "off",
            "max-statements-per-line": "off",
            "multiline-comment-style": "off",
            "new-parens": "off",
            "newline-after-var": "off",
            "newline-before-return": "off",
            "newline-per-chained-call": "off",
            "no-alert": "error",
            "no-array-constructor": "error",
            "no-async-promise-executor": "error",
            "no-await-in-loop": "off",
            "no-bitwise": "off",
            "no-buffer-constructor": "error",
            "no-caller": "error",
            "no-catch-shadow": "off",
            "no-confusing-arrow": "error",
            "no-continue": "off",
            "no-div-regex": "error",
            "no-duplicate-imports": "error",
            "no-else-return": "off",
            "no-empty":
            [
                "error",
                {
                    "allowEmptyCatch": true
                }
            ],
            "no-empty-function": "off",
            "no-eq-null": "off",
            "no-eval": "error",
            "no-extend-native": "error",
            "no-extra-bind": "error",
            "no-extra-label": "error",
            "no-extra-parens": "off",
            "no-floating-decimal": "error",
            "no-irregular-whitespace": "error",
            "no-implicit-coercion":
            [
                "error",
                {
                    "boolean": false,
                    "number": false,
                    "string": false
                }
            ],
            "no-implicit-globals": "error",
            "no-implied-eval": "error",
            "no-inline-comments": "off",
            "no-inner-declarations": ["error", "functions"],
            "no-invalid-this": "off",
            "no-iterator": "error",
            "no-label-var": "error",
            "no-labels": "error",
            "no-lone-blocks": "error",
            "no-lonely-if": "off",
            "no-loop-func": "off",
            "no-magic-numbers": "off",
            "no-misleading-character-class": "error",
            "no-mixed-operators": "off",
            "no-mixed-requires": "error",
            "no-multi-assign": "off",
            "no-multi-spaces": "off",
            "no-multi-str": "error",
            "no-multiple-empty-lines": "off",
            "no-native-reassign": "error",
            "no-negated-condition": "off",
            "no-negated-in-lhs": "error",
            "no-nested-ternary": "off",
            "no-new": "error",
            "no-new-func": "error",
            "no-new-object": "error",
            "no-new-require": "error",
            "no-new-wrappers": "error",
            "no-octal-escape": "error",
            "no-param-reassign": "off",
            "no-path-concat": "off",
            "no-plusplus": "off",
            "no-process-env": "off",
            "no-process-exit": "error",
            "no-proto": "error",
            "no-prototype-builtins": "off",
            "no-restricted-globals": "error",
            "no-restricted-imports": "error",
            "no-restricted-modules": "error",
            "no-restricted-properties": "error",
            "no-restricted-syntax": "error",
            "no-return-assign": "off",
            "no-return-await": "off",
            "no-script-url": "error",
            "no-self-compare": "error",
            "no-sequences": "error",
            "no-shadow": "off",
            "no-shadow-restricted-names": "error",
            "no-spaced-func": "off",
            "no-sync": "off",
            "no-tabs": "error",
            "no-template-curly-in-string": "error",
            "no-ternary": "off",
            "no-throw-literal": "error",
            "no-trailing-spaces": "error",
            "no-undef-init": "off",
            "no-undefined": "off",
            "no-underscore-dangle": "off",
            "no-unmodified-loop-condition": "error",
            "no-unneeded-ternary": "error",
            "no-unused-expressions": "error",
            "no-unused-vars":
            [
                "error",
                {
                    "caughtErrors": "none"
                }
            ]
            ,
            "no-use-before-define": "off",
            "no-useless-call": "error",
            "no-useless-catch": "error",
            "no-useless-computed-key": "error",
            "no-useless-concat": "error",
            "no-useless-constructor": "error",
            "no-useless-rename": "error",
            "no-useless-return": "error",
            "no-var": "off",
            "no-void": "off",
            "no-warning-comments": "error",
            "no-whitespace-before-property": "error",
            "no-with": "error",
            "nonblock-statement-body-position": "error",
            "object-curly-newline": "error",
            "object-curly-spacing": "off",
            "object-property-newline": "off",
            "object-shorthand": "off",
            "one-var": "off",
            "one-var-declaration-per-line": "off",
            "operator-assignment": "off",
            "operator-linebreak": "off",
            "padded-blocks": "off",
            "padding-line-between-statements": "error",
            "prefer-arrow-callback": "off",
            "prefer-const": "off",
            "prefer-destructuring": "off",
            "prefer-numeric-literals": "error",
            "prefer-object-spread": "off",
            "prefer-promise-reject-errors": "error",
            "prefer-reflect": "off",
            "prefer-rest-params": "off",
            "prefer-spread": "off",
            "prefer-template": "off",
            "quote-props": "off",
            "quotes": "off",
            "radix": "error",
            "require-atomic-updates": "off",
            "require-await": "off",
            "require-jsdoc": "off",
            "require-unicode-regexp": "off",
            "rest-spread-spacing": ["error", "never"],
            "semi": "warn",
            "semi-spacing": "off",
            "semi-style": "off",
            "sort-imports": "error",
            "sort-keys": "off",
            "sort-vars": "off",
            "space-before-blocks": "off",
            "space-before-function-paren": "off",
            "space-in-parens": ["error", "never"],
            "space-infix-ops": "off",
            "space-unary-ops": "error",
            "spaced-comment": "off",
            "strict": "off",
            "switch-colon-spacing":
            [
                "error",
                {
                    "after": false,
                    "before": false
                }
            ],
            "symbol-description": "error",
            "template-curly-spacing":
            [
                "error",
                "never"
            ],
            "template-tag-spacing": "error",
            "unicode-bom":
            [
                "error",
                "never"
            ],
            "vars-on-top": "off",
            "wrap-regex": "off",
            "yield-star-spacing": "error",
            "yoda": "off"
        }
    }
    ,
    {
        files: ["tests/**/*.js"]
        ,
        languageOptions:
        {
            sourceType: "commonjs",
            globals:
            {
                ...globals.browser,
                ...globals.node,
                ...globals.jest,
                CWD: true,
                TESTS_DIR: true,
                CONFIGS_DIR: true,
                include: true,
                _: true
            }
        }
        ,
        rules:
        {
            "no-lone-blocks": "off"
        }
    }
];
