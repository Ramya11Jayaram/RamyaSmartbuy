import { Distribution } from './Distribution';

export class ItemDetails {
    constructor(
        public porHeaderId: number,
        public line: number,
        public material: String,
        public description: String,
        public vendorMaterialNo: String,
        public qty: number,
        public uom: String,
        public deliveryDate: Date,
        public unitCost: number,
        public priceUnit: number,
        public orderCurrency: number,
        public totalCost: number,
        public totalCostUsd: number,
        public additionalText: String,
        public distributionBasis: number,
        public distribution: Distribution[],
        public glAccountMasterId?: number,
        public costCenterId?: number,
        public assetClass?: number,
        public assetNumber?: number,
        public ioNumber?: number,
        public profitCenter?: number,) { }
    static adapt(itItemDetailsem: any): ItemDetails {
        return new ItemDetails(
            itItemDetailsem.porHeaderId,
            itItemDetailsem.line,
            itItemDetailsem.material,
            itItemDetailsem.description,
            itItemDetailsem.vendorMaterialNo,
            itItemDetailsem.qty,
            itItemDetailsem.uom,
            new Date(itItemDetailsem.deliveryDate),
            itItemDetailsem.unitCost,
            itItemDetailsem.priceUnit,
            itItemDetailsem.orderCurrency,
            itItemDetailsem.totalCost,
            itItemDetailsem.totalCostUsd,
            itItemDetailsem.additionalText,
            itItemDetailsem.distributionBasis,
            itItemDetailsem.distribution

        );
    }


}
