const fs = require('fs');
const desc = fs.readFileSync('./testing-set-a/main.desc').toString();
const { evaluateTemplate, compileTemplate } = require('./descriptor');
const helpers = require('./testing-set-a/helpers');
const R = require('ramda');

const venusaur = {
  name: 'venusaur',
  color: 'green',
  warty_skin: true,
  red_eyes: true,
  type: [
    'grass',
    'poison'
  ],
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
};

test('partial link with arobase', () =>
  expect(evaluateTemplate(compileTemplate(`
root:
  *: @tutu
tutu:
 *: bla`))).toBe('bla'));

test('partial link with underscore', () =>
  expect(evaluateTemplate(compileTemplate(`
root:
  *: _tutu
tutu:
 *: bla`))).toBe('bla'));

test('inline condition via brackets and question mark', () =>
  expect(evaluateTemplate(
    compileTemplate(`
root:
  *: [bla ? bli]
  `),
    { context: { bla: true } }
  )).toBe('bli'));

test('inline condition with else clause', () =>
  expect(evaluateTemplate(
    compileTemplate(`
root:
  *: [bla ? bli | blo]
  `),
    { context: { bla: false } }
  )).toBe('blo'));

test('can output multiple possibilities', () =>
  expect(evaluateTemplate(compileTemplate(`
root:
  *:
    + toto
    + tutu
    `))).toMatch(/toto|tutu/));

test('can use functions in selector', () =>
  expect(evaluateTemplate(compileTemplate(`
root:
  (times10 10) > 5: toto
  *: nope
`), { context: {}, helpers: helpers })).toBe('toto'));

test('it works overall', () => {
  const result = evaluateTemplate(compileTemplate(desc, helpers), {
    context: venusaur,
    helpers: helpers
  });
  console.log(result);
  expect(result).toBeTruthy();
});
