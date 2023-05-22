
// adapted from: https://github.com/protobi/lambertw
function halley_iteration(x, w_initial, max_iters) {
  var w = w_initial, i;

  for (i = 0; i < max_iters; i++) {
    var tol;
    var e = Math.exp(w);
    var p = w + 1.0;
    var t = w * e - x;

    if (w > 0) { t = (t / p) / e; }
    else { t /= e * p - 0.5 * (p + 1.0) * t / p; }
    w -= t;
    tol = GSL_DBL_EPSILON * Math.max(Math.abs(w), 1.0 / (Math.abs(p) * e));
    if (Math.abs(t) < tol) { return w; }
  }
  return w;
}

export const lambert_W0 = (x) => {
  const one_over_E = 1.0 / Math.E;
  const q = x + one_over_E;
  var val;

  if (x == 0.0) { val = 0.0; }
  else if (q < 0.0) { val = -1.0; }
  else if (q == 0.0) { val = -1.0; }
  else if (q < 1.0e-03) { val = series_eval(Math.sqrt(q)); }
  else {
    const MAX_ITERS = 100;
    var w;

    if (x < 1.0) {
      const p = Math.sqrt(2.0 * Math.E * q);
      w = -1.0 + p * (1.0 + p * (-1.0 / 3.0 + p * 11.0 / 72.0));
    }
    else {
      w = Math.log(x);
      if (x > 3.0) { w -= Math.log(w); }
    }
    return halley_iteration(x, w, MAX_ITERS, result);
  }
}

export const range = (start, stop=null, step=1) => {
  if (stop == null){ stop = start; start = 0; }
  let a=Array((stop-start)/step);
  return [...a.keys()].map((x) => start + step*x);
}
