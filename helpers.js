const infixFunction = (operator) => {
  switch (operator) {
    case '&': return (left, right) => left && right;
    case '<': return (left, right) => left < right;
    case '>': return (left, right) => left > right;
    case '>=': return (left, right) => left >= right;
    case '<=': return (left, right) => left <= right;
    case '!=': return (left, right) => left !== right;
    case '=': return (left, right) => left === right;
    case 'has': return (left, right) => left.includes(right);
  }
}

module.exports = {
  infixFunction,
  id: val => val,
  simpleFunc: val => val > 10,
  otherFunc: val => val + '-yep-',
  funcfunc: (propName, context) => context.subProp[propName]
}
