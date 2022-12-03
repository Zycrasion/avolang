import { Parser } from "../src/Parser.js";
import { Tokeniser } from "../src/Tokeniser_old.js";

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
    // 1 - 2 * 3
    // or in reverse polish notation
    // - 1 * 2 3
    let token = new Tokeniser(`
    var:int a = 2 * 1-2*3;
    `);
    let tokens = token.read();
    console.log(tokens.map(v => v.value).join(" "));
    console.log(token.convert_to_pn(tokens).map(v => v.value).join(" "))
    // let tree = new Parser(tokens);
    // let nodes = tree.read();
    // console.log(JSON.stringify(nodes, (key, value) => value == null ? undefined : value));
}

main();