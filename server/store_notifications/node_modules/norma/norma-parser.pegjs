
{
  var slotstack = []
}
start
  = ws? forceobj:'{'? ws? slot (sep? slot)* sep? '}'? ws? { 
    slotstack.object = !!forceobj
    return slotstack 
  }

ws
  = [ \t\r\n]

sep
  = ws? ','? ws?

slot
  = n:name? t:type m:mod? { slotstack.push({name:n, type:t, mod:m}) }


name
 = h:[a-zA-Z] t:[a-zA-Z0-9]* ':' { return h+t.join('') } 

mod
  = '?' {return '?' }
  / '*' {return '*' }
  / '+' {return '+' }

type
  = t:(typeatom ('|' typeatom)*) { return {mark:t[0],or:t[1]} }

typeatom
  = any       { return '.' }
  / string    { return 's' }
  / integer   { return 'i' }
  / nan       { return 'A' }
  / infinity  { return 'Y' }
  / number    { return 'n' }
  / boolean   { return 'b' }
  / function  { return 'f' }
  / array     { return 'a' }
  / regexp    { return 'r' }
  / date      { return 'd' }
  / arguments { return 'g' }
  / error     { return 'e' }
  / null      { return 'N' }
  / undefined { return 'U' }
  / object    { return 'o' }
  / badtype   

any
  = '.'

string
  = 's'

integer
  = 'i'

nan
  = 'A'

infinity
  = 'Y'

number
  = 'n'

boolean
  = 'b'

function
  = 'f'

array
  = 'a'

regexp
  = 'r'

date
  = 'd'

arguments
  = 'g'

error
  = 'e'

null
  = 'N'

undefined
  = 'U'

object
  = 'o'

badtype
  = t:[^}] { error('not a type character: "'+t+'"') }
