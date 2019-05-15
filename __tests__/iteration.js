const jsonplate = require('../index')
const data = {
  status: 200,
  body: 'content',
  error: 'test',
  code: 404,
  numbers: [1, 3, 10],
  items: [{ name: 'Orange', price: 100 }],
}

test('_each shorthand', () => {
  expect(
    jsonplate(
      {
        title: 'body',
        items: {
          _each: 'numbers',
          id: '_item',
        },
      },
      data
    )
  ).toEqual({ title: 'content', items: [{ id: 1 }, { id: 3 }, { id: 10 }] })
})

test('_each params', () => {
  expect(
    jsonplate(
      {
        lines: {
          _each: {
            source: [12, 23],
            output: '{_key}-{_item}',
          },
        },
      },
      data
    )
  ).toEqual({ lines: ['0-12', '1-23'] })
})

test('_each object', () => {
  expect(
    jsonplate(
      {
        products: {
          _each: 'items',
          price: 'price',
          info: 'Hello {notDefined}',
          title: 'Buy this {name}',
        },
      },
      data
    )
  ).toEqual({
    products: [
      { price: 100, title: 'Buy this Orange', info: 'Hello {notDefined}' },
    ],
  })
})

test('_each object filters', () => {
  expect(
    jsonplate(
      {
        lines: {
          _each: {
            source: 'numbers',
            output: '{_key}-{_item}',
            filter: {
              _item: {
                _mod: [2, 0],
              },
            },
          },
        },
      },
      data
    )
  ).toEqual({ lines: ['2-10'] })
  expect(
    jsonplate(
      {
        lines: {
          _each: {
            source: 'numbers',
            output: '{_key}-{_item}',
            filter: {
              _or: [
                {
                  _item: {
                    _mod: [2, 0],
                  },
                },
                {
                  _key: {
                    _mod: [2, 0],
                  },
                },
              ],
            },
          },
        },
      },
      data
    )
  ).toEqual({ lines: ['0-1', '2-10'] })
})
