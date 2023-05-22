let __all__ = ['add_dd', 'mul_noerrors_dd', 'mul_dd', 'div_dd', 'sqrt_dd',
           'square_dd', 'mul_imag_dd', 'mul_imag_noerrors_dd', 'sqrt_imag_dd',
           'add_imag_dd', 'imag_inv_dd', 'div_imag_dd', 'cbrt_imag_dd',
           'cbrt_dd', 'cube_dd', 'cbrt_explicit_dd', 'eq_dd', 'neq_dd',
           'lt_dd', 'gt_dd', 'le_dd', 'ge_dd', 'intpow_dd', 'exp_dd',
           'log_dd', 'pow_dd'];
import { stringInterpolate } from './_pyjs.js';

let third = 1/3.0;
export function eq_dd({r0, e0, r1, e1}) {
    /*Return True if two numbers are equal, False otherwise.
    */
    return r0 === r1 && e0 === e1;
}

export function neq_dd({r0, e0, r1, e1}) {
    /*Return False if two numbers are equal, True otherwise.
    */
    return r0 !== r1 || e0 !== e1;
}

export function lt_dd({r0, e0, r1, e1}) {
    /*Return True if first number is less than second number, otherwise False.
    */
    return r0 < r1 || (r0 === r1 && e0 < e1);
}

export function le_dd({r0, e0, r1, e1}) {
    /*Return True if first number is less than or equal to second number, otherwise False.
    */
    return r0 < r1 || (r0 === r1 && e0 <= e1);
}

export function gt_dd({r0, e0, r1, e1}) {
    /*Return True if first number is larger than second number, otherwise False.
    */
    return r0 > r1 || (r0 === r1 && e0 > e1);
}

export function ge_dd({r0, e0, r1, e1}) {
    /*Return True if first number is larger or equal to the second number, otherwise False.
    */
    return r0 > r1 || (r0 === r1 && e0 >= e1);
}

export function add_dd({x0, y0, x1, y1}) {
    /*Add two floating point doule doubles.
    args: first number main, first number small...
    */
    let r = x0 + x1;
    let t = r - x0;
    let e = (x0 - (r - t)) + (x1 - t);
    e += y0 + y1;
    let r2 = r + e;
    e = e - (r2 - r);
    return [r2, e];
}

export function mul_noerrors_dd({x0, x1}) {
    /*Multiply two floating point numbers which were previously only
    doubles, and return ther
    */
    let u = x0*134217729.0;
    let v = x1*134217729.0;
    let s = u - (u - x0);
    let t = v - (v - x1);
    let f = x0 - s;
    let g = x1 - t;
    let r = x0*x1;
    let e = ((s*t - r) + s*g + f*t) + f*g;
    return [r, e];
}

export function mul_dd({x0, y0, x1, y1}) {
    let u = x0*134217729.0;
    let v = x1*134217729.0;
    let s = u - (u - x0);
    let t = v - (v - x1);
    let f = x0 - s;
    let g = x1 - t;
    let r = x0*x1;
    let e = ((s*t - r) + s*g + f*t) + f*g;
    e += x0*y1 + y0*x1;
    let r0 = r + e;
    e = e - (r0 - r);
    return [r0, e];
}

export function div_dd({x0, y0, x1, y1}) {
    // Creating a 1/x operation would save 1 add, one multiply only!
    let r = x0/x1;
    let u = r*134217729.0;
    let v = x1*134217729.0;
    let s2 = u - (u - r);
    let t = v - (v - x1);
    let f = r - s2;
    let g = x1 - t;
    let s = r*x1;
    f = ((s2*t - s) + s2*g + f*t) + f*g;
    let e = (x0 - s - f + y0 - r*y1)/x1;
    let r0 = r + e;
    e = e - (r0 - r);
    return [r0, e];
}

export function sqrt_dd({x, y}) {
    if( x === 0.0 ) {
        return [0.0, 0.0];
    }
    let r = Math.sqrt(x);
    let u = r*134217729.0;
    let s2 = u - (u - r);
    let f2 = r - s2;
    let s = r*r;
    let f = ((s2*s2 - s) + 2.0*s2*f2) + f2*f2;
    let e = (x - s - f + y)*0.5/r;
    let r0 = r + e;
    e = e - (r0 - r);
    return [r0, e];
}

export function square_dd({x0, y0}) {
    // main part, second part - as fast as possible
    let u = x0*134217729.0;
    let s = u - (u - x0);
    let f = x0 - s;
    let r = x0*x0;
    let e = ((s*s - r) + 2.0*s*f) + f*f + 2.0*x0*y0;
    let r0 = r + e;
    e = e - (r0 - r);
    return [r0, e];
}

export function intpow_dd({r, e, n}) {
    /*Compute and return the integer power of
    a double-double number `r` and `e` to the
    `n`. (r+e)^n.
    */
    let br, be, rr, re;
    [br, be] = [r, e];
    let i = Math.abs(n);
    [rr, re] = [1.0, 0.0];
    while( true ) {
        if( i & 1 === 1 ) {
            [rr, re] = mul_dd(rr, re, br, be);
        }
        if( i <= 1 ) {
            break;
        }
        i >>= 1;
        [br, be] = mul_dd(br, be, br, be);
    }
    if( n < 0 ) {
        return div_dd(1.0, 0.0, rr, re);
    }
    return [rr, re];
}

let dd_exp_coeffs = [156, 12012, 600600, 21621600, 588107520, 12350257920, 201132771840, 2514159648000, 23465490048000, 154872234316800, 647647525324800, 1295295050649600];
export function exp_dd({r, e}) {
    let n = ~~Math.round(r);
    let [xr, xe] = add_dd(r, e, -n, 0);
    let [ur, ue] = add_dd(xr, xe, dd_exp_coeffs[0], 0);

    for( let i=1; i < 12; i++ ) {
        [ur, ue] = mul_dd(xr, xe, ur, ue);
        [ur, ue] = add_dd(ur, ue, dd_exp_coeffs[i], 0);
    }

    let [vr, ve] = add_dd(xr, xe, -dd_exp_coeffs[0], 0);
    let f = 1.0;
    for( let i=1; i < 12; i++ ) {
        [vr, ve] = mul_dd(xr, xe, vr, ve);
        [vr, ve] = add_dd(vr, ve, f*dd_exp_coeffs[i], 0);
        f *= -1.0;
    }

    let [outr, oute] = intpow_dd(2.718281828459045, 1.4456468917292502e-16, n);
    [outr, oute] = mul_dd(outr, oute, ur, ue);
    [outr, oute] = div_dd(outr, oute, vr, ve);
    return [outr, oute];
}


export function log_dd({r, e}) {
    /*Compute the log.
    */
    let [rr, re] = [Math.log(r), 0.0];
    let [ur, ue] = exp_dd(rr, re);
    let [tmpr, tmpe] = add_dd(ur, ue, -r, -e);
    let [denr, dene] = add_dd(ur, ue, r, e);
    [tmpr, tmpe] = div_dd(tmpr, tmpe, denr, dene);
    [tmpr, tmpe] = mul_dd(2.0, 0.0, tmpr, tmpe);
    return add_dd(rr, re, -tmpr, -tmpe);
}

export function pow_dd({r, e, nr, ne}) {
    /*Compute the power*/
    if( ne === 0.0 && (stringInterpolate( nr, [1 ] )) === 0 ) {
        return intpow_dd(r, e, nr);
    }
    let [tmpr, tmpe] = log_dd(r, e);
    [tmpr, tmpe] = mul_dd(tmpr, tmpe, nr, ne);
    return exp_dd(tmpr, tmpe);
}


export function mul_imag_dd({xrr, xre, xcr, xce, yrr, yre, ycr, yce}) {
    // TODO Make one for one number having zero complex number
    let [zrr, zre] = mul_dd(xrr, xre, yrr, yre);
    let [wrr, wre] = mul_dd(xcr, xce, ycr, yce);
    [zrr, zre] = add_dd(zrr, zre, -wrr, -wre);

    let [zcr, zce] = mul_dd(xrr, xre, ycr, yce);
    [wrr, wre] = mul_dd(xcr, xce, yrr, yre);
    [zcr, zce] = add_dd(zcr, zce, wrr, wre);
    return [zrr, zre, zcr, zce];
}

export function mul_imag_noerrors_dd({xrr, xcr, yrr, ycr}) {
    let [zrr, zre] = mul_noerrors_dd(xrr, yrr);
    let [wrr, wre] = mul_noerrors_dd(xcr, -ycr);
    [zrr, zre] = add_dd(zrr, zre, wrr, wre);

    let [zcr, zce] = mul_noerrors_dd(xrr, ycr);
    [wrr, wre] = mul_noerrors_dd(xcr, yrr);
    [zcr, zce] = add_dd(zcr, zce, wrr, wre);
    return [zrr, zre, zcr, zce];
}

export function sqrt_imag_dd({xrr, xre, xcr, xce}) {
    let zrr, zre;
    if( xcr === 0.0 ) {
        if( xrr > 0.0 ) {
            [zrr, zre] = sqrt_dd(xrr, xre);
            return [zrr, zre, 0.0, 0.0];
        }
        [zrr, zre] = sqrt_dd(-xrr, -xre);
        return [0.0, 0.0, zrr, zre];
    }
    let [xrr2, xre2] = square_dd(xrr, xre);
    let [xcr2, xce2] = square_dd(xcr, xce);
    let [wr, we] = add_dd(xrr2, xre2, xcr2, xce2);
    [wr, we] = sqrt_dd(wr, we);

    [zrr, zre] = add_dd(wr, we, xrr, xre);
    zrr *= 0.5;
    zre *= 0.5; // checks out
    [zrr, zre] = sqrt_dd(zrr, zre); // real part of answer

    let [zcr, zce] = add_dd(wr, we, -xrr, -xre);
    zcr *= 0.5;
    zce *= 0.5; // checks out
    [zcr, zce] = sqrt_dd(zcr, zce); // real part of answer
    return [zrr, zre, zcr, zce];
}

export function add_imag_dd({xrr, xre, xcr, xce, yrr, yre, ycr, yce}) {
    let [zrr, zre] = add_dd(xrr, xre, yrr, yre);
    let [zcr, zce] = add_dd(xcr, xce, ycr, yce);
    return [zrr, zre, zcr, zce];
}

export function imag_inv_dd({xrr, xre, xcr, xce}) {
    let [cr2, ce2] = square_dd(xrr, xre);
    let [wr, we] = square_dd(xcr, xce);
    [wr, we] = add_dd(cr2, ce2, wr, we);
    [xrr, xre] = div_dd(xrr, xre, wr, we);
    [xcr, xce] = div_dd(xcr, xce, wr, we);
    return [xrr, xre, -xcr, -xce];
}

export function div_imag_dd({xrr, xre, xcr, xce, yrr, yre, ycr, yce}) {
    // TODO try to make one for the case the numerator has no complex number
    // as that is used.
    let [cr2, ce2] = square_dd(yrr, yre);
    let [wr, we] = square_dd(ycr, yce);
    [wr, we] = add_dd(cr2, ce2, wr, we);

    let [nlr, nle] = mul_dd(xrr, xre, yrr, yre);
    [cr2, ce2] = mul_dd(xcr, xce, ycr, yce);
    [nlr, nle] = add_dd(nlr, nle, cr2, ce2);

    let [nrr, nre] = mul_dd(xcr, xce, yrr, yre);
    [cr2, ce2] = mul_dd(xrr, xre, ycr, yce);
    [nrr, nre] = add_dd(nrr, nre, -cr2, -ce2);

    [xrr, xre] = div_dd(nlr, nle, wr, we);
    [xcr, xce] = div_dd(nrr, nre, wr, we);
    return [xrr, xre, xcr, xce];
}

export function cbrt_imag_dd({xrr, xre, xcr, xce}) {
    // start off at the double precision solution
    throw(Error('TODO: implment complex numbers'))
    // let y_guess = (xrr + xcr*1.0j)**(-1.0/3.);
    let y_guess = (xrr + xcr*1.0)**(-1.0/3.);
    let [yr, yc] = [y_guess.real, y_guess.imag];
    // one newton iteration
    let [t0rr, t0re, t0cr, t0ce] = mul_imag_noerrors_dd(yr, yc, yr, yc);  // have y*y
    [t0rr, t0re, t0cr, t0ce] = mul_imag_dd(t0rr, t0re, t0cr, t0ce, yr, 0.0, yc, 0.0);  // have y*y*y
    [t0rr, t0re, t0cr, t0ce] = mul_imag_dd(t0rr, t0re, t0cr, t0ce, xrr, xre, xcr, xce);   // have x*y*y*y

    // here, we flip the signs on the complex bits
    // add do an add to the real bits
    [t0rr, t0re] = add_dd(1.0, 0.0, -t0rr, -t0re);
//     t0rr, t0re, t0cr, t0ce = add_imag_dd(1.0, 0.0, 0.0, 0.0, -t0rr, -t0re, -t0cr, -t0ce) # have 1-x*y*y*y ; should be able to optimize this
    [t0rr, t0re, t0cr, t0ce] = mul_imag_dd(yr, 0.0, yc, 0.0, t0rr, t0re, -t0cr, -t0ce); // have y*(1-x*y*y*y)

    [t0rr, t0re, t0cr, t0ce] = mul_imag_dd(t0rr, t0re, t0cr, t0ce, 0.3333333333333333, 1.850371707708594e-17, 0.0, 0.0); // have third_dd*y*(1-x*y*y*y); should be able to optimize this
    [t0rr, t0re, t0cr, t0ce] = add_imag_dd(yr, 0.0, yc, 0.0, t0rr, t0re, t0cr, t0ce);  // have y
    return imag_inv_dd(t0rr, t0re, t0cr, t0ce);
}

export function cbrt_dd({xr, xe}) {
    // http://web.mit.edu/tabbott/Public/quaddouble-debian/qd-2.3.4-old/docs/qd.pdf
    let yr = (xr**(-1.0/3.));
    let ye = 0.0;

    let [w0r, w0e] = cube_dd(yr, ye);
//     w0r, w0e = mul_dd(w0r, w0e, yr, ye)
    [w0r, w0e] = mul_dd(w0r, w0e, xr, xe);
    [w0r, w0e] = add_dd(1.0, 0.0, -w0r, -w0e);
    [w0r, w0e] = mul_dd(w0r, w0e, yr, ye);
    [yr, ye] = add_dd(yr, ye, w0r, w0e);

    // Do it again, most of the time probably don't need this? Turn it off on EOS?
    [w0r, w0e] = cube_dd(yr, ye);
    [w0r, w0e] = mul_dd(w0r, w0e, xr, xe);
    [w0r, w0e] = add_dd(1.0, 0.0, -w0r, -w0e);
    [w0r, w0e] = mul_dd(w0r, w0e, yr, ye);
    [yr, ye] = add_dd(yr, ye, third*w0r, third*w0e);
    return div_dd(1.0, 0.0, yr, ye);
}

export function cube_dd({x0, y0}) {
    // main part, second part - as fast as possible
    let u = x0*134217729.0;
    let s = u - (u - x0);
    let f = x0 - s;
    let r = x0*x0;
    let e = ((s*s - r) + 2.0*s*f) + f*f + 2.0*x0*y0;
    let r0 = r + e;
    let e0 = e - (r0 - r);

    let v = r0*134217729.0;
    let t = v - (v - r0);
    let g = r0 - t;
    r = x0*r0;
    e = ((s*t - r) + s*g + f*t) + f*g + x0*e0 + y0*r0;
    r0 = r + e;
    e = e - (r0 - r);
    return [r0, e];
}

export function cbrt_explicit_dd({xr, xe}) {
    // http://web.mit.edu/tabbott/Public/quaddouble-debian/qd-2.3.4-old/docs/qd.pdf
    let yr = (xr**(-1.0/3.));
    let ye = 0.0;

//     w0r, w0e = cube_dd(yr, ye)
    // Couple of things commented out at the start since ye is zero
    // Cannot seem to make ot work good.
    let u = yr*134217729.0;
    let s = u - (u - yr);
    let f = yr - s;
    let r = yr*yr;
    let w0e = ((s*s - r) + 2.0*s*f) + f*f + 2.0*yr*ye;
    let w0r = r + w0e;
    let e0 = w0e - (w0r - r);

    let v = w0r*134217729.0;
    let t = v - (v - w0r);
    let g = w0r - t;
    r = yr*w0r;
    w0e = ((s*t - r) + s*g + f*t) + f*g + yr*e0 + ye*w0r;
    w0r = r + w0e;
    w0e = w0e - (w0r - r);


    [w0r, w0e] = mul_dd(w0r, w0e, xr, xe);
    [w0r, w0e] = add_dd(1.0, 0.0, -w0r, -w0e);
    [w0r, w0e] = mul_dd(w0r, w0e, yr, ye);
    [yr, ye] = add_dd(yr, ye, w0r, w0e);

    // Do it again, most of the time probably don't need this? Turn it off on EOS?
    u = yr*134217729.0;
    s = u - (u - yr);
    f = yr - s;
    r = yr*yr;
    w0e = ((s*s - r) + 2.0*s*f) + f*f + 2.0*yr*ye;
    w0r = r + w0e;
    e0 = w0e - (w0r - r);

    v = w0r*134217729.0;
    t = v - (v - w0r);
    g = w0r - t;
    r = yr*w0r;
    w0e = ((s*t - r) + s*g + f*t) + f*g + yr*e0 + ye*w0r;
    w0r = r + w0e;
    w0e = w0e - (w0r - r);
    [w0r, w0e] = mul_dd(w0r, w0e, xr, xe);
    [w0r, w0e] = add_dd(1.0, 0.0, -w0r, -w0e);
    [w0r, w0e] = mul_dd(w0r, w0e, yr, ye);
    [yr, ye] = add_dd(yr, ye, third*w0r, third*w0e);
    return div_dd(1.0, 0.0, yr, ye);
}


