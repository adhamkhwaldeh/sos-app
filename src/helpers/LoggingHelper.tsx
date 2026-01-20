export default class LoggingHelper {
  static log(...args: any[]) {
    if (__DEV__) {
      console.log(args);
    }
  }
}
