import Tokenizer from "./Tokenizer";
import ILogger from "./ILogger";

class Ta implements ILogger {
  
  error(message: string, line?: number): void {
    console.error(`[${line}] ERROR: ${message}`);
  }

}

const t = new Tokenizer(new Ta());

const program = `
  ADD reg1 reg2 reg3 ; fofoeifokwefoefpkewfefw
  ;efewfewfoiwefj
  SUB reg1 reg2 #1993 @10202
  woops # @ ;hahaha
  dsokdsok
  PROMPTI reg1
`;

t.parse(program);