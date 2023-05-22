const operator = require( './operator' );
import { wraps } from './functools.js';
const numpy as np = require( './numpy as np' );
const poly = require( './numpy/polynomial' );
import { cheb2poly, Chebyshev } from './numpy.polynomial.chebyshev.js';
import { Polynomial } from './numpy.polynomial.polynomial.js';
const sys = require( './sys' );
import { isInstance, stringInterpolate, hasAttr, setAttr } from './_pyjs.js';

emach = sys.float_info.epsilon; // machine epsilon
global sp_fftpack_ifft;
sp_fftpack_ifft = null;
export function fftpack_ifft(*args, **kwargs) {
    global sp_fftpack_ifft;
    if( sp_fftpack_ifft === null ) {
        from scipy.fftpack import ifft as sp_fftpack_ifft;
    }
    return sp_fftpack_ifft(*args, **kwargs);
}
global sp_fftpack_fft;
sp_fftpack_fft = null;
export function fftpack_fft(*args, **kwargs) {
    global sp_fftpack_fft;
    if( sp_fftpack_fft === null ) {
        from scipy.fftpack import fft as sp_fftpack_fft;
    }
    return sp_fftpack_fft(*args, **kwargs);
}
global sp_eigvals;
sp_eigvals = null;
export function eigvals(*args, **kwargs) {
    global sp_eigvals;
    if( sp_eigvals === null ) {
        from scipy.linalg import eigvals as sp_eigvals;
    }
    return sp_eigvals(*args, **kwargs);
}
global sp_toeplitz;
sp_toeplitz = null;
export function toeplitz(*args, **kwargs) {
    global sp_toeplitz;
    if( sp_toeplitz === null ) {
        from scipy.linalg import toeplitz as sp_toeplitz;
    }
    return sp_toeplitz(*args, **kwargs);
}
export function build_pychebfun({f, domain, N=15}) {
    let fvec = lambda xs: xs.map( xi =>f(xi) );
    return chebfun( {f: fvec, domain: domain, N: N });
}
export function build_solve_pychebfun({f, goal, domain, N=15, N_max=100, find_roots=2}) {
    let cache = {};
    function cached_fun(x) {
        // Almost half the points are cached!
        if( x in cache ) {
            return cache[x];
        }
        let val = f(x);
        let cache[x] = val;
        return val;
    }
    let fun = build_pychebfun(cached_fun, domain, { N: N });
    let roots = (fun - goal).roots();
    while( (len(roots) < find_roots && len(fun._values) < N_max) ) {
        N *= 2;
        fun = build_pychebfun(cached_fun, domain, { N: N });
        roots = (fun - goal).roots();
        roots = roots.filter( i => domain[0] < i < domain[1] );
    }
    return roots, fun;
}
export function chebfun_to_poly({coeffs_or_fun, domain=null, text=false}) {
    if( isInstance(coeffs_or_fun, Chebfun) ) {
        let coeffs = coeffs_or_fun.coefficients();
        let domain = coeffs_or_fun._domain;
    } else if( hasAttr(coeffs_or_fun, '__class__') && coeffs_or_fun.__class__.__name__ === 'ChebyshevExpansion' ) {
        coeffs = coeffs_or_fun.coef();
        domain = coeffs_or_fun.xmin(), coeffs_or_fun.xmax();
} else {
        coeffs = coeffs_or_fun;
    }
    let low, high = domain;
    // Reverse the coefficients, and use cheb2poly to make it in the polynomial domain
    let poly_coeffs = cheb2poly(coeffs).slice( 0,:-1 ).tolist();
    if( !text ) {
        return poly_coeffs;
    }
    let s = stringInterpolate( 'coeffs = %s\n', [poly_coeffs ] );
    let delta = high - low;
    let delta_sum = high + low;
    // Generate the expression
    s += stringInterpolate( 'horner(coeffs, %.18g*(x - %.18g))',[2.0/delta, 0.5*delta_sum] );
    // return the string
    return s;
}
export function cheb_to_poly({coeffs_or_fun, domain=null}) {
    from fluids.numerics import horner as horner_poly;
    if( isInstance(coeffs_or_fun, Chebfun) ) {
        let coeffs = coeffs_or_fun.coefficients();
        let domain = coeffs_or_fun._domain;
    } else if( hasAttr(coeffs_or_fun, '__class__') && coeffs_or_fun.__class__.__name__ === 'ChebyshevExpansion' ) {
        coeffs = coeffs_or_fun.coef();
        domain = coeffs_or_fun.xmin(), coeffs_or_fun.xmax();
} else {
        coeffs = coeffs_or_fun;
    }
    let low, high = domain;
    coeffs = cheb2poly(coeffs).slice( 0,:-1 ).tolist(); // Convert to polynomial basis
    // Mix in limits to make it a normal polynomial
    let my_poly = Polynomial([-0.5*(high + low)*2.0/(high - low), 2.0/(high - low)]);
    let poly_coeffs = horner_poly(coeffs, my_poly).coef.slice( 0,:-1 ).tolist();
    return poly_coeffs;
}
export function cheb_range_simplifier({low, high, text=false}) {
    /*
    >>> low, high = 0.0023046250851646434, 4.7088985707840125
    >>> cheb_range_simplifier(low, high, text=True)
    'chebval(0.42493574399544564724*(x + -2.3556015979345885647), coeffs)'
    */
    let constant = 0.5*(-low-high);
    let factor = 2.0/(high-low);
    if( text ) {
        return stringInterpolate( 'chebval(%.20g*(x + %.20g), coeffs)',[factor, constant] );
    }
    return constant, factor;
}
export function cast_scalar(method) {
    function new_method( other) {
        if( np.isscalar(other) ) {
            let other = type(self)([other],this.domain());
        }
        return method(self, other);
    }
    return new_method;
}
 class Polyfun extends object {
 class NoConvergence extends Exception {
}
     class DomainMismatch extends Exception {
}
    @classmethod
    from_data( data, domain=null) {
        return self(data,domain);
    }
@classmethod
    from_fun( other) {
        return self(other.values(),other.domain());
    }
@classmethod
    from_coeff( chebcoeff, domain=null, prune=true, vscale=1.) {
        let coeffs = np.asarray(chebcoeff);
        if( prune ) {
            let N = this._cutoff(coeffs, vscale);
            let pruned_coeffs = coeffs.slice( 0,N );
        } else {
            pruned_coeffs = coeffs;
        }
        let values = this.polyval(pruned_coeffs);
        return self(values, domain, vscale);
    }
@classmethod
    dichotomy( f, kmin=2, kmax=12, raise_no_convergence=true,) {
        for( let k=kmin; k < kmax; k++ ) {
            let N = pow(2, k);
            let sampled = this.sample_function(f, N);
            let coeffs = this.polyfit(sampled);
            // 3) Check for negligible coefficients
            //    If within bound: get negligible coeffs and bread
            let bnd = this._threshold(np.max(np.abs(coeffs)));
            let last = abs(coeffs.slice(-2 ));
            if( np.all(last <= bnd) ) {
                break;
            }
        }
        else:
            if( raise_no_convergence ) {
                throw this.NoConvergence(last, bnd);
            }
        return coeffs;
    }
@classmethod
    from_function( f, domain=null, N=null) {
        // rescale f to the unit domain
        let domain = this.get_default_domain(domain);
        let a,b = domain[0], domain[-1];
        let map_ui_ab = lambda t: 0.5*(b-a)*t + 0.5*(a+b);
        let args = {'f': lambda t: f(map_ui_ab(t))};
        if( N !== null ) { // N is provided
            let nextpow2 = int(np.log2(N))+1;
            args['kmin'] = nextpow2;
            args['kmax'] = nextpow2+1;
            args['raise_no_convergence'] = false;
        } else {
            args['raise_no_convergence'] = true;
        }
        // Find out the right number of coefficients to keep
        let coeffs = this.dichotomy(**args);
        return this.from_coeff(coeffs, domain);
    }
@classmethod
    _threshold( vscale) {
        let bnd = 128*emach*vscale;
        return bnd;
    }
@classmethod
    _cutoff( coeffs, vscale) {
        let bnd = this._threshold(vscale);
        let inds  = np.nonzero(abs(coeffs) >= bnd);
        if( len(inds[0]) ) {
            let N = inds[0][-1];
        } else {
            N = 0;
        }
        return N+1;
    }
    constructor( values=0., domain=null, vscale=null) {
        let avalues = np.asarray(values,);
        let avalues1 = np.atleast_1d(avalues);
        let N = len(avalues1);
        let points = this.interpolation_points(N);
        this._values = avalues1;
        if( vscale !== null ) {
            this._vscale = vscale;
        } else {
            this._vscale = np.max(np.abs(this._values));
        }
        this.p = this.interpolator(points, avalues1);
        let domain = this.get_default_domain(domain);
        this._domain = np.array(domain);
        let a,b = domain[0], domain[-1];
        // maps from [-1,1] <-> [a,b]
        let this._ab_to_ui = lambda x: (2.0*x-a-b)/(b-a);
        this._ui_to_ab = lambda t: 0.5*(b-a)*t + 0.5*(a+b);
    }
    same_domain( fun2) {
        return np.allclose(this.domain(), fun2.domain(), { rtol: 1e-14, atol: 1e-14 });
    }
    // ----------------------------------------------------------------
    // String representations
    // ----------------------------------------------------------------
    toString() {
        let a, b = this.domain();
        let vals = this.values();
        return stringInterpolate( (
            '%s \n '
            '    domain        length     endpoint values\n '
            ' [%5.1f, %5.1f]     %5d       %5.2f   %5.2f\n '
            'vscale = %1.2e'), [
                str(type(self)).split('.')[-1].split('>')[0].slice( 0,-1 ),
                a,b,this.size(),vals[-1],vals[0],this._vscale,] );
    }
    __str__() {
        return "<{0}({1})>".format(
            str(type(self)).split('.')[-1].split('>')[0].slice( 0,-1 ),this.size(),);
    }
    // ----------------------------------------------------------------
    // Basic Operator Overloads
    // ----------------------------------------------------------------
    __call__( x) {
        return this.p(this._ab_to_ui(x));
    }
    __getitem__( s) {
        return this.from_data(this.values().T[s].T);
    }
    __bool__() {
        return !np.allclose(this.values(), 0);
    }
__nonzero__ = __bool__;
    __eq__( other) {
        return !(self - other);
    }
    __ne__( other) {
        return !(self === other);
    }
@cast_scalar
    __add__( other) {
        if( !this.same_domain(other) ) {
            throw this.DomainMismatch(this.domain(),other.domain());
        }
        let ps = [self, other];
        // length difference
        let diff = other.size() - this.size();
        // determine which of self/other is the smaller/bigger
        let big = diff > 0;
        let small = !big;
        // pad the coefficients of the small one with zeros
        let small_coeffs = ps[small].coefficients();
        let big_coeffs = ps[big].coefficients();
        let padded = np.zeros_like(big_coeffs);
        padded.slice( 0,len(small_coeffs) ) = small_coeffs;
        // add the values and create a new object with them
        let chebsum = big_coeffs + padded;
        let new_vscale = np.max([this._vscale, other._vscale]);
        return this.from_coeff(
            chebsum, { domain: this.domain(), vscale: new_vscale }
        );
    }
__radd__ = __add__;
    @cast_scalar
    __sub__( other) {
        return self + (-other);
    }
    __rsub__( other) {
        return -(self - other);
    }
    __rmul__( other) {
        return this.__mul__(other);
    }
    __rtruediv__( other) {
        return this.__rdiv__(other);
    }
    __neg__() {
        return this.from_data(-this.values(), {domain: this.domain() });
    }
    __abs__() {
        return this.from_function(lambda x: abs(self(x)), {domain: this.domain() });
    }
    // ----------------------------------------------------------------
    // Attributes
    // ----------------------------------------------------------------
    size() {
        return this.p.n;
    }
    coefficients() {
        return this.polyfit(this.values());
    }
    values() {
        return this._values;
    }
    domain() {
        return this._domain;
    }
    // ----------------------------------------------------------------
    // Integration and differentiation
    // ----------------------------------------------------------------
    integrate() {
        throw NotImplementedError();
    }
    differentiate() {
        throw NotImplementedError();
    }
    dot( other) {
        let prod = self * other;
        return prod.sum();
    }
    norm() {
        let norm = np.sqrt(this.dot(self));
        return norm;
    }
    // ----------------------------------------------------------------
    // Miscellaneous operations
    // ----------------------------------------------------------------
    restrict(subinterval) {
        if( (subinterval[0] < this._domain[0]) || (subinterval[1] > this._domain[1]) ) {
            throw new Error( 'ValueError',"Can only restrict to subinterval" );
        }
        return this.from_function(self, subinterval);
    }
    // ----------------------------------------------------------------
    // Class method aliases
    // ----------------------------------------------------------------
diff = differentiate;
    cumsum = integrate;
}
 class Chebfun extends Polyfun {
    // ----------------------------------------------------------------
    // Standard construction class methods.
    // ----------------------------------------------------------------
    @classmethod
    get_default_domain( domain=null) {
        if( domain === null ) {
            return [-1., 1.];
        } else {
            return domain;
        }
    }
@classmethod
    identity( domain=[-1., 1.]) {
        return this.from_data([domain[1],domain[0]], domain);
    }
@classmethod
    basis( n) {
        if( n === 0 ) {
            return self(np.array([1.]));
        }
        let vals = np.ones(n+1);
        vals.slice(1,:2 ) = -1;
        return self(vals);
    }
    // ----------------------------------------------------------------
    // Integration and differentiation
    // ----------------------------------------------------------------
    sum() {
        let ak = this.coefficients();
        let ak2 = ak.slice( 0,:2 );
        let n = len(ak2);
        let Tints = 2/(1-(2*np.arange(n))**2);
        let val = np.sum((Tints*ak2.T).T, { axis: 0 });
        let a_, b_ = this.domain();
        return 0.5*(b_-a_)*val;
    }
    integrate() {
        let coeffs = this.coefficients();
        let a,b = this.domain();
        let int_coeffs = 0.5*(b-a)*poly.chebyshev.chebint(coeffs);
        let antiderivative = this.from_coeff(int_coeffs, { domain: this.domain() });
        return antiderivative - antiderivative(a);
    }
    differentiate( n=1) {
        let ak = this.coefficients();
        let a_, b_ = this.domain();
        for( let _; _<n; _++ ) {
            ak = this.differentiator(ak);
        }
        return this.from_coeff((2./(b_-a_))**n*ak, { domain: this.domain() });
    }
    // ----------------------------------------------------------------
    // Roots
    // ----------------------------------------------------------------
    roots() {
        if( this.size() === 1 ) {
            return np.array([]);
        } else if( this.size() <= 100 ) {
            let ak = this.coefficients();
            let v = np.zeros_like(ak.slice( 0,-1 ));
            v[1] = 0.5;
            let C1 = toeplitz(v);
            let C2 = np.zeros_like(C1);
            C1[0,1] = 1.;
            C2[-1,:] = ak.slice( 0,-1 );
            let C = C1 - .5/ak[-1] * C2;
            let eigenvalues = eigvals(C);
            let roots = eigenvalues.filter( eig => np.allclose(eig.imag,0, {atol: 1e-10 })
                        && np.abs(eig.real) <=1 ).map( eig =>eig.real );
            let scaled_roots = this._ui_to_ab(np.array(roots));
            return scaled_roots;
} else {
            try {
                // divide at a close-to-zero split-point
                let split_point = this._ui_to_ab(0.0123456789);
                return np.concatenate(
                    [this.restrict([this._domain[0],split_point]).roots(),
                     this.restrict([split_point,this._domain[1]]).roots()]);
            } catch( e ) {
                // Seems to have many fake roots for high degree fits
                let coeffs = this.coefficients();
                let domain = this._domain;
                let possibilities =  Chebyshev(coeffs, domain).roots();
                return np.array( possibilities.filter( i => i.imag === 0.0 ).map( i =>float(i.real) ));
            }
    // ----------------------------------------------------------------
    // Interpolation and evaluation (go from values to coefficients)
    // ----------------------------------------------------------------
        }
    }
@classmethod
    interpolation_points( N) {
        if( N === 1 ) {
            return np.array([0.]);
        }
        return np.cos(np.arange(N)*np.pi/(N-1));
    }
@classmethod
    sample_function( f, N) {
        let x = this.interpolation_points(N+1);
        return f(x);
    }
@classmethod
    polyfit( sampled) {
        let asampled = np.asarray(sampled);
        if( len(asampled) === 1 ) {
            return asampled;
        }
        let evened = even_data(asampled);
        let coeffs = dct(evened);
        return coeffs;
    }
@classmethod
    polyval( chebcoeff) {
        let N = len(chebcoeff);
        if( N === 1 ) {
            return chebcoeff;
        }
        let data = even_data(chebcoeff)/2;
        data[0] *= 2;
        data[N-1] *= 2;
        let fftdata = 2*(N-1)*fftpack_ifft(data, { axis: 0 });
        let complex_values = fftdata.slice( 0,N );
        // convert to real if input was real
        if( np.isrealobj(chebcoeff) ) {
            let values = np.real(complex_values);
        } else {
            values = complex_values;
        }
        return values;
    }
@classmethod
    interpolator( x, values) {
        // hacking the barycentric interpolator by computing the weights in advance
        from scipy.interpolate import BarycentricInterpolator as Bary;
        let p = Bary([0.]);
        let N = len(values);
        let weights = np.ones(N);
        weights[0] = .5;
        weights.slice(1,:2 ) = -1;
        weights[-1] *= .5;
        p.wi = weights;
        p.xi = x;
        p.set_yi(values);
        return p;
    }
    // ----------------------------------------------------------------
    // Helper for differentiation.
    // ----------------------------------------------------------------
@classmethod
    differentiator( A) {
        let m = len(A);
        let SA = (A.T* 2*np.arange(m)).T;
        let DA = np.zeros_like(A);
        if( m === 1 ) { // constant
            return np.zeros_like(A.slice(0,1 ));
        }
        if( m === 2 ) { // linear
            return A[1:2,];
        }
        DA[m-3:m-1,] = SA[m-2:m,];
        for( let j=0; j < m//2 - 1; j++ ) {
            let k = m-3-2*j;
            DA[k] = SA[k+1] + DA[k+2];
            DA[k-1] = SA[k] + DA[k+1];
        }
        DA[0] = (SA[1] + DA[2])*0.5;
        return DA;
    }
// ----------------------------------------------------------------
// General utilities
// ----------------------------------------------------------------
}
export function even_data(data) {
    return np.concatenate([data, data[-2:0:-1]],);
}
export function dct(data) {
    let N = len(data)//2;
    let fftdata     = fftpack_fft(data, { axis: 0 }).slice( 0,N+1 );
    fftdata     /= N;
    fftdata[0]  /= 2.;
    fftdata[-1] /= 2.;
    if( np.isrealobj(data) ) {
        let data = np.real(fftdata);
    } else {
        data = fftdata;
    }
    return data;
}
// ----------------------------------------------------------------
// Add overloaded operators
// ----------------------------------------------------------------
export function _add_operator({cls, op}) {
        function method( other) {
        if( !this.same_domain(other) ) {
            throw this.DomainMismatch(this.domain(), other.domain());
        }
        return this.from_function(
            lambda x: op(self(x).T, other(x).T).T, { domain: this.domain(), } );
    }
    let cast_method = cast_scalar(method);
    let name = '__'+op.__name__+'__';
    cast_method.__name__ = name;
    cast_method.__doc__ = "operator {}".format(name);
    setAttr(cls, name, cast_method);
}
export function rdiv({a, b}) {
    return b/a;
}
for _op in [operator.mul, operator.truediv, operator.pow, rdiv]:
    _add_operator(Polyfun, _op);
// ----------------------------------------------------------------
// Add numpy ufunc delegates
// ----------------------------------------------------------------
export function _add_delegate({ufunc, nonlinear=true}) {
        function method() {
        return this.from_function(lambda x: ufunc(self(x)), { domain: this.domain() });
    }
    let name = ufunc.__name__;
    let method.__name__ = name;
    method.__doc__ = "delegate for numpy's ufunc {}".format(name);
    setAttr(Polyfun, name, method);
}
// Following list generated from:
// https://github.com/numpy/numpy/blob/master/numpy/core/code_generators/generate_umath.py
for func in [np.arccos, np.arccosh, np.arcsin, np.arcsinh, np.arctan, np.arctanh, np.cos, np.sin, np.tan, np.cosh, np.sinh, np.tanh, np.exp, np.exp2, np.expm1, np.log, np.log2, np.log1p, np.sqrt, np.ceil, np.trunc, np.fabs, np.floor, ]:
    _add_delegate(func);
// ----------------------------------------------------------------
// General Aliases
// ----------------------------------------------------------------
//// chebpts = interpolation_points
// ----------------------------------------------------------------
// Constructor inspired by the Matlab version
// ----------------------------------------------------------------
export function chebfun({f=null, domain=[-1,1], N=null, chebcoeff=null,}) {
    // Chebyshev coefficients
    if( chebcoeff !== null ) {
        return Chebfun.from_coeff(chebcoeff, domain);
    }
    if( isInstance(f, Polyfun) ) {
        return Chebfun.from_fun(f);
    }
    if( hasAttr(f, '__call__') ) {
        return Chebfun.from_function(f, domain, N);
    }
    if( np.isscalar(f) ) {
        let f = [f];
    }
    try {
        iter(f); // interpolation values provided
    } catch( e )  {
    }
    else:
        return Chebfun(f, domain);
    throw new Error( 'TypeError','Impossible to initialise the object from an object of type {}'.format(type(f)) );
}
