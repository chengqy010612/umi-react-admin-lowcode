// 是否为json字符串
export function isJSON(str) {
  if (typeof str === "string") {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  }else{
    return false;
  }
}
