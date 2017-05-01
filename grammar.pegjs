{
  const R = require('ramda');
  // const path = require('path');
  console.log('hits', this);
  const { infixFunction } = this.helpers; // higher context

  const invertRecur = (operator, left, right) => {
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
  = selector:selector " "* "{" data:blockContent "}" { return ({ selector, type: Array.isArray(data) ? 'condition' :  'end', data }) }

blockContent
	= set
    / content

selector
  = expressionSet
  / "*" { return { type: 'universal' } }

/* // todo priority ?
  selector = prio:(priority)? selectorCondition { }

  selectorCondition
    = expressionSet
    / "*" { return { type: 'universal' } }

  priority = "#" n:number " " { return n }
*/

expressionSet
  = parenthesized
  / infix
  / func // order is important here - infix prevails
  / prop:expression

infix
  = left:infixLeft " " op:infixOperator " " right:expressionSet { return invertRecur(op, left, right)}

parenthesized
  = "(" exp:expressionSet ")" { return exp }

infixLeft
  = func // order is important here
  / expression

infixOperator
  = operator:([^ ]+) &{ return infixFunction(operator.join('')) } { return operator.join('') }

func = name:functionName args:(_ expression)+ { return { type: 'func', name, args: args.map(arg => arg[1]) } }

expression
  = head:name tail:("." name)* { return { type: 'property', data: [head, ...R.flatten(tail.map(val => val[1].data))] } }
  / num:number { return { type: 'number', data: num } }
  / str:string { return { type: 'string', data: str } }

// content stuff

content = ((simpleWord / partialLink / bracketed))*
simpleWord = data:([^@{}[\]]+) { return { type: 'text' , data: data.join('') } }
partialLink = "@" data:name { return { type: 'partialLink', data } }
bracketed = "[" bc:bracketedContent "]" {  return bc }
bracketedContent
  = conditionContent:expression " "? "?" ifContent:content elseContent:(" | " elseContent:content { return elseContent }) ? { return { type: 'condition', conditionContent, ifContent, elseContent} }
  / fn:func // order is important here

// end content stuff

functionName = name

string = '\'' str:[^']+ '\'' { return str.join('') }

name = name:([_a-zA-Z]+ [_a-zA-Z0-9]*) { return R.join('', R.flatten(name)) }

number = nb:([0-9]+ "."? [0-9]*) { return Number(R.join('', R.flatten(nb))) }

_ = " " { return null; }


text
  = txt:([^{}|]+) { return txt.join('') }
