# .env + .env.placeholder

This package is a wrapper for [`dotenv`](https://www.npmjs.com/package/dotenv) to make it work with Git more easily

It makes your life easier with your git repository if you decide to add `.env` to the `.gitignore` of your project (very good decision by the way, that's the way it should be)

# What does it do ?

If no `.env.placeholder` file is found, it will create one next to your `.env` file, and will put the keys indicated in your `.env` file, without the values.

If no `.env` file is found, it will create one next to your `.env.placeholder` file, and will copy in it the content found in `.env.placeholder`

It warns you if you have empty fields in `.env`

You can add default values to the `.env.placeholder` and it will add this values to the `.env` file __EXCEPTED__ if there is already a value given in `.env` for this key

## Example
```conf
# .env
KEY=secret_value

# .env.placeholder
ADDITIONAL_KEY=
KEY_WITH_DEFAULT=default_value
```
Will transform into :
```conf
# .env
KEY=secret_value
ADDITIONAL_KEY=
KEY_WITH_DEFAULT=default_value

# .env.placeholder
ADDITIONAL_KEY=
KEY_WITH_DEFAULT=default_value
KEY=
```

And it will produce the following messages in the console :
```
info .env.placeholder → .env :  [ 'ADDITIONAL_KEY', 'KEY_WITH_DEFAULT' ]
info .env.placeholder ← .env :  [ 'KEY' ]
warning empty keys found in .env : [ 'ADDITIONAL_KEY' ]
```

# How to use it

## In your Node.js script
```js
const dotenv = require("dotenv-placeholder");
dotenv.config(); // this will trigger the build
```

## In your `package.json`

This is my prefered way, because when someone will clone your project, and then run `npm i`, it will automatically create the `.env` file, allowing the person to customize the `.env` before running your project

```jsonc
{
    "scripts": {
        "postinstall": "dotenv-build --path=./config/.env"
        /* --path is optionnal */
    }
}
```