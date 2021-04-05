export class PurchaseOrder{
    private podetails = [
        {
        id:1,
        commsredio:'1',
        orderType: '1',
         orderDate: '1-1-1111',
         createdBy: '1',
         purchaseCategory: '6',
         company: 'Test.',
         porType: '2',
         requester: 'John Appleseed',
         costCenter: '2',
         vendor: '1',
         vendorDetails: 'stuff',
         orderCurrency: '1',
         referenceNumber: '',
         quotationNumber: '',
         contractStartDate: '10-10-2018',
         contractEndDate: '10-11-2018',
         email: 'email@email.com',
         fax: '',//
         costObjectGlAccount: '1',
         costObjectCostCenter: '1',
         costObjectAssetClass: '1',
         costObjectAssetNumber: '1',
         costObjectInternalOrder: '1',
         itemDetails: [
             {
                 line: '1',  
                  material: 'text',
                 description: 'text',
                 vendorMaterialNo: 'text',
                 qty: 100,
                 uom: '1',
                 deliveryDate: '1-1-1111',
                 unitCost: 10,
                 priceUnit: 1,
                 orderCurrency: 1,
                 totalCost: 1,
                 totalCostUsd: 1,
                 additionalText: 'text',
                 distributionBasis: 1,
                 distribution: [
                     {
                         qty: 1,
                         percentage: 100,
                         costCenter: '1',
                         glAccount: '1'
                     }
                 ]
             }
         ],
         comments: 'words',
         specialInstructions: 'words',
         fileUpload: '',
         watchers: [
             {'id': 3}
         ],
         appr1: 1,
         appr2: 2
        },
    ];
    
    getPodetails() {
        return this.podetails;
    }
    getPodetails1(id:number){
     const  po=this.podetails.find(
         (s)=>{
             return s.id=id;
         }
     );
     return po;
    }
    
    }
    
  