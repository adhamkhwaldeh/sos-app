import moment from 'moment';

export default class DateHelpers {
  static SERVER_Format_Tag: string = "yyyy-MM-dd'T'kk:mm:ss";
  static Standard_Format_Tag: string = 'yyyy-MM-DD';
  static Standard_Datetime_Format_Tag: string = 'yyyy-MM-DD kk:mm';

  //2021-06-15T18:13:46.0223952

  static getStanderdFormate(date: Date): string {
    //     console.log(date);
    //    var mom= moment()
    //      mom.date =date;
    //        (.(date))
    return moment(date.toString()).format(DateHelpers.Standard_Format_Tag); //
  }

  static getStanderdDatetimeFormate(date: Date): string {
    //     console.log(date);
    //    var mom= moment()
    //      mom.date =date;
    //        (.(date))
    return moment(date.toString()).format(
      DateHelpers.Standard_Datetime_Format_Tag,
    ); //
  }
  static getStanderdDatetimeFormatFromString(date: string): string {
    //console.log('date ' + date);
    //    var mom= moment()
    //      mom.date =date;
    //        (.(date))
    return moment(date).format(DateHelpers.Standard_Format_Tag); //
  }
}
