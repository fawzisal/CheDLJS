
export function radians(degree) {
	return degree * Math.PI / 180;
}
export function degrees(radian) {
	return radian * 180 / Math.PI;
}
export function copysign(x, y) {
	return Math.abs(x) * Math.sign(y);
}
export function updateObj(target, src) {
  Object.keys(target)
        .forEach(k => target[k] = (src[k] ?? target[k]));
  return target;
}
export function flatten(ary) {
    var ret = [];
    for(var i = 0; i < ary.length; i++) {
        if(Array.isArray(ary[i])) {
            ret = ret.concat(flatten(ary[i]));
        } else {
            ret.push(ary[i]);
        }
    }
    return ret;
}