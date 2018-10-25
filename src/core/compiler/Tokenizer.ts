import Token, { TokenValue } from "./Token";
import ILogger from './ILogger';
import StatementType from "./StatementType";
import Tokens from "./Tokens";
import Char from "./Char";
import Word from "./Word";

class Tokenizer {

  private readonly logger: ILogger;

  private position: number;
  private lastParseStart: number;
  private line: number;
  private tokens: Token[];
  private recoveringFromError: boolean;

  private code: string;

  public constructor(logger: ILogger) {
    this.logger = logger;
  }

  public parse(code: string): Token[] {
    this.resetState(code);

    while(!this.isAtEnd()) {
      this.lastParseStart = this.position;

      const currentChar = this.advance();

      switch(currentChar) {
        case Tokens.SEMICOLON: this.skipComment(); break;
        case Tokens.HASH: this.parseImmediate(); break;
        case Tokens.AT: this.parseAddress(); break;
        case Tokens.NEWLINE: this.line++; break;
        case Tokens.WHITESPACE: break;
        default: this.parseText(); break;      
      }
    }

    return this.tokens;
  }

  private parseText() {
    while ((Char.isAlpha(this.peek()) || Char.isNumeric(this.peek())) && !this.isAtEnd())
      this.advance();

    if (this.match(Tokens.COLON)) {
      const label = this.code.substring(this.lastParseStart, this.position - 1);
      this.addTokenWithValue(StatementType.JUMPLABEL, label);
      
      return;
    }

    if (!Char.isAlpha(this.peek())) {
      const text = this.code.substring(this.lastParseStart, this.position);

      if (Word.isRegister(text)) {
        const register = Number(text.substring(3));
        this.addTokenWithValue(StatementType.REGISTER, register);
      } else if(Word.isOpcode(text)) {
        this.addTokenWithValue(StatementType.OPCODE, text);
      } else {
        this.error(`Unrecognized statement: ${this.code[this.position]}`);
      }

      return;
    }

    this.error(`Unrecognized statement: ${this.code[this.position]}`);
  }

  private parseAddress() {
    if(this.recoveringFromError)
      return;

    while (Char.isNumeric(this.peek()) && !this.isAtEnd())
      this.advance();

    const hasValueAfterAtSign = this.lastParseStart == this.position - 1;
    if (hasValueAfterAtSign) {
      this.error("Expected address after @.");
      
      return;
    }

    const literal = this.code.substring(this.lastParseStart + 1, this.position);
    const address = Number(literal);

    this.addTokenWithValue(StatementType.ADDRESS, address);
  }

  private parseImmediate() {
    if (this.recoveringFromError)
      return;

    while (Char.isNumeric(this.peek()) && !this.isAtEnd())
      this.advance();

    const hasValueAfterHashSign = this.lastParseStart == this.position - 1;
    if (hasValueAfterHashSign) {
      this.error("Expected immediate value after #.");

      return;
    }

    const literal = this.code.substring(this.lastParseStart + 1, this.position);
    const immediate = Number(literal);

    this.addTokenWithValue(StatementType.IMMEDIATE, immediate);
  }

  private skipComment() {
    while (this.peek() != Tokens.NEWLINE && !this.isAtEnd())
      this.advance();
  }

  private addTokenWithValue(type: StatementType, value: TokenValue) {
    const literal = this.code.substring(this.lastParseStart, this.position);
    
    this.tokens.push(new Token({ type, value, line: this.line, literal }))
  }

  private advance(): string {
    if(this.isAtEnd())
      return;

      return this.code[this.position++];
  }

  private match(char: string): boolean {
    const match = this.peek() == char;

    if (match)
      this.advance();

    return match; 
  }

  private peek = ():string => this.code[this.position]; 
  private isAtEnd = (): boolean => this.position >= this.code.length;

  private error(message: string) {
    this.recoveringFromError = true;

    this.logger.error(message, this.line);
  }

  private resetState(code: string) {
    this.position = 0;
    this.lastParseStart = 0;
    this.line = 0;
    this.tokens = [];
    this.code = code;
    this.recoveringFromError = false;
  }
}

export default Tokenizer;