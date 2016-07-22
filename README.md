![Build Status](https://travis-ci.org/xpepermint/approvedjs.svg?branch=master)&nbsp;[![NPM Version](https://badge.fury.io/js/approved.svg)](https://badge.fury.io/js/approved)&nbsp;[![Dependency Status](https://gemnasium.com/xpepermint/approvedjs.svg)](https://gemnasium.com/xpepermint/approvedjs)

# approved.js

> Schema-based data filtering, validation and error handling.

Approved.js allows for filtering and validating complex javascript objects and error handling. It has a simple, unified and beautiful API which fully supports asynchronous processing.

It is an open source package. The [source code](https://github.com/xpepermint/approvedjs) is available on GitHub where you can also find our [issue tracker](https://github.com/xpepermint/approvedjs/issues).

<img src="giphy.gif" width="300" />

## Motivation

We often write code which validates data and handles errors. We do it when we write API controllers, GraphQL mutations, before we try to write something into a database and in many other cases where we manipulate and mutate data.

Every time you start writing validations, you ask yourself the same questions. You try hard finding the best way to get a clean and beautiful solution. At the end you desperately start googling for answers, searching best practices and possible conventions.

We need to write a clean and beautiful code to keep our projects long-term sustainable. Validation happens before actual action and error handling happens afterwords - validation and error handling go hand in hand. Approved.js has been written with that in mind.

## Installation

Install the package by running the command below.

```
$ npm install --save approved
```

Continue reading to see how this package is supposed to be used.

## Usage

Below, we create a simple example to show the benefit of using Approved.js in your Node.js projects. In this tutorial we filter and validate data and then create a new document in a database. If something goes wrong, an error is handled and parsed into a user-friendly format.

To make things as clean as possible, we use [Babel](https://babeljs.io/) with ES7 features thus we can wrap our code into the `async` block.

```js
(async function() {
  // code here
})().catch(console.error);
```

For the purpose of this tutorial let's first define an imaginary `data` object which we will later validate and save to the database.

```js
const data = {
  firstName: 'John',
  lastName: 'Smith',
  email: 'John@Smith.com'
}
```

Next, let's create a simple schema for the data above.

```js
import {Approval} from 'approved';

let schema = new Approval();
```

We can filter `data` and extract only the paths defined by filters. Filters also cast data to the right data type.

```js
schema.addFilter({
  path: 'email',
  type: 'string'
});

data = await schema.filter(data); // check the API for method options
```

We define a filter and then we call the `filter` method to extract, cast and modify the data object.

Let's continue by adding validations. We need to verify the email before we store it to the database.

```js
schema.addValidation({
  path: 'name',
  validator: 'isPresent',
  message: 'must be present'
});

try {
  await schema.validate(data); // check the API for method options
} catch(e) {
  // validation failed
}
```

Similar to filters, we first add the validation, then we execute the `validate` method to verify the `data` object. If validation fails the method throws a `ValidationError`. 

Let's update the try/catch block above with an error handler.

```js
let errors = null;
try {
  await schema.validate();
} catch(e) {
  errors = await schema.handle(e); // check the API for method options
  if (!errors) throw e; // unhandled error
}
```

To show the real benefit of the `handle` method let's use the [MongoDB driver](https://docs.mongodb.com/ecosystem/drivers/node-js/) to store `data`, with a unique index on the `email` field, named `uniqueEmail`. This triggers the `E11000` error when the code is executed for the second time. How to use the MongoDB driver and how to [create a unique index](https://docs.mongodb.com/manual/reference/method/db.collection.createIndex/) is out of scope for this tutorial and you'll have to figure that yourself.

```js
import {MongoClient} from 'mongodb';

const mongo = await MongoClient.connect('mongodb://localhost:27017/approved');
```

The `handle` method handles the `ValidationError` by default. To handle a `MongoError`, we need to define a handler. Here we also use the [mongo-error-parser](https://github.com/xpepermint/mongo-error-parser) helper for parsing MongoError message (don't forget to install it).

```js
import mongoParser from 'mongo-error-parser';

schema.addHandler({
  path: 'email',
  error: 'MongoError',
  block: async (err) => err.code === 11000 && mongoParser(err).index === 'uniqueEmail',
  message: 'is already taken'
});
```

We can now update the try/catch block defined earlier with the logic for storing data to the database.

```js
let errors = null;
try {
  await schema.validate(data);
  data = await mongo.collection('users').insertOne(data);
} catch(e) {
  errors = await schema.handle(e);
  if (!errors) throw e; // unhandled error
}
```

That's it. We can now show a well structured data object to a user.

```js
console.log({data, errors}); // cool for GraphQL
```

Note that it's a good practice to store schema classes into the `./approvals` directory. See the included example (`npm run example`) and the source code for more.

## API

The core of this package represents the `Approval` class.

```js
import {Approval} from 'approved';

const schema = new Approval(config);
```

| Param | Type | Required | Default | Description
|-------|------|----------|---------|------------
| config | Object | No | - | A configuration object accepting keys `types={}`, `validators={}`, `filters=[]`, `validations=[]` and `handlers=[]`.

### Instance Variables

#### schema.filters

> Holds a list of defined inout filters.

#### schema.handlers

> Holds a list of defined error handlers.

#### schema.types

> Holds a list of defined data types.

#### schema.validations

> Holds a list of defined validations.

#### schema.validators

> Holds a list of defined validators.

### Instance Methods

#### schema.addFilter(filter)

> Adds a filter to the list of filters.

#### schema.addHandler(handler)

> Adds a handler to the list of handlers.

#### schema.addValidation(validation)

> Adds a validation to the list of validations.

#### schema.filter(data, context, {strict});

> Filters a data object against the filters provided by the `addFilter` method.

| Param | Type | Required | Default | Description
|-------|------|----------|---------|------------
| data | Object | Yes | - | A data object.
| context | Object | No | {} | A context object which is passed into filters.
| strict | Boolean | No | Yes | Removes data object keys which are not defined by the filters when `true`.

#### schema.handle(error, context);

> Handles the provided Error object based on the provided handlers.

| Param | Type | Required | Description
|-------|------|----------|------------
| error | Object | Yes | Error class instance or an error object.
| context | Object | No | {} | A context object which is passed into handlers.

#### schema.removeFilterAtIndex(index)

> Removes a filter from the list of filters.

#### schema.removeHandlerAtIndex(index)

> Removes a handler from the list of handlers.

#### schema.removeValidationAtIndex(index)

> Removes a validation from the list of validations.

#### schema.setType(name, fn)

> Registers a data type method.

| Param | Type | Required | Description
|-------|------|----------|------------
| name | String | Yes | Type name.
| fn | Function | Yes | Type method.

#### schema.setValidator(name, fn)

> Registers a validator.

| Param | Type | Required | Description
|-------|------|----------|------------
| name | String | Yes | Validator name.
| fn | Function | Yes | Validator method.

#### schema.unsetType(name)

> Unregisters a data type method.

| Param | Type | Required | Description
|-------|------|----------|------------
| name | String | Yes | Type name.

#### schema.unsetValidator(name)

> Unregisters a validator.

| Param | Type | Required | Description
|-------|------|----------|------------
| name | String | Yes | Validator name.

#### schema.validate(data, context);

| Param | Type | Required | Default | Description
|-------|------|----------|---------|------------
| data | Object | Yes | - | A data object.
| context | Object | No | {} | A context object which is passed into validators.

> Validates the data object against the validations provided by the `addValidation` method. It throws a `ValidationError` if an object is not valid.

### Filters

Filter object defines how a value of an data object key is casted and filtered by the `filter` method.

| Key | Type | Required | Description
|-----|------|----------|------------
| path | String | Yes | Key name of a data object (e.g. firstName). Nested object paths are also supported (e.g. `users.name.first`)
| type | String | Yes | Data type name (possible values are `boolean`, `date`, `float`, `integer` or `string`).
| block | Function | No | Synchronous or asynchronous resolver for modifying key value (e.g. `async (s) => s`).

```js
const filter = {
  path: 'email',
  type: 'string',
  block: (s, o) => s.toLowerCase()
};
```

### Validations

Validation object defines how a value of a data object key is validated by the `validate` method.

| Key | Type | Required | Description
|-----|------|----------|------------
| path | String | Yes | Key name of a data object (e.g. firstName). Nested object paths are also supported (e.g. `users.name.first`)
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

| Option | Type | Required | Default | Description
|--------|------|---------|----------|------------
| seed | String | Yes | - | The seed which should exist in the string.

##### isAbsent

> Validates that the specified attribute is blank.

##### isBase64

> Validates that the specified attribute is base64 encoded string.

##### isByteLength

> Validates that the specified attribute is a string where length (in bytes) falls in a range.

| Option | Type | Required | Default | Description
|--------|------|----------|---------|------------
| min | Integer | Yes | 0 | Minimum number in bytes.
| max | Integer | Yes | - | Maximum number in bytes.

##### isCreditCard

> Validates that the specified attribute is a credit card number.

##### isDate

> Validates that the specified attribute is a date string.

| Option | Type | Required | Default | Description
|--------|------|----------|---------|------------
| format | String | No | - | Date format (possible value is `iso8601`).

##### isEmail

> Validates that the specified attribute is an email.

| Option | Type | Required | Default | Description
|--------|------|----------|----------|------------
| allowDisplayName | Boolean | No | false | When set to true, the validator will also match `name <address>`.
| allowUtf8LocalPart | Boolean | No | false | When set to false, the validator will not allow any non-English UTF8 character in email address' local part.
| requireTld | Boolean | No | true | When set to false, email addresses without having TLD in their domain will also be matched.

##### isExcluded

> Validates that the specified attribute is not in an array of restricted values.

| Option | Type | Required | Description
|--------|------|----------|------------
| values | Array | Yes | Array of restricted values.

##### isFQDN

> Validates that the specified attribute is a fully qualified domain name (e.g. domain.com).

| Option | Type | Required | Description
|--------|------|----------|------------
| requireTld | Boolean | No | Require top-level domain name.
| allowUnderscores | Boolean | No | Allow string to include underscores.
| allowTrailingDot | Boolean | No | Allow string to include a trailing dot.

##### isHexadecimal

> Validates that the specified attribute is a hexadecimal number.

##### isHexColor

> Validates that the specified attribute is a hexadecimal color string.

##### isIncluded

> Validates that the specified attribute is in an array of allowed values.

| Option | Type | Required | Description
|--------|------|----------|------------
| values | Array | Yes | Array of allowed values.

##### isIP

> Validates that the specified attribute is an IP.

| Option | Type | Required | Default | Description
|--------|------|----------|---------|-------------
| version | Integer | No | - | IP version (4 or 6).

##### isISBN

> Validates that the specified attribute is an [International Standard Book Number](https://en.wikipedia.org/wiki/International_Standard_Book_Number).

| Option | Type | Required | Default | Description
|--------|------|----------|---------|------------
| version | Integer | No | - | IP version (10 or 13).

##### isISIN

> Validates that the specified attribute is an [International Securities Identification](https://en.wikipedia.org/wiki/International_Securities_Identification_Number).

##### isJSON

> Validates that the specified attribute is a stringified JSON string.

##### isLength

> Validates the length of the specified attribute.

| Option | Type | Required | Default | Description
|--------|------|----------|----------|------------
| min | Number | No | 0 | Minimum number of characters.
| max | Number | No | - | Maximum number of characters.

##### isLowercase

> Validates that the specified attribute is lowercase.

##### isMACAddress

> Validates that the specified attribute is a MAC address.

##### isMongoId

> Validates that the specified attribute is a valid hex-encoded representation of a [MongoDB ObjectId](http://docs.mongodb.org/manual/reference/object-id/).

##### isPresent

> Validates that the specified attribute is not blank.

##### isUppercase

> Validates that the specified attribute is uppercase.

##### isURL

> Validates that the specified attribute is an URL.

| Option | Type | Required | Default | Description
|--------|------|----------|---------|------------
| protocols | Array | No | ['http', 'https', 'ftp'] | List of known protocols (e.g. http, https, ftp).
| requireTld | Boolean | No | true | Require top-level domain name.
| requireProtocol | Boolean | No | true | Require URL protocol.
| requireValidProtocol | Boolean | No | true | Require a valid protocol.
| allowUnderscores | Boolean | No | false | Allow using underscores.
| allowTrailingDot | Boolean | No | false | Allow trailing dot.
| allowProtocolRelativeUrls | Boolean | No | false | Allow protocol relative urls (e.g. //foobar.com)

##### isUUID

> Validates that the specified attribute is a [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier).

| Option | Type | Required | Description
|--------|------|----------|------------
| version | Integer | No | UUID version (3, 4 or 5).

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

> Validates that the specified attribute matches the pattern.

| Key | Type | Required | Description
|-----|------|----------|------------
| pattern | String | Yes | Regular expression pattern.
| modifiers | String | No | Regular expression modifiers.

### Handlers

Handler object defines how an error is handled by the `handle` method.

| Key | Type | Required | Description
|-----|------|----------|------------
| path | String | Yes | The output key name or a key name of a data object to which the error refers to.
| error | Object | Yes | Error class instance.
| block | Function | No | Synchronous or asynchronous helper to additionally check if the handler applies to the provided error.
| message | String | Yes | Output error message explaining what went wrong.

```js
let handler = {
  path: 'request',
  error: 'Error',
  block: async (err) => err.code === 400,
  message: 'bad request'
};
```

## Advanced Usage

You can customize how this module behaves by extending the Schema class or by defining your custom types and validators (check the source code for more).

### Custom Type

Use the `setType` method to define a custom data type.

```js
let schema = new Schema();

schema.setType('cooltype', (value, context) => {
  return `cool-${value}`; // not a very smart example :)
});
```

### Custom Validator

Use the `setValidator` method to define a custom validator.

```js
let schema = new Schema();

schema.setValidator('isCool', async (value, context) => {
  return str === 'cool'; // not a very smart example :)
});
```

## Contribute

Let's make this package even better. Please contribute!

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
