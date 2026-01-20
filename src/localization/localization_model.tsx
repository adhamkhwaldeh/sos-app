export default class LocalizationModel{
    code: string;
    isRTL:Boolean;

    constructor(code: string,isRTL:Boolean) {
      this.code = code;
      this.isRTL = isRTL;
    }
    
}