const R = require('ramda');
const baseHelpers = require('./base-helpers');
// const { infixFunction, helpers } = require('./helpers');

const evaluate = R.curry((data, expressionAST) => {
  return evaluationFunctions[expressionAST.type](expressionAST, data);
});

const evaluateFunction = (functionAST, data) => {
  const evaluatedParams = R.map(evaluate(data), functionAST.args);
  // console.log(data.helpers);
  // console.log(functionAST.name);
  return data.helpers[functionAST.name].call(
    undefined,
    ...evaluatedParams,
    data.context
  );
};

const evaluationFunctions = {
  infix: (infixAST, data) =>
    data.helpers.getInfixFunction(infixAST.operator)(
      evaluate(data, infixAST.left),
      evaluate(data, infixAST.right)
    ),

  func: evaluateFunction,
  property: (propertyAST, data) => R.path(propertyAST.data, data.context),
  number: (propertyAST, data) => propertyAST.data,
  boolean: (propertyAST, data) => propertyAST.data,
  string: (propertyAST, data) => propertyAST.data,
  universal: () => true
};

const partials = R.reduce(
  (acc, partialAST) =>
    R.assoc(partialAST.name, partialConditions(partialAST.data), acc),
  {}
);

const partialConditions = R.map(conditionAST => data => {
  if (evaluate(data, conditionAST.selector)) {
    return conditionAST.data;
  }
  return null;
});

const contentFunctions = {
  partialLink: (partialsList, contentChunkAST, data) =>
    bestResultForPartial(data, partialsList)(contentChunkAST.data),
  text: (partialsList, contentChunkAST, data) => contentChunkAST.data,
  func: (partialsList, contentChunkAST, data) =>
    evaluateFunction(contentChunkAST, data),
  condition: (
    partialsList,
    { negated, conditionContent, ifContent, elseContent },
    data
  ) => {
    const conditionOK = negated ?
      !evaluate(data, conditionContent)
      : evaluate(data, conditionContent);

    if (conditionOK) {
      return buildContent(data, partialsList)(ifContent);
    }
    if (elseContent) {
      return buildContent(data, partialsList)(elseContent);
    }
    return '';
  }
};

const rand = (min, max) => min + Math.random() * (max - min);
const roundRand = R.compose(Math.round, rand);
const buildContent = (data, partialsList) =>
  R.compose(R.join(''), R.map(buildContentChunk(data, partialsList)), list =>
    R.nth(roundRand(0, list.length - 1), list));

const trace = val => {
  console.log(val);
  return val;
};

const buildContentChunk = R.curry((data, partialsList, contentChunkAST) =>
  contentFunctions[contentChunkAST.type](partialsList, contentChunkAST, data));

const bestResultForPartial = (data, partialsList) =>
  R.compose(
    R.ifElse(R.isNil, () => '[!error!]', buildContent(data, partialsList)),
    R.head,
    R.filter(result => !R.isNil(result)),
    R.map(conditionFunction => conditionFunction(data)),
    R.flip(R.prop)(partialsList)
  );

const evaluateTemplate = (ast, pData = {}) => {
  const data = {
    context: pData.context || {},
    helpers: Object.assign(baseHelpers, pData.helpers || {})
  };

  // console.log('ast', JSON.stringify(ast));

  const partialsList = partials(ast);

  return bestResultForPartial(data, partialsList)('root');
};

module.exports = {
  evaluateTemplate: evaluateTemplate
};
