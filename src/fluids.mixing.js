import { g } from './fluids.constants.js' ;
let __all__ = ['agitator_time_homogeneous', 'Kp_helical_ribbon_Rieger', 'time_helical_ribbon_Grenville', 'size_tee', 'COV_motionless_mixer', 'K_motionless_mixer'];
let max_Fo_for_turbulent = 1/1225.;
let min_regime_constant_for_turbulent = 6370.;
export function adjust_homogeneity(fraction) {
    /*Base: 95% homogeneity*/
    let multiplier = Math.log(1-fraction)/Math.log(0.05);
    return multiplier;
}
export function agitator_time_homogeneous({N, P, T, H, mu, rho, D=null, homogeneity=.95}) {
    if( !D ) {
        D = T*0.5;
    }
    let Np = P*g/rho/N**3/D**5;
    let Re_imp = rho/mu*D**2*N;
    let regime_constant = Np**(1/3.)*Re_imp;
    let Fo;
    if( regime_constant >= min_regime_constant_for_turbulent ) {
        Fo = (5.2/regime_constant);
    } else {
        Fo = (183./regime_constant)**2;
    }
    let time = rho*T**1.5*Math.sqrt(H)/mu*Fo;
    let multiplier = adjust_homogeneity(homogeneity);
    return time*multiplier;
}
export function Kp_helical_ribbon_Rieger({D, h, nb, pitch, width, T}) {
    let c = 0.5*(T - D);
    return 82.8*h/D*(c/D)**-.38*(pitch/D)**-0.35*(width/D)**0.2*nb**0.78;
}
export function time_helical_ribbon_Grenville({Kp, N}) {
    return 896E3*Kp**-1.69/N;
}
////// Tee mixer
export function size_tee({Q1, Q2, D, D2, n=1, pipe_diameters=5}) {
    let V1 = Q1/(Math.PI/4*D**2);
    let Cv = Q2/(Q1 + Q2);
    let COV0 = Math.sqrt((1-Cv)/Cv);
    if( D2 === null ) {
        D2 = (Q2/Q1)**(2/3.)*D;
    }
    let V2 = Q2/(Math.PI/4*D2**2);
    let B = n**2*(D2/D)**2*(V2/V1)**2;
    if( !n === 1 && !n === 2 && !n === 3 && !n ===4 ) {
        throw new Error( 'ValueError','Only 1 or 4 side streams investigated' );
    }
    let E;
    if( n === 1 ) {
        if( B < 0.7 ) {
            E = 1.33;
        } else {
            E = 1/33. + 0.95*Math.log(B/0.7);
        }
    } else if( n === 2 ) {
        if( B < 0.8 ) {
            E = 1.44;
        } else {
            E = 1.44 + 0.95*Math.log(B/0.8)**1.5;
        }
    } else if( n === 3 ) {
        if( B < 0.8 ) {
            E = 1.75;
        } else {
            E = 1.75 + 0.95*Math.log(B/0.8)**1.8;
        }
    } else {
        if( B < 2 ) {
            E = 1.97;
        } else {
            E = 1.97 + 0.95*Math.log(B/2.)**2;
        }
    }
    let COV = Math.sqrt(0.32/B**0.86*(pipe_diameters)**-E);
    return COV;
}
////// Commercial motionless mixers
/*Data from:
Paul, Edward L, Victor A Atiemo-Obeng, and Suzanne M Kresta.
Handbook of Industrial Mixing: Science and Practice.
Hoboken, N.J.: Wiley-Interscience, 2004.*/
let StatixMixers = {};
StatixMixers['KMS'] = {'Name': 'KMS', 'Vendor': 'Chemineer', 'Description': 'Twisted ribbon. Alternating left and right twists.', 'KL': 6.9, 'KiL': 0.87, 'KT': 150, 'KiT': 0.5};
StatixMixers['SMX'] = {'Name': 'SMX', 'Vendor': 'Koch-Glitsch', 'Description': 'Guide vanes 45 degrees to pipe axis. Adjacent elements rotated 90 degrees.', 'KL': 37.5, 'KiL': 0.63, 'KT': 500, 'KiT': 0.46};
StatixMixers['SMXL'] = {'Name': 'SMXL', 'Vendor': 'Koch-Glitsch', 'Description': 'Similar to SMX, but intersection bars at 30 degrees to pipe axis.', 'KL': 7.8, 'KiL': 0.85, 'KT': 100, 'KiT': 0.87};
StatixMixers['SMF'] = {'Name': 'SMF', 'Vendor': 'Koch-Glitsch', 'Description': 'Three guide vanes projecting from the tube wall in a way as to not contact. Designed for applications subject to plugging.', 'KL': 5.6, 'KiL': 0.83, 'KT': 130, 'KiT': 0.4};
export function COV_motionless_mixer({Ki, Q1, Q2, pipe_diameters}) {
    let Cv = Q2/(Q1 + Q2);
    let COV0 = Math.sqrt((1-Cv)/Cv);
    let COVr = Ki**(pipe_diameters);
    let COV = COV0*COVr;
    return COV;
}
export function K_motionless_mixer({K, L, D, fd}) {
    return L/D*fd*K;
}
