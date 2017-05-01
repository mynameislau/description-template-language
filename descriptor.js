const { evaluateTemplate } = require('./post-process');
const { addParentheses, buildAst } = require('./pre-process');
const peg = require('pegjs');

const nodeContext = typeof window === 'undefined';
const parser = require('./grammar.js');

const compileTemplate = (templateFile, helpers) => {

  const preprocessed = addParentheses(buildAst(templateFile));
  parser.helpers = helpers;

  //console.log(preprocessed);

  let compiled;
  try {
    compiled = parser.parse(preprocessed);
  }
  catch (error) {
    // console.error(chalk.red('/////////// error ///////////////\n\n'));
    //
    // if (error.location) {
    //   const start = preprocessed.substring(0, error.location.start.offset);
    //   const faultyPart = preprocessed.substring(error.location.start.offset, error.location.end.offset);
    //   const end = preprocessed.substr(error.location.end.offset);
    //   console.log(start + chalk.red(faultyPart) + end);
    //   console.log('\n\n');
    // }
    console.error('location:', error.location);
    console.error('expected:', error.expected);
    console.error('found:', error.found);
    console.error('message:', error.message);
  }

  return compiled;
}

module.exports = {
  compileTemplate,
  evaluateTemplate
}
