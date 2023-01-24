// All avo standard functions

import { FunctionBuilder } from "./FunctionCallHandler.js";
import { Scope } from "./Interpreter.js";
import { readFile } from "fs/promises"
let { version } = JSON.parse(await readFile("package.json", {encoding : "utf-8"}))

let StandardScope: Scope = {
    Functions: {
        "avo.version": FunctionBuilder(
            (a: any) =>
            {
                return version
            },
            0,
            "String"
        ),
        "io.println": FunctionBuilder(
            (a: any) =>
            {
                process.stdout.write(JSON.stringify(a) + "\n")
            },
            1,
            "Void"
        ),
        "io.print": FunctionBuilder(
            (a : any) =>
            {
                process.stdout.write(JSON.stringify(a[0]))
            },
            1,
            "Void"
        ),
        "rand.randint": FunctionBuilder(
            (a : number) => {
                return Math.floor(Math.random() * (a + 1));
            },
            1,
            "Int"
        )
    },
    Variables: {
        "avo.engine":
        {
            "type" : "String",
            "value" : "Typescript"
        }
    }
}

export default StandardScope;