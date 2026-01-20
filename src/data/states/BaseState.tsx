// import LoggingHelper from '../../helpers/LoggingHelper';

export default class BaseState<T> {
  isLoading: boolean = false;
  noInternetConnection: boolean = false;
  notAuthorized: string | null = null;
  internalServerError: string | null = null;
  haveUknownError: boolean = false;
  isDataSubmitted: boolean = false;
  isEmpty: boolean = false;
  error: any | null = null;
  data: T;

  constructor(data: T) {
    this.data = data;
  }

  public resetBaseState = () => {
    this.isLoading = false;
    this.noInternetConnection = false;
    this.notAuthorized = null;
    this.internalServerError = null;
    this.haveUknownError = false;
    this.isDataSubmitted = false;
    this.isEmpty = false;
    this.error = null;
    return this;
  };

  // public defaultData: () => T;

  // constructor(defaultData: () => T) {
  //   this.data = defaultData();
  //   this.defaultData = defaultData;
  // }

  // public resetAllBaseState = (modelPrefix: string) => {
  //   this.resetBaseState();
  //   LoggingHelper.log('Reset the data before Prefix' + modelPrefix);
  //   LoggingHelper.log('Reset the data before' + JSON.stringify(this.data));
  //   this.data = this.defaultData();
  //   // this.data = Array.isArray(this.defaultData)
  //   //   ? Object.create(this.defaultData)
  //   //   : this.defaultData == null
  //   //   ? this.defaultData
  //   //   : {...this.defaultData};
  //   //Object.assign({},this.defaultData); //JSON.parse(JSON.stringify(this.defaultData));
  //   LoggingHelper.log('Reset the data after' + JSON.stringify(this.data));
  //   // Object.create(this.defaultData);
  //   // this.defaultData == null  ? null : ...this.defaultData.clo; // Object.assign({}, this.defaultData);
  //   return this;
  // };
}
