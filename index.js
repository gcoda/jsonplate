const { default: sift } = require('sift')
const { formatFilters, objectType, pick } = require('./utils')

const detect = template => {
  const curlyRegExp = /\{([_a-zA-Z0-9\[\]\$\.]+?(\}?)+)\}/g
  const curlies = Array.from(template.matchAll(curlyRegExp)).map(
    ([match, path, ...rest]) => ({ match, path })
  )
  return curlies
}

const canBePath = path => {
  return path.indexOf(' ') === -1 && path.indexOf('{') === -1
}
const renderStringValue = (template, data, tryShort) => {
  if (tryShort && canBePath(template)) {
    const value = pick(template, data)
    if (value !== undefined) return value
  }

  const tokens = detect(template)
  let result = template
  for (let { match, path } of tokens) {
    const value = pick(path, data)
    if (value !== undefined) result = result.replace(match, value)
  }
  return result
}

const renderEach = ({ _each, ...obj }, data) => {
  const path = typeof _each === 'string' ? _each : _each.source
  const source = Array.isArray(path) ? path : pick(path, data)
  // console.log({source})
  const object = _each.output || obj
  const filters = _each.filter && formatFilters(_each.filter)
  const results =
    Array.isArray(source) &&
    source.map((_item, _key) => ({
      ...(typeof _item === 'object' ? _item : ''),
      _item,
      _key,
      _number: _key + 1,
      _parent: data,
    }))
  if (results) {
    return filters
      ? results
          .filter(sift(filters))
          .map(itemData => transform(object, { ...data, ...itemData }, true))
      : results
          // !
          .map(itemData => transform(object, { ...data, ...itemData }, true))
  }
}
const renderIf = ({ _then, _else, ...filters }, data) => {
  if (sift(formatFilters(filters))(data)) return _then
  else return _else
}
const transform = (obj, data, tryShort = false) => {
  const type = objectType(obj)
  if (type === 'array') {
    return obj.map(element => transform(element, data))
  } else if (type === 'object') {
    const keys = Object.keys(obj)
    if (keys.includes('_each')) {
      return transform(renderEach(obj, data), data)
    }
    return keys.reduce((results, key) => {
      let field = { [key]: transform(obj[key], data, true) }
      if (key === '_if') {
        field = transform(renderIf(obj[key], data), data)
      }
      return {
        ...results,
        ...field,
      }
    }, {})
  } else if (type === 'string') {
    return renderStringValue(obj, data, tryShort)
  } else {
    return obj
  }
}

module.exports = transform
/** */
