# .env + .env.placeholder
This package is a wrapper for [`dotenv`](https://www.npmjs.com/package/dotenv), with additional features.
It is recommended to add `.env` to the `.gitignore` of your project

### Explanation
The purpose of this package compared to the original `dotenv` package is to work with Git more easily.

This package adds a file called `.env.placeholder` at the root level that will contain a safe version of your `.env` file (it will get only the keys of `.env`)

If you want, you can add default values to the `.env.placeholder` and it will add this values to the `.env` file (except if there is already a value given in `.env` for this key)

### Examples
```
# .env
KEY=secret_value

# .env.placeholder
ADDITIONAL_KEY=
KEY_WITH_DEFAULT=default_value
```
Will transform into :
```
# .env
KEY=secret_value
ADDITIONAL_KEY=
KEY_WITH_DEFAULT=default_value

# .env.placeholder
ADDITIONAL_KEY=
KEY_WITH_DEFAULT=default_value
KEY=
```

And it will produce the following messages :
```
info .env.placeholder → .env :  [ 'ADDITIONAL_KEY', 'KEY_WITH_DEFAULT' ]
info .env.placeholder ← .env :  [ 'KEY' ]
warning empty keys found in .env : [ 'ADDITIONAL_KEY' ]
```