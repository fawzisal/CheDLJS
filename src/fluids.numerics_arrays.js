import { copysign } from './fluids.helpers.js';
import { det as mathjs_det } from 'mathjs';
let __all__ = ['dot', 'inv', 'det', 'solve', 'norm2', 'inner_product', 'eye', 'array_as_tridiagonals', 'solve_tridiagonal', 'subset_matrix'];
export function det(matrix) {
    let size = len(matrix);
    if( size === 1 ) {
        return matrix[0];
    } else if( size === 2 ) {
        let [[a, b], [c, d]] = matrix;
        return a*d - c*b;
    } else if( size === 3 ) {
            [a, b, c], [d, e, f], [g, h, i] = matrix;
            return a*(e*i - h*f) - d*(b*i - h*c) + g*(b*f - e*c);
    } else if( size === 4 ) {
            [a, b, c, d], [e, f, g, h], [i, j, k, l], [m, n, o, p] = matrix;
        return (a*f*k*p - a*f*l*o - a*g*j*p + a*g*l*n + a*h*j*o - a*h*k*n - b*e*k*p + b*e*l*o + b*g*i*p - b*g*l*m - b*h*i*o + b*h*k*m + c*e*j*p - c*e*l*n - c*f*i*p + c*f*l*m + c*h*i*n - c*h*j*m - d*e*j*o + d*e*k*n + d*f*i*o - d*f*k*m - d*g*i*n + d*g*j*m);
    } else if( size === 5 ) {
        [[a, b, c, d, e], [f, g, h, i, j], [k, l, m, n, o], [p, q, r, s, t], [u, v, w, x, y]] = matrix;
        let x0 = s*y; let x1 = a*g*m; let x2 = t*w; let x3 = a*g*n; let x4 = r*x; let x5 = a*g*o; let x6 = t*x; let x7 = a*h*l; let x8 = q*y; let x9 = a*h*n; let x10 = s*v; let x11 = a*h*o; let x12 = r*y; let x13 = a*i*l; let x14 = t*v; let x15 = a*i*m; let x16 = q*w; let x17 = a*i*o; let x18 = s*w; let x19 = a*j*l; let x20 = q*x; let x21 = a*j*m; let x22 = r*v; let x23 = a*j*n; let x24 = b*f*m; let x25 = b*f*n; let x26 = b*f*o; let x27 = b*h*k; let x28 = t*u; let x29 = b*h*n; let x30 = p*x; let x31 = b*h*o; let x32 = b*i*k; let x33 = p*y; let x34 = b*i*m; let x35 = r*u; let x36 = b*i*o; let x37 = b*j*k; let x38 = s*u; let x39 = b*j*m; let x40 = p*w; let x41 = b*j*n; let x42 = c*f*l; let x43 = c*f*n; let x44 = c*f*o; let x45 = c*g*k; let x46 = c*g*n; let x47 = c*g*o; let x48 = c*i*k; let x49 = c*i*l; let x50 = p*v; let x51 = c*i*o; let x52 = c*j*k; let x53 = c*j*l; let x54 = q*u; let x55 = c*j*n; let x56 = d*f*l; let x57 = d*f*m; let x58 = d*f*o; let x59 = d*g*k; let x60 = d*g*m; let x61 = d*g*o; let x62 = d*h*k; let x63 = d*h*l; let x64 = d*h*o; let x65 = d*j*k; let x66 = d*j*l; let x67 = d*j*m; let x68 = e*f*l; let x69 = e*f*m; let x70 = e*f*n; let x71 = e*g*k; let x72 = e*g*m; let x73 = e*g*n; let x74 = e*h*k; let x75 = e*h*l; let x76 = e*h*n; let x77 = e*i*k; let x78 = e*i*l; let x79 = e*i*m;
        return (x0*x1 - x0*x24 + x0*x27 + x0*x42 - x0*x45 - x0*x7 - x1*x6  + x10*x11 - x10*x21 - x10*x44 + x10*x52 + x10*x69 - x10*x74 - x11*x20 + x12*x13 + x12*x25 - x12*x3 - x12*x32 - x12*x56 + x12*x59 - x13*x2 + x14*x15 + x14*x43 - x14*x48 - x14*x57 + x14*x62 - x14*x9 - x15*x8 + x16*x17 - x16*x23 - x16*x58  + x16*x65 + x16*x70 - x16*x77 - x17*x22 + x18*x19 + x18*x26 - x18*x37 - x18*x5 - x18*x68 + x18*x71 - x19*x4 - x2*x25 + x2*x3 + x2*x32 + x2*x56 - x2*x59 + x20*x21 + x20*x44  - x20*x52 - x20*x69 + x20*x74 + x22*x23 + x22*x58 - x22*x65 - x22*x70 + x22*x77 + x24*x6 - x26*x4 - x27*x6 + x28*x29  - x28*x34 - x28*x46 + x28*x49 + x28*x60 - x28*x63 - x29*x33 + x30*x31 - x30*x39 - x30*x47 + x30*x53 + x30*x72 - x30*x75 - x31*x38 + x33*x34 + x33*x46 - x33*x49 - x33*x60 + x33*x63  + x35*x36 - x35*x41 - x35*x61 + x35*x66 + x35*x73 - x35*x78  - x36*x40 + x37*x4 + x38*x39 + x38*x47 - x38*x53 - x38*x72  + x38*x75 + x4*x5 + x4*x68 - x4*x71 + x40*x41 + x40*x61 - x40*x66 - x40*x73 + x40*x78 - x42*x6 - x43*x8 + x45*x6  + x48*x8 + x50*x51 - x50*x55 - x50*x64 + x50*x67 + x50*x76  - x50*x79 - x51*x54 + x54*x55 + x54*x64 - x54*x67 - x54*x76 + x54*x79 + x57*x8 + x6*x7 - x62*x8 + x8*x9);
    } else {
        // changed from unimplemented numpy import
        return mathjs_det(matrix);
    }
}
export function inv(matrix) {
    let size = len(matrix);
    if( size === 1 ) {
        try {
            return [1.0/matrix[0]];
        } catch( e ) {
            return [1.0/matrix[0][0]];
        }
    } else if( size === 2 ) {
        let [[a, b], [c, d]] = matrix;
        let x0 = 1.0/a;
        let x1 = b*x0;
        let x2 = 1.0/(d - c*x1);
        let x3 = c*x2;
        return [[x0 + b*x3*x0*x0, -x1*x2], [-x0*x3, x2]];
    } else if( size === 3 ) {
        [[a, b, c], [d, e, f], [g, h, i]] = matrix;
        let x0 = 1./a; let x1 = b*d; let x2 = e - x0*x1; let x3 = 1./x2; let x4 = b*g; let x5 = h - x0*x4; let x6 = x0*x3; let x7 = d*x6; let x8 = -g*x0 + x5*x7; let x9 = c*d; let x10 = f - x0*x9; let x11 = b*x6; let x12 = c*x0 - x10*x11; let x13 = a*e; let x14 = -x1 + x13;
        let x15 = 1./(-a*f*h - c*e*g + f*x4 + h*x9 - i*x1 + i*x13);
        let x16 = x14*x15; let x17 = x12*x16; let x18 = x14*x15*x3; let x19 = x18*x5; let x20 = x10*x18;
        return [[x0 - x17*x8 + x1*x3*x0*x0, -x11 + x12*x19, -x17],
                [-x20*x8 - x7, x10*x16*x5*x2**-2 + x3, -x20],
                [ x16*x8, -x19, x16]];
    } else if( size === 4 ) {
        [[a, b, c, d], [e, f, g, h], [i, j, k, l], [m, n, o, p]] = matrix;
        let x0 = 1./a; let x1 = b*e; let x2 = f - x0*x1; let x3 = 1./x2; let x4 = i*x0; let x5 = -b*x4 + j; let x6 = x0*x3; let x7 = e*x6; let x8 = -x4 + x5*x7; let x9 = c*x0; let x10 = -e*x9 + g; let x11 = b*x6; let x12 = -x10*x11 + x9; let x13 = a*f; let x14 = -x1 + x13; let x15 = k*x13; let x16 = b*g*i; let x17 = c*e*j; let x18 = a*g*j; let x19 = k*x1; let x20 = c*f*i;
        let x21 = x15 + x16 + x17 - x18 - x19 - x20; let x22 = 1/x21; let x23 = x14*x22; let x24 = x12*x23; let x25 = m*x0; let x26 = -b*x25 + n; let x27 = x26*x3; let x28 = -m*x9 + o - x10*x27; let x29 = x23*x8; let x30 = -x25 + x26*x7 - x28*x29; let x31 = d*x0; let x32 = -e*x31 + h; let x33 = x3*x32; let x34 = -i*x31 + l - x33*x5; let x35 = -x11*x32 - x24*x34 + x31;
        let x36 = a*n; let x37 = g*l; let x38 = h*o; let x39 = l*o; let x40 = b*m; let x41 = h*k; let x42 = c*l; let x43 = f*m; let x44 = c*h; let x45 = i*n; let x46 = d*k; let x47 = e*n; let x48 = d*o; let x49 = d*g; let x50 = j*m;
        let x51 = 1.0/(a*j*x38 - b*i*x38 - e*j*x48 + f*i*x48 + p*x15  + p*x16 + p*x17 - p*x18 - p*x19 - p*x20 + x1*x39  - x13*x39 + x36*x37 - x36*x41 - x37*x40 + x40*x41 + x42*x43 - x42*x47 - x43*x46 + x44*x45 - x44*x50  - x45*x49 + x46*x47 + x49*x50);
        let x52 = x21*x51; let x53 = x35*x52; let x54 = x14*x22*x3; let x55 = x5*x54; let x56 = -x27 + x28*x55; let x57 = x52*x56; let x58 = x14*x51; let x59 = x28*x58; let x60 = x10*x54; let x61 = x33 - x34*x60; let x62 = x52*x61; let x63 = x34*x58;
        return [[x0 - x24*x8 - x30*x53 + x1*x3*x0*x0, -x11 + x12*x55 - x35*x57, -x24 + x35*x59, -x53], [-x30*x62 - x60*x8 - x7, x10*x23*x5*x2**-2 + x3 - x56*x62, x59*x61 - x60, -x62], [x29 - x30*x63, -x55 - x56*x63, x14*x14*x22*x28*x34*x51 + x23, -x63], [x30*x52, x57, -x59, x52]];
    } else {
        return inv_lu(matrix);
    }
}
export function shape(value) {
    try {
        return value.shape;
    } catch( e ) {
        /*  pass */
    }
    let dims = [len(value)];
    try {
        let iter_value = value[0];
        for( let i of range(10) ) {
            dims.push(len(iter_value));
            iter_value = iter_value[0];
        }
    } catch( e ) {
        /* pass */
    }
    return tuple(dims);
}
export function eye(N) {
    let mat = [];
    for( let i of range(N) ) {
        let r = [0.0]*N;
        r[i] = 1.0;
        mat.push(r);
    }
    return mat;
}
export function dot({a, b}) {
    try {
        let ab = a.map( row =>sum( _pyjs.listZip(row, b).map( ( [ ri, bi ] ) =>ri*bi )) );
    } catch( e ) {
        ab = [sum( _pyjs.listZip(a, b).map( ( [ ai, bi ] ) =>ai*bi ))];
    }
    return ab;
}
export function inner_product({a, b}) {
    let tot = 0.0;
    for( let i of range(len(a)) ) {
        tot += a[i]*b[i];
    }
    return tot;
}
export function inplace_LU({A, ipivot, N}) {
    let Np1 = N+1;
    for( let j of range(1, Np1) ) {
        for( let i of range(1, j) ) {
            let tot = A[i][j];
            for( let k of range(1, i) ) {
                tot -= A[i][k]*A[k][j];
            }
            A[i][j] = tot;
        }
        let apiv = 0.0;
        for( let i of range(j, Np1) ) {
            tot = A[i][j];
            for( let k of range(1, j) ) {
                tot -= A[i][k]*A[k][j];
            }
            A[i][j] = tot;
            if( apiv < abs(A[i][j]) ) {
                apiv, ipiv = abs(A[i][j]), i;
            }
        }
        if( apiv === 0 ) {
            throw new Error( 'ValueError',"Singular matrix" );
        }
        ipivot[j] = ipiv;
        if( ipiv !== j ) {
            for( let k of range(1, Np1) ) {
                let t = A[ipiv][k];
                A[ipiv][k] = A[j][k];
                A[j][k] = t;
            }
        }
        let Ajjinv = 1.0/A[j][j];
        for( let i of range(j+1, Np1) ) {
            A[i][j] *= Ajjinv;
        }
    }
    return null;
}
export function solve_from_lu({A, pivots, b, N}) {
    let Np1 = N + 1;
        // Note- list call is very slow faster to replace with [i for i in row]
    b = [0.0] + b; //list(b)
    for( let i of range(1, Np1) ) {
        let tot = b[pivots[i]];
        b[pivots[i]] = b[i];
        for( let j of range(1, i) ) {
            tot -= A[i][j]*b[j];
        }
        b[i] = tot;
    }
    for( let i of range(N, 0, -1) ) {
        tot = b[i];
        for( let j of range(i+1, Np1) ) {
            tot -= A[i][j]*b[j];
        }
        b[i] = tot/A[i][i];
    }
    return b;
}
export function solve_LU_decomposition({A, b}) {
    let N = len(b);
    let A_copy = [[0.0]*(N+1)];
    for( let row of A ) {
        // Note- list call is very slow faster to replace with [i for i in row]
        let r = [0.0] + row;
        //r = list(row)
        //r.insert(0, 0.0)
        A_copy.push(r);
    }
    let pivots = [0.0]*(N+1);
    inplace_LU(A_copy, pivots, N);
    return solve_from_lu(A_copy, pivots, b, N).slice(1 );
}
export function inv_lu(a) {
    let N = len(a);
    let Np1 = N + 1;
    let A_copy = [[0.0]*Np1];
    for( let row of a ) {
        // Note- list call is very slow faster to replace with [i for i in row]
        let r = list(row);
        r.insert(0, 0.0);
        A_copy.push(r);
    }
    a = A_copy;
    let ainv = range(N).map( i =>[0.0]*N );
    let pivots = [0]*Np1;
    inplace_LU(a, pivots, N);
    for( let j of range(N) ) {
        let b = [0.0]*N;
        b[j] = 1.0;
        b = solve_from_lu(a, pivots, b, N).slice(1 );
        for( let i of range(N) ) {
            ainv[i][j] = b[i];
        }
    }
    return ainv;
}
export function solve({a, b}) {
    if( len(a) > 4 ) {
        return solve_LU_decomposition(a, b);
    } else {
        return dot(inv(a), b);
    }
}
export function norm2(arr) {
    let tot = 0.0;
    for( let i of arr ) {
        tot += i*i;
    }
    return Math.sqrt(tot);
}
export function array_as_tridiagonals(arr) {
    let row_last = arr[0];
    let [a, b, c] = [[], [row_last[0]], []];
    for( let i of range(1, len(row_last)) ) {
        let row = arr[i];
        b.push(row[i]);
        c.push(row_last[i]);
        a.push(row[i-1]);
        row_last = row;
    }
    return [a, b, c];
}
export function tridiagonals_as_array({a, b, c, zero=0.0}) {
    let N = len(b);
    let arr = range(N).map( _ =>[zero]*N );
    let row_last = arr[0];
    row_last[0] = b[0];
    for( let i of range(1, N) ) {
        let row = arr[i];
        row[i] = b[i]; // set the middle row back
        row[i-1] = a[i-1];
        row_last[i] = c[i-1];
        row_last = row;
    }
    return arr;
}
export function solve_tridiagonal({a, b, c, d}) {
    [b, d] = [b, d];
    let N = len(d);
    for( let i of range(N - 1) ) {
        let m = a[i]/b[i];
        b[i+1] -= m*c[i];
        d[i+1] -= m*d[i];
    }
    b[-1] = d[-1]/b[-1];
    for( let i of range(N-2, -1, -1) ) {
        b[i] = (d[i] - c[i]*b[i+1])/b[i];
    }
    return b;
}
export function subset_matrix({whole, subset}) {
    if( Object.is( type(subset), slice ) ) {
        let subset = range(subset.start, subset.stop, subset.step);
    }
    new_ = [];
    for( let i of subset ) {
        let whole_i = whole[i];
        new_.push( subset.map( j =>whole_i[j] ));
    }
    return new_;
}
