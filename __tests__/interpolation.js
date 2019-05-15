const jsonplate = require('../index')
const data = {
  status: 200,
  hello: {
    planet: 'Earth',
  },
  world: 'World !!!',
  body: 'content',
  error: 'test',
  code: 404,
  numbers: [1, 3, 10],
  items: [
    { name: 'Mandarin', price: 100, variants: ['Tangerine', 'Clementine'] },
    { name: 'Apple', price: 55, variants: ['Green', 'Red'] },
  ],
  produce: [
    { name: 'Mandarin', price: 100, variants: ['Tangerine', 'Clementine'] },
    { name: 'Apple', price: 55, variants: ['Green', 'Red'] },
    { name: 'Pear', onSale: true, price: 78, variants: ['Yellow', 'Green'] },
  ],
}

test('hello: World', () => {
  expect(
    jsonplate(
      {
        hello: '{world}',
      },
      data
    )
  ).toEqual({ hello: 'World !!!' })
})

test('hello: Planet', () => {
  expect(
    jsonplate(
      {
        hello: 'hello.planet',
      },
      data
    )
  ).toEqual({ hello: 'Earth' })
})
test('length', () => {
  expect(
    jsonplate(
      {
        goods: {
          _each: 'items',
          title: '{_number} out of {items.length}: {name}',
        },
      },
      data
    )
  ).toEqual({
    goods: [{ title: '1 out of 2: Mandarin' }, { title: '2 out of 2: Apple' }],
  })
})

test('parent', () => {
  expect(
    jsonplate(
      {
        _each: 'items',
        _id: '_key',
        info: '{name} from ₴{_item.price}',
        options: {
          _each: '_item.variants',
          variants: '{_item} {_parent._item.name}',
        },
      },
      data
    )
  ).toEqual([
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
  ])
})

test('filters', () => {
  expect(
    jsonplate(
      {
        goods: {
          _each: {
            source: 'produce',
            filter: {
              price: {
                _lt: 100,
              },
            },
            output: {
              _id: '_key',
              info: '{name} from ₴{_item.price}',
              options: {
                _each: {
                  source: '_item.variants',
                  filter: {
                    // '_parent.onSale' also works
                    _parent__onSale: {
                      _eq: true,
                    },
                  },
                },
                variants: '{_item} {_parent._item.name}',
              },
            },
          },
        },
      },
      data
    )
  ).toEqual({
    goods: [
      { _id: 1, info: 'Apple from ₴55', options: [] },
      {
        _id: 2,
        info: 'Pear from ₴78',
        options: [{ variants: 'Yellow Pear' }, { variants: 'Green Pear' }],
      },
    ],
  })
})

test('conditional', () => {
  expect(
    jsonplate(
      {
        goods: {
          _each: {
            source: 'produce',
            filter: {
              price: {
                _lt: 100,
              },
            },
            output: {
              _id: '_key',
              info: '{name} from ₴{_item.price}',
              _if: {
                variants: {
                  _in: ['Red'],
                },
                _then: {
                  redVariant: true,
                },
              },
              options: {
                _each: {
                  source: '_item.variants',
                  filter: {
                    // '_parent.onSale' also works
                    _parent__onSale: {
                      _eq: true,
                    },
                  },
                },
                variants: '{_item} {_parent._item.name}',
              },
            },
          },
        },
      },
      data
    )
  ).toEqual({
    goods: [
      { _id: 1, info: 'Apple from ₴55', options: [], redVariant: true },
      {
        _id: 2,
        info: 'Pear from ₴78',
        options: [{ variants: 'Yellow Pear' }, { variants: 'Green Pear' }],
      },
    ],
  })
})
