# Jsonplate

Templating json from "graphql compatible" json objects.

### Basic usage

```javascript
const result = jsonplate({ hello: 'world' }, { world: 'World !!!' })
expect(result).toEqual({ hello: 'World !!!' })
```

### Iteration, interpolation, filters, conditionals...

you can pass values in curly braces `hello: '{world}!!!'`, or `hello: 'world'`.

`price: 'item.price'` will return value "as is".

`price: '{item.price}'` will be string

`_item` and `_parent` available inside loops.

if element got properties, they will be available directly.
`price: '_item.price'` === `price: 'price'`

```javascript
const data = {
  items: [
    { name: 'Mandarin', price: 100, variants: ['Tangerine', 'Clementine'] },
    { name: 'Apple', price: 55, variants: ['Green', 'Red'] },
    { name: 'Pear', onSale: true, price: 78, variants: ['Yellow', 'Green'] },
  ],
}
const template = {
  _each: 'items',
  _id: '_key',
  info: '{name} from ₴{_item.price}',
  options: {
    _each: '_item.variants',
    variants: '{_item} {_parent._item.name}',
  },
}

const result = jsonplate(template, data)

console.log(result)
```

### Output:

```javascript
;[
  {
    _id: 0,
    info: 'Mandarin from ₴100',
    options: [
      { variants: 'Tangerine Mandarin' },
      { variants: 'Clementine Mandarin' },
    ],
  },
  {
    _id: 1,
    info: 'Apple from ₴55',
    options: [{ variants: 'Green Apple' }, { variants: 'Red Apple' }],
  },
  {
    _id: 2,
    info: 'Pear from ₴78',
    options: [{ variants: 'Yellow Pear' }, { variants: 'Green Pear' }],
  },
]
```

## Filters and Conditions

Using [sift.js](https://github.com/crcn/sift.js) under the hood.

Supported operators: $in, $nin, $exists, $gte, $gt, $lte, $lt, $eq, $ne, $mod, $all, $and, $or, $nor, $not, $size, $type, $regex, \$elemMatch

**\$where** is disabled

```javascript
const template = {
  _each: {
    source: 'items',
    filter: { price: { _lt: 100 } },
    output: {
      _id: '_key',
      info: '{name} from ₴{_item.price}',
      _if: {
        variants: { _in: ['Red'] },
        _then: { redVariant: true },
      },
      options: {
        _each: {
          source: '_item.variants',
          // ***** '_parent.onSale' also works
          filter: { _parent__onSale: { _eq: true } },
        },
        variants: '{_item} {_parent._item.name}',
      },
    },
  },
}
```

## Todo

- Math\Computed values `{* price 0.8}`, `{+ price 100}`
- `_each` for object properties
- `_merge` and\or `_reduce` 

## Alternatives

### ST [JSON Selector + Transformer](https://github.com/SelectTransform/st.js)

### [json4json](https://github.com/BaffinLee/json4json)

### [json-templater/object](https://github.com/lightsofapollo/json-templater)
