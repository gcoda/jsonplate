const siftOps = {
  // 'lessThan' : '$lt',
  _all: '$all',
  _and: '$and',
  _elemMatch: '$elemMatch',
  _eq: '$eq',
  _exists: '$exists',
  _gt: '$gt',
  _gte: '$gte',
  _in: '$in',
  _lt: '$lt',
  _lte: '$lte',
  _mod: '$mod',
  _ne: '$ne',
  _nin: '$nin',
  _nor: '$nor',
  _not: '$not',
  _or: '$or',
  _regex: '$regex',
  _regexOptions: '$options',
  $regexOptions: '$options',
  _size: '$size',
  _type: '$type',
  // $where: "this.name === 'frank'"
  // _where: "$where",
  _where: "DISABLED",
  $where: "DISABLED",
}

const maybeFilterName = str => siftOps[str] || str.replace(/__/g, '.')

const formatFilters = obj => {
  if (typeof obj === 'object') {
    if (Array.isArray(obj)) {
      return obj.map(formatFilters)
    } else {
      return Object.entries(obj).reduce(
        (result, el) => ({
          ...result,
          [maybeFilterName(el[0])]: formatFilters(el[1]),
        }),
        {}
      )
    }
  }
  return obj
}

const objectType = obj => {
  return typeof obj === 'object'
    ? Array.isArray(obj)
      ? 'array'
      : 'object'
    : typeof obj
}

const pick = (path = 'path.key', data = { path: { key: true } }) =>
  path.split('.').reduce((object, key, index, pathArray) => {
    return (
      object &&
      (key === 'length' && pathArray.length - 1 === index
        ? object.length
        : object[key])
    )
  }, data)

// const mergeData = (args = {}) =>
//   Object.entries(args).reduce((data, entry) => {
//     if (entry[0][0] === '_' && objectType(entry[1]) === 'object')
//       return {
//         ...data,
//         ...entry[1],
//         [entry[0]]: entry[1],
//       }
//     else
//       return {
//         ...data,
//         [entry[0]]: entry[1],
//       }
//   }, {})

module.exports = {
  // mergeData,
  formatFilters,
  objectType,
  pick,
}
