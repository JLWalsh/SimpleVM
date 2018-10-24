class Registers {

    private readonly registers: number[];

    private zRegister: number;

    public constructor(amount: number) {
        this.registers = new Array<number>(amount);
        this.zRegister = 0;
    }

    public set(name: number, value: number) {
        this.registers[name] = value;
    }

    public get(name: number): number {
        return this.registers[name];
    }

    public setZ(value: number) {
        this.zRegister = value;
    }

    public getZ(): number {
        return this.zRegister;
    }

    public clearAll() {
        for(let i = 0; i < this.registers.length; i++) {
            this.registers[i] = 0;
        }
        
        this.zRegister = 0;
    }
}

export default Registers;