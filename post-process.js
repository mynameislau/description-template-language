const R = require('ramda');
// const { infixFunction, helpers } = require('./helpers');

const evaluate = R.curry((data, expressionAST) => {
  return evaluationFunctions[expressionAST.type](expressionAST, data);
});

const evaluateFunction = (functionAST, data) => {
  const evaluatedParams = R.map(evaluate(data), functionAST.args);
  return data.helpers[functionAST.name].call(undefined, ...evaluatedParams, data.context);
};

const evaluationFunctions = {
  infix: (infixAST, data) =>
    data.helpers.infixFunction(infixAST.operator)(evaluate(data, infixAST.left), evaluate(data, infixAST.right)),

  func: evaluateFunction,
  property: (propertyAST, data) => R.path(propertyAST.data, data.context),
  number: (propertyAST, data) => propertyAST.data,
  string: (propertyAST, data) => propertyAST.data,
  universal: () => true
};

const partials = R.reduce((acc, partialAST) =>
  R.assoc(partialAST.name, partialConditions(partialAST.data), acc),
{});

const partialConditions = R.map(conditionAST => data => {
    if (evaluate(data, conditionAST.selector)) {
      return conditionAST.data;
    }
    else {
      return null;
    }
  }
);

const contentFunctions = {
  partialLink: (partialsList, contentChunkAST, data) => bestResultForPartial(data, partialsList)(contentChunkAST.data),
  text:  (partialsList, contentChunkAST, data) => contentChunkAST.data,
  func:  (partialsList, contentChunkAST, data) => evaluateFunction(contentChunkAST, data),
  condition: (partialsList, {conditionContent, ifContent, elseContent}, data) => {
    const conditionOK = evaluate(data, conditionContent);
    if (conditionOK) {
      return buildContent(data, partialsList)(ifContent);
    }
    else {
      if (elseContent) {
        return buildContent(data, partialsList)(elseContent);
      }
      else {
        return '';
      }
    }
  }
}

const buildContent = (data, partialsList) => R.compose(
  R.join(''),
  R.map(R.compose(
    buildContentChunk(data, partialsList),
    trace
  ))
);

const trace = val => {
  console.log(val);
  return val;
}

const buildContentChunk = R.curry((data, partialsList, contentChunkAST) =>
  contentFunctions[contentChunkAST.type](partialsList, contentChunkAST, data));

const bestResultForPartial = (data, partialsList) => R.compose(
  R.ifElse(R.isNil, () => '[!error!]', buildContent(data, partialsList)),
  R.head,
  R.filter(result => !R.isNil(result)),
  R.map(conditionFunction => conditionFunction(data)),
  R.flip(R.prop)(partialsList)
);

const evaluateTemplate = (ast, data) => {
  const partialsList = partials(ast)

  return bestResultForPartial(data, partialsList)('root');
};

module.exports = {
  evaluateTemplate
};
