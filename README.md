# Avolang or Avocado Language
Avocado language is currently a "toy langauge" its mainly for learning how compilers work. however i would like to get this to a stable release for use in custom game engines written in Typescript or Javascript. In the future i would love to compile this to C++ or C however i don't have the attention span to do that.
## Setup
Typescript Compiler:
```bash
cd typescript_compiler
npm i
npm run test
npm run unit_tests
```
## Design
I want the langauge to be human readable while also being easy for an interpereter to understand. It looks alot like Typescript with a few differences.

### Variables
Avolang:
```
var:char char_example  'l';
var:int int_example = 10;
```
Typescript:
```
let char_example : string = "l";
let int_example : number = 10;
```
as you can see Avolang has stricter types
### Functions
Avolang:
```
func<void> print_AHHHH()
{
    out.print("AHHHH");
}
```
Typescript:
```
function print_AHHHH() : void
{
    console.log("AHHHH");
}
```
### 