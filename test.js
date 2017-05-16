const fs = require('fs');
const desc = fs.readFileSync('./main.desc').toString();
const { evaluateTemplate, compileTemplate } = require('./descriptor');
const helpers = require('./helpers');

const venusaur = {
  name: 'venusaur',
  color: 'green',
  warty_skin: true,
  red_eyes: true,
  type: ['grass', 'poison'],
  back: {
    appendage: 'flower'
  },
  height: 2,
  weight: 100
};

const charmander = {
  name: 'charmander',
  color: 'orange',
  scaly_skin: true,
  blue_eyes: true,
  type: ['fire'],
  firy_tail: true,
  height: 0.6,
  weight: 8.5
}

test('it works', () =>
  expect(evaluateTemplate(compileTemplate(desc, helpers), {
    context: venusaur,
    helpers
  })).toBe('nope')
);
