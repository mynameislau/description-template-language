const { buildAst, addParentheses } = require('./pre-process');

const ex = `
shallow:
  medium:
    profound:
      data1
      blip blop
  other:
    data2`;

const ast = [
  {
    name: 'shallow',
    type: 'node',
    data: [
      {
        name: 'medium',
        type: 'node',
        data: [
          {
            name: 'profound',
            type: 'end',
            data: `data1\nblip blop`
          }
        ]
      },
      {
        name: 'other',
        type: 'end',
        data: 'data2'
      }
    ]
  }
];

const parenthesesResults = `shallow{medium{profound{data1\nblip blop}}other{data2}}`;

test('parse stuff', () => {
  expect(buildAst(ex)).toEqual(ast);
  expect(addParentheses(buildAst(ex))).toEqual(parenthesesResults);
});
