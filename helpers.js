const infixFunction = (operator) => {
  switch (operator) {
    case '&': return (left, right) => left && right;
    case '<': return (left, right) => left < right;
    case '>': return (left, right) => left > right;
    case '>=': return (left, right) => left >= right;
    case '<=': return (left, right) => left <= right;
    case '!=': return (left, right) => left !== right;
    case '=': return (left, right) => left === right;
  }
}

module.exports = {
  infixFunction,
  simpleFunc: val => val > 10,
  otherFunc: val => val + '-yep-',
  funcfunc: (propName, context) => context.subProp[propName]
}
