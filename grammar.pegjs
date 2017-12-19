{
  const debug = false;
  const R = require('ramda');
  // const path = require('path');
  const { getInfixFunction } = this.helpers; // higher context

  const log = (...args) => {
    if (debug) {
      console.log(args);
    }
  }

  const invertRecur = (operator, left, right) => {
    log('inverting', operator, left, right);
    const rightInfix = right.type === 'infix';
    if (rightInfix) {
      return { type: 'infix', operator: right.operator, left: invertRecur(operator, left, right.left), right: right.right };
    }
    else {
      return { type: 'infix', operator, left, right }
    }
  }
}

start
  = partialSet

partialSet
  = content:partial+ { return content.filter(entry => entry) }

partial = name:name _* "{" data:blockContent "}" { return ({ name, type: 'partial', data }) }

set
  = content:block+ { return content.filter(entry => entry) }

block
  = selector:selector " "* "{" data:blockContent "}" { log('new block'); return ({ selector, type: Array.isArray(data) ? 'condition' :  'end', data }) }

blockContent
	= set
    / contentList

selector
  = exp:expressionSet { log('selector', exp); return exp; }
  / "*" { return { type: 'universal' } }

/* // todo priority ?
  selector = prio:(priority)? selectorCondition { }

  selectorCondition
    = expressionSet
    / "*" { return { type: 'universal' } }

  priority = "#" n:number " " { return n }
*/

expressionSet
  = infix
  / parenthesized
  / func // order is important here - infix prevails
  / prop:expression

infix
  = left:infixLeft " " op:infixOperator " " right:expressionSet & {
    log('testing infix', options); 
    return true;
    } {
    log('yes, inverting');
    return invertRecur(op, left, right)
  }

parenthesized
  = "(" exp:expressionSet ")" { log('parenthesized', exp); return exp }

infixLeft
  = parenthesized
  / expression

infixOperator
  = operator:([^ @{}\(\)|[\]]+) &{ log('infix :', operator.join(''), getInfixFunction(operator.join(''))); return getInfixFunction(operator.join('')) } { return operator.join('') }

func = name:functionName args:(_ expression)+ { return { type: 'func', name, args: args.map(arg => arg[1]) } }

expression
  = boo:boolean { return boo }//order is important
  / head:name tail:("." name)* { return { type: 'property', data: [head, ...R.flatten(tail.map(val => val[1].data))] } }
  / num:number { return { type: 'number', data: num } }
  / str:string { return { type: 'string', data: str } }

// content stuff

contentList
  = contentList:("{" ct:content "}" { return ct })+ { return contentList }//order is important
  / ct:content { return [ct] }

content
  = content:((simpleWord / partialLink / bracketed))* { log('new content', content); return content }

simpleWord = data:([^@_{}|[\]]+) { log('simple', data.join('')); return { type: 'text' , data: data.join('') } }
partialLink = ("@"/"_") data:name { return { type: 'partialLink', data } }
bracketed = "[" bc:bracketedContent "]" { log('bracketed'); return bc }
bracketedContent
  = conditionContent:expressionSet " "? op:("? "/"?! ") ifContent:contentList elseContent:("| " elseContent:contentList { return elseContent }) ? { return { type: 'condition', negated: op === '?!', conditionContent, ifContent, elseContent} }
  / fn:func // order is important here

// end content stuff

functionName = name

string = '\'' str:[^']+ '\'' { return str.join('') }

boolean
  = "true" { return { type: 'boolean', data: true } }
  / "false" { return { type: 'boolean', data: false } }

name = name:([_a-zA-Z]+ [_a-zA-Z0-9]*) { return R.join('', R.flatten(name)) }

number = nb:([0-9]+ "."? [0-9]*) { return Number(R.join('', R.flatten(nb))) }

_ = " " { return null; }


text
  = txt:([^{}|]+) { return txt.join('') }
