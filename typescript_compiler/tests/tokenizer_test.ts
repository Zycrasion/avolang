import { Parser } from "../src/Parser.js";
import { Tokeniser } from "../src/Tokeniser.js";

function repeat(times : number, str : string | number) : string
{
    let finalStr : string = ""; 
    for (let index : number = 0; index < times; index++) // loop over for the amount of times times specifies
    {
        finalStr += str.toString(); // add str to final string
    }
    return finalStr; // return it
}


function main()
{
    let token = new Tokeniser(`
    var:int a = 1 - 2 * 3;
    `);
    let tokens = token.read();
    console.log(tokens);

    // let tree = new Parser(tokens);
    // let nodes = tree.read();
    // console.log(JSON.stringify(nodes, (key, value) => value == null ? undefined : value));
}

main();