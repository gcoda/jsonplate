const jsonplate = require('../index')
const data = {
  status: 200,
  body: 'content',
  error: 'test',
  code: 404,
  numbers: [1, 3, 6, 7],
}

test('_if match', () => {
  let template = {
    _if: {
      status: 200,
      _then: {
        status: 'ok',
      },
    },
  }
  expect(jsonplate(template, data)).toEqual({ status: 'ok' })

  template = {
    _if: {
      code: {
        _gt: 400,
      },
      _then: {
        status: 'err',
      },
    },
  }
  expect(jsonplate(template, data)).toEqual({ status: 'err' })

  template = {
    _if: {
      code: {
        _gt: 500,
      },
      _then: {
        status: 'err',
      },
      _else: {
        text: 'body',
      },
    },
  }
  expect(jsonplate(template, data)).toEqual({ text: 'content' })
})

test('_if nested', () => {
  let template = {
    _if: {
      status: 200,
      _then: {
        status: 'ok',
        _if: {
          code: 500,
          _else: { res: 'nested else' },
        },
      },
    },
  }
  expect(jsonplate(template, data)).toEqual({
    res: 'nested else',
    status: 'ok',
  })
})
