const funKey = '__FUNCTION__';

function convertFun(obj) {
  if (obj == null) return obj;
  switch (typeof obj) {
    case 'function':
      return {
        [funKey]: obj.toString()
      };
    case 'object':
      if (Array.isArray(obj)) {
        return obj.map(o => convertFun(o));
      }
      const newObj =  {};
      Object.keys(obj).forEach(k => {
        newObj[k] = convertFun(obj[k]);
      });
      return newObj;
    default:
      return obj;
  }
}

function restoreFun(obj) {
  if (obj == null) return obj;
  switch (typeof obj) {
    case 'object':
      if (Array.isArray(obj)) {
        return obj.map(o => restoreFun(o));
      }
      const keys = Object.keys(obj);
      if (keys.length === 1 && keys[0] === funKey) {
        return eval(obj[funKey]);
      }
      keys.forEach(k => {
        obj[k] = restoreFun(obj[k]);
      });
      return obj;
    default:
      return obj;
  }
}

module.exports = {
  convertFun,
  restoreFun
};