import StatementType from "./StatementType";

export type TokenValue = string | number;

class Token {

  public readonly type: StatementType;
  public readonly line: number;
  public readonly value: TokenValue;
  public readonly literal: string;

  public constructor({ type, line, value, literal }: { type: StatementType, line: number, value: TokenValue, literal: string }) {
    this.type = type;
    this.line = line;
    this.value = value;
    this.literal = literal;
  }
}

export default Token;