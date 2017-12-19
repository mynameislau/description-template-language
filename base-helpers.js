const R = require('ramda');
const M = require('ramda-fantasy').Maybe;
const {
  Just,
  Nothing,
  toMaybe,
  maybe,
  map,
  chain,
  getOrElse
} = M;

const infixFunctions = [
  {
    name: '&',
    func: (left, right) => left && right
  },
  {
    name: '<',
    func: (left, right) => left < right
  },
  {
    name: '>',
    func: (left, right) => left > right
  },
  {
    name: '>=',
    func: (left, right) => left >= right
  },
  {
    name: '<=',
    func: (left, right) => left <= right
  },
  {
    name: '!=',
    func: (left, right) => left !== right
  },
  {
    name: '=',
    func: (left, right) => left === right
  },
  {
    name: 'has',
    func: (left, right) => left.includes(right)
  }
];

const trace = value => {
  console.log('tracing: ', value);
  return value;
};

module.exports = {
  infixFunctions: infixFunctions,
  getInfixFunction: operator =>
    R.compose(
      R.map(R.prop('func')),
      toMaybe,
      R.find(R.compose(R.equals(operator), R.prop('name')))
    )(infixFunctions).getOrElse(null)
};
