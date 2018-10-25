class Char {

  static isNumeric = (char: string): boolean => char <= '9' && char >= '0';
  
  static isAlpha = (char: string): boolean => (char >= 'a' && char <= 'z') || 
                                              (char >= 'A' && char <= 'Z');
}

export default Char;