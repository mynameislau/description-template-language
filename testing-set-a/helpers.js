module.exports = {
  id: val => val,
  times10: val => val * 10,
  simpleFunc: val => val > 10,
  otherFunc: val => `${val}-yep-`,
  funcfunc: (propName, context) => context.subProp[propName]
};
