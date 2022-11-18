import { Parser } from "../src/Parser.js";
import { Tokeniser } from "../src/Tokeniser.js";
let notFailed = true;
let numFailed = 0;
const __THROW_ERROR_ON_FAIL__ = true;

function test(testName: string, out: string, expect: string)
{
    let text = `${testName} [${out == expect ? "✔" : "✘"}]${out != expect ? `\n\tExpected was ${expect}\n\tGot ${out}` : ""}`;
    console.log(text);
    if (out != expect)
    {
        numFailed++;
        if (__THROW_ERROR_ON_FAIL__) 
        {
            throw new Error(text);
        }
    }
    return out == expect;
}

function quickParse(content: string)
{
    return new Parser(new Tokeniser(content).read()).read()
}

console.log("=".repeat(30), "\nVariable Tests:\n")


{
    // Variable tests
    let charTest = "var:char a = 'l'";
    let stringTest = `var:string a ="ahhh";`;
    let intTest = `var:int i= 10;`;
    let floatTest = `var:float f = 10.5;`;
    let boolTest = `var:bool b = true;`;
    let mathTest = `var:int d = 10 + 10 * 20 + (10 - 1);`

    notFailed = test("Char test", JSON.stringify(quickParse(charTest)), `[{"type":"VariableDeclaration","value":"a","left":{"type":"Type","value":"Char","left":null,"right":null},"right":{"type":"CharLiteral","value":"l","left":null,"right":null}}]`);
    notFailed = test("String test", JSON.stringify(quickParse(stringTest)), `[{"type":"VariableDeclaration","value":"a","left":{"type":"Type","value":"String","left":null,"right":null},"right":{"type":"StringLiteral","value":"ahhh","left":null,"right":null}}]`);
    notFailed = test("Int test", JSON.stringify(quickParse(intTest)), `[{"type":"VariableDeclaration","value":"i","left":{"type":"Type","value":"Int","left":null,"right":null},"right":{"type":"Int","value":10,"left":null,"right":null}}]`);
    notFailed = test("Float test", JSON.stringify(quickParse(floatTest)), `[{"type":"VariableDeclaration","value":"f","left":{"type":"Type","value":"Float","left":null,"right":null},"right":{"type":"Float","value":10.5,"left":null,"right":null}}]`);
    notFailed = test("Bool test", JSON.stringify(quickParse(boolTest)), `[{"type":"VariableDeclaration","value":"b","left":{"type":"Type","value":"Bool","left":null,"right":null},"right":{"type":"Bool","value":true,"left":null,"right":null}}]`);
    console.warn("!WARN! undefined behaviour may present itself with the current method of parsing maths")
    notFailed = test("Math test", JSON.stringify(quickParse(mathTest)), `[{"type":"VariableDeclaration","value":"d","left":{"type":"Type","value":"Int","left":null,"right":null},"right":{"type":"Expression","value":"+","left":{"type":"Int","value":10,"left":null,"right":null},"right":{"type":"Expression","value":"*","left":{"type":"Int","value":10,"left":null,"right":null},"right":{"type":"Expression","value":"+","left":{"type":"Expression","value":"-","left":{"type":"Int","value":1,"left":null,"right":null},"right":{"type":"Int","value":10,"left":null,"right":null}},"right":{"type":"Int","value":20,"left":null,"right":null}}}}}]`);
}

if (!notFailed)
{
    console.log("=".repeat(10), "(VARIABLE TESTS FAILED)", "=".repeat(10));
    throw new Error("TEST FAILED");
} else
{
    console.log("\n", "=".repeat(30), "\nFunction Tests:\n")
}

{
    // Function test
    let charTest = "print('l')";
    let stringTest = `print("ahhh")`;
    let intTest = `print(10)`;
    let floatTest = `print(10.5)`;
    let boolTest = `print(true)`;
    let identifierTest = `print(a)`;
    let mathTest = `print(10 + 10, 2.5 * 2.1)`

    let multiParam = `print(a,true, 10.5, 10, "ahhh", 'l')`

    notFailed = test("Char test", JSON.stringify(quickParse(charTest)), `[{"type":"FunctionCall","value":"print","params":[{"type":"CharLiteral","value":"l","left":null,"right":null}]}]`);
    notFailed = test("String test", JSON.stringify(quickParse(stringTest)), `[{"type":"FunctionCall","value":"print","params":[{"type":"StringLiteral","value":"ahhh","left":null,"right":null}]}]`);
    notFailed = test("Int test", JSON.stringify(quickParse(intTest)), `[{"type":"FunctionCall","value":"print","params":[{"type":"Int","value":10,"left":null,"right":null}]}]`);
    notFailed = test("Float test", JSON.stringify(quickParse(floatTest)), `[{"type":"FunctionCall","value":"print","params":[{"type":"Float","value":10.5,"left":null,"right":null}]}]`);
    notFailed = test("Bool test", JSON.stringify(quickParse(boolTest)), `[{"type":"FunctionCall","value":"print","params":[{"type":"Bool","value":true,"left":null,"right":null}]}]`);
    notFailed = test("Identifier test", JSON.stringify(quickParse(identifierTest)), `[{"type":"FunctionCall","value":"print","params":[{"type":"Identifier","value":"a","left":null,"right":null}]}]`);
    notFailed = test("Multi-Parameter tests", JSON.stringify(quickParse(multiParam)), `[{"type":"FunctionCall","value":"print","params":[{"type":"Identifier","value":"a","left":null,"right":null},{"type":"Bool","value":true,"left":null,"right":null},{"type":"Float","value":10.5,"left":null,"right":null},{"type":"Int","value":10,"left":null,"right":null},{"type":"StringLiteral","value":"ahhh","left":null,"right":null},{"type":"CharLiteral","value":"l","left":null,"right":null}]}]`);
    console.warn("!WARN! Maths isn't fully supported in function calls")
    notFailed = test("Math tests", JSON.stringify(quickParse(mathTest)), `[{"type":"FunctionCall","value":"print","params":[{"type":"Expression","value":"+","left":{"type":"Int","value":10,"left":null,"right":null},"right":{"type":"Int","value":10,"left":null,"right":null}},{"type":"Expression","value":"*","left":{"type":"Float","value":2.5,"left":null,"right":null},"right":{"type":"Float","value":2.1,"left":null,"right":null}}]}]`);

}

if (!notFailed)
{
    console.log("=".repeat(10), "(FUNCTION TESTS FAILED)", "=".repeat(10));
    throw new Error("TEST FAILED");
} else
{
    console.log("\n", "=".repeat(30), "\nFinished Tests!\n")
}