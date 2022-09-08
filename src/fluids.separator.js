import { g, foot, psi } from './fluids.constants.js' ;
import { splev, implementation_optimize_tck } from './fluids.numerics_init.js' ;

let __all__ = ['v_Sounders_Brown', 'K_separator_Watkins', 'K_separator_demister_York', 'K_Sounders_Brown_theoretical'];

let tck_Watkins = implementation_optimize_tck([[-5.115995809754082, -5.115995809754082, -5.115995809754082, -5.115995809754082, -4.160106231099973, -3.209113630523477, -1.2175106961204154, 0.4587657198189318, 1.1197669427405068, 1.6925908552310418, 1.6925908552310418, 1.6925908552310418, 1.6925908552310418], [-1.4404286048266364, -1.2375168139385286, -0.9072614905522024, -0.7662335745829165, -0.944537665617708, -1.957339717378027, -3.002614318094637, -3.5936804378352956, -3.8779153181940553, 0.0, 0.0, 0.0, 0.0], 3]);
export function K_separator_Watkins({x, rhol, rhog, horizontal=false, method='spline'}) {
    let factor = (1. - x)/x*Math.sqrt(rhog/rhol);
    let K;
    if( method === 'spline' ) {
        K = Math.exp(splev(Math.log(factor), tck_Watkins));
    } else if( method === 'blackwell' ) {
        let X = Math.log(factor);
        let A = -1.877478097;
        let B = -0.81145804597;
        let C = -0.1870744085;
        let D = -0.0145228667;
        let E = -0.00101148518;
        K = Math.exp(A + X*(B + X*(C + X*(D + E*X))));
    } else if( method === 'branan' ) {
        X = Math.log(factor);
        A = -1.942936;
        B = -0.814894;
        C = -0.179390;
        D = -0.0123790;
        E = 0.000386235;
        let F = 0.000259550;
        K = Math.exp(A + X*(B + X*(C + X*(D + X*(E + F*X)))));
    } else {
        throw new Error( 'ValueError',"Only methods 'spline', 'branan', and 'blackwell' are supported." );
    }
    K *= foot; // Converts units of ft/s to m/s; the graph and all fits are in ft/s
    if( horizontal ) {
        K *= 1.25; // Watkins recommends a factor of 1.25 for horizontal separators over vertical separators
    }
    return K;
}


export function K_separator_demister_York({P, horizontal=false}) {
    P = P/psi; // Correlation in terms of psia
    let K;
    if( P < 15 ) {
        if( P < 1 ) {
            P = 1; // Prevent negative K values, but as a consequence be
        }
        K = 0.1821 + 0.0029*P + 0.0460*Math.log(P);
    } else if( P < 40 ) {
        K = 0.35;
    } else {
        if( P > 5500 ) {
            P = 5500; // Do not allow for lower K values above 5500 psia, as
        }
        K = 0.430 - 0.023*Math.log(P);
    }
    K *= foot; // Converts units of ft/s to m/s; the graph and all fits are in ft/s
    if( horizontal ) {
        // Watkins recommends a factor of 1.25 for horizontal separators over
        // vertical separators as well
        K *= 1.25;
    }
    return K;
}


export function v_Sounders_Brown({K, rhol, rhog}) {
    return K*Math.sqrt((rhol - rhog)/rhog);
}


export function K_Sounders_Brown_theoretical({D, Cd, g=g}) {
    return Math.sqrt((4.0/3.0)*g*D/(Cd));
}


