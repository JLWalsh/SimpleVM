import Char from "./Char";
import Opcodes from "../common/Opcodes";

class Word {

  static isRegister(word: string): boolean {
    if (!word.startsWith('reg'))
      return false;

    const rest = word.substring(3);
    const hasNonNumerics = rest.split('').filter(Char.isNumeric).length > 0;

    return hasNonNumerics;
  }

  static isOpcode(word: string): boolean {
    const opcodeKeys = Object.keys(Opcodes);

    return opcodeKeys.includes(opcodeKeys);
  }
}

export default Word;