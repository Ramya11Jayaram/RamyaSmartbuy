export class BudgetRequest {
    requestType: number;
    requester: string;
    region: string;
    costcenterName: string;
    createdBy: string;
    budgetApprovalStatus: string;
    company: string;
    docStatus: string;
    purchaseCategory: {pcId: number, levelId: number, comment?: string}[];
    authorizationLevel: number;
    authorizationAccess: any;
    creationdate: Date;
    creationtime: Date;
    title: string;
    employeeId: string;
    createdById?: number;
    spclFunctionalAuthorityRequested?: boolean;
    changedate?: Date;
    changetime?: Date;
    changedBy?: number;
    comment?: any; // Apparently this value doesn't get returned yet 3/10/2020
}
