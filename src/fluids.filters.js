import { radians } from './fluids.helpers.js' ;
import { interp, implementation_optimize_tck, splev } from './fluids.numerics_init.js' ;

let __all__ = ['round_edge_screen', 'round_edge_open_mesh', 'square_edge_screen', 'square_edge_grill', 'round_edge_grill'];

let round_Res = [20.0, 30.0, 40.0, 60.0, 80.0, 100.0, 200.0, 400.0];
let round_betas = [1.3, 1.1, 0.95, 0.83, 0.75, 0.7, 0.6, 0.52];
let round_thetas = [0.0, 10.0, 20.0, 30.0, 40.0, 50.0, 60.0, 70.0, 80.0, 85.0];
let round_gammas = [1.0, 0.97, 0.88, 0.75, 0.59, 0.45, 0.3, 0.23, 0.15, 0.09];
let square_alphas = [0.0015625, 0.003125, 0.00625, 0.0125, 0.025, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 1.];
let square_Ks = [1024000., 256000, 64000, 16000, 4000, 1000., 250., 85., 52., 30., 17., 11., 7.7, 5.5, 3.8, 2.8, 2, 1.5, 1.1, 0.78, 0.53, 0.35, 0.08, 0.];
let grills_rounded_alphas = [0.3, 0.4, 0.5, 0.6, 0.7];
let grills_rounded_Ks = [2.0, 1.0, 0.6, 0.4, 0.2];
let grills_rounded_tck = implementation_optimize_tck([[0.3, 0.3, 0.3, 0.45, 0.55, 0.7, 0.7, 0.7], [2.0, 1.0014285714285716, 0.5799999999999998, 0.3585714285714287, 0.2, 0.0, 0.0, 0.0], 2]);
export function round_edge_screen({alpha, Re, angle=null}) {
    let beta = interp(Re, round_Res, round_betas);
    let alpha2 = alpha*alpha;
    let K = beta*(1.0 - alpha2)/alpha2;
    if( angle !== null ) {
        if( angle <= 45.0 ) {
            let v = Math.cos(radians(angle));
            K *= v*v;
        } else {
            K *= interp(angle, round_thetas, round_gammas);
        }
    }
    return K;
}


export function round_edge_open_mesh({alpha, subtype='diamond pattern wire', angle=0.0}) {
    let one_m_alpha = (1.0-alpha);
    let K;
    if( subtype === 'round bar screen' ) { K = 0.95 + 0.2*one_m_alpha; }
    else if( subtype === 'diamond pattern wire' ) { K = 0.67 + 1.3*one_m_alpha; }
    else if( subtype === 'knotted net' ) { K = 0.70 + 4.9*one_m_alpha; }
    else if( subtype === 'knotless net' ) { K = 0.72 + 2.1*one_m_alpha; }
    else { throw new Error( 'ValueError - Subtype not recognized' ); }
    K *= one_m_alpha;
    if( angle !== null ) {
        if( angle < 45.0 ) { K *= Math.cos(radians(angle))**2.0; }
        else { K *= interp(angle, round_thetas, round_gammas); }
    }
    return K;
}


export function square_edge_screen({alpha}) {
    return interp(alpha, square_alphas, square_Ks);
}


export function square_edge_grill({alpha, l=null, Dh=null, fd=null}) {
    let x0 = 0.5*(1.0 - alpha);
    let alpha2 = alpha*alpha;
    x0 += (1.0 - alpha2);
    if( Dh !== null && l !== null && fd !== null && l > 50.0*Dh ) {
        x0 += fd*l/Dh;
    }
    return x0/alpha2;
}


export function round_edge_grill({alpha, l=null, Dh=null, fd=null}) {
    let t1 = splev(alpha, grills_rounded_tck);
    if( Dh && l && fd && l > 50.0*Dh ) {
        return t1 + fd*l/Dh;
    } else {
        return t1;
    }


}
