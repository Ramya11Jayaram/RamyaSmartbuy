import { ItemDetails } from './ItemDetails';

import { Watchers } from './Watchers';

export class Podetails {
    [x: string]: any;
    constructor(
        public id: number,
        public orderType: number,
        public orderDate: Date,
        public createdBy: String,
        public purchaseCategory: number,
        public cost:number,
        public status:number,
        public company: String,
        public porType: number,
        public requester: String,
        public costCenter: number,
        public vendor: number,
        public orderCurrency: number,
        public contractEndDate: Date,
        public contractStartDate: Date,
        public email: String,
        public fax: String,
        public costObjectAssetClass: number,
        public costObjectAssetNumber: number,
        public costObjectCostCenter: number,
        public costObjectGlAccount: String,
        public costObjectInternalOrder: number,
        public comments: String,
        public specialInstructions: String,
        public vendorDetails: String,//
        public referenceNumber: number,
        public quotationNumber: number,
        public itemDetails: ItemDetails[],
        public fileUpload: File,
        public appr1: number,
        public appr2: number,
        public commsredio: number,//
        ) { }
    static adapt(item: any): Podetails {
        return new Podetails(
            item.id,
            item.orderType,
            item.orderDate,
            item.createdBy,
            item.purchaseCategory,
            item.cost,
            item.status,
            item.company,
            item.porType,
            item.requester,
            item.costCenter,
            item.vendor,
            item.orderCurrency,
            item.contractEndDate,
            item.contractStartDate,
            item.email,
            item.fax,
            item.costObjectAssetClass,
            item.costObjectAssetNumber,
            item.costObjectCostCenter,
            item.costObjectGlAccount,
            item.costObjectInternalOrder,
            item.comments,
            item.specialInstructions,
            item.vendorDetails,//
            item.referenceNumber,
            item.quotationNumber,
            item.itemDetails,
            item.fileUpload,
            item.appr1,
            item.appr2,
            item.commsredio

        );
    }
}




