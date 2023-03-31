
# Avolang or Avocado Language

Avocado language is currently a "toy langauge" its mainly for learning how compilers work. It is in its early stages, still being powered by an interpreter. I have a long way to go before a v1.0.0 before that I need to implement several features.

## Contributing

This is a personal project so no pull requests will be accepted.

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

  

## TODO

- [x] scopes ```{}```

- [x] conditionals ```?> a b``` (greater than)

- [x] if ```if cond {}```

- [x] else ```else {}```

- [ ] else if ```elif {}```

- [x] conditional revamp ```a > b``` ```!(a > b)``` 50% done (need unary operators to work)

- [ ] while loops ```while(cond) {}```

- [ ] break ```break;```

- [ ] loops ```loop {}```

- [ ] functions ```func:type name(param) {}```

- [ ] compiler

  

### Variables

Avolang:

```

var:char char_example = 'l';

var:int int_example = 10;

```

Typescript:

```ts

let  char_example : string = "l";

let  int_example : number = 10;

```

as you can see Avolang has stricter types

### Functions

Avolang:

```

func:void print_AHHHH()

{

out.print("AHHHH");

}

```

Typescript:

```ts

function  print_AHHHH() : void

{

console.log("AHHHH");

}

```


