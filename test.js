const fs = require('fs');
const desc = fs.readFileSync('./main.desc').toString();
const { evaluateTemplate, compileTemplate } = require('./descriptor');
const helpers = require('./helpers');

const rand = (min, max) => min + Math.random() * (max - min);

const sampleContext = {
  color: 'red',
  size: 50,
  subProp: {
    toto: 10,
    tutu: 90
  }
};

test('it works', () =>
  expect(evaluateTemplate(compileTemplate(desc, helpers), {
    context: sampleContext,
    helpers
  })).toBe('nope')
);
