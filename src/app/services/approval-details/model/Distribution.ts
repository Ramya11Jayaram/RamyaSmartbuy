export class Distribution {
  qty: number;
  percentage: number;
  glAccount: string;
  costCenter: string;
    constructor(qty: number,
        percentage: number,
        costCenter: String,
        glAccount: String) { }
    static adapt(dis: any): Distribution {
        return new Distribution(
            dis.qty,
            dis.percentage,
            dis.glAccount,
            dis.costCenter
        );
    }



}
