import { radians, updateObj } from './fluids.helpers.js' ;
import { inch, g } from './fluids.constants.js' ;
import { secant, lambertw } from './fluids.numerics_init.js' ;
import { Dean, Reynolds } from './fluids.core.js' ;
import { float } from './_pyjs.js';
import { lambert_W0 } from './utils.js';
import { fuzzball } from 'fuzzball';

let __all__ = ['friction_factor', 'friction_factor_methods', 'friction_factor_curved', 'helical_Re_crit', 'friction_factor_curved_methods', 'Colebrook', 'Clamond', 'friction_laminar', 'one_phase_dP', 'one_phase_dP_gravitational', 'one_phase_dP_dz_acceleration', 'one_phase_dP_acceleration', 'transmission_factor', 'material_roughness', 'nearest_material_roughness', 'roughness_Farshad', '_Farshad_roughness', '_roughness', 'HHR_roughness', 'Moody', 'Alshul_1952', 'Wood_1966', 'Churchill_1973', 'Eck_1973', 'Jain_1976', 'Swamee_Jain_1976', 'Churchill_1977', 'Chen_1979', 'Round_1980', 'Shacham_1980', 'Barr_1981', 'Zigrang_Sylvester_1', 'Zigrang_Sylvester_2', 'Haaland', 'Serghides_1', 'Serghides_2', 'Tsal_1989', 'Manadilli_1997', 'Romeo_2002', 'Sonnad_Goudar_2006', 'Rao_Kumar_2007', 'Buzzelli_2008', 'Avci_Karagoz_2009', 'Papaevangelo_2010', 'Brkic_2011_1', 'Brkic_2011_2', 'Fang_2011', 'Blasius', 'von_Karman', 'Prandtl_von_Karman_Nikuradse', 'ft_Crane', 'helical_laminar_fd_White', 'helical_laminar_fd_Mori_Nakayama', 'helical_laminar_fd_Schmidt', 'helical_turbulent_fd_Schmidt', 'helical_turbulent_fd_Mori_Nakayama', 'helical_turbulent_fd_Prasad', 'helical_turbulent_fd_Czop', 'helical_turbulent_fd_Guo', 'helical_turbulent_fd_Ju', 'helical_turbulent_fd_Srinivasan', 'helical_turbulent_fd_Mandal_Nigam', 'helical_transition_Re_Seth_Stahel', 'helical_transition_Re_Ito', 'helical_transition_Re_Kubair_Kuloor', 'helical_transition_Re_Kutateladze_Borishanskii', 'helical_transition_Re_Schmidt', 'helical_transition_Re_Srinivasan', 'LAMINAR_TRANSITION_PIPE', 'oregon_smooth_data', 'friction_plate_Martin_1999', 'friction_plate_Martin_VDI', 'friction_plate_Kumar', 'friction_plate_Muley_Manglik'];


let fuzzy_match_fun = null;
export function fuzzy_match({name, strings}) {
    if( fuzzy_match_fun !== null ) {
        return fuzzy_match_fun(name, strings);
    }
    // try {
        
    let fuzzy_match_fun = (name, strings) => { fuzzball.extract(name, strings, { limit: 10 })[0][0] };
    // }
    // catch( e ) /* ImportError */ { // pragma: no cover
    //     const difflib = require( './difflib' );
    //     fuzzy_match_fun = (name, strings) => { difflib.get_close_matches(name, strings, { n: 1, cutoff: 0 })[0] };
    // }
    return fuzzy_match_fun(name, strings);
}

export let LAMINAR_TRANSITION_PIPE = 2040.;
/*Believed to be the most accurate result to date. Accurate to +/- 10.
Avila, Kerstin, David Moxey, Alberto de Lozar, Marc Avila, Dwight Barkley, and
Björn Hof. "The Onset of Turbulence in Pipe Flow." Science 333, no. 6039
(July 8, 2011): 192-196. doi:10.1126/science.1203223.
*/

let oregon_Res = [11.21, 20.22, 29.28, 43.19, 57.73, 64.58, 86.05, 113.3, 135.3, 157.5, 179.4, 206.4, 228.0, 270.9, 315.2, 358.9, 402.9, 450.2, 522.5, 583.1, 671.8, 789.8, 891.0, 1013.0, 1197.0, 1300.0, 1390.0, 1669.0, 1994.0, 2227.0, 2554.0, 2868.0, 2903.0, 2926.0, 2955.0, 2991.0, 2997.0, 3047.0, 3080.0, 3264.0, 3980.0, 4835.0, 5959.0, 8162.0, 10900.0, 13650.0, 18990.0, 29430.0, 40850.0, 59220.0, 84760.0, 120000.0, 176000.0, 237700.0, 298200.0, 467800.0, 587500.0, 824200.0, 1050000.0];

let oregon_fd_smooth = [5.537, 3.492, 2.329, 1.523, 1.173, 0.9863, 0.7826, 0.5709, 0.4815, 0.4182, 0.3655, 0.3237, 0.2884, 0.2433, 0.2077, 0.1834, 0.1656, 0.1475, 0.1245, 0.1126, 0.09917, 0.08501, 0.07722, 0.06707, 0.0588, 0.05328, 0.04815, 0.04304, 0.03739, 0.03405, 0.03091, 0.02804, 0.03182, 0.03846, 0.03363, 0.04124, 0.035, 0.03875, 0.04285, 0.0426, 0.03995, 0.03797, 0.0361, 0.03364, 0.03088, 0.02903, 0.0267, 0.02386, 0.02086, 0.02, 0.01805, 0.01686, 0.01594, 0.01511, 0.01462, 0.01365, 0.01313, 0.01244, 0.01198];

export let oregon_smooth_data = [oregon_Res, oregon_fd_smooth];
/*Holds a tuple of experimental results from the smooth pipe flow experiments
presented in McKEON, B. J., C. J. SWANSON, M. V. ZAGAROLA, R. J. DONNELLY, and
A. J. SMITS. "Friction Factors for Smooth Pipe Flow." Journal of Fluid
Mechanics 511 (July 1, 2004): 41-44. doi:10.1017/S0022112004009796.
*/
export function friction_laminar(Re) {
    return 64./Re;
}


export function Blasius(Re) {
    return 0.3164/Math.sqrt(Math.sqrt(Re));
}


export function Colebrook({Re, eD, tol=null}) {
    if( tol === -1 ) {
        if( Re > 10.0 ) {
            return Clamond(Re, eD, false);
        } else {
            let tol = null;
        }
    } else if( tol === 0 ) {
        //from sympy import LambertW, Rational, Math.log, Math.sqrt
        //Re = Rational(Re)
        //eD_Re = Rational(eD)*Re
        //sub = 1/Rational('6.3001')*10**(1/Rational('9.287')*eD_Re)*Re*Re
        //lambert_term = LambertW(Math.log(Math.sqrt(10))*Math.sqrt(sub))
        //den = Math.log(10)*eD_Re - 18.574*lambert_term
        //return float(Math.log(10)**2*Rational('3.7')**2*Rational('2.51')**2/(den*den))

        // TODO: replace mpmath (for exact solutions) with JS equivalent
        // try {
        //     const { mpf, Math.log, mp, Math.sqrt as sqrtmp } = require( './mpmath' );
        //     from mpmath import lambertw as mp_lambertw;
        // } catch( e ) {
        //     throw new Error( 'ImportError','For exact solutions, the `mpmath` library is '
        //                       'required' );
        // }
        // mp.dps = 50;
        // Re = mpf(Re);
        // let eD_Re = mpf(eD)*Re;
        // let sub = 1/mpf('6.3001')*10**(1/mpf('9.287')*eD_Re)*Re*Re;
        // let lambert_term = mp_lambertw(Math.log(sqrtmp(10))*sqrtmp(sub));
        // let den = Math.log(10)*eD_Re - 18.574*lambert_term;
        // return float(Math.log(10)**2*mpf('3.7')**2*mpf('2.51')**2/(den*den));

        let eD_Re = eD*Re;
        let sub = 1/6.3001*10**(1/9.287*eD_Re)*Re*Re;
        let lambert_term = lambert_W0(Math.log(Math.sqrt(10))*Math.sqrt(sub));
        let den = Math.log(10)*eD_Re - 18.574*lambert_term;
        return float(Math.log(10)**2*3.7**2*2.51**2/(den*den));
    }
    if( tol === null ) {
        try {
            let eD_Re = eD*Re;
            // 9.287 = 2.51*3.7; 6.3001 = 2.51**2
            // xn = 1/6.3001 = 0.15872763924382155
            // 1/9.287 = 0.10767739851405189
            let sub = (1/6.3001)*10.0**((1/9.287)*eD_Re)*Re*Re;
            if( !isFinite(sub) ) {
                //  Can't continue, need numerical approach
                throw new Error( 'OverflowError' );
            }
            let lambert_term = float(lambertw(1.151292546497022950546806896454654633998870849609375*Math.sqrt(sub)).real);
            // Math.log(10) = 2.302585...; 2*2.51*3.7 = 18.574
            // 457.28... = Math.log(10)**2*3.7**2*2.51**2
            let den = Math.log(10)*eD_Re - 18.574*lambert_term;
            return (Math.log(10)**2*3.7**2*2.51**2)/(den*den);
        } catch( e ) /* OverflowError */ {
            /* pass */ 
        }
    // Either user-specified tolerance, or an error in the analytical solution
    }
    if( tol === null ) {
        tol = 1e-12;
    }
    let fd_guess;
    try {
        fd_guess = Clamond(Re, eD);
    } catch( e ) /* ValueError */ {
        fd_guess = Blasius(Re);
    }
    function err(x) {
        // Convert the newton search domain to always positive
        let f_12_inv = 1.0/Math.sqrt(Math.abs(x));
        // 0.27027027027027023 = 1/3.7
        return f_12_inv + 2.0*Math.log10(eD*0.27027027027027023 + 2.51/Re*f_12_inv);
    }
    let fd = Math.abs(secant(err, fd_guess, { xtol: tol }));
    return fd;
}


export function Clamond({Re, eD, fast=false}) {
    /*Calculates Darcy friction factor using a solution accurate to almost
    machine precision. Recommended very strongly. For details of the algorithm,
    see [1]_.

    Parameters
    ----------
    Re : float
        Reynolds number, [-]
    eD : float
        Relative roughness, [-]
    fast : bool, optional
        If true, performs only one iteration, which gives roughly half the
        number of decimals of accuracy, [-]

    Returns
    -------
    fd : float
        Darcy friction factor [-]

    Notes
    -----
    This is a highly optimized function, 4 times faster than the solution using
    the LambertW function, and faster than many other approximations which are
    much less accurate.

    The code used here is only slightly modified than that in [1]_, for further
    performance improvements.

    For 10 < Re < 1E12, and 0 < eD < 0.01, this equation has been confirmed
    numerically to provide a solution to the Colebrook equation accurate to an
    rtol of 1E-9 or better - the same level of accuracy as the analytical
    solution to the Colebrook equation due to floating point precision.

    Comparing this to the numerical solution of the Colebrook equation,
    identical values are given accurate to an rtol of 1E-9 for 10 < Re < 1E100,
    and 0 < eD < 1 and beyond.

    However, for values of Re under 10, different answers from the `Colebrook`
    equation appear and then quickly a ValueError is raised.

    Examples
    --------
    >>> Clamond(1E5, 1E-4)
    0.01851386607747165

    References
    ----------
    .. [1] Clamond, Didier. "Efficient Resolution of the Colebrook Equation."
       Industrial & Engineering Chemistry Research 48, no. 7 (April 1, 2009):
       3665-71. doi:10.1021/ie801626g.
       http://math.unice.fr/%7Edidierc/DidPublis/ICR_2009.pdf
    */
    let X1 = eD*Re*0.1239681863354175460160858261654858382699; // (Math.log(10)/18.574).evalf(40)
    let X2 = Math.log(Re) - 0.7793974884556819406441139701653776731705; // Math.log(Math.log(10)/5.02).evalf(40)
    let F = X2 - 0.2;
    let X1F = X1 + F;
    let X1F1 = 1. + X1F;

    let E = (Math.log(X1F) - 0.2)/(X1F1);
    F = F - (X1F1 + 0.5*E)*E*(X1F)/(X1F1 + E*(1. + (1.0/3.0)*E));

    if( !fast ) {
        X1F = X1 + F;
        X1F1 = 1. + X1F;
        E = (Math.log(X1F) + F - X2)/(X1F1);

        let b = (X1F1 + E*(1. + 1.0/3.0*E));
        F = b/(b*F -  ((X1F1 + 0.5*E)*E*(X1F)));
        return 1.325474527619599502640416597148504422899*(F*F); // ((0.5*Math.log(10))**2).evalf(40)
    }
    return 1.325474527619599502640416597148504422899/(F*F); // ((0.5*Math.log(10))**2).evalf(40)
}


export function Moody({Re, eD}) {
    return 4*(1.375E-3*(1 + (2E4*eD + 1E6/Re)**(1/3.)));
}


export function Alshul_1952({Re, eD}) {
    return 0.11*Math.sqrt(Math.sqrt(68/Re + eD));
}


export function Wood_1966({Re, eD}) {
    let A1 = 1.62*eD**0.134;
    return 0.094*eD**0.225 + 0.53*eD +88*eD**0.4*Re**-A1;
}


export function Churchill_1973({Re, eD}) {
    return (-2*Math.log10(eD/3.7 + (7./Re)**0.9))**-2;
}


export function Eck_1973({Re, eD}) {
    return (-2*Math.log10(eD/3.715 + 15/Re))**-2;
}


export function Jain_1976({Re, eD}) {
    let ff = (2.28-4*Math.log10(eD+(29.843/Re)**0.9))**-2;
    return 4*ff;
}


export function Swamee_Jain_1976({Re, eD}) {
    let ff = (-4*Math.log10((6.97/Re)**0.9 + eD/3.7))**-2;
    return 4*ff;
}


export function Churchill_1977({Re, eD}) {
    let A3 = (37530/Re)**16;
    let A2 = (2.457*Math.log((7./Re)**0.9 + 0.27*eD))**16;
    let ff = 2*((8/Re)**12 + 1/(A2+A3)**1.5)**(1/12.);
    return 4*ff;
}


export function Chen_1979({Re, eD}) {
    let A4 = eD**1.1098/2.8257 + (7.149/Re)**0.8981;
    let ff = (-4*Math.log10(eD/3.7065 - 5.0452/Re*Math.log10(A4)))**-2;
    return 4*ff;
}


export function Round_1980({Re, eD}) {
    let ff = (-3.6*Math.log10(Re/(0.135*Re*eD+6.5)))**-2;
    return 4*ff;
}


export function Shacham_1980({Re, eD}) {
    let ff = (-4*Math.log10(eD/3.7 - 5.02/Re*Math.log10(eD/3.7 + 14.5/Re)))**-2;
    return 4*ff;
}


export function Barr_1981({Re, eD}) {
    let fd = (-2*Math.log10(eD/3.7 + 4.518*Math.log10(Re/7.)/(Re*(1+Re**0.52/29*eD**0.7))))**-2;
    return fd;
}


export function Zigrang_Sylvester_1({Re, eD}) {
    let A5 = eD/3.7 + 13/Re;
    let ff = (-4*Math.log10(eD/3.7 - 5.02/Re*Math.log10(A5)))**-2;
    return 4*ff;
}


export function Zigrang_Sylvester_2({Re, eD}) {
    let A5 = eD/3.7 + 13/Re;
    let A6 = eD/3.7 - 5.02/Re*Math.log10(A5);
    let ff = (-4*Math.log10(eD/3.7 - 5.02/Re*Math.log10(A6)))**-2;
    return 4*ff;
}


export function Haaland({Re, eD}) {
    let ff = (-3.6*Math.log10(6.9/Re +(eD/3.7)**1.11))**-2;
    return 4*ff;
}


export function Serghides_1({Re, eD}) {
    let A = -2*Math.log10(eD/3.7 + 12/Re);
    let B = -2*Math.log10(eD/3.7 + 2.51*A/Re);
    let C = -2*Math.log10(eD/3.7 + 2.51*B/Re);
    return (A - (B-A)**2/(C-2*B + A))**-2;
}


export function Serghides_2({Re, eD}) {
    let A = -2*Math.log10(eD/3.7 + 12/Re);
    let B = -2*Math.log10(eD/3.7 + 2.51*A/Re);
    return (4.781 - (A - 4.781)**2/(B - 2*A + 4.781))**-2;
}


export function Tsal_1989({Re, eD}) {
    let A = 0.11*Math.sqrt(Math.sqrt(68/Re + eD));
    if( A >= 0.018 ) {
        return A;
    } else {
        return 0.0028 + 0.85*A;
    }


}
export function Manadilli_1997({Re, eD}) {
    return (-2*Math.log10(eD/3.7 + 95/Re**0.983 - 96.82/Re))**-2;
}


export function Romeo_2002({Re, eD}) {
    let fd = (-2*Math.log10(eD/3.7065-5.0272/Re*Math.log10(eD/3.827-4.567/Re*Math.log10((eD/7.7918)**0.9924+(5.3326/(208.815+Re))**0.9345))))**-2;
    return fd;
}


export function Sonnad_Goudar_2006({Re, eD}) {
    let S = 0.124*eD*Re + Math.log(0.4587*Re);
    return (.8686*Math.log(.4587*Re/S**(S/(S+1))))**-2;
}


export function Rao_Kumar_2007({Re, eD}) {
    let beta = 1 - 0.55*Math.exp(-0.33*(Math.log(Re/6.5))**2);
    return (2*Math.log10((2*eD)**-1/beta/((0.444+0.135*Re)/Re)))**-2;
}


export function Buzzelli_2008({Re, eD}) {
    let B1 = (.774*Math.log(Re)-1.41)/(1.0 + 1.32*Math.sqrt(eD));
    let B2 = eD/3.7*Re + 2.51*B1;
    return (B1- (B1+2*Math.log10(B2/Re))/(1+2.18/B2))**-2;
}


export function Avci_Karagoz_2009({Re, eD}) {
    return 6.4*(Math.log(Re) - Math.log(1 + 0.01*Re*eD*(1+10*Math.sqrt(eD))))**-2.4;
}


export function Papaevangelo_2010({Re, eD}) {
    return (0.2479-0.0000947*(7-Math.log(Re))**4)/(Math.log10(eD/3.615 + 7.366/Re**0.9142))**2;
}


export function Brkic_2011_1({Re, eD}) {
    let beta = Math.log(Re/(1.816*Math.log(1.1*Re/Math.log(1+1.1*Re))));
    return (-2*Math.log10(10**(-0.4343*beta)+eD/3.71))**-2;
}


export function Brkic_2011_2({Re, eD}) {
    let beta = Math.log(Re/(1.816*Math.log(1.1*Re/Math.log(1+1.1*Re))));
    return (-2*Math.log10(2.18*beta/Re + eD/3.71))**-2;
}


export function Fang_2011({Re, eD}) {
    return Math.log(0.234*eD**1.1007 - 60.525/Re**1.1105 + 56.291/Re**1.0712)**-2*1.613;
}


export function von_Karman(eD) {
    let x = Math.log10(eD/3.71);
    return 0.25/(x*x);
}


export function Prandtl_von_Karman_Nikuradse(Re) {
    // Good 1E150 to 1E-150
    let c1 = 1.151292546497022842008995727342182103801; // Math.log(10)/2
    let c2 = 1.325474527619599502640416597148504422899; // Math.log(10)**2/4
    return c2/float(lambertw((c1*Re)/2.51).real)**2;
}


// Values still in table at least to 2013
let Crane_fts_nominal_Ds = [.015, .02, .025, .032, .04, .05, .065, .08, .1, .125,
                        .15, .2, .25, .35, .4, .55, .6, .9];

let Crane_fts_Ds = [0.01576, 0.02096, 0.02664, 0.03508, 0.04094, 0.05248, 0.06268,
                0.07792, 0.10226, 0.1282, 0.154, 0.20274, 0.25446, 0.33334,
                0.381, 0.53994, 0.57504, 0.8759];

let Crane_fts = [.026, .024, .022, .021, .02, .019, .018, .017, .016, .015, .015,
             .014, .013, .013, .012, .012, .011, .011];
export function ft_Crane(D) {
    let fast = true;
    if( D < 1E-2 ) {
        fast = false;
    }
    return Clamond(7.5E6*D, 3.4126825352925e-5*D**-1.0112, fast);
}


let fmethods = {'Moody': [4000.0, 100000000.0, 0.0, 1.0],
 'Alshul_1952': [null, null, null, null],
 'Wood_1966': [4000.0, 50000000.0, 1e-05, 0.04],
 'Churchill_1973': [null, null, null, null],
 'Eck_1973': [null, null, null, null],
 'Jain_1976': [5000.0, 10000000.0, 4e-05, 0.05],
 'Swamee_Jain_1976': [5000.0, 100000000.0, 1e-06, 0.05],
 'Churchill_1977': [null, null, null, null],
 'Chen_1979': [4000.0, 400000000.0, 1e-07, 0.05],
 'Round_1980': [4000.0, 400000000.0, 0.0, 0.05],
 'Shacham_1980': [4000.0, 400000000.0, null, null],
 'Barr_1981': [null, null, null, null],
 'Zigrang_Sylvester_1': [4000.0, 100000000.0, 4e-05, 0.05],
 'Zigrang_Sylvester_2': [4000.0, 100000000.0, 4e-05, 0.05],
 'Haaland': [4000.0, 100000000.0, 1e-06, 0.05],
 'Serghides_1': [null, null, null, null],
 'Serghides_2': [null, null, null, null],
 'Tsal_1989': [4000.0, 100000000.0, 0.0, 0.05],
 'Manadilli_1997': [5245.0, 100000000.0, 0.0, 0.05],
 'Romeo_2002': [3000.0, 150000000.0, 0.0, 0.05],
 'Sonnad_Goudar_2006': [4000.0, 100000000.0, 1e-06, 0.05],
 'Rao_Kumar_2007': [null, null, null, null],
 'Buzzelli_2008': [null, null, null, null],
 'Avci_Karagoz_2009': [null, null, null, null],
 'Papaevangelo_2010': [10000.0, 10000000.0, 1e-05, 0.001],
 'Brkic_2011_1': [null, null, null, null],
 'Brkic_2011_2': [null, null, null, null],
 'Fang_2011': [3000.0, 100000000.0, 0.0, 0.05],
 'Clamond': [0, null, 0.0, null],
 'Colebrook': [0, null, 0.0, null]};
export function friction_factor_methods({Re, eD=0.0, check_ranges=true}) {
    if( check_ranges ) {
        if( Re < LAMINAR_TRANSITION_PIPE ) {
            return ['laminar'];
        }
        let methods = [];
        for( let n of fmethods ) {
            let item = fmethods[n];
            let [Re_min, Re_max, eD_min, eD_max] = item;
            if( Re_min !== null && Re < Re_min ) {
                continue;
            }
            if( Re_max !== null && Re > Re_max ) {
                continue;
            }
            if( eD_min !== null && eD < eD_min ) {
                continue;
            }
            if( eD_max !== null && eD > eD_max ) {
                continue;
            }
            methods.push(n);
        }
        return methods;
    } else {
        return Object.keys(fmethods).concat(['laminar']);
    }


}
export function friction_factor({Re, eD=0.0, Method='Clamond', Darcy=true}) {
    if( Method === null ) {
        let Method = 'Clamond';
    }
    let f;
    if( Re < LAMINAR_TRANSITION_PIPE || Method === 'laminar' ) {
        f = friction_laminar(Re);
    } else if( Method === "Clamond" ) {
        f = Clamond(Re, eD, false);
    } else if( Method === "Colebrook" ) {
        f = Colebrook(Re, eD);
    } else if( Method === "Moody" ) {
        f = Moody(Re, eD);
    } else if( Method === "Alshul_1952" ) {
        f = Alshul_1952(Re, eD);
    } else if( Method === "Wood_1966" ) {
        f = Wood_1966(Re, eD);
    } else if( Method === "Churchill_1973" ) {
        f = Churchill_1973(Re, eD);
    } else if( Method === "Eck_1973" ) {
        f = Eck_1973(Re, eD);
    } else if( Method === "Jain_1976" ) {
        f = Jain_1976(Re, eD);
    } else if( Method === "Swamee_Jain_1976" ) {
        f = Swamee_Jain_1976(Re, eD);
    } else if( Method === "Churchill_1977" ) {
        f = Churchill_1977(Re, eD);
    } else if( Method === "Chen_1979" ) {
        f = Chen_1979(Re, eD);
    } else if( Method === "Round_1980" ) {
        f = Round_1980(Re, eD);
    } else if( Method === "Shacham_1980" ) {
        f = Shacham_1980(Re, eD);
    } else if( Method === "Barr_1981" ) {
        f = Barr_1981(Re, eD);
    } else if( Method === "Zigrang_Sylvester_1" ) {
        f = Zigrang_Sylvester_1(Re, eD);
    } else if( Method === "Zigrang_Sylvester_2" ) {
        f = Zigrang_Sylvester_2(Re, eD);
    } else if( Method === "Haaland" ) {
        f = Haaland(Re, eD);
    } else if( Method === "Serghides_1" ) {
        f = Serghides_1(Re, eD);
    } else if( Method === "Serghides_2" ) {
        f = Serghides_2(Re, eD);
    } else if( Method === "Tsal_1989" ) {
        f = Tsal_1989(Re, eD);
    } else if( Method === "Manadilli_1997" ) {
        f = Manadilli_1997(Re, eD);
    } else if( Method === "Romeo_2002" ) {
        f = Romeo_2002(Re, eD);
    } else if( Method === "Sonnad_Goudar_2006" ) {
        f = Sonnad_Goudar_2006(Re, eD);
    } else if( Method === "Rao_Kumar_2007" ) {
        f = Rao_Kumar_2007(Re, eD);
    } else if( Method === "Buzzelli_2008" ) {
        f = Buzzelli_2008(Re, eD);
    } else if( Method === "Avci_Karagoz_2009" ) {
        f = Avci_Karagoz_2009(Re, eD);
    } else if( Method === "Papaevangelo_2010" ) {
        f = Papaevangelo_2010(Re, eD);
    } else if( Method === "Brkic_2011_1" ) {
        f = Brkic_2011_1(Re, eD);
    } else if( Method === "Brkic_2011_2" ) {
        f = Brkic_2011_2(Re, eD);
    } else if( Method === "Fang_2011" ) {
        f = Fang_2011(Re, eD);
    } else {
        throw new Error( 'ValueError',"Method not recognized" );
    }
    if( !Darcy ) {
        f *= 0.25;
    }
    return f;
}


export function helical_laminar_fd_White({Re, Di, Dc}) {
    let De = Dean( {Re: Re, Di: Di, D: Dc });
    let fd = friction_laminar(Re);
    if( De < 11.6 ) {
        return fd;
    }
    return fd/(1. - (1. - (11.6/De)**0.45)**(1./0.45)); // 1/.45 sometimes said to be 2.2
}


export function helical_laminar_fd_Mori_Nakayama({Re, Di, Dc}) {
    let De = Dean( {Re: Re, Di: Di, D: Dc });
    let fd = friction_laminar(Re);
    if( De < 42.328036 ) {
        return fd*1.405296;
    }
    return fd*(0.108*Math.sqrt(De))/(1. - 3.253*1.0/Math.sqrt(De));
}


export function helical_laminar_fd_Schmidt({Re, Di, Dc}) {
    let fd = friction_laminar(Re);
    let D_ratio = Di/Dc;
    return fd*(1. + 0.14*D_ratio**0.97*Re**(1. - 0.644*D_ratio**0.312));
}


export function helical_turbulent_fd_Srinivasan({Re, Di, Dc}) {
    let De = Dean( {Re: Re, Di: Di, D: Dc });
    return 0.336*De**-0.2;
}


export function helical_turbulent_fd_Schmidt({Re, Di, Dc, roughness=0}) {
    let fd = friction_factor( {Re: Re, eD: roughness/Di });
    if( Re < 2.2E4 ) {
        return fd*(1. + 2.88E4/Re*(Di/Dc)**0.62);
    } else {
        return fd*(1. + 0.0823*(1. + Di/Dc)*(Di/Dc)**0.53*Math.sqrt(Math.sqrt(Re)));
    }


}
export function helical_turbulent_fd_Mori_Nakayama({Re, Di, Dc}) {
    let term = (Re*(Di/Dc)**2)**-0.2;
    return 0.3*1.0/Math.sqrt(Dc/Di)*term*(1. + 0.112*term);
}


export function helical_turbulent_fd_Prasad({Re, Di, Dc,roughness=0}) {
    let fd = friction_factor( {Re: Re, eD: roughness/Di });
    return fd*(1. + 0.18*Math.sqrt(Math.sqrt(Re*(Di/Dc)**2)));
}


export function helical_turbulent_fd_Czop (Re, Di, Dc) {
    let De = Dean( {Re: Re, Di: Di, D: Dc });
    return 0.096*De**-0.1517;
}


export function helical_turbulent_fd_Guo({Re, Di, Dc}) {
    return 0.638*Re**-0.15*(Di/Dc)**0.51;
}


export function helical_turbulent_fd_Ju({Re, Di, Dc,roughness=0.0}) {
    let fd = friction_factor( {Re: Re, eD: roughness/Di });
    return fd*(1. + 0.11*Re**0.23*(Di/Dc)**0.14);
}


export function helical_turbulent_fd_Mandal_Nigam({Re, Di, Dc, roughness=0}) {
    let De = Dean( {Re: Re, Di: Di, D: Dc });
    let fd = friction_factor( {Re: Re, eD: roughness/Di });
    return fd*(1. + 0.03*De**0.27);
}


export function helical_transition_Re_Seth_Stahel({Di, Dc}) {
    return 1900.*(1. + 8.*Math.sqrt(Di/Dc));
}


export function helical_transition_Re_Ito({Di, Dc}) {
    return 2E4*(Di/Dc)**0.32;
}


export function helical_transition_Re_Kubair_Kuloor({Di, Dc}) {
    return 1.273E4*(Di/Dc)**0.2;
}


export function helical_transition_Re_Kutateladze_Borishanskii({Di, Dc}) {
    return 2300. + 1.05E4*(Di/Dc)**0.4;
}


export function helical_transition_Re_Schmidt({Di, Dc}) {
    return 2300.*(1. + 8.6*(Di/Dc)**0.45);
}


export function helical_transition_Re_Srinivasan({Di, Dc}) {
    return 2100.*(1. + 12.*Math.sqrt(Di/Dc));
}


let curved_friction_laminar_methods = {'White': helical_laminar_fd_White,
                           'Mori Nakayama laminar': helical_laminar_fd_Mori_Nakayama,
                           'Schmidt laminar': helical_laminar_fd_Schmidt};

// Format: 'key': (correlation, supports_roughness)
let curved_friction_turbulent_methods = {'Schmidt turbulent': (helical_turbulent_fd_Schmidt, true),
                                     'Mori Nakayama turbulent': (helical_turbulent_fd_Mori_Nakayama, false),
                                     'Prasad': (helical_turbulent_fd_Prasad, true),
                                     'Czop': (helical_turbulent_fd_Czop, false),
                                     'Guo': (helical_turbulent_fd_Guo, false),
                                     'Ju': (helical_turbulent_fd_Ju, true),
                                     'Mandel Nigam': (helical_turbulent_fd_Mandal_Nigam, true),
                                     'Srinivasan turbulent': (helical_turbulent_fd_Srinivasan, false)};

let curved_friction_transition_methods = {'Seth Stahel': helical_transition_Re_Seth_Stahel,
                                      'Ito': helical_transition_Re_Ito,
                                      'Kubair Kuloor': helical_transition_Re_Kubair_Kuloor,
                                      'Kutateladze Borishanskii': helical_transition_Re_Kutateladze_Borishanskii,
                                      'Schmidt': helical_transition_Re_Schmidt,
                                      'Srinivasan': helical_transition_Re_Srinivasan};

let _bad_curved_transition_method = `Invalid method specified for transition Reynolds number; valid methods are ${Object.keys(curved_friction_transition_methods)}`;

let curved_friction_turbulent_methods_list = ['Schmidt turbulent', 'Mori Nakayama turbulent', 'Prasad', 'Czop', 'Guo', 'Ju', 'Mandel Nigam', 'Srinivasan turbulent'];
let curved_friction_laminar_methods_list = ['White', 'Mori Nakayama laminar', 'Schmidt laminar'];
export function helical_Re_crit({Di, Dc, Method='Schmidt'}) {
    let Re_crit;
    if( Method === 'Schmidt' ) {
        Re_crit = helical_transition_Re_Schmidt(Di, Dc);
    } else if( Method === 'Seth Stahel' ) {
        Re_crit = helical_transition_Re_Seth_Stahel(Di, Dc);
    } else if( Method === 'Ito' ) {
        Re_crit = helical_transition_Re_Ito(Di, Dc);
    } else if( Method === 'Kubair Kuloor' ) {
        Re_crit = helical_transition_Re_Kubair_Kuloor(Di, Dc);
    } else if( Method === 'Kutateladze Borishanskii' ) {
        Re_crit = helical_transition_Re_Kutateladze_Borishanskii(Di, Dc);
    } else if( Method === 'Srinivasan' ) {
        Re_crit = helical_transition_Re_Srinivasan(Di, Dc);
    } else {
        throw new Error( 'ValueError',_bad_curved_transition_method );
    }
    return Re_crit;
}


export function friction_factor_curved_methods({Re, Di, Dc, roughness=0.0,
                                   check_ranges=true}) {
    let Re_crit = helical_Re_crit( {Di: Di, Dc: Dc, Method: 'Schmidt' });
    let turbulent = Re < Re_crit ? false : true;
    if( check_ranges ) {
        if( turbulent ) {
            return curved_friction_turbulent_methods_list;
        } else {
            return curved_friction_laminar_methods_list;
        }
    } else {
        return curved_friction_turbulent_methods_list.concat(curved_friction_laminar_methods_list);
    }


}
export function friction_factor_curved({Re, Di, Dc, roughness=0.0, Method=null,
                           Rec_method='Schmidt',
                           laminar_method='Schmidt laminar',
                           turbulent_method='Schmidt turbulent', Darcy=true}) {
    let Re_crit = helical_Re_crit( {Di: Di, Dc: Dc, Method: Rec_method });
    let turbulent = Re < Re_crit ? false : true;

    let Method2;
    if( Method === null ) {
        Method2 = turbulent ? turbulent_method : laminar_method;
    } else {
        Method2 = Method; // Use second variable to keep numba types happy
    }
    // Laminar
    let f;
    if( Method2 === 'Schmidt laminar' ) {
        f = helical_laminar_fd_Schmidt(Re, Di, Dc);
    } else if( Method2 === 'White' ) {
        f = helical_laminar_fd_White(Re, Di, Dc);
    } else if( Method2 === 'Mori Nakayama laminar' ) {
        f = helical_laminar_fd_Mori_Nakayama(Re, Di, Dc);
    }    // Turbulent with roughness support
    else if( Method2 === 'Schmidt turbulent' ) {
        f = helical_turbulent_fd_Schmidt(Re, Di, Dc, roughness);
    } else if( Method2 === 'Prasad' ) {
        f = helical_turbulent_fd_Prasad(Re, Di, Dc, roughness);
    } else if( Method2 === 'Ju' ) {
        f = helical_turbulent_fd_Ju(Re, Di, Dc, roughness);
    } else if( Method2 === 'Mandel Nigam' ) {
        f = helical_turbulent_fd_Mandal_Nigam(Re, Di, Dc, roughness);
    }    // Turbulent without roughness support
    else if( Method2 === 'Mori Nakayama turbulent' ) {
        f = helical_turbulent_fd_Mori_Nakayama(Re, Di, Dc);
    } else if( Method2 === 'Czop' ) {
        f = helical_turbulent_fd_Czop(Re, Di, Dc);
    } else if( Method2 === 'Guo' ) {
        f = helical_turbulent_fd_Guo(Re, Di, Dc);
    } else if( Method2 === 'Srinivasan turbulent' ) {
        f = helical_turbulent_fd_Srinivasan(Re, Di, Dc);
    } else {
        throw new Error( 'ValueError','Invalid method for friction factor calculation' );
    }
    if( !Darcy ) {
        f *= 0.25;
    }
    return f;
}

////// Plate heat exchanger single phase

export function friction_plate_Martin_1999({Re, plate_enlargement_factor}) {
    let phi = plate_enlargement_factor;

    let f0, f1;
    if( Re < 2000. ) {
        f0 = 16./Re;
        f1 = 149./Re + 0.9625;
    } else {
        f0 = (1.56*Math.log(Re) - 3.0)**-2;
        f1 = 9.75*Re**-0.289;
    }

    let rhs = Math.cos(phi)*1.0/Math.sqrt(0.045*Math.tan(phi) + 0.09*Math.sin(phi) + f0/Math.cos(phi));
    rhs += (1. - Math.cos(phi))*1.0/Math.sqrt(3.8*f1);
    let ff = rhs**-2.;
    return ff*4.0;
}


export function friction_plate_Martin_VDI({Re, plate_enlargement_factor}) {
    let phi = plate_enlargement_factor;

    let f0, f1;
    if( Re < 2000. ) {
        f0 = 64./Re;
        f1 = 597./Re + 3.85;
    } else {
        f0 = (1.8*Math.log10(Re) - 1.5)**-2;
        f1 = 39.*Re**-0.289;
    }

    let [a, b, c] = [3.8, 0.28, 0.36];

    let rhs = Math.cos(phi)*1.0/Math.sqrt(b*Math.tan(phi) + c*Math.sin(phi) + f0/Math.cos(phi));
    rhs += (1. - Math.cos(phi))*1.0/Math.sqrt(a*f1);
    return rhs**-2.0;
}

let Kumar_beta_list = [30.0, 45.0, 50.0, 60.0, 65.0];

let Kumar_fd_Res = [[10.0, 100.0], [15.0, 300.0], [20.0, 300.0], [40.0, 400.0], [50.0, 500.0]];

let Kumar_C2s = [[50.0, 19.40, 2.990], [47.0, 18.29, 1.441], [34.0, 11.25, 0.772], [24.0, 3.24, 0.760], [24.0, 2.80, 0.639]];

// Is the second in the first row 0.589 (paper) or 0.598 (PHEWorks)
// Believed to be the values from the paper, where this graph was
// curve fit as the original did not contain and coefficients only a plot
let Kumar_Ps = [[1.0, 0.589, 0.183], [1.0, 0.652, 0.206], [1.0, 0.631, 0.161], [1.0, 0.457, 0.215], [1.0, 0.451, 0.213]];
export function friction_plate_Kumar({Re, chevron_angle}) {
    let beta_list_len = Kumar_beta_list.length;

    let C2_options, p_options, Re_ranges;
    for( let i; i<beta_list_len; i++ ) {
        if( chevron_angle <= Kumar_beta_list[i] ) {
            [C2_options, p_options, Re_ranges] = [Kumar_C2s[i], Kumar_Ps[i], Kumar_fd_Res[i]];
            break;
        } else if( i === beta_list_len-1 ) {
            [C2_options, p_options, Re_ranges] = [Kumar_C2s[-1], Kumar_Ps[-1], Kumar_fd_Res[-1]];
        }
    }
    let Re_len = Re_ranges.length;

    let C2, p;
    for( let j; j<Re_len; j++ ) {
        if( Re <= Re_ranges[j] ) {
            [C2, p] = [C2_options[j], p_options[j]];
            break;
        } else if( j === Re_len-1 ) {
            [C2, p] = [C2_options[-1], p_options[-1]];
        }

    // Originally in Fanning friction factor basis
    }
    return 4.0*C2*Re**-p;
}


export function friction_plate_Muley_Manglik({Re, chevron_angle, plate_enlargement_factor}) {
    let [beta, phi] = [chevron_angle, plate_enlargement_factor];
    // Beta is indeed chevron angle; with respect to angle of mvoement
    // Still might be worth another check
    let t1 = (2.917 - 0.1277*beta + 2.016E-3*beta**2);
    let t2 = (5.474 - 19.02*phi + 18.93*phi**2 - 5.341*phi**3);
    let t3 = -(0.2 + 0.0577*Math.sin(Math.PI*beta/45. + 2.1));
    // Equation returns fanning friction factor
    return 4*t1*t2*Re**t3;
}


// Data from the Handbook of Hydraulic Resistance, 4E, in format (min, max, avg)
//  roughness in m; may have one, two, or three of the values.
let seamless_other_metals = {'Commercially smooth': (1.5E-6, 1.0E-5, null)};

let seamless_steel = {'New and unused': (2.0E-5, 1.0E-4, null),
    'Cleaned, following years of use': (null, 4.0E-5, null),
    'Bituminized': (null, 4.0E-5, null),
    'Heating systems piping; either superheated steam pipes, or just water pipes of systems with deaerators and chemical treatment':
    (null, null, 1.0E-4),
    'Following one year as a gas pipeline': (null, null, 1.2E-4),
    'Following multiple year as a gas pipeline': (4.0E-5, 2.0E-4, null),
    'Casings in gas wells, different conditions, several years of use':
    (6.0E-5, 2.2E-4, null),
    'Heating systems, saturated steam ducts or water pipes (with minor water leakage < 0.5%, and balance water deaerated)':
    (null, null, 2.0E-4),
    'Water heating system pipelines, any source': (null, null, 2.0E-4),
    'Oil pipelines, intermediate operating conditions ': (null, null, 2.0E-4),
    'Corroded, moderately ': (null, null, 4.0E-4),
    'Scale, small depositions only ': (null, null, 4.0E-4),
    'Condensate pipes in open systems or periodically operated steam pipelines':
    (null, null, 5.0E-4),
    'Compressed air piping': (null, null, 8.0E-4),
    'Following multiple years of operation, generally corroded or with small amounts of scale':
    (1.5E-4, 1.0E-3, null),
    'Water heating piping without deaeration but with chemical treatment of water; leakage up to 3%; or condensate piping operated periodically':
    (null, null, 1.0E-3),
    'Used water piping': (1.2E-3, 1.5E-3, null),
    'Poor condition': (5.0E-3, null, null)};

let welded_steel = {'Good condition': (4.0E-5, 1.0E-4, null),
    'New and covered with bitumen': (null, null, 5.0E-5),
    'Used and covered with partially dissolved bitumen; corroded':
    (null, null, 1.0E-4),
    'Used, suffering general corrosion': (null, null, 1.5E-4),
    'Surface looks like new, 10 mm lacquer inside, even joints':
    (3.0E-4, 4.0E-4, null),
    'Used Gas mains': (null, null, 5.0E-4),
    'Double or simple transverse riveted joints; with or without lacquer; without corrosion':
    (6.0E-4, 7.0E-4, null),
    'Lacquered inside but rusted': (9.5E-4, 1.0E-3, null),
    'Gas mains, many years of use, with layered deposits': (null, null, 1.1E-3),
    'Non-corroded and with double transverse riveted joints':
    (1.2E-3, 1.5E-3, null),
    'Small deposits': (null, null, 1.5E-3),
    'Heavily corroded and with  double transverse riveted joints':
    (null, null, 2.0E-3),
    'Appreciable deposits': (2.0E-3, 4.0E-3, null),
    'Gas mains, many years of use, deposits of resin/naphthalene':
        (null, null, 2.4E-3),
    'Poor condition': (5.0E-3, null, null)};

let riveted_steel = {
    'Riveted laterally and longitudinally with one line; lacquered on the inside':
    (3.0E-4, 4.0E-4, null),
    'Riveted laterally and longitudinally with two lines; with or without lacquer on the inside and without corrosion':
    (6.0E-4, 7.0E-4, null),
    'Riveted laterally with one line and longitudinally with two lines; thickly lacquered or torred on the inside':
    (1.2E-3, 1.4E-3, null),
    'Riveted longitudinally with six lines, after extensive use':
    (null, null, 2.0E-3),
    'Riveted laterally with four line and longitudinally with six lines; overlapping joints inside':
    (null, null, 4.0E-3),
    'Extremely poor surface; overlapping and uneven joints':
    (5.0E-3, null, null)};

let roofing_metal = {'Oiled': (1.5E-4, 1.1E-3, null),
                 'Not Oiled': (2.0E-5, 4.0E-5, null)};

let galvanized_steel_tube = {'Bright galvanization; new': (7.0E-5, 1.0E-4, null),
                         'Ordinary galvanization': (1.0E-4, 1.5E-4, null)};

let galvanized_steel_sheet = {'New': (null, null, 1.5E-4),
                          'Used previously for water': (null, null, 1.8E-4)};

let steel = {'Glass enamel coat': (1.0E-6, 1.0E-5, null),
         'New': (2.5E-4, 1.0E-3, null)};

let cast_iron = {'New, bituminized': (1.0E-4, 1.5E-4, null),
             'Coated with asphalt': (1.2E-4, 3.0E-4, null),
             'Used water pipelines': (null, null, 1.4E-3),
             'Used and corroded': (1.0E-3, 1.5E-3, null),
             'Deposits visible': (1.0E-3, 1.5E-3, null),
             'Substantial deposits': (2.0E-3, 4.0E-3, null),
             'Cleaned after extensive use': (3.0E-4, 1.5E-3, null),
             'Severely corroded': (null, 3.0E-3, null)};

let water_conduit_steel = {
    'New, clean, seamless (without joints), well fitted':
    (1.5E-5, 4.0E-5, null),
    'New, clean, welded lengthwise and well fitted': (1.2E-5, 3.0E-5, null),
    'New, clean, welded lengthwise and well fitted, with transverse welded joints':
    (8.0E-5, 1.7E-4, null),
    'New, clean, coated, bituminized when manufactured': (1.4E-5, 1.8E-5, null),
    'New, clean, coated, bituminized when manufactured, with transverse welded joints':
    (2.0E-4, 6.0E-4, null),
    'New, clean, coated, galvanized': (1.0E-4, 2.0E-4, null),
    'New, clean, coated, roughly galvanized': (4.0E-4, 7.0E-4, null),
    'New, clean, coated, bituminized, curved': (1.0E-4, 1.4E-3, null),
    'Used, clean, slight corrosion': (1.0E-4, 3.0E-4, null),
    'Used, clean, moderate corrosion or slight deposits':
    (3.0E-4, 7.0E-4, null),
    'Used, clean, severe corrosion': (8.0E-4, 1.5E-3, null),
    'Used, clean, previously cleaned of either deposits or rust':
        (1.5E-4, 2.0E-4, null)};

let water_conduit_steel_used = {
    'Used, all welded, <2 years use, no deposits': (1.2E-4, 2.4E-4, null),
    'Used, all welded, <20 years use, no deposits': (6.0E-4, 5.0E-3, null),
    'Used, iron-bacterial corrosion': (3.0E-3, 4.0E-3, null),
    'Used, heavy corrosion, or with incrustation (deposit 1.5 - 9 mm deep)':
    (3.0E-3, 5.0E-3, null),
    'Used, heavy corrosion, or with incrustation (deposit 3 - 25 mm deep)':
    (6.0E-3, 6.5E-3, null),
    'Used, inside coating, bituminized, < 2 years use': (1.0E-4, 3.5E-4, null)};

let steels = {'Seamless tubes made from brass, copper, lead, aluminum':
          seamless_other_metals,
          'Seamless steel tubes': seamless_steel,
          'Welded steel tubes': welded_steel,
          'Riveted steel tubes': riveted_steel,
          'Roofing steel sheets': roofing_metal,
          'Galzanized steel tubes': galvanized_steel_tube,
          'Galzanized sheet steel': galvanized_steel_sheet,
          'Steel tubes': steel,
          'Cast-iron tubes': cast_iron,
          'Steel water conduits in generating stations': water_conduit_steel,
          'Used steel water conduits in generating stations':
          water_conduit_steel_used};


let concrete_water_conduits = {
    'New and finished with plater; excellent manufacture (joints aligned, prime coated and smoothed)':
    (5.0E-5, 1.5E-4, null),
    'Used and corroded; with a wavy surface and wood framework':
    (1.0E-3, 4.0E-3, null),
    'Old, poor fitting and manufacture; with an overgrown surface and deposits of sand and gravel':
    (1.0E-3, 4.0E-3, null),
    'Very old; damaged surface, very overgrown': (5.0E-3, null, null),
    'Water conduit, finished with smoothed plaster': (5.0E-3, null, null),
    'New, very well manufactured, hand smoothed, prime-coated joints':
    (1.0E-4, 2.0E-4, null),
    'Hand-smoothed cement finish and smoothed joints': (1.5E-4, 3.5E-4, null),
    'Used, no deposits, moderately smooth, steel or wooden casing, joints prime coated but not smoothed':
    (3.0E-4, 6.0E-4, null),
    'Used, prefabricated monoliths, cement plaster (wood floated), rough joints':
    (5.0E-4, 1.0E-3, null),
    'Conduits for water, sprayed surface of concrete': (5.0E-4, 1.0E-3, null),
    'Smoothed air-placed, either sprayed concrete or concrete on more concrete':
    (null, null, 5.0E-4),
    'Brushed air-placed, either sprayed concrete or concrete on more concrete':
    (null, null, 2.3E-3),
    'Non-smoothed air-placed, either sprayed concrete or concrete on more concrete':
    (3.0E-3, 6.0E-3, null),
    'Smoothed air-placed, either sprayed concrete or concrete on more concrete':
    (6.0E-3, 1.7E-2, null)};

let concrete_reinforced_tubes = {'New': (2.5E-4, 3.4E-4, null),
                             'Nonprocessed': (2.5E-3, null, null)};

let asbestos_cement = {'New': (5.0E-5, 1.0E-4, null),
                   'Average': (6.0E-4, null, null)};

let cement_tubes = {'Smoothed': (3.0E-4, 8.0E-4, null),
                'Non processed': (1.0E-3, 2.0E-3, null),
                'Joints, non smoothed': (1.9E-3, 6.4E-3, null)};

let cement_mortar_channels = {
    'Plaster, cement, smoothed joints and protrusions, and a casing':
    (5.0E-5, 2.2E-4, null),
    'Steel trowled': (null, null, 5.0E-4)};

let cement_other = {'Plaster over a screen': (1.0E-2, 1.5E-2, null),
                'Salt-glazed ceramic': (null, null, 1.4E-3),
                'Slag-concrete': (null, null, 1.5E-3),
                'Slag and alabaster-filling': (1.0E-3, 1.5E-3, null)};

let concretes = {'Concrete water conduits, no finish': concrete_water_conduits,
             'Reinforced concrete tubes': concrete_reinforced_tubes,
             'Asbestos cement tubes': asbestos_cement,
             'Cement tubes': cement_tubes,
             'Cement-mortar plaster channels': cement_mortar_channels,
             'Other': cement_other};


let wood_tube = {'Boards, thoroughly dressed': (null, null, 1.5E-4),
             'Boards, well dressed': (null, null, 3.0E-4),
             'Boards, undressed but fitted': (null, null, 7.0E-4),
             'Boards, undressed': (null, null, 1.0E-3),
             'Staved': (null, null, 6.0E-4)};

let plywood_tube = {'Birch plywood, transverse grain, good quality':
                (null, null, 1.2E-4),
                'Birch plywood, longitudal grain, good quality':
                (3.0E-5, 5.0E-5, null)};

let glass_tube = {'Glass': (1.5E-6, 1.0E-5, null)};

let wood_plywood_glass = {'Wood tubes': wood_tube,
                      'Plywood tubes': plywood_tube,
                      'Glass tubes': glass_tube};


let rock_channels = {'Blast-hewed, little jointing': (1.0E-1, 1.4E-1, null),
                 'Blast-hewed, substantial jointing': (1.3E-1, 5.0E-1, null),
                 'Roughly cut or very uneven surface': (5.0E-1, 1.5E+0, null)};

let unlined_tunnels = {'Rocks, gneiss, diameter 3-13.5 m': (3.0E-1, 7.0E-1, null),
                   'Rocks, granite, diameter 3-9 m': (2.0E-1, 7.0E-1, null),
                   'Shale, diameter, diameter 9-12 m': (2.5E-1, 6.5E-1, null),
                   'Shale, quartz, quartzile, diameter 7-10 m':
                   (2.0E-1, 6.0E-1, null),
                   'Shale, sedimentary, diameter 4-7 m': (null, null, 4.0E-1),
                   'Shale, nephrite bearing, diameter 3-8 m':
                   (null, null, 2.0E-1)};

let tunnels = {'Rough channels in rock': rock_channels,
           'Unlined tunnels': unlined_tunnels};


// Roughness, in m
export let _roughness = {'Brass': .00000152, 'Lead': .00000152, 'Glass': .00000152,
'Steel': .00000152, 'Asphalted cast iron': .000122, 'Galvanized iron': .000152,
'Cast iron': .000259, 'Wood stave': .000183, 'Rough wood stave': .000914,
'Concrete': .000305, 'Rough concrete': .00305, 'Riveted steel': .000914,
'Rough riveted steel': .00914};


// Create a more friendly data structure

/*Holds a dict of tuples in format (min, max, average) roughness values in
meters from the source
Idelʹchik, I. E, and A. S Ginevskiĭ. Handbook of Hydraulic
Resistance. Redding, CT: Begell House, 2007.
*/
export let HHR_roughness = {};


export let HHR_roughness_dicts = [tunnels, wood_plywood_glass, concretes, steels];
export let HHR_roughness_categories = {};
for (var i in HHR_roughness_dicts){
    updateObj(HHR_roughness_categories, HHR_roughness_categories[i]);
}
for (var key in HHR_roughness_dicts)
    {
    let d = HHR_roughness_dicts[key];
    for (var k in d){
            let v = d[k];
            for (var name in v)
                {
                    let values = v[name];
                    HHR_roughness[String(k)+', ' + name] = values;
                }
        }
    }

// For searching only
let _all_roughness = JSON.parse(JSON.stringify(HHR_roughness));
updateObj(_all_roughness, _roughness);

// Format : ID: (avg_roughness, coef A (inches), coef B (inches))
export let _Farshad_roughness = {'Plastic coated': (5E-6, 0.0002, -1.0098),
                      'Carbon steel, honed bare': (12.5E-6, 0.0005, -1.0101),
                      'Cr13, electropolished bare': (30E-6, 0.0012, -1.0086),
                      'Cement lining': (33E-6, 0.0014, -1.0105),
                      'Carbon steel, bare': (36E-6, 0.0014, -1.0112),
                      'Fiberglass lining': (38E-6, 0.0016, -1.0086),
                      'Cr13, bare': (55E-6, 0.0021, -1.0055)  };

let _Farshad_roughness_keys = Object.keys(_Farshad_roughness);
let _Farshad_roughness_values = Object.values(_Farshad_roughness);
// try {
//     if(IS_NUMBA) // type: ignore
//         {
//         }
//     }
// catch(e) {
//     /* pass */
// }

export function roughness_Farshad({ID=null, D=null, coeffs=null}) {
    let A, B;
    // Case 1, coeffs given; only run if ID is not given.
    if( ID === null && coeffs !== null ) {
        [A, B] = coeffs;
        return A*(D/inch)**(B + 1.0)*inch;
    }
    let dat;
    if( ID in _Farshad_roughness ) { // numba: delete
        dat = _Farshad_roughness[ID]; // numba: delete
    }
    if( D === null ) {
        return dat[0];
    } else {
        A, B = dat[1], dat[2];
        return A*(D/inch)**(B+1)*inch;
    }


}
let roughness_clean_names = Object.keys(_roughness);
updateObj(roughness_clean_names, Object.keys(_Farshad_roughness));
export function nearest_material_roughness({name, clean=null}) {
    let d;
    if( clean === null ) {
        d = Object.keys(_all_roughness);
    } else {
        if( clean ) {
            d = roughness_clean_names;
        } else {
            d = Object.keys(HHR_roughness);
        }
    }
    return fuzzy_match(name, d);
}


export function material_roughness({ID, D=null, optimism=null}) {
    if( ID in _Farshad_roughness ) {
        return roughness_Farshad(ID, D);
    } else if( ID in _roughness ) {
        return _roughness[ID];
    } else if( ID in HHR_roughness ) {
        let [minimum, maximum, avg] = HHR_roughness[ID];
        if( optimism === null ) {
            return avg ? avg : (maximum ? maximum : minimum);
        } else if( Object.is( optimism, true ) ) {
            return minimum ? minimum : (avg ? avg : maximum);
    } else {
            return maximum ? maximum : (avg ? avg : minimum);
        }
    } else {
        return material_roughness(nearest_material_roughness(ID, { clean: false }), {
                                  D: D, optimism: optimism });
    }

}
export function transmission_factor({fd=null, F=null}) {
    if( fd !== null ) {
        return 2./Math.sqrt(fd);
    } else if( F !== null ) {
        return 4./(F*F);
    } else {
        throw new Error( 'ValueError','Either Darcy friction factor or transmission factor is needed' );
    }


}
export function one_phase_dP({m, rho, mu, D, roughness=0.0, L=1.0, Method=null}) {
    let D2 = D*D;
    let V = m/(0.25*Math.PI*D2*rho);
    let Re = Reynolds( {V: V, rho: rho, mu: mu, D: D });
    let fd = friction_factor( {Re: Re, eD: roughness/D, Method: Method });
    let dP = fd*L/D*(0.5*rho*V*V);
    return dP;
}


export function one_phase_dP_acceleration({m, D, rho_o, rho_i}) {
    let G = 4.0*m/(Math.PI*D*D);
    return G*G*(1.0/rho_o - 1.0/rho_i);
}


export function one_phase_dP_dz_acceleration({m, D, rho, dv_dP, dP_dL, dA_dL}) {
    let A = 0.25*Math.PI*D*D;
    let G = m/A;
    return -G*G*(dP_dL*dv_dP - dA_dL/(rho*A));
}


export function one_phase_dP_gravitational({angle, rho, L=1.0, g=g}) {
    angle = radians(angle);
    return L*g*Math.sin(angle)*rho;
}


