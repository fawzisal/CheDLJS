import { foot_cubed_inv, torr_inv, mmHg_inv, lb, hour_inv, inchHg } from './fluids.constants.js' ;
import { brenth, secant } from './fluids.numerics_init.js' ;
import { listZip, float } from './_pyjs.js';
let __all__ = ['liquid_jet_pump', 'liquid_jet_pump_ancillary', 'vacuum_air_leakage_Seider', 'vacuum_air_leakage_Coker_Worthington', 'vacuum_air_leakage_HEI2633', 'vacuum_air_leakage_Ryans_Croll'];
export function liquid_jet_pump_ancillary({rhop, rhos, Kp, Ks, d_nozzle=null, d_mixing=null, Qp=null, Qs=null, P1=null, P2=null}) {
    let unknowns = ([d_nozzle, d_mixing, Qs, Qp, P1, P2].map((i) => i === null)).reduce((sum, a) => sum + a, 0);
    if( unknowns > 1 ) {
        throw new Error( 'ValueError','Too many unknowns' );
    } else if( unknowns < 1 ) {
        throw new Error( 'ValueError','Overspecified' );
    }
    let C = rhos/rhop;
    let M;
    if( Qp !== null && Qs !== null ) {
        M = Qs/Qp;
    }
    let A_nozzle, A_mixing, R;
    if( d_nozzle !== null ) {
        A_nozzle = Math.PI/4*d_nozzle*d_nozzle;
        if( d_mixing !== null ) {
            A_mixing = Math.PI/4*d_mixing*d_mixing;
            R = A_nozzle/A_mixing;
        }
    }
    if( P1 === null ) {
        return rhop/2*(Qp/A_nozzle)**2*((1+Kp) - C*(1 + Ks)*((M*R)/(1-R))**2 ) + P2;
    } else if( P2 === null ) {
        return -rhop/2*(Qp/A_nozzle)**2*((1+Kp) - C*(1 + Ks)*((M*R)/(1-R))**2 ) + P1;
    }
     else if( Qs === null ) {
        try {
            return Math.sqrt((-2*A_nozzle**2*P1 + 2*A_nozzle**2*P2 + Kp*Qp**2*rhop + Qp**2*rhop)/(C*rhop*(Ks + 1)))*(A_mixing - A_nozzle)/A_nozzle;
        } catch( e ) /* ValueError */ {
            throw(Error('TODO: implement complex numbers'));
            // return -1j;
        }
    }
     else if( Qp === null ) {
        return A_nozzle*Math.sqrt((2*A_mixing**2*P1 - 2*A_mixing**2*P2 - 4*A_mixing*A_nozzle*P1 + 4*A_mixing*A_nozzle*P2 + 2*A_nozzle**2*P1 - 2*A_nozzle**2*P2 + C*Ks*Qs**2*rhop + C*Qs**2*rhop)/(rhop*(Kp + 1)))/(A_mixing - A_nozzle);
    }
     else if( d_nozzle === null ) {
                function err(d_nozzle) {
            return P1 - liquid_jet_pump_ancillary( {rhop: rhop, rhos: rhos, Kp: Kp, Ks: Ks, d_nozzle: d_nozzle, d_mixing: d_mixing, Qp: Qp, Qs: Qs,
                              P1: null, P2: P2 });
        }
        return brenth(err, 1E-9, d_mixing*20);
    }
     else if( d_mixing === null ) {
                function err(d_mixing) {
            return P1 - liquid_jet_pump_ancillary( {rhop: rhop, rhos: rhos, Kp: Kp, Ks: Ks, d_nozzle: d_nozzle, d_mixing: d_mixing, Qp: Qp, Qs: Qs,
                              P1: null, P2: P2 });
        }
        try {
            return brenth(err, 1E-9, d_nozzle*20);
        } catch( e ) {
            return secant(err, d_nozzle*2);
        }
    }
}
export function liquid_jet_pump_pressure_ratio({rhop, rhos, Km, Kd, Ks, Kp, d_nozzle=null, d_mixing=null, d_diffuser=null, Qp=null, Qs=null, P1=null, P2=null, P5=null, nozzle_retracted=true}) {
    let C = rhos/rhop;
    let j;
    if( nozzle_retracted ) { j = 0.0; }
    else { j = 1.0; }
    let R = d_nozzle**2/d_mixing**2;
    let alpha = d_mixing**2/d_diffuser**2;
    let M = Qs/Qp;
    let [M2, R2, alpha2] = [M*M, R*R, alpha*alpha];
    let num = 2.0*R + 2*C*M2*R2/(1.0 - R);
    num -= R2*(1.0 + C*M)*(1.0 + M)*(1.0 + Km + Kd + alpha2);
    num -= C*M2*R2/(1.0 - R)**2*(1.0 + Ks);
    let den = (1.0 + Kp) - 2.0*R - 2.0*C*M2*R2/(1.0 - R);
    den += R2*(1.0 + C*M)*(1.0 + M)*(1.0 + Km + Kd + alpha2);
    den += (1.0 - j)*(C*M2/((1.0 - R)/R)**2)*(1.0 - Ks);
    let N = num/den;
    if( P1 === null ) {
        let P1 = (-P2 + P5*N + P5)/N;
    } else if( P2 === null ) {
        let P2 = -P1*N + P5*N + P5;
    } else if( P5 === null ) {
        let P5 = (P1*N + P2)/(N + 1.0);
    } else {
        return N - (P5 - P2)/(P1 - P5);
    }
    let solution = {};
    solution['P1'] = P1;
    solution['P2'] = P2;
    solution['P5'] = P5;
    //solution['d_nozzle'] = d_nozzle
    //solution['d_mixing'] = d_mixing
    //solution['d_diffuser'] = d_diffuser
    //solution['Qs'] = Qs
    //solution['Qp'] = Qp
    //solution['N'] = N
    //solution['M'] = M
    //solution['R'] = R
    //solution['alpha'] = alpha
    //solution['efficiency'] = M*N
    return solution;
}
export function liquid_jet_pump({rhop, rhos, Kp=0.0, Ks=0.1, Km=.15, Kd=0.1,
                    d_nozzle=null, d_mixing=null, d_diffuser=null,
                    Qp=null, Qs=null, P1=null, P2=null, P5=null,
                    nozzle_retracted=true, max_variations=100}) {
    // const { uniform, seed } = require( './random' );
    let solution_vars = ['d_nozzle', 'd_mixing', 'Qp', 'Qs', 'P1', 'P2', 'P5'];
    let unknown_vars = [];
    for( let i of solution_vars ) {
        // if( locals()[i] === null ) {
        unknown_vars.push(i);
        // }
    }
    if( unknown_vars.length > 2 ) {
        throw new Error( 'ValueError','Too many unknowns' );
    } else if( unknown_vars.length < 2 ) {
        throw new Error( 'ValueError','Overspecified' );
    }
    let vals = {'d_nozzle': d_nozzle, 'd_mixing': d_mixing, 'Qp': Qp,
            'Qs': Qs, 'P1': P1, 'P2': P2, 'P5': P5};
    let var_guesses = [];
    // Initial guess algorithms for each variable here
    // No clever algorithms invented yet
    for( let v of unknown_vars ) {
        if( v === 'd_nozzle' ) { try { var_guesses.push(d_mixing*0.4); } catch( e ) { var_guesses.push(0.01); } } if( v === 'd_mixing' ) { try { var_guesses.push(d_nozzle*2); } catch( e ) { var_guesses.push(0.02); } } 
        else if( v === 'P1' ) { try { var_guesses.push(P2*5); } catch( e ) { var_guesses.push(P5*5); } } 
        else if( v === 'P2' ) { try { var_guesses.push((P1 + P5)*0.5); } catch( e ) { try { var_guesses.push(P1/1.1); } catch( e ) { var_guesses.push(P5*1.25); } } } 
        else if( v === 'P5' ) { try { var_guesses.push(P1*1.12); } catch( e ) { var_guesses.push(P2*1.12); } } 
        else if( v === 'Qp' ) { try { var_guesses.push(Qs*1.04); } catch( e ) { var_guesses.push(0.01); } } 
        else if( v === 'Qs' ) { try { var_guesses.push(Qp*0.5); } catch( e ) { var_guesses.push(0.01); } }
    }
    let C = rhos/rhop;
    let j;
    if( nozzle_retracted ) { j = 0.0; }
    else { j = 1.0; }
    // The diffuser diameter, if not specified, is set to a very large diameter
    // so as to not alter the results
    if( d_diffuser === null ) {
        if( d_mixing !== null ) { let d_diffuser = d_mixing*1E3; } 
        else if( d_nozzle !== null ) { d_diffuser = d_nozzle*1E3; } 
        else { d_diffuser = 1000.0; }
    }
    vals['d_diffuser'] = d_diffuser;
    function obj_err(val) {
        // Use the dictionary `vals` to keep track of the currently iterating
        // variables
        for( let [ i, v ] of listZip(unknown_vars, val) ) {
            vals[i] = Math.abs(float(v));
        }
        // Keep the pressure limits sane
        //if 'P1' in unknown_vars:
        //    if 'P5' not in unknown_vars:
        //        vals['P1'] = Math.max(vals['P1'], 1.001*vals['P5'])
        //    elif 'P2' not in unknown_vars:
        //        vals['P1'] = Math.max(vals['P1'], 1.001*vals['P2'])
        //if 'P2' in unknown_vars:
        //    if 'P1' not in unknown_vars:
        //        vals['P2'] = Math.min(vals['P2'], 0.999*vals['P1'])
        //    if 'P5' not in unknown_vars:
        //        vals['P2'] = Math.max(vals['P2'], 1.001*vals['P2'])
        // Prelimary numbers
        let A_nozzle = Math.PI/4*vals['d_nozzle']**2;
        let alpha = vals['d_mixing']**2/d_diffuser**2;
        let R = vals['d_nozzle']**2/vals['d_mixing']**2;
        let M = vals['Qs']/vals['Qp'];
        let err1 = liquid_jet_pump_pressure_ratio( {rhop: rhop, rhos: rhos, Km: Km, Kd: Kd,
                                              Ks: Ks, Kp: Kp, d_nozzle: vals['d_nozzle'],
                                              d_mixing: vals['d_mixing'],
                                              Qs: vals['Qs'], Qp: vals['Qp'],
                                              P2: vals['P2'], P1: vals['P1'],
                                              P5: vals['P5'],
                                              nozzle_retracted: nozzle_retracted,
                                              d_diffuser: d_diffuser });
        let rhs = rhop/2.0*(vals['Qp']/A_nozzle)**2*((1.0 + Kp) - C*(1.0 + Ks)*((M*R)/(1.0 - R))**2 );
        let err2 = rhs  - (vals['P1'] - vals['P2']);
        let N = (vals['P5'] - vals['P2'])/(vals['P1']-vals['P5']);
        vals['N'] = N;
        vals['M'] = M;
        vals['R'] = R;
        vals['alpha'] = alpha;
        vals['efficiency'] = M*N;
        if( vals['efficiency'] < 0 ) {
            if( err1 < 0 ) {
                err1 -= Math.abs(vals['efficiency']);
            } else {
                err1 += Math.abs(vals['efficiency']);
            }
            if( err2 < 0 ) {
                err2 -= Math.abs(vals['efficiency']);
            } else {
                err2 += Math.abs(vals['efficiency']);
            }
        //elif vals['N'] < 0:
        //    err1, err2 =  abs(vals['N']) + err1,  abs(vals['N']) + err2
        //print(err1, err2)
        }
        return err1, err2;
    }
    // Only one unknown var
    if( 'P5' in unknown_vars ) {
        let ancillary = liquid_jet_pump_ancillary( {rhop: rhop, rhos: rhos, Kp: Kp,
                                              Ks: Ks, d_nozzle: d_nozzle,
                                              d_mixing: d_mixing, Qp: Qp, Qs: Qs,
                                              P1: P1, P2: P2 });
        if( unknown_vars[0] === 'P5' ) {
            vals[unknown_vars[1]] = ancillary;
        } else {
            vals[unknown_vars[0]] = ancillary;
        }
        vals['P5'] = liquid_jet_pump_pressure_ratio( {rhop: rhop, rhos: rhos, Km: Km, Kd: Kd, Ks: Ks, Kp: Kp, d_nozzle: vals['d_nozzle'],
                               d_mixing: vals['d_mixing'], Qs: vals['Qs'], Qp: vals['Qp'], P2: vals['P2'],
                               P1: vals['P1'], P5: null,
                               nozzle_retracted: nozzle_retracted, d_diffuser: d_diffuser })['P5'];
        // Compute the remaining parameters
        obj_err([vals[unknown_vars[0]], vals[unknown_vars[1]]]);
        return vals;
    }
    // TODO: implement alternative to np errstate
    // with (np.errstate(all='ignore')) {
    //         const { fsolve, root } = require( './scipy.optimize' );
    //             function solve_with_fsolve(var_guesses) {
    //                 let res = fsolve(obj_err, var_guesses, { full_output: true });
    //                 if( sum(abs(res[1]['fvec'])) > 1E-7 ) {
    //                     throw new Error( 'ValueError','Could not solve' );
    //                 }
    //                 for( let [ u, v ] of listZip(unknown_vars, res[0].tolist()) ) {
    //                     vals[u] = abs(v);
    //                 }
    //                 return vals;
    //             }
    //             try {
    //                 return solve_with_fsolve(var_guesses);
    //             } catch( e ) {
    //                 /* pass */
    //             }
    //             // Tying different guesses with fsolve is faster than trying different solvers
    //             for( let meth of ['hybr', 'lm', 'broyden1', 'broyden2'] ) { //
    //                 try {
    //                     res = root(obj_err, var_guesses, { method: meth, tol: 1E-9 });
    //                     if( sum(abs(res['fun'])) > 1E-7 ) {
    //                         throw new Error( 'ValueError','Could not solve' );
    //                     }
    //                     for( let [ u, v ] of listZip(unknown_vars, res['x'].tolist()) ) {
    //                         vals[u] = abs(v);
    //                     }
    //                     return vals;
    //                 } catch( e ) /* [ValueError, OverflowError] */ {
    //                     continue;
    //                 }
    //             // Just do variations on this until it works
    //             }
    //             for( let _=0; _ < int(max_variations/8); _++ ) {
    //                 for( let idx of [0, 1] ) {
    //                     for( let r of [[1, 10], [0.1, 1]] ) {
    //                         let i = uniform(*r);
    //                         try {
    //                             let l = list(var_guesses);
    //                             l[idx] = l[idx]*i;
    //                             return solve_with_fsolve(l);
    //                         } catch( e ) {
    //                             /* pass */
    //                         }
    //             // Vary both parameters at once
    //                     }
    //                 }
    //             }
    //             for( let _=0; _ < int(max_variations/8); _++ ) {
    //                 for( let r of [[1, 10], [0.1, 1]] ) {
    //                     i = uniform(*r);
    //                     for( let s of [[1, 10], [0.1, 1]] ) {
    //                         j = uniform(*s);
    //                         try {
    //                             l = list(var_guesses);
    //                             l[0] = l[0]*i;
    //                             l[1] = l[1]*j;
    //                             return solve_with_fsolve(l);
    //                         } catch( e ) {
    //                             /* pass */
    //                         }
    //                     }
    //                 }
    //             }
    //             throw new Error( 'ValueError','Could not solve' );
    //         }
}
export function vacuum_air_leakage_Ryans_Croll({V, P, P_atm=101325.0}) {
    V *= foot_cubed_inv;
    P *= torr_inv;
    P_atm *= torr_inv;
    let P_vacuum = P_atm - P;
    let air_leakage;
    if( P_vacuum < 10 ) {
        air_leakage = 0.026*P_vacuum**0.34*V**0.6;
    } else if( P_vacuum < 100 ) {
        air_leakage = 0.032*P_vacuum**0.26*V**0.6;
    } else {
        air_leakage = 0.106*V**0.6;
    }
    let leakage = air_leakage*lb*hour_inv;
    return leakage;
}
export function vacuum_air_leakage_Seider({V, P, P_atm=101325.0}) {
    P *= torr_inv;
    P_atm *= torr_inv;
    let P_vacuum = P_atm - P;
    V *= foot_cubed_inv;
    let lnP = Math.log(P_vacuum);
    let leakage_lb_hr = 5.0 + (0.0289 + 0.03088*lnP - 0.0005733*lnP*lnP)*V**0.66;
    let leakage = leakage_lb_hr*lb*hour_inv;
    return leakage;
}
export function vacuum_air_leakage_HEI2633({V, P, P_atm=101325.0}) {
    P_atm *= mmHg_inv;
    P *= mmHg_inv;
    let P_vacuum = P_atm - P;
    V *= foot_cubed_inv;
    if( V < 10 ) { let V = 10.0; }
    let logV = Math.log(V);
    let c0, c1;
    if( P_vacuum <= 1 ) { [c0, c1] = [0.6667235169997174, -3.71246576520232]; } 
    else if( P_vacuum <= 3 ) { [c0, c1] = [0.664489357445796, -3.0147277548691274]; } 
    else if( P_vacuum <= 20 ) { [c0, c1] = [0.6656780453394583, -2.34007321331419]; } 
    else if( P_vacuum <= 90 ) { [c0, c1] = [0.663080000739313, -1.9278288516732665]; } 
    else { c0, c1 = 0.6658471905826482, -1.6641585778506027; }
    let leakage_lb_hr = Math.exp(c1 + logV*c0);
    let leakage = leakage_lb_hr*lb*hour_inv;
    return leakage;
}
export function vacuum_air_leakage_Coker_Worthington({P, P_atm=101325.0, conservative=true}) {
    P /= inchHg; // convert to inch Hg
    P_atm /= inchHg; // convert to inch Hg
    let P_vacuum = P_atm - P;
    let leakage;
    if( conservative ) {
        if( P_vacuum > 8 ) { leakage = 40; } 
        else if( P_vacuum > 5 ) { leakage = 30; } 
        else if( P_vacuum > 3 ) { leakage = 25; } 
        else { leakage = 20; }
    } else {
        if( P_vacuum > 8 ) { leakage = 30; } 
        else if( P_vacuum > 5 ) { leakage = 25; } 
        else if( P_vacuum > 3 ) { leakage = 20; } 
        else { leakage = 10; }
    }
    leakage = leakage*lb*hour_inv;
    return leakage;
}
