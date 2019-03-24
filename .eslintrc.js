module.exports = {
    "env": {
        "browser": false,
        "commonjs": true,
        "es6": true
    },
    "extends": "airbnb-base",
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaVersion": 2018
    },
    "rules": {
      "brace-style": ["error", "stroustrup"],
      "no-underscore-dangle": 0,
    }
};