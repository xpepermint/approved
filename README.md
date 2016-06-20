# approved.js

> An elegant and intuitive way of synchronous and asynchronous data validation and error handling.

Approved.js provides methods for synchronous and asynchronous validation of complex javascript objects and error handling, with unified output error message format.

It is an open source package. The [source code](https://github.com/xpepermint/approvedjs) is available on GitHub where you can also find our [issue tracker](https://github.com/xpepermint/approvedjs/issues).

<img src="giphy.gif" width="300" />

## Motivation

We often write code which validates input data and handles errors. We do it when we write API controllers, GraphQL mutations, before we try to write something into a database and in many other cases where we manipulate and mutate data.

Its pretty unusual that there is no broadly accepted best practice for writing a common logic like this in Javascript. Every time you start writing validations, you ask yourself the same questions, you try hard finding the best way to get a clean and beautiful solution. At the end you desperately start googling for answers, searching best practices and possible conventions. If you are honest you'll admit that all commonly known solutions are rather complex or ugly.

We need to write a clean and beautiful code to keep our projects long-term sustainable. Validation happens before actual action and error handling happens afterwords. That's why validation and error handling go hand in hand. Approved.js has been written with that in mind.

## Installation

Install the package by running the command below.

```
$ npm install --save approved
```

Continue reading to see how this package is supposed to be used.

## Usage

Below, we create a simple example to show the benefit of using Approved.js in your Node.js projects. In this tutorial we will validate an input and create a new document in a database. If something will go wrong, an error will be catched and parsed into a user-friendly format.

To make things as clean as possible, we'll use [Babel](https://babeljs.io/) with ES7 features and thus we will be able to wrap our code into the `async` block.

```js
(async function() {
  // code here
})().catch(console.error);
```

For the purpose of this tutorial let's first define an imaginary input object which we will validate and save to the database.

```js
const input = {
  firstName: 'John',
  lastName: 'Smith',
  email: 'john@smith.com'
}
```

Instantiate the main `Approval` class.

```js
import {Approval} from 'approved';

let approval = new Approval();
```

Continue by defining a sequence of validations for the `firstName` field.

```js
const validations = [
  {
    path: 'firstName',
    validator: 'isPresent',
    message: 'must be present'
  }, {
    path: 'firstName',
    validator: 'isLength',
    options: {min: 2, max: 50},
    message: 'can be between 2 and 50'
  }
];
```

To show the real benefit of this package let's use the [MongoDB driver](https://docs.mongodb.com/ecosystem/drivers/node-js/) for storing data, with a unique index on the `firstName` field, named `uniqueFirstName`. This will trigger the `E11000` error when the code will be executed for the second time. How to use the MongoDB driver and how to [create a unique indexe](https://docs.mongodb.com/manual/reference/method/db.collection.createIndex/) is out of scope for this tutorial and you'll have to figure this yourself.

```js
import {MongoClient} from 'mongodb';

const mongo = await MongoClient.connect('mongodb://localhost:27017/approved');
```

To catch and handle errors we need to define a sequence of handlers which tell how errors are handled. Note that the `ValidationError` handler is defined by default. Let's set an additional handler for handling uniqueness constraint which we defined earlier. We'll use the [mongo-error-parser](https://github.com/xpepermint/mongo-error-parser) package for parsing MongoError message (don't forget to install it).

```js
import mongoParser from 'mongo-error-parser';

const handlers = [
  {
    path: 'firstName',
    error: 'MongoError',
    options: {
      code: 11000,
      block: async (err) => mongoParser(err).index === 'uniqueFirstName'
    }
    message: 'is already taken'
  }
];
```

Add a try/catch block which validates input data, saves data to the database and catches errors.

```js
const {validateInput, handleError} = approval;

let result, errors = null;
try {
  // validating input data
  await validateInput(input, validations);
  // saving input object the the database
  result = await mongo.collection('users').insertOne(input);
} catch(err) {
  // handling validation and other errors
  errors = await handleError(err, handlers);
  // raising when unhandled error
  if (!errors) throw err;
}
// display result/errors
console.log({result, errors});
```

When this code is executed for the second time the `errors` variable will contain an error message in the same format as validation error messages. This is great because your server can directly respond with this user-friendly information.

```json
{
  "result": null,
  "errors": [
    {
      "path": "firstName",
      "message": "is already taken"
    }
  ]
}
```

**NOTE:** It's a good practice to put validations and handlers into a separated file inside the `./approvals` directory which exposes `validations` and `handlers` variables.

## API

The core of this package represents the `Approval` class.

```js
import {Approval} from 'approved';

const approval = new Approval();
```

### Instance Methods

#### approval.validateInput(input, validations);

> Validates data object against the provided validations and throws a ValidationError if at least one key value is not valid.

| Arguments | Type | Required | Description
|-----------|------|----------|------------
| input | Object | Yes | Data object with keys to be validated.
| validations | Array | Yes | List of validation objects.

```js
validateInput({
  name: 'John Smith'
}, [{
  path: 'name',
  validator: 'isPresent',
  message: 'must be present'
}])
```

#### approval.handleError(error, handlers);

> Handles the provided Error object based on the provided handlers.

| Arguments | Type | Required | Description
|-----------|------|----------|------------
| error | Object | Yes | Error class instance or error object.
| handlers | Array | Yes | List of handler objects.

```js
try {
  throw new Error('Fake error');
} catch(err) {
  let errors = handleError(err, [{
    path: 'base',
    error: 'Error',
    message: 'something went wrong'
  }]);
}
```

### Validations

Validation object defines how a value of an input object key is validated by the `validateInput` method.

| Key | Type | Required | Description
|-----|------|----------|------------
| path | String | Yes | Key name of an input object (e.g. firstName). Nested object paths are also supported (e.g. `users.name.first`)
| validator | String | Yes | Validator name (see the `Built-in Validators` section for a list of available names).
| options | Object | No | Validator settings.
| message | String | Yes | Output error message explaining what went wrong.

```js
let validation = {
  path: 'name',
  validator: 'isPresent',
  message: 'must be present'
};
```

#### Built-in Validators

##### contains

> Checks if the string contains the seed.

| Option | Type | Required | Description
|--------|------|----------|------------
| seed | String | Yes | The seed which should exist in the string.

```js
let validation = {
  path: 'name',
  validator: 'contains',
  options: {seed: 'John'},
  message: 'must contain the John word'
};
```

##### isAbsent

> Validates that the specified attribute is blank.

##### isAlpha

-> TODO

##### isAlphanumeric

-> TODO

##### isAscii

-> TODO

##### isBase64

-> TODO

##### isCreditCard

-> TODO

##### isDataURI

-> TODO

##### isDate

-> TODO

##### isEmail

-> TODO

##### isFQDN

-> TODO

##### isHexColor

-> TODO

##### isIP

-> TODO

##### isISBN

-> TODO

##### isISIN

-> TODO

##### isIn

-> TODO

##### isJSON

-> TODO

##### isLength

> Validates that length of the specified attribute.

| Option | Type | Required | Description
|--------|------|----------|------------
| min | Number | No | Minimum number of characters.
| max | Number | No | Maximum number of characters.

```js
let validation = {
  path: 'name',
  validator: 'isLength',
  options: {min: 5, max: 10},
  message: 'must be between 5 and 10 long'
};
```
##### isLowercase

-> TODO

##### isMACAddress

-> TODO

##### isMobilePhone

-> TODO

##### isMongoId

-> TODO

##### isPresent

> Validates that the specified attribute is not blank.

##### isURL

-> TODO

##### isUUID

-> TODO

##### isUppercase

-> TODO

##### isValid

> Validates the specified attribute against the provided block function. If the function returns true then the attribute is treated as valid.

| Option | Type | Required | Description
|--------|------|----------|------------
| block | Function | Yes | Synchronous or asynchronous function (e.g. `async () => true`)

```js
let validation = {
  path: 'name',
  validator: 'isValid',
  options: {block: async (value, options) => true},
  message: 'must be present'
};
```

##### matches

-> TODO

### Handlers

Handler object defines how an error is handled by the `handleError` method.

| Key | Type | Required | Description
|-----|------|----------|------------
| path | String | Yes | The output key name or a key name of an input object to which the error refers to.
| error | Object | Yes | Error class instance.
| options | Object | No | Handler options. You can set the `code` and `block` keys to additionally check if the handler applies to the provided error.
| message | String | Yes | Output error message explaining what went wrong.

```js
let handler = {
  path: 'system',
  error: 'Error',
  options {code: 500, block: async (value) => true},
  message: 'something went wrong'
};
```

## Advanced Usage

You can completely customize how this module behaves by overriding the instance public methods or by defining your custom validators (check the source code for more).

### Custom Validator

All you need to do to create your custom validator is to define your custom method on the `approval.validators` object.

```js
import {Approval} from 'approved';

let approval = new Approval();

approval.validators.isCool = (value, options) => {
  return str === 'cool';
};

validateInput({
  word: 'cool'
}, [{
  path: 'word',
  validator: 'isCool',
  message: 'must be cool'
}]);
```

## License (MIT)

```
Copyright (c) 2016 Kristijan Sedlak <xpepermint@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
