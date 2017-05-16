const R = require('ramda');

const regexResultGroupsToArray = result => {
  return result.splice(1);
};

const execRegexToArray = (regex, str) => {
  const recur = (array) => {
    const result = regex.exec(str);
    if (result) {
      return recur(array.concat([regexResultGroupsToArray(result)]));
    }
    else {
      return array;
    }
  };

  return recur([]);
};

const escapeLineBreaks = str => str.replace(/\n/gm, '[lb]').replace(/\s/gm, '[space]').replace(/^/gm, '[start]').replace(/$/gm, '[end]')

// const stripOneIndentationLevel = str => str.replace(/\n?^( +)(.+)$(?:\n^\1(.+)$\n?)?/gm, (match, p1, p2, p3) => {
const stripOneIndentationLevel = str => {
  // console.log('//////////')
  // console.log('str:', escapeLineBreaks(str))
  // console.log('----------');
  return str.replace(/\n?( *)(.+)$(?:\n?^\1(.+)\n?)?/gm, (match, p1, p2, p3) => {
    // console.log('matches');
    // console.log('p1:', escapeLineBreaks(p1));
    // console.log('p2:', escapeLineBreaks(p2));
    // //console.log('p3:', escapeLineBreaks(p3));
    // console.log('//////////');
    if (p3) {
      return `${p2}\n${p3}`;
    }
    else {
      return p2;
    }
  });
};

const stripLastLinebreaks = str => str.replace(/\n+$/, '');

const cleanBlockContent = R.compose(stripLastLinebreaks, stripOneIndentationLevel);

const isolateLists = str => str.replace(/\+( ?)(.*\n?)( \1[^+]*)*/gm, (match, p1, p2, p3) => {
  if (p3) {
    return `{${p2.replace('\n', '')}${p3.replace(/^  /gm, '')}}`;
  } else {
    return `{${p2.replace('\n', '')}}`;
  }
});

const isolateBlocks = (str) => {
  const regex = /^( *)(.*): ?(.*$\n?(?:(?:^\1 +.*$\n?)|(?:^$\n))*)/gm;
  const resultsArray = execRegexToArray(regex, str);
  // console.log(resultsArray);
  return resultsArray;
};

const buildAst = R.compose(
  R.map(result => {
    const subBlocks = buildAst(result[2]);

    if (subBlocks.length) {
      return {
        name: result[1] ? result[1] : '',
        type: 'node',
        data: subBlocks
      }
    }
    else {
      return {
        name: result[1] ? result[1] : '',
        type: 'end',
        data: R.compose(isolateLists, cleanBlockContent)(result[2])
      }
    }
  }),
  isolateBlocks
);

//console.dir(buildAst(desc), {depth: null});

const addParentheses = R.compose(
  R.join(''),
  R.map(node => {
    switch (node.type) {
      case 'node': return `${node.name}{${addParentheses(node.data)}}`;
      case 'end': return `${node.name}{${node.data}}`;
    }
  })
);

module.exports = {
  buildAst,
  addParentheses
}
