export class GenericUser {
  'id': number;
  'employeeID': string;
  'managerID': string;
  'companyCode': number;
  'costCenterCode': number;
  'firstName': string;
  'lastName': string;
  'title': string;
  'defaultLevel'?: number;
  'adminAccess'?: string;

  constructor(user: any) { // intended for use with AdUser or HrUser only
    this.id = user.ID || user.id;
    this.employeeID = user.employeeId || user.employeeID;
    this.companyCode = user.companyCode;
    this.costCenterCode = user.costCenterCode;
    this.firstName = user.firstname || user.firstName;
    this.lastName = user.lastname || user.lastName;
    this.managerID = user.supervisorId || user.managerID;
    this.adminAccess = user.adminAccess || undefined;
    this.title = user.title;
  }

}

